![Preview](https://raw.githubusercontent.com/mschuchard/linter-packer-validate/master/linter_packer_validate.png)

### Linter-Packer-Validate
Linter-Packer-Validate aims to provide functional and robust `packer` linting and auto-formatting functionality within Pulsar.

This package is now in maintenance mode. All feature requests and bug reports in the Github repository issue tracker will receive a response, and possibly also be implemented (especially bug fixes). However, active development on this package has ceased.

### Installation
Packer >= 1.7.0 is required to be installed before using this. If your version is lower, then you will need to downgrade this package to version 1.3.1 or 1.5.4. The Atom-IDE-UI and Language-JSON and/or Language-HCL packages are also required.

All testing is performed with the latest stable version of Pulsar. Any version of Atom or any pre-release version of Pulsar is not supported.

### Usage
- All JSON files with a proper `.pkr.json` extension, or HCL files with a proper `.pkr.hcl` extension, will be linted with this linter. Be aware of this in case you have a non-Packer JSON or HCL file with this characteristic. Also be aware of this in case you have a typo in the template file extension, since this linter will then not trigger.
- JSON template support is currently deprecated as of package version 1.5.0. It may function correctly, but it is no longer acceptance tested in this package. Users are encouraged to follow the Hashicorp recommendation to upgrade their templates to HCL2 as soon as possible.
- There is an option to lint the directory containing the open file. This is primarily to support modern versions and usage of Packer with proper filenames and directory organization. Older versions of Packer, and deprecated Packer usage and directory organizations, will be largely incompatible with this feature. It is heavily recommended that anyone developing with modern Packer usage and organization enable this config option.
