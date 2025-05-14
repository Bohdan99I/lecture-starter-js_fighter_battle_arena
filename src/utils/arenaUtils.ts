import { Fighter } from '../types/fighter';

export function renderArena(leftFighter: Fighter, rightFighter: Fighter) {
  return new Promise<Fighter>((resolve) => {
    fight(leftFighter, rightFighter).then(winner => {
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
  console.log(`Переможець: ${winner.name}`);
}