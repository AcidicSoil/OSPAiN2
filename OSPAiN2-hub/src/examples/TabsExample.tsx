import React, { useState } from 'react';
import { Tabs, Button } from '../components/ui';
import { FiHome, FiUser, FiSettings, FiBox, FiHelpCircle } from 'react-icons/fi';

const TabsExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const defaultTabs = [
    {
      id: 'home',
      label: 'Home',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Home Content</h3>
          <p className="text-gray-600">This is the home tab content. Add your main content here.</p>
        </div>
      ),
      icon: <FiHome />,
    },
    {
      id: 'profile',
      label: 'Profile',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Profile Content</h3>
          <p className="text-gray-600">This is the profile tab content. User information goes here.</p>
        </div>
      ),
      icon: <FiUser />,
    },
    {
      id: 'settings',
      label: 'Settings',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Settings Content</h3>
          <p className="text-gray-600">This is the settings tab content. Configuration options go here.</p>
        </div>
      ),
      icon: <FiSettings />,
    },
    {
      id: 'disabled',
      label: 'Disabled',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Disabled Content</h3>
          <p className="text-gray-600">This content should not be accessible.</p>
        </div>
      ),
      disabled: true,
      icon: <FiBox />,
    },
  ];

  const badgeTabs = [
    {
      id: 'tab1',
      label: 'Messages',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Messages</h3>
          <p className="text-gray-600">You have 3 unread messages.</p>
        </div>
      ),
      badge: (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500 text-white">
          3
        </span>
      ),
    },
    {
      id: 'tab2',
      label: 'Notifications',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>
          <p className="text-gray-600">You have 5 new notifications.</p>
        </div>
      ),
      badge: (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500 text-white">
          5
        </span>
      ),
    },
    {
      id: 'tab3',
      label: 'Tasks',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Tasks</h3>
          <p className="text-gray-600">You have 2 pending tasks.</p>
        </div>
      ),
      badge: (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500 text-white">
          2
        </span>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-12">
      <h1 className="text-2xl font-bold mb-6">Tabs Component Examples</h1>
      
      {/* Default Tabs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Default Tabs</h2>
        <Tabs 
          items={defaultTabs} 
          variant="default"
          contentClassName="bg-gray-50 rounded-b-lg"
        />
      </div>
      
      {/* Underlined Tabs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Underlined Tabs</h2>
        <Tabs 
          items={defaultTabs} 
          variant="underlined"
          contentClassName="bg-gray-50 rounded-lg"
        />
      </div>
      
      {/* Bordered Tabs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Bordered Tabs</h2>
        <Tabs 
          items={defaultTabs} 
          variant="bordered"
          contentClassName="bg-gray-50 rounded-b-lg"
        />
      </div>
      
      {/* Pills Tabs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pills Tabs</h2>
        <Tabs 
          items={defaultTabs} 
          variant="pills"
          contentClassName="bg-gray-50 rounded-lg mt-2"
          tabsClassName="border-none gap-2"
        />
      </div>
      
      {/* Vertical Tabs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Vertical Tabs</h2>
        <div className="flex">
          <Tabs 
            items={defaultTabs} 
            orientation="vertical"
            variant="pills"
            contentClassName="bg-gray-50 rounded-lg p-4 flex-1 ml-4"
            tabsClassName="border-none flex-shrink-0 w-48"
          />
        </div>
      </div>
      
      {/* Controlled Tabs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Controlled Tabs with Badges</h2>
        <Tabs 
          items={badgeTabs} 
          variant="bordered"
          activeTab={activeTab}
          onChange={handleTabChange}
          contentClassName="bg-gray-50 rounded-b-lg"
        />
        <div className="mt-4 flex space-x-2">
          <Button 
            onClick={() => handleTabChange('tab1')} 
            variant={activeTab === 'tab1' ? 'primary' : 'secondary'}
            size="sm"
          >
            Show Messages
          </Button>
          <Button 
            onClick={() => handleTabChange('tab2')} 
            variant={activeTab === 'tab2' ? 'primary' : 'secondary'}
            size="sm"
          >
            Show Notifications
          </Button>
          <Button 
            onClick={() => handleTabChange('tab3')} 
            variant={activeTab === 'tab3' ? 'primary' : 'secondary'}
            size="sm"
          >
            Show Tasks
          </Button>
        </div>
      </div>
      
      {/* Centered Tabs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Centered Tabs</h2>
        <Tabs 
          items={defaultTabs.slice(0, 3)} 
          variant="bordered"
          alignment="center"
          contentClassName="bg-gray-50 rounded-b-lg"
        />
      </div>
      
      {/* Stretched Tabs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Stretched Tabs</h2>
        <Tabs 
          items={defaultTabs.slice(0, 3)} 
          variant="underlined"
          alignment="stretch"
          contentClassName="bg-gray-50 rounded-b-lg"
        />
      </div>
      
      {/* Implementation Notes */}
      <div className="mt-8 p-4 border rounded-md bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Implementation Notes</h2>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Basic Usage:</strong> The Tabs component requires an array of tab items with id, label, and content.
          </p>
          <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">
            {`
const items = [
  {
    id: 'home',
    label: 'Home',
    content: <div>Home content here</div>,
    icon: <HomeIcon /> // Optional
  },
  // More tabs...
];

// Basic usage
<Tabs items={items} />

// With variant
<Tabs items={items} variant="pills" />

// Vertical orientation
<Tabs items={items} orientation="vertical" />

// Controlled component
<Tabs items={items} activeTab={activeTab} onChange={handleTabChange} />
            `}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TabsExample; 