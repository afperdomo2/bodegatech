import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, type TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryStateService } from '../../state/category-state.service';
import { ModalService } from '../../../../../shared/services/modal.service';
import type { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '../../../../../core/models/category.models';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { DataTable, type DataTableColumn } from '../../../../../shared/components/data-table/data-table';

@Component({
  selector: 'bt-categories',
  standalone: true,
  imports: [
    CommonModule,
    PageHeader,
    DataTable,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoriesComponent implements OnInit {
  protected state = inject(CategoryStateService);
  protected modalService = inject(ModalService);

  @ViewChild('createModalTemplate') createModalTemplate!: TemplateRef<Record<string, never>>;
  @ViewChild('editModalTemplate') editModalTemplate!: TemplateRef<Record<string, never>>;
  @ViewChild('deleteModalTemplate') deleteModalTemplate!: TemplateRef<Record<string, never>>;

  // ========== ESTADO DEL FORMULARIO (SIGNALS) ==========
  formName = signal('');
  formDescription = signal('');

  // ========== CATEGORÍA SELECCIONADA PARA EDICIÓN/ELIMINACIÓN ==========
  selectedCategory = signal<CategoryDto | null>(null);

  // ========== COMPUTED ==========
  isFormValid = computed(() => this.formName().trim().length > 0);

  // Columnas de la tabla (convertidas a DataTableColumn del shared component)
  tableColumns: DataTableColumn[] = [
    { key: 'name', label: 'Nombre', type: 'text', align: 'left' },
    { key: 'description', label: 'Descripción', type: 'text', align: 'left' },
    { key: 'isActive', label: 'Estado', type: 'badge', align: 'center' },
    { key: 'createdAt', label: 'Creado', type: 'date', align: 'center' },
    { key: 'actions', label: 'Acciones', type: 'actions', align: 'center' },
  ];

  constructor() {
    // Limpiar errores cuando se cierre el modal
    effect(() => {
      if (!this.modalService.isOpen()) {
        this.state.clearErrors();
        this.formName.set('');
        this.formDescription.set('');
        this.selectedCategory.set(null);
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
    this.modalService.open({
      title: 'Nueva Categoría',
      template: this.createModalTemplate,
      size: 'md',
      onConfirm: () => this.confirmCreateCategory(),
      onCancel: () => {},
    });
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
      if (!this.state.fieldErrors()['name'] && !this.state.generalError()) {
        this.modalService.close();
      }
    }, { allowSignalWrites: true });
  }

  openEditModal(category: CategoryDto): void {
    this.selectedCategory.set(category);
    this.formName.set(category.name);
    this.formDescription.set(category.description || '');
    this.modalService.open({
      title: 'Editar Categoría',
      template: this.editModalTemplate,
      size: 'md',
      onConfirm: () => this.confirmEditCategory(),
      onCancel: () => {},
    });
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
      if (!this.state.fieldErrors()['name'] && !this.state.generalError()) {
        this.modalService.close();
      }
    }, { allowSignalWrites: true });
  }

  openDeleteModal(category: CategoryDto): void {
    this.selectedCategory.set(category);
    this.modalService.open({
      title: 'Eliminar Categoría',
      template: this.deleteModalTemplate,
      size: 'md',
      onConfirm: () => this.confirmDeleteCategory(),
      onCancel: () => {},
    });
  }

  confirmDeleteCategory(): void {
    if (!this.selectedCategory()) return;
    this.state.deleteCategory(this.selectedCategory()!.id);

    // Cerrar modal cuando se complete (sin errores)
    effect(() => {
      if (!this.state.generalError()) {
        this.modalService.close();
      }
    }, { allowSignalWrites: true });
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
