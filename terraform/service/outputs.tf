output "ecs_task_definition_arn" {
  description = "ARN of the ECS task definition."
  value       = aws_ecs_task_definition.ecs_service_definition.arn
}

output "ecs_task_definition_revision" {
  description = "Revision of the ECS task definition."
  value       = aws_ecs_task_definition.ecs_service_definition.revision
}

output "security_group_id" {
  description = "Security group ID for the service."
  value       = aws_security_group.allow_rules_service.id
}

output "service_url" {
  description = "Public URL of the service."
  value       = local.service_url
}

output "backend_log_group" {
  description = "CloudWatch log group name for the backend."
  value       = aws_cloudwatch_log_group.backend_logs.name
}
