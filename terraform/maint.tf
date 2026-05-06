resource "aws_s3_bucket" "s3_uploads" {
  bucket        = "${var.org_name}-${var.project_name}-${var.environment}-uploads"
  force_destroy = var.environment != "prod"
  tags          = local.common_tags
}

resource "aws_s3_bucket_cors_configuration" "s3_uploads_cors" {
  bucket = aws_s3_bucket.s3_uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "DELETE"]
    allowed_origins = ["http://localhost:4200"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_public_access_block" "s3_uploads_public_access" {
  bucket = aws_s3_bucket.s3_uploads.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false # permite agregar bucket policy pública
  restrict_public_buckets = false # permite que la policy funcione
}

resource "aws_s3_bucket_policy" "s3_uploads_public_read" {
  bucket = aws_s3_bucket.s3_uploads.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadProducts"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.s3_uploads.arn}/products/*"
    }]
  })

  depends_on = [aws_s3_bucket_public_access_block.s3_uploads_public_access]
}