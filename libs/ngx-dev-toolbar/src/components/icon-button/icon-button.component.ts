import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { ToolbarIconComponent } from '../icons/icon.component';
import { IconName } from '../icons/icon.models';

@Component({
  selector: 'ndt-icon-button',
  standalone: true,
  imports: [ToolbarIconComponent],
  template: `
    <button
      class="icon-button"
      [class.icon-button--sm]="size() === 'sm'"
      [class.icon-button--md]="size() === 'md'"
      [class.icon-button--outlined]="variant() === 'outlined'"
      [attr.aria-label]="ariaLabel() || tooltip()"
      (mouseenter)="isHovered.set(true)"
      (mouseleave)="isHovered.set(false)"
    >
      @if (isTooltipVisible()) {
        <span class="tooltip" [class.tooltip--visible]="isHovered()">
          {{ tooltip() }}
        </span>
      }
      @if (icon()) {
        <ndt-icon [name]="icon()!" />
      }
      <ng-content />
    </button>
  `,
  styleUrls: ['./icon-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarIconButtonComponent {
  readonly icon = input<IconName>();
  readonly tooltip = input<string>();
  readonly ariaLabel = input<string>();
  readonly size = input<'sm' | 'md'>('sm');
  readonly variant = input<'ghost' | 'outlined'>('ghost');

  protected isHovered = signal(false);
  protected isTooltipVisible = computed(
    () => !!this.tooltip() && this.isHovered()
  );
}
