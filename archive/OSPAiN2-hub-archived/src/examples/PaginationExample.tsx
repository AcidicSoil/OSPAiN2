import React, { useState } from 'react';
import { Pagination } from '../components/ui/Pagination';

/**
 * Examples of the Pagination component in various configurations
 */
const PaginationExample: React.FC = () => {
  // State for controlled pagination examples
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSimplePage, setCurrentSimplePage] = useState(1);
  const [currentCompactPage, setCurrentCompactPage] = useState(1);
  const [currentCustomPage, setCurrentCustomPage] = useState(5);
  
  // Total number of pages for examples
  const totalPages = 20;
  
  // Handler for page changes
  const handlePageChange = (page: number, setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(page);
    console.log(`Page changed to ${page}`);
  };

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-800 rounded-lg">
      <div>
        <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Default Pagination</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Standard pagination with default styling and behavior.
        </p>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
          <Pagination
            totalPages={totalPages}
            page={currentPage}
            onPageChange={(page) => handlePageChange(page, setCurrentPage)}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Current page: {currentPage} of {totalPages}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Simple Pagination</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Minimalist version with just previous/next buttons and page counter.
        </p>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
          <Pagination
            totalPages={totalPages}
            page={currentSimplePage}
            onPageChange={(page) => handlePageChange(page, setCurrentSimplePage)}
            variant="simple"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Current page: {currentSimplePage} of {totalPages}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Compact Pagination</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Tighter spacing between page buttons for space-constrained interfaces.
        </p>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
          <Pagination
            totalPages={totalPages}
            page={currentCompactPage}
            onPageChange={(page) => handlePageChange(page, setCurrentCompactPage)}
            variant="compact"
            visiblePages={7}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Current page: {currentCompactPage} of {totalPages}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">With First/Last Buttons</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Pagination with added first and last page navigation buttons.
        </p>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
          <Pagination
            totalPages={totalPages}
            page={currentCustomPage}
            onPageChange={(page) => handlePageChange(page, setCurrentCustomPage)}
            showFirstLastButtons={true}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Current page: {currentCustomPage} of {totalPages}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Custom Styling</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Pagination with custom button styling and text labels.
        </p>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
          <Pagination
            totalPages={totalPages}
            page={currentCustomPage}
            onPageChange={(page) => handlePageChange(page, setCurrentCustomPage)}
            previousLabel="Prev"
            nextLabel="Next"
            firstLabel="First"
            lastLabel="Last"
            showFirstLastButtons={true}
            buttonClassName="font-semibold"
            activeButtonClassName="ring-4"
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Size Variants</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Pagination in different sizes for various UI contexts.
        </p>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Small</h3>
            <Pagination
              totalPages={10}
              size="sm"
              visiblePages={5}
            />
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Medium (Default)</h3>
            <Pagination
              totalPages={10}
              size="md"
              visiblePages={5}
            />
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Large</h3>
            <Pagination
              totalPages={10}
              size="lg"
              visiblePages={5}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Disabled State</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Pagination in a disabled state, useful when content is loading.
        </p>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded">
          <Pagination
            totalPages={10}
            disabled={true}
            visiblePages={5}
          />
        </div>
      </div>
    </div>
  );
};

export default PaginationExample; 