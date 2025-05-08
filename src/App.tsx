import React, { useState } from 'react';
import { Fighter, FighterDetails } from './types/fighter';
import { FighterSelection } from './components/FighterSelection';
import { Arena } from './components/Arena';

function App() {
  const [fighters, setFighters] = useState<FighterDetails[]>([]);
  const [selectedFighter, setSelectedFighter] = useState<FighterDetails | null>(null);
  const [gameState, setGameState] = useState<'selection' | 'arena'>('selection');
  const [winner, setWinner] = useState<FighterDetails | null>(null);

  const handleFighterSelect = (fighter: FighterDetails) => {
    if (fighters.length < 2) {
      // Add fighter if not already selected
      if (!fighters.some(f => f.id === fighter.id)) {
        const updatedFighters = [...fighters, fighter];
        setFighters(updatedFighters);
        setSelectedFighter(fighter);
        
        if (updatedFighters.length === 2) {
          setGameState('arena');
        }
      }
    } else {
      // Replace the currently selected fighter
      if (selectedFighter) {
        const updatedFighters = fighters.map(f => 
          f.id === selectedFighter.id ? fighter : f
        );
        setFighters(updatedFighters);
        setSelectedFighter(fighter);
      }
    }
  };

  const handleFightEnd = (winner: FighterDetails) => {
    setWinner(winner);
  };

  const resetGame = () => {
    setFighters([]);
    setSelectedFighter(null);
    setGameState('selection');
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-red-600 to-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Fighter Battle Arena</h1>
          {gameState === 'arena' && (
            <button 
              onClick={resetGame}
              className="px-4 py-2 bg-white text-red-600 rounded-md hover:bg-gray-100 transition-colors duration-300"
            >
              New Game
            </button>
          )}
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        {gameState === 'selection' ? (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-2">
                {fighters.length === 0 
                  ? 'Select Player 1' 
                  : 'Select Player 2'}
              </h2>
              <div className="text-sm text-gray-600">
                Choose your fighters for the battle!
              </div>
            </div>
            
            {fighters.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="text-lg font-semibold">Selected Fighters:</div>
                {fighters.map((fighter, index) => (
                  <div 
                    key={fighter.id}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                      index === 0 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <img 
                      src={fighter.source} 
                      alt={fighter.name} 
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span>{fighter.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            <FighterSelection onFighterSelect={handleFighterSelect} />
          </div>
        ) : (
          <Arena 
            leftFighter={fighters[0]} 
            rightFighter={fighters[1]} 
            onFightEnd={handleFightEnd}
          />
        )}
      </main>
      
      <footer className="bg-gray-800 text-white py-4 text-center">
        <div className="container mx-auto">
          <p>&copy; 2025 Fighter Battle Arena</p>
        </div>
      </footer>
    </div>
  );
}

export default App;