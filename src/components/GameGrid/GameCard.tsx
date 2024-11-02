import { Game } from "../../types/types";

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <div className="relative group cursor-pointer">
      <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
        <img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="mt-2 space-y-1">
        <h3 className="text-sm font-medium line-clamp-2">{game.title}</h3>
        <p className="text-xs text-gray-500">{game.developer}</p>
        {game.rating && (
          <div className="text-sm font-semibold text-blue-600">
            {game.rating}
          </div>
        )}
      </div>
    </div>
  );
};