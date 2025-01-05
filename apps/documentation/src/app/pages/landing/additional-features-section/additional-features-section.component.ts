import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GetStartedButtonComponent } from '../../../shared/components/get-started-button/get-started-button.component';

interface Feature {
  name: string;
  available: boolean;
}

@Component({
  selector: 'app-additional-features-section',
  standalone: true,
  imports: [CommonModule, GetStartedButtonComponent],
  template: `
    <!-- Additional Features Section -->
    <div class="relative bg-gray-900">
      <div class="xl:py-24 py-16 bg-gray-800/50">
        <div class="mx-auto max-w-7xl px-6">
          <div class="text-center">
            <span
              class="rounded-full bg-indigo-500/10 px-3 py-1 text-sm/6 font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/20"
              >Additional Features</span
            >
            <h2 class="mt-3 text-2xl font-medium text-white">
              Packed with Everything You Need
            </h2>
            <p class="mt-4 text-lg text-gray-400">
              Comprehensive tools to enhance your development experience
            </p>

            <div class="py-16">
              <div
                class="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-x-16 gap-y-10 max-w-5xl mx-auto"
              >
                @for (feature of features(); track feature.name; let i = $index)
                {
                <div
                  class="feature-column"
                  [style.--delay]="100 * ((i % 3) + 1) + 'ms'"
                >
                  <div class="feature-item flex items-center gap-3 text-left">
                    <div class="flex-shrink-0">
                      <svg
                        class="size-5 text-indigo-400"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-lg font-medium text-gray-300">
                        {{ feature.name }}
                      </p>
                    </div>
                    @if (!feature.available) {
                    <span
                      class="flex-shrink-0 inline-flex text-xs font-medium bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full"
                    >
                      Coming Soon
                    </span>
                    }
                  </div>
                </div>
                }
              </div>
            </div>

            <div class="flex items-center justify-center">
              <app-get-started-button text="Start Using it Now" />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .feature-column {
        opacity: 0;
        animation: fadeInUp 0.6s ease-out forwards;
        animation-delay: var(--delay);
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .feature-item {
        transition: transform 0.2s ease-in-out;

        &:hover {
          transform: translateX(4px);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalFeaturesSectionComponent {
  readonly features = signal<Feature[]>([
    { name: 'Zero Production Impact', available: true },
    { name: 'Secure Implementation', available: true },
    { name: 'Persistent Settings', available: true },
    { name: 'Hidden by Default', available: true },
    { name: 'Custom Tools Support', available: true },
    { name: 'Feature Flags Management', available: true },
    { name: 'Language Switching', available: true },
    { name: 'Mock User Personas', available: false },
    { name: 'Network Request Mocking', available: false },
    { name: 'Import/Export Settings', available: false },
    { name: 'Advanced Theming', available: false },
  ]);
}
