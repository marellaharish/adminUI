import React, { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext({
    theme: 'system',
    setTheme: () => { },
    isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState('system');
    const [isDark, setIsDark] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'system';
        setThemeState(savedTheme);
    }, []);

    // Update dark mode based on theme preference
    useEffect(() => {
        const root = window.document.documentElement;
        const isDarkMode =
            theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDarkMode) {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
        } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
        }

        setIsDark(isDarkMode);
    }, [theme]);

    const setTheme = (newTheme) => {
        localStorage.setItem('theme', newTheme);
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};
