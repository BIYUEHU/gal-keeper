import { Icon } from '@fluentui/react/lib/Icon';

interface SidebarItemProps {
  icon: string;
  text: string;
  selected?: boolean;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  text,
  selected,
  onClick
}) => {
  return (
    <div
      className={`flex items-center p-3 cursor-pointer ${
        selected ? 'bg-blue-100' : 'hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <Icon iconName={icon} className="mr-2" />
      <span>{text}</span>
    </div>
  );
};