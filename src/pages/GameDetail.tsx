import { useParams } from 'react-router-dom';
import { DetailsList, IColumn } from '@fluentui/react/lib/DetailsList';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';

export const GameDetail: React.FC = () => {
  const { id } = useParams();
  
  const game = {
    id,
    title: 'リアル妹がいる大泉くんのばあい',
    developer: 'ALcot',
    releaseDate: '2010-05-28',
    playTime: '16h3m',
    rating: 7.1,
    savedLocation: '云端',
  };

  const infoColumns: IColumn[] = [
    { key: 'property', name: '属性', fieldName: 'property', minWidth: 100 },
    { key: 'value', name: '值', fieldName: 'value', minWidth: 200 },
  ];

  const infoItems = [
    { property: '开发商', value: game.developer },
    { property: '发布日期', value: game.releaseDate },
    { property: '游戏时长', value: game.playTime },
    { property: '评分', value: game.rating },
    { property: '存档位置', value: game.savedLocation },
  ];

  return (
    <div className="p-6">
      <div className="flex gap-6">
        <div className="w-72">
          <img
            src="/api/placeholder/300/400"
            alt={game.title}
            className="w-full rounded-lg shadow-lg"
          />
          <div className="mt-4 space-y-2">
            <PrimaryButton text="开始游戏" className="w-full" />
            <DefaultButton text="编辑信息" className="w-full" />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">{game.title}</h1>
          <DetailsList
            items={infoItems}
            columns={infoColumns}
            selectionMode={0}
          />
        </div>
      </div>
    </div>
  );
};