![Preview](https://raw.githubusercontent.com/mschuchard/linter-packer-validate/master/linter_packer_validate.png)

### Linter-Packer-Validate
`Linter-Packer-Validate` aims to provide functional and robust `packer validate` linting functionality within Atom.

### Installation
The `packer` package is required to be installed before using this. The `Linter` and `Language-JSON` Atom packages are also required, but should be automatically installed as dependencies thanks to steelbrain's `package-deps`.

### Usage
- All JSON files with a `builders` key that has an array value will be linted with this linter. Be aware of this in case you have a non-Packer JSON file with this characteristic. Also be aware of this in case you have a typo for the `builders` key.
- If your Packer template has a JSON parsing error, this linter will notify of it but not provider specific information about it. Please use a JSON Linter for that functionality.
- Multiple errors for the same builder type are currently displayed in one message. This will be fixed in an upcoming release.
