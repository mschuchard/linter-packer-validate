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

  deactivate() {
    this.idleCallbacks.forEach((callbackID) => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'Packer',
      grammarScopes: ['source.json', 'source.hcl'],
      scope: atom.config.get('linter-packer-validate.lintDirectory') ? 'project' : 'file',
      lintsOnChange: false,
      lint: async (textEditor) => {
        // assign global for grammar scope since we use this so much
        const hcl = (textEditor.getGrammar().scopeName == 'source.hcl') ? true : false
        // establish const vars
        const helpers = require('atom-linter');
        const file = textEditor.getPath();
        const dir = require('path').dirname(file);

        // bail out if this is a non-packer template hcl file
        if ((hcl) && !(/\.pkr\.hcl/.exec(file)))
          return [];
        // bail out if this is a non-packer template json file
        else if (!(hcl) && !(/\.pkr\.json/.exec(file)))
          return [];

        // establish regular expressions
        const regex_json = /Error parsing JSON/;
        const regex_error = /(Warning|Error): (.*)/;
        const regex_file_line = /on (.*\.pkr\.[jsonhcl]+) line (\d+)/;

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
          var excerpt = '';
          var severity = '';

          output.split(/\\r\\n\\n|\\n\\n/).forEach((line) => {
            // matchers for output parsing and capturing
            const matches_error = regex_error.exec(line);
            const matches_file_line = regex_file_line.exec(line);

            // check for issue
            if (matches_error != null) {
              excerpt = matches_error[2].replace('%!(PACKER_COMMA)', ',');
              severity = matches_error[1].toLowerCase();
            }
            // use file and line info with previous iteration excerpt and severity
            else if (matches_file_line != null) {
              toReturn.push({
                severity: severity,
                excerpt: excerpt,
                location: {
                  file: matches_file_line[1],
                  position: [[Number.parseInt(matches_file_line[2]) - 1, 0], [Number.parseInt(matches_file_line[2]) - 1, 1]],
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
              { detail: error.message }
            );
          };
          return [];
        });
      }
    };
  }
};
