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

  // activate linter
  activate: () => {
    require('atom-package-deps').install('linter-packer-validate');
  },

  provideLinter: () => {
    return {
      name: 'Packer',
      grammarScopes: ['source.json'],
      scope: 'file',
      lintOnFly: false,
      lint: (activeEditor) => {
        // establish const vars
        const helpers = require('atom-linter');
        const file = activeEditor.getPath();
        // establish regular expressions
        const regex_builder = /Errors validating build '(.*)'/;
        const regex_error = /\* (.*)/;
        const regex_builder_error = /Failed to initialize build (.*)/
        const regex_json = /Error parsing JSON/;

        // bail out if this is not a packer template
        if (!(/"builders": \[/.exec(activeEditor.getText())))
          return [];

        // setup args
        var args = ['validate', '-machine-readable'];

        // add var file
        if (atom.config.get('linter-packer-validate.varFile') !== '')
          args = args.concat(['-var-file', atom.config.get('linter-packer-validate.varFile')]);

        // add vars
        if (atom.config.get('linter-packer-validate.vars')[0] !== '')
          for (i = 0; i < atom.config.get('linter-packer-validate.vars').length; i++)
            args = args.concat(['-var', atom.config.get('linter-packer-validate.vars')[i]]);

        // add the file to be checked
        args.push(file);

        return helpers.exec(atom.config.get('linter-packer-validate.packerExecutablePath'), args, {ignoreExitCode: true}).then(output => {
          var toReturn = [];
          var error = ''

          output.split(/\r?\n/).forEach(function (line) {
            // matchers for output parsing and capturing
            const matches_error = regex_error.exec(line);
            const matches_builder = regex_builder.exec(line);
            const matches_builder_error = regex_builder_error.exec(line);

            // capture builder information in error message if present in previous lines
            if (matches_builder != null)
              error = "Errors validating build '" + matches_builder[1] + "': ";

            // check for errors in current file
            if (matches_error != null) {
              toReturn.push({
                type: 'Error',
                severity: 'error',
                text: error + matches_error[1],
                filePath: file,
              });
              // empty out error for next line; note this means if a builder has multiple errors the builder info for successive errors will not display, but this is better than outputting garbage for those errors
              error = '';
            }
            // check for error where info is all one line
            else if (matches_builder_error != null) {
              toReturn.push({
                type: 'Error',
                severity: 'error',
                text: 'Failed to initialize build ' + matches_builder_error[1],
                filePath: file,
              });
            }
            // notify of JSON error
            else if (regex_json.exec(line)) {
              toReturn.push({
                type: 'Error',
                severity: 'error',
                text: 'Error parsing JSON. Use a JSON Linter for specific assistance.',
                filePath: file,
              });
            }
          });
          return toReturn;
        });
      }
    };
  }
};
