# Secrets for IAM user access keys
resource "aws_secretsmanager_secret" "access_key" {
  name        = "${var.domain}-${var.service_subdomain}-digital-landscape-access-key"
  description = "Access Key ID for digital landscape IAM user"
}

resource "aws_secretsmanager_secret" "secret_key" {
  name        = "${var.domain}-${var.service_subdomain}-digital-landscape-secret-key"
  description = "Secret Access Key for digital landscape IAM user"
}

# Initial secret values (populated manually)
resource "aws_secretsmanager_secret_version" "access_key" {
  secret_id     = aws_secretsmanager_secret.access_key.id
  secret_string = var.initial_access_key_id
}

resource "aws_secretsmanager_secret_version" "secret_key" {
  secret_id     = aws_secretsmanager_secret.secret_key.id
  secret_string = var.initial_secret_access_key
}