source "amazon-ebs" "example" {
    ami_name      = "packer-partyparrot-{{timestamp}}"
    region        = "us-east-1"
    instance_type = "t2.micro"

    source_ami_filter {
      filter {
        key   = "virtualization-type"
        value = "hvm"
      }
      owners      = ["amazon"]
      most_recent = true
    }

    communicator = "ssh"
    ssh_username = "ubuntu"
}

build {
  sources = ["source.amazon-ebs.example"]
}
