import { useMemo, useState } from 'react'
import { Stack } from '@fluentui/react/lib/Stack'
import { Text } from '@fluentui/react/lib/Text'
import { Card } from '@fluentui/react-components'
import { t } from '@/utils/i18n'
import { useSharedStore } from '@/store'
import type { GameWithLocalData } from '@/types'
import { calculateTotalPlayTime, showMinutes } from '@/utils'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  // const { temps } = useStore()
  const [games] = useState(useSharedStore((state) => state.getAllData)(false))
  const runningGames: GameWithLocalData[] =
    /* games.filter((game) => game.local && temps.runningPrograms[game.local.programFile]) */ []

  const stats = useMemo(() => {
    const todayStart = new Date(
      `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDay()}`
    ).getTime()

    let totalPlayTime = 0
    let todayPlayTime = 0
    let totalPlayCount = 0

    games.map((game) => {
      totalPlayTime += calculateTotalPlayTime(game.playTimelines)
      todayPlayTime += calculateTotalPlayTime(game.playTimelines.filter(([_, start]) => start >= todayStart))
      totalPlayCount += game.playTimelines.length
    })

    return {
      totalPlayTime,
      todayPlayTime,
      totalPlayCount,
      recentPlayed: [...games]
        .sort((a, b) => b.lastPlay - a.lastPlay)
        .slice(0, 5)
        .filter((game) => Date.now() - new Date(game.lastPlay).getTime() < 7 * 24 * 60 * 60 * 1000),
      mostPlayed: [...games]
        .sort((a, b) => calculateTotalPlayTime(b.playTimelines) - calculateTotalPlayTime(a.playTimelines))
        .slice(0, 5)
        .filter((game) => calculateTotalPlayTime(game.playTimelines) > 0),
      recentAdded: [...games]
        .sort((a, b) => b.createDate - a.createDate)
        .slice(0, 5)
        .filter((game) => Date.now() - new Date(game.lastPlay).getTime() < 7 * 24 * 60 * 60 * 1000)
    }
  }, [games])

  const timeline = useMemo(() => {
    const events: Array<{
      type: 'play' | 'add'
      game: GameWithLocalData
      time: number
      minutes?: number
    }> = []

    games.map((game) =>
      game.playTimelines.map(([_, end, minutes]) =>
        events.push({
          type: 'play',
          game,
          time: end * 1000,
          minutes
        })
      )
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
    <div className="overflow-auto  p-4">
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
            <Text variant="xLarge" className="block mb-4">{t`page.home.running`}</Text>
            {runningGames.length > 0 ? (
              <Stack tokens={{ childrenGap: 8 }}>
                {runningGames.map((game) => (
                  <Link
                    to={`/details/${game.id}`}
                    key={game.id}
                    className="no-underline flex items-center p-2 rounded hover:bg-gray-50"
                  >
                    <img src={game.cover} alt={game.title} className="w-10 h-10 object-cover rounded mr-3" />
                    <Text>{game.title}</Text>
                  </Link>
                ))}
              </Stack>
            ) : (
              <Text className="text-gray-500">{t`page.home.running.empty`}</Text>
            )}
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
                  <img src={game.cover} alt={game.title} className="w-10 h-10 object-cover rounded mr-3" />
                  <div>
                    <Text block>{game.title}</Text>
                    <Text className="text-sm text-gray-500">{new Date(game.lastPlay).toLocaleDateString()}</Text>
                  </div>
                </Link>
              ))}
            </Stack>
          </Card>

          <Card className="flex-1 p-4">
            <Text variant="xLarge" className="block mb-4">{t`page.home.activity.mostPlayed`}</Text>
            <Stack tokens={{ childrenGap: 8 }}>
              {stats.mostPlayed.map((game) => (
                <Link
                  to={`/details/${game.id}`}
                  key={game.id}
                  className="no-underline flex items-center p-2 rounded hover:bg-gray-50"
                >
                  <img src={game.cover} alt={game.title} className="w-10 h-10 object-cover rounded mr-3" />
                  <div>
                    <Text block>{game.title}</Text>
                    <Text className="text-sm text-gray-500">
                      {showMinutes(calculateTotalPlayTime(game.playTimelines))}
                    </Text>
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
                  <img src={game.cover} alt={game.title} className="w-10 h-10 object-cover rounded mr-3" />
                  <div>
                    <Text block>{game.title}</Text>
                    <Text className="text-sm text-gray-500">{new Date(game.createDate).toLocaleDateString()}</Text>
                  </div>
                </Link>
              ))}
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
                      src={event.game.cover}
                      alt={event.game.title}
                      className="w-10 h-10 object-cover rounded mr-3"
                    />
                    <div className="flex-grow">
                      <Text block className="font-medium">
                        {event.game.title}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {`${new Date(event.time).toLocaleString()} • `}
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
