import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { ToolbarStateService } from '../../toolbar-state.service';
import { AngularIconComponent } from './angular-icon.component';
import { BoltIconComponent } from './bolt-icon.component';
import { BugIconComponent } from './bug-icon.component';
import { CodeIconComponent } from './code-icon.component';
import { DatabaseIconComponent } from './database-icon.component';
import { DiscordIconComponent } from './discord-icon.component';
import { DocsIconComponent } from './docs-icon.component';
import { EditIconComponent } from './edit-icon.component';
import { ExportIconComponent } from './export-icon.component';
import { FilterIconComponent } from './filter-icon.component';
import { GaugeIconComponent } from './gauge-icon.component';
import { GearIconComponent } from './gear-icon.component';
import { GitBranchIconComponent } from './git-branch-icon.component';
import { IconName } from './icon.models';
import { ImportIconComponent } from './import-icon.component';
import { LayoutIconComponent } from './layout-icon.component';
import { LightbulbIconComponent } from './lightbulb-icon.component';
import { LightingIconComponent } from './lighting-icon.component';
import { LockIconComponent } from './lock-icon.component';
import { MoonIconComponent } from './moon-icon.component';
import { NetworkIconComponent } from './network-icon.component';
import { PuzzleIconComponent } from './puzzle-icon.component';
import { RefreshIconComponent } from './refresh-icon.component';
import { StarIconComponent } from './star-icon.component';
import { SunIconComponent } from './sun-icon.component';
import { TerminalIconComponent } from './terminal-icon.component';
import { ToggleLeftIconComponent } from './toggle-left-icon.component';
import { TranslateIconComponent } from './translate-icon.component';
import { TrashIconComponent } from './trash-icon.component';
import { UsersIconComponent } from './users-icon.component';

@Component({
  selector: 'ngt-icon',
  standalone: true,
  imports: [
    AngularIconComponent,
    BoltIconComponent,
    BugIconComponent,
    CodeIconComponent,
    DatabaseIconComponent,
    DocsIconComponent,
    DiscordIconComponent,
    EditIconComponent,
    ExportIconComponent,
    FilterIconComponent,
    GaugeIconComponent,
    GearIconComponent,
    GitBranchIconComponent,
    ImportIconComponent,
    LayoutIconComponent,
    LightbulbIconComponent,
    LightingIconComponent,
    LockIconComponent,
    NetworkIconComponent,
    PuzzleIconComponent,
    RefreshIconComponent,
    StarIconComponent,
    TerminalIconComponent,
    ToggleLeftIconComponent,
    UsersIconComponent,
    SunIconComponent,
    MoonIconComponent,
    TranslateIconComponent,
    TrashIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (name()) { @case ('angular') {
    <ngt-angular-icon />
    } @case ('bolt') {
    <ngt-bolt-icon [fill]="fill()" />
    } @case ('bug') {
    <ngt-bug-icon [fill]="fill()" />
    } @case ('code') {
    <ngt-code-icon [fill]="fill()" />
    } @case ('database') {
    <ngt-database-icon [fill]="fill()" />
    } @case ('docs') {
    <ngt-docs-icon [fill]="fill()" />
    } @case ('edit') {
    <ngt-edit-icon [fill]="fill()" />
    } @case ('export') {
    <ngt-export-icon [fill]="fill()" />
    } @case ('filter') {
    <ngt-filter-icon [fill]="fill()" />
    } @case ('gauge') {
    <ngt-gauge-icon [fill]="fill()" />
    } @case ('gear') {
    <ngt-gear-icon [fill]="fill()" />
    } @case ('git-branch') {
    <ngt-git-branch-icon [fill]="fill()" />
    } @case ('import') {
    <ngt-import-icon [fill]="fill()" />
    } @case ('layout') {
    <ngt-layout-icon [fill]="fill()" />
    } @case ('lighting') {
    <ngt-lighting-icon [fill]="fill()" />
    } @case ('lightbulb') {
    <ngt-lightbulb-icon [fill]="fill()" />
    } @case ('lock') {
    <ngt-lock-icon [fill]="fill()" />
    } @case ('network') {
    <ngt-network-icon [fill]="fill()" />
    } @case ('puzzle') {
    <ngt-puzzle-icon [fill]="fill()" />
    } @case ('refresh') {
    <ngt-refresh-icon [fill]="fill()" />
    } @case ('star') {
    <ngt-star-icon [fill]="fill()" />
    } @case ('terminal') {
    <ngt-terminal-icon [fill]="fill()" />
    } @case ('toggle-left') {
    <ngt-toggle-left-icon [fill]="fill()" />
    } @case ('user') {
    <ngt-users-icon [fill]="fill()" />
    } @case ('sun') {
    <ngt-sun-icon [fill]="fill()" />
    } @case ('moon') {
    <ngt-moon-icon [fill]="fill()" />
    } @case ('translate') {
    <ngt-translate-icon [fill]="fill()" />
    } @case ('discord') {
    <ngt-discord-icon [fill]="fill()" />
    } @case ('trash') {
    <ngt-trash-icon [fill]="fill()" />
    } }
  `,
})
export class ToolbarIconComponent {
  private readonly stateService = inject(ToolbarStateService);

  name = input.required<IconName>();

  fill = computed(() =>
    this.stateService.theme() === 'dark' ? '#FFFFFF' : '#000000'
  );
}
