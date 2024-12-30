import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';
import { AngularIconComponent } from './angular-icon.component';
import { BugIconComponent } from './bug-icon.component';
import { CodeIconComponent } from './code-icon.component';
import { DatabaseIconComponent } from './database-icon.component';
import { GaugeIconComponent } from './gauge-icon.component';
import { GearIconComponent } from './gear-icon.component';
import { GitBranchIconComponent } from './git-branch-icon.component';
import { IconName } from './icon.models';
import { LayoutIconComponent } from './layout-icon.component';
import { LightingIconComponent } from './lighting-icon.component';
import { MoonIconComponent } from './moon-icon.component';
import { NetworkIconComponent } from './network-icon.component';
import { PuzzleIconComponent } from './puzzle-icon.component';
import { RefreshIconComponent } from './refresh-icon.component';
import { StarIconComponent } from './star-icon.component';
import { SunIconComponent } from './sun-icon.component';
import { TerminalIconComponent } from './terminal-icon.component';
import { ToggleLeftIconComponent } from './toggle-left-icon.component';
import { UsersIconComponent } from './users-icon.component';

@Component({
  selector: 'ndt-icon',
  standalone: true,
  imports: [
    AngularIconComponent,
    BugIconComponent,
    CodeIconComponent,
    DatabaseIconComponent,
    GaugeIconComponent,
    GearIconComponent,
    GitBranchIconComponent,
    LayoutIconComponent,
    LightingIconComponent,
    NetworkIconComponent,
    PuzzleIconComponent,
    RefreshIconComponent,
    StarIconComponent,
    TerminalIconComponent,
    ToggleLeftIconComponent,
    UsersIconComponent,
    SunIconComponent,
    MoonIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (name()) {
      @case ('angular') {
        <ndt-angular-icon />
      }
      @case ('bug') {
        <ndt-bug-icon [fill]="fill()" />
      }
      @case ('code') {
        <ndt-code-icon [fill]="fill()" />
      }
      @case ('database') {
        <ndt-database-icon [fill]="fill()" />
      }
      @case ('gauge') {
        <ndt-gauge-icon [fill]="fill()" />
      }
      @case ('gear') {
        <ndt-gear-icon [fill]="fill()" />
      }
      @case ('git-branch') {
        <ndt-git-branch-icon [fill]="fill()" />
      }
      @case ('layout') {
        <ndt-layout-icon [fill]="fill()" />
      }
      @case ('lighting') {
        <ndt-lighting-icon [fill]="fill()" />
      }
      @case ('network') {
        <ndt-network-icon [fill]="fill()" />
      }
      @case ('puzzle') {
        <ndt-puzzle-icon [fill]="fill()" />
      }
      @case ('refresh') {
        <ndt-refresh-icon [fill]="fill()" />
      }
      @case ('star') {
        <ndt-star-icon [fill]="fill()" />
      }
      @case ('terminal') {
        <ndt-terminal-icon [fill]="fill()" />
      }
      @case ('toggle-left') {
        <ndt-toggle-left-icon [fill]="fill()" />
      }
      @case ('user') {
        <ndt-users-icon [fill]="fill()" />
      }
      @case ('sun') {
        <ndt-sun-icon [fill]="fill()" />
      }
      @case ('moon') {
        <ndt-moon-icon [fill]="fill()" />
      }
    }
  `,
})
export class DevToolbarIconComponent {
  private readonly stateService = inject(DevToolbarStateService);

  name = input.required<IconName>();

  fill = computed(() =>
    this.stateService.theme() === 'dark' ? '#FFFFFF' : '#000000',
  );
}
