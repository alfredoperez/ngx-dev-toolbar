import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

/**
 * Collapsible group header that wraps a section of list items.
 *
 * Renders a clickable header with the group name + item count + a chevron
 * indicating collapsed/expanded state. Children projected via `<ng-content>`
 * are hidden when collapsed.
 *
 * @example
 * ```html
 * <ndt-list-group
 *   name="Authentication"
 *   [count]="3"
 *   [collapsed]="isCollapsed"
 *   (collapsedChange)="onToggle($event)"
 * >
 *   <ndt-list-item ... />
 * </ndt-list-group>
 * ```
 */
@Component({
  selector: 'ndt-list-group',
  standalone: true,
  template: `
    <button
      type="button"
      class="header"
      [attr.aria-expanded]="!collapsed()"
      [attr.aria-label]="ariaLabel()"
      (click)="toggle()"
    >
      <span class="chevron" [class.chevron--expanded]="!collapsed()" aria-hidden="true"></span>
      <span class="name">{{ name() }}</span>
      <span class="count" aria-hidden="true">{{ count() }}</span>
    </button>
    @if (!collapsed()) {
      <div class="content">
        <ng-content />
      </div>
    }
  `,
  styleUrls: ['./list-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarListGroupComponent {
  /** Display name of the group, shown in the header. */
  name = input.required<string>();

  /** Number of items in the group, shown next to the name. */
  count = input.required<number>();

  /** Whether the group is currently collapsed. */
  collapsed = input<boolean>(false);

  /** Emits the new collapsed value when the user clicks the header. */
  collapsedChange = output<boolean>();

  protected ariaLabel = computed(
    () =>
      `${this.collapsed() ? 'Expand' : 'Collapse'} ${this.name()} group, ${this.count()} items`
  );

  protected toggle(): void {
    this.collapsedChange.emit(!this.collapsed());
  }
}
