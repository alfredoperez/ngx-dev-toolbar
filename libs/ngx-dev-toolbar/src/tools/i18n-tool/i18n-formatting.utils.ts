const PSEUDO_CHAR_MAP: Record<string, string> = {
  a: '\u00e4', b: '\u0183', c: '\u00e7', d: '\u0111', e: '\u00e9',
  f: '\u0192', g: '\u011f', h: '\u0127', i: '\u00ef', j: '\u0135',
  k: '\u0137', l: '\u013c', m: '\u1e41', n: '\u00f1', o: '\u00f6',
  p: '\u00fe', q: '\u01eb', r: '\u0159', s: '\u0161', t: '\u0163',
  u: '\u00fc', v: '\u1e7d', w: '\u0175', x: '\u1e8b', y: '\u00fd',
  z: '\u017e',
  A: '\u00c4', B: '\u0182', C: '\u00c7', D: '\u0110', E: '\u00c9',
  F: '\u0191', G: '\u011e', H: '\u0126', I: '\u00cf', J: '\u0134',
  K: '\u0136', L: '\u013b', M: '\u1e40', N: '\u00d1', O: '\u00d6',
  P: '\u00de', Q: '\u01ea', R: '\u0158', S: '\u0160', T: '\u0162',
  U: '\u00dc', V: '\u1e7c', W: '\u0174', X: '\u1e8a', Y: '\u00dd',
  Z: '\u017d',
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']);

export function formatNumber(locale: string, value: number): string {
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch {
    return String(value);
  }
}

export function formatDate(locale: string, timezone: string, date: Date): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: timezone,
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

export function formatTime(locale: string, timezone: string, date: Date): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
      timeZone: timezone,
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

export function formatCurrency(locale: string, currency: string, value: number): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

export function pseudoLocalize(text: string): string {
  let result = '';
  for (const char of text) {
    result += PSEUDO_CHAR_MAP[char] ?? char;
  }
  return `[\u200B${result}\u200B]`;
}

export type I18nDateFormatType = 'locale-default' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type I18nNumberFormatType = 'locale-default' | 'period-comma' | 'comma-period' | 'space-comma';

export function formatCustomDate(
  date: Date,
  format: I18nDateFormatType,
  locale: string,
  timezone: string
): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear().toString();
  switch (format) {
    case 'MM/DD/YYYY': return `${m}/${d}/${y}`;
    case 'DD/MM/YYYY': return `${d}/${m}/${y}`;
    case 'YYYY-MM-DD': return `${y}-${m}-${d}`;
    default: return formatDate(locale, timezone, date);
  }
}

export function formatCustomNumber(
  value: number,
  format: I18nNumberFormatType,
  locale: string
): string {
  const [intPart, decPart] = value.toFixed(2).split('.');
  const digits = intPart.replace('-', '');
  const groups: string[] = [];
  for (let i = digits.length; i > 0; i -= 3) {
    groups.unshift(digits.slice(Math.max(0, i - 3), i));
  }
  const sign = value < 0 ? '-' : '';
  switch (format) {
    case 'period-comma': return `${sign}${groups.join(',')}.${decPart}`;
    case 'comma-period': return `${sign}${groups.join('.')},${decPart}`;
    case 'space-comma': return `${sign}${groups.join('\u00A0')},${decPart}`;
    default: return formatNumber(locale, value);
  }
}

export function expandText(text: string, factor = 0.35): string {
  const targetLength = Math.ceil(text.length * (1 + factor));
  let result = '';

  for (const char of text) {
    result += char;
    if (VOWELS.has(char) && result.length < targetLength) {
      result += char.toLowerCase();
    }
  }

  // Pad remaining if vowel duplication wasn't enough
  while (result.length < targetLength) {
    result += '~';
  }

  return result;
}
