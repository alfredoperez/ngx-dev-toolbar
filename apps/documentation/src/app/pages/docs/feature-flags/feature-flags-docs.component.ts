import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeExampleComponent } from '../../../shared/components/code-example/code-example.component';
import { CodeExample } from '../../../shared/models/documentation.models';

@Component({
  selector: 'app-feature-flags-docs',
  standalone: true,
  imports: [CommonModule, CodeExampleComponent],
  templateUrl: './feature-flags-docs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureFlagsDocsComponent {

  basicExample: CodeExample = {
    language: 'typescript',
    fileName: 'app.component.ts',
    code: `
import { Component, inject, OnInit } from '@angular/core';
import { ToolbarFeatureFlagService } from 'ngx-dev-toolbar';

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
  private featureFlagsService = inject(ToolbarFeatureFlagService);
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
import { ToolbarFeatureFlagService } from 'ngx-dev-toolbar';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private toolbarService = inject(ToolbarFeatureFlagService);

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
}
