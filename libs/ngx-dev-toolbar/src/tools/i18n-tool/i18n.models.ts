export interface I18nLocale {
  id: string;
  name: string;
  code: string;
}

export interface I18nTimezone {
  id: string;
  name: string;
  offset: string;
}

export interface I18nCurrency {
  code: string;
  name: string;
  symbol: string;
}

export type I18nUnitSystem = 'metric' | 'imperial';
export type I18nDateFormat = 'locale-default' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type I18nFirstDayOfWeek = 'locale-default' | 'sunday' | 'monday' | 'saturday';
export type I18nNumberFormat = 'locale-default' | 'period-comma' | 'comma-period' | 'space-comma';

export interface I18nState {
  locale: I18nLocale | null;
  timezone: I18nTimezone | null;
  currency: I18nCurrency | null;
  unitSystem: I18nUnitSystem | null;
  dateFormat: I18nDateFormat | null;
  firstDayOfWeek: I18nFirstDayOfWeek | null;
  numberFormat: I18nNumberFormat | null;
  pseudoLocEnabled: boolean;
  rtlEnabled: boolean;
}

export interface I18nPresetConfig {
  locale?: string | null;
  timezone?: string | null;
  currency?: string | null;
  unitSystem?: string | null;
  dateFormat?: string | null;
  firstDayOfWeek?: string | null;
  numberFormat?: string | null;
  pseudoLocEnabled?: boolean;
  rtlEnabled?: boolean;
}

export interface I18nToolConfig {
  showLocale?: boolean;
  showTimezone?: boolean;
  showCurrency?: boolean;
  showUnits?: boolean;
  showDateFormat?: boolean;
  showFirstDayOfWeek?: boolean;
  showNumberFormat?: boolean;
  showFormattingPreview?: boolean;
  showStressTesting?: boolean;
}

export const DEFAULT_TIMEZONES: I18nTimezone[] = [
  { id: 'UTC', name: 'UTC', offset: '+00:00' },
  { id: 'America/New_York', name: 'Eastern Time (US)', offset: '-05:00' },
  { id: 'America/Chicago', name: 'Central Time (US)', offset: '-06:00' },
  { id: 'America/Denver', name: 'Mountain Time (US)', offset: '-07:00' },
  { id: 'America/Los_Angeles', name: 'Pacific Time (US)', offset: '-08:00' },
  { id: 'Europe/London', name: 'London (GMT)', offset: '+00:00' },
  { id: 'Europe/Paris', name: 'Paris (CET)', offset: '+01:00' },
  { id: 'Europe/Berlin', name: 'Berlin (CET)', offset: '+01:00' },
  { id: 'Asia/Tokyo', name: 'Tokyo (JST)', offset: '+09:00' },
  { id: 'Asia/Shanghai', name: 'Shanghai (CST)', offset: '+08:00' },
  { id: 'Asia/Kolkata', name: 'India (IST)', offset: '+05:30' },
  { id: 'Asia/Dubai', name: 'Dubai (GST)', offset: '+04:00' },
  { id: 'Australia/Sydney', name: 'Sydney (AEST)', offset: '+10:00' },
  { id: 'Pacific/Auckland', name: 'Auckland (NZST)', offset: '+12:00' },
  { id: 'America/Sao_Paulo', name: 'Sao Paulo (BRT)', offset: '-03:00' },
];

export const DEFAULT_CURRENCIES: I18nCurrency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '\u20AC' },
  { code: 'GBP', name: 'British Pound', symbol: '\u00A3' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '\u00A5' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '\u00A5' },
  { code: 'INR', name: 'Indian Rupee', symbol: '\u20B9' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'KRW', name: 'South Korean Won', symbol: '\u20A9' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
];

export const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
  DEFAULT_CURRENCIES.map(({ code, symbol }) => [code, symbol])
);
