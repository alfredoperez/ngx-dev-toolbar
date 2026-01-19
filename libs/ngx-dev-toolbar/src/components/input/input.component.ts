import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ngt-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <input
      [attr.aria-label]="ariaLabel()"
      [type]="type()"
      [class]="inputClass()"
      [ngModel]="value()"
      [placeholder]="placeholder()"
      (ngModelChange)="value.set($event)"
    />
  `,
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarInputComponent {
  value = model.required<string>();

  type = input<string>('text');
  placeholder = input<string>('');
  ariaLabel = input<string>('');
  inputClass = input<string>('input');
}
