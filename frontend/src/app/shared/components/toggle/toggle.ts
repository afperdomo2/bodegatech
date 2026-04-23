import { Component, input, output } from '@angular/core';

@Component({
  selector: 'bt-toggle',
  standalone: true,
  imports: [],
  templateUrl: './toggle.html',
  styleUrl: './toggle.scss',
})
export class Toggle {
  checked = input<boolean>(false);
  label = input<string>('');
  icon = input<string>('');
  checkedChange = output<boolean>();

  onToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.checkedChange.emit(target.checked);
  }
}
