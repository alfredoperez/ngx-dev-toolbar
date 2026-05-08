import { CdkConnectedOverlay, ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  contentChild,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { isSidebarPosition } from '../../models/toolbar-position.model';
import { ToolbarStateService } from '../../toolbar-state.service';
import { ToolbarIconComponent } from '../icons/icon.component';
import { IconName } from '../icons/icon.models';
import { ToolbarToolButtonComponent } from '../tool-button/tool-button.component';
import { ToolbarWindowComponent } from '../window/window.component';
import { ToolbarWindowOptions } from './toolbar-tool.models';

const SIDEBAR_PILL_FOOTPRINT = 38;
const SIDEBAR_GUTTER = 16;
const SIDEBAR_WIDTH = 420;

@Component({
  selector: 'ndt-toolbar-tool',
  standalone: true,
  imports: [
    CdkConnectedOverlay,
    OverlayModule,
    ToolbarWindowComponent,
    ToolbarToolButtonComponent,
    ToolbarIconComponent,
  ],
  template: `
    <div #trigger="cdkOverlayOrigin" class="ndt-toolbar-tool" cdkOverlayOrigin>
      <div
        class="ndt-toolbar-tool__icon"
        (click)="onOpen()"
        (keydown.enter)="onOpen()"
        (keydown.space)="onOpen()"
        tabindex="0"
      >
        <div #buttonContainer>
          @if (icon()) {
          <ndt-tool-button [toolLabel]="toolTitle()" [toolId]="options().id" [badge]="badge()" [position]="state.position()">
            <ndt-icon [name]="icon()" />
          </ndt-tool-button>
          } @else {
          <ng-content select="ndt-tool-button"></ng-content>
          }
        </div>
      </div>

      @if (isActive()) {
      <ng-template
        #contentTemplate
        [cdkConnectedOverlayOrigin]="trigger"
        [cdkConnectedOverlayOpen]="isActive()"
        [cdkConnectedOverlayPositions]="positions()"
        [cdkConnectedOverlayWidth]="width()"
        [cdkConnectedOverlayHeight]="height()"
        [cdkConnectedOverlayPanelClass]="['ndt-overlay-panel', 'ndt-tool-overlay']"
        cdkConnectedOverlay
      >
        <ndt-window [class]="'ndt-slide-' + slideDirection()" [config]="options()" (closed)="onClose()">
          <ng-content />
        </ndt-window>
      </ng-template>
      }
    </div>
  `,
  styleUrl: './toolbar-tool.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarToolComponent {
  state = inject(ToolbarStateService);
  buttonContainer = viewChild.required<ElementRef>('buttonContainer');
  buttonComponent = contentChild(ToolbarToolButtonComponent);

  options = input.required<ToolbarWindowOptions>();
  icon = input.required<IconName>();
  toolTitle = input.required<string>();
  badge = input<string>();
  isActive = computed(() => this.state.activeToolId() === this.options().id);

  slideDirection = computed(() => {
    switch (this.state.position()) {
      case 'bottom': return 'up';
      case 'top': return 'down';
      case 'left': return 'right';
      case 'right': return 'left';
      case 'sidebar-right': return 'left';
      case 'sidebar-left': return 'right';
    }
  });

  height = computed(() => {
    if (isSidebarPosition(this.state.position())) {
      return Math.max(360, window.innerHeight - SIDEBAR_GUTTER * 2);
    }
    switch (this.options().size) {
      case 'small':
        return 320;
      case 'medium':
        return 480;
      case 'tall':
        return 620;
      case 'large':
        return 620;
      default:
        return 480;
    }
  });

  width = computed(() => {
    if (isSidebarPosition(this.state.position())) {
      return SIDEBAR_WIDTH;
    }
    switch (this.options().size) {
      case 'small':
        return 320;
      case 'medium':
        return 480;
      case 'tall':
        return 480;
      case 'large':
        return 620;
      default:
        return 400;
    }
  });

  positions = computed((): ConnectedPosition[] => {
    const position = this.state.position();
    const triggerRect = this.getButtonContainerRect();

    switch (position) {
      case 'bottom': {
        // Original logic: overlay centered above toolbar
        const windowCenter = window.innerWidth / 2;
        const offsetX = windowCenter - (triggerRect?.left ?? 0) - 22;
        return [{
          originX: 'center',
          originY: 'center',
          overlayX: 'center',
          overlayY: 'center',
          offsetY: -(Math.ceil(this.height() / 2) + 36),
          offsetX,
        }];
      }
      case 'top': {
        // Overlay centered below toolbar
        const windowCenter = window.innerWidth / 2;
        const offsetX = windowCenter - (triggerRect?.left ?? 0) - 22;
        return [{
          originX: 'center',
          originY: 'center',
          overlayX: 'center',
          overlayY: 'center',
          offsetY: Math.ceil(this.height() / 2) + 36,
          offsetX,
        }];
      }
      case 'left': {
        // Overlay centered to the right of toolbar
        const windowMiddle = window.innerHeight / 2;
        const offsetY = windowMiddle - (triggerRect?.top ?? 0) - 22;
        return [{
          originX: 'center',
          originY: 'center',
          overlayX: 'center',
          overlayY: 'center',
          offsetX: Math.ceil(this.width() / 2) + 36,
          offsetY,
        }];
      }
      case 'right': {
        // Overlay centered to the left of toolbar
        const windowMiddle = window.innerHeight / 2;
        const offsetY = windowMiddle - (triggerRect?.top ?? 0) - 22;
        return [{
          originX: 'center',
          originY: 'center',
          overlayX: 'center',
          overlayY: 'center',
          offsetX: -(Math.ceil(this.width() / 2) + 36),
          offsetY,
        }];
      }
      case 'sidebar-right': {
        // Panel docks to the right edge, left of the vertical pill, top-aligned.
        const triggerLeft = triggerRect?.left ?? window.innerWidth;
        const triggerTop = triggerRect?.top ?? SIDEBAR_GUTTER;
        const panelLeft = window.innerWidth - SIDEBAR_PILL_FOOTPRINT - SIDEBAR_WIDTH - SIDEBAR_GUTTER;
        return [{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: panelLeft - triggerLeft,
          offsetY: SIDEBAR_GUTTER - triggerTop,
        }];
      }
      case 'sidebar-left': {
        // Panel docks to the left edge, right of the vertical pill, top-aligned.
        const triggerLeft = triggerRect?.left ?? 0;
        const triggerTop = triggerRect?.top ?? SIDEBAR_GUTTER;
        const panelLeft = SIDEBAR_PILL_FOOTPRINT + SIDEBAR_GUTTER;
        return [{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: panelLeft - triggerLeft,
          offsetY: SIDEBAR_GUTTER - triggerTop,
        }];
      }
    }
  });

  onOpen(): void {
    this.state.setActiveTool(this.options().id);
  }

  onClose(): void {
    this.state.setActiveTool(null);
  }

  private getButtonContainerRect(): DOMRect | undefined {
    return this.buttonContainer()?.nativeElement?.getBoundingClientRect();
  }
}
