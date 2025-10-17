import { Component, ViewEncapsulation, computed, inject, input, output } from '@angular/core';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';
import { DevToolbarWindowOptions } from '../toolbar-tool/toolbar-tool.models';

@Component({
  selector: 'ndt-window',
  standalone: true,
  encapsulation: ViewEncapsulation.ShadowDom,
  template: `
    <div class="window dev-toolbar" [attr.data-theme]="theme()">
      <div class="header">
        <div class="header__content">
          <div class="header__title">
            <h1>{{ config().title }}</h1>
            @if (config().isBeta) {
            <span class="beta-tag">BETA</span>
            }
          </div>
          <p class="header__description">{{ config().description }}</p>
        </div>
        <div class="header__controls">
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
      <div class="content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./window.component.scss'],
})
export class DevToolbarWindowComponent {
  readonly devToolbarStateService = inject(DevToolbarStateService);
  readonly config = input.required<DevToolbarWindowOptions>();
  readonly close = output<void>();
  readonly maximize = output<void>();
  readonly minimize = output<void>();

  readonly theme = computed(() => this.devToolbarStateService.theme());

  protected onClose(): void {
    this.close.emit();
  }

  protected onMaximize(): void {
    this.maximize.emit();
  }

  protected onMinimize(): void {
    this.minimize.emit();
  }
}
