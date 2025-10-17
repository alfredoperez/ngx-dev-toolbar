import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, firstValueFrom, map } from 'rxjs';
import { DevToolsStorageService } from '../../utils/storage.service';
import { Language } from './language.models';

@Injectable({ providedIn: 'root' })
export class DevToolbarInternalLanguageService {
  private readonly STORAGE_KEY = 'language';
  private readonly storageService = inject(DevToolsStorageService);

  private languages$ = new BehaviorSubject<Language[]>([]);
  private forcedLanguage$ = new BehaviorSubject<Language | null>(null);

  public languages = toSignal(this.languages$, { initialValue: [] });

  constructor() {
    this.loadForcedLanguage();
  }

  setAppLanguages(languages: Language[]): void {
    this.languages$.next(languages);
  }

  getAppLanguages(): Observable<Language[]> {
    return this.languages$.asObservable();
  }

  setForcedLanguage(language: Language): void {
    this.forcedLanguage$.next(language);
    this.storageService.set(this.STORAGE_KEY, language);
  }

  getForcedLanguage(): Observable<Language[]> {
    return this.forcedLanguage$.pipe(
      map((language) => (language ? [language] : []))
    );
  }

  removeForcedLanguage(): void {
    this.forcedLanguage$.next(null);
    this.storageService.remove(this.STORAGE_KEY);
  }

  private loadForcedLanguage(): void {
    const savedLanguage = this.storageService.get<Language>(this.STORAGE_KEY);
    if (savedLanguage) {
      this.forcedLanguage$.next(savedLanguage);
    }
  }

  /**
   * Apply language from a preset (used by Presets Tool)
   * Accepts a language ID and finds the corresponding Language object from available languages
   */
  async applyPresetLanguage(languageId: string | null): Promise<void> {
    if (languageId === null) {
      this.removeForcedLanguage();
      return;
    }

    // Get available languages and find matching one
    const languages = await firstValueFrom(this.languages$);
    const language = languages.find((lang) => lang.id === languageId);

    if (language) {
      this.setForcedLanguage(language);
    } else {
      console.warn(
        `Language ${languageId} not found in available languages. Skipping.`
      );
    }
  }

  /**
   * Get current forced language ID for saving to preset
   * Returns the language ID or null if no language is forced
   */
  getCurrentForcedLanguage(): string | null {
    return this.forcedLanguage$.value?.id ?? null;
  }
}
