import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ToolbarFeatureFlagService,
  ToolbarPermissionsService,
  ToolbarAppFeaturesService,
} from 'ngx-dev-toolbar';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span class="logo-text">Angular Toolbar</span>
        </div>
        <span class="version">Demo</span>
      </div>

      <div class="sidebar-content">
        <div class="nav-section">
          <span class="nav-section-title">Pages</span>
          <nav class="sidebar-nav">
            @for (item of navItems; track item.id) {
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                class="nav-item"
              >
                <span class="nav-item-left">
                  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="item.icon"></svg>
                  <span class="nav-label">{{ item.label }}</span>
                </span>
                @if (getCount(item.id); as count) {
                  @if (count > 0) {
                    <span class="nav-badge">{{ count }}</span>
                  }
                }
              </a>
            }
          </nav>
        </div>
      </div>

      <div class="sidebar-footer">
        <a href="https://github.com/anthropics/ngx-dev-toolbar" target="_blank" rel="noopener" class="footer-link">
          <svg class="footer-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>View on GitHub</span>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      display: flex;
      flex-direction: column;
      background: #fafafa;
      border-right: 1px solid #e5e5e5;
      height: 100vh;
      position: sticky;
      top: 0;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1rem;
      border-bottom: 1px solid #e5e5e5;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon {
      width: 20px;
      height: 20px;
      color: #6366f1;
    }

    .logo-text {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #171717;
      letter-spacing: -0.01em;
    }

    .version {
      font-size: 0.6875rem;
      font-weight: 500;
      color: #737373;
      background: #e5e5e5;
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0.75rem;
    }

    .nav-section {
      margin-bottom: 1.5rem;
    }

    .nav-section-title {
      display: block;
      font-size: 0.6875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #a3a3a3;
      padding: 0 0.5rem;
      margin-bottom: 0.5rem;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.5rem;
      text-decoration: none;
      color: #525252;
      font-size: 0.8125rem;
      font-weight: 450;
      border-radius: 6px;
      transition: all 0.12s ease;
    }

    .nav-item-left {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .nav-icon {
      width: 16px;
      height: 16px;
      opacity: 0.7;
    }

    .nav-item:hover {
      background: #f0f0f0;
      color: #171717;
    }

    .nav-item:hover .nav-icon {
      opacity: 1;
    }

    .nav-item.active {
      background: #171717;
      color: #fafafa;
    }

    .nav-item.active .nav-icon {
      opacity: 1;
    }

    .nav-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.125rem;
      height: 1.125rem;
      padding: 0 0.3rem;
      font-size: 0.625rem;
      font-weight: 600;
      background: #e5e5e5;
      color: #525252;
      border-radius: 4px;
    }

    .nav-item.active .nav-badge {
      background: rgba(255, 255, 255, 0.2);
      color: #fafafa;
    }

    .sidebar-footer {
      padding: 0.75rem;
      border-top: 1px solid #e5e5e5;
    }

    .footer-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      text-decoration: none;
      color: #737373;
      font-size: 0.75rem;
      font-weight: 450;
      border-radius: 6px;
      transition: all 0.12s ease;
    }

    .footer-link:hover {
      background: #f0f0f0;
      color: #171717;
    }

    .footer-icon {
      width: 14px;
      height: 14px;
    }

    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly flagsService = inject(ToolbarFeatureFlagService);
  private readonly permissionsService = inject(ToolbarPermissionsService);
  private readonly featuresService = inject(ToolbarAppFeaturesService);

  protected readonly navItems: NavItem[] = [
    {
      id: 'feature-flags',
      label: 'Feature Flags',
      path: '/feature-flags',
      icon: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
    },
    {
      id: 'permissions',
      label: 'Permissions',
      path: '/permissions',
      icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    },
    {
      id: 'app-features',
      label: 'App Features',
      path: '/app-features',
      icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    },
  ];

  private readonly forcedFlags = toSignal(this.flagsService.getForcedValues(), {
    initialValue: [],
  });

  private readonly forcedPermissions = toSignal(this.permissionsService.getForcedValues(), {
    initialValue: [],
  });

  private readonly forcedFeatures = toSignal(this.featuresService.getForcedValues(), {
    initialValue: [],
  });

  protected readonly flagCount = computed(() => this.forcedFlags().length);
  protected readonly permissionCount = computed(() => this.forcedPermissions().length);
  protected readonly featureCount = computed(() => this.forcedFeatures().length);

  protected getCount(itemId: string): number {
    switch (itemId) {
      case 'feature-flags':
        return this.flagCount();
      case 'permissions':
        return this.permissionCount();
      case 'app-features':
        return this.featureCount();
      default:
        return 0;
    }
  }
}
