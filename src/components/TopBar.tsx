interface TopBarProps {
    currentMode: 'cli' | 'gui';
    onToggle: () => void;
  }
  
  export default function TopBar({ currentMode, onToggle }: TopBarProps) {
    return (
      <header className="bg-gray-900 text-gray-200 p-3 flex justify-between items-center shadow-lg z-10">
        <h1 className="text-xl font-bold font-mono tracking-wider">
          Param's Portfolio
        </h1>
        <button
          onClick={onToggle}
          className="bg-green-500 text-black font-bold py-2 px-4 rounded-md font-mono hover:bg-green-400 transition-colors duration-300"
        >
          Switch to {currentMode === 'cli' ? 'GUI' : 'CLI'}
        </button>
      </header>
    );
  }