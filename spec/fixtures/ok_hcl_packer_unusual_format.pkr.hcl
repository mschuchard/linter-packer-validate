source "null" "one" {
  communicator = "none"
}

build {
  sources = ["source.null.one"]
  provisioner "ansible" { playbook_file = "${path.root}/playbook.yaml" }
}
