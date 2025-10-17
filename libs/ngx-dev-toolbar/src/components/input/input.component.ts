import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ndt-input',
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
  styles: [
    `
      :host {
        display: block;
      }

      .input {
        width: 100%;
        padding: var(--ndt-spacing-sm) var(--ndt-spacing-md);
        border: 1px solid var(--ndt-border-primary);
        border-radius: var(--ndt-border-radius-small);
        background-color: var(--ndt-bg-primary);
        color: var(--ndt-text-primary);
        font-size: var(--ndt-font-size-sm);
        transition: var(--ndt-transition-default);
        box-sizing: border-box;
        min-height: 36px;

        &::placeholder {
          color: var(--ndt-text-muted);
        }

        &:focus {
          outline: none;
          border-color: var(--ndt-primary);
          box-shadow: 0 0 0 2px rgba(var(--ndt-primary-rgb), 0.2);
        }

        &:disabled {
          background-color: var(--ndt-bg-secondary);
          cursor: not-allowed;
          color: var(--ndt-text-muted);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarInputComponent {
  value = model.required<string>();

  type = input<string>('text');
  placeholder = input<string>('');
  ariaLabel = input<string>('');
  inputClass = input<string>('input');
}
