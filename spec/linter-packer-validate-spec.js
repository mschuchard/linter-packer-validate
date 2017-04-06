'use babel';

import * as path from 'path';

describe('The Packer Validate provider for Linter', () => {
  const lint = require(path.join('..', 'lib', 'main.js')).provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-packer-validate');
      return atom.packages.activatePackage('language-json').then(() =>
        atom.workspace.open(path.join(__dirname, 'fixtures/', 'ok_packer_ok_json.json'))
      );
    });
  });

  describe('checks a packer template with a json error', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'bad_json_bad_packer.json');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the first message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(1);
        })
      );
    });

    it('verifies the first message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].text).toBeDefined();
          expect(messages[0].text).toEqual("Error parsing JSON. Use a JSON Linter for specific assistance.");
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+bad_json_bad_packer\.json$/);
        });
      });
    });
  });

  it('checks a json file with an error and does nothing', () => {
    waitsForPromise(() => {
      const goodFile = path.join(__dirname, 'fixtures/', 'bad_json_not_packer.json');
      return atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      );
    });
  });

  //todo
  describe('checks a packer template with multiple errors', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'ok_json_multiple_packer_errors.json');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the first message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(4);
        })
      );
    });

    it('verifies the first message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].text).toBeDefined();
          expect(messages[0].text).toEqual("Errors validating build 'amazon-ebs': ami_name must be specified");
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+ok_json_multiple_packer_errors\.json$/);
          expect(messages[1].type).toBeDefined();
          expect(messages[1].type).toEqual('Error');
          expect(messages[1].text).toBeDefined();
          expect(messages[1].text).toEqual("A source_ami must be specified");
          expect(messages[1].filePath).toBeDefined();
          expect(messages[1].filePath).toMatch(/.+ok_json_multiple_packer_errors\.json$/);
          expect(messages[2].type).toBeDefined();
          expect(messages[2].type).toEqual('Error');
          expect(messages[2].text).toBeDefined();
          expect(messages[2].text).toEqual("Errors validating build 'digitalocean': api_token for auth must be specified");
          expect(messages[2].filePath).toBeDefined();
          expect(messages[2].filePath).toMatch(/.+ok_json_multiple_packer_errors\.json$/);
          expect(messages[3].type).toBeDefined();
          expect(messages[3].type).toEqual('Error');
          expect(messages[3].text).toBeDefined();
          expect(messages[3].text).toEqual("region is required");
          expect(messages[3].filePath).toBeDefined();
          expect(messages[3].filePath).toMatch(/.+ok_json_multiple_packer_errors\.json$/);
        });
      });
    });
  });

  it('checks a valid json file and does nothing', () => {
    waitsForPromise(() => {
      const goodFile = path.join(__dirname, 'fixtures/', 'ok_json_not_packer.json');
      return atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      );
    });
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() => {
      const goodFile = path.join(__dirname, 'fixtures', 'ok_json_ok_packer.json');
      return atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      );
    });
  });

  describe('checks a packer template with an error with no builder info', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'ok_json_one_packer_error_no_builder_info.json');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the first message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(1);
        })
      );
    });

    it('verifies the first message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].text).toBeDefined();
          expect(messages[0].text).toEqual("Unknown root level key in template: 'unknown'");
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+ok_json_one_packer_error_no_builder_info\.json$/);
        });
      });
    });
  });

  describe('checks a packer template with a build initialization error', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'ok_json_one_packer_error_one_line.json');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the first message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(1);
        })
      );
    });

    it('verifies the first message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].text).toBeDefined();
          expect(messages[0].text).toEqual("Failed to initialize build 'digital': builder type not found: digital");
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+ok_json_one_packer_error_one_line\.json$/);
        });
      });
    });
  });

  describe('checks a packer template with an error', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'ok_json_one_packer_error.json');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the first message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(1);
        })
      );
    });

    it('verifies the first message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].text).toBeDefined();
          expect(messages[0].text).toEqual("Errors validating build 'digitalocean': api_token for auth must be specified");
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+ok_json_one_packer_error\.json$/);
        });
      });
    });
  });
});
