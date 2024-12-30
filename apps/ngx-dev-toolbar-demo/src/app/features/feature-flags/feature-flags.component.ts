import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FeatureFlagsService } from '../../services/feature-flags.service';

@Component({
  selector: 'app-feature-flags',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feature-flags-container">
      <h1>Feature Flags</h1>
      <div class="flags-list">
        @for (flag of flags$ | async; track flag.name) {
        <div class="flag-item">
          <div class="flag-info">
            <h3>{{ flag.name }}</h3>
            <p>{{ flag.description }}</p>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              [checked]="flag.enabled"
              (change)="toggleFlag(flag.name)"
            />
            <span class="slider"></span>
          </label>
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .feature-flags-container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }

      .flags-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .flag-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .flag-info h3 {
        margin: 0;
        font-size: 1.1rem;
      }

      .flag-info p {
        margin: 0.5rem 0 0;
        color: #666;
      }

      .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 34px;
      }

      .slider:before {
        position: absolute;
        content: '';
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
      }

      input:checked + .slider {
        background-color: #2196f3;
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }
    `,
  ],
})
export class FeatureFlagsComponent {
  private readonly featureFlagsService = inject(FeatureFlagsService);
  flags$ = this.featureFlagsService.flags$;

  toggleFlag(flagName: string): void {
    this.featureFlagsService.toggleFlag(flagName);
  }
}
