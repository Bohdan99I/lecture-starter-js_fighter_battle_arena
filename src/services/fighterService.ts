import { MOCK_FIGHTERS } from '../constants/api';
import { Fighter } from '../types/fighter';

class FighterService {
  async getFighters(): Promise<Fighter[]> {
    try {
      return MOCK_FIGHTERS;
    } catch (error) {
      console.error('Error fetching fighters:', error);
      throw new Error('Failed to fetch fighters');
    }
  }

  async getFighterDetails(id: string): Promise<Fighter> {
    try {
      const fighter = MOCK_FIGHTERS.find(f => f.id === id);
      if (!fighter) {
        throw new Error(`Fighter with id ${id} not found`);
      }
      return fighter;
    } catch (error) {
      console.error(`Error fetching fighter ${id}:`, error);
      throw new Error(`Failed to fetch fighter with id ${id}`);
    }
  }
}

export const fighterService = new FighterService();