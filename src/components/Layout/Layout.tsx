import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Stack } from '@fluentui/react/lib/Stack';
import { Sidebar } from '../Sidebar/Sidebar';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState(location.pathname);

  const handleNavigation = (key: string) => {
    setSelectedKey(key);
    navigate(key);
  };

  return (
    <Stack horizontal className="h-screen">
      <Sidebar selectedKey={selectedKey} onSelect={handleNavigation} />
      <Stack.Item grow className="bg-gray-50 overflow-auto">
        <Outlet />
      </Stack.Item>
    </Stack>
  );
};