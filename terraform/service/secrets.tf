# Secrets for IAM user access keys
resource "aws_secretsmanager_secret" "access_key" {
  name        = "${var.domain}-${var.service_subdomain}-digital-landscape-access-key"
  description = "Access Key ID for digital landscape IAM user"
}

resource "aws_secretsmanager_secret" "secret_key" {
  name        = "${var.domain}-${var.service_subdomain}-digital-landscape-secret-key"
  description = "Secret Access Key for digital landscape IAM user"
}