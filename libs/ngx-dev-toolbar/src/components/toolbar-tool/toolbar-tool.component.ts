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
        <div [attr.data-tooltip]="title()">
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
        <ndt-window [config]="options()" (close)="onClose()">
          <ng-content />
        </ndt-window>
      </ng-template>
      }
    </div>
  `,
  styleUrl: './toolbar-tool.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarToolComponent {
  state = inject(DevToolbarStateService);
  @ViewChild('trigger') trigger!: ElementRef;

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
  positions = computed(() => [
    {
      originX: 'center' as const,
      originY: 'center' as const,
      overlayX: 'center' as const,
      overlayY: 'center' as const,
      offsetY: -(Math.ceil(this.height() / 2) + 36),
    },
  ]);

  onOpen(): void {
    this.state.setActiveTool(this.options().id);
  }

  onClose(): void {
    this.state.setActiveTool(null);
  }
}
