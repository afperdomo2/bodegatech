# Terraform - BodegaTech AWS Infrastructure

## 📋 Descripción general

Esta configuración de Terraform crea la infraestructura en AWS para el procesamiento automático de imágenes de productos en BodegaTech:

```
S3 (Imagen Original) → S3 Notification → SQS → Lambda → S3 (Thumbnails + Medium) → Backend Webhook
```

## 🏗️ Recursos creados

### Storage
- **S3 Bucket**: `{org}-{project}-{env}-uploads`
  - Almacena imágenes originales y procesadas
  - Política pública de lectura para `/products/*`
  - CORS habilitado para cargas desde el navegador

### Procesamiento
- **SQS Main Queue**: Cola de eventos de S3
  - Long polling habilitado (10s) para optimizar costos
  - 1 día de retención de mensajes
  - 3 reintentos antes de enviar a DLQ

- **SQS DLQ (Dead Letter Queue)**: Para auditoría de fallos
  - Almacena mensajes que fallaron después de 3 reintentos

### Lambda
- **Lambda Function**: Procesador de imágenes
  - Runtime: Node.js 22.x
  - Arquitectura: ARM64 (Graviton2)
  - Timeout: 60 segundos
  - Memory: 1024 MB
  - **Tareas**:
    1. Descarga imagen original desde S3
    2. Genera thumbnail (200x200 WebP)
    3. Genera medium (800x800 WebP)
    4. Sube ambas versiones a S3
    5. Notifica al Backend vía webhook

### IAM
- **Lambda Execution Role**: Permisos específicos
  - `s3:GetObject`, `s3:PutObject` en `/products/*`
  - `sqs:ReceiveMessage`, `sqs:DeleteMessage` en la cola
  - `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`

### Monitoring
- **CloudWatch Logs**: Registro de ejecuciones Lambda
  - Retención: 14 días
  
- **CloudWatch Metrics**: 
  - `ProcessedImagesSuccess`: Imágenes procesadas exitosamente
  - `ProcessedImagesError`: Imágenes con error en procesamiento
  - `ProcessingDurationMs`: Tiempo de procesamiento (milisegundos)

- **CloudWatch Alarms**:
  - `dlq-messages-high`: Alerta si >5 mensajes en DLQ (5 min)
  - `image-processor-errors-high`: Alerta si >10 errores Lambda (5 min)
  - Notificaciones por SNS (opcional)

## 🔧 Configuración

### Prerequisitos

1. **AWS Account** con acceso programático (AWS CLI configurado)
2. **Terraform** >= 1.0
3. **Variables requeridas** (ver sección siguiente)

### Variables de configuración

#### Requeridas

**En `terraform.tfvars` o desde CLI:**

```hcl
backend_api_url     = "https://api.tudominio.com"        # URL del backend Spring Boot
internal_api_key    = "tu-clave-secreta-interna"         # Header X-Internal-Api-Key
```

#### Opcionales

```hcl
region              = "us-east-1"                         # Defecto
org_name            = "felipecorp"                        # Defecto
project_name        = "bodegatech"                        # Defecto
environment         = "dev"                               # dev|staging|prod
webp_quality        = 80                                  # 1-100, defecto 80
sns_topic_arn       = "arn:aws:sns:..."                   # Para alertas por email
```

### Ejemplo de `terraform.tfvars`

```hcl
region              = "us-east-1"
org_name            = "felipecorp"
project_name        = "bodegatech"
environment         = "dev"
backend_api_url     = "http://localhost:8080"
internal_api_key    = "super-secret-key-123"
webp_quality        = 80
sns_topic_arn       = ""  # Agregar para recibir alertas
```

## 🚀 Deployment

### 1. Inicializar Terraform

```bash
cd terraform
terraform init
```

### 2. Planificar cambios

```bash
terraform plan -out=tfplan
```

### 3. Aplicar cambios

```bash
terraform apply tfplan
```

### 4. Obtener outputs

```bash
terraform output
```

## 📊 Monitoreo

### Ver logs de la Lambda

```bash
# En tiempo real
aws logs tail /aws/lambda/bodegatech-dev-product-image-processor --follow

# Últimos 100 eventos
aws logs tail /aws/lambda/bodegatech-dev-product-image-processor --max-items 100
```

### Ver métricas en CloudWatch

```bash
# Éxitos de procesamiento
aws cloudwatch get-metric-statistics \
  --namespace BodegaTech/ImageProcessing \
  --metric-name ProcessedImagesSuccess \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Sum

# Errores de procesamiento
aws cloudwatch get-metric-statistics \
  --namespace BodegaTech/ImageProcessing \
  --metric-name ProcessedImagesError \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

### Ver mensajes en DLQ

```bash
aws sqs receive-message \
  --queue-url $(terraform output -raw sqs_dlq_url) \
  --max-number-of-messages 10 \
  --attribute-names All
```

## 🔄 Flujo de procesamiento

### Paso 1: Frontend sube imagen original a S3 (presigned URL)

```
POST /presigned-urls
Frontend → S3 (img-{uuid}-original.png)
```

### Paso 2: S3 dispara evento a SQS

```
S3 Event: ObjectCreated:* en /products/*
→ SQS Queue (image_processing_queue)
```

### Paso 3: Lambda procesa imagen

```
SQS Message → Lambda Handler
  1. Descarga img-{uuid}-original.png
  2. Genera img-{uuid}-thumb.webp (200x200)
  3. Genera img-{uuid}-medium.webp (800x800)
  4. Sube ambas a S3
  5. Notifica Backend vía PATCH /product-images/{uuid}/processed
```

### Paso 4: Backend actualiza BD

```
PATCH /product-images/{imageId}/processed
Headers: X-Internal-Api-Key: {internal_api_key}
Body: {
  "thumbnailKey": "products/123/img-uuid-thumb.webp",
  "mediumKey": "products/123/img-uuid-medium.webp",
  "status": "READY"
}
```

### Paso 5: Si hay error

- Lambda falla → SQS reintenta (maxReceiveCount=3)
- Después de 3 reintentos → Mensaje va a DLQ
- CloudWatch Alarm se dispara → Email/SNS

## 🐛 Troubleshooting

### Lambda no se ejecuta

**Síntoma**: No hay logs en CloudWatch

**Solución**:
```bash
# Verificar que la Lambda tenga trigger de SQS
aws lambda list-event-source-mappings \
  --function-name bodegatech-dev-product-image-processor

# Verificar que SQS tenga mensajes
aws sqs get-queue-attributes \
  --queue-url $(terraform output -raw sqs_queue_url) \
  --attribute-names ApproximateNumberOfMessages
```

### Mensajes en DLQ

**Síntoma**: Imágenes no se procesan, hay mensajes en DLQ

**Solución**:
```bash
# Ver contenido de un mensaje
aws sqs receive-message \
  --queue-url $(terraform output -raw sqs_dlq_url) \
  --max-number-of-messages 1

# Depurar: Revisar logs de errores
aws logs filter-log-events \
  --log-group-name /aws/lambda/bodegatech-dev-product-image-processor \
  --filter-pattern "ERROR" \
  --start-time $(($(date +%s) * 1000 - 3600000))
```

### Lambda timeout

**Síntoma**: Error "Task timed out" después de 60 segundos

**Solución**:
- Aumentar `timeout` en `maint.tf` (máximo 900s)
- Reducir `webp_quality` para comprimir más rápido
- Verificar conexión de red a S3/Backend

## 📝 Variables de entorno Lambda

| Variable | Descripción | Origen |
|---|---|---|
| `API_URL` | URL del backend Spring Boot | variable |
| `API_KEY` | Clave secreta para header `X-Internal-Api-Key` | variable |
| `S3_BUCKET` | Nombre del bucket S3 | auto |
| `NODE_ENV` | Entorno (dev/staging/prod) | variable |
| `WEBP_QUALITY` | Calidad WebP 1-100 | variable (defecto 80) |

## 🔐 Seguridad

- ✅ S3 bucket no permite acceso público de escritura (solo lectura en `/products/*`)
- ✅ Lambda tiene permisos mínimos (IAM principle of least privilege)
- ✅ Webhook del Backend se autentifica con header `X-Internal-Api-Key`
- ✅ Mensajes fallidos se auditan en DLQ
- ✅ Logs se retienen solo 14 días

## 💰 Costos estimados (mes)

| Recurso | Estimación | Notas |
|---|---|---|
| S3 Storage | $0.50 | 100 imágenes/día × 3 versiones × 30 días × tamaño promedio |
| S3 Requests | $0.10 | PUTs y GETs |
| SQS | $0.10 | ~3K mensajes/mes con long polling |
| Lambda | $0.50 | ~3K invocaciones × 1GB × 30s promedio |
| CloudWatch | $2.00 | Logs + métricas + alarms |
| **Total** | **~$3.20** | Proyecto pequeño (100-200 imágenes/día) |

## 📚 Referencias

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS SQS Documentation](https://docs.aws.amazon.com/sqs/)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/)

---

**Última actualización**: Mayo 2024
**Mantenedor**: BodegaTech Team
