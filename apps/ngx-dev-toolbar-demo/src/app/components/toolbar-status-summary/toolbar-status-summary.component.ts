import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DemoPermissionsService } from '../../services/demo-permissions.service';
import { FeatureFlagsService } from '../../services/feature-flags.service';
import { AppFeaturesConfigService } from '../../services/app-features-config.service';
import { DevToolbarPermissionsService, DevToolbarFeatureFlagService, DevToolbarAppFeaturesService } from 'ngx-dev-toolbar';

/**
 * Summary component showing currently forced values across all tools.
 * Provides at-a-glance view without scrolling.
 */
@Component({
  selector: 'app-toolbar-status-summary',
  standalone: true,
  template: `
    <section class="status-summary">
      <h2>Dev Toolbar Status</h2>
      <p class="subtitle">
        Open the toolbar (Ctrl+Shift+D) to force permissions, flags, or features. Changes reflect instantly below.
      </p>

      <div class="summary-grid">
        <!-- Permissions Card -->
        <div class="summary-card permissions-card">
          <div class="card-header">
            <span class="icon">🔐</span>
            <h3>Permissions</h3>
          </div>
          <div class="card-content">
            @if (forcedPermissions().length > 0) {
              <div class="forced-items">
                @for (perm of forcedPermissions(); track perm.id) {
                  <div class="forced-item" [class.granted]="perm.isGranted" [class.denied]="!perm.isGranted">
                    <span class="status-icon">{{ perm.isGranted ? '✓' : '✗' }}</span>
                    <span class="item-name">{{ perm.name }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state">
                <span class="empty-icon">🔓</span>
                <p>No forced permissions</p>
                <small>Using natural state</small>
              </div>
            }
          </div>
          <div class="card-footer">
            <span class="count">{{ forcedPermissions().length }} forced</span>
          </div>
        </div>

        <!-- Feature Flags Card -->
        <div class="summary-card flags-card">
          <div class="card-header">
            <span class="icon">🚩</span>
            <h3>Feature Flags</h3>
          </div>
          <div class="card-content">
            @if (forcedFlags().length > 0) {
              <div class="forced-items">
                @for (flag of forcedFlags(); track flag.id) {
                  <div class="forced-item" [class.granted]="flag.isEnabled" [class.denied]="!flag.isEnabled">
                    <span class="status-icon">{{ flag.isEnabled ? '✓' : '✗' }}</span>
                    <span class="item-name">{{ flag.name }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state">
                <span class="empty-icon">🏳️</span>
                <p>No forced flags</p>
                <small>Using natural state</small>
              </div>
            }
          </div>
          <div class="card-footer">
            <span class="count">{{ forcedFlags().length }} forced</span>
          </div>
        </div>

        <!-- App Features Card -->
        <div class="summary-card features-card">
          <div class="card-header">
            <span class="icon">🧩</span>
            <h3>App Features</h3>
          </div>
          <div class="card-content">
            @if (forcedFeatures().length > 0) {
              <div class="forced-items">
                @for (feature of forcedFeatures(); track feature.id) {
                  <div class="forced-item" [class.granted]="feature.isEnabled" [class.denied]="!feature.isEnabled">
                    <span class="status-icon">{{ feature.isEnabled ? '✓' : '✗' }}</span>
                    <span class="item-name">{{ feature.name }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state">
                <span class="empty-icon">📦</span>
                <p>No forced features</p>
                <small>Tier: {{ currentTier() }}</small>
              </div>
            }
          </div>
          <div class="card-footer">
            <span class="count">{{ forcedFeatures().length }} forced</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .status-summary {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    h2 {
      font-size: 2.5rem;
      margin: 0 0 0.5rem 0;
      color: #1a1a2e;
      font-weight: 700;
    }

    .subtitle {
      color: #666;
      font-size: 1.1rem;
      margin: 0 0 2rem 0;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .summary-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
      overflow: hidden;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .summary-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    }

    .permissions-card {
      border-color: #e3f2fd;
    }

    .permissions-card:hover {
      border-color: #2196f3;
    }

    .flags-card {
      border-color: #f3e5f5;
    }

    .flags-card:hover {
      border-color: #9c27b0;
    }

    .features-card {
      border-color: #fff3e0;
    }

    .features-card:hover {
      border-color: #ff9800;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1.5rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 1px solid #dee2e6;
    }

    .permissions-card .card-header {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    }

    .flags-card .card-header {
      background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
    }

    .features-card .card-header {
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    }

    .card-header .icon {
      font-size: 1.75rem;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #333;
      font-weight: 600;
    }

    .card-content {
      padding: 1.5rem;
      min-height: 180px;
      max-height: 240px;
      overflow-y: auto;
    }

    .card-content::-webkit-scrollbar {
      width: 6px;
    }

    .card-content::-webkit-scrollbar-track {
      background: #f8f9fa;
      border-radius: 3px;
    }

    .card-content::-webkit-scrollbar-thumb {
      background: #dee2e6;
      border-radius: 3px;
    }

    .card-content::-webkit-scrollbar-thumb:hover {
      background: #adb5bd;
    }

    .forced-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .forced-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 3px solid #dee2e6;
      transition: all 0.2s;
    }

    .forced-item.granted {
      background: #d4edda;
      border-left-color: #28a745;
    }

    .forced-item.denied {
      background: #f8d7da;
      border-left-color: #dc3545;
    }

    .status-icon {
      font-weight: bold;
      font-size: 1.1rem;
    }

    .forced-item.granted .status-icon {
      color: #28a745;
    }

    .forced-item.denied .status-icon {
      color: #dc3545;
    }

    .item-name {
      flex: 1;
      font-size: 0.95rem;
      font-weight: 500;
      color: #333;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      color: #999;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 0.75rem;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      font-weight: 500;
      color: #666;
    }

    .empty-state small {
      font-size: 0.85rem;
      color: #999;
    }

    .card-footer {
      padding: 0.75rem 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .count {
      font-size: 0.9rem;
      font-weight: 600;
      color: #666;
    }

    @media (max-width: 1024px) {
      .summary-grid {
        grid-template-columns: 1fr;
      }

      .card-content {
        min-height: 140px;
        max-height: 200px;
      }
    }

    @media (max-width: 768px) {
      .status-summary {
        padding: 1rem;
      }

      h2 {
        font-size: 2rem;
      }

      .subtitle {
        font-size: 1rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarStatusSummaryComponent {
  private readonly permissionsService = inject(DevToolbarPermissionsService);
  private readonly flagsService = inject(DevToolbarFeatureFlagService);
  private readonly featuresService = inject(DevToolbarAppFeaturesService);
  private readonly appFeaturesConfig = inject(AppFeaturesConfigService);

  // Convert observables to signals
  protected readonly forcedPermissions = toSignal(
    this.permissionsService.getForcedValues(),
    { initialValue: [] }
  );

  protected readonly forcedFlags = toSignal(
    this.flagsService.getForcedValues(),
    { initialValue: [] }
  );

  protected readonly forcedFeatures = toSignal(
    this.featuresService.getForcedValues(),
    { initialValue: [] }
  );

  protected readonly currentTier = this.appFeaturesConfig.currentTier;
}
