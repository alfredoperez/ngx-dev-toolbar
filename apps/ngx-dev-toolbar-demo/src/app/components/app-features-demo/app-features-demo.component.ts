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
      <h2>App Features Demo</h2>
      <p class="demo-instruction">
        Open the App Features Tool from the dev toolbar to test different subscription tiers.
        Force premium features on/off to test upgrade flows and feature gating.
      </p>

      <div class="tier-selector">
        <h3>Current Tier: <span class="tier-badge tier-{{ config.currentTier() }}">{{ getTierDisplayName() }}</span></h3>
        <div class="tier-buttons">
          @for (tier of tiers; track tier.id) {
            <button
              [class.active]="config.currentTier() === tier.id"
              (click)="config.setTier(tier.id)"
              class="tier-btn"
            >
              {{ tier.name }}
            </button>
          }
        </div>
        <p class="hint">💡 Or use the App Features Tool to force specific features</p>
      </div>

      <div class="demo-grid">
        <!-- Analytics Dashboard -->
        @if (hasAnalytics()) {
          <div class="demo-card analytics-card">
            <h3>📊 Analytics Dashboard</h3>
            <p class="card-description">Professional Tier Feature</p>
            <div class="analytics-preview">
              <div class="chart-placeholder">📈 Chart Data</div>
              <div class="stats-row">
                <div class="stat">1,234 Users</div>
                <div class="stat">89% Engagement</div>
              </div>
            </div>
            <span class="feature-badge">Available</span>
          </div>
        } @else {
          <div class="demo-card locked-card">
            <h3>📊 Analytics Dashboard</h3>
            <p class="card-description">Professional Tier Feature</p>
            <div class="feature-locked">
              <span class="lock-icon">🔒</span>
              <p>Upgrade to Professional to unlock</p>
              <button class="btn-upgrade" (click)="config.setTier('professional')">Upgrade Now</button>
            </div>
          </div>
        }

        <!-- Multi-User Support -->
        @if (hasMultiUser()) {
          <div class="demo-card multiuser-card">
            <h3>👥 Multi-User Collaboration</h3>
            <p class="card-description">Professional Tier Feature</p>
            <div class="users-preview">
              <div class="user-avatar">JD</div>
              <div class="user-avatar">AS</div>
              <div class="user-avatar">MK</div>
              <div class="user-avatar">+5</div>
            </div>
            <span class="feature-badge">Available</span>
          </div>
        } @else {
          <div class="demo-card locked-card">
            <h3>👥 Multi-User Collaboration</h3>
            <p class="card-description">Professional Tier Feature</p>
            <div class="feature-locked">
              <span class="lock-icon">🔒</span>
              <p>Upgrade to Professional for team features</p>
            </div>
          </div>
        }

        <!-- White Label Branding -->
        @if (hasWhiteLabel()) {
          <div class="demo-card whitelabel-card">
            <h3>🎨 White Label Branding</h3>
            <p class="card-description">Enterprise Tier Feature</p>
            <div class="branding-preview">
              <div class="color-swatch" style="background: #667eea"></div>
              <div class="color-swatch" style="background: #764ba2"></div>
              <div class="color-swatch" style="background: #f093fb"></div>
            </div>
            <span class="feature-badge enterprise">Enterprise</span>
          </div>
        } @else {
          <div class="demo-card locked-card">
            <h3>🎨 White Label Branding</h3>
            <p class="card-description">Enterprise Tier Feature</p>
            <div class="feature-locked">
              <span class="lock-icon">🔒</span>
              <p>Enterprise exclusive feature</p>
              <button class="btn-upgrade enterprise" (click)="config.setTier('enterprise')">Contact Sales</button>
            </div>
          </div>
        }

        <!-- SSO Integration -->
        @if (hasSso()) {
          <div class="demo-card sso-card">
            <h3>🔐 SSO Integration</h3>
            <p class="card-description">Enterprise Tier Feature</p>
            <div class="sso-preview">
              <div class="sso-provider">Azure AD</div>
              <div class="sso-provider">Okta</div>
              <div class="sso-provider">Google</div>
            </div>
            <span class="feature-badge enterprise">Enterprise</span>
          </div>
        } @else {
          <div class="demo-card locked-card">
            <h3>🔐 SSO Integration</h3>
            <p class="card-description">Enterprise Tier Feature</p>
            <div class="feature-locked">
              <span class="lock-icon">🔒</span>
              <p>Enterprise identity providers</p>
            </div>
          </div>
        }

        <!-- API Access -->
        @if (hasApiAccess()) {
          <div class="demo-card api-card">
            <h3>🔌 API Access</h3>
            <p class="card-description">Enterprise Tier Feature</p>
            <div class="api-preview">
              <code>GET /api/v1/data</code>
              <code>POST /api/v1/resource</code>
            </div>
            <span class="feature-badge enterprise">Enterprise</span>
          </div>
        }
      </div>

      <div class="features-status">
        <h3>Available Features</h3>
        <ul class="features-list">
          <li>Analytics: <strong class="status-{{ hasAnalytics() ? 'enabled' : 'disabled' }}">{{ hasAnalytics() ? 'Available' : 'Locked' }}</strong></li>
          <li>Multi-User: <strong class="status-{{ hasMultiUser() ? 'enabled' : 'disabled' }}">{{ hasMultiUser() ? 'Available' : 'Locked' }}</strong></li>
          <li>White Label: <strong class="status-{{ hasWhiteLabel() ? 'enabled' : 'disabled' }}">{{ hasWhiteLabel() ? 'Available' : 'Locked' }}</strong></li>
          <li>SSO: <strong class="status-{{ hasSso() ? 'enabled' : 'disabled' }}">{{ hasSso() ? 'Available' : 'Locked' }}</strong></li>
          <li>API Access: <strong class="status-{{ hasApiAccess() ? 'enabled' : 'disabled' }}">{{ hasApiAccess() ? 'Available' : 'Locked' }}</strong></li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    .app-features-demo {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .demo-instruction {
      color: #666;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .tier-selector {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .tier-selector h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .tier-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: bold;
    }

    .tier-badge.tier-basic {
      background: #e3f2fd;
      color: #1976d2;
    }

    .tier-badge.tier-professional {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .tier-badge.tier-enterprise {
      background: #fff3e0;
      color: #e65100;
    }

    .tier-buttons {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .tier-btn {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border: 2px solid #ddd;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .tier-btn:hover {
      border-color: #007bff;
      transform: translateY(-2px);
    }

    .tier-btn.active {
      border-color: #007bff;
      background: #e3f2fd;
      font-weight: 600;
    }

    .hint {
      color: #856404;
      background: #fff3cd;
      padding: 0.75rem;
      border-radius: 4px;
      margin: 0;
      font-size: 0.9rem;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .demo-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1.5rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: relative;
      transition: transform 0.2s;
    }

    .demo-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .demo-card h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.3rem;
    }

    .card-description {
      color: #666;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .feature-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.25rem 0.75rem;
      background: #28a745;
      color: white;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .feature-badge.enterprise {
      background: #e65100;
    }

    .locked-card {
      opacity: 0.7;
      background: #f8f9fa;
    }

    .feature-locked {
      text-align: center;
      padding: 1rem;
    }

    .lock-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .feature-locked p {
      color: #666;
      margin: 0.5rem 0;
    }

    .btn-upgrade {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-upgrade:hover {
      background: #0056b3;
      transform: scale(1.05);
    }

    .btn-upgrade.enterprise {
      background: #e65100;
    }

    .btn-upgrade.enterprise:hover {
      background: #bf360c;
    }

    /* Card-specific styles */
    .analytics-preview {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .chart-placeholder {
      padding: 2rem;
      background: white;
      border: 2px dashed #ddd;
      border-radius: 4px;
      text-align: center;
      margin-bottom: 0.75rem;
    }

    .stats-row {
      display: flex;
      justify-content: space-around;
    }

    .stat {
      font-weight: 600;
      color: #007bff;
    }

    .users-preview {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .branding-preview {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
    }

    .color-swatch {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .sso-preview {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
    }

    .sso-provider {
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 3px solid #007bff;
      font-weight: 600;
    }

    .api-preview {
      padding: 1rem;
      background: #1a1a2e;
      border-radius: 4px;
    }

    .api-preview code {
      display: block;
      color: #43e97b;
      font-family: 'Courier New', monospace;
      margin: 0.5rem 0;
    }

    /* Features Status */
    .features-status {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .features-status h3 {
      margin-top: 0;
      color: #333;
    }

    .features-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .features-list li {
      padding: 0.75rem;
      background: white;
      border-radius: 4px;
    }

    .status-enabled {
      color: #28a745;
    }

    .status-disabled {
      color: #dc3545;
    }

    @media (max-width: 768px) {
      .demo-grid {
        grid-template-columns: 1fr;
      }

      .tier-buttons {
        flex-direction: column;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFeaturesDemoComponent {
  protected readonly config = inject(AppFeaturesConfigService);

  protected readonly tiers = [
    { id: 'basic' as const, name: 'Basic (Free)' },
    { id: 'professional' as const, name: 'Professional' },
    { id: 'enterprise' as const, name: 'Enterprise' },
  ];

  // Computed signals for each feature
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

  protected getTierDisplayName(): string {
    const tier = this.config.currentTier();
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  }
}
