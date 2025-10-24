import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CodeExampleComponent } from '../../../shared/components/code-example/code-example.component';
import { ApiReferenceComponent } from '../../../shared/components/api-reference/api-reference.component';
import { CodeExample, ApiMethod, ApiInterface } from '../../../shared/models/documentation.models';

@Component({
  selector: 'app-language-docs',
  standalone: true,
  imports: [CommonModule, RouterLink, CodeExampleComponent, ApiReferenceComponent],
  templateUrl: './language-docs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageDocsComponent {

  basicExample: CodeExample = {
    language: 'typescript',
    fileName: 'app.component.ts',
    code: `
import { Component, inject, OnInit } from '@angular/core';
import { DevToolbarLanguageService } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-root',
  template: '<p>{{ "HELLO" | translate }}</p>'
})
export class AppComponent implements OnInit {
  private languageService = inject(DevToolbarLanguageService);

  ngOnInit() {
    // Define available languages
    this.languageService.setAvailableOptions([
      { id: 'en', name: 'English' },
      { id: 'es', name: 'Español' },
      { id: 'fr', name: 'Français' }
    ]);

    // Subscribe to language changes from toolbar
    this.languageService.getForcedValues().subscribe(languages => {
      const selected = languages[0];
      if (selected) {
        // Update your i18n service
        console.log('Language changed to:', selected.name);
      }
    });
  }
}
    `.trim(),
    description: 'Basic setup for Language Tool - define languages and handle changes',
    showLineNumbers: true
  };

  advancedExample: CodeExample = {
    language: 'typescript',
    fileName: 'i18n-integration.service.ts',
    code: `
import { Injectable, inject } from '@angular/core';
import { DevToolbarLanguageService } from 'ngx-dev-toolbar';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({ providedIn: 'root' })
export class I18nIntegrationService {
  private toolbarService = inject(DevToolbarLanguageService);
  private transloco = inject(TranslocoService);

  initialize(supportedLanguages: { id: string; name: string }[]) {
    // Configure toolbar with available languages
    this.toolbarService.setAvailableOptions(supportedLanguages);

    // Subscribe to toolbar language changes
    this.toolbarService.getForcedValues().subscribe(languages => {
      if (languages.length > 0) {
        const newLang = languages[0].id;
        this.transloco.setActiveLang(newLang);
      }
    });
  }
}
    `.trim(),
    description: 'Advanced integration with Transloco i18n library',
    showLineNumbers: true
  };

  apiMethods: ApiMethod[] = [
    {
      name: 'setAvailableOptions',
      signature: 'setAvailableOptions(languages: Language[]): void',
      description: 'Defines the available languages that can be selected in the toolbar.',
      parameters: [
        {
          name: 'languages',
          type: 'Language[]',
          description: 'Array of language objects with id and name'
        }
      ],
      returnType: {
        type: 'void',
        description: 'No return value'
      }
    },
    {
      name: 'getForcedValues',
      signature: 'getForcedValues(): Observable<Language[]>',
      description: 'Gets an observable of the selected language from the toolbar.',
      parameters: [],
      returnType: {
        type: 'Observable<Language[]>',
        description: 'Observable emitting array with selected language (single item)'
      }
    }
  ];

  apiInterfaces: ApiInterface[] = [
    {
      name: 'Language',
      definition: `
interface Language {
  id: string;
  name: string;
}
      `.trim(),
      description: 'Represents a language option in the developer toolbar',
      properties: [
        { name: 'id', type: 'string', description: 'Language code (e.g., "en", "es", "fr")' },
        { name: 'name', type: 'string', description: 'Display name of the language' }
      ]
    }
  ];
}
