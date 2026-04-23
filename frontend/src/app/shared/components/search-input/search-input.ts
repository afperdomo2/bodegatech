import { Component, input, output } from '@angular/core';

@Component({
  selector: 'bt-search-input',
  standalone: true,
  imports: [],
  templateUrl: './search-input.html',
  styleUrl: './search-input.scss',
})
export class SearchInput {
  placeholder = input<string>('Buscar...');
  value = input<string>('');
  searchChange = output<string>();

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchChange.emit(target.value);
  }
}
