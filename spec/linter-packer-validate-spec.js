'use babel';

import * as path from 'path';

describe('The Packer Validate provider for Linter', () => {
  const lint = require(path.join(__dirname, '../lib/main.js')).provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-packer-validate');
      return atom.packages.activatePackage('language-hcl').then(() =>
        atom.workspace.open(path.join(__dirname, 'fixtures/', 'ok_packer_ok_hcl.pkr.hcl'))
      );
    });
  });

  it('checks a valid non-packer hcl template and does nothing', (done) => {
    const otherFile = path.join(__dirname, 'fixtures/', 'ok_hcl_not_packer.hcl');
    return atom.workspace.open(otherFile).then(editor =>
      lint(editor).then(messages => {
      }, () => {
        done();
      })
    );
  });

  it('checks an invalid non-packer hcl template and does nothing', (done) => {
    const otherFile = path.join(__dirname, 'fixtures/', 'bad_hcl_not_packer.hcl');
    return atom.workspace.open(otherFile).then(editor =>
      lint(editor).then(messages => {
      }, () => {
        done();
      })
    );
  });

  describe('checks a packer hcl template with hcl errors', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'bad_hcl_bad_packer.pkr.hcl');
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

    it('verifies the messages', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual('An argument or block definition is required here. To set an argument, use the equals sign "=" to introduce the argument value.');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+bad_hcl_bad_packer\.pkr\.hcl$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[19, 0], [19, 1]]);
        });
      });
    });
  });

  describe('checks a packer hcl template with an error message with multiple commas and newlines', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/', 'ok_hcl_extra_packer_comma.pkr.hcl');
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

    it('verifies the message, and replaces the machine commas and newlines with real commas and whitespace', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual('This configuration does not support Packer version 1.7.10. To proceed, either choose another supported Packer version or update this version constraint. Version constraints are normally set for good reason, so updating the constraint may lead to other errors or unexpected behavior.');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+ok_hcl_extra_packer_comma\.pkr\.hcl$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[1, 0], [1, 1]]);
        });
      });
    });
  });

  it('finds nothing wrong with a valid packer hcl template', () => {
    waitsForPromise(() => {
      const goodFile = path.join(__dirname, 'fixtures', 'ok_hcl_ok_packer.hcl');
      return atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      );
    });
  });

  describe('checks a packer hcl template with errors', () => {
    const badFile = path.join(__dirname, 'fixtures/', 'ok_hcl_packer_errors.pkr.hcl');
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
          expect(messages[0].excerpt).toEqual('This object does not have an attribute named "vpcs".');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+ok_hcl_packer_errors\.pkr\.hcl$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[1, 0], [1, 1]]);
          expect(messages[1].severity).toBeDefined();
          expect(messages[1].severity).toEqual('error');
          expect(messages[1].excerpt).toBeDefined();
          expect(messages[1].excerpt).toEqual('This object does not have an attribute named "vpc".');
          expect(messages[1].location.file).toBeDefined();
          expect(messages[1].location.file).toMatch(/.+ok_hcl_packer_errors\.pkr\.hcl$/);
          expect(messages[1].location.position).toBeDefined();
          expect(messages[1].location.position).toEqual([[1, 0], [1, 1]]);
        });
      });
    });
  });

  describe('checks a packer hcl template with an error with column info', () => {
    const badFile = path.join(__dirname, 'fixtures/', 'ok_hcl_packer_col_info_error.pkr.hcl');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(1);
        })
      );
    });

    it('verifies the message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual(' Invalid template interpolation value; Cannot include the given value in a string template: string required.');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+ok_hcl_packer_col_info_error\.pkr\.hcl$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[13, 14], [13, 30]]);
        });
      });
    });
  });

  describe('checks a packer hcl template with an error with unusual characters in the excerpt', () => {
    const badFile = path.join(__dirname, 'fixtures/', 'ok_hcl_packer_col_info_error.pkr.hcl');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(1);
        })
      );
    });

    it('verifies the message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual('Did you mean to use "null.hi"?');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/ok_hcl_packer_message_uncommon_char.+\.pkr\.hcl$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[1, 0], [1, 1]]);
        });
      });
    });
  });
});
