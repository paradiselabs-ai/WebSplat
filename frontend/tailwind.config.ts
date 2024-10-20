import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "background-secondary": "var(--background-secondary)",
        "background-nav": "var(--background-nav)",
        foreground: "var(--foreground)",
        "foreground-secondary": "var(--foreground-secondary)",
        "accent-orange": "var(--accent-orange)",
        "accent-purple": "var(--accent-purple)",
        success: "var(--success)",
        error: "var(--error)",
      },
      fontFamily: {
        primary: ["var(--font-primary)"],
        secondary: ["var(--font-secondary)"],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.618rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.618rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.618rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['4.236rem', { lineHeight: '1' }],
      },
      lineHeight: {
        'golden': '1.618',
      },
      maxWidth: {
        'readable': '70ch',
        'container': '1200px',
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
      },
      gridTemplateAreas: {
        'layout': [
          'sidebar main',
          'sidebar main',
        ],
        'mobile': [
          'main',
          'main',
        ],
      },
      gridTemplateColumns: {
        'layout': '300px 1fr',
        'mobile': '1fr',
      },
    },
  },
  plugins: [
    require('@savvywombat/tailwindcss-grid-areas')
  ],
};

export default config;

// This comment is added to trigger a re-save and potentially resolve the TypeScript errors
