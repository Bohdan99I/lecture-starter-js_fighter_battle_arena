export function getHitPower(attack: number): number {
  const criticalHitChance = 1 + Math.random();
  return attack * criticalHitChance;
}

export function getBlockPower(defense: number): number {
  const dodgeChance = 1 + Math.random();
  return defense * dodgeChance;
}

export function getDamage(attacker: { attack: number }, defender: { defense: number }): number {
  const hitPower = getHitPower(attacker.attack);
  const blockPower = getBlockPower(defender.defense);
  
  return Math.max(0, hitPower - blockPower);
}

export function getCriticalHitDamage(attack: number): number {
  return 2 * attack;
}