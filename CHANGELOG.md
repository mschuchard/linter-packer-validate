### Next (Roadmap)
- Updated `atom-linter` dependency.
- Catch linting on nonexistent files.
- Substitute escaped `%!(PACKER_COMMA)` output with actual comma.
- Fix inaccurate cached builder info between lints.

can use key info to do line number? https://stackoverflow.com/questions/6946466/line-number-of-the-matched-characters-in-js-node-js
* variable regions: '' expected type 'string', got unconvertible type '[]interface {}' causes an undef toReturn; so actually this was due to something else apparently
establish min version 1.0 in code and doc

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
