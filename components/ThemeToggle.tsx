import React from 'react';
import { SunIcon, MoonIcon } from './Icons';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggleTheme }) => {
  return (
    <button
      onClick={onToggleTheme}
      className="flex items-center justify-start w-full p-2 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5 mr-3" />
      ) : (
        <SunIcon className="w-5 h-5 mr-3" />
      )}
      <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
    </button>
  );
};

export default ThemeToggle;
