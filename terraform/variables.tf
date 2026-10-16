variable "aws_region" {
  description = "AWS region used for MovieMacabre infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "ssh_allowed_cidr" {
  description = "CIDR block allowed to SSH into the MovieMacabre server"
  type        = string
}