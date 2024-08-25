import { createThemes } from 'tw-colors';
import { themeColors } from './src/styles/theme-colors';

/** @type {import('tailwindcss').Config} */
export const content = ['./index.html', './src/**/*.{js,ts,jsx,tsx}'];
export const plugins = [createThemes(themeColors)];
