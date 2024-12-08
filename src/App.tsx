// import { useState } from 'react';
import { Layout } from '@/components/Layout/Layout'
import { initializeIcons } from '@fluentui/react/lib/Icons'

// Initialize FluentUI icons
initializeIcons()

const App: React.FC = () => {
  // const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return <Layout />
}

export default App
