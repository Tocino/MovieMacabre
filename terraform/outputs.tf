output "server_public_ip" {
  description = "Public IPv4 address of the MovieMacabre server"
  value       = aws_instance.moviemacabre.public_ip
}

output "instance_id" {
  description = "MovieMacabre EC2 instance ID"
  value       = aws_instance.moviemacabre.id
}

output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = aws_route53_zone.moviemacabre.zone_id
}