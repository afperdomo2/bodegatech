import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getMovementTypeLabel, getMovementTypeOption, type MovementType } from '../../../core/constants/movement-type.constants';

@Component({
  selector: 'bt-movement-type-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movement-type-badge.html',
  styleUrl: './movement-type-badge.scss',
})
export class MovementTypeBadge {
  type = input.required<MovementType>();
  size = input<'sm' | 'md'>('sm');

  label = computed(() => getMovementTypeLabel(this.type()));
  icon = computed(() => {
    const opt = getMovementTypeOption(this.type());
    return opt?.icon ?? 'inventory_2';
  });
  color = computed(() => {
    const opt = getMovementTypeOption(this.type());
    return opt?.color ?? 'info';
  });

  variantClasses = computed(() => {
    switch (this.color()) {
      case 'success': return 'bg-[#4caf50]/10 text-[#4caf50] border-[#4caf50]/20';
      case 'warning': return 'bg-[#ffc107]/10 text-[#9a7b00] border-[#ffc107]/20';
      case 'error': return 'bg-[#ba1a1a]/10 text-[#ba1a1a] border-[#ba1a1a]/20';
      case 'info': return 'bg-[#003527]/10 text-[#003527] border-[#003527]/20';
      default: return 'bg-[#003527]/10 text-[#003527] border-[#003527]/20';
    }
  });

  sizeClasses = computed(() => {
    return this.size() === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';
  });

  iconSizeClasses = computed(() => {
    return this.size() === 'sm' ? 'text-[12px]' : 'text-[14px]';
  });
}