locals {
  common_tags = {
    organization = var.org_name
    project      = var.project_name
    environment  = var.environment
    owner        = "felipe"
    created_by   = "terraform"
  }
}
