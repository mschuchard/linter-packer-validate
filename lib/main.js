'use babel';

export default {
  config: {
    packerExecutablePath: {
      title: 'Packer Executable Path',
      type: 'string',
      description: 'Path to Packer executable (e.g. /usr/bin/packer) if not in shell env path.',
      default: 'packer',
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
    }
  },

  provideLinter() {
    return {
      name: 'Packer',
      grammarScopes: ['source.json'],
      scope: 'file',
      lintsOnChange: false,
      lint: (activeEditor) => {
        // bail out if this is not a packer template
        if (!(/"builders"\s*:\s*\[/.exec(activeEditor.getText())))
          return [];

        // establish const vars
        const helpers = require('atom-linter');
        const file = activeEditor.getPath();
        // establish regular expressions
        const regex_error = /\* (.*)/;
        const regex_builder = /Errors validating build '(.*)'/;
        const regex_builder_error = /Failed to initialize build (.*)/
        const regex_json = /Error parsing JSON/;

        // setup args
        var args = ['validate', '-machine-readable'];

        // add var file
        if (atom.config.get('linter-packer-validate.varFile') !== '')
          args.push(...['-var-file', atom.config.get('linter-packer-validate.varFile')]);

        // add vars
        if (atom.config.get('linter-packer-validate.vars')[0] !== '')
          for (i = 0; i < atom.config.get('linter-packer-validate.vars').length; i++)
            args.push(...['-var', atom.config.get('linter-packer-validate.vars')[i]]);

        // add the file to be checked
        args.push(file);

        return helpers.exec(atom.config.get('linter-packer-validate.packerExecutablePath'), args, {cwd: require('path').dirname(file), ignoreExitCode: true}).then(output => {
          var toReturn = [];
          var builder = ''

          output.split(/\r?\n|\\n/).forEach(function (line) {
            // matchers for output parsing and capturing
            const matches_error = regex_error.exec(line);
            const matches_builder = regex_builder.exec(line);
            const matches_builder_error = regex_builder_error.exec(line);

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
