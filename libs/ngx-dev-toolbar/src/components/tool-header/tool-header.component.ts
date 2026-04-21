import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { ToolbarInputComponent } from '../input/input.component';

export interface ToolHeaderFilterOption {
  value: string;
  label: string;
  ariaLabel?: string;
}

@Component({
  selector: 'ndt-tool-header',
  standalone: true,
  imports: [ToolbarInputComponent],
  template: `
    <div class="tool-header">
      <div class="search-wrapper">
        <ndt-input
          [(value)]="searchQuery"
          [placeholder]="searchPlaceholder()"
          [ariaLabel]="searchAriaLabel() || searchPlaceholder()"
        />
        @if (searchQuery()) {
          <button
            type="button"
            class="clear-button"
            aria-label="Clear search"
            (click)="clearSearch()"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        }
      </div>

      @if (filterOptions().length > 0) {
        <div
          class="filter-group"
          role="radiogroup"
          [attr.aria-label]="filterAriaLabel()"
        >
          @for (opt of filterOptions(); track opt.value) {
            <button
              type="button"
              class="filter-segment"
              [class.filter-segment--active]="opt.value === activeFilter()"
              role="radio"
              [attr.aria-checked]="opt.value === activeFilter()"
              [attr.aria-label]="opt.ariaLabel || opt.label"
              (click)="onFilterClick(opt.value)"
              (keydown)="onFilterKeydown($event, opt.value)"
            >
              {{ opt.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./tool-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarToolHeaderComponent {
  searchQuery = model<string>('');
  activeFilter = model<string>('');

  searchPlaceholder = input<string>('Search...');
  searchAriaLabel = input<string>('');
  filterOptions = input<ToolHeaderFilterOption[]>([]);
  filterAriaLabel = input<string>('Filter items');
  /**
   * Value to set when the user clicks an already-active filter chip
   * (i.e., to "clear" the filter back to a default no-chip state).
   * Defaults to 'all'.
   */
  defaultFilter = input<string>('all');

  protected clearSearch(): void {
    this.searchQuery.set('');
  }

  protected onFilterClick(value: string): void {
    // Click an already-active chip to clear it back to the default
    // (no chip visually selected when activeFilter === defaultFilter).
    if (this.activeFilter() === value) {
      this.activeFilter.set(this.defaultFilter());
    } else {
      this.activeFilter.set(value);
    }
  }

  protected onFilterKeydown(event: KeyboardEvent, value: string): void {
    const options = this.filterOptions();
    const index = options.findIndex((o) => o.value === value);
    if (index === -1) return;

    let nextIndex = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % options.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + options.length) % options.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = options.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const next = options[nextIndex];
    this.activeFilter.set(next.value);

    const buttons = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>(
      '.filter-segment'
    );
    buttons?.[nextIndex]?.focus();
  }
}
