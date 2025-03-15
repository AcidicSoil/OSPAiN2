import React, { useState } from 'react';
import Pagination from './Pagination';

const PaginationExample: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalItems = 100;
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // In a real application, you would fetch data for the new page here
    console.log(`Fetching data for page ${page}`);
  };
  
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="examples-container" style={{ maxWidth: '800px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h1>Pagination Component Examples</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2>Basic Usage</h2>
        <p>Standard pagination with default settings:</p>
        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {`
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
const totalItems = 100;

const handlePageChange = (page: number) => {
  setCurrentPage(page);
  // In a real application, you would fetch data for the new page here
};

<Pagination
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  currentPage={currentPage}
  onPageChange={handlePageChange}
/>
          `}
        </pre>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Custom Number of Page Buttons</h2>
        <p>Limit the number of page buttons shown:</p>
        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            maxPageButtons={3}
          />
        </div>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {`
<Pagination
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  currentPage={currentPage}
  onPageChange={handlePageChange}
  maxPageButtons={3}
/>
          `}
        </pre>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Custom Button Labels</h2>
        <p>Use custom text for navigation buttons:</p>
        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            labels={{
              first: 'First',
              previous: 'Prev',
              next: 'Next',
              last: 'Last'
            }}
          />
        </div>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {`
<Pagination
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  currentPage={currentPage}
  onPageChange={handlePageChange}
  labels={{
    first: 'First',
    previous: 'Prev',
    next: 'Next',
    last: 'Last'
  }}
/>
          `}
        </pre>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Without First/Last Buttons</h2>
        <p>Hide the first and last page buttons:</p>
        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            showFirstLastButtons={false}
          />
        </div>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {`
<Pagination
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  currentPage={currentPage}
  onPageChange={handlePageChange}
  showFirstLastButtons={false}
/>
          `}
        </pre>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Custom Styling</h2>
        <p>Apply custom styling with className:</p>
        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            className="custom-pagination"
          />
        </div>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {`
<Pagination
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  currentPage={currentPage}
  onPageChange={handlePageChange}
  className="custom-pagination"
/>
          `}
        </pre>
        <p>With custom CSS in your stylesheet:</p>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {`
.custom-pagination {
  background: #f0f9ff;
  padding: 0.5rem;
  border-radius: 4px;
}

.custom-pagination .pagination-button {
  background-color: white;
  border-radius: 9999px;
}

.custom-pagination .pagination-button.active {
  background-color: #0284c7;
}
          `}
        </pre>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Interactive Example</h2>
        <p>Try changing the items per page:</p>
        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="itemsPerPage">Items per page: </label>
            <select 
              id="itemsPerPage" 
              value={itemsPerPage} 
              onChange={handleItemsPerPageChange}
              style={{ padding: '0.25rem', marginLeft: '0.5rem' }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
          
          <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
            <p>Current state:</p>
            <ul>
              <li>Page: {currentPage}</li>
              <li>Items per page: {itemsPerPage}</li>
              <li>Total items: {totalItems}</li>
              <li>Total pages: {Math.ceil(totalItems / itemsPerPage)}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaginationExample; 