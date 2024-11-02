import { Game } from "../../types/types";
import { GameCard } from "./GameCard";

export const GameGrid: React.FC<{ games: Game[] }> = ({ games }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">游戏</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
            开始游戏
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md">
            编辑
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};