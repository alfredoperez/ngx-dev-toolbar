import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-custom-tool-demo',
  standalone: true,
  template: `
    <section class="custom-tool-demo">
      <div class="demo-header">
        <h2>Custom Tool</h2>
        <p class="demo-description">
          A demo toolbar tool showcasing the <code>ndt-tabs</code> component with Finder and Maker tabs.
          Open the <strong>puzzle icon</strong> in the toolbar below to try it.
        </p>
      </div>

      <div class="demo-card-grid">
        <div class="demo-card">
          <div class="card-header">
            <h3>Finder Tab</h3>
          </div>
          <p class="card-description">
            Search for application routes or DOM elements. Select a type from the dropdown
            and click Find to see mock results.
          </p>
          <div class="card-preview">
            <div class="preview-item"><code>/dashboard</code> — DashboardComponent</div>
            <div class="preview-item"><code>/users/:id</code> — UserDetailComponent</div>
            <div class="preview-item"><code>&lt;app-header&gt;</code> — 1 instance</div>
          </div>
        </div>

        <div class="demo-card">
          <div class="card-header">
            <h3>Maker Tab</h3>
          </div>
          <p class="card-description">
            Generate mock data entries on the fly. Select User, Order, or Product
            and click Create to build sample records.
          </p>
          <div class="card-preview">
            <div class="preview-item preview-item--green">Mock User #1 — 10:42:15 AM</div>
            <div class="preview-item preview-item--green">Mock Order #2 — 10:42:18 AM</div>
            <div class="preview-item preview-item--green">Mock Product #3 — 10:42:21 AM</div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .custom-tool-demo {
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

    .demo-description code {
      background: var(--demo-bg, #f1f5f9);
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-size: 0.875rem;
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
      transition: border-color 0.2s;
    }

    .demo-card:hover {
      border-color: var(--demo-primary, #6366f1);
    }

    .card-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--demo-text, #1e293b);
    }

    .card-description {
      margin: 0.5rem 0 1rem 0;
      font-size: 0.875rem;
      color: var(--demo-text-muted, #64748b);
      line-height: 1.5;
    }

    .card-preview {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      padding: 0.75rem;
      background: var(--demo-bg, #f8fafc);
      border-radius: 6px;
    }

    .preview-item {
      padding: 0.375rem 0.5rem;
      background: white;
      border-radius: 4px;
      font-size: 0.8125rem;
      color: var(--demo-text, #1e293b);
    }

    .preview-item code {
      font-size: 0.75rem;
      background: var(--demo-bg, #f1f5f9);
      padding: 0.0625rem 0.25rem;
      border-radius: 3px;
    }

    @media (max-width: 640px) {
      .demo-card-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomToolDemoComponent {}
