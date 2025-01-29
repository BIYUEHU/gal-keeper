import { useEffect, useMemo, useState } from 'react'
import { Stack } from '@fluentui/react/lib/Stack'
import { Text } from '@fluentui/react/lib/Text'
import { Card } from '@fluentui/react-components'
import { t } from '@/utils/i18n'
import useStore from '@/store'
import type { GameWithLocalData } from '@/types'
import { calculateTotalPlayTime, showMinutes, showTime } from '@/utils'
import { Link } from 'react-router-dom'
import events from '@/utils/events'

const Home: React.FC = () => {
  const { getAllGameData, isRunningGame } = useStore((state) => state)
  const [games, setGames] = useState(getAllGameData(false))

  useEffect(() => {
    events.on('updateGame', () => setGames(getAllGameData(false)))
  }, [getAllGameData])

  const stats = useMemo(() => {
    const todayStart =
      new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`).getTime() / 1000

    const [totalPlayTime, todayPlayTime, totalPlayCount] = games.reduce(
      (acc, game) => [
        acc[0] + calculateTotalPlayTime(game.playTimelines),
        acc[1] + calculateTotalPlayTime(game.playTimelines.filter(([_, start]) => start >= todayStart)),
        acc[2] + game.playTimelines.length
      ],
      [0, 0, 0]
    )

    return {
      totalPlayTime,
      todayPlayTime,
      totalPlayCount,
      recentPlayed: games
        .sort((a, b) => b.lastPlay - a.lastPlay)
        .slice(0, 5)
        .filter((game) => Date.now() - new Date(game.lastPlay).getTime() < 7 * 24 * 60 * 60 * 1000),
      runningGames: games.filter((game) => isRunningGame(game.id)).slice(0, 5),
      recentAdded: games
        .sort((a, b) => b.createDate - a.createDate)
        .slice(0, 5)
        .filter((game) => Date.now() - new Date(game.createDate).getTime() < 7 * 24 * 60 * 60 * 1000)
    }
  }, [games, isRunningGame])

  const timeline = useMemo(() => {
    const events: Array<{
      type: 'play' | 'add'
      game: GameWithLocalData
      time: number
      minutes?: number
    }> = []

    games.map((game) =>
      game.playTimelines.map(([_, end, second]) => {
        const minutes = second / 60
        if (minutes < 1) return
        events.push({
          type: 'play',
          game,
          time: end * 1000,
          minutes
        })
      })
    )

    games.map((game) =>
      events.push({
        type: 'add',
        game,
        time: game.createDate
      })
    )

    return events.sort((a, b) => b.time - a.time)
  }, [games])

  return (
    <div className="overflow-auto p-4">
      <Stack tokens={{ childrenGap: 20 }}>
        <Stack horizontal tokens={{ childrenGap: 16 }}>
          <Card className="flex-1 p-4">
            <Text variant="xLarge" className="block mb-2">{t`page.home.stats.total`}</Text>
            <Text variant="xxLarge" className="font-bold">
              {games.length}
            </Text>
          </Card>
          <Card className="flex-1 p-4">
            <Text variant="xLarge" className="block mb-2">{t`page.home.stats.local`}</Text>
            <Text variant="xxLarge" className="font-bold">
              {games.filter((game) => game.local).length}
            </Text>
          </Card>
          <Card className="flex-1 p-4">
            <Text variant="xLarge" className="block mb-2">{t`page.home.stats.cloud`}</Text>
            <Text variant="xxLarge" className="font-bold">
              {games.filter((game) => !game.local).length}
            </Text>
          </Card>
        </Stack>

        <Stack horizontal tokens={{ childrenGap: 16 }}>
          <Card className="flex-1 p-4">
            <Text variant="xLarge" className="block mb-2">{t`page.home.stats.totalPlayTime`}</Text>
            <Text variant="xxLarge" className="font-bold">
              {showMinutes(stats.totalPlayTime)}
            </Text>
          </Card>
          <Card className="flex-1 p-4">
            <Text variant="xLarge" className="block mb-2">{t`page.home.stats.todayPlayTime`}</Text>
            <Text variant="xxLarge" className="font-bold">
              {showMinutes(stats.todayPlayTime)}
            </Text>
          </Card>
          <Card className="flex-1 p-4">
            <Text variant="xLarge" className="block mb-2">{t`page.home.stats.totalPlayCount`}</Text>
            <Text variant="xxLarge" className="font-bold">
              {stats.totalPlayCount}
            </Text>
          </Card>
        </Stack>

        <Stack horizontal tokens={{ childrenGap: 16 }}>
          <Card className="flex-1 p-4">
            <Text variant="xLarge" className="block mb-4">{t`page.home.activity.recent`}</Text>
            <Stack tokens={{ childrenGap: 8 }}>
              {stats.recentPlayed.map((game) => (
                <Link
                  to={`/details/${game.id}`}
                  key={game.id}
                  className="no-underline flex items-center p-2 rounded hover:bg-gray-50"
                >
                  <img
                    src={game.cover || '/assets/cover.png'}
                    alt={game.title}
                    className="w-10 h-10 object-cover rounded mr-3"
                  />
                  <div>
                    <Text block>{game.title}</Text>
                    <Text className="text-sm text-gray-500">{showTime(game.lastPlay / 1000)}</Text>
                  </div>
                </Link>
              ))}
            </Stack>
          </Card>

          <Card className="flex-1 p-4">
            <Text variant="xLarge" className="block mb-4">{t`page.home.activity.latest`}</Text>
            <Stack tokens={{ childrenGap: 8 }}>
              {stats.recentAdded.map((game) => (
                <Link
                  to={`/details/${game.id}`}
                  key={game.id}
                  className="no-underline flex items-center p-2 rounded hover:bg-gray-50"
                >
                  <img
                    src={game.cover || '/assets/cover.png'}
                    alt={game.title}
                    className="w-10 h-10 object-cover rounded mr-3"
                  />
                  <div>
                    <Text block>{game.title}</Text>
                    <Text className="text-sm text-gray-500">{showTime(game.createDate / 1000)}</Text>
                  </div>
                </Link>
              ))}
            </Stack>
          </Card>

          <Card className="flex-1 p-4">
            <Text variant="xLarge" className="block mb-4">{t`page.home.activity.running`}</Text>
            <Stack tokens={{ childrenGap: 8 }}>
              {stats.runningGames.length > 0 ? (
                stats.runningGames.map((game) => (
                  <Link
                    to={`/details/${game.id}`}
                    key={game.id}
                    className="no-underline flex items-center p-2 rounded hover:bg-gray-50"
                  >
                    <img
                      src={game.cover || '/assets/cover.png'}
                      alt={game.title}
                      className="w-10 h-10 object-cover rounded mr-3"
                    />
                    <div>
                      <Text block>{game.title}</Text>
                    </div>
                  </Link>
                ))
              ) : (
                <Text className="text-gray-500">{t`page.home.activity.running.empty`}</Text>
              )}
            </Stack>
          </Card>
        </Stack>

        <Card className="p-4">
          <Text variant="xLarge" className="block mb-4">{t`page.home.timeline.title`}</Text>
          <Stack tokens={{ childrenGap: 12 }} className="max-h-100 overflow-auto">
            {timeline.map((event) => (
              <Link
                to={`/details/${event.game.id}`}
                key={`${event.game.id}-${event.time}`}
                className="no-underline flex items-start"
              >
                <div className="flex-grow">
                  <div className="flex items-center">
                    <img
                      src={event.game.cover || '/assets/cover.png'}
                      alt={event.game.title}
                      className="w-10 h-10 object-cover rounded mr-3"
                    />
                    <div className="flex-grow">
                      <Text block className="font-medium">
                        {event.game.title}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {`${showTime(event.time / 1000)} • `}
                        {event.type === 'play' ? t`page.home.timeline.played` : t`page.home.timeline.added`}
                        {event.minutes && ` • ${showMinutes(event.minutes)}`}
                      </Text>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </Stack>
        </Card>
      </Stack>
    </div>
  )
}

export default Home
