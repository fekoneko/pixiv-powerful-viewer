import { createThemes } from 'tw-colors';

/** @type {import('tailwindcss').Config} */
export const content = ['./index.html', './src/**/*.{js,ts,jsx,tsx}'];
export const plugins = [
  createThemes({
    dark: {
      primary: '#0096fa',
      paper: '#303041',
      'paper-hover': '#363648',
      'paper-accent': '#414153',
      background: '#272738',
      text: '#9999aa',
      'text-accent': '#ccccdd',
      'text-header': '#ffffff',
      'text-warning': '#ccb900',
      'text-error': '#dd0000',
    },
    light: {
      primary: '#0096fa',
      paper: '#f6f6fb',
      'paper-hover': '#f0f0ff',
      'paper-accent': '#e7eaff',
      background: '#cfcfdf',
      text: '#777790',
      'text-accent': '#444466',
      'text-header': '#ffffff',
      'text-warning': '#aa9900',
      'text-error': '#ff0000',
    },
  }),
];
