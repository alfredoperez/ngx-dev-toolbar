import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { isSidebarPosition } from '../../models/toolbar-position.model';
import { ToolbarStateService } from '../../toolbar-state.service';
import { ToolbarWindowOptions } from '../toolbar-tool/toolbar-tool.models';

@Component({
  selector: 'ndt-window',
  standalone: true,
  template: `
    <div
      class="ndt-window"
      [class.ndt-window--compact]="isCompact()"
      [attr.data-theme]="theme()"
    >
      <div class="ndt-header">
        <div class="ndt-header__content">
          <div class="ndt-header__title">
            <h1>{{ config().title }}</h1>
            @if (config().isBeta) {
              <span class="beta-tag">BETA</span>
            }
          </div>
          @if (!isCompact() && config().description) {
            <p class="ndt-header__description">{{ config().description }}</p>
          }
        </div>
        <div class="ndt-header__controls">
          @if (config().isMinimizable) {
            <button aria-label="Minimize" class="control" (click)="onMinimize()">
              −
            </button>
          }
          @if (config().isMaximizable) {
            <button aria-label="Maximize" class="control" (click)="onMaximize()">
              □
            </button>
          }
          @if (config().isClosable) {
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

      @if (!isCompact()) {
        <div class="divider"></div>
      }

      <div class="ndt-content">
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

  readonly isCompact = computed(() => {
    const explicit = this.config().compact;
    if (typeof explicit === 'boolean') return explicit;
    return isSidebarPosition(this.devToolbarStateService.position());
  });

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
