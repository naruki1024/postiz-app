# terraform.tfvars
allowed_ip   = "60.102.79.33/32"  # 指定されたIPアドレスのみを許可
ami_id       = "ami-0d52744d6551d851e"  # Amazon Linux 2023 AMI
domain       = "postiz.local"
jwt_secret   = "4BQAyIybeI/QGbluzYGg180Px7MyGqS/G/nIw0qI4mI="
db_password  = "postiz-password-123"
key_name     = "postiz-app-key"  # AWSコンソールで作成したキーペア名を指定