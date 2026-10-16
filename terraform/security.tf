resource "aws_security_group" "moviemacabre" {
  name        = "moviemacabre-sg"
  description = "Security group for MovieMacabre server"
  vpc_id      = aws_vpc.moviemacabre.id

  tags = {
    Name = "moviemacabre-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "ssh" {
  security_group_id = aws_security_group.moviemacabre.id

  cidr_ipv4   = var.ssh_allowed_cidr
  from_port   = 22
  to_port     = 22
  ip_protocol = "tcp"

  description = "Allow SSH"
}

resource "aws_vpc_security_group_ingress_rule" "http" {
  security_group_id = aws_security_group.moviemacabre.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 80
  to_port     = 80
  ip_protocol = "tcp"

  description = "Allow HTTP"
}

resource "aws_vpc_security_group_ingress_rule" "https" {
  security_group_id = aws_security_group.moviemacabre.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 443
  to_port     = 443
  ip_protocol = "tcp"

  description = "Allow HTTPS"
}

resource "aws_vpc_security_group_egress_rule" "all" {
  security_group_id = aws_security_group.moviemacabre.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"

  description = "Allow all outbound traffic"
}
