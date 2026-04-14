import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'ndt-tab',
  standalone: true,
  template: `
    @if (isActive()) {
      <ng-content />
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarTabComponent {
  readonly label = input.required<string>();
  readonly isActive = signal(false);
}
