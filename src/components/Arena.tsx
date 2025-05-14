import React, { useState, useEffect, useRef, useCallback } from "react";
import { FighterDetails } from "../types/fighter";
import { controls } from "../constants/controls";
import { getDamage, getCriticalHitDamage } from "../utils/fighterUtils";

interface ArenaProps {
  leftFighter: FighterDetails;
  rightFighter: FighterDetails;
  onFightEnd: (winner: FighterDetails) => void;
}

export const Arena: React.FC<ArenaProps> = ({
  leftFighter,
  rightFighter,
  onFightEnd,
}) => {
  const [player1Health, setPlayer1Health] = useState(leftFighter.health);
  const [player2Health, setPlayer2Health] = useState(rightFighter.health);
  const [player1Block, setPlayer1Block] = useState(false);
  const [player2Block, setPlayer2Block] = useState(false);
  const [player1CriticalCooldown, setPlayer1CriticalCooldown] = useState(false);
  const [player2CriticalCooldown, setPlayer2CriticalCooldown] = useState(false);
  const [fightInProgress, setFightInProgress] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState<FighterDetails | null>(null);

  const player1CritKeysRef = useRef<string[]>([]);
  const player2CritKeysRef = useRef<string[]>([]);

  const handleAttack = useCallback(
    (player: 1 | 2) => {
      if (!fightInProgress) return;

      if (player === 1 && !player1Block) {
        if (player2Block) return;

        const damage = getDamage(leftFighter, rightFighter);
        setPlayer2Health((prev) => Math.max(0, prev - damage));
      } else if (player === 2 && !player2Block) {
        if (player1Block) return;

        const damage = getDamage(rightFighter, leftFighter);
        setPlayer1Health((prev) => Math.max(0, prev - damage));
      }
    },
    [fightInProgress, player1Block, player2Block, leftFighter, rightFighter]
  );

  const handleCriticalHit = useCallback(
    (player: 1 | 2) => {
      if (!fightInProgress) return;

      if (player === 1 && !player1CriticalCooldown) {
        const criticalDamage = getCriticalHitDamage(leftFighter.attack);
        setPlayer2Health((prev) => Math.max(0, prev - criticalDamage));
        setPlayer1CriticalCooldown(true);
        setTimeout(() => setPlayer1CriticalCooldown(false), 10000);
      } else if (player === 2 && !player2CriticalCooldown) {
        const criticalDamage = getCriticalHitDamage(rightFighter.attack);
        setPlayer1Health((prev) => Math.max(0, prev - criticalDamage));
        setPlayer2CriticalCooldown(true);
        setTimeout(() => setPlayer2CriticalCooldown(false), 10000);
      }
    },
    [
      fightInProgress,
      player1CriticalCooldown,
      player2CriticalCooldown,
      leftFighter.attack,
      rightFighter.attack,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fightInProgress) return;

      if (e.code === controls.PlayerOne.attack && !player1Block) {
        handleAttack(1);
      } else if (e.code === controls.PlayerOne.block) {
        setPlayer1Block(true);
      }

      if (e.code === controls.PlayerTwo.attack && !player2Block) {
        handleAttack(2);
      } else if (e.code === controls.PlayerTwo.block) {
        setPlayer2Block(true);
      }

      if (controls.PlayerOne.criticalHitCombination.includes(e.code)) {
        player1CritKeysRef.current.push(e.code);

        const allCriticalKeysPressed =
          controls.PlayerOne.criticalHitCombination.every((key) =>
            player1CritKeysRef.current.includes(key)
          );

        if (allCriticalKeysPressed && !player1CriticalCooldown) {
          handleCriticalHit(1);
          player1CritKeysRef.current = [];
        }
      }

      if (controls.PlayerTwo.criticalHitCombination.includes(e.code)) {
        player2CritKeysRef.current.push(e.code);

        const allCriticalKeysPressed =
          controls.PlayerTwo.criticalHitCombination.every((key) =>
            player2CritKeysRef.current.includes(key)
          );

        if (allCriticalKeysPressed && !player2CriticalCooldown) {
          handleCriticalHit(2);
          player2CritKeysRef.current = [];
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === controls.PlayerOne.block) {
        setPlayer1Block(false);
      }

      if (e.code === controls.PlayerTwo.block) {
        setPlayer2Block(false);
      }

      if (controls.PlayerOne.criticalHitCombination.includes(e.code)) {
        player1CritKeysRef.current = player1CritKeysRef.current.filter(
          (key) => key !== e.code
        );
      }

      if (controls.PlayerTwo.criticalHitCombination.includes(e.code)) {
        player2CritKeysRef.current = player2CritKeysRef.current.filter(
          (key) => key !== e.code
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    fightInProgress,
    player1Block,
    player2Block,
    player1CriticalCooldown,
    player2CriticalCooldown,
    handleAttack,
    handleCriticalHit,
  ]);

  useEffect(() => {
    if (!fightInProgress) return;

    if (player1Health <= 0) {
      const updatedRightFighter = {
        ...rightFighter,
        currentHealth: player2Health,
      };
      setWinner(updatedRightFighter);
      setShowWinnerModal(true);
      setFightInProgress(false);
      onFightEnd(updatedRightFighter);
    } else if (player2Health <= 0) {
      const updatedLeftFighter = {
        ...leftFighter,
        currentHealth: player1Health,
      };
      setWinner(updatedLeftFighter);
      setShowWinnerModal(true);
      setFightInProgress(false);
      onFightEnd(updatedLeftFighter);
    }
  }, [
    player1Health,
    player2Health,
    leftFighter,
    rightFighter,
    onFightEnd,
    fightInProgress,
  ]);

  const startFight = () => {
    setFightInProgress(true);
    setPlayer1Health(leftFighter.health);
    setPlayer2Health(rightFighter.health);
    setWinner(null);
    setShowWinnerModal(false);
  };

  const closeWinnerModal = () => {
    setShowWinnerModal(false);
    setWinner(null);
  };

  const getHealthBarColor = (currentHealth: number, maxHealth: number) => {
    const healthPercentage = (currentHealth / maxHealth) * 100;
    if (healthPercentage > 60) return "bg-green-500";
    if (healthPercentage > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-4xl bg-gray-200 p-6 rounded-lg relative">
        <h2 className="text-2xl font-bold text-center mb-6">Арена бою</h2>

        <div className="flex justify-between mb-4">
          <div className="w-1/2 pr-2">
            <div className="h-6 bg-gray-300 rounded-full overflow-hidden">
              <div
                className={`h-full ${getHealthBarColor(
                  player1Health,
                  leftFighter.health
                )} transition-all duration-500`}
                style={{
                  width: `${(player1Health / leftFighter.health) * 100}%`,
                }}
              ></div>
            </div>
            <div className="text-center mt-1">
              {player1Health.toFixed(1)} / {leftFighter.health}
            </div>
          </div>

          <div className="w-1/2 pl-2">
            <div className="h-6 bg-gray-300 rounded-full overflow-hidden">
              <div
                className={`h-full ${getHealthBarColor(
                  player2Health,
                  rightFighter.health
                )} transition-all duration-500`}
                style={{
                  width: `${(player2Health / rightFighter.health) * 100}%`,
                }}
              ></div>
            </div>
            <div className="text-center mt-1">
              {player2Health.toFixed(1)} / {rightFighter.health}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end mt-8">
          <div
            className={`transition-all duration-200 ${
              player1Block ? "opacity-70" : ""
            }`}
          >
            <div className="relative">
              {player1CriticalCooldown && (
                <div className="absolute -top-6 left-0 right-0 text-center text-xs text-red-600 font-bold">
                  ПЕРЕЗАРЯДКА
                </div>
              )}
              <img
                src={leftFighter.source}
                alt={leftFighter.name}
                className={`w-32 h-32 object-cover ${
                  player1Block ? "border-4 border-blue-500" : ""
                }`}
              />
              <div className="text-center mt-2 font-bold text-red-600">
                {leftFighter.name}
              </div>
              <div className="text-center text-xs">(A - атака, D - блок)</div>
              <div className="text-center text-xs">QWE - критична атака</div>
            </div>
          </div>

          <div className="text-4xl font-bold my-4">VS</div>

          <div
            className={`transition-all duration-200 ${
              player2Block ? "opacity-70" : ""
            }`}
          >
            <div className="relative">
              {player2CriticalCooldown && (
                <div className="absolute -top-6 left-0 right-0 text-center text-xs text-red-600 font-bold">
                  ПЕРЕЗАРЯДКА
                </div>
              )}
              <img
                src={rightFighter.source}
                alt={rightFighter.name}
                className={`w-32 h-32 object-cover ${
                  player2Block ? "border-4 border-blue-500" : ""
                }`}
              />
              <div className="text-center mt-2 font-bold text-blue-600">
                {rightFighter.name}
              </div>
              <div className="text-center text-xs">(J - атака, L - блок)</div>
              <div className="text-center text-xs">UIO - критична атака</div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={startFight}
            disabled={fightInProgress}
            className={`px-6 py-3 rounded-full font-bold text-white ${
              fightInProgress
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            } transition-colors duration-300`}
          >
            {fightInProgress ? "БІЙ ТРИВАЄ" : "БИТИСЯ!"}
          </button>
        </div>
      </div>

      {showWinnerModal && winner && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <h3 className="text-2xl font-bold mb-4">ПЕРЕМОЖЕЦЬ!</h3>
            <div className="flex justify-center mb-4">
              <img
                src={winner.source}
                alt={winner.name}
                className="w-48 h-48 object-cover rounded-lg border-4 border-yellow-500"
              />
            </div>
            <div className="text-xl font-bold text-green-600">
              {winner.name}
            </div>
            <p className="mt-2">
              Залишилось здоров'я: {winner.currentHealth?.toFixed(1)}
            </p>
            <button
              onClick={closeWinnerModal}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
            >
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
