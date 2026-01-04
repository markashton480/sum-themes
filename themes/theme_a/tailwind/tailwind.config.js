/**
 * Name: Tailwind Configuration
 * Path: themes/theme_a/tailwind/tailwind.config.js
 * Purpose: Configure Tailwind CSS for Theme A (Sage & Stone), mapping theme colours
 *          to CSS variables so branding overrides work without rebuilding CSS.
 * Family: Theme A
 * Dependencies: Tailwind (authoring only)
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../templates/**/*.html',
    '../../../core/sum_core/templates/**/*.html',
    '../../../docs/dev/design/wireframes/sage-and-stone/compiled/*.html',
  ],

  // Classes composed dynamically in templates won't be discovered by the
  // content scanner. Safelist them so the associated @layer component
  // selectors are retained in the compiled CSS.
  safelist: [
    'hero--gradient-primary',
    'hero--gradient-secondary',
    'hero--gradient-accent',
  ],
  theme: {
    extend: {
      // Custom font families - Sage & Stone typography
      fontFamily: {
        'display': ['var(--font-heading, "Playfair Display")', 'Georgia', 'serif'],
        'body': ['var(--font-body, "Lato")', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'accent': ['var(--font-heading, "Crimson Text")', 'Georgia', 'serif'],
        'mono': ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      // Colours mapped to CSS variables for branding overrides
      // Uses hsl() format so Tailwind opacity modifiers work (e.g. bg-primary/50)
      colors: {
        'sage': {
          // Core Sage & Stone palette - dynamic via branding vars with fixed defaults
          'black': 'hsl(var(--text-h, 146) var(--text-s, 29%) var(--text-l, 14%) / <alpha-value>)',        // #1A2F23 Obsidian Green
          'linen': 'hsl(var(--background-h, 40) var(--background-s, 27%) var(--background-l, 96%) / <alpha-value>)',     // #F7F5F1 Warm Linen
          'oat': 'hsl(var(--surface-h, 40) var(--surface-s, 22%) var(--surface-l, 86%) / <alpha-value>)',         // #E3DED4 Oat
          'moss': 'hsl(var(--secondary-h, 148) var(--secondary-s, 13%) var(--secondary-l, 38%) / <alpha-value>)',         // #556F61 Moss
          'terra': 'hsl(var(--brand-h, 16) var(--brand-s, 46%) var(--brand-l, 43%) / <alpha-value>)',       // #A0563B Terra
          'stone': 'rgb(var(--color-sage-stone, 143 141 136) / <alpha-value>)',     // #8F8D88 Stone (Fixed neutral)
          'darkmoss': 'rgb(var(--color-sage-darkmoss, 74 99 80) / <alpha-value>)',
          'label': 'rgb(var(--color-sage-label, 74 93 80) / <alpha-value>)',
          'meta': 'rgb(var(--color-sage-meta, 90 110 95) / <alpha-value>)',
          'footer-primary': 'rgb(var(--color-sage-footer-primary, 209 217 212) / <alpha-value>)',
          'footer-secondary': 'rgb(var(--color-sage-footer-secondary, 163 176 168) / <alpha-value>)',
        },
        // Semantic aliases (using CSS variables for branding override)
        'primary': 'hsl(var(--brand-h, 16) var(--brand-s, 46%) var(--brand-l, 43%) / <alpha-value>)',
        'secondary': 'hsl(var(--secondary-h, 148) var(--secondary-s, 13%) var(--secondary-l, 38%) / <alpha-value>)',
        'accent': 'hsl(var(--accent-h, 16) var(--accent-s, 46%) var(--accent-l, 43%) / <alpha-value>)',
      },

      // Custom breakpoints
      screens: {
        'ipad': '970px', // Matches Sage & Stone reference breakpoint
        'desktop': '1200px', // Header/nav switch breakpoint (avoid for general layout)
      },

      // Animation easings from Theme A
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },

      // Typography (prose) configuration
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(26 47 35 / 0.9)',
            '--tw-prose-headings': 'rgb(26 47 35)',
            '--tw-prose-links': 'rgb(160 86 59)',
            '--tw-prose-bold': 'rgb(26 47 35)',
            '--tw-prose-quotes': 'rgb(26 47 35 / 0.9)',
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
