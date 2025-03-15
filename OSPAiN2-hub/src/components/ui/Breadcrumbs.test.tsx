import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Breadcrumbs from './Breadcrumbs';
import { BreadcrumbItem } from './Breadcrumbs';

describe('Breadcrumbs Component', () => {
  const defaultItems: BreadcrumbItem[] = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'products', label: 'Products', href: '/products' },
    { id: 'category', label: 'Category', href: '/products/category' },
    { id: 'item', label: 'Item Name', isCurrent: true }
  ];

  it('renders nothing when there are no items', () => {
    render(<Breadcrumbs items={[]} />);
    const breadcrumbNav = screen.queryByRole('navigation', { name: 'Breadcrumb' });
    expect(breadcrumbNav).not.toBeInTheDocument();
  });

  it('renders all items correctly', () => {
    render(<Breadcrumbs items={defaultItems} />);
    const breadcrumbNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(breadcrumbNav).toBeInTheDocument();

    // Check for all items
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Item Name')).toBeInTheDocument();
  });

  it('renders separators between items', () => {
    render(<Breadcrumbs items={defaultItems} />);
    const separators = screen.getAllByText('/');
    // There should be 3 separators for 4 items
    expect(separators).toHaveLength(3);
  });

  it('allows custom separators', () => {
    render(<Breadcrumbs items={defaultItems} separator=">" />);
    const separators = screen.getAllByText('>');
    expect(separators).toHaveLength(3);
  });

  it('renders the current page without a link', () => {
    render(<Breadcrumbs items={defaultItems} />);
    
    // Previous items should be links
    const homeLink = screen.getByText('Home').closest('a');
    const productsLink = screen.getByText('Products').closest('a');
    const categoryLink = screen.getByText('Category').closest('a');
    
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
    expect(productsLink).toBeInTheDocument();
    expect(productsLink).toHaveAttribute('href', '/products');
    expect(categoryLink).toBeInTheDocument();
    expect(categoryLink).toHaveAttribute('href', '/products/category');
    
    // Current item should not be a link
    const currentItem = screen.getByText('Item Name');
    expect(currentItem.closest('a')).toBeNull();
    expect(currentItem.closest('span')).toHaveAttribute('aria-current', 'page');
  });

  it('collapses items when there are many and collapsible is true', () => {
    const manyItems: BreadcrumbItem[] = [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'level1', label: 'Level 1', href: '/level1' },
      { id: 'level2', label: 'Level 2', href: '/level1/level2' },
      { id: 'level3', label: 'Level 3', href: '/level1/level2/level3' },
      { id: 'level4', label: 'Level 4', href: '/level1/level2/level3/level4' },
      { id: 'level5', label: 'Level 5', isCurrent: true }
    ];

    render(<Breadcrumbs items={manyItems} collapsible={true} collapseAfter={3} />);
    
    // First item should be present
    expect(screen.getByText('Home')).toBeInTheDocument();
    
    // Middle items should be collapsed
    expect(screen.getByText('...')).toBeInTheDocument();
    
    // Confirm inner items are not displayed
    expect(screen.queryByText('Level 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Level 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Level 3')).not.toBeInTheDocument();
    
    // Last two items should be visible
    expect(screen.getByText('Level 4')).toBeInTheDocument();
    expect(screen.getByText('Level 5')).toBeInTheDocument();
  });

  it('renders icons when provided', () => {
    const itemsWithIcons: BreadcrumbItem[] = [
      { 
        id: 'home', 
        label: 'Home', 
        href: '/', 
        icon: <span data-testid="home-icon">🏠</span> 
      },
      { 
        id: 'products', 
        label: 'Products', 
        href: '/products',
        icon: <span data-testid="products-icon">📦</span>
      },
    ];

    render(<Breadcrumbs items={itemsWithIcons} />);
    
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('products-icon')).toBeInTheDocument();
  });

  it('applies custom classNames correctly', () => {
    render(
      <Breadcrumbs 
        items={defaultItems} 
        className="custom-container"
        itemClassName="custom-item"
        separatorClassName="custom-separator"
        testId="custom-breadcrumbs"
      />
    );
    
    const container = screen.getByTestId('custom-breadcrumbs');
    expect(container).toHaveClass('custom-container');
    
    const items = container.querySelectorAll('li');
    expect(items[0]).toHaveClass('custom-item');
    
    const separator = container.querySelector('span[aria-hidden="true"]');
    expect(separator).toHaveClass('custom-separator');
  });
}); 