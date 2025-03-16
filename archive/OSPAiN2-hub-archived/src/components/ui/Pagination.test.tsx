import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination Component', () => {
  it('renders correctly with default props', () => {
    render(<Pagination totalPages={10} />);
    
    // Navigation should exist
    expect(screen.getByLabelText('Pagination')).toBeInTheDocument();
    
    // Previous and next buttons should exist
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    
    // First page should be active by default
    const page1Button = screen.getByLabelText('Page 1');
    expect(page1Button).toHaveAttribute('aria-current', 'page');
    
    // Previous button should be disabled since we're on page 1
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    
    // Next button should be enabled
    expect(screen.getByLabelText('Next page')).not.toBeDisabled();
  });

  it('renders the correct number of page buttons based on visiblePages', () => {
    render(<Pagination totalPages={20} visiblePages={3} />);
    
    // Should only show 3 page numbers (plus navigation buttons)
    const pageButtons = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.startsWith('Page ')
    );
    expect(pageButtons).toHaveLength(3);
  });

  it('calls onPageChange when a page button is clicked', () => {
    const handlePageChange = jest.fn();
    render(<Pagination totalPages={10} onPageChange={handlePageChange} />);
    
    // Click page 3
    fireEvent.click(screen.getByLabelText('Page 3'));
    
    // Handler should be called with the clicked page number
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when next/previous buttons are clicked', () => {
    const handlePageChange = jest.fn();
    render(<Pagination totalPages={10} currentPage={5} onPageChange={handlePageChange} />);
    
    // Click next button
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(handlePageChange).toHaveBeenCalledWith(6);
    
    // Click previous button
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it('disables the next button when on the last page', () => {
    render(<Pagination totalPages={10} currentPage={10} />);
    
    // Next button should be disabled
    expect(screen.getByLabelText('Next page')).toBeDisabled();
    
    // Previous button should be enabled
    expect(screen.getByLabelText('Previous page')).not.toBeDisabled();
  });

  it('shows first/last buttons when showFirstLastButtons is true', () => {
    render(<Pagination totalPages={10} currentPage={5} showFirstLastButtons={true} />);
    
    // First and last buttons should be present
    expect(screen.getByLabelText('First page')).toBeInTheDocument();
    expect(screen.getByLabelText('Last page')).toBeInTheDocument();
  });

  it('renders in simple variant correctly', () => {
    render(<Pagination totalPages={10} variant="simple" />);
    
    // Should only render previous/next buttons and page info
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 10/i)).toBeInTheDocument();
    
    // Should not render page number buttons
    const pageButtons = screen.queryAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.startsWith('Page ')
    );
    expect(pageButtons).toHaveLength(0);
  });

  it('handles controlled mode correctly', () => {
    const handlePageChange = jest.fn();
    const { rerender } = render(
      <Pagination totalPages={10} page={3} onPageChange={handlePageChange} />
    );
    
    // Page 3 should be active
    expect(screen.getByLabelText('Page 3')).toHaveAttribute('aria-current', 'page');
    
    // Click page 5
    fireEvent.click(screen.getByLabelText('Page 5'));
    expect(handlePageChange).toHaveBeenCalledWith(5);
    
    // The component won't change in controlled mode until we re-render with new props
    expect(screen.getByLabelText('Page 3')).toHaveAttribute('aria-current', 'page');
    
    // Re-render with new page value
    rerender(<Pagination totalPages={10} page={5} onPageChange={handlePageChange} />);
    
    // Now page 5 should be active
    expect(screen.getByLabelText('Page 5')).toHaveAttribute('aria-current', 'page');
  });

  it('handles uncontrolled mode correctly', () => {
    const handlePageChange = jest.fn();
    render(<Pagination totalPages={10} currentPage={2} onPageChange={handlePageChange} />);
    
    // Page 2 should be active
    expect(screen.getByLabelText('Page 2')).toHaveAttribute('aria-current', 'page');
    
    // Click page 4
    fireEvent.click(screen.getByLabelText('Page 4'));
    expect(handlePageChange).toHaveBeenCalledWith(4);
    
    // In uncontrolled mode, the component should update internally
    expect(screen.getByLabelText('Page 4')).toHaveAttribute('aria-current', 'page');
  });

  it('respects disabled prop', () => {
    render(<Pagination totalPages={10} disabled={true} />);
    
    // All buttons should be disabled
    const allButtons = screen.getAllByRole('button');
    allButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('applies custom labels to navigation buttons', () => {
    render(
      <Pagination 
        totalPages={10} 
        previousLabel="Prev" 
        nextLabel="Next" 
        firstLabel="First" 
        lastLabel="Last" 
        showFirstLastButtons={true}
      />
    );
    
    expect(screen.getByText('Prev')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Last')).toBeInTheDocument();
  });

  it('applies custom class names correctly', () => {
    render(
      <Pagination 
        totalPages={10} 
        className="custom-container" 
        buttonClassName="custom-button"
        activeButtonClassName="custom-active-button"
        testId="custom-pagination"
      />
    );
    
    const container = screen.getByTestId('custom-pagination');
    expect(container).toHaveClass('custom-container');
    
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveClass('custom-button'); // Prev button
    
    const activePage = screen.getByLabelText('Page 1');
    expect(activePage).toHaveClass('custom-active-button');
  });
}); 