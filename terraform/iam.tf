resource "aws_iam_role" "moviemacabre_ssm" {
  name = "moviemacabre-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.moviemacabre_ssm.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "moviemacabre" {
  name = "moviemacabre-instance-profile"
  role = aws_iam_role.moviemacabre_ssm.name
}
