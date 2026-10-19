resource "aws_key_pair" "moviemacabre" {
  key_name   = "moviemacabre"
  public_key = file("~/.ssh/moviemacabre.pub")

  tags = {
    Name = "moviemacabre-key"
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"]
}

resource "aws_instance" "moviemacabre" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.moviemacabre.id]

  key_name             = aws_key_pair.moviemacabre.key_name
  iam_instance_profile = aws_iam_instance_profile.moviemacabre.name

  tags = {
    Name = "moviemacabre-server"
  }
}
