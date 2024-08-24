import { createContext, FC, PropsWithChildren, useCallback } from 'react';
import { useLocalStorage } from '@/hooks';
import { Theme } from '@/types/theme';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', console.error);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  return (
    <div data-theme={theme ?? 'dark'} className="size-full">
      <ThemeContext.Provider value={{ theme: theme ?? 'light', toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    </div>
  );
};
