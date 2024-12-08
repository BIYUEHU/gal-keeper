import { useParams } from 'react-router-dom'
import { DetailsList, IColumn } from '@fluentui/react/lib/DetailsList'
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button'
import games from '@/data/games.json'
import { Text } from '@fluentui/react-components'

export const GameDetail: React.FC = () => {
  const { id } = useParams()

  const game = games.find((item) => item.id.toString() === id)

  if (!game) {
    return <div>游戏不存在</div>
  }

  const infoColumns: IColumn[] = [
    { key: 'property', name: '属性', fieldName: 'property', maxWidth: 100, minWidth: 70 },
    { key: 'value', name: '值', fieldName: 'value', minWidth: 200, maxWidth: 500 }
  ]

  const infoItems = [
    { property: '别名', value: game.alias.slice(1).join('、') },
    { property: '开发商', value: game.developers.join('、') },
    { property: '发布日期', value: game.releaseDate },
    { property: '游戏时长', value: game.playMinutes },
    { property: '评分', value: game.rating },
    { property: '存档位置', value: 'e:\\save\\game1' }
  ]

  return (
    <div className="p-6">
      <div className="flex gap-6">
        <div className="w-72">
          <img src={game.cover} alt={game.title} className="w-full rounded-lg shadow-lg" />
          <div className="mt-4 space-y-2">
            <PrimaryButton text="开始游戏" className="w-full" />
            <DefaultButton text="编辑信息" className="w-full" />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">{game.title}</h1>
          <DetailsList items={infoItems} columns={infoColumns} selectionMode={0} />
          <div className="mt-3" />
          <Text>Tags: {game.tags.slice(0, 10).join('、')}</Text>
          <div className="mt-4" />
          <Text>{game.description}</Text>
        </div>
      </div>
    </div>
  )
}
