# Task role - this is the role that the application itself will use
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.domain}-${var.service_subdomain}-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Managed policy for CloudWatch Logs Access
resource "aws_iam_policy" "task_logs_policy" {
  name        = "${var.domain}-${var.service_subdomain}-logs-policy"
  path        = "/"
  description = "Cloudwatch Logs Access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:eu-west-2:${var.aws_account_id}:log-group:/ecs/ecs-service-*:*"
      }
    ]
  })
}

# Managed policy for S3 read and write access to specific bucket
resource "aws_iam_policy" "s3_read_and_write" {
  name        = "${var.domain}-${var.service_subdomain}-s3-read-write"
  path        = "/"
  description = "Read and write to specific bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket",
          "s3:GetObjectVersion",
          "s3:PutObject"
        ]
        Resource = [
          "arn:aws:s3:::${var.s3_bucket_name}",
          "arn:aws:s3:::${var.s3_bucket_name}/*",
          "arn:aws:s3:::${var.api_s3_bucket_name}",
          "arn:aws:s3:::${var.api_s3_bucket_name}/*"
        ]
      }
    ]
  })
}

# Policy for S3 read access to copilot historic bucket
resource "aws_iam_policy" "s3_copilot_read_only" {
  name        = "${var.domain}-${var.service_subdomain}-s3-copilot-read-only"
  path        = "/"
  description = "Read-only access to copilot historic bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket",
          "s3:GetObjectVersion"
        ]
        Resource = [
          "arn:aws:s3:::${var.copilot_bucket_name}",
          "arn:aws:s3:::${var.copilot_bucket_name}/*"
        ]
      }
    ]
  })
}

# IAM policy to allow ECS task to access the specified Secrets Manager secret
resource "aws_iam_policy" "secretsmanager_access" {
  name        = "${var.domain}-${var.service_subdomain}-secretsmanager-access"
  path        = "/"
  description = "Access specified Secrets Manager secret"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:${var.region}:${var.aws_account_id}:secret:${var.aws_secret_name}*"
      }
    ]
  })
}

# Attach managed policies to ECS Task Role
resource "aws_iam_role_policy_attachment" "ecs_task_logs_attach" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.task_logs_policy.arn
}

resource "aws_iam_role_policy_attachment" "ecs_s3_read_and_write_attach" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.s3_read_and_write.arn
}

resource "aws_iam_role_policy_attachment" "ecs_s3_copilot_read_only_attach" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.s3_copilot_read_only.arn
}

resource "aws_iam_role_policy_attachment" "ecs_secretsmanager_access_attach" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.secretsmanager_access.arn
}

# IAM User Group
resource "aws_iam_group" "group" {
  name = "${var.domain}-${var.service_subdomain}-user-group"
  path = "/"
}

# Attach managed policies to user group
resource "aws_iam_group_policy_attachment" "group_task_logs_attach" {
  group      = aws_iam_group.group.name
  policy_arn = aws_iam_policy.task_logs_policy.arn
}

resource "aws_iam_group_policy_attachment" "group_s3_read_and_write_attach" {
  group      = aws_iam_group.group.name
  policy_arn = aws_iam_policy.s3_read_and_write.arn
}

resource "aws_iam_group_policy_attachment" "group_s3_copilot_read_only_attach" {
  group      = aws_iam_group.group.name
  policy_arn = aws_iam_policy.s3_copilot_read_only.arn
}

resource "aws_iam_group_policy_attachment" "group_secretsmanager_access_attach" {
  group      = aws_iam_group.group.name
  policy_arn = aws_iam_policy.secretsmanager_access.arn
}

# IAM User
resource "aws_iam_user" "user" {
  name = "${var.domain}-${var.service_subdomain}"
  path = "/"

  lifecycle {
    prevent_destroy = true
  }
}

# Assign IAM User to group
resource "aws_iam_user_group_membership" "user_group_attach" {
  user = aws_iam_user.user.name

  groups = [
    aws_iam_group.group.name
  ]
}

# IAM Key Rotation Module
#
# This module was originally provisioned by Terraform. It remains here commented out
# to ensure that our overall AWS infrastructure for this service is captured fully.
#
# Additionally, it prevents accidental deletion of EventBridge Scheduler, which would 
# reset the 90-day rotation timer and delay key rotation (security/compliance risk).
# 
# Terraform does not support prevent_destroy on modules, so we cannot protect
# the scheduler from accidental recreation during infrastructure changes.
#
# Existing Infrastructure in AWS (managed manually):
# - Lambda: iam-key-rotation-sdp-dev-digital-landscape (timeout: 30s)
# - EventBridge Scheduler: rotate-iam-key-sdp-dev-digital-landscape (every 90 days)
# - IAM Roles: IamKeyRotation_sdp-dev-digital-landscape, scheduler-sdp-dev-digital-landscape
# - CloudWatch Logs: /aws/lambda/iam-key-rotation-sdp-dev-digital-landscape
#
# module "iam_key_rotation" {
#   source = "git::https://github.com/ONSdigital/aws-iam-key-rotation.git"
#
#   iam_username          = aws_iam_user.user.name
#   access_key_secret_arn = aws_secretsmanager_secret.access_key.arn
#   secret_key_secret_arn = aws_secretsmanager_secret.secret_key.arn
#   rotation_in_days      = 90
# }