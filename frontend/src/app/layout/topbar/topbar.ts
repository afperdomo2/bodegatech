import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bt-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class TopbarComponent {
  userName = 'J. Doe';
  
  sidebarToggled = output<void>();

  onToggleSidebar(): void {
    this.sidebarToggled.emit();
  }
}
