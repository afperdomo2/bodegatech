import { Component, signal } from '@angular/core';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { DataTable, DataTableColumn } from '../../../../shared/components/data-table/data-table';
import { Toggle } from '../../../../shared/components/toggle/toggle';
import { CommonModule } from '@angular/common';

interface User {
  id: string;
  avatar: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Offline';
  lastActive: string;
  actions: string;
}

@Component({
  selector: 'bt-admin',
  standalone: true,
  imports: [PageHeader, DataTable, Toggle, CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent {
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
