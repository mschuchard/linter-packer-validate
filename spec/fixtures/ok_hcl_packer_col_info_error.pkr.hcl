locals {
  map = { "foo" = "bar" }
}


source "null" "hi" {
  communicator = "none"
}

build {
  sources = ["source.null.hi"]

  provisioner "shell-local" {
    inline = [
      "echo ${local.map}",
    ]
  }
}
