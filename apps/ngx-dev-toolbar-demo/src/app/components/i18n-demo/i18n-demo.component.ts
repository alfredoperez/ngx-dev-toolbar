import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { TranslateModule } from '@ngx-translate/core';
import {
  ToolbarI18nService,
  I18nDateFormat,
  I18nNumberFormat,
  I18nFirstDayOfWeek,
  I18nUnitSystem,
  CURRENCY_SYMBOLS,
  formatCustomDate,
  formatCustomNumber,
  formatDate,
  formatNumber,
  formatTime,
  formatCurrency,
} from 'ngx-dev-toolbar';
import { map } from 'rxjs';

@Component({
  selector: 'app-i18n-demo',
  standalone: true,
  imports: [TranslocoPipe, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .i18n-demo {
      padding: 24px;
      max-width: 960px;
      margin: 0 auto;
    }
    .demo-header {
      margin-bottom: 32px;
    }
    .demo-header h2 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 8px;
    }
    .demo-description {
      color: #6b7280;
      margin: 0;
    }
    .section-title {
      font-size: 0.6875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #a3a3a3;
      margin-bottom: 12px;
    }
    .demo-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      background: #fff;
      margin-bottom: 24px;
    }
    .demo-card h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 16px;
    }

    /* Translation cards */
    .translation-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .translation-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      background: #fff;
    }
    .translation-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .translation-header h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }
    .lib-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .lib-badge.transloco {
      background: #dbeafe;
      color: #1e40af;
    }
    .lib-badge.ngx-translate {
      background: #fef3c7;
      color: #92400e;
    }
    .translated-text {
      font-size: 0.875rem;
      color: #374151;
      line-height: 1.6;
    }
    .translated-text p {
      margin: 0 0 8px;
    }

    /* Formatting preview table */
    .format-table {
      width: 100%;
      border-collapse: collapse;
    }
    .format-table td {
      padding: 6px 0;
      font-size: 0.875rem;
    }
    .format-table td:first-child {
      color: #6b7280;
      width: 80px;
    }
    .format-table td:nth-child(2) {
      font-family: 'JetBrains Mono', monospace;
      padding-right: 24px;
    }
    .format-table td:nth-child(3) {
      color: #6b7280;
      width: 80px;
    }
    .format-table td:last-child {
      font-family: 'JetBrains Mono', monospace;
    }

    /* Status card */
    .status-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 24px;
    }
    .status-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .status-label {
      font-size: 0.875rem;
      color: #6b7280;
    }
    .status-pill {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-pill.active {
      background: #dcfce7;
      color: #166534;
    }
    .status-pill.inactive {
      background: #f3f4f6;
      color: #6b7280;
    }
    .locale-badge {
      display: inline-block;
      background: #ede9fe;
      color: #5b21b6;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    @media (max-width: 640px) {
      .translation-grid {
        grid-template-columns: 1fr;
      }
      .format-table td:nth-child(3),
      .format-table td:nth-child(4) {
        display: none;
      }
      .status-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
  template: `
    <section class="i18n-demo">
      <div class="demo-header">
        <h2>i18n Tool Demo</h2>
        <p class="demo-description">
          Use the i18n tool in the toolbar to switch locale, timezone, currency, and toggle stress testing modes.
          Watch the translations and formatting update live below.
        </p>
      </div>

      <!-- Live Translations -->
      <span class="section-title">Live Translations</span>
      <div class="translation-grid">
        <div class="translation-card">
          <div class="translation-header">
            <h3>Transloco</h3>
            <span class="lib-badge transloco">&#64;jsverse/transloco</span>
          </div>
          <div class="translated-text">
            <p><strong>{{ 'i18nDemo.greeting' | transloco }}</strong></p>
            <p>{{ 'i18nDemo.description' | transloco }}</p>
            <p>{{ 'i18nDemo.recentOrders' | transloco }}</p>
            <p>{{ 'i18nDemo.notifications' | transloco }}</p>
            <p>{{ 'i18nDemo.lastUpdated' | transloco }}</p>
          </div>
        </div>

        <div class="translation-card">
          <div class="translation-header">
            <h3>ngx-translate</h3>
            <span class="lib-badge ngx-translate">&#64;ngx-translate/core</span>
          </div>
          <div class="translated-text">
            <p><strong>{{ 'i18nDemo.greeting' | translate }}</strong></p>
            <p>{{ 'i18nDemo.description' | translate }}</p>
            <p>{{ 'i18nDemo.recentOrders' | translate }}</p>
            <p>{{ 'i18nDemo.notifications' | translate }}</p>
            <p>{{ 'i18nDemo.lastUpdated' | translate }}</p>
          </div>
        </div>
      </div>

      <!-- Formatting Preview -->
      <span class="section-title">Formatting Preview</span>
      <div class="demo-card">
        <table class="format-table">
          <tr>
            <td>Number</td>
            <td>{{ formattedNumber() }}</td>
            <td>Date</td>
            <td>{{ formattedDate() }}</td>
          </tr>
          <tr>
            <td>Time</td>
            <td>{{ formattedTime() }}</td>
            <td>Currency</td>
            <td>{{ formattedCurrency() }}</td>
          </tr>
          <tr>
            <td>Units</td>
            <td>{{ formattedUnits() }}</td>
            <td>First Day</td>
            <td>{{ formattedFirstDay() }}</td>
          </tr>
        </table>
      </div>

      <!-- i18n Status -->
      <span class="section-title">i18n Status</span>
      <div class="demo-card">
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">Locale</span>
            @if (currentLocale()) {
              <span class="locale-badge">{{ currentLocale() }}</span>
            } @else {
              <span class="status-pill inactive">Not Forced</span>
            }
          </div>
          <div class="status-item">
            <span class="status-label">Pseudo-loc</span>
            <span class="status-pill" [class.active]="pseudoLocEnabled()" [class.inactive]="!pseudoLocEnabled()">
              {{ pseudoLocEnabled() ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">RTL</span>
            <span class="status-pill" [class.active]="rtlEnabled()" [class.inactive]="!rtlEnabled()">
              {{ rtlEnabled() ? 'RTL' : 'LTR' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Units</span>
            @if (currentUnitSystem()) {
              <span class="locale-badge">{{ currentUnitSystem() }}</span>
            } @else {
              <span class="status-pill inactive">Not Forced</span>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class I18nDemoComponent {
  private i18nService = inject(ToolbarI18nService);

  currentLocale = toSignal(
    this.i18nService.getForcedValues().pipe(
      map((locales) => (locales.length > 0 ? locales[0].code : null))
    ),
    { initialValue: null }
  );

  private localeCode = computed(() => this.currentLocale() ?? 'en-US');

  currentTimezone = toSignal(
    this.i18nService.getForcedTimezone().pipe(
      map((tz) => tz?.id ?? 'UTC')
    ),
    { initialValue: 'UTC' }
  );

  currentCurrency = toSignal(
    this.i18nService.getForcedCurrency().pipe(
      map((c) => c?.code ?? 'USD')
    ),
    { initialValue: 'USD' }
  );

  currentUnitSystem = toSignal<I18nUnitSystem | null>(
    this.i18nService.getUnitSystem(),
    { initialValue: null }
  );

  currentDateFormat = toSignal<I18nDateFormat | null>(
    this.i18nService.getForcedDateFormat(),
    { initialValue: null }
  );

  currentNumberFormat = toSignal<I18nNumberFormat | null>(
    this.i18nService.getForcedNumberFormat(),
    { initialValue: null }
  );

  currentFirstDay = toSignal<I18nFirstDayOfWeek | null>(
    this.i18nService.getForcedFirstDayOfWeek(),
    { initialValue: null }
  );

  pseudoLocEnabled = toSignal(
    this.i18nService.isPseudoLocalizationEnabled(),
    { initialValue: false }
  );

  rtlEnabled = toSignal(
    this.i18nService.isRtlEnabled(),
    { initialValue: false }
  );

  private now = new Date();

  formattedNumber = computed(() => {
    const nf = this.currentNumberFormat();
    if (nf && nf !== 'locale-default') {
      return formatCustomNumber(1234567.89, nf, this.localeCode());
    }
    return formatNumber(this.localeCode(), 1234567.89);
  });

  formattedDate = computed(() => {
    const df = this.currentDateFormat();
    if (df && df !== 'locale-default') {
      return formatCustomDate(this.now, df, this.localeCode(), this.currentTimezone());
    }
    return formatDate(this.localeCode(), this.currentTimezone(), this.now);
  });

  formattedTime = computed(() =>
    formatTime(this.localeCode(), this.currentTimezone(), this.now)
  );

  formattedCurrency = computed(() => {
    const nf = this.currentNumberFormat();
    if (nf && nf !== 'locale-default') {
      const code = this.currentCurrency();
      const symbol = CURRENCY_SYMBOLS[code] ?? code;
      return `${symbol}${formatCustomNumber(9999.99, nf, this.localeCode())}`;
    }
    return formatCurrency(this.localeCode(), this.currentCurrency(), 9999.99);
  });

  formattedUnits = computed(() => {
    const system = this.currentUnitSystem();
    if (!system) return 'Not Forced';
    if (system === 'metric') {
      return '42 km · 75 kg · 22 °C';
    }
    return '26.1 mi · 165.3 lb · 71.6 °F';
  });

  formattedFirstDay = computed(() => {
    const fd = this.currentFirstDay();
    if (!fd) return 'Not Forced';
    if (fd === 'locale-default') return 'Locale Default';
    const days: Record<string, string[]> = {
      sunday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      monday: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      saturday: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    };
    return (days[fd] ?? days['sunday']).join(' · ');
  });
}
