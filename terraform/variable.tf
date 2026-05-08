variable "region" {
  type        = string
  default     = "us-east-1"
  description = "Región de AWS donde se crearán los recursos"
}

variable "org_name" {
  type        = string
  default     = "felipecorp"
  description = "Nombre de la organización a la que pertenecen los recursos"
}

variable "project_name" {
  type        = string
  default     = "bodegatech"
  description = "Nombre del proyecto al que pertenecen los recursos"
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Entorno donde se desplegarán los recursos (dev, staging, prod)"
}

variable "backend_api_url" {
  type        = string
  description = "URL del backend Spring Boot al que la Lambda enviará las imágenes procesadas"
}

variable "internal_api_key" {
  type        = string
  description = "Clave secreta para que la Lambda se autentique con el backend Spring Boot"
}

variable "webp_quality" {
  type        = number
  default     = 80
  description = "Calidad de compresión WebP para thumbnails y medium (1-100). Mayor = mejor calidad pero mayor tamaño"

  validation {
    condition     = var.webp_quality >= 1 && var.webp_quality <= 100
    error_message = "webp_quality debe estar entre 1 y 100"
  }
}

variable "sns_topic_arn" {
  type        = string
  default     = ""
  description = "ARN del topic SNS para recibir notificaciones de alarms (opcional)"
}