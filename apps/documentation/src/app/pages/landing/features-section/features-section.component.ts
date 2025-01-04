import { Component, OnInit, signal } from '@angular/core';
import { DevToolbarIconComponent, IconName } from 'ngx-dev-toolbar';
import { GetStartedButtonComponent } from '../../../shared/components/get-started-button/get-started-button.component';
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
  imports: [GetStartedButtonComponent, DevToolbarIconComponent],
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.scss',
})
export class FeaturesSectionComponent implements OnInit {
  expandedFeature = signal('featureFlags');
  currentImage = signal<DemoImage>({
    src: 'assets/demo.gif',
    alt: 'Dev Toolbar Demo',
  });

  readonly demoImages: Record<string, DemoImage> = {
    featureFlags: {
      src: 'assets/feature-flags-demo.gif',
      alt: 'Feature Flags Demo',
    },
    languageSwitcher: {
      src: 'assets/language-demo.gif',
      alt: 'Language Switcher Demo',
    },
    customTools: {
      src: 'assets/custom-tools-demo.gif',
      alt: 'Custom Tools Demo',
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

  readonly additionalFeatures = signal<Feature[]>([
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

  ngOnInit() {
    this.setupScrollAnimation();
  }

  onToggleFeature(featureId: string) {
    if (this.expandedFeature() === featureId) {
      return;
    }
    this.expandedFeature.set(featureId);
    this.updateImage(featureId);
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
