import { Component, signal } from '@angular/core';

@Component({
  selector: 'ndt-card',
  standalone: true,
  template: `
    <div
      class="card"
      role="button"
      tabindex="0"
      (click)="onClick()"
      (keydown.enter)="onClick()"
      (keydown.space)="onClick()"
      [class.card--hover]="isHovered()"
      (mouseenter)="isHovered.set(true)"
      (mouseleave)="isHovered.set(false)"
    >
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./card.component.scss'],
})
export class DevToolbarCardComponent {
  readonly click = signal<void>(undefined);
  protected readonly isHovered = signal(false);

  onClick(): void {
    this.click.set();
  }
}
