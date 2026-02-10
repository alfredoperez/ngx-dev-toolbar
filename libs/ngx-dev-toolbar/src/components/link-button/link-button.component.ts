import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ToolbarIconComponent } from '../icons/icon.component';
import { IconName } from '../icons/icon.models';

@Component({
  selector: 'ndt-link-button',
  standalone: true,
  imports: [ToolbarIconComponent],
  template: `
    <a
      [href]="url()"
      target="_blank"
      rel="noopener noreferrer"
      class="link-button"
    >
      <div class="link-button__icon">
        <ndt-icon [name]="icon()" />
      </div>
      <span class="link-button__text">
        <ng-content></ng-content>
      </span>
    </a>
  `,
  styleUrls: ['./link-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarLinkButtonComponent {
  readonly url = input.required<string>();
  readonly icon = input.required<IconName>();
}
