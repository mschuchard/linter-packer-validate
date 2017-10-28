### Next (Roadmap)
- Add `cwd` to execution so provisioner files are found during validation.
aws.json and azure.json and then azure.json build info is coming from aws.json (also it has no builder info anyway since it is a provisioner so two issues here)

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
