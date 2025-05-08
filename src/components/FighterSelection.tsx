import React, { useState, useEffect } from "react";
import { Fighter } from "../types/fighter";
import { fighterService } from "../services/fighterService";
import { FighterPreview } from "./FighterPreview";

interface FighterSelectionProps {
  onFighterSelect: (fighter: Fighter) => void;
}

export const FighterSelection: React.FC<FighterSelectionProps> = ({
  onFighterSelect,
}) => {
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [selectedFighter, setSelectedFighter] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFighters = async () => {
      try {
        const fightersData = await fighterService.getFighters();
        setFighters(fightersData);
      } catch (err) {
        setError("Failed to load fighters");
        console.error("Error loading fighters:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFighters();
  }, []);

  const handleFighterClick = async (fighter: Fighter) => {
    try {
      const fighterDetails = await fighterService.getFighterDetails(fighter.id);
      setSelectedFighter(fighterDetails);
      onFighterSelect(fighterDetails);
    } catch (err) {
      setError(`Failed to load details for ${fighter.name}`);
      console.error(`Error loading fighter details for ${fighter.name}:`, err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Завантаження бійців...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Оберіть свого бійця
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {fighters.map((fighter) => (
          <div
            key={fighter.id}
            onClick={() => handleFighterClick(fighter)}
            className={`cursor-pointer transition-transform duration-200 hover:scale-105 ${
              selectedFighter?.id === fighter.id
                ? "ring-4 ring-blue-500 rounded-lg"
                : ""
            }`}
          >
            <FighterPreview fighter={fighter} />
          </div>
        ))}
      </div>

      {selectedFighter && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Обраний боєць</h3>
          <FighterPreview fighter={selectedFighter} />
        </div>
      )}
    </div>
  );
};
