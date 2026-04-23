import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'bt-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  isSidebarOpen = input(false);
  sidebarToggled = output<void>();

  mainMenuItems: MenuItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Inventario', path: '/inventory', icon: 'inventory_2' },
    { label: 'Reportes', path: '/reports', icon: 'assessment' },
    { label: 'Administración', path: '/admin', icon: 'admin_panel_settings' },
  ];

  footerMenuItems: MenuItem[] = [
    { label: 'Soporte', path: '/support', icon: 'help' },
    { label: 'Configuración', path: '/settings', icon: 'settings' },
  ];

  closeSidebar(): void {
    this.sidebarToggled.emit();
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 768) {
      this.sidebarToggled.emit();
    }
  }

  getMenuItemFill(path: string): string {
    // Detectar si el item está activo - esto es visual, el routerLinkActive se encarga del activo real
    return "'FILL' 0";
  }
}
