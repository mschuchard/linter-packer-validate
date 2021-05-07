'use babel';

export default {
  config: {
    packerExecutablePath: {
      title: 'Packer Executable Path',
      type: 'string',
      description: 'Path to Packer executable (e.g. /usr/bin/packer) if not in shell env path.',
      default: 'packer',
    },
    syntaxOnly: {
      title: 'Only Check Syntax',
      type: 'boolean',
      description: 'Only check syntax. Do not verify config of the template.',
      default: false,
    },
    varFile: {
      title: 'Packer Var File',
      type: 'string',
      description: 'Path to JSON file containing user variables',
      default: '',
    },
    vars: {
      title: 'Packer Variables',
      type: 'array',
      description: 'Extra variables for template in format of key=value',
      default: [],
      items: {
        type: 'string'
      }
    },
    lintDirectory: {
      title: 'Lint Directory',
      type: 'boolean',
      description: 'Lint the entire directory containing the open file.',
      default: false,
    },
    usePackerFormat: {
      title: 'Use Packer Fmt',
      description: 'Use \'packer fmt\' to rewrite all Packer HCL2 files in the directory of the current file to a canonical format (occurs before linting).',
      type: 'boolean',
      default: false,
    },
  },

  provideLinter() {
    return {
      name: 'Packer',
      grammarScopes: ['source.json', 'source.hcl'],
      scope: atom.config.get('linter-packer-validate.lintDirectory') ? 'project' : 'file',
      lintsOnChange: false,
      lint: (activeEditor) => {
        // assign global for grammar scope since we use this so much
        const hcl = (activeEditor.getGrammar().scopeName == 'source.hcl') ? true : false
        // establish const vars
        const helpers = require('atom-linter');
        const file = activeEditor.getPath();
        const dir = require('path').dirname(file);

        // bail out if this is a non-packer template hcl file
        if ((hcl) && !(/\.pkr\.hcl/.exec(file)))
          return [];
        // bail out if this is a non-packer template json file
        else if (!(hcl) && !(/\.pkr\.json/.exec(file)))
          return [];

        // establish regular expressions
        const regex_error = /\* (.*)/;
        const regex_builder = /Errors validating build '(.*)'/;
        const regex_builder_error = /Failed to initialize build (.*)/
        const regex_json = /Error parsing JSON/;
        const regex_new_error = /(Warning|Error): (.*)/;
        const regex_new_file_line = /on (.*\.pkr\.[jsonhcl]+) line (\d+)/;

        // setup args
        var args = ['validate', '-machine-readable'];

        // add var file
        if (atom.config.get('linter-packer-validate.varFile') !== '')
          args.push(...['-var-file', atom.config.get('linter-packer-validate.varFile')]);

        // add vars
        if (atom.config.get('linter-packer-validate.vars')[0] !== '')
          for (i = 0; i < atom.config.get('linter-packer-validate.vars').length; i++)
            args.push(...['-var', atom.config.get('linter-packer-validate.vars')[i]]);

        // syntax only check
        if (atom.config.get('linter-packer-validate.syntaxOnly'))
          args.push('-syntax-only');

        // add the target to validate
        atom.config.get('linter-packer-validate.lintDirectory') ? args.push(dir) : args.push(file);

        // auto-formatting
        if (atom.config.get('linter-packer-validate.usePackerFormat')) {
          // auto-format the target
          helpers.exec(atom.config.get('linter-packer-validate.packerExecutablePath'), ['fmt', dir], { cwd: dir })
        }

        return helpers.exec(atom.config.get('linter-packer-validate.packerExecutablePath'), args, {cwd: dir, ignoreExitCode: true}).then(output => {
          // higher level scope for variables retained between lambda iterations
          var toReturn = [];
          var builder = '';
          var new_excerpt = '';
          var new_severity = '';

          output.split(/\\r\\n|\\n/).forEach((line) => {
            // matchers for output parsing and capturing
            const matches_error = regex_error.exec(line);
            const matches_builder = regex_builder.exec(line);
            const matches_builder_error = regex_builder_error.exec(line);
            const matches_new_error = regex_new_error.exec(line);
            const matches_new_file_line = regex_new_file_line.exec(line);

            // capture builder information in error message if present in previous lines; use for all successive errors that have builder info until new builder info is found
            if (matches_builder != null)
              builder = "Errors validating build '" + matches_builder[1] + "': ";

            // check for errors in current file (builder info is gleaned from matches_builder)
            if (matches_error != null) {
              excerpt = matches_error[1].replace('%!(PACKER_COMMA)', ',')

              toReturn.push({
                severity: 'error',
                excerpt: builder + excerpt,
                location: {
                  file: file,
                  position: [[0, 0], [0, 1]],
                },
              });
            }
            // check for error where info is all one line (builder info and error together)
            else if (matches_builder_error != null) {
              excerpt = matches_builder_error[1].replace('%!(PACKER_COMMA)', ',')

              toReturn.push({
                severity: 'error',
                excerpt: 'Failed to initialize build ' + excerpt,
                location: {
                  file: file,
                  position: [[0, 0], [0, 1]],
                },
              });
            }
            // check for 1.6 format issue
            else if (matches_new_error != null) {
              new_excerpt = matches_new_error[2].replace('%!(PACKER_COMMA)', ',');
              new_severity = matches_new_error[1].toLowerCase();
            }
            // use 1.6 file and line info with previous iteration excerpt and severity
            else if (matches_new_file_line != null) {
              toReturn.push({
                severity: new_severity,
                excerpt: new_excerpt,
                location: {
                  file: file,
                  position: [[Number.parseInt(matches_new_file_line[2]) - 1, 0], [Number.parseInt(matches_new_file_line[2]) - 1, 1]],
                },
              });
            }
            // notify of JSON error
            else if (regex_json.exec(line)) {
              toReturn.push({
                severity: 'error',
                excerpt: 'Error parsing JSON. Use a JSON Linter for specific assistance.',
                location: {
                  file: file,
                  position: [[0, 0], [0, 1]],
                },
              });
            }
          });
          return toReturn;
        })
        .catch(error => {
          // check for stdin lint attempt
          if (/\.dirname/.exec(error.message) != null) {
            toReturn.push({
              severity: 'info',
              excerpt: 'Packer cannot lint on stdin due to nonexistent pathing on templates. Please save this template to your filesystem.',
              location: {
                file: 'Save this template.',
                position: [[0, 0], [0, 1]],
              },
            });
          }
          // notify on other errors
          else {
            atom.notifications.addError(
              'An error occurred with this package.',
              {
                detail: error.message
              }
            );
          };
          return [];
        });
      }
    };
  }
};
