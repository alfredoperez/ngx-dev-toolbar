import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarIconButtonComponent } from '../icon-button/icon-button.component';
import { IconName } from '../icons/icon.models';

/**
 * List item component with consistent layout, dot badge indicator,
 * and forced state highlighting.
 *
 * @example
 * ```html
 * <ndt-list-item
 *   title="Analytics Dashboard"
 *   description="Advanced reporting tools"
 *   [isForced]="false"
 *   [currentValue]="true"
 *   [originalValue]="undefined"
 * >
 *   <ndt-select ... />
 * </ndt-list-item>
 * ```
 */
@Component({
  selector: 'ndt-list-item',
  standalone: true,
  imports: [CommonModule, ToolbarIconButtonComponent],
  template: `
    <div class="list-item" [class.list-item--forced]="isForced()">
      <ndt-icon-button
        [icon]="pinIcon()"
        [ariaLabel]="pinAriaLabel()"
        variant="ghost"
        class="pin-button"
        [class.pin-button--pinned]="isPinned()"
        (click)="pinToggle.emit(); $event.stopPropagation()"
      />
      <div class="info">
        <h3>{{ title() }}</h3>
        @if (description()) {
          <div class="description-wrapper">
            <span
              class="dot-indicator"
              [class.dot-indicator--on]="displayValue()"
              [class.dot-indicator--off]="!displayValue()"
              [title]="tooltipText()"
            ></span>
            <p>{{ description() }}</p>
          </div>
        }
      </div>
      <div class="actions">
        @if (showApply() && isForced()) {
          <ndt-icon-button
            [icon]="applyState() === 'idle' ? 'export' : undefined"
            tooltip="Apply to source"
            variant="outlined"
            class="apply-button"
            [class.apply-button--loading]="applyState() === 'loading'"
            [class.apply-button--success]="applyState() === 'success'"
            [class.apply-button--error]="applyState() === 'error'"
            (click)="applyToSource.emit()"
          >
            @switch (applyState()) {
              @case ('loading') {
                <span class="apply-spinner"></span>
              }
              @case ('success') {
                <span class="apply-icon">✓</span>
              }
              @case ('error') {
                <span class="apply-icon">✕</span>
              }
            }
          </ndt-icon-button>
        }
        <ng-content />
      </div>
    </div>
  `,
  styleUrls: ['./list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarListItemComponent {
  /**
   * Display title for the list item
   * @example "Analytics Dashboard"
   */
  title = input.required<string>();

  /**
   * Optional description text
   * @example "Advanced reporting and data visualization tools"
   */
  description = input<string | undefined>(undefined);

  /**
   * Whether this item's state is forced via the dev toolbar
   */
  isForced = input<boolean>(false);

  /**
   * Current enabled/granted state of the item
   */
  currentValue = input.required<boolean>();

  /**
   * Original value before forcing (only present when isForced is true)
   */
  originalValue = input<boolean | undefined>(undefined);

  /**
   * Whether to show the "Apply to source" button
   */
  showApply = input<boolean>(false);

  /**
   * Current state of the apply operation
   */
  applyState = input<'idle' | 'loading' | 'success' | 'error'>('idle');

  /**
   * Whether this item is pinned to the top of the list
   */
  isPinned = input<boolean>(false);

  /**
   * Emits when the user clicks the pin/unpin button
   */
  pinToggle = output<void>();

  /**
   * Emits when the user clicks "Apply to source"
   */
  applyToSource = output<void>();

  protected pinIcon = computed<IconName>(() => 'pin');

  protected pinAriaLabel = computed(() =>
    this.isPinned() ? 'Unpin item' : 'Pin item'
  );

  /**
   * Value to display in the dot indicator.
   * For forced items: shows originalValue
   * For non-forced items: shows currentValue
   */
  protected displayValue = computed(() => {
    const originalValue = this.originalValue();
    return this.isForced() && originalValue !== undefined
      ? originalValue
      : this.currentValue();
  });

  /**
   * Tooltip text explaining the indicator state
   */
  protected tooltipText = computed(() => {
    const value = this.displayValue();
    const state = value ? 'enabled' : 'disabled';

    if (this.isForced() && this.originalValue() !== undefined) {
      return `Originally: ${state}`;
    }

    return `Current state: ${state}`;
  });
}
