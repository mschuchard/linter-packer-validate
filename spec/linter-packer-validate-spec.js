'use babel';

import * as path from 'path';

describe('The Packer Validate provider for Linter', () => {
  const lint = require(path.join(__dirname, '../lib/main.js')).provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-packer-validate');
      return atom.packages.activatePackage('language-json').then(() =>
        atom.workspace.open(path.join(__dirname, 'fixtures/', 'ok_packer_ok_json.pkr.json'))
      );
    });
  });

  describe('checks a packer template with a json error', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'bad_json_bad_packer.pkr.json');
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
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual("Error parsing JSON. Use a JSON Linter for specific assistance.");
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+bad_json_bad_packer\.pkr\.json$/);
        });
      });
    });
  });

  it('checks a non-packer json file with an error and does nothing', (done) => {
    const goodFile = path.join(__dirname, 'fixtures/', 'bad_json_not_packer.json');
    return atom.workspace.open(goodFile).then(editor =>
      lint(editor).then(messages => {
      }, (reason) => {
        done();
      })
    );
  });

  describe('checks a packer template with multiple errors', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'ok_json_multiple_packer_errors.pkr.json');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the messages', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(6);
        })
      );
    });

    it('verifies the messages', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual("Errors validating build 'amazon-ebs': ami_name must be specified");
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+ok_json_multiple_packer_errors\.pkr\.json$/);
          expect(messages[1].severity).toBeDefined();
          expect(messages[1].severity).toEqual('error');
          expect(messages[1].excerpt).toBeDefined();
          expect(messages[1].excerpt).toEqual("Errors validating build 'amazon-ebs': ami_name must be between 3 and 128 characters long");
          expect(messages[1].location.file).toBeDefined();
          expect(messages[1].location.file).toMatch(/.+ok_json_multiple_packer_errors\.pkr\.json$/);
          expect(messages[2].severity).toBeDefined();
          expect(messages[2].severity).toEqual('error');
          expect(messages[2].excerpt).toBeDefined();
          expect(messages[2].excerpt).toEqual("Errors validating build 'amazon-ebs': A source_ami or source_ami_filter must be specified");
          expect(messages[2].location.file).toBeDefined();
          expect(messages[2].location.file).toMatch(/.+ok_json_multiple_packer_errors\.pkr\.json$/);
          expect(messages[3].severity).toBeDefined();
          expect(messages[3].severity).toEqual('error');
          expect(messages[3].excerpt).toBeDefined();
          expect(messages[3].excerpt).toEqual("Errors validating build 'amazon-ebs': For security reasons, your source AMI filter must declare an owner.");
          expect(messages[3].location.file).toBeDefined();
          expect(messages[3].location.file).toMatch(/.+ok_json_multiple_packer_errors\.pkr\.json$/);
          expect(messages[4].severity).toBeDefined();
          expect(messages[4].severity).toEqual('error');
          expect(messages[4].excerpt).toBeDefined();
          expect(messages[4].excerpt).toEqual("Errors validating build 'digitalocean': api_token for auth must be specified");
          expect(messages[4].location.file).toBeDefined();
          expect(messages[4].location.file).toMatch(/.+ok_json_multiple_packer_errors\.pkr\.json$/);
          expect(messages[5].severity).toBeDefined();
          expect(messages[5].severity).toEqual('error');
          expect(messages[5].excerpt).toBeDefined();
          expect(messages[5].excerpt).toEqual("Errors validating build 'digitalocean': region is required");
          expect(messages[5].location.file).toBeDefined();
          expect(messages[5].location.file).toMatch(/.+ok_json_multiple_packer_errors\.pkr\.json$/);
        });
      });
    });
  });

  it('checks a valid non-packer json file and does nothing', (done) => {
    const goodFile = path.join(__dirname, 'fixtures/', 'ok_json_not_packer.json');
    return atom.workspace.open(goodFile).then(editor =>
      lint(editor).then(messages => {
      }, (reason) => {
        done();
      })
    );
  });

  it('checks a valid non-packer hcl file and does nothing', (done) => {
    const goodFile = path.join(__dirname, 'fixtures/', 'ok_hcl_not_packer.hcl');
    return atom.workspace.open(goodFile).then(editor =>
      lint(editor).then(messages => {
      }, (reason) => {
        done();
      })
    );
  });

  it('finds nothing wrong with a valid json file', () => {
    let editor = null;
    waitsForPromise(() => {
      const goodFile = path.join(__dirname, 'fixtures', 'ok_json_ok_packer.pkr.json');
      return atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      );
    });
  });

  it('finds nothing wrong with a valid hcl file', () => {
    let editor = null;
    waitsForPromise(() => {
      const goodFile = path.join(__dirname, 'fixtures', 'ok_hcl_ok_packer.hcl');
      return atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      );
    });
  });

  describe('checks a packer template with an error outside of a builder', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'ok_json_one_packer_error_no_builder_info.pkr.json');
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
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual("Unknown root level key in template: 'unknown'");
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+ok_json_one_packer_error_no_builder_info\.pkr\.json$/);
        });
      });
    });
  });

  describe('checks a packer template with an error inside variables', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'ok_json_one_packer_var_error.pkr.json');
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
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual("variable foo: '' expected type 'string', got unconvertible type '[]interface {}'");
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+ok_json_one_packer_var_error\.pkr\.json$/);
        });
      });
    });
  });

  describe('checks a packer template with a build initialization error', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'ok_json_one_packer_error_one_line.pkr.json');
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
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual("Failed to initialize build 'digital': error initializing builder 'digital': Unknown builder digital");
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+ok_json_one_packer_error_one_line\.pkr\.json$/);
        });
      });
    });
  });

  describe('checks a packer template with an error', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'ok_json_one_packer_error.pkr.json');
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
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual("Errors validating build 'digitalocean': api_token for auth must be specified");
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+ok_json_one_packer_error\.pkr\.json$/);
        });
      });
    });
  });

  describe('checks a packer hcl template with errors', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'ok_hcl_packer_errors.pkr.hcl');
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
          expect(messages.length).toEqual(2);
        })
      );
    });

    it('verifies the messages', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual("Unsupported attribute");
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+ok_hcl_packer_errors\.pkr\.hcl$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[1, 0], [1, 1]]);
          expect(messages[1].severity).toBeDefined();
          expect(messages[1].severity).toEqual('error');
          expect(messages[1].excerpt).toBeDefined();
          expect(messages[1].excerpt).toEqual("Unsupported attribute");
          expect(messages[1].location.file).toBeDefined();
          expect(messages[1].location.file).toMatch(/.+ok_hcl_packer_errors\.pkr\.hcl$/);
          expect(messages[1].location.position).toBeDefined();
          expect(messages[1].location.position).toEqual([[1, 0], [1, 1]]);
        });
      });
    });
  });
});
