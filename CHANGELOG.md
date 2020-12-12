### 1.3.0 (Next)
- Only recognize proper extensions for Packer templates.

- error output format is different  in 1.6
- hcl needs to take in dir for input arg and not template for 1.6 since it enforces proper extension
- dirs can be referenced as input args once proper extensions enforced

### 1.2.3
- Display warning if Packer template is HCL syntax, but Packer version is 1.5.x.
- Improve detection for Packer templates versus other JSON and HCL.
- Detect if JSON template has incorrect extension and display info.

### 1.2.2
- Add beta support for HCL language.

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
