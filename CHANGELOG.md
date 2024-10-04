### (Next)
node.js 15 --> replaceall
ok_hcl_packer_col_info_error.pkr.hcl parsing line info early and missing actual line/col info because validate now displays incorrect line number before correct line number
saving in file with issue shows extra display info line with superfluous info; saving in other file in config dir has no such extra display line; similarly true issue line uses other file in dir erroneously
do not bail out early on pkrvars file after fmt if config option to lint dir is enabled
similar to tf error on fmt effort:
improve warn to only display non-config file issues?
improve warn to only trigger when all issues derive from only non-config files?

### 1.6.1
- Enable auto-formatting for Packer input variable files (`.pkrvars.hcl`).
- Warn on automatic formatting errors returned for non-config/template Packer files.

### 1.6.0
- Minimum Packer version incremented to 1.7.0.
- Properly capture warning severity.

### 1.5.4
- Avoid appending information prior to capturing file and line information.
- Capture error messages ending in a `"` character.
- Add `envVars` config option.
- Add undeclared variable warning config option.

### 1.5.3
- Capture rare error messages with leading asterisk character.
- Capture other info when output file info is an empty string.
- Fix message excepts when ends with `]`.

### 1.5.2
- Fix undefined variable in current file formatting logic.
- Capture and display column information for message if available.
- Fix message excerpts when `.` in message or ends with `?`.

### 1.5.1
- Additional comma and newline message replacements to improve display message.
- Retain severity between output iterations due to Packer output behavior.
- Provide message attribute defaults if no info from Packer.
- Ignore new Packer message for valid configurations.

### 1.5.0
- Deprecate JSON template support.
- Add recursive and current file format options to package config.
- Use severity output instead of message for severity parsing.
- Improve severity parsing.
- Replace newline characters in message with whitespace.

### 1.4.1
- Updates to Linter API usage.
- Improve description quality of displayed issue message.
- Fix return on stdin lint errors.

### 1.4.0
- Minimum Packer version incremented to 1.6.0.
- Iterate on double newlines instead of single (accuracy/efficiency).
- Capture and display file name with issue instead of open file.
- Remove JSON error generic notification.

### 1.3.1
- Add auto-formatting config option.
- Add config option to lint directory.

### 1.3.0
- Only recognize proper extensions for Packer templates.
- Preliminary support for 1.6 validation output format.
- Fix machine readable carriage return split.

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
