import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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
      <h2>Feature Flags Demo</h2>
      <p class="demo-instruction">
        Open the Feature Flags Tool from the dev toolbar to enable/disable features.
        Watch the UI update in real-time as you toggle flags.
      </p>

      <div class="demo-grid">
        <!-- Dark Mode Feature -->
        @if (darkModeEnabled()) {
          <div class="demo-card dark-mode-card">
            <h3>🌙 Dark Mode</h3>
            <p class="card-description">Dark theme is enabled</p>
            <div class="dark-mode-preview">
              <div class="preview-section">Dark UI Preview</div>
              <div class="preview-section">Reduced eye strain</div>
              <div class="preview-section">Better for night coding</div>
            </div>
          </div>
        } @else {
          <div class="demo-card">
            <h3>☀️ Light Mode</h3>
            <p class="card-description">Enable dark mode flag to see dark theme</p>
            <div class="feature-disabled">
              <span class="icon">🚫</span>
              <span>Dark mode flag is disabled</span>
            </div>
          </div>
        }

        <!-- New Layout Feature -->
        @if (newLayoutEnabled()) {
          <div class="demo-card new-layout-card">
            <h3>✨ Modern Layout</h3>
            <p class="card-description">Using the new responsive layout</p>
            <div class="layout-preview">
              <div class="layout-grid">
                <div class="layout-cell">Responsive</div>
                <div class="layout-cell">Flexible</div>
                <div class="layout-cell">Modern</div>
              </div>
            </div>
          </div>
        } @else {
          <div class="demo-card">
            <h3>📐 Classic Layout</h3>
            <p class="card-description">Enable new layout flag to see modern design</p>
            <div class="feature-disabled">
              <span class="icon">🚫</span>
              <span>New layout flag is disabled</span>
            </div>
          </div>
        }

        <!-- Beta Features -->
        @if (betaFeaturesEnabled()) {
          <div class="demo-card beta-card">
            <h3>🧪 Beta Features</h3>
            <p class="card-description">Experimental features unlocked</p>
            <div class="beta-features-list">
              <div class="beta-feature">⚡ Performance Mode</div>
              <div class="beta-feature">🔍 Advanced Search</div>
              <div class="beta-feature">📊 Real-time Analytics</div>
            </div>
          </div>
        }

        <!-- Experimental UI -->
        @if (experimentalUiEnabled()) {
          <div class="demo-card experimental-card">
            <h3>🚀 Experimental UI</h3>
            <p class="card-description">Cutting-edge UI components</p>
            <button class="btn-experimental">Try New Button Style</button>
            <div class="experimental-badge">EXPERIMENTAL</div>
          </div>
        }
      </div>

      <div class="flags-status">
        <h3>Current Feature Flags</h3>
        <ul class="flags-list">
          <li>Dark Mode: <strong class="status-{{ darkModeEnabled() ? 'enabled' : 'disabled' }}">{{ darkModeEnabled() ? 'Enabled' : 'Disabled' }}</strong></li>
          <li>New Layout: <strong class="status-{{ newLayoutEnabled() ? 'enabled' : 'disabled' }}">{{ newLayoutEnabled() ? 'Enabled' : 'Disabled' }}</strong></li>
          <li>Beta Features: <strong class="status-{{ betaFeaturesEnabled() ? 'enabled' : 'disabled' }}">{{ betaFeaturesEnabled() ? 'Enabled' : 'Disabled' }}</strong></li>
          <li>Experimental UI: <strong class="status-{{ experimentalUiEnabled() ? 'enabled' : 'disabled' }}">{{ experimentalUiEnabled() ? 'Enabled' : 'Disabled' }}</strong></li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    .feature-flags-demo {
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

    .feature-disabled {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
      color: #666;
      font-size: 0.9rem;
    }

    .feature-disabled .icon {
      font-size: 1.5rem;
    }

    /* Dark Mode Card */
    .dark-mode-card {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      border: none;
    }

    .dark-mode-card h3,
    .dark-mode-card .card-description {
      color: white;
    }

    .dark-mode-preview {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .preview-section {
      padding: 0.75rem;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      border-left: 3px solid #00d4ff;
    }

    /* New Layout Card */
    .new-layout-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
    }

    .new-layout-card h3,
    .new-layout-card .card-description {
      color: white;
    }

    .layout-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .layout-cell {
      padding: 0.75rem;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      text-align: center;
      font-size: 0.9rem;
    }

    /* Beta Card */
    .beta-card {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      border: none;
    }

    .beta-card h3,
    .beta-card .card-description {
      color: white;
    }

    .beta-features-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .beta-feature {
      padding: 0.75rem;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      font-size: 0.95rem;
    }

    /* Experimental Card */
    .experimental-card {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: #333;
      border: none;
      position: relative;
    }

    .btn-experimental {
      width: 100%;
      padding: 0.75rem;
      margin: 1rem 0;
      background: white;
      color: #333;
      border: 2px solid #43e97b;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-experimental:hover {
      background: #43e97b;
      color: white;
      transform: scale(1.05);
    }

    .experimental-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.25rem 0.75rem;
      background: rgba(255,255,255,0.9);
      color: #333;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: bold;
    }

    /* Flags Status */
    .flags-status {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .flags-status h3 {
      margin-top: 0;
      color: #333;
    }

    .flags-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .flags-list li {
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
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureFlagsDemoComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);

  // Computed signals for each feature flag
  protected readonly darkModeEnabled = computed(() =>
    this.featureFlagsService.isEnabled('darkMode')
  );

  protected readonly newLayoutEnabled = computed(() =>
    this.featureFlagsService.isEnabled('newDemoApplicationLayout')
  );

  protected readonly betaFeaturesEnabled = computed(() =>
    this.featureFlagsService.isEnabled('betaFeatures')
  );

  protected readonly experimentalUiEnabled = computed(() =>
    this.featureFlagsService.isEnabled('experimentalUI')
  );
}
