import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryStateService } from '../../state/category-state.service';
import type { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '../../../../../core/models/category.models';
import { Modal } from '../../../../../shared/components/modal/modal';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { DataTable, type DataTableColumn } from '../../../../../shared/components/data-table/data-table';

@Component({
  selector: 'bt-categories',
  standalone: true,
  imports: [
    CommonModule,
    Modal,
    PageHeader,
    DataTable,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoriesComponent implements OnInit {
  protected state = inject(CategoryStateService);

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

  // Columnas de la tabla (convertidas a DataTableColumn del shared component)
  tableColumns: DataTableColumn[] = [
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'description', label: 'Descripción', type: 'text' },
    { key: 'isActive', label: 'Estado', type: 'badge' },
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
    // Convertir de 1-based (data-table) a 0-based (CategoryStateService)
    this.state.loadCategories(newPage - 1, this.state.pageSize());
  }

  onEditClick(category: unknown): void {
    this.openEditModal(category as CategoryDto);
  }

  onDeleteClick(category: unknown): void {
    this.openDeleteModal(category as CategoryDto);
  }

  refreshCategories(): void {
    this.state.loadCategories(this.state.currentPage(), this.state.pageSize());
  }

  // ========== HELPERS ==========

  getCurrentPageForDataTable(): number {
    // Convertir de 0-based (CategoryStateService) a 1-based (data-table)
    return this.state.currentPage() + 1;
  }
}
