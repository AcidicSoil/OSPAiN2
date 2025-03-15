import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination', () => {
  const defaultProps = {
    totalItems: 100,
    itemsPerPage: 10,
    currentPage: 1,
    onPageChange: vi.fn(),
  };

  it('renders pagination with correct page numbers', () => {
    render(<Pagination {...defaultProps} />);
    
    // Should show page numbers 1-5 by default (maxPageButtons=5)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Should have navigation buttons
    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to first page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to last page')).toBeInTheDocument();
    
    // Should show page info
    expect(screen.getByText('Page 1 of 10')).toBeInTheDocument();
  });

  it('disables previous and first page buttons on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    
    const firstPageButton = screen.getByLabelText('Go to first page');
    const prevPageButton = screen.getByLabelText('Go to previous page');
    
    expect(firstPageButton).toBeDisabled();
    expect(prevPageButton).toBeDisabled();
    
    // Next and last should be enabled
    expect(screen.getByLabelText('Go to next page')).not.toBeDisabled();
    expect(screen.getByLabelText('Go to last page')).not.toBeDisabled();
  });

  it('disables next and last page buttons on last page', () => {
    render(<Pagination {...defaultProps} currentPage={10} />);
    
    const nextPageButton = screen.getByLabelText('Go to next page');
    const lastPageButton = screen.getByLabelText('Go to last page');
    
    expect(nextPageButton).toBeDisabled();
    expect(lastPageButton).toBeDisabled();
    
    // Previous and first should be enabled
    expect(screen.getByLabelText('Go to previous page')).not.toBeDisabled();
    expect(screen.getByLabelText('Go to first page')).not.toBeDisabled();
  });

  it('highlights current page correctly', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    const pageThreeButton = screen.getByText('3');
    expect(pageThreeButton).toHaveClass('active');
    
    // Other page buttons should not have active class
    const pageTwoButton = screen.getByText('2');
    expect(pageTwoButton).not.toHaveClass('active');
  });

  it('calls onPageChange when clicking page buttons', () => {
    const onPageChangeMock = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChangeMock} />);
    
    // Click on page 3
    fireEvent.click(screen.getByText('3'));
    expect(onPageChangeMock).toHaveBeenCalledWith(3);
    
    // Click on next page
    onPageChangeMock.mockClear();
    fireEvent.click(screen.getByLabelText('Go to next page'));
    expect(onPageChangeMock).toHaveBeenCalledWith(2);
    
    // Click on previous page (should not call since we're on page 1)
    onPageChangeMock.mockClear();
    fireEvent.click(screen.getByLabelText('Go to previous page'));
    expect(onPageChangeMock).not.toHaveBeenCalled();
  });

  it('adjusts visible page numbers based on current page', () => {
    const { rerender } = render(<Pagination {...defaultProps} currentPage={8} />);
    
    // When on page 8, should show pages 6-10
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    
    // Page 5 should not be visible
    expect(screen.queryByText('5')).not.toBeInTheDocument();
    
    // Change current page to middle
    rerender(<Pagination {...defaultProps} currentPage={5} />);
    
    // Should show pages 3-7
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('respects maxPageButtons setting', () => {
    render(<Pagination {...defaultProps} maxPageButtons={3} />);
    
    // Should show only 3 page buttons
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
  });

  it('hides component when only one page exists and hideOnSinglePage is true', () => {
    const { container } = render(
      <Pagination 
        totalItems={10} 
        itemsPerPage={10} 
        currentPage={1} 
        onPageChange={vi.fn()} 
        hideOnSinglePage={true}
      />
    );
    
    // Component should not be rendered
    expect(container.firstChild).toBeNull();
  });

  it('shows component when only one page exists but hideOnSinglePage is false', () => {
    render(
      <Pagination 
        totalItems={10} 
        itemsPerPage={10} 
        currentPage={1} 
        onPageChange={vi.fn()} 
        hideOnSinglePage={false}
      />
    );
    
    // Component should be rendered
    expect(screen.getByLabelText('Pagination')).toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    render(<Pagination {...defaultProps} className="custom-class" />);
    
    const nav = screen.getByLabelText('Pagination');
    expect(nav).toHaveClass('custom-class');
  });

  it('uses custom button labels when provided', () => {
    const customLabels = {
      first: 'First',
      previous: 'Prev',
      next: 'Next',
      last: 'Last'
    };
    
    render(<Pagination {...defaultProps} labels={customLabels} />);
    
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Prev')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Last')).toBeInTheDocument();
  });

  it('hides first/last buttons when showFirstLastButtons is false', () => {
    render(<Pagination {...defaultProps} showFirstLastButtons={false} />);
    
    expect(screen.queryByLabelText('Go to first page')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Go to last page')).not.toBeInTheDocument();
    
    // Previous and next should still be visible
    expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
  });
}); 