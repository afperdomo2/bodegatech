import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
  inject,
  input,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { TemplateRef } from '@angular/core';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { ProductImageService } from '../../../../core/services/product-image.service';
import { ProductService } from '../../../../core/services/product.service';
import { ToastService } from '../../../../shared/services/toast.service';
import type { ProductImageDto } from '../../../../core/models/responses/product.responses';

/**
 * Estado de una imagen en el modal.
 * Puede ser una imagen nueva (con File) o una existente (solo metadata).
 */
interface ImageUploadItem {
  file?: File;                      // undefined si es imagen existente
  previewUrl: string;               // URL.createObjectURL() o URL pública
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  imageId?: string;                 // asignado tras confirm o desde BD
  uploadProgress: number;           // 0-100
  fileKey?: string;                 // asignado tras generar presigned URL
  isExisting?: boolean;             // true si viene del backend
}

/**
 * Componente dumb del modal de gestión de imágenes de producto.
 * 
 * Funcionalidades:
 * - Expone @ViewChild('imagesModalTemplate') para que el padre lo abra
 * - Zona de drag & drop para seleccionar/soltar imágenes nuevas
 * - Carga automática de imágenes existentes del producto
 * - Grid de thumbnails con estados (uploading, success, error)
 * - Máximo 10 imágenes por producto
 * - Flujo automático: preview → presigned URL → S3 upload → confirm
 * - Botón X de cierre manejado por el padre (ModalService)
 * 
 * Inputs:
 * - productId: ID del producto
 * - productName: nombre para mostrar en el título
 * 
 * API Pública:
 * - loadExistingImages() → cargar imágenes existentes del backend
 * - resetForm() → limpiar la lista de imágenes
 */
@Component({
  selector: 'bt-product-images-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <ng-template #imagesModalTemplate>
      <div class="space-y-6">
        <!-- Drag & Drop Zone -->
        <div
          class="rounded-lg border-2 border-dashed transition-colors"
          [class.border-primary]="!isDragOver()"
          [class.border-primary/50]="isDragOver()"
          [class.bg-primary/5]="isDragOver()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave()"
          (drop)="onDrop($event)"
          [class.opacity-50]="isAtLimit()"
          [class.cursor-not-allowed]="isAtLimit()"
        >
          <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
            <!-- Icon -->
            <div class="mb-3 text-4xl">📸</div>
            
            <!-- Text -->
            <p class="mb-1 font-medium text-text-primary">
              Arrastra imágenes aquí
            </p>
            <p class="mb-4 text-sm text-text-secondary">
              o haz clic para seleccionar
            </p>

            <!-- Specifications -->
            <p class="text-xs text-text-secondary/70">
              JPG, PNG, WEBP • Máx. 5 MB por imagen • Máx. 10 imágenes
            </p>

            <!-- Hidden file input -->
            <input
              #fileInput
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              (change)="onFileInputChange($event)"
              [disabled]="isAtLimit()"
            />

            <!-- Click to select button -->
            @if (!isAtLimit()) {
              <button
                type="button"
                class="mt-4 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                (click)="fileInput.click()"
              >
                Seleccionar imágenes
              </button>
            }

            <!-- At limit message -->
            @if (isAtLimit()) {
              <p class="mt-4 text-xs font-medium text-warning">
                Máximo de imágenes alcanzado (10)
              </p>
            }
          </div>
        </div>

        <!-- Loading existing images -->
        @if (isLoadingExistingImages()) {
          <div class="flex items-center justify-center py-8">
            <div class="flex flex-col items-center gap-2">
              <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p class="text-xs text-text-secondary">Cargando imágenes guardadas...</p>
            </div>
          </div>
        }

        <!-- Images Grid -->
        @if (uploadItems().length > 0) {
          <div class="space-y-4">
            <h3 class="font-medium text-text-primary">
              {{ uploadItems().length }} imagen(es)
            </h3>

            <div class="grid grid-cols-3 gap-4">
              @for (item of uploadItems(); track item.previewUrl) {
                <div class="relative flex flex-col items-center rounded-lg border border-surface-dim bg-surface-dim/50 overflow-hidden">
                  <!-- Thumbnail Preview -->
                  <img
                    [src]="item.previewUrl"
                    alt="imagen"
                    class="h-32 w-full object-cover"
                  />

                  <!-- Overlay por estado (solo uploading y error) -->
                  <div class="absolute inset-0 flex items-center justify-center">
                    @switch (item.status) {
                      <!-- Uploading: Spinner + Progress -->
                      @case ('uploading') {
                        <div class="flex flex-col items-center gap-2 bg-black/50 rounded">
                          <div class="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span class="text-xs font-medium text-white">
                            {{ item.uploadProgress }}%
                          </span>
                        </div>
                      }
                      <!-- Error: Red X -->
                      @case ('error') {
                        <div class="flex items-center justify-center">
                          <div
                            class="flex h-12 w-12 items-center justify-center rounded-full bg-error/90"
                          >
                            <span class="text-xl">✕</span>
                          </div>
                        </div>
                      }
                    }
                  </div>

                  <!-- Footer: Filename + Actions -->
                  <div class="w-full border-t border-surface-dim/50 bg-surface-container p-2">
                    <!-- Filename -->
                    <p class="mb-2 truncate text-xs font-medium text-text-primary text-center">
                      {{ item.file?.name ?? 'Imagen guardada' }}
                    </p>

                    <!-- Error message (if applicable) -->
                    @if (item.status === 'error' && item.errorMessage) {
                      <p class="mb-2 text-xs text-error text-center line-clamp-2">
                        {{ item.errorMessage }}
                      </p>
                    }

                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Empty state -->
        @if (uploadItems().length === 0 && !isLoadingExistingImages()) {
          <div class="rounded-lg border border-surface-dim bg-surface-dim/30 px-6 py-8 text-center">
            <p class="text-sm text-text-secondary">
              No hay imágenes. Arrastra o selecciona imágenes para comenzar.
            </p>
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class ProductImagesModalComponent {
  @ViewChild('imagesModalTemplate') imagesModalTemplate!: TemplateRef<unknown>;

  private imageService = inject(ProductImageService);
  private productService = inject(ProductService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  // Inputs
  productId = input.required<string>();
  productName = input.required<string>();

  // State
  uploadItems = signal<ImageUploadItem[]>([]);
  isDragOver = signal(false);
  isLoadingExistingImages = signal(false);
  itemPendingDelete = signal<string | null>(null); // previewUrl del item siendo eliminado
  previewItem = signal<ImageUploadItem | null>(null); // item en vista previa

  // Computed
  isAtLimit = computed(() => this.uploadItems().length >= 10);

  /**
   * Cargar imágenes existentes del producto desde el backend.
   * Llamado por el padre cuando abre la modal.
   * @param productId - ID del producto a cargar (si no se proporciona, usa el del input signal)
   */
  loadExistingImages(productId?: string): void {
    const id = productId ?? this.productId();
    this.isLoadingExistingImages.set(true);

    this.productService.getById(id).subscribe({
      next: (response) => {
        const images = response.data.images || [];
        const existingItems: ImageUploadItem[] = images.map((img: ProductImageDto) => ({
          previewUrl: img.url,
          status: 'success' as const,
          imageId: img.id,
          fileKey: img.fileKey,
          uploadProgress: 100,
          isExisting: true,
        }));

        this.uploadItems.set(existingItems);
        this.isLoadingExistingImages.set(false);
      },
      error: (error) => {
        const msg =
          error instanceof HttpErrorResponse
            ? error.error?.detail || error.message
            : 'Error al cargar imágenes';
        this.toast.error(msg);
        this.isLoadingExistingImages.set(false);
      },
    });
  }

  /**
   * Manejar drag over en la zona de drop.
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isAtLimit()) {
      this.isDragOver.set(true);
    }
  }

  /**
   * Manejar drag leave.
   */
  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  /**
   * Manejar drop de archivos.
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  /**
   * Manejar cambio de input de archivo.
   */
  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
    // Limpiar input para permitir seleccionar el mismo archivo otra vez
    input.value = '';
  }

  /**
   * Procesar archivos: validar y crear items de subida.
   * Iniciar upload automáticamente.
   */
  private handleFiles(files: File[]): void {
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const currentItems = this.uploadItems();
    const remainingSlots = 10 - currentItems.length;

    const filesToProcess = files.slice(0, remainingSlots);

    for (const file of filesToProcess) {
      // Validar tipo de archivo
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.toast.error(`${file.name} no es una imagen válida (JPG, PNG, WEBP)`);
        continue;
      }

      // Validar tamaño
      if (file.size > maxSizeBytes) {
        this.toast.error(
          `${file.name} excede el tamaño máximo de ${maxSizeMB} MB`
        );
        continue;
      }

      // Crear item de subida
      const previewUrl = URL.createObjectURL(file);
      const item: ImageUploadItem = {
        file,
        previewUrl,
        status: 'pending',
        uploadProgress: 0,
        isExisting: false,
      };

      this.uploadItems.update((items) => [...items, item]);

      // Iniciar upload automáticamente
      this.uploadImage(item);
    }
  }

  /**
   * Subir una imagen: generar presigned URL → PUT a S3 → confirm en BD.
   */
  private uploadImage(item: ImageUploadItem): void {
    // Saltar si es imagen existente (sin File)
    if (!item.file) return;
    
    // En este punto, TypeScript sabe que item.file es File (no undefined)
    const file = item.file;
    const productId = this.productId();
    const itemPreviewUrl = item.previewUrl; // Usar previewUrl como identificador único

    // 1. Generar presigned URL
    this.imageService
      .generatePresignedUrls(productId, [file.name])
      .subscribe({
        next: (response) => {
          const presignedData = response.data[0];
          if (!presignedData) {
            this.updateItemStatusByPreviewUrl(itemPreviewUrl, 'error', 'No se recibió URL pre-firmada');
            return;
          }

          // Guardar fileKey para confirmar después
          const uploadUrl = presignedData.uploadUrl;

          // 2. Subir a S3
          this.uploadItems.update((items) =>
            items.map((i) =>
              i.previewUrl === itemPreviewUrl ? { ...i, status: 'uploading' as const } : i
            )
          );

          this.imageService.uploadToS3(uploadUrl, file).subscribe({
            next: (event) => {
              if (event.type === HttpEventType.UploadProgress && event.total) {
                // Actualizar barra de progreso
                const progress = Math.round((event.loaded / event.total) * 100);
                this.uploadItems.update((items) =>
                  items.map((i) =>
                    i.previewUrl === itemPreviewUrl ? { ...i, uploadProgress: progress } : i
                  )
                );
              } else if (event.type === HttpEventType.Response) {
                // S3 upload exitoso → confirmar en BD
                // AWS S3 devuelve 200 OK sin body — HttpEventType.Response se emite al completar
                if (presignedData.fileKey) {
                  this.confirmUploadInBackend(itemPreviewUrl, presignedData.fileKey);
                }
              }
            },
            error: (error) => {
              const msg =
                error instanceof HttpErrorResponse
                  ? error.message
                  : 'Error en subida a S3';
              this.updateItemStatusByPreviewUrl(itemPreviewUrl, 'error', msg);
            },
          });
        },
        error: (error) => {
          const msg =
            error instanceof HttpErrorResponse
              ? error.error?.detail || error.message
              : 'Error al generar URL pre-firmada';
          this.updateItemStatusByPreviewUrl(itemPreviewUrl, 'error', msg);
        },
      });
  }

  /**
   * Confirmar la subida en el backend (crear registro en BD).
   */
  private confirmUploadInBackend(
    itemPreviewUrl: string,
    fileKey: string
  ): void {
    const productId = this.productId();

    this.imageService.confirmImages(productId, [fileKey]).subscribe({
      next: (response) => {
        const imageDto = response.data[0];
        if (imageDto) {
          this.uploadItems.update((items) =>
            items.map((i) =>
              i.previewUrl === itemPreviewUrl
                ? { ...i, imageId: imageDto.id, fileKey }
                : i
            )
          );
          this.updateItemStatusByPreviewUrl(itemPreviewUrl, 'success');
          this.getItemByPreviewUrl(itemPreviewUrl)?.file &&
            this.toast.success(`${this.getItemByPreviewUrl(itemPreviewUrl)?.file?.name} subida exitosamente`);
        }
      },
      error: (error) => {
        const msg =
          error instanceof HttpErrorResponse
            ? error.error?.detail || error.message
            : 'Error al confirmar imagen';
        this.updateItemStatusByPreviewUrl(itemPreviewUrl, 'error', msg);
      },
    });
  }

  /**
   * Actualizar el estado de un item de imagen por previewUrl.
   */
  private updateItemStatusByPreviewUrl(
    previewUrl: string,
    status: 'success' | 'error',
    errorMessage?: string
  ): void {
    this.uploadItems.update((items) =>
      items.map((i) =>
        i.previewUrl === previewUrl
          ? {
              ...i,
              status,
              errorMessage:
                errorMessage ||
                (status === 'success' ? undefined : 'Error desconocido'),
              uploadProgress: status === 'success' ? 100 : i.uploadProgress,
            }
          : i
      )
    );
  }

  /**
   * Obtener un item por previewUrl.
   */
  private getItemByPreviewUrl(previewUrl: string): ImageUploadItem | undefined {
    return this.uploadItems().find((i) => i.previewUrl === previewUrl);
  }

  /**
   * Actualizar el estado de un item de imagen.
   */
  private updateItemStatus(
    item: ImageUploadItem,
    status: 'success' | 'error',
    errorMessage?: string
  ): void {
    this.uploadItems.update((items) =>
      items.map((i) =>
        i === item
          ? {
              ...i,
              status,
              errorMessage:
                errorMessage ||
                (status === 'success' ? undefined : 'Error desconocido'),
              uploadProgress: status === 'success' ? 100 : i.uploadProgress,
            }
          : i
      )
    );
  }

  /**
   * Reintentar subida de una imagen que falló.
   */
  retryUpload(item: ImageUploadItem): void {
    this.uploadItems.update((items) =>
      items.map((i) =>
        i.previewUrl === item.previewUrl
          ? { ...i, status: 'pending' as const, uploadProgress: 0 }
          : i
      )
    );
    this.uploadImage(item);
  }

  /**
   * Verificar si un item está pendiente de eliminación.
   * Método helper para el template con OnPush change detection.
   */
  isItemPendingDelete(previewUrl: string): boolean {
    return this.itemPendingDelete() === previewUrl;
  }

  /**
   * Abrir vista previa de una imagen (lightbox).
   * Dispara change detection para asegurar que el lightbox sea visible.
   */
  openPreview(item: ImageUploadItem): void {
    this.previewItem.set(item);
    this.cdr.detectChanges();
  }

  /**
   * Mostrar confirmación inline para eliminar una imagen.
   */
  confirmDeleteImage(item: ImageUploadItem): void {
    this.itemPendingDelete.set(item.previewUrl);
    this.cdr.markForCheck();
  }

  /**
   * Cancelar la eliminación.
   */
  cancelDeleteImage(): void {
    this.itemPendingDelete.set(null);
    this.cdr.markForCheck();
  }

  /**
   * Eliminar una imagen de la lista (no del backend si ya fue subida).
   * Si está en BD (tiene imageId), llamar al deleteImage endpoint.
   */
  removeImage(item: ImageUploadItem): void {
    const productId = this.productId();

    // Si la imagen ya fue confirmada en BD (tiene imageId), eliminarla también del backend
    if (item.imageId) {
      this.imageService.deleteImage(productId, item.imageId).subscribe({
        next: () => {
          this.uploadItems.update((items) =>
            items.filter((i) => i.previewUrl !== item.previewUrl)
          );
          URL.revokeObjectURL(item.previewUrl);
          this.toast.success(`Imagen eliminada`);
          this.itemPendingDelete.set(null);
        },
        error: (error) => {
          const msg =
            error instanceof HttpErrorResponse
              ? error.error?.detail || error.message
              : 'Error al eliminar imagen';
          this.toast.error(msg);
        },
      });
    } else {
      // Solo eliminar de la lista local
      this.uploadItems.update((items) =>
        items.filter((i) => i.previewUrl !== item.previewUrl)
      );
      URL.revokeObjectURL(item.previewUrl);
      this.itemPendingDelete.set(null);
    }
  }

  /**
   * Resetear el componente (limpiar lista de imágenes).
   * Llamado por el padre al cerrar el modal.
   */
  resetForm(): void {
    // Liberar URLs de objetos locales
    this.uploadItems().forEach((item) => {
      if (item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    this.uploadItems.set([]);
    this.isLoadingExistingImages.set(false);
  }
}
