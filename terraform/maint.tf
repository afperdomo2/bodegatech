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

# Configuración de notificaciones de S3 para enviar eventos a SQS
resource "aws_s3_bucket_notification" "product_image_notification" {
  bucket = aws_s3_bucket.s3_uploads.id

  queue {
    queue_arn     = aws_sqs_queue.image_processing_queue.arn
    events        = ["s3:ObjectCreated:*"]
    filter_prefix = "products/"
    # Aceptar imágenes originales en formato PNG o JPG
    # Nota: S3 notification permite solo UN filter_suffix
    # Por lo tanto, validamos el formato en Lambda con regex
    filter_suffix = "-original.png"
  }

  depends_on = [aws_sqs_queue_policy.allow_s3_events]
}

# Cola de mensajes fallidos (Auditoría)
resource "aws_sqs_queue" "image_processing_dlq" {
  name = "${var.org_name}-${var.project_name}-${var.environment}-product-images-processing-dlq"
  tags = local.common_tags
}

# Cola principal de procesamiento
resource "aws_sqs_queue" "image_processing_queue" {
  name                      = "${var.org_name}-${var.project_name}-${var.environment}-product-images-processing-queue"
  message_retention_seconds = 86400        # 1 día de vida por si algo falla
  receive_wait_time_seconds = 10           # Long polling para ahorrar costos
  visibility_timeout_seconds = 360         # 6x Lambda timeout (60s), requerido por AWS
  tags                      = local.common_tags

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.image_processing_dlq.arn
    maxReceiveCount     = 3 # Reintentos antes de ir a la DLQ
  })
}

# Política para permitir que S3 envíe mensajes a esta cola
resource "aws_sqs_queue_policy" "allow_s3_events" {
  queue_url = aws_sqs_queue.image_processing_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "s3.amazonaws.com" }
      Action    = "sqs:SendMessage"
      Resource  = aws_sqs_queue.image_processing_queue.arn
      Condition = {
        ArnLike = { "aws:SourceArn" : aws_s3_bucket.s3_uploads.arn }
      }
    }]
  })
}

# Rol de ejecución de la Lambda
resource "aws_iam_role" "image_lambda_role" {
  name = "${var.project_name}-${var.environment}-lambda-product-image-processor-role"
  tags = local.common_tags

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Política de permisos específicos
resource "aws_iam_role_policy" "lambda_permissions" {
  name = "${var.project_name}-${var.environment}-product-image-processor-policy"
  role = aws_iam_role.image_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # 1. Permisos sobre S3 (Solo lectura/escritura en su carpeta)
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject"]
        Resource = "${aws_s3_bucket.s3_uploads.arn}/products/*"
      },
      # 2. Permisos sobre SQS (Consumir mensajes)
      {
        Effect   = "Allow"
        Action   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Resource = aws_sqs_queue.image_processing_queue.arn
      },
      # 3. Permisos para Logs (CloudWatch)
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Empaquetado automático del código (Terraform creará el .zip por ti)
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda" # Aquí viviría tu index.js y package.json
  output_path = "${path.module}/lambda_function_payload.zip"
}

resource "aws_lambda_function" "image_processor" {
  filename      = data.archive_file.lambda_zip.output_path
  function_name = "${var.project_name}-${var.environment}-product-image-processor"
  role          = aws_iam_role.image_lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  architectures = ["arm64"] # Arquitectura ARM64 para mejor rendimiento/precio
  timeout       = 60
  memory_size   = 1024
  tags          = local.common_tags

  environment {
    variables = {
      API_URL      = var.backend_api_url
      API_KEY      = var.internal_api_key
      S3_BUCKET    = aws_s3_bucket.s3_uploads.id
      NODE_ENV     = var.environment
      WEBP_QUALITY = var.webp_quality
    }
  }

  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
}

# Configuración del Trigger (Disparador)
# Esto le dice a AWS: "Cuando llegue un mensaje a SQS, ejecute esta Lambda"
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = aws_sqs_queue.image_processing_queue.arn
  function_name    = aws_lambda_function.image_processor.arn
  batch_size       = 1 # Procesamos de una en una para evitar fallos masivos
}

# ========== CloudWatch Monitoring ==========

# Log Group para Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.image_processor.function_name}"
  retention_in_days = 14
  tags              = local.common_tags
}

# Metric Filter: Imágenes procesadas exitosamente
resource "aws_cloudwatch_log_metric_filter" "image_processing_success" {
  name           = "${var.project_name}-${var.environment}-image-processing-success"
  log_group_name = aws_cloudwatch_log_group.lambda_logs.name
  pattern        = "IMAGE_PROCESSED"

  metric_transformation {
    name      = "ImageProcessingSuccess"
    namespace = "BodegaTech/ImageProcessing"
    value     = "1"
  }
}

# Metric Filter: Errores de procesamiento
resource "aws_cloudwatch_log_metric_filter" "image_processing_error" {
  name           = "${var.project_name}-${var.environment}-image-processing-error"
  log_group_name = aws_cloudwatch_log_group.lambda_logs.name
  pattern        = "ERROR"

  metric_transformation {
    name      = "ImageProcessingError"
    namespace = "BodegaTech/ImageProcessing"
    value     = "1"
  }
}

# Alarm: Demasiados mensajes en DLQ (> 5 mensajes en 5 minutos)
resource "aws_cloudwatch_metric_alarm" "dlq_messages_high" {
  alarm_name          = "${var.project_name}-${var.environment}-image-dlq-messages-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = "300" # 5 minutos
  statistic           = "Average"
  threshold           = "5"
  alarm_description   = "Alerta cuando hay más de 5 mensajes en la DLQ de procesamiento de imágenes"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []
  treat_missing_data  = "notBreaching"

  dimensions = {
    QueueName = aws_sqs_queue.image_processing_dlq.name
  }

  tags = local.common_tags
}

# Alarm: Lambda errors > 10%
resource "aws_cloudwatch_metric_alarm" "lambda_errors_high" {
  alarm_name          = "${var.project_name}-${var.environment}-image-processor-errors-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300" # 5 minutos
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "Alerta cuando la Lambda de procesamiento de imágenes tiene errores"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.image_processor.function_name
  }

  tags = local.common_tags
}
