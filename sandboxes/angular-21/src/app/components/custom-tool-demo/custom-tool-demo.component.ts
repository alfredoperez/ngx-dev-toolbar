import { ChangeDetectionStrategy, Component, Signal, inject } from '@angular/core';
import { MockDataStoreService } from '../custom-tool/mock-data-store.service';

type EntityLike = { id: string; name: string };

@Component({
  selector: 'app-custom-tool-demo',
  standalone: true,
  template: `
    <section class="custom-tool-demo">
      <div class="demo-header">
        <h2>Custom Tool</h2>
        <p class="demo-description">
          This page mirrors the entities created by the toolbar's <strong>Mock Data</strong> tool.
          Open the puzzle icon in the toolbar below, run a CREATE bundle, and watch the cards populate live.
        </p>
      </div>

      <div class="demo-card-grid">
        @for (card of cards; track card.label) {
          @let items = card.entities();
          <div class="demo-card" [class.demo-card--empty]="items.length === 0">
            <div class="card-header">
              <h3>{{ card.label }}</h3>
              <span class="card-count">{{ items.length }}</span>
            </div>
            @if (items.length > 0) {
              <ul class="card-preview">
                @for (item of items.slice(-5); track item.id) {
                  <li class="preview-item">
                    <code class="preview-id">{{ item.id }}</code>
                    <span class="preview-name">{{ item.name }}</span>
                  </li>
                }
              </ul>
            } @else {
              <p class="card-empty">
                Run the toolbar's Mock Data tool to seed <code>{{ card.label.toLowerCase() }}</code>.
              </p>
            }
          </div>
        }
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
      transition: border-color 0.2s, opacity 0.2s;
    }

    .demo-card:hover {
      border-color: var(--demo-primary, #6366f1);
    }

    .demo-card--empty {
      opacity: 0.7;
      background: var(--demo-bg, #f8fafc);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--demo-text, #1e293b);
    }

    .card-count {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.8125rem;
      color: var(--demo-text-muted, #64748b);
      background: var(--demo-bg, #f1f5f9);
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      min-width: 1.5rem;
      text-align: center;
    }

    .card-preview {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .preview-item {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      padding: 0.375rem 0.5rem;
      background: var(--demo-bg, #f8fafc);
      border-radius: 4px;
      font-size: 0.8125rem;
      color: var(--demo-text, #1e293b);
      overflow: hidden;
      white-space: nowrap;
    }

    .preview-id {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.75rem;
      color: var(--demo-text-muted, #64748b);
      flex-shrink: 0;
    }

    .preview-name {
      color: var(--demo-text, #1e293b);
      font-weight: 400;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-empty {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--demo-text-muted, #64748b);
      font-style: italic;
      line-height: 1.5;
    }

    .card-empty code {
      font-style: normal;
      background: var(--demo-bg, #f1f5f9);
      padding: 0.0625rem 0.25rem;
      border-radius: 3px;
      font-size: 0.75rem;
    }

    @media (max-width: 640px) {
      .demo-card-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomToolDemoComponent {
  private readonly store = inject(MockDataStoreService);

  protected readonly LABELS: readonly string[] = [
    'Customers',
    'Invoices',
    'Subscriptions',
    'Line items',
    'Payment methods',
    'Categories',
    'Products',
    'Variants',
    'Inventory',
    'Suppliers',
    'Users',
    'Sessions',
    'Profiles',
    'Preferences',
    'Invitations',
  ];

  protected readonly cards: { label: string; entities: Signal<readonly EntityLike[]> }[] =
    this.LABELS.map((label) => ({
      label,
      entities: this.store.entitiesSignal<EntityLike>(label),
    }));
}
