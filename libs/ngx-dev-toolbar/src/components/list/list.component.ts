import { Component, input } from '@angular/core';
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
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-md);
        flex: 1;
        min-height: 0;
        justify-content: center;
        align-items: center;
        border: 1px solid var(--ndt-warning-border);
        border-radius: var(--ndt-border-radius-medium);
        padding: var(--ndt-spacing-md);
        background: var(--ndt-warning-background);
        color: var(--ndt-text-muted);

        p {
          margin: 0;
        }

        .hint {
          font-size: var(--ndt-font-size-xs);
        }
      }

      .list-container {
        display: flex;
        flex-direction: column;
        gap: var(--ndt-spacing-md);
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding-right: var(--ndt-spacing-sm);

        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: var(--ndt-background-secondary);
          border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--ndt-border-primary);
          border-radius: 4px;

          &:hover {
            background: var(--ndt-hover-bg);
          }
        }

        scrollbar-width: thin;
        scrollbar-color: var(--ndt-border-primary)
          var(--ndt-background-secondary);
      }
    `,
  ],
})
export class DevToolbarListComponent {
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
