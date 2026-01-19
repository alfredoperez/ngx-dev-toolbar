import { Component, inject, OnInit, signal } from '@angular/core';
import { ToolbarIconComponent, IconName } from 'ngx-dev-toolbar';
import { AnalyticsService } from '../../../shared/services/analytics.service';
interface DemoImage {
  src: string;
  alt: string;
}

interface Feature {
  name: string;
  available: boolean;
}

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [ToolbarIconComponent],
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.scss',
})
export class FeaturesSectionComponent implements OnInit {
  private readonly analytics = inject(AnalyticsService);
  expandedFeature = signal('featureFlags');
  currentImage = signal<DemoImage>({
    src: './assets/demos/feature-flags-demo.gif',
    alt: 'Dev Toolbar Demo',
  });

  readonly demoImages: Record<string, DemoImage> = {
    featureFlags: {
      src: './assets/demos/feature-flags-demo.gif',
      alt: 'Feature Flags Demo',
    },
    languageSwitcher: {
      src: './assets/demos/language-switcher-demo.gif',
      alt: 'Language Switcher Demo',
    },
    customTools: {
      src: './assets/demos/toolbar-tool-demo.gif',
      alt: 'Toolbar Tool Demo',
    },
  };

  readonly features = signal([
    {
      id: 'featureFlags',
      title: 'Feature Flags',
      icon: 'toggle-left' as IconName,
      description:
        'Test new features instantly without backend changes. Perfect for A/B testing and gradual rollouts in development.',
      benefits: [
        'Toggle features on/off in real-time',
        'Test different user experiences',
        'No backend configuration needed',
        'Settings persist across sessions',
      ],
    },
    {
      id: 'languageSwitcher',
      title: 'Language Switcher',
      icon: 'translate' as IconName,
      description:
        'Preview your app in different languages instantly. Test UI layouts with varying text lengths and validate translations in real-time.',
      benefits: [
        'Switch languages without reloading',
        'Test UI with different text lengths',
        'Validate translations instantly',
        'Support for multiple locales',
      ],
    },
    {
      id: 'customTools',
      title: 'Create Your Own Tools',
      icon: 'code' as IconName,
      description:
        'Build custom development tools that match your workflow. Create, share, and integrate tools across your team using familiar Angular components.',
      benefits: [
        'Build tools using Angular components',
        'Share tools across your team',
        'Integrate with existing services',
        'Customize for your workflow',
      ],
    },
  ]);

  ngOnInit() {
    this.setupScrollAnimation();
  }

  onToggleFeature(featureId: string) {
    if (this.expandedFeature() === featureId) {
      return;
    }
    this.expandedFeature.set(featureId);
    this.updateImage(featureId);

    // Log the feature name that was toggled
    const featureName = this.features().find(
      (feature) => feature.id === featureId
    )?.title;

    this.analytics.trackEvent('feature_toggle', {
      category: 'engagement',
      action: featureName,
    });
  }

  isExpanded(featureId: string): boolean {
    return this.expandedFeature() === featureId;
  }

  splitIntoColumns(features: Feature[]): Feature[][] {
    const columns = 3;
    const result: Feature[][] = [];
    const itemsPerColumn = Math.ceil(features.length / columns);

    for (let i = 0; i < columns; i++) {
      result.push(features.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn));
    }

    return result;
  }

  private updateImage(featureId: string) {
    this.currentImage.set(
      this.demoImages[featureId] || this.demoImages['featureFlags']
    );
  }

  private setupScrollAnimation() {
    if (typeof window !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              if (entry.target.classList.contains('additional-features')) {
                const columns =
                  entry.target.querySelectorAll('.feature-column');
                columns.forEach((column, index) => {
                  setTimeout(() => {
                    column.classList.add('visible');
                  }, 100 * (index + 1));
                });
              }
            }
          });
        },
        { threshold: 0.1 }
      );

      document
        .querySelectorAll('.feature-card, .demo-image, .additional-features')
        .forEach((el) => {
          observer.observe(el);
        });
    }
  }
}
