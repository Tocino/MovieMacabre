resource "aws_route53_zone" "moviemacabre" {
  name    = "movie-macabre.com"
  comment = "HostedZone created by Route53 Registrar"
}

resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.moviemacabre.zone_id
  name    = "movie-macabre.com"
  type    = "A"
  ttl     = 60


  records = [
    aws_instance.moviemacabre.public_ip
  ]

  lifecycle {
    ignore_changes = [records]
  }
}