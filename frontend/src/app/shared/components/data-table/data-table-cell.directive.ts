import { Directive, inject, input, TemplateRef } from '@angular/core';

export interface BtCellContext {
  $implicit: unknown;
  row: unknown;
}

@Directive({
  selector: '[btCell]',
  standalone: true,
})
export class BtCellDirective {
  btCell = input.required<string>();
  templateRef = inject<TemplateRef<BtCellContext>>(TemplateRef);
}
