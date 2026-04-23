import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'bt-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Inventario', path: '/inventory', icon: '📦' },
  ];
}
