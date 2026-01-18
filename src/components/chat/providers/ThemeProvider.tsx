import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Theme } from '../interfaces';

function getCurrentTheme(): Theme {
    return (
        (localStorage.getItem('agent-theme') as Theme) || (window?.matchMedia('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light')
    );
}

const ThemeContext = createContext({
    theme: getCurrentTheme(),
    toggle: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => getCurrentTheme());

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
        localStorage.setItem('agent-theme', theme);
    }, [theme]);

    const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

    return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
};
