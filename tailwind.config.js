/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        secondary: 'var(--secondary)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'var(--border)',
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: 'var(--destructive)',
        block: {
          1: 'var(--block-1)',
          2: 'var(--block-2)',
          3: 'var(--block-3)',
          4: 'var(--block-4)',
          5: 'var(--block-5)',
          6: 'var(--block-6)',
          7: 'var(--block-7)',
          8: 'var(--block-8)',
          9: 'var(--block-9)',
        },
      },
    },
  },
  plugins: [],
};
