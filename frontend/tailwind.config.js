// frontend/tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base':    '#111009',
        'bg-surface': '#18160f',
        'bg-card':    '#201d14',
        gold:         '#c8a84b',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        ui:      ['"DM Mono"', 'monospace'],
      }
    }
  },
  plugins: []
}
