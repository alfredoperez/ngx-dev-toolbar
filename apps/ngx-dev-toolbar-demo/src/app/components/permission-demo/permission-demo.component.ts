import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DemoPermissionsService } from '../../services/demo-permissions.service';

@Component({
  selector: 'app-permission-demo',
  standalone: true,
  template: `
    <section class="permission-demo">
      <h2>Permissions Demo</h2>
      <p class="demo-instruction">
        Open the Permissions Tool from the dev toolbar below to test permission-based UI.
        Toggle permissions to see how the UI responds in real-time.
      </p>

      <div class="demo-grid">
        <!-- Edit Posts Section -->
        <div class="demo-card">
          <h3>Blog Posts</h3>
          <p class="card-description">Manage blog content</p>
          <div class="card-actions">
            @if (canEdit()) {
              <button class="btn btn-primary">
                Edit Post
              </button>
            } @else {
              <div class="permission-message">
                <span class="icon">🔒</span>
                <span>Edit permission required</span>
              </div>
            }

            @if (canDelete()) {
              <button class="btn btn-danger">
                Delete Post
              </button>
            } @else {
              <div class="permission-message">
                <span class="icon">🔒</span>
                <span>Delete permission required</span>
              </div>
            }
          </div>
        </div>

        <!-- User Management Section -->
        <div class="demo-card">
          <h3>User Management</h3>
          <p class="card-description">Manage user accounts</p>
          @if (canManageUsers()) {
            <div class="user-list">
              <div class="user-item">
                <span>John Doe</span>
                <button class="btn btn-sm">Edit</button>
              </div>
              <div class="user-item">
                <span>Jane Smith</span>
                <button class="btn btn-sm">Edit</button>
              </div>
            </div>
          } @else {
            <div class="permission-message">
              <span class="icon">🔒</span>
              <span>User management permission required</span>
            </div>
          }
        </div>

        <!-- Analytics Dashboard Section -->
        @if (canViewAnalytics()) {
          <div class="demo-card analytics-card">
            <h3>Analytics Dashboard</h3>
            <p class="card-description">View site metrics</p>
            <div class="analytics-stats">
              <div class="stat">
                <span class="stat-value">1,234</span>
                <span class="stat-label">Visitors</span>
              </div>
              <div class="stat">
                <span class="stat-value">567</span>
                <span class="stat-label">Page Views</span>
              </div>
              <div class="stat">
                <span class="stat-value">89%</span>
                <span class="stat-label">Engagement</span>
              </div>
            </div>
          </div>
        }

        <!-- Admin Panel Section -->
        @if (isAdmin()) {
          <div class="demo-card admin-card">
            <h3>Admin Panel</h3>
            <p class="card-description">Full system access</p>
            <div class="admin-actions">
              <button class="btn btn-admin">System Settings</button>
              <button class="btn btn-admin">View Logs</button>
              <button class="btn btn-admin">Manage Roles</button>
            </div>
          </div>
        }
      </div>

      <div class="permission-status">
        <h3>Current Permissions</h3>
        <ul class="permission-list">
          <li>Edit Posts: <strong>{{ canEdit() ? 'Granted' : 'Denied' }}</strong></li>
          <li>Delete Posts: <strong>{{ canDelete() ? 'Granted' : 'Denied' }}</strong></li>
          <li>Manage Users: <strong>{{ canManageUsers() ? 'Granted' : 'Denied' }}</strong></li>
          <li>View Analytics: <strong>{{ canViewAnalytics() ? 'Granted' : 'Denied' }}</strong></li>
          <li>Admin Access: <strong>{{ isAdmin() ? 'Granted' : 'Denied' }}</strong></li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    .permission-demo {
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
    }

    .demo-card h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .card-description {
      color: #666;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .btn-admin {
      background: #6f42c1;
      color: white;
    }

    .btn-admin:hover {
      background: #5a32a3;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }

    .permission-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
      color: #666;
      font-size: 0.9rem;
    }

    .permission-message .icon {
      font-size: 1.2rem;
    }

    .user-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .user-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .analytics-card {
      grid-column: span 2;
    }

    .analytics-stats {
      display: flex;
      justify-content: space-around;
      margin-top: 1rem;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #007bff;
    }

    .stat-label {
      display: block;
      color: #666;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .admin-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .admin-card h3,
    .admin-card .card-description {
      color: white;
    }

    .admin-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .permission-status {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .permission-status h3 {
      margin-top: 0;
      color: #333;
    }

    .permission-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .permission-list li {
      padding: 0.5rem;
      background: white;
      border-radius: 4px;
    }

    .permission-list strong {
      color: #007bff;
    }

    @media (max-width: 768px) {
      .analytics-card {
        grid-column: span 1;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionDemoComponent {
  private readonly demoPermService = inject(DemoPermissionsService);

  // Computed signals for each permission check
  protected readonly canEdit = computed(() =>
    this.demoPermService.hasPermission('can-edit-posts')
  );

  protected readonly canDelete = computed(() =>
    this.demoPermService.hasPermission('can-delete-posts')
  );

  protected readonly canManageUsers = computed(() =>
    this.demoPermService.hasPermission('can-manage-users')
  );

  protected readonly canViewAnalytics = computed(() =>
    this.demoPermService.hasPermission('can-view-analytics')
  );

  protected readonly isAdmin = computed(() =>
    this.demoPermService.hasPermission('is-admin')
  );
}
