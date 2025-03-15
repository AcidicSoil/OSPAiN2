import React from 'react';
import { Dropdown, Button } from '../components/ui';
import { FiChevronDown, FiEdit, FiTrash, FiUser, FiSettings } from 'react-icons/fi';

const DropdownExample: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Dropdown Component Examples</h1>
      
      {/* Basic Dropdown */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Basic Dropdown</h2>
        <Dropdown
          trigger={
            <Button variant="primary">
              Options <FiChevronDown className="ml-2" />
            </Button>
          }
          items={[
            { id: 'edit', label: 'Edit', icon: <FiEdit />, onClick: () => alert('Edit clicked') },
            { id: 'delete', label: 'Delete', icon: <FiTrash />, variant: 'danger', onClick: () => alert('Delete clicked') },
          ]}
        />
      </div>

      {/* Dropdown with Sections and Dividers */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">With Sections and Dividers</h2>
        <Dropdown
          trigger={
            <Button variant="secondary">
              Advanced Menu <FiChevronDown className="ml-2" />
            </Button>
          }
          items={[
            { 
              id: 'section-1', 
              type: 'section', 
              label: 'User Actions',
              items: [
                { id: 'profile', label: 'View Profile', icon: <FiUser />, onClick: () => alert('Profile clicked') },
                { id: 'settings', label: 'Settings', icon: <FiSettings />, onClick: () => alert('Settings clicked') },
              ]
            },
            { id: 'divider-1', type: 'divider' },
            { id: 'logout', label: 'Logout', variant: 'warning', onClick: () => alert('Logout clicked') },
          ]}
          placement="bottom-end"
        />
      </div>

      {/* Dropdown with Custom Content */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">With Custom Content</h2>
        <Dropdown
          trigger={
            <Button variant="outline">
              Custom Content <FiChevronDown className="ml-2" />
            </Button>
          }
          items={[
            { id: 'custom-1', type: 'custom', content: (
              <div className="p-4">
                <h3 className="font-medium mb-2">Custom Content</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  This is a custom content area that can contain any React elements.
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="primary" onClick={() => alert('Custom action')}>
                    Action
                  </Button>
                  <Button size="sm" variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )},
          ]}
          width={300}
        />
      </div>
    </div>
  );
};

export default DropdownExample; 