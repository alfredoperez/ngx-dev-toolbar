import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavSidebarComponent } from '../../../shared/components/nav-sidebar/nav-sidebar.component';

@Component({
  selector: 'app-docs-layout',
  standalone: true,
  imports: [RouterOutlet, NavSidebarComponent],
  templateUrl: './docs-layout.component.html',
  styleUrls: ['./docs-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsLayoutComponent {}
