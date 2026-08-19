variable "service_subdomain" {
  description = "Service subdomain"
  type        = string
  default     = "digital-landscape"
}

variable "service_title" {
  description = "Service name used in auth emails"
  type        = string
  default     = "ONS Digital Landscape"
}

variable "domain" {
  description = "Domain"
  type        = string
  default     = "sdp-dev"
}
variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2"
}

variable "project_tag" {
  description = "Project"
  type        = string
  default     = "SDP"
}

variable "team_owner_tag" {
  description = "Team Owner"
  type        = string
  default     = "Knowledge Exchange Hub"
}

variable "business_owner_tag" {
  description = "Business Owner"
  type        = string
  default     = "DST"
}

variable "domain_extension" {
  description = "Domain extension"
  type        = string
  default     = "aws.onsdigital.uk"
}


variable "user_groups" {
  description = "Map of user groups to create in the user pool, where key is group name and value is description"
  type        = map(string)
  default = {
    "admin"    = "The admin users for the Digital Landscape"
    "reviewer" = "The reviewer users for the Digital Landscape"
  }
}

variable "sign_out_urls" {
  description = "List of allowed sign out URLs for the identity providers"
  type        = list(string)
  default     = []
}

variable "enable_azuread_saml" {
  type        = bool
  default     = false
  description = "Indicating whether to enable Azure AD SAML authentication (defaults to false)"
}

variable "azuread_provider_name" {
  type        = string
  default     = "ONS"
  description = "Identify the Azure AD provider in Cognito (defaults to 'ONS')"
}

variable "azure_ad_metadata_url" {
  type        = string
  default     = null
  description = "Azure AD Federation Metadata URL (preferred)."
}

locals {
  url         = "${var.domain}.${var.domain_extension}"
  service_url = "${var.service_subdomain}.${local.url}"
}
