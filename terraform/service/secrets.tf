# Secrets for rotated IAM user access keys
resource "aws_secretsmanager_secret" "access_key" {
  name                           = "${var.domain}-${var.service_subdomain}-digital-landscape-access-key"
  description                    = "Access Key ID for digital landscape IAM user"
  recovery_window_in_days        = 0    // Secret will be deleted immediately
  force_overwrite_replica_secret = true // Allow overwriting the secret in case of changes
}

resource "aws_secretsmanager_secret" "secret_key" {
  name                           = "${var.domain}-${var.service_subdomain}-digital-landscape-secret-key"
  description                    = "Secret Access Key for digital landscape IAM user"
  recovery_window_in_days        = 0    // Secret will be deleted immediately
  force_overwrite_replica_secret = true // Allow overwriting the secret in case of changes
}