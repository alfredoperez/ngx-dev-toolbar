import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CodeExampleComponent } from '../../../shared/components/code-example/code-example.component';
import { CodeExample } from '../../../shared/models/documentation.models';

@Component({
  selector: 'app-presets-docs',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeExampleComponent],
  templateUrl: './presets-docs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresetsDocsComponent {
  basicExample: CodeExample = {
    language: 'typescript',
    fileName: 'app.component.ts',
    code: `
import { Component, inject } from '@angular/core';
import { ToolbarPresetsService } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  template: '<router-outlet />'
})
export class AppComponent {
  private presetsService = inject(ToolbarPresetsService);

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
const enterprisePreset: ToolbarPreset = {
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
}
