import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DevToolbarIconComponent, IconName } from 'ngx-dev-toolbar';
import { NavItem } from '../../models/documentation.models';

interface DocNavItem {
  label: string;
  path: string;
  icon: IconName;
}

interface DocNavSection {
  title: string;
  items: DocNavItem[];
}

@Component({
  selector: 'app-nav-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, DevToolbarIconComponent],
  templateUrl: './nav-sidebar.component.html',
  styleUrls: ['./nav-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavSidebarComponent {
  mobileMenuOpen = signal(false);

  navSections: DocNavSection[] = [
    {
      title: 'Getting Started',
      items: [
        { label: 'Home', path: '/docs', icon: 'docs' }
      ]
    },
    {
      title: 'Tools',
      items: [
        { label: 'Feature Flags', path: '/docs/feature-flags', icon: 'toggle-left' },
        { label: 'Language Switcher', path: '/docs/language', icon: 'translate' },
        { label: 'Permissions', path: '/docs/permissions', icon: 'lock' },
        { label: 'App Features', path: '/docs/app-features', icon: 'lightbulb' },
        { label: 'Presets', path: '/docs/presets', icon: 'star' }
      ]
    }
  ];

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
}
