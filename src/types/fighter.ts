export interface Fighter {
  id: string;
  name: string;
  health: number;
  attack: number;
  defense: number;
  source: string;
}

export interface FighterDetails extends Fighter {
  currentHealth?: number;
}