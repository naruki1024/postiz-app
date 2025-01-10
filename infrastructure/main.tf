# main.tf
provider "aws" {
  region  = "ap-northeast-1"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "postiz-vpc"
  }
}

# パブリックサブネット
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-northeast-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "postiz-public-subnet"
  }
}

# インターネットゲートウェイ
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "postiz-igw"
  }
}

# ルートテーブル
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "postiz-public-rt"
  }
}

# ルートテーブルの関連付け
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# セキュリティグループ
resource "aws_security_group" "postiz" {
  name        = "postiz-sg"
  description = "Security group for Postiz instance"
  vpc_id      = aws_vpc.main.id

  # HTTP (for Let's Encrypt)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP for Lets Encrypt verification"
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ip]
  }

  # HTTP/Postiz
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ip]
  }

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ip]
  }

  # アウトバウンド
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "postiz-sg"
  }
}

# EC2インスタンス
resource "aws_instance" "postiz" {
  ami           = var.ami_id
  instance_type = "t3.small"
  key_name      = var.key_name

  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.postiz.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              # システムアップデート
              dnf update -y
              dnf install -y docker
              systemctl start docker
              systemctl enable docker

              # Docker Compose インストール
              curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose

              # 作業ディレクトリ作成
              mkdir -p /opt/postiz
              cd /opt/postiz

              # Docker Compose設定
              cat << 'DOCKER_COMPOSE' > docker-compose.yml
              services:
                postiz:
                  image: ghcr.io/gitroomhq/postiz-app:latest
                  container_name: postiz
                  restart: always
                  environment:
                    MAIN_URL: "https://${var.domain}"
                    FRONTEND_URL: "https://${var.domain}"
                    NEXT_PUBLIC_BACKEND_URL: "https://${var.domain}/api"
                    JWT_SECRET: "${var.jwt_secret}"
                    DATABASE_URL: "postgresql://postiz-user:${var.db_password}@postiz-postgres:5432/postiz-db-local"
                    REDIS_URL: "redis://postiz-redis:6379"
                    BACKEND_INTERNAL_URL: "http://localhost:3000"
                    IS_GENERAL: "true"
                    STORAGE_PROVIDER: "local"
                    UPLOAD_DIRECTORY: "/uploads"
                    NEXT_PUBLIC_UPLOAD_DIRECTORY: "/uploads"
                  volumes:
                    - postiz-config:/config/
                    - postiz-uploads:/uploads/
                  ports:
                    - 5000:5000
                  networks:
                    - postiz-network
                  depends_on:
                    postiz-postgres:
                      condition: service_healthy
                    postiz-redis:
                      condition: service_healthy

                postiz-postgres:
                  image: postgres:17-alpine
                  container_name: postiz-postgres
                  restart: always
                  environment:
                    POSTGRES_PASSWORD: ${var.db_password}
                    POSTGRES_USER: postiz-user
                    POSTGRES_DB: postiz-db-local
                  volumes:
                    - postgres-volume:/var/lib/postgresql/data
                  networks:
                    - postiz-network
                  healthcheck:
                    test: pg_isready -U postiz-user -d postiz-db-local
                    interval: 10s
                    timeout: 3s
                    retries: 3

                postiz-redis:
                  image: redis:7.2
                  container_name: postiz-redis
                  restart: always
                  healthcheck:
                    test: redis-cli ping
                    interval: 10s
                    timeout: 3s
                    retries: 3
                  volumes:
                    - postiz-redis-data:/data
                  networks:
                    - postiz-network

              volumes:
                postgres-volume:
                  external: false
                postiz-redis-data:
                  external: false
                postiz-config:
                  external: false
                postiz-uploads:
                  external: false

              networks:
                postiz-network:
                  external: false
              DOCKER_COMPOSE

              # Docker Compose 起動
              docker-compose up -d
              EOF

  tags = {
    Name = "postiz-instance"
  }
}

# 出力
output "public_ip" {
  value = aws_instance.postiz.public_ip
}