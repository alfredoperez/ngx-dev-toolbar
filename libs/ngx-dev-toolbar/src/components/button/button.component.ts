import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DevToolbarIconComponent } from '../icons/icon.component';
import { IconName } from '../icons/icon.models';

@Component({
  selector: 'ndt-button',
  standalone: true,
  imports: [DevToolbarIconComponent],
  template: `
    <button
      class="button"
      [attr.aria-label]="ariaLabel()"
      [type]="type()"
      [class.button--active]="isActive()"
      [class.button--icon]="variant() === 'icon'"
    >
      @if (icon()) {
        <ndt-icon [name]="icon() || 'star'" />
      }
      @if (label()) {
        <span class="button__label">{{ label() }}</span>
      }
      <ng-content />
    </button>
  `,
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly variant = input<'default' | 'icon'>('default');
  readonly icon = input<IconName>();
  readonly label = input<string>();
  readonly ariaLabel = input<string>();
  readonly isActive = input<boolean>(false);
}
