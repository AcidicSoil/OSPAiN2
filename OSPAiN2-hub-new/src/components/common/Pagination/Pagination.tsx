import React from 'react';
import './Pagination.css';

export interface PaginationProps {
  /**
   * Total number of items
   */
  totalItems: number;
  
  /**
   * Number of items per page
   */
  itemsPerPage: number;
  
  /**
   * Current page number (1-based)
   */
  currentPage: number;
  
  /**
   * Callback function when page changes
   */
  onPageChange: (page: number) => void;
  
  /**
   * Maximum number of page buttons to show
   * Default is 5
   */
  maxPageButtons?: number;
  
  /**
   * Optional CSS class name for additional styling
   */
  className?: string;
  
  /**
   * Show first and last page buttons
   * Default is true
   */
  showFirstLastButtons?: boolean;
  
  /**
   * Custom labels for pagination buttons
   */
  labels?: {
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
  };
  
  /**
   * If true, disable pagination when only one page exists
   * Default is true
   */
  hideOnSinglePage?: boolean;
}

/**
 * Pagination component for navigating through paginated results
 * 
 * Follows accessibility best practices with appropriate ARIA attributes
 * Supports responsive design with dynamic number of visible page buttons
 */
const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  maxPageButtons = 5,
  className = '',
  showFirstLastButtons = true,
  labels = {
    first: '«',
    previous: '‹',
    next: '›',
    last: '»'
  },
  hideOnSinglePage = true
}) => {
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Hide component if only one page and hideOnSinglePage is true
  if (hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  // Ensure current page is within valid range
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  
  // Generate page numbers to display
  const getPageNumbers = (): number[] => {
    const pageNumbers: number[] = [];
    
    // Calculate the range of page buttons to show
    let startPage = Math.max(1, validCurrentPage - Math.floor(maxPageButtons / 2));
    let endPage = startPage + maxPageButtons - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();
  
  // Handler for page change
  const handlePageChange = (page: number) => {
    if (page !== validCurrentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  
  return (
    <nav
      aria-label="Pagination"
      className={`pagination ${className}`}
    >
      <ul className="pagination-list">
        {/* First page button */}
        {showFirstLastButtons && (
          <li className="pagination-item">
            <button
              className="pagination-button first-page"
              onClick={() => handlePageChange(1)}
              disabled={validCurrentPage === 1}
              aria-label="Go to first page"
              aria-disabled={validCurrentPage === 1}
            >
              {labels.first}
            </button>
          </li>
        )}
        
        {/* Previous page button */}
        <li className="pagination-item">
          <button
            className="pagination-button previous-page"
            onClick={() => handlePageChange(validCurrentPage - 1)}
            disabled={validCurrentPage === 1}
            aria-label="Go to previous page"
            aria-disabled={validCurrentPage === 1}
          >
            {labels.previous}
          </button>
        </li>
        
        {/* Page number buttons */}
        {pageNumbers.map(pageNumber => (
          <li
            key={pageNumber}
            className="pagination-item"
          >
            <button
              className={`pagination-button page-number ${pageNumber === validCurrentPage ? 'active' : ''}`}
              onClick={() => handlePageChange(pageNumber)}
              aria-label={`Page ${pageNumber}`}
              aria-current={pageNumber === validCurrentPage ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          </li>
        ))}
        
        {/* Next page button */}
        <li className="pagination-item">
          <button
            className="pagination-button next-page"
            onClick={() => handlePageChange(validCurrentPage + 1)}
            disabled={validCurrentPage === totalPages}
            aria-label="Go to next page"
            aria-disabled={validCurrentPage === totalPages}
          >
            {labels.next}
          </button>
        </li>
        
        {/* Last page button */}
        {showFirstLastButtons && (
          <li className="pagination-item">
            <button
              className="pagination-button last-page"
              onClick={() => handlePageChange(totalPages)}
              disabled={validCurrentPage === totalPages}
              aria-label="Go to last page"
              aria-disabled={validCurrentPage === totalPages}
            >
              {labels.last}
            </button>
          </li>
        )}
      </ul>
      
      <div className="pagination-info" aria-live="polite">
        Page {validCurrentPage} of {totalPages}
      </div>
    </nav>
  );
};

export default Pagination; 