import { Component, input } from '@angular/core';
import { DevToolbarIconComponent } from '../icons/icon.component';
import { IconName } from '../icons/icon.models';

@Component({
  selector: 'ndt-link-button',
  standalone: true,
  imports: [DevToolbarIconComponent],
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
})
export class DevToolbarLinkButtonComponent {
  readonly url = input.required<string>();
  readonly icon = input.required<IconName>();
}
