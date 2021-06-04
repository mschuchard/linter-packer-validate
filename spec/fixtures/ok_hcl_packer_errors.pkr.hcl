source "amazon-ebs" "centos7" {
  vpc_id = var.vpcs[var.vpc]
}

build {
  sources = ["source.amazon-ebs.centos7"]
}
