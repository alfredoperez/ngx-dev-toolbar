import { animate, style, transition, trigger } from '@angular/animations';
import { CdkConnectedOverlay, OverlayModule } from '@angular/cdk/overlay';
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
import { ToolbarStateService } from '../../toolbar-state.service';
import { ToolbarIconComponent } from '../icons/icon.component';
import { IconName } from '../icons/icon.models';
import { ToolbarToolButtonComponent } from '../tool-button/tool-button.component';
import { ToolbarWindowComponent } from '../window/window.component';
import { ToolbarWindowOptions } from './toolbar-tool.models';

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
        <div #buttonContainer [attr.data-tooltip]="title()">
          @if (icon()) {
          <ndt-tool-button [title]="title()" [toolId]="options().id" [badge]="badge()">
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
        <ndt-window [@slideAnimation] [config]="options()" (closed)="onClose()">
          <ng-content />
        </ndt-window>
      </ng-template>
      }
    </div>
  `,
  styleUrl: './toolbar-tool.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideAnimation', [
      transition(':enter', [
        style({
          transform: 'translateY(20px)',
          opacity: 0,
        }),
        animate(
          '400ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            transform: 'translateY(0)',
            opacity: 1,
          })
        ),
      ]),
      transition(':leave', [
        style({
          transform: 'translateY(0)',
          opacity: 1,
        }),
        animate(
          '400ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            transform: 'translateY(20px)',
            opacity: 0,
          })
        ),
      ]),
    ]),
  ],
})
export class ToolbarToolComponent {
  state = inject(ToolbarStateService);
  buttonContainer = viewChild.required<ElementRef>('buttonContainer');
  buttonComponent = contentChild(ToolbarToolButtonComponent);

  options = input.required<ToolbarWindowOptions>();
  icon = input.required<IconName>();
  title = input.required<string>();
  badge = input<string>();
  isActive = computed(() => this.state.activeToolId() === this.options().id);
  height = computed(() => {
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
  positions = computed(() => {
    const triggerXPosition = this.getButtonContainerXPosition();
    const windowCenter = window.innerWidth / 2;
    const offsetX = windowCenter - triggerXPosition - 22;
    return [
      {
        originX: 'center' as const,
        originY: 'center' as const,
        overlayX: 'center' as const,
        overlayY: 'center' as const,
        offsetY: -(Math.ceil(this.height() / 2) + 36),
        offsetX,
      },
    ];
  });

  onOpen(): void {
    this.state.setActiveTool(this.options().id);
  }

  onClose(): void {
    this.state.setActiveTool(null);
  }

  getButtonContainerXPosition(): number {
    const buttonContainerRect =
      this.buttonContainer()?.nativeElement?.getBoundingClientRect();
    return buttonContainerRect?.left ?? 0;
  }
}
