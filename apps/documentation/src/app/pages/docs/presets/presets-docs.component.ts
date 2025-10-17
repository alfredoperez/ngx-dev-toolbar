import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CodeExampleComponent } from '../../../shared/components/code-example/code-example.component';
import { ApiReferenceComponent } from '../../../shared/components/api-reference/api-reference.component';
import { CodeExample, ApiMethod } from '../../../shared/models/documentation.models';

@Component({
  selector: 'app-presets-docs',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeExampleComponent, ApiReferenceComponent],
  templateUrl: './presets-docs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresetsDocsComponent {
  basicExample: CodeExample = {
    language: 'typescript',
    fileName: 'app.component.ts',
    code: `
import { Component, inject } from '@angular/core';
import { DevToolbarPresetsService } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  template: '<router-outlet />'
})
export class AppComponent {
  private presetsService = inject(DevToolbarPresetsService);

  ngOnInit() {
    // Subscribe to preset changes
    this.presetsService.getForcedValues().subscribe(presets => {
      console.log('Active presets:', presets);
      // Presets automatically apply settings to all tools
    });
  }
}
    `.trim(),
    description: 'Basic setup for Presets Tool - presets automatically apply to all tools',
    showLineNumbers: true
  };

  advancedExample: CodeExample = {
    language: 'typescript',
    fileName: 'preset-creation.ts',
    code: `
// Create a preset programmatically
const enterprisePreset: DevToolbarPreset = {
  id: 'enterprise-demo',
  name: 'Enterprise Demo',
  description: 'All premium features enabled for demos',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  config: {
    featureFlags: {
      enabled: ['dark-mode', 'advanced-search'],
      disabled: []
    },
    language: 'en',
    permissions: {
      granted: ['can-edit', 'can-delete', 'can-admin'],
      denied: []
    },
    appFeatures: {
      enabled: ['analytics', 'advanced-reporting', 'white-label'],
      disabled: []
    }
  }
};

// Presets are managed through the toolbar UI
// This example shows the data structure only
    `.trim(),
    description: 'Example preset configuration structure',
    showLineNumbers: true
  };

  apiMethods: ApiMethod[] = [
    {
      name: 'setAvailableOptions',
      signature: 'setAvailableOptions(presets: DevToolbarPreset[]): void',
      description: 'Defines the available presets that can be selected in the toolbar.',
      parameters: [
        {
          name: 'presets',
          type: 'DevToolbarPreset[]',
          description: 'Array of preset configurations'
        }
      ],
      returnType: {
        type: 'void',
        description: 'No return value'
      }
    },
    {
      name: 'getForcedValues',
      signature: 'getForcedValues(): Observable<DevToolbarPreset[]>',
      description: 'Gets an observable of active presets.',
      parameters: [],
      returnType: {
        type: 'Observable<DevToolbarPreset[]>',
        description: 'Observable emitting active preset changes'
      }
    }
  ];
}
