import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryStateService } from '../../state/category-state.service';
import type { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '../../../../../core/models/category.models';
import { Modal } from '../../../../../shared/components/modal/modal';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { Badge } from '../../../../../shared/components/badge/badge';

interface DataTableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'status' | 'actions';
}

@Component({
  selector: 'bt-categories',
  standalone: true,
  imports: [
    CommonModule,
    Modal,
    PageHeader,
    Badge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoriesComponent implements OnInit {
  protected state = inject(CategoryStateService);
  protected Math = Math;

  // ========== ESTADO DE MODALES ==========
  isCreateModalOpen = signal(false);
  isEditModalOpen = signal(false);
  isDeleteModalOpen = signal(false);

  // ========== ESTADO DEL FORMULARIO (SIGNALS) ==========
  formName = signal('');
  formDescription = signal('');

  // ========== CATEGORÍA SELECCIONADA PARA EDICIÓN/ELIMINACIÓN ==========
  selectedCategory = signal<CategoryDto | null>(null);

  // ========== COMPUTED ==========
  isFormValid = computed(() => this.formName().trim().length > 0);
  isFormEmpty = computed(() => this.formName().trim().length === 0 && this.formDescription().trim().length === 0);

  // Columnas de la tabla
  tableColumns: DataTableColumn[] = [
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'description', label: 'Descripción', type: 'text' },
    { key: 'isActive', label: 'Estado', type: 'status' },
    { key: 'createdAt', label: 'Creado', type: 'date' },
    { key: 'actions', label: 'Acciones', type: 'actions' },
  ];

  constructor() {
    // Limpiar errores cuando se cierre cualquier modal
    effect(() => {
      const isAnyModalOpen = this.isCreateModalOpen() || this.isEditModalOpen() || this.isDeleteModalOpen();
      if (!isAnyModalOpen) {
        this.state.clearErrors();
        this.formName.set('');
        this.formDescription.set('');
      }
    });
  }

  ngOnInit(): void {
    // Cargar categorías al inicializar
    this.state.loadCategories(0, this.state.pageSize());
  }

  // ========== ACCIONES DE MODALES ==========

  openCreateModal(): void {
    this.formName.set('');
    this.formDescription.set('');
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  confirmCreateCategory(): void {
    if (!this.isFormValid()) return;

    const request: CreateCategoryRequest = {
      name: this.formName(),
      description: this.formDescription() || undefined,
    };

    this.state.createCategory(request);

    // Cerrar modal cuando se complete (sin errores de validación)
    effect(() => {
      if (!this.state.fieldErrors()['name'] && !this.state.generalError() && this.isCreateModalOpen()) {
        this.isCreateModalOpen.set(false);
      }
    });
  }

  openEditModal(category: CategoryDto): void {
    this.selectedCategory.set(category);
    this.formName.set(category.name);
    this.formDescription.set(category.description || '');
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.selectedCategory.set(null);
  }

  confirmEditCategory(): void {
    if (!this.isFormValid() || !this.selectedCategory()) return;

    const request: UpdateCategoryRequest = {
      name: this.formName(),
      description: this.formDescription() || undefined,
    };

    this.state.updateCategory(this.selectedCategory()!.id, request);

    // Cerrar modal cuando se complete (sin errores de validación)
    effect(() => {
      if (!this.state.fieldErrors()['name'] && !this.state.generalError() && this.isEditModalOpen()) {
        this.isEditModalOpen.set(false);
      }
    });
  }

  openDeleteModal(category: CategoryDto): void {
    this.selectedCategory.set(category);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedCategory.set(null);
  }

  confirmDeleteCategory(): void {
    if (!this.selectedCategory()) return;
    this.state.deleteCategory(this.selectedCategory()!.id);

    // Cerrar modal cuando se complete (sin errores)
    effect(() => {
      if (!this.state.generalError() && this.isDeleteModalOpen()) {
        this.isDeleteModalOpen.set(false);
      }
    });
  }

  // ========== ACCIONES DE TABLA ==========

  onPageChange(newPage: number): void {
    this.state.loadCategories(newPage, this.state.pageSize());
  }

  // ========== HELPERS ==========

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getStatusBadgeVariant(isActive: boolean): 'success' | 'warning' | 'error' | 'info' {
    return isActive ? 'success' : 'warning';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Activa' : 'Inactiva';
  }
}
