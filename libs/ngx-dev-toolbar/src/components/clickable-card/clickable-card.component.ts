import { Component, input, signal } from '@angular/core';
import { DevToolbarCardComponent } from '../card/card.component';
import { DevToolbarIconComponent } from '../icons/icon.component';
import { IconName } from '../icons/icon.models';

@Component({
  selector: 'ndt-clickable-card',
  standalone: true,
  imports: [DevToolbarCardComponent, DevToolbarIconComponent],
  template: `
    <ndt-card (clicked)="onClick()">
      <div class="clickable-card">
        <div class="clickable-card__icon">
          <ndt-icon [name]="icon()" />
        </div>
        <div class="clickable-card__content">
          <div class="clickable-card__title">{{ title() }}</div>
          <div class="clickable-card__subtitle">{{ subtitle() }}</div>
        </div>
      </div>
    </ndt-card>
  `,
  styleUrls: ['./clickable-card.component.scss'],
})
export class DevToolbarClickableCardComponent {
  readonly icon = input.required<IconName>();
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly click = signal<void>(undefined);

  onClick(): void {
    this.click.set();
  }
}
