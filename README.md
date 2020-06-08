![Preview](https://raw.githubusercontent.com/mschuchard/linter-packer-validate/master/linter_packer_validate.png)

### Linter-Packer-Validate
[![Build Status](https://travis-ci.org/mschuchard/linter-packer-validate.svg?branch=master)](https://travis-ci.org/mschuchard/linter-packer-validate)

Linter-Packer-Validate aims to provide functional and robust `packer validate` linting functionality within Atom.

### Installation
Packer is required to be installed before using this. Versions in the range `~> 1.0` of Packer are officially supported. The Linter and Language-JSON or Language-HCL Atom packages are also required.

### Usage
- All JSON files with a `builders` key that has an array value, or HCL files with a proper `.pkr.hcl` extension, will be linted with this linter. Be aware of this in case you have a non-Packer JSON or HCL file with this characteristic. Also be aware of this in case you have a typo for the `builders` key or HCL file extension, since this linter will then not trigger.
- If your Packer template has a JSON parsing error, this linter will notify of it but not provide specific information about it. Please use a JSON Linter for that functionality.
