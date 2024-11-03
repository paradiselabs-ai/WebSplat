import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'chat-area': 'var(--chat-area)',
        'left-panel': 'var(--left-panel)',
        'button-active': 'var(--button-active)',
        'accent-primary': 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        'accent-highlight': 'var(--accent-highlight)',
        'main-bg': 'var(--main-bg)',
        'nav-bg': 'var(--nav-bg)',
        dark: {
          bg: '#1E2128',
          chat: '#2F2F2F',
          panel: '#171717',
          button: {
            active: '#FFFFFF',
          },
          accent: {
            primary: '#4A4A4A',
            secondary: '#243242',
            highlight: '#9A9A9A',
          },
        },
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        hover: 'var(--text-hover)',
      },
      backgroundColor: {
        button: 'var(--button-bg)',
        'button-hover': 'var(--button-hover)',
        'button-active': 'var(--button-active-bg)',
        input: 'var(--input-bg)',
        sidebar: 'var(--sidebar-bg)',
        'sidebar-hover': 'var(--sidebar-hover)',
        panel: 'var(--panel-bg)',
      },
      borderColor: {
        input: 'var(--input-border)',
        panel: 'var(--panel-border)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  darkMode: "class",
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    nextui(),
  ],
};

export default config;
