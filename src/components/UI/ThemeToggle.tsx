import { Moon, Sun } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppContext();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-[var(--text-primary)]" />
      ) : (
        <Moon size={20} className="text-[var(--text-primary)]" />
      )}
    </button>
  );
}
