import { Game } from '@/types'
import { Link } from 'react-router-dom'

interface GameCardProps {
  game: Game
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <Link to={`/games/${game.id}`} className="no-underline">
      <div className="relative cursor-pointer">
        <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
          <img
            src={game.cover}
            alt={game.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="mt-2 space-y-1">
          <h3 className="text-sm font-medium line-clamp-2 text-gray-900">{game.title}</h3>
          <p className="text-xs text-gray-500">{game.developers.join(', ')}</p>
          {game.rating && <div className="text-sm font-semibold text-blue-600">{game.rating}</div>}
        </div>
      </div>
    </Link>
  )
}
