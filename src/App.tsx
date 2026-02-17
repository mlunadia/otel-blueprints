import { AppProvider, useAppContext } from './context/AppContext';
import { Header } from './components/Layout/Header';
import { MainView } from './components/Layout/MainView';
import { Sidebar } from './components/Layout/Sidebar';
import { ExplorePage } from './components/Pages/ExplorePage';
import { HowItWorksPage } from './components/Pages/HowItWorksPage';

function AppContent() {
  const { currentPage } = useAppContext();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header />
      {currentPage === 'home' && <MainView />}
      {currentPage === 'explore' && <ExplorePage />}
      {currentPage === 'how-it-works' && <HowItWorksPage />}
      <Sidebar />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
