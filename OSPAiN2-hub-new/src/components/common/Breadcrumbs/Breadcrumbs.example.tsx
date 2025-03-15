import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';

const BreadcrumbsExample: React.FC = () => {
  // Example path: Home > Models > Llama
  const basicItems: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Models', path: '/models' },
    { label: 'Llama', path: '/models/llama' }
  ];

  // Example of a longer path: Home > Category > Subcategory > Models > Llama
  const longItems: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Category', path: '/category' },
    { label: 'Subcategory', path: '/category/subcategory' },
    { label: 'Models', path: '/category/subcategory/models' },
    { label: 'Llama', path: '/category/subcategory/models/llama' }
  ];

  // Custom separator example
  const customSeparatorItems: BreadcrumbItem[] = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Settings', path: '/dashboard/settings' },
    { label: 'Profile', path: '/dashboard/settings/profile' }
  ];

  return (
    <BrowserRouter>
      <div className="examples-container" style={{ maxWidth: '800px', margin: '20px auto', fontFamily: 'sans-serif' }}>
        <h1>Breadcrumbs Component Examples</h1>
        
        <section style={{ marginBottom: '2rem' }}>
          <h2>Basic Usage</h2>
          <p>Standard breadcrumbs with default settings:</p>
          <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
            <Breadcrumbs items={basicItems} />
          </div>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {`
const items = [
  { label: 'Home', path: '/' },
  { label: 'Models', path: '/models' },
  { label: 'Llama', path: '/models/llama' }
];

<Breadcrumbs items={items} />
            `}
          </pre>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Truncated Breadcrumbs</h2>
          <p>Long paths can be truncated to show only a subset of items:</p>
          <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
            <Breadcrumbs items={longItems} maxItems={3} />
          </div>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {`
// Long path with 5 items
const longItems = [
  { label: 'Home', path: '/' },
  { label: 'Category', path: '/category' },
  { label: 'Subcategory', path: '/category/subcategory' },
  { label: 'Models', path: '/category/subcategory/models' },
  { label: 'Llama', path: '/category/subcategory/models/llama' }
];

// Only show 3 items (first, ellipsis, and last item)
<Breadcrumbs items={longItems} maxItems={3} />
            `}
          </pre>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Custom Separator</h2>
          <p>Change the separator between breadcrumb items:</p>
          <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
            <Breadcrumbs items={customSeparatorItems} separator=">" />
          </div>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {`
<Breadcrumbs 
  items={items} 
  separator=">"
/>
            `}
          </pre>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>Custom Styling</h2>
          <p>Apply custom styling with className:</p>
          <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
            <Breadcrumbs 
              items={basicItems} 
              className="custom-breadcrumbs" 
              separator="•" 
            />
          </div>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {`
<Breadcrumbs 
  items={items} 
  className="custom-breadcrumbs"
  separator="•"
/>
            `}
          </pre>
          <p>With custom CSS in your stylesheet:</p>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {`
.custom-breadcrumbs {
  background: #f0f9ff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.custom-breadcrumbs .breadcrumbs-link {
  color: #0284c7;
}
            `}
          </pre>
        </section>
      </div>
    </BrowserRouter>
  );
};

export default BreadcrumbsExample; 