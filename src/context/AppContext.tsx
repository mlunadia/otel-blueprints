import { createContext, useContext, useState, ReactNode } from 'react';
import { Requirements, DataLossPolicy, EnvironmentType, defaultRequirements, ComposedArchitecture, composeArchitecture } from '../data/composer';

export type Theme = 'dark' | 'light';

// Re-export types from composer for convenience
export type { Requirements, DataLossPolicy, EnvironmentType, ComposedArchitecture };
export { defaultRequirements };

export type Page = 'home' | 'explore' | 'how-it-works';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  requirements: Requirements;
  setRequirement: <K extends keyof Requirements>(key: K, value: Requirements[K]) => void;
  resetRequirements: () => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  // Computed architecture based on current requirements
  composedArchitecture: ComposedArchitecture;
  // Sidebar state for viewing layer details
  expandedPanel: string | null;
  setExpandedPanel: (panel: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [requirements, setRequirements] = useState<Requirements>(defaultRequirements);
  const [showResults, setShowResults] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setRequirement = <K extends keyof Requirements>(key: K, value: Requirements[K]) => {
    setRequirements(prev => ({ ...prev, [key]: value }));
  };

  const resetRequirements = () => {
    setRequirements(defaultRequirements);
    setShowResults(false);
    setCurrentPage('home');
  };

  // Compute architecture whenever requirements change
  const composedArchitecture = composeArchitecture(requirements);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentPage,
        setCurrentPage,
        requirements,
        setRequirement,
        resetRequirements,
        showResults,
        setShowResults,
        composedArchitecture,
        expandedPanel,
        setExpandedPanel,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      <div className={theme}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
