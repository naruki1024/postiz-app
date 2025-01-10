variable "allowed_ip" {
  description = "Allowed IP address range (CIDR)"
  type        = string
}

variable "ami_id" {
  description = "Amazon Linux 2023 AMI ID"
  type        = string
}

variable "domain" {
  description = "Domain name for Postiz"
  type        = string
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "key_name" {
  description = "Name of the EC2 key pair for SSH access"
  type        = string
} 