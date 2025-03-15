import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';

// Wrapper component to provide router context
const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Breadcrumbs', () => {
  const sampleItems: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Models', path: '/models' },
    { label: 'Llama', path: '/models/llama' }
  ];

  it('renders all breadcrumb items correctly', () => {
    renderWithRouter(<Breadcrumbs items={sampleItems} />);
    
    // Check if all items are rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Models')).toBeInTheDocument();
    expect(screen.getByText('Llama')).toBeInTheDocument();
    
    // Check if the last item is marked as current page
    const currentItem = screen.getByText('Llama').closest('li');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
  });

  it('renders correct link paths', () => {
    renderWithRouter(<Breadcrumbs items={sampleItems} />);
    
    // Check the link for Home
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
    
    // Check the link for Models
    const modelsLink = screen.getByText('Models').closest('a');
    expect(modelsLink).toHaveAttribute('href', '/models');
    
    // The last item (Llama) should not be a link
    const llamaLink = screen.getByText('Llama').closest('a');
    expect(llamaLink).not.toBeInTheDocument();
  });

  it('applies custom separator correctly', () => {
    renderWithRouter(<Breadcrumbs items={sampleItems} separator=">" />);
    
    const separators = screen.getAllByText('>');
    expect(separators).toHaveLength(2); // Two separators for three items
  });

  it('truncates items when maxItems is specified', () => {
    const manyItems: BreadcrumbItem[] = [
      { label: 'Home', path: '/' },
      { label: 'Category', path: '/category' },
      { label: 'Subcategory', path: '/category/subcategory' },
      { label: 'Models', path: '/category/subcategory/models' },
      { label: 'Llama', path: '/category/subcategory/models/llama' }
    ];
    
    renderWithRouter(<Breadcrumbs items={manyItems} maxItems={3} />);
    
    // Should show first item, ellipsis, and last item
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('Llama')).toBeInTheDocument();
    
    // Middle items should not be visible
    expect(screen.queryByText('Subcategory')).not.toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    renderWithRouter(<Breadcrumbs items={sampleItems} className="custom-class" />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('custom-class');
  });

  it('renders without crashing with empty items', () => {
    renderWithRouter(<Breadcrumbs items={[]} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
}); 