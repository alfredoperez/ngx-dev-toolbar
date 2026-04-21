import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
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
      <span
        class="dot-indicator"
        [class.dot-indicator--on]="currentValue()"
        [class.dot-indicator--off]="!currentValue()"
        [class.dot-indicator--forced]="isForced()"
        [title]="tooltipText()"
        [attr.aria-label]="statusAriaLabel()"
        role="img"
      ></span>
      <div class="info">
        <h3>{{ title() }}</h3>
        @if (description()) {
          <p>{{ description() }}</p>
        }
      </div>
      <div class="actions">
        @if (copyableId()) {
          <button
            type="button"
            class="copy-button"
            [class.copy-button--copied]="copyState() === 'copied'"
            [attr.aria-label]="copyAriaLabel()"
            [title]="copyState() === 'copied' ? 'Copied!' : 'Copy ID'"
            (click)="copyId($event)"
          >
            @if (copyState() === 'copied') {
              <span aria-hidden="true">✓</span>
            } @else {
              <span aria-hidden="true" class="copy-icon">⧉</span>
            }
          </button>
        }
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
                <span class="apply-icon" aria-hidden="true">✓</span>
              }
              @case ('error') {
                <span class="apply-icon" aria-hidden="true">✕</span>
              }
            }
          </ndt-icon-button>
        }
        <ng-content />
        <ndt-icon-button
          [icon]="pinIcon()"
          [ariaLabel]="pinAriaLabel()"
          variant="ghost"
          class="pin-button"
          [class.pin-button--pinned]="isPinned()"
          (click)="pinToggle.emit(); $event.stopPropagation()"
        />
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
   * Optional identifier that can be copied to clipboard (e.g., flag ID).
   * When provided, renders a copy button in the action row.
   */
  copyableId = input<string | undefined>(undefined);

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
   * Tooltip text explaining the current state, with override context when forced
   */
  protected tooltipText = computed(() => {
    const current = this.currentValue() ? 'enabled' : 'disabled';

    if (this.isForced() && this.originalValue() !== undefined) {
      const original = this.originalValue() ? 'enabled' : 'disabled';
      return `Currently ${current} (originally ${original})`;
    }

    return `Currently ${current}`;
  });

  protected statusAriaLabel = computed(() => {
    const current = this.currentValue() ? 'enabled' : 'disabled';
    return this.isForced() ? `${current}, forced` : current;
  });

  protected readonly copyState = signal<'idle' | 'copied'>('idle');

  protected copyAriaLabel = computed(() => {
    const id = this.copyableId();
    return id ? `Copy ID "${id}" to clipboard` : 'Copy ID';
  });

  protected async copyId(event: MouseEvent): Promise<void> {
    event.stopPropagation();
    const id = this.copyableId();
    if (!id) return;

    try {
      await navigator.clipboard.writeText(id);
      this.copyState.set('copied');
      setTimeout(() => this.copyState.set('idle'), 1500);
    } catch {
      this.copyState.set('idle');
    }
  }
}
