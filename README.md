![Preview](https://raw.githubusercontent.com/mschuchard/linter-packer-validate/master/linter_packer_validate.png)

### Linter-Packer-Validate
[![Build Status](https://travis-ci.com/mschuchard/linter-packer-validate.svg?branch=master)](https://travis-ci.com/mschuchard/linter-packer-validate)

Linter-Packer-Validate aims to provide functional and robust `packer validate` linting and auto-formatting functionality within Atom.

### Installation
Packer >= 1.6.0 is required to be installed before using this. If your version is lower, then you will need to downgrade this package to version 1.3.1. The Linter and Language-JSON or Language-HCL Atom packages are also required.

### Usage
- All JSON files with a proper `.pkr.json` extension, or HCL files with a proper `.pkr.hcl` extension, will be linted with this linter. Be aware of this in case you have a non-Packer JSON or HCL file with this characteristic. Also be aware of this in case you have a typo in the template file extension, since this linter will then not trigger.
- There is an option to lint the directory containing the open file. This is primarily to support modern versions and usage of Packer with proper filenames and directory organization. Older versions of Packer and deprecated Packer usage and directory organizations will be largely incompatible with this feature.
- If your Packer template has a JSON parsing error, this linter will notify of it but not provide specific information about it. Please use a JSON Linter for that functionality.
