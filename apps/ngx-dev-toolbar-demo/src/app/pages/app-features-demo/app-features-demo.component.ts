import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AppFeaturesConfigService, ProductTier } from '../../services/app-features-config.service';

/**
 * Demo component showcasing app features and product tier scenarios.
 *
 * Demonstrates how features can be toggled based on subscription tiers
 * and how the dev toolbar can force features for testing.
 */
@Component({
  selector: 'app-features-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="demo-container">
      <h1>App Features Demo</h1>
      <p class="subtitle">
        Test product-level feature availability across different subscription
        tiers
      </p>

      <!-- Tier Selector -->
      <div class="tier-selector">
        <h2>Current Tier</h2>
        <div class="tier-buttons">
          @for (tier of tiers; track tier.id) {
          <button
            [class.active]="config.currentTier() === tier.id"
            (click)="config.setTier(tier.id)"
            class="tier-button"
            [attr.data-tier]="tier.id"
          >
            <strong>{{ tier.name }}</strong>
            <span>{{ config.getFeatureCount(tier.id) }} features</span>
          </button>
          }
        </div>
        <p class="hint">
          <strong>💡 Tip:</strong> Use the dev toolbar (Ctrl+Shift+D) to force
          features enabled/disabled and test upgrade/downgrade scenarios!
        </p>
      </div>

      <!-- Feature Grid -->
      <div class="features-grid">
        <!-- Basic Tier Features -->
        <div class="feature-category">
          <h3>Basic Tier Features</h3>
          <div class="feature-cards">
            <div
              class="feature-card"
              [class.enabled]="isEnabled('core-features')"
            >
              <div class="feature-icon">📦</div>
              <h4>Core Features</h4>
              <p>Essential app functionality</p>
              <span class="status">{{
                getStatusLabel('core-features')
              }}</span>
            </div>

            <div
              class="feature-card"
              [class.enabled]="isEnabled('single-user')"
            >
              <div class="feature-icon">👤</div>
              <h4>Single User Mode</h4>
              <p>Personal workspace</p>
              <span class="status">{{ getStatusLabel('single-user') }}</span>
            </div>

            <div
              class="feature-card"
              [class.enabled]="isEnabled('basic-support')"
            >
              <div class="feature-icon">💬</div>
              <h4>Basic Support</h4>
              <p>48-hour email support</p>
              <span class="status">{{ getStatusLabel('basic-support') }}</span>
            </div>

            <div
              class="feature-card"
              [class.enabled]="isEnabled('community-access')"
            >
              <div class="feature-icon">🌐</div>
              <h4>Community Access</h4>
              <p>Forums & knowledge base</p>
              <span class="status">{{
                getStatusLabel('community-access')
              }}</span>
            </div>
          </div>
        </div>

        <!-- Professional Tier Features -->
        <div class="feature-category">
          <h3>Professional Tier Features</h3>
          <div class="feature-cards">
            <div class="feature-card" [class.enabled]="isEnabled('analytics')">
              <div class="feature-icon">📊</div>
              <h4>Analytics Dashboard</h4>
              <p>Advanced data visualization</p>
              <span class="status">{{ getStatusLabel('analytics') }}</span>
              @if (!isEnabled('analytics')) {
              <button class="upgrade-btn" (click)="upgradeTier('professional')">
                Upgrade to Pro
              </button>
              }
            </div>

            <div
              class="feature-card"
              [class.enabled]="isEnabled('multi-user')"
            >
              <div class="feature-icon">👥</div>
              <h4>Multi-User Support</h4>
              <p>Team collaboration</p>
              <span class="status">{{ getStatusLabel('multi-user') }}</span>
              @if (!isEnabled('multi-user')) {
              <button class="upgrade-btn" (click)="upgradeTier('professional')">
                Upgrade to Pro
              </button>
              }
            </div>

            <div
              class="feature-card"
              [class.enabled]="isEnabled('priority-support')"
            >
              <div class="feature-icon">⚡</div>
              <h4>Priority Support</h4>
              <p>24/7 with 4-hour SLA</p>
              <span class="status">{{
                getStatusLabel('priority-support')
              }}</span>
              @if (!isEnabled('priority-support')) {
              <button class="upgrade-btn" (click)="upgradeTier('professional')">
                Upgrade to Pro
              </button>
              }
            </div>

            <div
              class="feature-card"
              [class.enabled]="isEnabled('advanced-reporting')"
            >
              <div class="feature-icon">📈</div>
              <h4>Advanced Reporting</h4>
              <p>Custom reports & exports</p>
              <span class="status">{{
                getStatusLabel('advanced-reporting')
              }}</span>
              @if (!isEnabled('advanced-reporting')) {
              <button class="upgrade-btn" (click)="upgradeTier('professional')">
                Upgrade to Pro
              </button>
              }
            </div>
          </div>
        </div>

        <!-- Enterprise Tier Features -->
        <div class="feature-category">
          <h3>Enterprise Tier Features</h3>
          <div class="feature-cards">
            <div
              class="feature-card"
              [class.enabled]="isEnabled('white-label')"
            >
              <div class="feature-icon">🎨</div>
              <h4>White Label Branding</h4>
              <p>Custom branding & colors</p>
              <span class="status">{{ getStatusLabel('white-label') }}</span>
              @if (!isEnabled('white-label')) {
              <button class="upgrade-btn" (click)="upgradeTier('enterprise')">
                Upgrade to Enterprise
              </button>
              }
            </div>

            <div
              class="feature-card"
              [class.enabled]="isEnabled('sso-integration')"
            >
              <div class="feature-icon">🔐</div>
              <h4>SSO Integration</h4>
              <p>Enterprise identity providers</p>
              <span class="status">{{
                getStatusLabel('sso-integration')
              }}</span>
              @if (!isEnabled('sso-integration')) {
              <button class="upgrade-btn" (click)="upgradeTier('enterprise')">
                Upgrade to Enterprise
              </button>
              }
            </div>

            <div
              class="feature-card"
              [class.enabled]="isEnabled('api-access')"
            >
              <div class="feature-icon">🔌</div>
              <h4>API Access</h4>
              <p>Full REST API integration</p>
              <span class="status">{{ getStatusLabel('api-access') }}</span>
              @if (!isEnabled('api-access')) {
              <button class="upgrade-btn" (click)="upgradeTier('enterprise')">
                Upgrade to Enterprise
              </button>
              }
            </div>

            <div
              class="feature-card"
              [class.enabled]="isEnabled('dedicated-support')"
            >
              <div class="feature-icon">🎯</div>
              <h4>Dedicated Support</h4>
              <p>Account manager & 1-hour SLA</p>
              <span class="status">{{
                getStatusLabel('dedicated-support')
              }}</span>
              @if (!isEnabled('dedicated-support')) {
              <button class="upgrade-btn" (click)="upgradeTier('enterprise')">
                Upgrade to Enterprise
              </button>
              }
            </div>

            <div
              class="feature-card"
              [class.enabled]="isEnabled('custom-integrations')"
            >
              <div class="feature-icon">🛠️</div>
              <h4>Custom Integrations</h4>
              <p>Engineering team support</p>
              <span class="status">{{
                getStatusLabel('custom-integrations')
              }}</span>
              @if (!isEnabled('custom-integrations')) {
              <button class="upgrade-btn" (click)="upgradeTier('enterprise')">
                Upgrade to Enterprise
              </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: #2c3e50;
      }

      .subtitle {
        font-size: 1.1rem;
        color: #7f8c8d;
        margin-bottom: 2rem;
      }

      .tier-selector {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }

      .tier-selector h2 {
        font-size: 1.3rem;
        margin-bottom: 1rem;
        color: #2c3e50;
      }

      .tier-buttons {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .tier-button {
        flex: 1;
        padding: 1rem;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .tier-button:hover {
        border-color: #3498db;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .tier-button.active {
        border-color: #3498db;
        background: #e3f2fd;
      }

      .tier-button[data-tier='professional'].active {
        border-color: #9b59b6;
        background: #f3e5f5;
      }

      .tier-button[data-tier='enterprise'].active {
        border-color: #e67e22;
        background: #fff3e0;
      }

      .tier-button strong {
        font-size: 1.1rem;
      }

      .tier-button span {
        font-size: 0.9rem;
        color: #7f8c8d;
      }

      .hint {
        padding: 0.75rem;
        background: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 4px;
        color: #856404;
        font-size: 0.9rem;
      }

      .features-grid {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .feature-category h3 {
        font-size: 1.3rem;
        margin-bottom: 1rem;
        color: #2c3e50;
      }

      .feature-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }

      .feature-card {
        padding: 1.5rem;
        border: 2px solid #dee2e6;
        border-radius: 8px;
        background: white;
        transition: all 0.2s;
        position: relative;
        opacity: 0.5;
      }

      .feature-card.enabled {
        opacity: 1;
        border-color: #27ae60;
        background: #f0fdf4;
      }

      .feature-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      .feature-card h4 {
        font-size: 1.1rem;
        margin: 0.5rem 0;
        color: #2c3e50;
      }

      .feature-card p {
        font-size: 0.9rem;
        color: #7f8c8d;
        margin: 0.5rem 0;
      }

      .status {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-top: 0.5rem;
      }

      .feature-card.enabled .status {
        background: #d1fae5;
        color: #065f46;
      }

      .feature-card:not(.enabled) .status {
        background: #fee2e2;
        color: #991b1b;
      }

      .upgrade-btn {
        margin-top: 0.75rem;
        padding: 0.5rem 1rem;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        width: 100%;
        transition: background 0.2s;
      }

      .upgrade-btn:hover {
        background: #2980b9;
      }
    `,
  ],
})
export class AppFeaturesDemoComponent {
  protected readonly config = inject(AppFeaturesConfigService);

  protected readonly tiers: Array<{ id: ProductTier; name: string }> = [
    { id: 'basic', name: 'Basic (Free)' },
    { id: 'professional', name: 'Professional ($29/mo)' },
    { id: 'enterprise', name: 'Enterprise ($99/mo)' },
  ];

  protected isEnabled(featureId: string): boolean {
    return this.config.isFeatureEnabled(featureId);
  }

  protected getStatusLabel(featureId: string): string {
    return this.isEnabled(featureId) ? '✓ Available' : '✗ Unavailable';
  }

  protected upgradeTier(tier: ProductTier): void {
    this.config.setTier(tier);
  }
}
