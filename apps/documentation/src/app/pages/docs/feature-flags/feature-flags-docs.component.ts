import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeExampleComponent } from '../../../shared/components/code-example/code-example.component';
import { ApiReferenceComponent } from '../../../shared/components/api-reference/api-reference.component';
import { CodeExample, ApiMethod, ApiInterface } from '../../../shared/models/documentation.models';

@Component({
  selector: 'app-feature-flags-docs',
  standalone: true,
  imports: [CommonModule, CodeExampleComponent, ApiReferenceComponent],
  templateUrl: './feature-flags-docs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureFlagsDocsComponent {

  basicExample: CodeExample = {
    language: 'typescript',
    fileName: 'app.component.ts',
    code: `
import { Component, inject, OnInit } from '@angular/core';
import { DevToolbarFeatureFlagService } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  template: \`
    <div>
      @if (darkModeEnabled) {
        <p>Dark mode is enabled!</p>
      }
    </div>
  \`
})
export class AppComponent implements OnInit {
  private featureFlagsService = inject(DevToolbarFeatureFlagService);
  darkModeEnabled = false;

  ngOnInit() {
    // Define available feature flags
    this.featureFlagsService.setAvailableOptions([
      {
        id: 'dark-mode',
        name: 'Dark Mode',
        description: 'Enable dark theme',
        isEnabled: false,
        isForced: false
      },
      {
        id: 'new-ui',
        name: 'New UI',
        description: 'Enable redesigned interface',
        isEnabled: false,
        isForced: false
      }
    ]);

    // Subscribe to all values with overrides applied (recommended)
    this.featureFlagsService.getValues().subscribe(flags => {
      const darkMode = flags.find(f => f.id === 'dark-mode');
      this.darkModeEnabled = darkMode?.isEnabled || false;
    });
  }
}
    `.trim(),
    description: 'Basic setup for Feature Flags tool - define flags and subscribe to changes',
    showLineNumbers: true
  };

  advancedExample: CodeExample = {
    language: 'typescript',
    fileName: 'feature-flag.service.ts',
    code: `
import { Injectable, inject, signal, computed } from '@angular/core';
import { DevToolbarFeatureFlagService } from 'ngx-dev-toolbar';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private toolbarService = inject(DevToolbarFeatureFlagService);

  private flags = signal<Map<string, boolean>>(new Map());

  // Computed signals for specific features
  isDarkModeEnabled = computed(() => this.flags().get('dark-mode') ?? false);
  isNewUIEnabled = computed(() => this.flags().get('new-ui') ?? false);

  initialize(availableFlags: { id: string; name: string; defaultValue: boolean }[]) {
    // Set available options in toolbar
    this.toolbarService.setAvailableOptions(
      availableFlags.map(flag => ({
        id: flag.id,
        name: flag.name,
        isEnabled: flag.defaultValue,
        isForced: false
      }))
    );

    // Subscribe to all values with overrides applied
    this.toolbarService.getValues().subscribe(allFlags => {
      const flagMap = new Map<string, boolean>();
      allFlags.forEach(flag => flagMap.set(flag.id, flag.isEnabled));
      this.flags.set(flagMap);
    });
  }

  isEnabled(flagId: string): boolean {
    return this.flags().get(flagId) ?? false;
  }
}
    `.trim(),
    description: 'Advanced pattern using signals for reactive feature flag management',
    showLineNumbers: true
  };

  apiMethods: ApiMethod[] = [
    {
      name: 'setAvailableOptions',
      signature: 'setAvailableOptions(flags: DevToolbarFlag[]): void',
      description: 'Defines the available feature flags that can be toggled in the toolbar.',
      parameters: [
        {
          name: 'flags',
          type: 'DevToolbarFlag[]',
          description: 'Array of feature flag definitions with id, name, current state'
        }
      ],
      returnType: {
        type: 'void',
        description: 'No return value'
      },
      example: {
        language: 'typescript',
        code: `
this.featureFlagsService.setAvailableOptions([
  { id: 'beta-feature', name: 'Beta Feature', isEnabled: false, isForced: false },
  { id: 'experimental', name: 'Experimental Mode', isEnabled: false, isForced: false }
]);
        `.trim()
      }
    },
    {
      name: 'getValues',
      signature: 'getValues(): Observable<DevToolbarFlag[]>',
      description: 'Gets ALL feature flags with overrides already applied. This is the recommended method for integration as it eliminates the need for manual merging. Each flag includes an isForced property.',
      parameters: [],
      returnType: {
        type: 'Observable<DevToolbarFlag[]>',
        description: 'Observable emitting all feature flags with overrides applied whenever changes occur'
      },
      example: {
        language: 'typescript',
        code: `
this.featureFlagsService.getValues().subscribe(flags => {
  const darkMode = flags.find(f => f.id === 'dark-mode');
  if (darkMode?.isEnabled) {
    // Apply dark mode
  }
});
        `.trim()
      }
    },
    {
      name: 'getForcedValues',
      signature: 'getForcedValues(): Observable<DevToolbarFlag[]>',
      description: 'Gets only the feature flags that have been overridden through the toolbar. Legacy method - consider using getValues() instead.',
      parameters: [],
      returnType: {
        type: 'Observable<DevToolbarFlag[]>',
        description: 'Observable emitting only the forced feature flags whenever changes occur'
      },
      example: {
        language: 'typescript',
        code: `
this.featureFlagsService.getForcedValues().subscribe(flags => {
  flags.forEach(flag => {
    console.log(\`\${flag.name}: \${flag.isEnabled}\`);
  });
});
        `.trim()
      }
    }
  ];

  apiInterfaces: ApiInterface[] = [
    {
      name: 'DevToolbarFlag',
      definition: `
interface DevToolbarFlag {
  id: string;
  name: string;
  description?: string;
  link?: string;
  isEnabled: boolean;
  isForced: boolean;
}
      `.trim(),
      description: 'Represents a feature flag in the developer toolbar',
      properties: [
        { name: 'id', type: 'string', description: 'Unique identifier for the flag' },
        { name: 'name', type: 'string', description: 'Display name shown in the UI' },
        { name: 'description', type: 'string', description: 'Optional description of the feature', optional: true },
        { name: 'link', type: 'string', description: 'Optional link to documentation', optional: true },
        { name: 'isEnabled', type: 'boolean', description: 'Whether the flag is currently enabled' },
        { name: 'isForced', type: 'boolean', description: 'Whether the flag value has been overridden via toolbar' }
      ]
    }
  ];
}
