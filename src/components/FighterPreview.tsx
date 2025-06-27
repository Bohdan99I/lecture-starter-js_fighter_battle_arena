import React from "react";
import { Fighter } from "../types/fighter";

interface FighterPreviewProps {
  fighter: Fighter;
}

export const FighterPreview: React.FC<FighterPreviewProps> = ({ fighter }) => {
  const { name, health, attack, defense, source } = fighter;

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <img
        src={source}
        alt={name}
        className="w-32 h-32 object-cover mb-4 rounded-md"
      />
      <h2 className="text-xl font-bold mb-2">{name}</h2>
      <div className="w-full space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-700">Health:</span>
          <span className="font-semibold text-red-600">{health}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Attack:</span>
          <span className="font-semibold text-orange-600">{attack}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Defense:</span>
          <span className="font-semibold text-blue-600">{defense}</span>
        </div>
      </div>
    </div>
  );
};

export function createFighterPreview(
  fighter: Fighter,
  position: "left" | "right"
): HTMLElement {
  const container = document.createElement("div");
  container.className = "fighter-preview";

  const fighterElement = document.createElement("div");
  fighterElement.className =
    position === "left" ? "fighter-left" : "fighter-right";

  const imageElement = document.createElement("img");
  imageElement.src = fighter.source;
  imageElement.alt = fighter.name;

  const nameElement = document.createElement("div");
  nameElement.innerText = fighter.name;

  fighterElement.append(imageElement, nameElement);
  container.append(fighterElement);

  return container;
}
