import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from '../components/ui/Breadcrumbs';

/**
 * Examples of the Breadcrumbs component in various configurations
 */
const BreadcrumbsExample: React.FC = () => {
  // Simple breadcrumbs example
  const basicItems: BreadcrumbItem[] = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'products', label: 'Products', href: '/products' },
    { id: 'category', label: 'Electronics', href: '/products/electronics' },
    { id: 'item', label: 'Smartphones', isCurrent: true }
  ];

  // Breadcrumbs with icons
  const itemsWithIcons: BreadcrumbItem[] = [
    { 
      id: 'home', 
      label: 'Home', 
      href: '/', 
      icon: <span className="material-icons text-sm">home</span> 
    },
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      href: '/dashboard',
      icon: <span className="material-icons text-sm">dashboard</span>
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      href: '/dashboard/settings',
      icon: <span className="material-icons text-sm">settings</span>
    },
    { 
      id: 'profile', 
      label: 'User Profile', 
      isCurrent: true,
      icon: <span className="material-icons text-sm">person</span>
    }
  ];

  // Long breadcrumbs that will collapse
  const longItems: BreadcrumbItem[] = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'products', label: 'Products', href: '/products' },
    { id: 'category', label: 'Electronics', href: '/products/electronics' },
    { id: 'sub-category', label: 'Smartphones', href: '/products/electronics/smartphones' },
    { id: 'brand', label: 'Pixel', href: '/products/electronics/smartphones/pixel' },
    { id: 'model', label: 'Pixel 7 Pro', href: '/products/electronics/smartphones/pixel/7-pro' },
    { id: 'variant', label: '256GB', isCurrent: true }
  ];

  // Custom separator example
  const customSeparatorItems: BreadcrumbItem[] = [
    { id: 'docs', label: 'Documentation', href: '/docs' },
    { id: 'components', label: 'Components', href: '/docs/components' },
    { id: 'breadcrumbs', label: 'Breadcrumbs', isCurrent: true }
  ];

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-800 rounded-lg">
      <div>
        <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Basic Breadcrumbs</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">Simple breadcrumbs with default styling and separator.</p>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
          <Breadcrumbs items={basicItems} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Breadcrumbs with Icons</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">Breadcrumbs with icons to enhance visual context.</p>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
          <Breadcrumbs items={itemsWithIcons} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Collapsible Breadcrumbs</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">Long breadcrumbs that collapse to show only key navigation points.</p>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
          <Breadcrumbs 
            items={longItems} 
            collapsible={true} 
            collapseAfter={3} 
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Custom Separator</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">Breadcrumbs with a custom separator character.</p>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
          <Breadcrumbs 
            items={customSeparatorItems} 
            separator=">"
            separatorClassName="font-bold"
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Styled Breadcrumbs</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">Breadcrumbs with custom styling applied.</p>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
          <Breadcrumbs 
            items={basicItems} 
            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
            itemClassName="font-medium"
            separatorClassName="text-primary dark:text-primary-light"
          />
        </div>
      </div>
    </div>
  );
};

export default BreadcrumbsExample; 