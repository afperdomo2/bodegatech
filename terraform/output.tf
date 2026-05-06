output "bucket_name" {
  value       = aws_s3_bucket.s3_uploads.bucket
  description = "Nombre del bucket S3 creado para almacenar los uploads de la aplicación"
}

output "bucket_arn" {
  value       = aws_s3_bucket.s3_uploads.arn
  description = "ARN del bucket S3 creado para almacenar los uploads de la aplicación"
}
