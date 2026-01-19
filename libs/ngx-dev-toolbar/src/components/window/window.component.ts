import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ToolbarStateService } from '../../toolbar-state.service';
import { ToolbarWindowOptions } from '../toolbar-tool/toolbar-tool.models';

@Component({
  selector: 'ngt-window',
  standalone: true,
  template: `
    <div class="ngt-window" [attr.data-theme]="theme()">
      <div class="ngt-header">
        <div class="ngt-header__content">
          <div class="ngt-header__title">
            <h1>{{ config().title }}</h1>
            @if (config().isBeta) {
            <span class="beta-tag">BETA</span>
            }
          </div>
          @if (config().description) {
          <p class="ngt-header__description">{{ config().description }}</p>
          }
        </div>
        <div class="ngt-header__controls">
          @if (config().isMinimizable) {
          <button aria-label="Minimize" class="control" (click)="onMinimize()">
            −
          </button>
          } @if (config().isMaximizable) {
          <button aria-label="Maximize" class="control" (click)="onMaximize()">
            □
          </button>
          } @if (config().isClosable) {
          <button
            aria-label="Close"
            class="control control--close"
            (click)="onClose()"
          >
            ×
          </button>
          }
        </div>
      </div>

      <div class="divider"></div>
      <div class="ngt-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarWindowComponent {
  readonly devToolbarStateService = inject(ToolbarStateService);
  readonly config = input.required<ToolbarWindowOptions>();
  readonly closed = output<void>();
  readonly maximize = output<void>();
  readonly minimize = output<void>();

  readonly theme = computed(() => this.devToolbarStateService.theme());

  protected onClose(): void {
    this.closed.emit();
  }

  protected onMaximize(): void {
    this.maximize.emit();
  }

  protected onMinimize(): void {
    this.minimize.emit();
  }
}
