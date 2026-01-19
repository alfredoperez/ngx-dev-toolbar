import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DemoPermissionsService } from '../../services/demo-permissions.service';

/**
 * Demo component showcasing permission-based UI.
 *
 * Demonstrates how permissions control UI visibility and actions
 * in real-time using the dev toolbar.
 */
@Component({
  selector: 'app-permission-demo',
  standalone: true,
  template: `
    <section class="permission-demo">
      <div class="demo-header">
        <h2>Permissions</h2>
        <p class="demo-description">
          Toggle permissions using the toolbar below to test permission-based UI patterns.
        </p>
      </div>

      <div class="demo-card-grid">
        <!-- Add Users Permission -->
        <div class="demo-card">
          <div class="card-header">
            <h3>Add Users</h3>
            <span class="status-badge" [class.on]="canAddUsers()" [class.off]="!canAddUsers()">
              {{ canAddUsers() ? 'GRANTED' : 'DENIED' }}
            </span>
          </div>
          <p class="card-description">Permission to create new user accounts</p>
          @if (canAddUsers()) {
            <div class="card-preview">
              <div class="user-row">
                <span class="avatar">JD</span>
                <span class="user-name">John Doe</span>
                <button class="btn-small">Edit</button>
              </div>
              <div class="user-row">
                <span class="avatar">JS</span>
                <span class="user-name">Jane Smith</span>
                <button class="btn-small">Edit</button>
              </div>
              <button class="btn-primary">+ Add User</button>
            </div>
          } @else {
            <div class="locked-state">
              <span class="lock-icon">🔒</span>
              <span>Permission required</span>
            </div>
          }
        </div>

        <!-- Manage Comments Permission -->
        <div class="demo-card">
          <div class="card-header">
            <h3>Manage Comments</h3>
            <span class="status-badge" [class.on]="canManageComments()" [class.off]="!canManageComments()">
              {{ canManageComments() ? 'GRANTED' : 'DENIED' }}
            </span>
          </div>
          <p class="card-description">Permission to moderate user comments</p>
          @if (canManageComments()) {
            <div class="card-preview action-buttons">
              <button class="btn-outline">View Comments</button>
              <button class="btn-danger">Delete Spam</button>
            </div>
          } @else {
            <div class="locked-state">
              <span class="lock-icon">🔒</span>
              <span>Permission required</span>
            </div>
          }
        </div>

        <!-- View Dashboard Permission -->
        <div class="demo-card">
          <div class="card-header">
            <h3>View Dashboard</h3>
            <span class="status-badge" [class.on]="canViewDashboard()" [class.off]="!canViewDashboard()">
              {{ canViewDashboard() ? 'GRANTED' : 'DENIED' }}
            </span>
          </div>
          <p class="card-description">Permission to view analytics dashboard</p>
          @if (canViewDashboard()) {
            <div class="card-preview stats-preview">
              <div class="stat-item">
                <span class="stat-value">1,234</span>
                <span class="stat-label">Visitors</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">567</span>
                <span class="stat-label">Views</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">89%</span>
                <span class="stat-label">Rate</span>
              </div>
            </div>
          } @else {
            <div class="locked-state">
              <span class="lock-icon">🔒</span>
              <span>Permission required</span>
            </div>
          }
        </div>

        <!-- Admin Permission -->
        <div class="demo-card" [class.admin-card]="isAdmin()">
          <div class="card-header">
            <h3>Admin Access</h3>
            <span class="status-badge" [class.on]="isAdmin()" [class.off]="!isAdmin()">
              {{ isAdmin() ? 'GRANTED' : 'DENIED' }}
            </span>
          </div>
          <p class="card-description">Full administrative access to the system</p>
          @if (isAdmin()) {
            <div class="card-preview admin-actions">
              <button class="btn-admin">System Settings</button>
              <button class="btn-admin">View Logs</button>
              <button class="btn-admin">Manage Roles</button>
            </div>
          } @else {
            <div class="locked-state">
              <span class="lock-icon">🔒</span>
              <span>Admin access required</span>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .permission-demo {
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

    .demo-card.admin-card {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-color: transparent;
    }

    .demo-card.admin-card .card-header h3,
    .demo-card.admin-card .card-description {
      color: white;
    }

    .demo-card.admin-card .status-badge.on {
      background: rgba(255, 255, 255, 0.2);
      color: white;
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
      background: var(--demo-danger-bg, #fee2e2);
      color: #991b1b;
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

    /* User List */
    .user-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      background: white;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6875rem;
      font-weight: 600;
    }

    .user-name {
      flex: 1;
      font-size: 0.8125rem;
      color: var(--demo-text, #1e293b);
    }

    /* Buttons */
    .btn-small {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      background: var(--demo-bg, #f8fafc);
      border: 1px solid var(--demo-border, #e2e8f0);
      border-radius: 4px;
      cursor: pointer;
      color: var(--demo-text-muted, #64748b);
    }

    .btn-small:hover {
      background: white;
    }

    .btn-primary {
      width: 100%;
      padding: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 500;
      background: var(--demo-primary, #6366f1);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 0.5rem;
    }

    .btn-primary:hover {
      background: var(--demo-primary-hover, #4f46e5);
    }

    .btn-outline {
      flex: 1;
      padding: 0.5rem;
      font-size: 0.8125rem;
      background: white;
      border: 1px solid var(--demo-border, #e2e8f0);
      border-radius: 4px;
      cursor: pointer;
      color: var(--demo-text, #1e293b);
    }

    .btn-danger {
      flex: 1;
      padding: 0.5rem;
      font-size: 0.8125rem;
      background: var(--demo-danger, #ef4444);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-admin {
      width: 100%;
      padding: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 0.5rem;
    }

    .btn-admin:last-child {
      margin-bottom: 0;
    }

    .btn-admin:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    /* Stats Preview */
    .stats-preview {
      display: flex;
      justify-content: space-between;
      background: white;
      border: 1px solid var(--demo-border, #e2e8f0);
    }

    .stat-item {
      text-align: center;
      padding: 0.5rem;
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

    /* Admin Actions */
    .admin-actions {
      display: flex;
      flex-direction: column;
      background: transparent;
      padding: 0;
    }

    @media (max-width: 640px) {
      .demo-card-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionDemoComponent {
  private readonly permissionsService = inject(DemoPermissionsService);

  protected readonly canAddUsers = this.permissionsService.hasPermission('can-add-users');
  protected readonly canAddPermissions = this.permissionsService.hasPermission('can-add-permissions');
  protected readonly canManageComments = this.permissionsService.hasPermission('can-manage-comments');
  protected readonly canViewDashboard = this.permissionsService.hasPermission('can-view-dashboard');
  protected readonly isAdmin = this.permissionsService.hasPermission('can-admin');
}
