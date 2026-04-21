import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ToolbarSelectComponent } from '../../components/select/select.component';
import { ToolbarToolComponent } from '../../components/toolbar-tool/toolbar-tool.component';
import { ToolbarWindowOptions } from '../../components/toolbar-tool/toolbar-tool.models';
import { ToolbarInternalI18nService } from './i18n-internal.service';
import {
  formatCurrency,
  formatCustomDate,
  formatCustomNumber,
  formatDate,
  formatNumber,
  formatTime,
  pseudoLocalize,
  expandText,
} from './i18n-formatting.utils';
import {
  CURRENCY_SYMBOLS,
  I18nDateFormat,
  I18nFirstDayOfWeek,
  I18nNumberFormat,
  I18nToolConfig,
} from './i18n.models';

const NOT_FORCED = 'not-forced';

const UNIT_SYSTEM_VALUES = ['metric', 'imperial'] as const;
const DATE_FORMAT_VALUES = ['locale-default', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] as const;
const FIRST_DAY_VALUES = ['locale-default', 'sunday', 'monday', 'saturday'] as const;
const NUMBER_FORMAT_VALUES = ['locale-default', 'period-comma', 'comma-period', 'space-comma'] as const;

@Component({
  selector: 'ndt-i18n-tool',
  standalone: true,
  imports: [ToolbarToolComponent, ToolbarSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./i18n-tool.component.scss'],
  template: `
    <ndt-toolbar-tool toolTitle="i18n" icon="globe" [options]="options">
      <div class="i18n-section">
        <!-- Formatting Preview (immediate feedback, always visible) -->
        @if (toolConfig().showFormattingPreview !== false) {
          <div class="i18n-preview" aria-label="Formatting preview">
            <div class="i18n-preview-row">
              <span class="preview-label">Number</span>
              <span class="preview-value">{{ previewNumber() }}</span>
            </div>
            <div class="i18n-preview-row">
              <span class="preview-label">Date</span>
              <span class="preview-value">{{ previewDate() }}</span>
            </div>
            <div class="i18n-preview-row">
              <span class="preview-label">Time</span>
              <span class="preview-value">{{ previewTime() }}</span>
            </div>
            <div class="i18n-preview-row">
              <span class="preview-label">Currency</span>
              <span class="preview-value">{{ previewCurrencyValue() }}</span>
            </div>
          </div>
        }

        <!-- Core settings: locale, timezone, currency -->
        <div class="i18n-select-grid">
          @if (toolConfig().showLocale !== false) {
            <div class="i18n-select-group">
              <label for="i18n-locale">Locale</label>
              <ndt-select
                id="i18n-locale"
                [value]="activeLocale()"
                [options]="localeOptions()"
                [size]="'medium'"
                (valueChange)="onLocaleChange($event ?? '')"
              />
            </div>
          }
          @if (toolConfig().showTimezone !== false) {
            <div class="i18n-select-group">
              <label for="i18n-timezone">Timezone</label>
              <ndt-select
                id="i18n-timezone"
                [value]="activeTimezone()"
                [options]="timezoneOptions()"
                [size]="'medium'"
                (valueChange)="onTimezoneChange($event ?? '')"
              />
            </div>
          }
          @if (toolConfig().showCurrency !== false) {
            <div class="i18n-select-group">
              <label for="i18n-currency">Currency</label>
              <ndt-select
                id="i18n-currency"
                [value]="activeCurrency()"
                [options]="currencyOptions()"
                [size]="'medium'"
                (valueChange)="onCurrencyChange($event ?? '')"
              />
            </div>
          }
        </div>

        <!-- Advanced format options (progressive disclosure) -->
        @if (hasAdvancedFormatSettings()) {
          <details class="i18n-disclosure">
            <summary>Advanced format options</summary>
            <div class="i18n-select-grid">
              @if (toolConfig().showUnits !== false) {
                <div class="i18n-select-group">
                  <label for="i18n-units">Units</label>
                  <ndt-select
                    id="i18n-units"
                    [value]="activeUnitSystem()"
                    [options]="unitSystemOptions"
                    [size]="'medium'"
                    (valueChange)="onUnitSystemChange($event ?? '')"
                  />
                </div>
              }
              @if (toolConfig().showDateFormat !== false) {
                <div class="i18n-select-group">
                  <label for="i18n-date-format">Date Format</label>
                  <ndt-select
                    id="i18n-date-format"
                    [value]="activeDateFormat()"
                    [options]="dateFormatOptions"
                    [size]="'medium'"
                    (valueChange)="onDateFormatChange($event ?? '')"
                  />
                </div>
              }
              @if (toolConfig().showNumberFormat !== false) {
                <div class="i18n-select-group">
                  <label for="i18n-number-format">Number Format</label>
                  <ndt-select
                    id="i18n-number-format"
                    [value]="activeNumberFormat()"
                    [options]="numberFormatOptions"
                    [size]="'medium'"
                    (valueChange)="onNumberFormatChange($event ?? '')"
                  />
                </div>
              }
              @if (toolConfig().showFirstDayOfWeek !== false) {
                <div class="i18n-select-group">
                  <label for="i18n-first-day">First Day of Week</label>
                  <ndt-select
                    id="i18n-first-day"
                    [value]="activeFirstDayOfWeek()"
                    [options]="firstDayOptions"
                    [size]="'medium'"
                    (valueChange)="onFirstDayOfWeekChange($event ?? '')"
                  />
                </div>
              }
            </div>
          </details>
        }

        <!-- Stress Testing (separate collapsible section) -->
        @if (toolConfig().showStressTesting !== false) {
          <details class="i18n-disclosure">
            <summary>Stress testing</summary>
            <div class="i18n-toggle-section">
              <div class="i18n-toggle-row">
                <div class="toggle-info">
                  <span class="toggle-label">Pseudo-Localization</span>
                  <span class="toggle-hint">Detect hardcoded strings</span>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [checked]="pseudoLocEnabled()"
                    (change)="onPseudoLocToggle($event)"
                  />
                  <span class="toggle-track"></span>
                </label>
              </div>
              @if (pseudoLocEnabled()) {
                <div class="i18n-pseudo-preview">
                  {{ pseudoPreview() }}
                </div>
              }
              <div class="i18n-toggle-row">
                <div class="toggle-info">
                  <span class="toggle-label">RTL Mirroring</span>
                  <span class="toggle-hint">Set document direction to RTL</span>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [checked]="rtlEnabled()"
                    (change)="onRtlToggle($event)"
                  />
                  <span class="toggle-track"></span>
                </label>
              </div>
            </div>
          </details>
        }
      </div>
    </ndt-toolbar-tool>
  `,
})
export class ToolbarI18nToolComponent {
  // --- Injects ---

  private readonly i18nService = inject(ToolbarInternalI18nService);

  // --- Readonly properties ---

  protected readonly options = {
    title: 'i18n',
    description: 'Simulate regional & linguistic environments',
    size: 'tall',
    id: 'ndt-i18n',
    isClosable: true,
  } as ToolbarWindowOptions;

  readonly unitSystemOptions = [
    { value: NOT_FORCED, label: 'Not Forced' },
    { value: 'metric' as const, label: 'Metric' },
    { value: 'imperial' as const, label: 'Imperial' },
  ];

  readonly dateFormatOptions = [
    { value: NOT_FORCED, label: 'Not Forced' },
    { value: 'locale-default' as const, label: 'Locale Default' },
    { value: 'MM/DD/YYYY' as const, label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY' as const, label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD' as const, label: 'YYYY-MM-DD (ISO)' },
  ];

  readonly firstDayOptions = [
    { value: NOT_FORCED, label: 'Not Forced' },
    { value: 'locale-default' as const, label: 'Locale Default' },
    { value: 'sunday' as const, label: 'Sunday' },
    { value: 'monday' as const, label: 'Monday' },
    { value: 'saturday' as const, label: 'Saturday' },
  ];

  readonly numberFormatOptions = [
    { value: NOT_FORCED, label: 'Not Forced' },
    { value: 'locale-default' as const, label: 'Locale Default' },
    { value: 'period-comma' as const, label: '1,234.56' },
    { value: 'comma-period' as const, label: '1.234,56' },
    { value: 'space-comma' as const, label: '1 234,56' },
  ];

  // --- Signals ---

  activeLocale = signal<string>(NOT_FORCED);
  activeTimezone = signal<string>(NOT_FORCED);
  activeCurrency = signal<string>(NOT_FORCED);
  activeUnitSystem = signal<string>(NOT_FORCED);
  activeDateFormat = signal<string>(NOT_FORCED);
  activeFirstDayOfWeek = signal<string>(NOT_FORCED);
  activeNumberFormat = signal<string>(NOT_FORCED);

  pseudoLocEnabled = this.i18nService.pseudoLocEnabled;
  rtlEnabled = this.i18nService.rtlEnabled;

  // --- Computed ---

  toolConfig = computed(() => this.i18nService.toolConfig() as I18nToolConfig);

  hasAdvancedFormatSettings = computed(() => {
    const cfg = this.toolConfig();
    return (
      cfg.showUnits !== false ||
      cfg.showDateFormat !== false ||
      cfg.showNumberFormat !== false ||
      cfg.showFirstDayOfWeek !== false
    );
  });

  localeOptions = toSignal(
    this.i18nService.getAvailableLocales().pipe(
      map((locales) => [
        { value: NOT_FORCED, label: 'Not Forced' },
        ...locales.map(({ id: value, name: label }) => ({ value, label })),
      ])
    ),
    { initialValue: [{ value: NOT_FORCED, label: 'Not Forced' }] }
  );

  timezoneOptions = toSignal(
    this.i18nService.getAvailableTimezones().pipe(
      map((timezones) => [
        { value: NOT_FORCED, label: 'Not Forced' },
        ...timezones.map(({ id: value, name, offset }) => ({
          value,
          label: `${name} (${offset})`,
        })),
      ])
    ),
    { initialValue: [{ value: NOT_FORCED, label: 'Not Forced' }] }
  );

  currencyOptions = toSignal(
    this.i18nService.getAvailableCurrencies().pipe(
      map((currencies) => [
        { value: NOT_FORCED, label: 'Not Forced' },
        ...currencies.map(({ code: value, name, symbol }) => ({
          value,
          label: `${name} (${symbol})`,
        })),
      ])
    ),
    { initialValue: [{ value: NOT_FORCED, label: 'Not Forced' }] }
  );

  private currentLocaleCode = computed(() => {
    const id = this.activeLocale();
    return id === NOT_FORCED ? 'en-US' : id;
  });

  private currentTimezone = computed(() => {
    const id = this.activeTimezone();
    return id === NOT_FORCED ? 'UTC' : id;
  });

  private currentCurrencyCode = computed(() => {
    const id = this.activeCurrency();
    return id === NOT_FORCED ? 'USD' : id;
  });

  private readonly previewDate_ = new Date();

  previewNumber = computed(() => {
    const nf = this.activeNumberFormat();
    if (nf !== NOT_FORCED && nf !== 'locale-default') {
      return formatCustomNumber(1234.56, nf as I18nNumberFormat, this.currentLocaleCode());
    }
    return formatNumber(this.currentLocaleCode(), 1234.56);
  });

  previewDate = computed(() => {
    const df = this.activeDateFormat();
    if (df !== NOT_FORCED && df !== 'locale-default') {
      return formatCustomDate(this.previewDate_, df as I18nDateFormat, this.currentLocaleCode(), this.currentTimezone());
    }
    return formatDate(this.currentLocaleCode(), this.currentTimezone(), this.previewDate_);
  });

  previewTime = computed(() =>
    formatTime(this.currentLocaleCode(), this.currentTimezone(), this.previewDate_)
  );

  previewCurrencyValue = computed(() => {
    const nf = this.activeNumberFormat();
    if (nf !== NOT_FORCED && nf !== 'locale-default') {
      const code = this.currentCurrencyCode();
      const symbol = CURRENCY_SYMBOLS[code] ?? code;
      return `${symbol}${formatCustomNumber(1234.56, nf as I18nNumberFormat, this.currentLocaleCode())}`;
    }
    return formatCurrency(
      this.currentLocaleCode(),
      this.currentCurrencyCode(),
      1234.56
    );
  });

  pseudoPreview = computed(() => {
    const sample = 'Hello World! This is a sample text for testing.';
    const pseudo = pseudoLocalize(sample);
    return expandText(pseudo);
  });

  // --- Constructor: restore persisted values ---

  constructor() {
    const state = this.i18nService.getCurrentI18nState();
    if (state.locale) this.activeLocale.set(state.locale.id);
    if (state.timezone) this.activeTimezone.set(state.timezone.id);
    if (state.currency) this.activeCurrency.set(state.currency.code);
    if (state.unitSystem) this.activeUnitSystem.set(state.unitSystem);
    if (state.dateFormat) this.activeDateFormat.set(state.dateFormat);
    if (state.firstDayOfWeek) this.activeFirstDayOfWeek.set(state.firstDayOfWeek);
    if (state.numberFormat) this.activeNumberFormat.set(state.numberFormat);
  }

  // --- Event handlers ---

  onLocaleChange(localeId: string): void {
    this.activeLocale.set(localeId);
    if (localeId === NOT_FORCED || !localeId) {
      this.i18nService.removeForcedLocale();
      return;
    }
    const selected = this.i18nService.locales().find(({ id }) => id === localeId);
    if (selected) {
      this.i18nService.setForcedLocale(selected);
    }
  }

  onTimezoneChange(timezoneId: string): void {
    this.activeTimezone.set(timezoneId);
    if (timezoneId === NOT_FORCED || !timezoneId) {
      this.i18nService.removeForcedTimezone();
      return;
    }
    const selected = this.i18nService.timezones().find(({ id }) => id === timezoneId);
    if (selected) {
      this.i18nService.setForcedTimezone(selected);
    }
  }

  onCurrencyChange(currencyCode: string): void {
    this.activeCurrency.set(currencyCode);
    if (currencyCode === NOT_FORCED || !currencyCode) {
      this.i18nService.removeForcedCurrency();
      return;
    }
    const selected = this.i18nService.availableCurrencies().find(({ code }) => code === currencyCode);
    if (selected) {
      this.i18nService.setForcedCurrency(selected);
    }
  }

  onUnitSystemChange(unitSystem: string): void {
    this.activeUnitSystem.set(unitSystem);
    if (unitSystem === NOT_FORCED || !unitSystem) {
      this.i18nService.removeForcedUnitSystem();
      return;
    }
    if (UNIT_SYSTEM_VALUES.includes(unitSystem as typeof UNIT_SYSTEM_VALUES[number])) {
      this.i18nService.setForcedUnitSystem(unitSystem as typeof UNIT_SYSTEM_VALUES[number]);
    }
  }

  onPseudoLocToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.i18nService.setPseudoLocEnabled(checked);
  }

  onRtlToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.i18nService.setRtlEnabled(checked);
  }

  onDateFormatChange(value: string): void {
    this.activeDateFormat.set(value);
    if (value === NOT_FORCED || !value) {
      this.i18nService.removeForcedDateFormat();
      return;
    }
    if (DATE_FORMAT_VALUES.includes(value as typeof DATE_FORMAT_VALUES[number])) {
      this.i18nService.setForcedDateFormat(value as I18nDateFormat);
    }
  }

  onFirstDayOfWeekChange(value: string): void {
    this.activeFirstDayOfWeek.set(value);
    if (value === NOT_FORCED || !value) {
      this.i18nService.removeForcedFirstDayOfWeek();
      return;
    }
    if (FIRST_DAY_VALUES.includes(value as typeof FIRST_DAY_VALUES[number])) {
      this.i18nService.setForcedFirstDayOfWeek(value as I18nFirstDayOfWeek);
    }
  }

  onNumberFormatChange(value: string): void {
    this.activeNumberFormat.set(value);
    if (value === NOT_FORCED || !value) {
      this.i18nService.removeForcedNumberFormat();
      return;
    }
    if (NUMBER_FORMAT_VALUES.includes(value as typeof NUMBER_FORMAT_VALUES[number])) {
      this.i18nService.setForcedNumberFormat(value as I18nNumberFormat);
    }
  }
}
