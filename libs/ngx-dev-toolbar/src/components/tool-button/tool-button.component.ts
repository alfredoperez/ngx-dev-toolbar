import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ToolbarPosition } from '../../models/toolbar-position.model';
import { ToolbarStateService } from '../../toolbar-state.service';

@Component({
  selector: 'ndt-tool-button',
  standalone: true,
  host: {
    '[class]': '"tooltip-position-" + position()',
  },
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
        [@tooltipAnimation]="tooltipState ? 'visible' : 'hidden'"
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
  animations: [
    trigger('tooltipAnimation', [
      state(
        'hidden',
        style({
          opacity: 0,
        })
      ),
      state(
        'visible',
        style({
          opacity: 1,
        })
      ),
      transition('hidden => visible', [animate('150ms ease-out')]),
      transition('visible => hidden', [animate('100ms ease-in')]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarToolButtonComponent {
  // Injects
  private readonly state = inject(ToolbarStateService);

  // Inputs
  readonly toolLabel = input.required<string>();
  readonly toolId = input.required<string>();
  readonly badge = input<string>();
  readonly position = input<ToolbarPosition>('bottom');

  // Outputs
  readonly open = output<void>();

  // Signals
  readonly isActive = computed(
    () => this.state.activeToolId() === this.toolId()
  );
  readonly isToolbarVisible = this.state.isVisible;

  readonly isFocused = signal(false);
  readonly tooltip = computed(() => this.toolLabel());
  readonly isTooltipVisible = computed(
    () => this.tooltip() && !this.isActive() && this.isToolbarVisible()
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
