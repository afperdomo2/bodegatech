import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api';
import type { ProductImageDto } from '../models/responses/product.responses';
import type { ApiResponse } from '../models/api.models';

interface PresignedUrlDto {
  imageId: string;
  fileName: string;
  fileKey: string;
  uploadUrl: string;
}

interface PresignedUrlRequest {
  fileNames: string[];
}

interface ConfirmImageItem {
  imageId: string;
  fileKey: string;
}

interface ConfirmImagesRequest {
  items: ConfirmImageItem[];
}

/**
 * Servicio HTTP puro para gestión de imágenes de productos.
 * Maneja comunicación con endpoints de imágenes — sin estado, sin signals.
 *
/**
 * Flujo típico:
   * 1. generatePresignedUrls() → obtiene URLs pre-firmadas
   * 2. uploadToS3() → sube el archivo directamente a S3
   * 3. confirmImages() → confirma la subida en el backend
   * 4. setMainImage() → establece una imagen como principal
   * 5. deleteImage() → elimina la imagen (BD + S3)
   */
@Injectable({
  providedIn: 'root',
})
export class ProductImageService {
  private api = inject(ApiService);
  private http = inject(HttpClient);

  /**
   * Generar URLs pre-firmadas para subida de imágenes a S3.
   * POST /api/products/{productId}/images/presigned
   *
   * @param productId ID del producto
   * @param fileNames array de nombres de archivos
   * @returns Observable con array de PresignedUrlDto
   */
  generatePresignedUrls(productId: string, fileNames: string[]) {
    const request: PresignedUrlRequest = { fileNames };
    return this.api.post<ApiResponse<PresignedUrlDto[]>>(
      `/products/${productId}/images/presigned`,
      request
    );
  }

  /**
   * Subir un archivo directamente a S3 usando una presigned URL.
   * PUT {uploadUrl} con Content-Type del archivo
   *
   * Nota: Este es un PUT directo a AWS S3, sin headers de auth de la API.
   * El uploadUrl ya contiene la autorización pre-firmada.
   *
   * @param uploadUrl URL pre-firmada de S3
   * @param file archivo a subir
   * @returns Observable del progreso/resultado del upload
   */
  uploadToS3(uploadUrl: string, file: File) {
    return this.http.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      reportProgress: true,
      observe: 'events',
    });
  }

  /**
   * Confirmar imágenes subidas (crear registros en BD).
   * POST /api/products/{productId}/images/confirm
   *
   * Llamar DESPUÉS de uploadToS3 exitoso.
   *
   * @param productId ID del producto
   * @param items array de items (imageId + fileKey) de las imágenes subidas
   * @returns Observable con array de ProductImageDto creados
   */
  confirmImages(productId: string, items: ConfirmImageItem[]) {
    const request: ConfirmImagesRequest = { items };
    return this.api.post<ApiResponse<ProductImageDto[]>>(
      `/products/${productId}/images/confirm`,
      request
    );
  }

  /**
   * Eliminar una imagen (BD + S3).
   * DELETE /api/products/{productId}/images/{imageId}
   *
   * @param productId ID del producto
   * @param imageId ID de la imagen a eliminar
   * @returns Observable void (204 No Content)
   */
  deleteImage(productId: string, imageId: string) {
    return this.api.delete<void>(
      `/products/${productId}/images/${imageId}`
    );
  }

  /**
   * Establecer una imagen como la principal del producto.
   * PATCH /api/products/{productId}/images/{imageId}/set-main
   *
   * @param productId ID del producto
   * @param imageId ID de la imagen a establecer como principal
   * @returns Observable void (204 No Content)
   */
  setMainImage(productId: string, imageId: string) {
    return this.api.patch<void>(
      `/products/${productId}/images/${imageId}/set-main`,
      {}
    );
  }
}
