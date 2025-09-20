import { useState } from 'react';
import CLIPortfolio from './components/CLIPortfolio';
import GUIPortfolio from './components/GUIPortfolio';
import TopBar from './components/TopBar';

function App() {
  // State to manage which view is active
  const [viewMode, setViewMode] = useState<'cli' | 'gui'>('cli');

  // Function to toggle the view
  const handleToggleView = () => {
    setViewMode(prevMode => (prevMode === 'cli' ? 'gui' : 'cli'));
  };

  return (
    // Main container that organizes the layout vertically
    <div className="flex flex-col h-screen">
      <TopBar currentMode={viewMode} onToggle={handleToggleView} />
      
      {/* Conditionally render the correct portfolio based on the state */}
      {viewMode === 'cli' ? <CLIPortfolio /> : <GUIPortfolio />}
    </div>
  );
}

export default App;