import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-languages',
  standalone: true,
  imports: [CommonModule, TranslocoDirective],
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
  styleUrls: ['./languages.component.scss'],
})
export class LanguagesComponent {
  private translocoService = inject(TranslocoService);
  currentLang = this.translocoService.getActiveLang();

  setLanguage(lang: string) {
    this.translocoService.setActiveLang(lang);
    this.currentLang = lang;
  }
}
