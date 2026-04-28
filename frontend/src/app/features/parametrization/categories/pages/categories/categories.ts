import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, type TemplateRef, ViewChild } from '@angular/core';
import type { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '../../../../../core/models/category.models';
import { DataTable, type DataTableColumn } from '../../../../../shared/components/data-table/data-table';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { ModalService } from '../../../../../shared/services/modal.service';
import { CategoryStateService } from '../../state/category-state.service';

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

  formName = signal('');
  formDescription = signal('');
  nameTouched = signal(false);
  descriptionTouched = signal(false);
  selectedCategory = signal<CategoryDto | null>(null);

  nameError = computed((): string | null => {
    if (!this.nameTouched()) return null;
    const val = this.formName().trim();
    if (!val) return 'El nombre es obligatorio';
    if (val.length < 2) return 'Mínimo 2 caracteres';
    if (val.length > 100) return 'Máximo 100 caracteres';
    return null;
  });

  descriptionError = computed((): string | null => {
    if (!this.descriptionTouched()) return null;
    const val = this.formDescription().trim();
    if (val.length > 500) return 'Máximo 500 caracteres';
    return null;
  });

  hasClientErrors = computed(() => {
    const name = this.formName().trim();
    if (!name || name.length < 2 || name.length > 100) return true;
    if (this.formDescription().trim().length > 500) return true;
    return false;
  });

  isFormValid = computed(() => this.formName().trim().length > 0);

  tableColumns: DataTableColumn[] = [
    { key: 'name', label: 'Nombre', type: 'text', align: 'left' },
    { key: 'description', label: 'Descripción', type: 'text', align: 'left' },
    { key: 'isActive', label: 'Estado', type: 'badge', align: 'center' },
    { key: 'createdAt', label: 'Creado', type: 'date', align: 'center' },
    { key: 'actions', label: 'Acciones', type: 'actions', align: 'center' },
  ];

  constructor() {
    effect(() => {
      if (this.state.operationSuccess() > 0) {
        this.modalService.close();
      }
    });

    effect(() => {
      if (!this.modalService.isOpen()) {
        this.state.clearErrors();
        this.formName.set('');
        this.formDescription.set('');
        this.selectedCategory.set(null);
        this.nameTouched.set(false);
        this.descriptionTouched.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.state.loadCategories(0, this.state.pageSize());
  }

  private markAllTouched(): void {
    this.nameTouched.set(true);
    this.descriptionTouched.set(true);
  }

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

  confirmCreateCategory(): false | void {
    this.markAllTouched();

    if (this.hasClientErrors()) {
      return false;
    }

    const request: CreateCategoryRequest = {
      name: this.formName(),
      description: this.formDescription() || undefined,
    };

    this.state.createCategory(request);
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

  confirmEditCategory(): false | void {
    this.markAllTouched();

    if (this.hasClientErrors() || !this.selectedCategory()) {
      return false;
    }

    const request: UpdateCategoryRequest = {
      name: this.formName(),
      description: this.formDescription() || undefined,
    };

    this.state.updateCategory(this.selectedCategory()!.id, request);
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
  }

  onPageChange(newPage: number): void {
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

  getCurrentPageForDataTable(): number {
    return this.state.currentPage() + 1;
  }
}
