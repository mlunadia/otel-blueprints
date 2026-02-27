import { RotateCcw, Github } from 'lucide-react';
import { ThemeToggle } from '../UI/ThemeToggle';
import { useAppContext } from '../../context/AppContext';

function OTelLogo({ size = 40 }: { size?: number }) {
  // Official OpenTelemetry logo from CNCF
  return (
    <svg width={size} height={size} viewBox="-12.70 -12.70 1024.40 1024.40" xmlns="http://www.w3.org/2000/svg">
      <path fill="#f5a800" d="M528.7 545.9c-42 42-42 110.1 0 152.1s110.1 42 152.1 0 42-110.1 0-152.1-110.1-42-152.1 0zm113.7 113.8c-20.8 20.8-54.5 20.8-75.3 0-20.8-20.8-20.8-54.5 0-75.3 20.8-20.8 54.5-20.8 75.3 0 20.8 20.7 20.8 54.5 0 75.3zm36.6-643l-65.9 65.9c-12.9 12.9-12.9 34.1 0 47l257.3 257.3c12.9 12.9 34.1 12.9 47 0l65.9-65.9c12.9-12.9 12.9-34.1 0-47L725.9 16.7c-12.9-12.9-34-12.9-46.9 0zM217.3 858.8c11.7-11.7 11.7-30.8 0-42.5l-33.5-33.5c-11.7-11.7-30.8-11.7-42.5 0L72.1 852l-.1.1-19-19c-10.5-10.5-27.6-10.5-38 0-10.5 10.5-10.5 27.6 0 38l114 114c10.5 10.5 27.6 10.5 38 0s10.5-27.6 0-38l-19-19 .1-.1 69.2-69.2z"/>
      <path fill="#425cc7" d="M565.9 205.9L419.5 352.3c-13 13-13 34.4 0 47.4l90.4 90.4c63.9-46 153.5-40.3 211 17.2l73.2-73.2c13-13 13-34.4 0-47.4L613.3 205.9c-13-13.1-34.4-13.1-47.4 0zm-94 322.3l-53.4-53.4c-12.5-12.5-33-12.5-45.5 0L184.7 663.2c-12.5 12.5-12.5 33 0 45.5l106.7 106.7c12.5 12.5 33 12.5 45.5 0L458 694.1c-25.6-52.9-21-116.8 13.9-165.9z"/>
    </svg>
  );
}

export function Header() {
  const { resetRequirements, showResults, setCurrentPage, currentPage } = useAppContext();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <button 
          onClick={() => {
            setCurrentPage('home');
            if (currentPage !== 'home') {
              // Don't reset if we're already on home
            }
          }}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <OTelLogo size={40} />
          <div className="text-left">
            <h1 className="font-bold text-lg text-[var(--text-primary)]">OpenTelemetry Blueprints</h1>
            <p className="text-xs text-[var(--text-secondary)]">Find the right OpenTelemetry pattern for your needs</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {(showResults || currentPage !== 'home') && (
            <button
              onClick={resetRequirements}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors text-sm text-[var(--text-primary)]"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Start Over</span>
            </button>
          )}
          <a
            href="https://github.com/mlunadia/otel-blueprints"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <Github size={20} className="text-[var(--text-primary)]" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
