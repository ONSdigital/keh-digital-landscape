output "cognito_reviewer_user_pool" {
  description = "Cognito reviewer user pool object."
  value       = module.cognito.user_pool
}

output "cognito_reviewer_user_pool_id" {
  description = "Cognito reviewer user pool ID."
  value       = module.cognito.user_pool_id
}

output "cognito_reviewer_user_pool_arn" {
  description = "Cognito reviewer user pool ARN."
  value       = module.cognito.user_pool_arn
}

output "cognito_reviewer_user_pool_domain" {
  description = "Cognito reviewer user pool domain."
  value       = module.cognito.user_pool_domain
}

output "cognito_reviewer_user_pool_client" {
  description = "Cognito reviewer user pool client object."
  value       = module.cognito.user_pool_client
}

output "cognito_reviewer_user_pool_client_id" {
  description = "Cognito reviewer user pool client ID."
  value       = module.cognito.user_pool_client_id
}

output "cognito_user_groups" {
  description = "Cognito user group definitions."
  value       = module.cognito.user_groups
}

output "cognito_user_pool_domain" {
  description = "Cognito user pool domain."
  value       = module.cognito.user_pool_domain
}

output "cognito_user_pool_sign_out_urls" {
  description = "Cognito user pool sign-out URLs."
  value       = module.cognito.sign_out_urls
}