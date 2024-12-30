import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'ndt-select',
  standalone: true,
  imports: [FormsModule],
  template: `
    <select
      class="select"
      [attr.aria-label]="ariaLabel()"
      [class.small]="size() === 'small'"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
    >
      @for (option of options(); track option.value) {
        <option role="option" [value]="option.value">{{ option.label }}</option>
      }
    </select>
  `,
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarSelectComponent {
  value = model<string>();
  options = input.required<SelectOption[]>();
  ariaLabel = input<string>('');
  label = input<string>('');
  size = input<'small' | 'medium'>('medium');
}
