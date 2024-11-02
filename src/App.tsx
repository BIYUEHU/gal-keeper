import { useState } from 'react';
import { Layout } from './components/Layout/Layout';
import { GameGrid } from './components/GameGrid/GameGrid';
import { Settings } from './components/Settings/Settings';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { Game } from './types/types';

// Initialize FluentUI icons
initializeIcons();

const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <Layout/ >
  );
};

export default App;