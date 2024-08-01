import { useContext } from 'react';
import { ThemeContext, ThemeContextValue } from '@/providers/ThemeProvider';

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');

  return context;
};
