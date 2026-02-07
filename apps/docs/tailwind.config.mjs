/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          0: '#0b0f1a',
          1: '#111827',
          2: '#1a2234',
          3: '#1f2937',
          4: '#283548',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#d1d5db',
            '--tw-prose-headings': '#f9fafb',
            '--tw-prose-lead': '#9ca3af',
            '--tw-prose-links': '#818cf8',
            '--tw-prose-bold': '#f9fafb',
            '--tw-prose-counters': '#9ca3af',
            '--tw-prose-bullets': '#4b5563',
            '--tw-prose-hr': '#374151',
            '--tw-prose-quotes': '#f3f4f6',
            '--tw-prose-quote-borders': '#4f46e5',
            '--tw-prose-captions': '#9ca3af',
            '--tw-prose-code': '#e0e7ff',
            '--tw-prose-pre-code': '#e5e7eb',
            '--tw-prose-pre-bg': '#1a2234',
            '--tw-prose-th-borders': '#4b5563',
            '--tw-prose-td-borders': '#374151',
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
