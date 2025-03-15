/**
 * API utility functions
 *
 * This module provides functions to interact with the backend API.
 * It uses the REACT_APP_API_PORT environment variable to determine the port,
 * and falls back to 3002 if not provided.
 */

// Get the API server port from environment variables or use the default
const API_PORT = process.env.REACT_APP_API_PORT || 3002;
const API_BASE_URL = `http://localhost:${API_PORT}/api`;

/**
 * Fetch data from the API
 * @param {string} endpoint - The API endpoint to fetch from
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Promise resolving to the JSON response
 */
export const fetchFromApi = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`;
    console.log(`Fetching from: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};

/**
 * Get health status of the API
 * @returns {Promise<Object>} - API health status
 */
export const getHealthStatus = () => fetchFromApi('health');

/**
 * Get todo items
 * @returns {Promise<Array>} - List of todo items
 */
export const getTodos = () => fetchFromApi('todo');

/**
 * Get visualization data
 * @returns {Promise<Object>} - Visualization data
 */
export const getVisualizationData = () => fetchFromApi('visualization/patterns');

export default {
  fetchFromApi,
  getHealthStatus,
  getTodos,
  getVisualizationData,
};
