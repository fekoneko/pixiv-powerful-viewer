import { createThemes } from 'tw-colors';

/** @type {import('tailwindcss').Config} */
export const content = ['./src/renderer/**/*.{js,ts,jsx,tsx,html}'];
export const plugins = [
  createThemes({
    dark: {
      primary: '#0096fa',
      background: '#333344',
      text: '#9999aa',
      'text-accent': '#ccccdd',
      'text-header': '#ffffff',
    },
    light: {
      primary: '#0096fa',
      background: '#ffffff',
      text: '#777790',
      'text-accent': '#444466',
      'text-header': '#ffffff',
    },
  }),
];
