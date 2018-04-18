![Preview](https://raw.githubusercontent.com/mschuchard/linter-packer-validate/master/linter_packer_validate.png)

### Linter-Packer-Validate
[![Build Status](https://travis-ci.org/mschuchard/linter-packer-validate.svg?branch=master)](https://travis-ci.org/mschuchard/linter-packer-validate)

`Linter-Packer-Validate` aims to provide functional and robust `packer validate` linting functionality within Atom.

### Installation
`Packer` is required to be installed before using this. The `Linter` and `Language-JSON` Atom packages are also required.

### Usage
- All JSON files with a `builders` key that has an array value will be linted with this linter. Be aware of this in case you have a non-Packer JSON file with this characteristic. Also be aware of this in case you have a typo for the `builders` key, since this linter will then not trigger.
- If your Packer template has a JSON parsing error, this linter will notify of it but not provide specific information about it. Please use a JSON Linter for that functionality.
