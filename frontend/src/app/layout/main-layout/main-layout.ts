import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar';
import { TopbarComponent } from '../topbar/topbar';
import { Modal } from '../../shared/components/modal/modal';
import { ToastComponent } from '../../shared/components/toast/toast';

@Component({
  selector: 'bt-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, CommonModule, Modal, ToastComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent {
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(isOpen => !isOpen);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
