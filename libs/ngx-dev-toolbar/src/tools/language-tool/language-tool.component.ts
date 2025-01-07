import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map } from 'rxjs';
import { DevToolbarSelectComponent } from '../../components/select/select.component';
import { DevToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { DevToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { DevToolbarInternalLanguageService } from './language-internal.service';
import { Language } from './language.models';

@Component({
  selector: 'ndt-language-tool',
  standalone: true,
  imports: [DevToolbarToolComponent, DevToolbarSelectComponent],
  styleUrls: ['./language-tool.component.scss'],
  template: `
    <ndt-toolbar-tool title="Languages" icon="translate" [options]="options">
      <div class="language-select">
        <label for="language-select">Language</label>
        <ndt-select
          id="language-select"
          [value]="activeLanguage()"
          [options]="languageOptions()"
          [size]="'medium'"
          (valueChange)="onLanguageChange($event ?? '')"
        />
      </div>
    </ndt-toolbar-tool>
  `,
})
export class DevToolbarLanguageToolComponent {
  private readonly languageService = inject(DevToolbarInternalLanguageService);

  protected readonly options = {
    title: 'Languages',
    description: 'Set the language for your current session',
    size: 'small',
    id: 'ndt-language',
    isBeta: true,
    isClosable: true,
  } as DevToolbarWindowOptions;

  activeLanguage = signal<string>('not-forced');

  languageOptions = toSignal(
    this.languageService.getAppLanguages().pipe(
      map((languages) => [
        { value: 'not-forced', label: 'Not Forced' },
        ...languages.map(({ id: value, name: label }) => ({
          value,
          label,
        })),
      ])
    ),
    { initialValue: [] }
  );

  async onLanguageChange(language: string): Promise<void> {
    if (language === 'not-forced' || !language) {
      this.languageService.removeForcedLanguage();
      return;
    }

    const languages = await firstValueFrom(
      this.languageService.getAppLanguages()
    );
    const selectedLanguage = languages.find(({ id }) => id === language);
    if (selectedLanguage) {
      this.languageService.setForcedLanguage(selectedLanguage as Language);
    }
  }
}
