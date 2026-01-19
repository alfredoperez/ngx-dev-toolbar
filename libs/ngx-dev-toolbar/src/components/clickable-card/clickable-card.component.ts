import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { ToolbarCardComponent } from '../card/card.component';
import { ToolbarIconComponent } from '../icons/icon.component';
import { IconName } from '../icons/icon.models';

@Component({
  selector: 'ngt-clickable-card',
  standalone: true,
  imports: [ToolbarCardComponent, ToolbarIconComponent],
  template: `
    <ngt-card (clicked)="onClick()">
      <div class="clickable-card">
        <div class="clickable-card__icon">
          <ngt-icon [name]="icon()" />
        </div>
        <div class="clickable-card__content">
          <div class="clickable-card__title">{{ title() }}</div>
          <div class="clickable-card__subtitle">{{ subtitle() }}</div>
        </div>
      </div>
    </ngt-card>
  `,
  styleUrls: ['./clickable-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarClickableCardComponent {
  readonly icon = input.required<IconName>();
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly click = signal<void>(undefined);

  onClick(): void {
    this.click.set();
  }
}
