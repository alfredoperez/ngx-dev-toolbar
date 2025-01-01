import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { DevToolbarLanguageService } from 'ngx-dev-toolbar';

@Component({
  selector: 'app-languages',
  standalone: true,
  imports: [TranslocoDirective],
  styleUrls: ['./languages.component.scss'],
  template: `
    <div class="languages" *transloco="let t">
      <div class="languages__title">
        <h1>Languages</h1>

        <p class="languages__description">
          This demo shows how to integrate language switching with the Dev
          Toolbar. You can change languages either using the buttons below or
          through the Dev Toolbar's language selector.
        </p>
      </div>

      <div class="languages__buttons">
        <button
          (click)="setLanguage('en')"
          [class.active]="currentLang === 'en'"
        >
          English
        </button>
        <button
          (click)="setLanguage('es')"
          [class.active]="currentLang === 'es'"
        >
          Español
        </button>
      </div>

      <div class="languages__demo-section">
        <h2>Demo Text</h2>
        <div class="languages__content">
          <p>{{ t('languages.welcome') }}</p>
          <p>{{ t('languages.sample') }}</p>
        </div>
      </div>
    </div>
  `,
})
export class LanguagesComponent {
  protected readonly translocoService = inject(TranslocoService);
  private readonly languageToolbarService = inject(DevToolbarLanguageService);

  originalLang = this.translocoService.getActiveLang();
  currentLang = this.originalLang;

  constructor() {
    this.languageToolbarService
      .getForcedValues()
      .pipe(takeUntilDestroyed())
      .subscribe(([language]) => {
        if (language) {
          this.translocoService.setActiveLang(language.id);
        } else {
          this.translocoService.setActiveLang(this.originalLang);
        }
      });
  }

  setLanguage(language: string): void {
    this.translocoService.setActiveLang(language);
    this.currentLang = language;
  }
}
