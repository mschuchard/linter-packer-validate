![Preview](https://raw.githubusercontent.com/mschuchard/linter-packer-validate/master/linter_packer_validate.png)

### Linter-Packer-Validate
[![Build Status](https://travis-ci.com/mschuchard/linter-packer-validate.svg?branch=master)](https://travis-ci.com/mschuchard/linter-packer-validate)

Linter-Packer-Validate aims to provide functional and robust `packer` linting and auto-formatting functionality within Atom/Pulsar.

### APM (Atom) and PPM (Pulsar) Support

`apm` was discontinued prior to the sunset by the Atom Editor team. `ppm` for Pulsar does not yet support package publishing. Therefore, the installation instructions are now as follows if you want the latest version in Atom, Atom Beta, or Atom Dev:

- Locate the Atom or Pulsar packages directory on your filesystem (normally at `<home>/.{atom,pulsar}/packages`)
- Retrieve the code from this repository either via `git` or the Code-->Download ZIP option in Github.
- Place the directory containing the repository's code in the Atom or Pulsar packages directory.
- Execute `npm install` in the package directory (requires NPM).
- Repeat for any missing or outdated dependencies.

and Pulsar:

- Install the old version of the package as usual with either PPM or the GUI installer in the editor.
- Locate the Atom or Pulsar packages directory on your filesystem (normally at `<home>/.{atom,pulsar}/packages`)
- Replace the `lib/main.js` file in the package directory with the file located in this remote Github repository.

Additionally: this package is now in maintenance mode. All feature requests and bug reports in the Github repository issue tracker will receive a response, and possibly also be implemented (especially bug fixes). However, active development on this package has ceased.

### Installation
Packer >= 1.6.0 is required to be installed before using this. If your version is lower, then you will need to downgrade this package to version 1.3.1. The Linter and Language-JSON and/or Language-HCL Atom packages are also required.

Note that at this current time the package unit tests (outside of CI which will be Atom Beta `1.61.0` for the time being) and acceptance testing are performed with the latest stable version of Pulsar.

### Usage
- All JSON files with a proper `.pkr.json` extension, or HCL files with a proper `.pkr.hcl` extension, will be linted with this linter. Be aware of this in case you have a non-Packer JSON or HCL file with this characteristic. Also be aware of this in case you have a typo in the template file extension, since this linter will then not trigger.
- JSON template support is currently deprecated as of package version 1.5.0. It may function correctly, but it is no longer acceptance tested in this package. Users are encouraged to follow the Hashicorp recommendation to upgrade their templates to HCL2 as soon as possible.
- There is an option to lint the directory containing the open file. This is primarily to support modern versions and usage of Packer with proper filenames and directory organization. Older versions of Packer, and deprecated Packer usage and directory organizations, will be largely incompatible with this feature. It is heavily recommended that anyone developing with modern Packer usage and organization enable this config option.
