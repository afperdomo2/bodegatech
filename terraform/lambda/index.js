import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import {
  CloudWatchClient,
  PutMetricDataCommand,
} from "@aws-sdk/client-cloudwatch";
import sharp from "sharp";

const s3 = new S3Client();
const cloudwatch = new CloudWatchClient();
const { API_URL, API_KEY, WEBP_QUALITY = "80", AWS_LAMBDA_FUNCTION_NAME } = process.env;
const WEBP_QUALITY_INT = parseInt(WEBP_QUALITY);

export const handler = async (event) => {
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  for (const record of event.Records) {
    try {
      // 1. Validar y extraer datos del mensaje de SQS
      const s3Event = parseAndValidateSqsMessage(record.body);
      if (!s3Event) {
        console.warn("⚠️ SQS message inválido, omitiendo:", record.body);
        continue;
      }

      const bucket = s3Event.Records[0].s3.bucket.name;
      const originalKey = s3Event.Records[0].s3.object.key;

      // 2. Deducir IDs y rutas (img-UUID-original.png o .jpg)
      // Usamos regex para extraer el ID de la imagen del nombre del archivo
      const match = originalKey.match(/img-(.*)-original\.(png|jpg|jpeg)/i);
       if (!match) {
         console.warn(`⚠️ Archivo no coincide con patrón: ${originalKey}`);
         continue;
       }

      const imageId = match[1];
      const baseFolder = originalKey.substring(
        0,
        originalKey.lastIndexOf("/") + 1,
      );

      console.log(`🖼️ Procesando imagen: imageId=${imageId}, originalKey=${originalKey}`);

      // 3. Descargar imagen original desde S3
      let inputBuffer;
      try {
        const response = await s3.send(
          new GetObjectCommand({ Bucket: bucket, Key: originalKey }),
        );
        const stream = response.Body;
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        inputBuffer = Buffer.concat(chunks);
         console.debug(`⬇️ Imagen descargada de S3: ${inputBuffer.length} bytes`);
       } catch (s3Error) {
         throw {
           type: "S3FetchError",
           message: `❌ Error descargando de S3: ${s3Error.message}`,
           originalKey,
         };
       }

      // 4. Procesar versiones con Sharp (Convertir a WebP para optimizar)
      const sizes = [
        { suffix: "thumb", width: 200 },
        { suffix: "medium", width: 800 },
      ];

      const results = {};

       for (const size of sizes) {
         try {
           console.debug(`🔧 Redimensionando ${size.suffix}: width=${size.width}`);
          const buffer = await sharp(inputBuffer)
            .resize({ width: size.width, withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY_INT })
            .toBuffer();

          const newKey = `${baseFolder}img-${imageId}-${size.suffix}.webp`;

          // Subir a S3
          try {
            await s3.send(
              new PutObjectCommand({
                Bucket: bucket,
                Key: newKey,
                Body: buffer,
                ContentType: "image/webp",
              }),
            );
             console.debug(`⬆️ ${size.suffix} subido a S3: ${newKey}`);
            results[`${size.suffix}Key`] = newKey; // Usar suffix + "Key"
           } catch (s3UploadError) {
             throw {
               type: "S3PutError",
               message: `❌ Error subiendo ${size.suffix} a S3: ${s3UploadError.message}`,
               newKey,
             };
           }
         } catch (sharpError) {
           throw {
             type: "SharpProcessingError",
             message: `❌ Error procesando con Sharp (${size.suffix}): ${sharpError.message}`,
             size: size.suffix,
           };
         }
      }

       // 5. Notificar al Backend de Spring Boot
       try {
         // TODO: Pendiente crear endpoint para implementar
         // await notifyBackend(imageId, results);
         console.log(`✅ [IMAGE_PROCESSED] imageId=${imageId}`);
         successCount++;
       } catch (backendError) {
         throw {
           type: "BackendNotificationError",
           message: `❌ ${backendError.message}`,
           imageId,
         };
       }
    } catch (error) {
      errorCount++;
      const errorType = error.type || "UnknownError";
      const errorMsg = error.message || JSON.stringify(error);
      console.error(`❌ [${errorType}] ${errorMsg}`);

      // Re-lanzar para que SQS lo mande a la DLQ si falla
      throw error;
    }
  }

  // Registrar métricas en CloudWatch
  await publishMetrics({
    successCount,
    errorCount,
    processingTime: Date.now() - startTime,
  });

  return {
    statusCode: 200,
    processed: successCount,
    failed: errorCount,
  };
};

/**
 * Valida y parsea el mensaje SQS.
 * @param {string} body - Body del mensaje SQS
 * @returns {Object|null} Evento S3 parseado o null si es inválido
 */
function parseAndValidateSqsMessage(body) {
  try {
    const s3Event = JSON.parse(body);

    // Validar estructura
     if (!s3Event.Records || !Array.isArray(s3Event.Records) || s3Event.Records.length === 0) {
       console.warn(`⚠️ SQS Records es vacío o no existe`);
       return null;
     }

     const record = s3Event.Records[0];
     if (!record.s3 || !record.s3.bucket || !record.s3.object) {
       console.warn(`⚠️ SQS estructura S3 inválida`);
       return null;
     }

    return s3Event;
   } catch (parseError) {
     console.error(`❌ Error parseando SQS message: ${parseError.message}`);
     return null;
   }
}

/**
 * Notifica al Backend sobre imágenes procesadas.
 * @param {string} imageId - ID de la imagen
 * @param {Object} data - Objeto con thumbnailKey y mediumKey
 */
async function notifyBackend(imageId, data) {
  const payload = {
    thumbnailKey: data.thumbKey,
    mediumKey: data.mediumKey,
    status: "READY",
  };

   console.debug(`📡 Enviando notificación al Backend: ${JSON.stringify(payload)}`);

  const response = await fetch(
    `${API_URL}/product-images/${imageId}/processed`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Api-Key": API_KEY,
      },
      body: JSON.stringify(payload),
    },
  );

   if (!response.ok) {
     const responseText = await response.text();
     throw new Error(
       `❌ Backend respondió con status ${response.status}: ${responseText}`,
     );
   }

   console.debug(`✅ Backend respondió exitosamente para imagen ${imageId}`);
}

/**
 * Publica métricas a CloudWatch.
 * @param {Object} metrics - Objeto con successCount, errorCount, processingTime
 */
async function publishMetrics(metrics) {
  try {
    await cloudwatch.send(
      new PutMetricDataCommand({
        Namespace: "BodegaTech/ImageProcessing",
        MetricData: [
          {
            MetricName: "ProcessedImagesSuccess",
            Value: metrics.successCount,
            Unit: "Count",
            Timestamp: new Date(),
          },
          {
            MetricName: "ProcessedImagesError",
            Value: metrics.errorCount,
            Unit: "Count",
            Timestamp: new Date(),
          },
          {
            MetricName: "ProcessingDurationMs",
            Value: metrics.processingTime,
            Unit: "Milliseconds",
            Timestamp: new Date(),
          },
        ],
      }),
    );
    console.debug("📊 Métricas publicadas a CloudWatch");
  } catch (metricsError) {
    console.warn(`⚠️ Error publicando métricas: ${metricsError.message}`);
    // No re-lanzar; las métricas son informativas, no críticas
  }
}
