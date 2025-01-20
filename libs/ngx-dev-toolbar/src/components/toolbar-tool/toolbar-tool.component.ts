import { animate, style, transition, trigger } from '@angular/animations';
import { CdkConnectedOverlay, OverlayModule } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  ViewChild,
  computed,
  inject,
  input,
} from '@angular/core';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';
import { DevToolbarIconComponent } from '../icons/icon.component';
import { IconName } from '../icons/icon.models';
import { DevToolbarToolButtonComponent } from '../tool-button/tool-button.component';
import { DevToolbarWindowComponent } from '../window/window.component';
import { DevToolbarWindowOptions } from './toolbar-tool.models';

@Component({
  selector: 'ndt-toolbar-tool',
  standalone: true,
  imports: [
    CdkConnectedOverlay,
    OverlayModule,
    DevToolbarWindowComponent,
    DevToolbarToolButtonComponent,
    DevToolbarIconComponent,
  ],
  template: `
    <div #trigger="cdkOverlayOrigin" class="dev-toolbar-tool" cdkOverlayOrigin>
      <div
        class="dev-toolbar-tool__icon"
        (click)="onOpen()"
        (keydown.enter)="onOpen()"
        (keydown.space)="onOpen()"
        tabindex="0"
      >
        <div #buttonContainer [attr.data-tooltip]="title()">
          @if (icon()) {
          <ndt-tool-button [title]="title()" [toolId]="options().id">
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
        cdkConnectedOverlay
      >
        <ndt-window [@slideAnimation] [config]="options()" (close)="onClose()">
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
export class DevToolbarToolComponent {
  state = inject(DevToolbarStateService);
  @ViewChild('buttonContainer') buttonContainer!: ElementRef;

  @ContentChild(DevToolbarToolButtonComponent)
  buttonComponent!: DevToolbarToolButtonComponent;

  options = input.required<DevToolbarWindowOptions>();
  icon = input.required<IconName>();
  title = input.required<string>();
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
      this.buttonContainer?.nativeElement?.getBoundingClientRect();
    return buttonContainerRect?.left ?? 0;
  }
}
