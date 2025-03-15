import React, { ReactNode } from 'react';

export interface BreadcrumbItem {
  /** Unique identifier for the breadcrumb item */
  id: string;
  /** Label to display for the breadcrumb item */
  label: React.ReactNode;
  /** URL or path associated with the breadcrumb item */
  href?: string;
  /** Optional icon to display before the label */
  icon?: React.ReactNode;
  /** Whether the breadcrumb item is the current/active page */
  isCurrent?: boolean;
  /** Additional props to pass to the breadcrumb item */
  itemProps?: React.HTMLAttributes<HTMLElement>;
}

export interface BreadcrumbsProps {
  /** Array of breadcrumb items to display */
  items: BreadcrumbItem[];
  /** Character or element to use as separator between items */
  separator?: React.ReactNode;
  /** Whether to apply maximum width and enable truncation for long breadcrumbs */
  maxWidth?: boolean;
  /** Whether the entire breadcrumb should collapse to only first and last items when there are many items */
  collapsible?: boolean;
  /** The number of items after which the breadcrumb should collapse (if collapsible is true) */
  collapseAfter?: number;
  /** Custom class name for the container */
  className?: string;
  /** Custom class names for individual items */
  itemClassName?: string;
  /** Custom class name for the separator */
  separatorClassName?: string;
  /** Test ID for component testing */
  testId?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = '/',
  maxWidth = false,
  collapsible = false,
  collapseAfter = 3,
  className = '',
  itemClassName = '',
  separatorClassName = '',
  testId = 'breadcrumbs',
}) => {
  // If there are no items, don't render anything
  if (items.length === 0) return null;

  // Handle collapsible breadcrumbs
  const shouldCollapse = collapsible && items.length > collapseAfter;
  
  const displayedItems = shouldCollapse 
    ? [
        // First item
        items[0],
        // Collapse indicator
        { id: 'collapse-indicator', label: '...', isCurrent: false },
        // Last two items (to show context)
        ...items.slice(-2)
      ]
    : items;

  return (
    <nav 
      aria-label="Breadcrumb"
      className={`breadcrumbs ${maxWidth ? 'max-w-full overflow-hidden' : ''} ${className}`}
      data-testid={testId}
    >
      <ol className="flex flex-wrap items-center space-x-2">
        {displayedItems.map((item, index) => {
          const isLast = index === displayedItems.length - 1;
          
          // Base classes for list item
          const itemClasses = `flex items-center ${
            maxWidth && !isLast ? 'truncate' : ''
          } ${itemClassName}`;
          
          // Base classes for link or span
          const linkClasses = `text-sm font-medium ${
            item.isCurrent 
              ? 'text-gray-700 dark:text-gray-300 aria-current="page"' 
              : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light hover:underline'
          }`;
          
          return (
            <li 
              key={item.id} 
              className={itemClasses}
              {...item.itemProps}
            >
              {index > 0 && (
                <span 
                  className={`mx-2 text-gray-400 dark:text-gray-500 ${separatorClassName}`}
                  aria-hidden="true"
                >
                  {separator}
                </span>
              )}
              
              {item.id === 'collapse-indicator' ? (
                <span className="text-gray-400 dark:text-gray-500">{item.label}</span>
              ) : item.href && !item.isCurrent ? (
                <a 
                  href={item.href} 
                  className={`flex items-center ${linkClasses}`}
                >
                  {item.icon && (
                    <span className="mr-1.5">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </a>
              ) : (
                <span 
                  className={`flex items-center ${linkClasses}`}
                  aria-current={item.isCurrent ? 'page' : undefined}
                >
                  {item.icon && (
                    <span className="mr-1.5">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 