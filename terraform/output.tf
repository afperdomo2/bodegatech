output "bucket_name" {
  value       = aws_s3_bucket.s3_uploads.bucket
  description = "Nombre del bucket S3 creado para almacenar los uploads de la aplicación"
}

output "bucket_arn" {
  value       = aws_s3_bucket.s3_uploads.arn
  description = "ARN del bucket S3 creado para almacenar los uploads de la aplicación"
}

output "lambda_function_arn" {
  value       = aws_lambda_function.image_processor.arn
  description = "ARN de la Lambda de procesamiento de imágenes"
}

output "lambda_function_name" {
  value       = aws_lambda_function.image_processor.function_name
  description = "Nombre de la Lambda de procesamiento de imágenes"
}

output "sqs_queue_url" {
  value       = aws_sqs_queue.image_processing_queue.url
  description = "URL de la cola SQS para procesamiento de imágenes"
}

output "sqs_dlq_url" {
  value       = aws_sqs_queue.image_processing_dlq.url
  description = "URL de la cola muerta (DLQ) para imágenes que fallaron el procesamiento"
}

output "cloudwatch_log_group" {
  value       = aws_cloudwatch_log_group.lambda_logs.name
  description = "Nombre del grupo de logs de CloudWatch para la Lambda"
}
