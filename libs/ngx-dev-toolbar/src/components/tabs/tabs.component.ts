import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  output,
  signal,
} from '@angular/core';
import { ToolbarTabComponent } from './tab.component';

@Component({
  selector: 'ndt-tabs',
  standalone: true,
  template: `
    <div class="tab-bar" role="tablist">
      @for (tab of tabs(); track $index) {
        <button
          class="tab-button"
          [class.tab-button--active]="$index === activeIndex()"
          role="tab"
          [attr.aria-selected]="$index === activeIndex()"
          [attr.tabindex]="$index === activeIndex() ? 0 : -1"
          [attr.id]="'tab-' + instanceId + '-' + $index"
          [attr.aria-controls]="'tabpanel-' + instanceId"
          (click)="selectTab($index)"
          (keydown)="onKeydown($event, $index)"
        >
          {{ tab.label() }}
        </button>
      }
    </div>
    <div
      class="tab-panel"
      role="tabpanel"
      [attr.id]="'tabpanel-' + instanceId"
      [attr.aria-labelledby]="'tab-' + instanceId + '-' + activeIndex()"
    >
      <ng-content />
    </div>
  `,
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarTabsComponent {
  readonly tabs = contentChildren(ToolbarTabComponent);
  readonly activeIndex = signal(0);
  readonly activeIndexChange = output<number>();

  protected readonly instanceId = Math.random().toString(36).slice(2, 9);

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      const active = this.activeIndex();
      tabs.forEach((tab, i) => tab.isActive.set(i === active));
    });
  }

  selectTab(index: number) {
    this.activeIndex.set(index);
    this.activeIndexChange.emit(index);
  }

  onKeydown(event: KeyboardEvent, currentIndex: number) {
    const count = this.tabs().length;
    let newIndex: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
        newIndex = (currentIndex + 1) % count;
        break;
      case 'ArrowLeft':
        newIndex = (currentIndex - 1 + count) % count;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = count - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.selectTab(newIndex);

    const button = (event.target as HTMLElement)
      .parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [newIndex];
    button?.focus();
  }
}
