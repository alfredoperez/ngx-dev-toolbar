import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FeatureFlagsService } from '../../services/feature-flags.service';

/**
 * Demo component showcasing feature flag toggling.
 *
 * Demonstrates how feature flags can control UI visibility and behavior
 * in real-time using the dev toolbar.
 */
@Component({
  selector: 'app-feature-flags-demo',
  standalone: true,
  template: `
    <section class="feature-flags-demo">
      <div class="demo-header">
        <h2>Feature Flags</h2>
        <p class="demo-description">
          Toggle feature flags using the toolbar below to see how UI components respond in real-time.
        </p>
      </div>

      <div class="demo-card-grid">
        <!-- Dark Mode Feature -->
        <div class="demo-card">
          <div class="card-header">
            <h3>Dark Mode</h3>
            <span class="status-badge" [class.on]="darkModeEnabled()" [class.off]="!darkModeEnabled()">
              {{ darkModeEnabled() ? 'ON' : 'OFF' }}
            </span>
          </div>
          <p class="card-description">Enable dark theme throughout the application</p>
          @if (darkModeEnabled()) {
            <div class="card-preview dark-preview">
              <div class="preview-item">Dark UI Active</div>
              <div class="preview-item">Reduced Eye Strain</div>
            </div>
          }
        </div>

        <!-- New Dashboard Feature -->
        <div class="demo-card">
          <div class="card-header">
            <h3>New Dashboard</h3>
            <span class="status-badge" [class.on]="newLayoutEnabled()" [class.off]="!newLayoutEnabled()">
              {{ newLayoutEnabled() ? 'ON' : 'OFF' }}
            </span>
          </div>
          <p class="card-description">Enable the redesigned dashboard experience</p>
          @if (newLayoutEnabled()) {
            <div class="card-preview layout-preview">
              <div class="layout-grid">
                <div class="layout-cell"></div>
                <div class="layout-cell"></div>
                <div class="layout-cell"></div>
              </div>
            </div>
          }
        </div>

        <!-- Beta Features -->
        <div class="demo-card">
          <div class="card-header">
            <h3>Beta Features</h3>
            <span class="status-badge" [class.on]="betaFeaturesEnabled()" [class.off]="!betaFeaturesEnabled()">
              {{ betaFeaturesEnabled() ? 'ON' : 'OFF' }}
            </span>
          </div>
          <p class="card-description">Enable experimental beta features</p>
          @if (betaFeaturesEnabled()) {
            <div class="card-preview beta-preview">
              <div class="beta-item">Performance Mode</div>
              <div class="beta-item">Advanced Search</div>
              <div class="beta-item">Real-time Analytics</div>
            </div>
          }
        </div>

        <!-- New Notifications -->
        <div class="demo-card">
          <div class="card-header">
            <h3>New Notifications</h3>
            <span class="status-badge" [class.on]="newNotificationsEnabled()" [class.off]="!newNotificationsEnabled()">
              {{ newNotificationsEnabled() ? 'ON' : 'OFF' }}
            </span>
          </div>
          <p class="card-description">Enable the new notifications system</p>
          @if (newNotificationsEnabled()) {
            <div class="card-preview notifications-preview">
              <div class="notification-item">
                <span class="notification-dot"></span>
                New message received
              </div>
              <div class="notification-item">
                <span class="notification-dot success"></span>
                Task completed
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .feature-flags-demo {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .demo-header {
      margin-bottom: 1.5rem;
    }

    .demo-header h2 {
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
    }

    .demo-card:hover {
      border-color: var(--demo-primary, #6366f1);
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

    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.625rem;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.025em;
      border-radius: 9999px;
      flex-shrink: 0;
    }

    .status-badge.on {
      background: var(--demo-success-bg, #dcfce7);
      color: #166534;
    }

    .status-badge.off {
      background: var(--demo-bg, #f8fafc);
      color: var(--demo-text-muted, #64748b);
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
    }

    /* Dark Mode Preview */
    .dark-preview {
      background: #1e293b;
    }

    .dark-preview .preview-item {
      padding: 0.5rem;
      color: #94a3b8;
      font-size: 0.8125rem;
      border-left: 2px solid #6366f1;
      margin-bottom: 0.5rem;
      padding-left: 0.75rem;
    }

    .dark-preview .preview-item:last-child {
      margin-bottom: 0;
    }

    /* Layout Preview */
    .layout-preview {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    }

    .layout-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .layout-cell {
      height: 2rem;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }

    /* Beta Preview */
    .beta-preview {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .beta-item {
      padding: 0.375rem 0.5rem;
      background: white;
      border-radius: 4px;
      font-size: 0.8125rem;
      color: var(--demo-text, #1e293b);
      border-left: 2px solid #f59e0b;
    }

    /* Notifications Preview */
    .notifications-preview {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: white;
      border: 1px solid var(--demo-border, #e2e8f0);
    }

    .notification-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      font-size: 0.8125rem;
      color: var(--demo-text, #1e293b);
      background: var(--demo-bg, #f8fafc);
      border-radius: 4px;
    }

    .notification-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #3b82f6;
      flex-shrink: 0;
    }

    .notification-dot.success {
      background: #22c55e;
    }

    @media (max-width: 640px) {
      .demo-card-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureFlagsDemoComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);

  protected readonly darkModeEnabled = this.featureFlagsService.getFlag('dark-mode');
  protected readonly newLayoutEnabled = this.featureFlagsService.getFlag('new-dashboard');
  protected readonly betaFeaturesEnabled = this.featureFlagsService.getFlag('beta-features');
  protected readonly newNotificationsEnabled = this.featureFlagsService.getFlag('new-notifications');
}
