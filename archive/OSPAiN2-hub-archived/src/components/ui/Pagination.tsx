import React, { useState, useEffect } from 'react';

export type PaginationVariant = 'default' | 'simple' | 'compact';
export type PaginationSize = 'sm' | 'md' | 'lg';

export interface PaginationProps {
  /** The total number of pages */
  totalPages: number;
  /** The current active page (1-based) */
  currentPage?: number;
  /** Controlled current page (1-based) */
  page?: number;
  /** Number of visible page buttons (excluding navigation buttons) */
  visiblePages?: number;
  /** Callback fired when page is changed */
  onPageChange?: (page: number) => void;
  /** Whether to display the first/last page navigation buttons */
  showFirstLastButtons?: boolean;
  /** Whether to display the page info text (e.g. "Page 1 of 10") */
  showPageInfo?: boolean;
  /** Visual variant of the pagination */
  variant?: PaginationVariant;
  /** Size of the pagination buttons */
  size?: PaginationSize;
  /** Whether the pagination is disabled */
  disabled?: boolean;
  /** Custom label for "Previous page" button */
  previousLabel?: React.ReactNode;
  /** Custom label for "Next page" button */
  nextLabel?: React.ReactNode;
  /** Custom label for "First page" button */
  firstLabel?: React.ReactNode;
  /** Custom label for "Last page" button */
  lastLabel?: React.ReactNode;
  /** Custom class name for the pagination container */
  className?: string;
  /** Custom class name for the pagination buttons */
  buttonClassName?: string;
  /** Custom class name for the active pagination button */
  activeButtonClassName?: string;
  /** Test ID for component testing */
  testId?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage: externalCurrentPage,
  page: controlledPage,
  visiblePages = 5,
  onPageChange,
  showFirstLastButtons = false,
  showPageInfo = true,
  variant = 'default',
  size = 'md',
  disabled = false,
  previousLabel = '←',
  nextLabel = '→',
  firstLabel = '«',
  lastLabel = '»',
  className = '',
  buttonClassName = '',
  activeButtonClassName = '',
  testId = 'pagination',
}) => {
  // Check if component is controlled or uncontrolled
  const isControlled = controlledPage !== undefined;
  const [internalCurrentPage, setInternalCurrentPage] = useState<number>(
    externalCurrentPage || 1
  );
  
  // Use controlled page if provided, otherwise use internal state
  const currentPage = isControlled ? controlledPage : internalCurrentPage;
  
  // Update internal state if controlled page changes
  useEffect(() => {
    if (isControlled && controlledPage) {
      setInternalCurrentPage(controlledPage);
    }
  }, [isControlled, controlledPage]);
  
  // Update internal state if external current page changes
  useEffect(() => {
    if (!isControlled && externalCurrentPage) {
      setInternalCurrentPage(externalCurrentPage);
    }
  }, [isControlled, externalCurrentPage]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    // Ensure page is within bounds
    const validPage = Math.max(1, Math.min(page, totalPages));
    
    if (!isControlled) {
      setInternalCurrentPage(validPage);
    }
    
    if (onPageChange) {
      onPageChange(validPage);
    }
  };
  
  // Calculate the range of visible page buttons
  const getVisiblePageNumbers = (): number[] => {
    if (totalPages <= visiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate the start and end page numbers
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = startPage + visiblePages - 1;
    
    // Adjust if we're near the end
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - visiblePages + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };
  
  // Get the visible page numbers
  const visiblePageNumbers = getVisiblePageNumbers();
  
  // Size-specific classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs h-7 w-7 min-w-[1.75rem]';
      case 'lg':
        return 'text-base h-10 w-10 min-w-[2.5rem]';
      default: // 'md'
        return 'text-sm h-9 w-9 min-w-[2.25rem]';
    }
  };
  
  // Variant-specific classes for buttons
  const getVariantClasses = (isActive: boolean) => {
    const sizeClass = getSizeClasses();
    
    const baseClasses = `
      inline-flex items-center justify-center rounded-md 
      transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${sizeClass}
      ${buttonClassName}
    `;
    
    if (isActive) {
      return `
        ${baseClasses}
        bg-primary text-white hover:bg-primary-hover
        ${activeButtonClassName}
      `;
    }
    
    switch (variant) {
      case 'simple':
        return `
          ${baseClasses}
          bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700
          text-gray-700 dark:text-gray-300
        `;
      case 'compact':
        return `
          ${baseClasses}
          bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700
          text-gray-700 dark:text-gray-300
          ml-1 first:ml-0
        `;
      default: // 'default'
        return `
          ${baseClasses}
          bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600
          text-gray-700 dark:text-gray-300
          hover:bg-gray-50 dark:hover:bg-gray-700
          ml-2 first:ml-0
        `;
    }
  };
  
  // Determine if a button should be rendered or just an ellipsis
  const shouldShowEllipsis = (pageNumber: number, index: number) => {
    if (index === 0 && pageNumber > 1) {
      return true;
    }
    
    if (index === visiblePageNumbers.length - 1 && pageNumber < totalPages) {
      return true;
    }
    
    return false;
  };
  
  // Render pagination for simple variant (just prev/next)
  const renderSimplePagination = () => (
    <div className="flex items-center space-x-2" data-testid={`${testId}-simple`}>
      <button
        type="button"
        className={getVariantClasses(false)}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        aria-label="Previous page"
        data-testid={`${testId}-prev`}
      >
        {previousLabel}
      </button>
      
      {showPageInfo && (
        <span className="px-2 text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
      )}
      
      <button
        type="button"
        className={getVariantClasses(false)}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        aria-label="Next page"
        data-testid={`${testId}-next`}
      >
        {nextLabel}
      </button>
    </div>
  );
  
  // Render standard pagination with page numbers
  const renderDefaultPagination = () => (
    <div className="flex items-center" data-testid={`${testId}-default`}>
      {/* First page button */}
      {showFirstLastButtons && (
        <button
          type="button"
          className={getVariantClasses(false)}
          onClick={() => handlePageChange(1)}
          disabled={disabled || currentPage === 1}
          aria-label="First page"
          data-testid={`${testId}-first`}
        >
          {firstLabel}
        </button>
      )}
      
      {/* Previous page button */}
      <button
        type="button"
        className={getVariantClasses(false)}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        aria-label="Previous page"
        data-testid={`${testId}-prev`}
      >
        {previousLabel}
      </button>
      
      {/* Page number buttons */}
      {visiblePageNumbers.map((pageNumber, index) => {
        const isActive = pageNumber === currentPage;
        
        // Show ellipsis for first/last visible page if needed
        if (shouldShowEllipsis(pageNumber, index)) {
          return (
            <span
              key={`ellipsis-${index}`}
              className={`inline-flex items-center justify-center ${getSizeClasses()}`}
              aria-hidden="true"
            >
              ...
            </span>
          );
        }
        
        return (
          <button
            key={pageNumber}
            type="button"
            className={getVariantClasses(isActive)}
            onClick={() => handlePageChange(pageNumber)}
            disabled={disabled}
            aria-label={`Page ${pageNumber}`}
            aria-current={isActive ? 'page' : undefined}
            data-testid={`${testId}-page-${pageNumber}`}
          >
            {pageNumber}
          </button>
        );
      })}
      
      {/* Next page button */}
      <button
        type="button"
        className={getVariantClasses(false)}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        aria-label="Next page"
        data-testid={`${testId}-next`}
      >
        {nextLabel}
      </button>
      
      {/* Last page button */}
      {showFirstLastButtons && (
        <button
          type="button"
          className={getVariantClasses(false)}
          onClick={() => handlePageChange(totalPages)}
          disabled={disabled || currentPage === totalPages}
          aria-label="Last page"
          data-testid={`${testId}-last`}
        >
          {lastLabel}
        </button>
      )}
    </div>
  );

  return (
    <nav 
      className={`pagination ${className}`} 
      aria-label="Pagination" 
      data-testid={testId}
    >
      {variant === 'simple' 
        ? renderSimplePagination() 
        : renderDefaultPagination()
      }
    </nav>
  );
};

export default Pagination; 