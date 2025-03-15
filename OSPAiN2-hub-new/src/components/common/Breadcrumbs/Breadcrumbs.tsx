import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumbs.css';

export interface BreadcrumbItem {
  label: string;
  path: string;
  active?: boolean;
}

export interface BreadcrumbsProps {
  /**
   * Array of breadcrumb items to display
   */
  items: BreadcrumbItem[];
  
  /**
   * Optional CSS class name for additional styling
   */
  className?: string;
  
  /**
   * Optional separator to use between items (defaults to '/')
   */
  separator?: React.ReactNode;
  
  /**
   * Maximum number of items to show before truncating
   * If not provided, all items will be shown
   */
  maxItems?: number;
  
  /**
   * If true, the breadcrumbs will be responsive on smaller screens
   * Default is true
   */
  responsive?: boolean;
}

/**
 * Breadcrumbs component for displaying navigation path
 * 
 * Follows accessibility best practices with appropriate ARIA attributes
 * Supports responsive design with truncation on smaller screens
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
  separator = '/',
  maxItems,
  responsive = true
}) => {
  const containerClasses = `breadcrumbs ${responsive ? 'breadcrumbs-responsive' : ''} ${className}`;
  
  // Handle truncation if maxItems is specified
  const displayedItems = maxItems && items.length > maxItems
    ? [
        ...items.slice(0, 1),
        { label: '...', path: '' },
        ...items.slice(items.length - (maxItems - 1))
      ]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={containerClasses}>
      <ol className="breadcrumbs-list">
        {displayedItems.map((item, index) => {
          const isLast = index === displayedItems.length - 1;
          
          return (
            <li 
              key={`${item.path}-${index}`} 
              className="breadcrumbs-item"
              {...(isLast ? { 'aria-current': 'page' } : {})}
            >
              {isLast || item.path === '' ? (
                <span className="breadcrumbs-text current">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link to={item.path} className="breadcrumbs-link">
                    {item.label}
                  </Link>
                  <span className="breadcrumbs-separator" aria-hidden="true">
                    {separator}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 