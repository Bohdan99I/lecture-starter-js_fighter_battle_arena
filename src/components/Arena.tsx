import React, { useState, useEffect, useRef } from 'react';
import { Fighter, FighterDetails } from '../types/fighter';
import { controls } from '../constants/controls';
import { getDamage, getCriticalHitDamage } from '../utils/fighterUtils';

interface ArenaProps {
  leftFighter: FighterDetails;
  rightFighter: FighterDetails;
  onFightEnd: (winner: FighterDetails) => void;
}

export const Arena: React.FC<ArenaProps> = ({ leftFighter, rightFighter, onFightEnd }) => {
  const [player1Health, setPlayer1Health] = useState(leftFighter.health);
  const [player2Health, setPlayer2Health] = useState(rightFighter.health);
  const [player1Block, setPlayer1Block] = useState(false);
  const [player2Block, setPlayer2Block] = useState(false);
  const [player1CriticalCooldown, setPlayer1CriticalCooldown] = useState(false);
  const [player2CriticalCooldown, setPlayer2CriticalCooldown] = useState(false);
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [fightInProgress, setFightInProgress] = useState(false);
  const [winner, setWinner] = useState<FighterDetails | null>(null);

  const player1CritKeysRef = useRef<string[]>([]);
  const player2CritKeysRef = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed(prev => new Set([...prev, e.code]));
      
      // Player 1 Controls
      if (e.code === controls.PlayerOne.attack && !player1Block) {
        handleAttack(1);
      } else if (e.code === controls.PlayerOne.block) {
        setPlayer1Block(true);
      }
      
      // Player 2 Controls
      if (e.code === controls.PlayerTwo.attack && !player2Block) {
        handleAttack(2);
      } else if (e.code === controls.PlayerTwo.block) {
        setPlayer2Block(true);
      }
      
      // Critical hit logic for Player 1
      if (controls.PlayerOne.criticalHitCombination.includes(e.code)) {
        player1CritKeysRef.current.push(e.code);
        
        // Check if all critical hit keys are pressed
        const allCriticalKeysPressed = controls.PlayerOne.criticalHitCombination.every(
          key => player1CritKeysRef.current.includes(key)
        );
        
        if (allCriticalKeysPressed && !player1CriticalCooldown) {
          handleCriticalHit(1);
          player1CritKeysRef.current = [];
        }
      }
      
      // Critical hit logic for Player 2
      if (controls.PlayerTwo.criticalHitCombination.includes(e.code)) {
        player2CritKeysRef.current.push(e.code);
        
        // Check if all critical hit keys are pressed
        const allCriticalKeysPressed = controls.PlayerTwo.criticalHitCombination.every(
          key => player2CritKeysRef.current.includes(key)
        );
        
        if (allCriticalKeysPressed && !player2CriticalCooldown) {
          handleCriticalHit(2);
          player2CritKeysRef.current = [];
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(e.code);
        return newSet;
      });
      
      // Release blocks
      if (e.code === controls.PlayerOne.block) {
        setPlayer1Block(false);
      }
      
      if (e.code === controls.PlayerTwo.block) {
        setPlayer2Block(false);
      }
      
      // Remove from critical hit arrays
      if (controls.PlayerOne.criticalHitCombination.includes(e.code)) {
        player1CritKeysRef.current = player1CritKeysRef.current.filter(key => key !== e.code);
      }
      
      if (controls.PlayerTwo.criticalHitCombination.includes(e.code)) {
        player2CritKeysRef.current = player2CritKeysRef.current.filter(key => key !== e.code);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [player1Block, player2Block, player1CriticalCooldown, player2CriticalCooldown]);

  useEffect(() => {
    if (player1Health <= 0) {
      const updatedRightFighter = { ...rightFighter, currentHealth: player2Health };
      setWinner(updatedRightFighter);
      onFightEnd(updatedRightFighter);
      setFightInProgress(false);
    } else if (player2Health <= 0) {
      const updatedLeftFighter = { ...leftFighter, currentHealth: player1Health };
      setWinner(updatedLeftFighter);
      onFightEnd(updatedLeftFighter);
      setFightInProgress(false);
    }
  }, [player1Health, player2Health, leftFighter, rightFighter, onFightEnd]);

  const handleAttack = (player: 1 | 2) => {
    if (!fightInProgress) return;
    
    if (player === 1 && !player1Block) {
      if (player2Block) return; // No damage if opponent is blocking
      
      const damage = getDamage(leftFighter, rightFighter);
      setPlayer2Health(prev => Math.max(0, prev - damage));
    } else if (player === 2 && !player2Block) {
      if (player1Block) return; // No damage if opponent is blocking
      
      const damage = getDamage(rightFighter, leftFighter);
      setPlayer1Health(prev => Math.max(0, prev - damage));
    }
  };

  const handleCriticalHit = (player: 1 | 2) => {
    if (!fightInProgress) return;
    
    if (player === 1 && !player1CriticalCooldown) {
      const criticalDamage = getCriticalHitDamage(leftFighter.attack);
      setPlayer2Health(prev => Math.max(0, prev - criticalDamage));
      setPlayer1CriticalCooldown(true);
      
      // 10 second cooldown
      setTimeout(() => setPlayer1CriticalCooldown(false), 10000);
    } else if (player === 2 && !player2CriticalCooldown) {
      const criticalDamage = getCriticalHitDamage(rightFighter.attack);
      setPlayer1Health(prev => Math.max(0, prev - criticalDamage));
      setPlayer2CriticalCooldown(true);
      
      // 10 second cooldown
      setTimeout(() => setPlayer2CriticalCooldown(false), 10000);
    }
  };

  const startFight = () => {
    setFightInProgress(true);
    setPlayer1Health(leftFighter.health);
    setPlayer2Health(rightFighter.health);
    setWinner(null);
  };

  const getHealthBarColor = (currentHealth: number, maxHealth: number) => {
    const healthPercentage = (currentHealth / maxHealth) * 100;
    if (healthPercentage > 60) return 'bg-green-500';
    if (healthPercentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-4xl bg-gray-200 p-6 rounded-lg relative">
        <h2 className="text-2xl font-bold text-center mb-6">Battle Arena</h2>
        
        {/* Health bars */}
        <div className="flex justify-between mb-4">
          <div className="w-1/2 pr-2">
            <div className="h-6 bg-gray-300 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getHealthBarColor(player1Health, leftFighter.health)} transition-all duration-500`}
                style={{ width: `${(player1Health / leftFighter.health) * 100}%` }}
              ></div>
            </div>
            <div className="text-center mt-1">{player1Health.toFixed(1)} / {leftFighter.health}</div>
          </div>
          
          <div className="w-1/2 pl-2">
            <div className="h-6 bg-gray-300 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getHealthBarColor(player2Health, rightFighter.health)} transition-all duration-500`}
                style={{ width: `${(player2Health / rightFighter.health) * 100}%` }}
              ></div>
            </div>
            <div className="text-center mt-1">{player2Health.toFixed(1)} / {rightFighter.health}</div>
          </div>
        </div>
        
        {/* Fighter images */}
        <div className="flex justify-between items-end mt-8">
          <div className={`transition-all duration-200 ${player1Block ? 'opacity-70' : ''}`}>
            <div className="relative">
              {player1CriticalCooldown && (
                <div className="absolute -top-6 left-0 right-0 text-center text-xs text-red-600 font-bold">
                  COOLDOWN
                </div>
              )}
              <img 
                src={leftFighter.source} 
                alt={leftFighter.name} 
                className={`w-32 h-32 object-cover ${player1Block ? 'border-4 border-blue-500' : ''}`}
              />
              <div className="text-center mt-2 font-bold text-red-600">{leftFighter.name}</div>
              <div className="text-center text-xs">(A to attack, D to block)</div>
              <div className="text-center text-xs">QWE for critical hit</div>
            </div>
          </div>
          
          <div className="text-4xl font-bold my-4">VS</div>
          
          <div className={`transition-all duration-200 ${player2Block ? 'opacity-70' : ''}`}>
            <div className="relative">
              {player2CriticalCooldown && (
                <div className="absolute -top-6 left-0 right-0 text-center text-xs text-red-600 font-bold">
                  COOLDOWN
                </div>
              )}
              <img 
                src={rightFighter.source} 
                alt={rightFighter.name} 
                className={`w-32 h-32 object-cover ${player2Block ? 'border-4 border-blue-500' : ''}`}
              />
              <div className="text-center mt-2 font-bold text-blue-600">{rightFighter.name}</div>
              <div className="text-center text-xs">(J to attack, L to block)</div>
              <div className="text-center text-xs">UIO for critical hit</div>
            </div>
          </div>
        </div>
        
        {/* Fight button */}
        <div className="mt-8 text-center">
          <button
            onClick={startFight}
            disabled={fightInProgress}
            className={`px-6 py-3 rounded-full font-bold text-white ${
              fightInProgress ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            } transition-colors duration-300`}
          >
            {fightInProgress ? 'FIGHT IN PROGRESS' : 'FIGHT!'}
          </button>
        </div>
      </div>
      
      {/* Winner modal */}
      {winner && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <h3 className="text-2xl font-bold mb-4">WINNER!</h3>
            <div className="flex justify-center mb-4">
              <img 
                src={winner.source} 
                alt={winner.name} 
                className="w-48 h-48 object-cover rounded-lg border-4 border-yellow-500"
              />
            </div>
            <div className="text-xl font-bold text-green-600">{winner.name}</div>
            <p className="mt-2">Remaining Health: {winner.currentHealth?.toFixed(1)}</p>
            <button
              onClick={() => setWinner(null)}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export function renderArena(leftFighter: Fighter, rightFighter: Fighter) { 
  
  return new Promise<Fighter>((resolve) => {
    const winner = fight(leftFighter, rightFighter).then(winner => {
      showWinnerModal(winner);
      resolve(winner);
    });
  });
}

export function fight(leftFighter: Fighter, rightFighter: Fighter): Promise<Fighter> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const winner = Math.random() > 0.5 ? leftFighter : rightFighter;
      resolve(winner);
    }, 1000);
  });
}

export function showWinnerModal(winner: Fighter) {
  console.log(`Winner: ${winner.name}`);
}