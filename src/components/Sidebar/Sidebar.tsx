import { Stack } from '@fluentui/react/lib/Stack';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  selectedKey: string;
  onSelect: (key: string) => void;
}

const sidebarItems = [
  { key: '/', icon: 'GameConsole', text: '游戏' },
  { key: '/library', icon: 'Library', text: '游戏库' },
  { key: '/categories', icon: 'BulletedList', text: '分类' },
  { key: '/settings', icon: 'Settings', text: '设置' },
];

export const Sidebar: React.FC<SidebarProps> = ({ selectedKey, onSelect }) => {
  return (
    <Stack className="w-64 h-screen bg-white border-r border-gray-200">
      <div className="p-4">
        <h1 className="text-xl font-semibold">PotatoVN</h1>
      </div>
      {sidebarItems.map((item) => (
        <SidebarItem
          key={item.key}
          icon={item.icon}
          text={item.text}
          selected={selectedKey === item.key}
          onClick={() => onSelect(item.key)}
        />
      ))}
    </Stack>
  );
};