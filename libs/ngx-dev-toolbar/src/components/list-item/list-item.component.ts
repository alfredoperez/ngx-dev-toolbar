import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  template: `
    <div class="list-item" [class.list-item--forced]="isForced()">
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
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      .list-item {
        display: flex;
        flex-direction: row;
        gap: var(--ndt-spacing-sm);
        background: var(--ndt-background-secondary);
        padding: var(--ndt-spacing-md);
        border-radius: var(--ndt-border-radius-medium);
        transition: background-color 0.2s ease;
      }

      .list-item.list-item--forced {
        background: rgba(59, 130, 246, 0.05);
        border-left: 2px solid rgba(59, 130, 246, 0.3);
        padding-left: calc(var(--ndt-spacing-md) - 2px);
      }

      .list-item .info {
        flex: 0 0 65%;
      }

      .list-item .info h3 {
        margin: 0;
        font-size: var(--ndt-font-size-md);
        color: var(--ndt-text-primary);
      }

      .list-item .info .description-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
      }

      .list-item .info .dot-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        cursor: help;
        transition: all 0.2s ease;
      }

      .list-item .info .dot-indicator.dot-indicator--on {
        background: rgb(34, 197, 94);
        box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
      }

      .list-item .info .dot-indicator.dot-indicator--off {
        background: rgb(239, 68, 68);
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
      }

      .list-item .info p {
        margin: 0;
        font-size: var(--ndt-font-size-xs);
        color: var(--ndt-text-muted);
        flex: 1;
      }

      .list-item .actions {
        flex: 0 0 35%;
        display: flex;
        align-items: flex-start;
      }
    `,
  ],
})
export class DevToolbarListItemComponent {
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
   * Value to display in the dot indicator.
   * For forced items: shows originalValue
   * For non-forced items: shows currentValue
   */
  protected displayValue = computed(() => {
    return this.isForced() && this.originalValue() !== undefined
      ? this.originalValue()!
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
