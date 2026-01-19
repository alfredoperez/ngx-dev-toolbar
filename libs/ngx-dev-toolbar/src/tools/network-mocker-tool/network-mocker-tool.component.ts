import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToolbarButtonComponent } from '../../components/button/button.component';
import { ToolbarInputComponent } from '../../components/input/input.component';
import { ToolbarSelectComponent } from '../../components/select/select.component';
import { ToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { ToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { MockRequestConfig } from './network-mocker.models';
import { ToolbarNetworkMockerService } from './network-mocker.service';

@Component({
  selector: 'ngt-network-mocker-tool',
  standalone: true,
  imports: [
    FormsModule,
    ToolbarToolComponent,
    ToolbarButtonComponent,
    ToolbarInputComponent,
    ToolbarSelectComponent,
  ],
  template: `
    <ngt-toolbar-tool [options]="options" title="Network Mocker" icon="network">
      <div class="container">
        <div class="tool-header">
          <h3>Mock Network Requests</h3>
          <p>Intercept and mock HTTP requests for testing and development.</p>
        </div>

        <div class="form">
          <div class="form-row">
            <ngt-input
              [(value)]="newMockUrl"
              placeholder="Enter URL pattern (e.g., /api/users/*)"
              ariaLabel="Mock URL"
            />
            <ngt-select
              [(value)]="newMockMethod"
              [options]="httpMethods"
              size="small"
              ariaLabel="HTTP Method"
            />
          </div>

          <div class="form-row">
            <ngt-input
              [(value)]="newMockStatus"
              placeholder="Status code (default: 200)"
              type="number"
              ariaLabel="Status Code"
            />
            <ngt-input
              [(value)]="newMockResponse"
              placeholder="Response JSON (optional)"
              ariaLabel="Response JSON"
            />
          </div>

          <div class="actions">
            <ngt-button label="Add Mock" icon="import" (click)="onAddMock()" />
            <ngt-button
              [label]="
                isMockingEnabled() ? 'Disable Mocking' : 'Enable Mocking'
              "
              [icon]="isMockingEnabled() ? 'trash' : 'network'"
              (click)="onToggleMocking()"
            />
          </div>
        </div>

        @if (hasNoMocks()) {
        <div class="empty">
          <p>No mock requests configured. Add your first mock above.</p>
        </div>
        } @else {
        <div class="mocks-list">
          <h4>Configured Mocks</h4>
          @for (mock of mockRequests(); track mock.id) {
          <div class="mock-item">
            <div class="mock-info">
              <div class="mock-method">{{ mock.method }}</div>
              <div class="mock-url">{{ mock.url }}</div>
              <div class="mock-status">{{ mock.status }}</div>
            </div>
            <div class="mock-actions">
              <ngt-button
                variant="icon"
                [icon]="mock.isActive ? 'star' : 'moon'"
                [ariaLabel]="mock.isActive ? 'Disable mock' : 'Enable mock'"
                (click)="onToggleMock(mock.id)"
              />
              <ngt-button
                variant="icon"
                icon="trash"
                ariaLabel="Remove mock"
                (click)="onRemoveMock(mock.id)"
              />
            </div>
          </div>
          }
        </div>
        } @if (isMockingEnabled()) {
        <div class="status">
          <p>✅ Network mocking is active</p>
        </div>
        }
      </div>
    </ngt-toolbar-tool>
  `,
  styles: [
    `
      .container {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--ngt-spacing-md);
        padding: 0;
      }

      .tool-header {
        position: relative;
        text-align: center;
        flex-shrink: 0;

        h3 {
          margin: 0 0 var(--ngt-spacing-sm) 0;
          font-size: var(--ngt-font-size-lg);
          color: var(--ngt-text-primary);
          font-weight: 600;
        }

        p {
          margin: 0;
          font-size: var(--ngt-font-size-sm);
          color: var(--ngt-text-muted);
        }
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: var(--ngt-spacing-sm);
        flex-shrink: 0;
        padding: var(--ngt-spacing-md);
        background: var(--ngt-background-secondary);
        border: 1px solid var(--ngt-border-primary);
        border-radius: var(--ngt-border-radius-medium);
      }

      .form-row {
        display: flex;
        gap: var(--ngt-spacing-sm);

        ngt-input {
          flex: 1;
        }

        ngt-select {
          flex: 0 0 120px;
        }
      }

      .actions {
        display: flex;
        gap: var(--ngt-spacing-sm);
        margin-top: var(--ngt-spacing-sm);
      }

      .empty {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        color: var(--ngt-text-muted);
        text-align: center;
        font-size: var(--ngt-font-size-sm);
      }

      .mocks-list {
        display: flex;
        flex-direction: column;
        gap: var(--ngt-spacing-sm);
        flex: 1;
        min-height: 0;
        overflow-y: auto;

        h4 {
          margin: 0 0 var(--ngt-spacing-sm) 0;
          font-size: var(--ngt-font-size-md);
          color: var(--ngt-text-primary);
          font-weight: 600;
        }

        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: var(--ngt-background-secondary);
          border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--ngt-border-primary);
          border-radius: 4px;

          &:hover {
            background: var(--ngt-hover-bg);
          }
        }
      }

      .mock-item {
        display: flex;
        align-items: center;
        gap: var(--ngt-spacing-sm);
        padding: var(--ngt-spacing-sm);
        background: var(--ngt-background-secondary);
        border: 1px solid var(--ngt-border-primary);
        border-radius: var(--ngt-border-radius-small);

        .mock-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: var(--ngt-spacing-sm);
        }

        .mock-method {
          font-weight: 600;
          font-size: var(--ngt-font-size-xs);
          color: var(--ngt-primary);
          background: var(--ngt-primary-background);
          padding: 2px 6px;
          border-radius: var(--ngt-border-radius-small);
          min-width: 40px;
          text-align: center;
        }

        .mock-url {
          flex: 1;
          font-size: var(--ngt-font-size-sm);
          color: var(--ngt-text-primary);
          font-family: monospace;
        }

        .mock-status {
          font-size: var(--ngt-font-size-xs);
          color: var(--ngt-text-muted);
          min-width: 30px;
          text-align: center;
        }

        .mock-actions {
          display: flex;
          gap: var(--ngt-spacing-xs);
        }
      }

      .status {
        text-align: center;
        padding: var(--ngt-spacing-sm) var(--ngt-spacing-md);
        background: var(--ngt-success-background);
        border: 1px solid var(--ngt-success-border);
        border-radius: var(--ngt-border-radius-small);
        color: var(--ngt-success-text);
        font-size: var(--ngt-font-size-sm);
        flex-shrink: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarNetworkMockerToolComponent {
  // Injects
  private readonly networkMockerService = inject(
    ToolbarNetworkMockerService
  );

  // Signals
  protected readonly newMockUrl = signal('');
  protected readonly newMockMethod = signal('GET');
  protected readonly newMockStatus = signal('200');
  protected readonly newMockResponse = signal('');

  // Computed values
  protected readonly mockRequests = this.networkMockerService.getMockRequests();
  protected readonly isMockingEnabled =
    this.networkMockerService.getIsMockingEnabled();
  protected readonly hasNoMocks = computed(
    () => this.mockRequests().length === 0
  );

  // Window options
  protected readonly options = {
    title: 'Network Mocker',
    description: 'Intercept and mock HTTP requests for testing and development',
    isClosable: true,
    size: 'tall',
    id: 'ngt-network-mocker',
    isBeta: true,
  } as ToolbarWindowOptions;

  // Other properties
  protected readonly httpMethods = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'DELETE', label: 'DELETE' },
    { value: 'PATCH', label: 'PATCH' },
  ];

  // Public methods
  protected onAddMock(): void {
    const url = this.newMockUrl().trim();
    if (!url) return;

    const config: MockRequestConfig = {
      url,
      method: this.newMockMethod() as any,
      status: parseInt(this.newMockStatus()) || 200,
      response: this.newMockResponse()
        ? JSON.parse(this.newMockResponse())
        : {},
    };

    this.networkMockerService.addMockRequest(config);

    // Reset form
    this.newMockUrl.set('');
    this.newMockMethod.set('GET');
    this.newMockStatus.set('200');
    this.newMockResponse.set('');
  }

  protected onToggleMocking(): void {
    if (this.isMockingEnabled()) {
      this.networkMockerService.disableMocking();
    } else {
      this.networkMockerService.enableMocking();
    }
  }

  protected onToggleMock(mockId: string): void {
    this.networkMockerService.toggleMockRequest(mockId);
  }

  protected onRemoveMock(mockId: string): void {
    this.networkMockerService.removeMockRequest(mockId);
  }
}
