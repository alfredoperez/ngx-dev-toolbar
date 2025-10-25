import { CdkMenuModule } from '@angular/cdk/menu';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'ndt-select',
  standalone: true,
  imports: [CommonModule, FormsModule, OverlayModule, CdkMenuModule],
  template: `
    <div
      class="ndt-select"
      [class.small]="size() === 'small'"
      [class.open]="isOpen()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-expanded]="isOpen()"
      [attr.aria-controls]="selectMenuId"
      [attr.data-theme]="theme()"
      cdkOverlayOrigin
      #trigger="cdkOverlayOrigin"
      (click)="toggle()"
      (keydown.enter)="toggle()"
      (keydown.space)="toggle()"
      tabindex="0"
      role="combobox"
    >
      <span class="select__value">{{ selectedLabel() }}</span>
      <span class="select__arrow" aria-hidden="true"></span>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="isOpen()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayPanelClass]="['ndt-overlay-panel', 'ndt-select-overlay']"
      (overlayOutsideClick)="close()"
    >
      <div
        [id]="selectMenuId"
        class="ndt-select-menu"
        cdkMenu
        role="listbox"
        [attr.data-theme]="theme()"
      >
        @for (option of options(); track option.value) {
        <button
          class="select-menu-item"
          [class.selected]="option.value === value()"
          [attr.aria-selected]="option.value === value()"
          cdkMenuItem
          type="button"
          (click)="selectOption(option)"
        >
          {{ option.label }}
        </button>
        }
      </div>
    </ng-template>
  `,
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarSelectComponent {
  readonly devToolbarStateService = inject(DevToolbarStateService);

  value = model<string>();
  options = input.required<SelectOption[]>();
  ariaLabel = input<string>('');
  label = input<string>('');
  size = input<'small' | 'medium'>('medium');
  readonly theme = computed(() => this.devToolbarStateService.theme());

  protected readonly selectMenuId = `select-menu-${Math.random()
    .toString(36)
    .slice(2, 11)}`;
  isOpen = signal(false);

  selectedLabel = computed(() => {
    const selected = this.options()?.find((opt) => opt.value === this.value());
    return selected?.label ?? '';
  });

  positions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 4,
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -4,
    },
  ];

  toggle() {
    this.isOpen.update((v) => !v);
  }

  close() {
    this.isOpen.set(false);
  }

  selectOption(option: SelectOption) {
    this.value.set(option.value);
    this.close();
  }
}
