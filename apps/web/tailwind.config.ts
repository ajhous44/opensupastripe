import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Sets the default sans-serif font to Barlow Semi Condensed via CSS variable
        sans: ['var(--font-barlow-semi-condensed)', ...defaultTheme.fontFamily.sans],
        // Uses Barlow Semi Condensed for headings as well for consistency
        heading: ['var(--font-barlow-semi-condensed)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};

export default config; 