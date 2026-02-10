import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Container component for displaying lists of items with consistent scrolling,
 * empty states, and layout across all tools.
 *
 * @example
 * ```html
 * <ndt-list
 *   [hasItems]="items().length > 0"
 *   [hasResults]="filteredItems().length > 0"
 *   emptyMessage="No items found"
 *   noResultsMessage="No items match your filter"
 * >
 *   @for (item of filteredItems(); track item.id) {
 *     <ndt-list-item ... />
 *   }
 * </ndt-list>
 * ```
 */
@Component({
  selector: 'ndt-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!hasItems()) {
      <div class="empty-state">
        <p>{{ emptyMessage() }}</p>
        @if (emptyHint()) {
          <p class="hint">{{ emptyHint() }}</p>
        }
      </div>
    } @else if (!hasResults()) {
      <div class="empty-state">
        <p>{{ noResultsMessage() }}</p>
      </div>
    } @else {
      <div class="list-container">
        <ng-content />
      </div>
    }
  `,
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarListComponent {
  /**
   * Whether the list has any items at all (before filtering).
   * When false, shows the emptyMessage.
   */
  hasItems = input<boolean>(true);

  /**
   * Whether the list has any results after filtering.
   * When false (but hasItems is true), shows the noResultsMessage.
   */
  hasResults = input<boolean>(true);

  /**
   * Message to display when there are no items at all.
   * @example "No feature flags found"
   */
  emptyMessage = input<string>('No items found');

  /**
   * Optional hint text to display below the empty message.
   * @example "Call setAvailableOptions() to configure features"
   */
  emptyHint = input<string | undefined>(undefined);

  /**
   * Message to display when items exist but none match the current filter.
   * @example "No flags match your filter"
   */
  noResultsMessage = input<string>('No results match your filter');
}
