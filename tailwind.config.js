/** @type {import('tailwindcss').Config} */
const scale = (name) =>
  Object.fromEntries(
    ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].map((step) => [step, `rgb(var(--c-${name}-${step}) / <alpha-value>)`]),
  )

// Colours are CSS variables (see src/theme.css) so one set of classes serves both light and dark themes.
const themed = Object.fromEntries(['slate', 'indigo', 'rose', 'emerald', 'amber', 'cyan', 'fuchsia'].map((name) => [name, scale(name)]))

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ...themed,
        white: 'rgb(var(--c-white) / <alpha-value>)',
        /** Always white, e.g. text on the primary button, in both themes. */
        pure: '#ffffff',
        surface: 'rgb(var(--c-slate-900) / <alpha-value>)',
        surface2: 'rgb(var(--c-slate-900) / <alpha-value>)',
        surface3: 'rgb(var(--c-slate-800) / <alpha-value>)',
        border: 'rgb(var(--c-slate-700) / <alpha-value>)',
        muted: 'rgb(var(--c-slate-400) / <alpha-value>)',
        primary: '#6366f1',
        accent: '#7c3aed',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
      },
    },
  },
  plugins: [],
}
