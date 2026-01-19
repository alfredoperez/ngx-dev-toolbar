import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CodeExampleComponent } from '../../../shared/components/code-example/code-example.component';
import { ApiReferenceComponent } from '../../../shared/components/api-reference/api-reference.component';
import { CodeExample, ApiMethod } from '../../../shared/models/documentation.models';

@Component({
  selector: 'app-app-features-docs',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeExampleComponent, ApiReferenceComponent],
  templateUrl: './app-features-docs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppFeaturesDocsComponent {
  basicExample: CodeExample = {
    language: 'typescript',
    fileName: 'app.component.ts',
    code: `
import { Component, inject, signal } from '@angular/core';
import { ToolbarAppFeaturesService } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  template: \`
    @if (hasAnalytics()) {
      <app-analytics-dashboard />
    }
    @if (hasAdvancedReporting()) {
      <app-advanced-reports />
    }
  \`
})
export class AppComponent {
  private appFeaturesService = inject(ToolbarAppFeaturesService);

  hasAnalytics = signal(false);
  hasAdvancedReporting = signal(false);

  ngOnInit() {
    // Define available app features
    this.appFeaturesService.setAvailableOptions([
      {
        id: 'analytics',
        name: 'Analytics Dashboard',
        description: 'Advanced analytics and insights',
        isEnabled: false,
        isForced: false
      },
      {
        id: 'advanced-reporting',
        name: 'Advanced Reporting',
        description: 'Export and custom reports',
        isEnabled: false,
        isForced: false
      }
    ]);

    // Subscribe to forced feature values
    this.appFeaturesService.getForcedValues().subscribe(features => {
      const analytics = features.find(f => f.id === 'analytics');
      const reporting = features.find(f => f.id === 'advanced-reporting');

      this.hasAnalytics.set(analytics?.isEnabled || false);
      this.hasAdvancedReporting.set(reporting?.isEnabled || false);
    });
  }
}
    `.trim(),
    description: 'Basic setup for App Features Tool - test product-level features',
    showLineNumbers: true
  };

  apiMethods: ApiMethod[] = [
    {
      name: 'setAvailableOptions',
      signature: 'setAvailableOptions(features: ToolbarAppFeature[]): void',
      description: 'Defines the available application features that can be toggled in the toolbar.',
      parameters: [
        {
          name: 'features',
          type: 'ToolbarAppFeature[]',
          description: 'Array of product-level feature definitions'
        }
      ],
      returnType: {
        type: 'void',
        description: 'No return value'
      }
    },
    {
      name: 'getForcedValues',
      signature: 'getForcedValues(): Observable<ToolbarAppFeature[]>',
      description: 'Gets an observable of app features that have been overridden through the toolbar.',
      parameters: [],
      returnType: {
        type: 'Observable<ToolbarAppFeature[]>',
        description: 'Observable emitting forced app feature changes'
      }
    }
  ];
}
