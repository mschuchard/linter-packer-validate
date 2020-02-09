### Next (Roadmap)
- Add support for HCL language.

- add hcl tests
- change hcl regexp to source and update doc
- can use key info to do line number? https://stackoverflow.com/questions/6946466/line-number-of-the-matched-characters-in-js-node-js

### 1.2.1
- Recognize Packer templates with other valid JSON formats.
- Add config option to only check syntax and not template config.

### 1.2.0
- Updated `atom-linter` dependency.
- Catch linting on nonexistent files.
- Substitute escaped `%!(PACKER_COMMA)` output with actual comma.
- Fix inaccurate cached builder info between lints.

### 1.1.1
- Add `cwd` to execution so provisioner files are found during validation.

### 1.1.0
- Switched to using Linter v2 API.
- Multiple errors for same builder now each display builder info.
- Removed `atom-package-deps` dependency and functionality.

### 1.0.2
- Fixed message display for multiple issues per builder.

### 1.0.1
- Fixed undefined return for non-Packer JSON files.

### 1.0.0
- Initial version ready for wide usage.
