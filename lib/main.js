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
      description: 'Path to file containing user variables',
      default: '',
    },
    vars: {
      title: 'Packer Variables',
      type: 'array',
      description: 'Extra variables for template in format of name=value',
      default: [],
      items: {
        type: 'string'
      },
    },
    warnUndeclaredVars: {
      title: 'Undeclared Vars Warn',
      type: 'boolean',
      description: 'Warn on user variable files containing undeclared vars (Packer >= 1.8.5)',
      default: true,
    },
    envVars: {
      title: 'Packer Environment Variables',
      type: 'array',
      description: 'Environment variables to use with Packer (especially for use with env() function) in format of key=value',
      default: [],
      items: {
        type: 'string'
      },
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
      },
    },
  },

  // activate linter
  activate() {
    const helpers = require('atom-linter');

    // error on packer < 1.7.0
    helpers.exec(atom.config.get('linter-packer-validate.packerExecutablePath'), ['--help']).then(output => {
      if (!(/init/.exec(output))) {
        atom.notifications.addError(
          'The packer executable installed in your path is unsupported.',
          {
            detail: 'Please upgrade your version of Packer to >= 1.7.0, or downgrade this package to 1.3.1 or 1.5.4.'
          }
        );
      }
    });
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
        // establish const vars
        const helpers = require('atom-linter');
        const file = textEditor.getPath();
        const dir = require('path').dirname(file);

        // bail out if this is a non-packer template/config/vars file
        if (!(/\.pkr(?:vars)?\.hcl$/.exec(file))) return [];

        // auto-formatting
        if (atom.config.get('linter-packer-validate.usePackerFormat') || atom.config.get('linter-packer-validate.format.enabled')) {
          const fmtArgs = ['fmt'];

          // recursive format if selected
          if (atom.config.get('linter-packer-validate.recursiveFormat') || atom.config.get('linter-packer-validate.format.recursive'))
            fmtArgs.push('-recursive');

          // select the target for the auto-formatting
          if (atom.config.get('linter-packer-validate.formatCurrentFile') || atom.config.get('linter-packer-validate.format.currentFile'))
            fmtArgs.push(file);
          else fmtArgs.push(dir);

          // auto-format the target
          helpers.exec(atom.config.get('linter-packer-validate.packerExecutablePath'), fmtArgs, { cwd: dir }).catch(error => {
            // note tf sends this to stderr, but packer sends to stdout (hooray!)
            // verify this is not a template/config file since validate returns for those files
            if (!(/\.pkr\.hcl$/.exec(file))) {
              // catch format errors and display as pulsar warning
              atom.notifications.addWarning(
                'An error occurred during automatic formatting of a non-config/non-template file.',
                {
                  detail: `${file} contains an error: ${error}`,
                  dismissable: true,
                }
              );
            }
          });
        }

        // now bail out if this is a vars file because yes fmt no validate
        if (/\.pkrvars\.hcl$/.exec(file)) return [];

        // setup args
        const args = ['validate', '-machine-readable'];

        // add var file
        if (atom.config.get('linter-packer-validate.varFile') !== '')
          args.push(...['-var-file', atom.config.get('linter-packer-validate.varFile')]);

        // add vars
        for (let i = 0; i < atom.config.get('linter-packer-validate.vars').length; i++)
          args.push(...['-var', atom.config.get('linter-packer-validate.vars')[i]]);

        // add env vars
        const packerEnv = [[]];
        for (let i = 0; i < atom.config.get('linter-packer-validate.envVars').length; i++) {
          const envKVPair = atom.config.get('linter-packer-validate.envVars')[i].split('=');
          packerEnv[envKVPair[0]] = envKVPair[1];
        }

        // syntax only check
        if (atom.config.get('linter-packer-validate.syntaxOnly'))
          args.push('-syntax-only');

        // undeclared vars warn disable
        if (atom.config.get('linter-packer-validate.warnUndeclaredVars') === false)
          args.push('-no-warn-undeclared-var');

        // add the target to validate
        args.push(atom.config.get('linter-packer-validate.lintDirectory') ? dir : file);

        // initialize return
        const toReturn = [];

        return helpers.exec(atom.config.get('linter-packer-validate.packerExecutablePath'), args, { cwd: dir, env: packerEnv, ignoreExitCode: true }).then(output => {
          // higher level scope for variables retained between lambda iterations
          let severity = 'info';
          let theFile = file;
          let row = 1;
          let colBegin = 1;
          let colEnd = 1;
          let theExcerpt = '';

          output.split(/\\r\\n\\n|\\n\\n/).forEach((line) => {
            // matchers for output parsing and capturing
            const matchesSeverity = /\d+,,ui,(say|error),(Error|Warning)?/.exec(line);
            const matchesFileLineComma = /(.*\.pkr\.[jsonhcl]+):(\d+)%!\(PACKER_COMMA\)(\d+)-(\d+):(.*)/.exec(line);
            const matchesFileLine = /on (.*\.pkr\.[jsonhcl]+)? line (\d+)/.exec(line);
            const matchesExcerpt = /([A-Z].*[.?\]"]$)/.exec(line);
            const matchesExcerptAsterisk = /\*\s(.*)/.exec(line);

            if (matchesSeverity != null) {
              // warnings are output as log level with packer.ui.say instead of packer.ui.warning
              if (matchesSeverity[2] != null && matchesSeverity[2] === 'Warning')
                severity = 'warning';
              // packer now outputs packer.ui.say on valid configurations
              else if (matchesSeverity[1] === 'say')
                return toReturn;
              // severity capture is valid to assign
              else
                severity = matchesSeverity[1];
            } else if (matchesFileLine != null) { // check for issue line info
              if (matchesFileLine[1] != null) {
                theFile = matchesFileLine[1];
                row = Number.parseInt(matchesFileLine[2], 10);
              }
            } else if (matchesExcerptAsterisk != null) // an error message with an asterisk may appear before file/line info
              theExcerpt = matchesExcerptAsterisk[1].replace('*', '');
            // use final info with previous iterations' severity and file/line OR excerpt info
            else if (matchesExcerpt != null || theExcerpt !== '') {
              // determine if the excerpt needs to be assigned now
              if (matchesExcerpt != null) theExcerpt = matchesExcerpt[1];
              // it is possible (but rare) that file, line, and col info begin this line, so parse and capture those, and override the previous info
              else if (matchesFileLineComma != null) {
                theFile = matchesFileLineComma[1];
                row = Number.parseInt(matchesFileLineComma[2], 10);
                colBegin = Number.parseInt(matchesFileLineComma[3], 10);
                colEnd = Number.parseInt(matchesFileLineComma[4], 10);
                theExcerpt = matchesFileLineComma[5];
              }

              toReturn.push({
                severity,
                excerpt: theExcerpt.replace('%!(PACKER_COMMA)', ',').replace('%!(PACKER_COMMA)', ',').replace('\\n', ' ').replace('\\n', ' ').replace('\\n', ' ').replace('\\n', ' '),
                location: {
                  file: theFile,
                  position: [[row - 1, colBegin - 1], [row - 1, colEnd]],
                },
              });

              // re-init
              theFile = file;
              row = 1;
              colBegin = 1;
              colEnd = 1;
              theExcerpt = '';
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
            } else {
              // notify on other errors
              atom.notifications.addError(
                'An error occurred with this package.',
                { detail: error.message }
              );
            }
            return toReturn;
          });
      }
    };
  }
};
