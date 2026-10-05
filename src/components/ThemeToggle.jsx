import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try { localStorage.setItem('talentia-theme', next); } catch (e) {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className={`w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className}`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}