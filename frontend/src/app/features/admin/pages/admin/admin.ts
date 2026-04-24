import type { TemplateRef} from '@angular/core';
import { Component, signal, ViewChild, inject } from '@angular/core';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import type { DataTableColumn } from '../../../../shared/components/data-table/data-table';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { Toggle } from '../../../../shared/components/toggle/toggle';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../../shared/services/modal.service';

export interface User {
  id: string;
  avatar: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Offline';
  lastActive: string;
  actions: string;
}

export interface UserFormModel {
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
}

@Component({
  selector: 'bt-admin',
  standalone: true,
  imports: [PageHeader, DataTable, Toggle, CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent {
  @ViewChild('createUserModal') createUserModal!: TemplateRef<unknown>;
  @ViewChild('editUserModal') editUserModal!: TemplateRef<unknown>;
  @ViewChild('deleteUserModal') deleteUserModal!: TemplateRef<unknown>;

  private modalService = inject(ModalService);

  users = signal<User[]>([
    {
      id: '1',
      avatar: 'A',
      name: 'Admin User',
      email: 'admin@bodegatech.com',
      role: 'Admin',
      status: 'Active',
      lastActive: '2024-04-23 14:30',
      actions: 'more_vert',
    },
    {
      id: '2',
      avatar: 'M',
      name: 'María García',
      email: 'maria@bodegatech.com',
      role: 'Editor',
      status: 'Active',
      lastActive: '2024-04-23 12:15',
      actions: 'more_vert',
    },
    {
      id: '3',
      avatar: 'J',
      name: 'Juan López',
      email: 'juan@bodegatech.com',
      role: 'Viewer',
      status: 'Offline',
      lastActive: '2024-04-22 18:45',
      actions: 'more_vert',
    },
    {
      id: '4',
      avatar: 'C',
      name: 'Carlos Mendez',
      email: 'carlos@bodegatech.com',
      role: 'Editor',
      status: 'Active',
      lastActive: '2024-04-23 11:20',
      actions: 'more_vert',
    },
  ]);

  // Form state for user modals
  userFormModel = signal<UserFormModel>({ name: '', email: '', role: 'Editor' });
  selectedUserId = signal<string | null>(null);
  formError = signal<string>('');

  usersColumns: DataTableColumn[] = [
    { key: 'name', label: 'Usuario', width: 'auto', align: 'left', type: 'text' },
    { key: 'role', label: 'Rol', width: '120px', align: 'left', type: 'status' },
    { key: 'status', label: 'Estado', width: '100px', align: 'left', type: 'text' },
    { key: 'lastActive', label: 'Último activo', width: '150px', align: 'left', type: 'text' },
    { key: 'actions', label: 'Acciones', width: '80px', align: 'center', type: 'actions' },
  ];

  // Settings state
  companyName = signal('BodegaTech Inc.');
  currency = signal('USD');
  emailNotifications = signal(true);
  smsNotifications = signal(false);

  // Data table event handlers
  onPageChange(page: number) {
    console.log('Page changed to:', page);
    // Server-side pagination would be implemented here
  }

  onUserEditClick(user: unknown) {
    const u = user as User;
    if (u && u.id) {
      this.selectedUserId.set(u.id);
      this.userFormModel.set({
        name: u.name,
        email: u.email,
        role: u.role,
      });
      this.formError.set('');
      this.modalService.open({
        title: 'Editar Usuario',
        template: this.editUserModal,
        size: 'md',
        onConfirm: () => this.onSaveUser('edit'),
        onCancel: () => this.resetUserForm(),
      });
    }
  }

  onUserDeleteClick(user: unknown) {
    const u = user as User;
    if (u && u.id) {
      this.selectedUserId.set(u.id);
      this.modalService.open({
        title: 'Confirmar eliminación',
        template: this.deleteUserModal,
        size: 'md',
        onConfirm: () => this.onConfirmDeleteUser(),
        onCancel: () => this.resetUserForm(),
      });
    }
  }

  onInviteUserClick() {
    this.resetUserForm();
    this.modalService.open({
      title: 'Invitar Usuario',
      template: this.createUserModal,
      size: 'md',
      onConfirm: () => this.onSaveUser('create'),
      onCancel: () => this.resetUserForm(),
    });
  }

  private onSaveUser(mode: 'create' | 'edit') {
    const form = this.userFormModel();
    
    // Basic validation
    if (!form.name.trim()) {
      this.formError.set('El nombre es requerido');
      return;
    }
    if (!form.email.trim() || !this.isValidEmail(form.email)) {
      this.formError.set('Email inválido');
      return;
    }

    if (mode === 'create') {
      const newUser: User = {
        id: Date.now().toString(),
        avatar: form.name.charAt(0).toUpperCase(),
        name: form.name,
        email: form.email,
        role: form.role,
        status: 'Active',
        lastActive: new Date().toLocaleString('es-ES'),
        actions: 'more_vert',
      };
      this.users.update(users => [...users, newUser]);
      console.log('User created:', newUser);
    } else if (mode === 'edit' && this.selectedUserId()) {
      this.users.update(users =>
        users.map(u =>
          u.id === this.selectedUserId()
            ? { ...u, name: form.name, email: form.email, role: form.role }
            : u
        )
      );
      console.log('User updated');
    }

    this.modalService.close();
    this.resetUserForm();
  }

  private onConfirmDeleteUser() {
    if (this.selectedUserId()) {
      this.users.update(users =>
        users.filter(u => u.id !== this.selectedUserId())
      );
      console.log('User deleted');
      this.modalService.close();
      this.resetUserForm();
    }
  }

  private resetUserForm() {
    this.userFormModel.set({ name: '', email: '', role: 'Editor' });
    this.selectedUserId.set(null);
    this.formError.set('');
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onCompanyNameChange(name: string) {
    this.companyName.set(name);
  }

  handleCurrencyChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.onCurrencyChange(value);
  }

  onCurrencyChange(currency: string) {
    this.currency.set(currency);
  }

  onEmailToggle(checked: boolean) {
    this.emailNotifications.set(checked);
  }

  onSmsToggle(checked: boolean) {
    this.smsNotifications.set(checked);
  }

  onSaveConfiguration() {
    console.log('Saved configuration:', {
      companyName: this.companyName(),
      currency: this.currency(),
      emailNotifications: this.emailNotifications(),
      smsNotifications: this.smsNotifications(),
    });
  }

  getRoleColor(role: string) {
    switch (role) {
      case 'Admin':
        return 'bg-primary/10 text-primary';
      case 'Editor':
        return 'bg-secondary/10 text-secondary';
      case 'Viewer':
        return 'bg-surface-200 text-surface-600';
      default:
        return 'bg-surface-100 text-surface-600';
    }
  }

  getStatusColor(status: string) {
    return status === 'Active' ? 'text-success' : 'text-surface-400';
  }

  getStatusIcon(status: string) {
    return status === 'Active' ? '●' : '◯';
  }
}
