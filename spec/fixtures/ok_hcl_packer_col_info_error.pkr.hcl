data "amazon-ami" "ubuntu" {
  owners = ["1"]
}

source "null" "hi" {
  communicator = "none"
}

build {
  sources = ["source.null.hi"]

  provisioner "shell-local" {
    inline = [
      "echo ${data.amazon-ami}",
    ]
  }
}
