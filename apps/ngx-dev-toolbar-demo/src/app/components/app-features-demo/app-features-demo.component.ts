import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AppFeaturesConfigService } from '../../services/app-features-config.service';

/**
 * Demo component showcasing app features and product tiers.
 *
 * Demonstrates how product-level features can be tested by forcing
 * different subscription tier features on/off without backend changes.
 */
@Component({
  selector: 'app-features-demo',
  standalone: true,
  template: `
    <section class="app-features-demo">
      <div class="demo-header">
        <div class="header-content">
          <h2>App Features</h2>
          <p class="demo-description">
            Test different subscription tier features using the toolbar below.
          </p>
        </div>
        <div class="tier-selector">
          <span class="tier-label">Current Tier:</span>
          <div class="tier-buttons">
            @for (tier of tiers; track tier.id) {
              <button
                [class.active]="config.currentTier() === tier.id"
                (click)="config.setTier(tier.id)"
                class="tier-btn"
                type="button"
              >
                {{ tier.name }}
              </button>
            }
          </div>
        </div>
      </div>

      <div class="demo-card-grid">
        <!-- Analytics Dashboard -->
        <div class="demo-card" [class.locked]="!hasAnalytics()">
          <div class="card-header">
            <h3>Analytics Dashboard</h3>
            <span class="tier-badge professional">Pro</span>
          </div>
          <p class="card-description">View detailed usage metrics and insights</p>
          @if (hasAnalytics()) {
            <div class="card-preview stats-preview">
              <div class="stat-item">
                <span class="stat-value">1,234</span>
                <span class="stat-label">Users</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">89%</span>
                <span class="stat-label">Rate</span>
              </div>
            </div>
            <span class="feature-status available">Available</span>
          } @else {
            <div class="locked-state">
              <span class="lock-icon">🔒</span>
              <span>Upgrade to Professional</span>
            </div>
          }
        </div>

        <!-- Multi-User Support -->
        <div class="demo-card" [class.locked]="!hasMultiUser()">
          <div class="card-header">
            <h3>Multi-User</h3>
            <span class="tier-badge professional">Pro</span>
          </div>
          <p class="card-description">Collaborate with your team members</p>
          @if (hasMultiUser()) {
            <div class="card-preview users-preview">
              <span class="user-avatar">JD</span>
              <span class="user-avatar">AS</span>
              <span class="user-avatar">MK</span>
              <span class="user-avatar more">+5</span>
            </div>
            <span class="feature-status available">Available</span>
          } @else {
            <div class="locked-state">
              <span class="lock-icon">🔒</span>
              <span>Upgrade to Professional</span>
            </div>
          }
        </div>

        <!-- White Label Branding -->
        <div class="demo-card" [class.locked]="!hasWhiteLabel()">
          <div class="card-header">
            <h3>White Label</h3>
            <span class="tier-badge enterprise">Enterprise</span>
          </div>
          <p class="card-description">Custom branding and styling options</p>
          @if (hasWhiteLabel()) {
            <div class="card-preview branding-preview">
              <span class="color-swatch" style="background: #6366f1"></span>
              <span class="color-swatch" style="background: #8b5cf6"></span>
              <span class="color-swatch" style="background: #f59e0b"></span>
            </div>
            <span class="feature-status available enterprise">Enterprise</span>
          } @else {
            <div class="locked-state">
              <span class="lock-icon">🔒</span>
              <span>Enterprise only</span>
            </div>
          }
        </div>

        <!-- SSO Integration -->
        <div class="demo-card" [class.locked]="!hasSso()">
          <div class="card-header">
            <h3>SSO Integration</h3>
            <span class="tier-badge enterprise">Enterprise</span>
          </div>
          <p class="card-description">Single sign-on with identity providers</p>
          @if (hasSso()) {
            <div class="card-preview sso-preview">
              <span class="sso-provider">Azure AD</span>
              <span class="sso-provider">Okta</span>
              <span class="sso-provider">Google</span>
            </div>
            <span class="feature-status available enterprise">Enterprise</span>
          } @else {
            <div class="locked-state">
              <span class="lock-icon">🔒</span>
              <span>Enterprise only</span>
            </div>
          }
        </div>

        <!-- API Access -->
        <div class="demo-card" [class.locked]="!hasApiAccess()">
          <div class="card-header">
            <h3>API Access</h3>
            <span class="tier-badge enterprise">Enterprise</span>
          </div>
          <p class="card-description">Programmatic access to platform data</p>
          @if (hasApiAccess()) {
            <div class="card-preview api-preview">
              <code>GET /api/v1/data</code>
              <code>POST /api/v1/resource</code>
            </div>
            <span class="feature-status available enterprise">Enterprise</span>
          } @else {
            <div class="locked-state">
              <span class="lock-icon">🔒</span>
              <span>Enterprise only</span>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .app-features-demo {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .demo-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .header-content h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--demo-text, #1e293b);
    }

    .demo-description {
      margin: 0;
      color: var(--demo-text-muted, #64748b);
      font-size: 0.9375rem;
    }

    .tier-selector {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .tier-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--demo-text-muted, #64748b);
    }

    .tier-buttons {
      display: flex;
      gap: 0.375rem;
      background: var(--demo-bg, #f8fafc);
      padding: 0.25rem;
      border-radius: 8px;
    }

    .tier-btn {
      padding: 0.5rem 0.875rem;
      font-size: 0.8125rem;
      font-weight: 500;
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      color: var(--demo-text-muted, #64748b);
      transition: all 0.2s;
    }

    .tier-btn:hover {
      color: var(--demo-text, #1e293b);
    }

    .tier-btn.active {
      background: white;
      color: var(--demo-primary, #6366f1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .demo-card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .demo-card {
      background: var(--demo-card-bg, #ffffff);
      border: 1px solid var(--demo-border, #e2e8f0);
      border-radius: var(--demo-radius, 8px);
      padding: 1.25rem;
      box-shadow: var(--demo-shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
      transition: border-color 0.2s, box-shadow 0.2s;
      position: relative;
    }

    .demo-card:hover {
      border-color: var(--demo-primary, #6366f1);
    }

    .demo-card.locked {
      opacity: 0.75;
    }

    .demo-card.locked:hover {
      border-color: var(--demo-border, #e2e8f0);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--demo-text, #1e293b);
    }

    .tier-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.5rem;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.025em;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .tier-badge.professional {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .tier-badge.enterprise {
      background: #fff3e0;
      color: #e65100;
    }

    .card-description {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      color: var(--demo-text-muted, #64748b);
      line-height: 1.5;
    }

    .card-preview {
      padding: 0.75rem;
      background: var(--demo-bg, #f8fafc);
      border-radius: 6px;
      margin-bottom: 0.75rem;
    }

    .feature-status {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.625rem;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.025em;
      border-radius: 9999px;
    }

    .feature-status.available {
      background: var(--demo-success-bg, #dcfce7);
      color: #166534;
    }

    .feature-status.enterprise {
      background: #fff3e0;
      color: #e65100;
    }

    .locked-state {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--demo-bg, #f8fafc);
      border-radius: 6px;
      color: var(--demo-text-muted, #64748b);
      font-size: 0.875rem;
    }

    .lock-icon {
      font-size: 1rem;
    }

    /* Stats Preview */
    .stats-preview {
      display: flex;
      justify-content: space-around;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--demo-primary, #6366f1);
    }

    .stat-label {
      display: block;
      font-size: 0.6875rem;
      color: var(--demo-text-muted, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    /* Users Preview */
    .users-preview {
      display: flex;
      gap: 0.375rem;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .user-avatar.more {
      background: var(--demo-bg-hover, #f1f5f9);
      color: var(--demo-text-muted, #64748b);
    }

    /* Branding Preview */
    .branding-preview {
      display: flex;
      gap: 0.5rem;
    }

    .color-swatch {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    /* SSO Preview */
    .sso-preview {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .sso-provider {
      padding: 0.375rem 0.5rem;
      background: white;
      border-radius: 4px;
      font-size: 0.8125rem;
      color: var(--demo-text, #1e293b);
      border-left: 2px solid var(--demo-primary, #6366f1);
    }

    /* API Preview */
    .api-preview {
      background: #1e293b;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .api-preview code {
      color: #22c55e;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.75rem;
    }

    @media (max-width: 768px) {
      .demo-header {
        flex-direction: column;
        align-items: stretch;
      }

      .tier-selector {
        flex-direction: column;
        align-items: stretch;
      }

      .tier-buttons {
        justify-content: stretch;
      }

      .tier-btn {
        flex: 1;
        text-align: center;
      }
    }

    @media (max-width: 640px) {
      .demo-card-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFeaturesDemoComponent {
  protected readonly config = inject(AppFeaturesConfigService);

  protected readonly tiers = [
    { id: 'basic' as const, name: 'Basic' },
    { id: 'professional' as const, name: 'Pro' },
    { id: 'enterprise' as const, name: 'Enterprise' },
  ];

  protected readonly hasAnalytics = computed(() =>
    this.config.isFeatureEnabled('analytics')
  );

  protected readonly hasMultiUser = computed(() =>
    this.config.isFeatureEnabled('multi-user')
  );

  protected readonly hasWhiteLabel = computed(() =>
    this.config.isFeatureEnabled('white-label')
  );

  protected readonly hasSso = computed(() =>
    this.config.isFeatureEnabled('sso-integration')
  );

  protected readonly hasApiAccess = computed(() =>
    this.config.isFeatureEnabled('api-access')
  );
}
