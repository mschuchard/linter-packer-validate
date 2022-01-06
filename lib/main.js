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
    format: {
      title: 'Auto Formatting',
      type: 'object',
      properties: {
        enabled: {
          title: 'Use Packer Fmt',
          description: 'Use \'packer fmt\' to rewrite all Packer HCL2 files in the directory of the current file to a canonical format (occurs before linting).',
          type: 'boolean',
          default: false,
        },
        currentFile: {
          title: 'Format Current File',
          description: 'Only format the currently opened file instead of all files in the directory. Functional only if auto-formatting is also enabled.',
          type: 'boolean',
          default: false,
        },
        recursive: {
          title: 'Recursive Format',
          description: 'Recursively format all Packer files from the directory of the current file. Functional only if auto-formatting is also enabled.',
          type: 'boolean',
          default: false,
        },
      }
    }
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

        // bail out if this is a non-packer template file
        if (!(/\.pkr\./.exec(file)))
          return [];

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
        if (atom.config.get('linter-packer-validate.usePackerFormat') || atom.config.get('linter-packer-validate.format.enabled')) {
          var fmtArgs = ['fmt']
          // recursive format if selected
          if (atom.config.get('linter-packer-validate.recursiveFormat') || atom.config.get('linter-packer-validate.format.recursive'))
            fmtArgs.push('-recursive');
          // select the target for the auto-formatting
          if (atom.config.get('linter-packer-validate.formatCurrentFile') || atom.config.get('linter-packer-validate.format.currentFile'))
            fmtArgs.push(editorFile);
          else
            fmtArgs.push(dir)
          // auto-format the target
          helpers.exec(atom.config.get('linter-packer-validate.packerExecutablePath'), fmtArgs, {cwd: dir})
        }

        // initialize return
        var toReturn = [];

        return helpers.exec(atom.config.get('linter-packer-validate.packerExecutablePath'), args, {cwd: dir, ignoreExitCode: true}).then(output => {
          // higher level scope for variables retained between lambda iterations
          var severity = '';
          var theFile = '';
          var row = 1;

          output.split(/\\r\\n\\n|\\n\\n/).forEach((line) => {
            // matchers for output parsing and capturing
            const matchesError = /(warning|error),/.exec(line);
            const matchesFileLine = /on (.*\.pkr\.[jsonhcl]+) line (\d+)/.exec(line);
            const matchesExcerpt = /([A-Z].*\.)/.exec(line);

            // check for issue
            if (matchesError != null)
              severity = matchesError[1];
            else if (matchesFileLine != null) {
              theFile = matchesFileLine[1];
              row = Number.parseInt(matchesFileLine[2])
            }
            // use excerpt info with previous iterations' severity, file, and line
            else if (matchesExcerpt != null) {
              toReturn.push({
                severity: severity,
                excerpt: matchesExcerpt[1].replace('%!(PACKER_COMMA)', ','),
                location: {
                  file: theFile,
                  position: [[row - 1, 0], [row - 1, 1]],
                },
              });
              // re-init
              severity = '';
              theFile = '';
              row = 1;
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
          return toReturn;
        });
      }
    };
  }
};
