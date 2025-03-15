import React from 'react';
import { MemoryRouter } from 'react-router-dom';

/**
 * A simple mock of BrowserRouter that uses MemoryRouter under the hood.
 * This is helpful for testing components that depend on react-router,
 * allowing isolated testing without actual browser history.
 */
const BrowserRouterMock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <MemoryRouter>{children}</MemoryRouter>;
};

export default BrowserRouterMock; 