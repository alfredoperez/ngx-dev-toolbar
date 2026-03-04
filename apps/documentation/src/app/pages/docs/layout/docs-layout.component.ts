import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavSidebarComponent } from '../../../shared/components/nav-sidebar/nav-sidebar.component';

@Component({
  selector: 'app-docs-layout',
  imports: [RouterOutlet, NavSidebarComponent],
  templateUrl: './docs-layout.component.html',
  styleUrls: ['./docs-layout.component.scss']
})
export class DocsLayoutComponent {}
