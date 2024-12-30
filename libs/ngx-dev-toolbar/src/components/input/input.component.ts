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
        padding: var(--devtools-spacing-sm) var(--devtools-spacing-md);
        border: 1px solid var(--devtools-border-primary);
        border-radius: var(--devtools-border-radius-small);
        background-color: var(--devtools-bg-primary);
        color: var(--devtools-text-primary);
        font-size: var(--devtools-font-size-sm);
        transition: var(--devtools-transition-default);

        &::placeholder {
          color: var(--devtools-text-muted);
        }

        &:focus {
          outline: none;
          border-color: var(--devtools-primary);
          box-shadow: 0 0 0 1px var(--devtools-primary);
        }

        &:disabled {
          background-color: var(--devtools-background-secondary);
          cursor: not-allowed;
          color: var(--devtools-text-muted);
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
