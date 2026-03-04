import {
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';

@Component({
  selector: 'ndt-tool-button',
  template: `
    <button
      class="tool-button"
      [class.tool-button--active]="isActive()"
      [class.tool-button--focus]="isFocused()"
      (mouseenter)="onMouseEnter()"
      (focusin)="onFocus()"
      (focusout)="onBlur()"
      (mouseleave)="onMouseLeave()"
      (keydown.escape)="onEscape()"
    >
      @if (isTooltipVisible()) {
      <span
        class="tooltip"
        [class.tooltip--visible]="tooltipState"
        [class.tooltip--hidden]="!tooltipState"
      >
        {{ tooltip() }}
      </span>
      }
      <ng-content />
      @if (badge()) {
        <span class="tool-button__badge">{{ badge() }}</span>
      }
    </button>
  `,
  styleUrls: ['./tool-button.component.scss'],
})
export class DevToolbarToolButtonComponent {
  // Injects
  private readonly state = inject(DevToolbarStateService);
  private readonly elementRef = inject(ElementRef);

  // Inputs
  readonly title = input.required<string>();
  readonly toolId = input.required<string>();
  readonly badge = input<string>();

  // Outputs
  readonly open = output<void>();

  // Signals
  readonly isActive = computed(
    () => this.state.activeToolId() === this.toolId()
  );
  readonly isToolbarVisible = this.state.isVisible;

  readonly isFocused = signal(false);
  readonly tooltip = computed(
    () =>
      this.elementRef.nativeElement.parentElement?.getAttribute(
        'data-tooltip'
      ) ?? ''
  );
  readonly isTooltipVisible = computed(
    () => this.tooltip() && !this.isActive()
  );

  // Properties
  protected tooltipState = false;
  private readonly hideDelay = 3000;

  // Public methods
  onClick(): void {
    this.isFocused.set(false);
    this.open.emit();
  }

  onMouseEnter(): void {
    this.tooltipState = true;
  }

  onMouseLeave(): void {
    this.tooltipState = false;
  }

  onEscape(): void {
    this.isFocused.set(false);
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
  }
}
