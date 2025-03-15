/**
 * Notion MCP Server Connection Test
 * 
 * This script tests the connection to the Notion MCP server and verifies
 * that the API key and database ID are correctly configured.
 */

const axios = require('axios');

const MCP_SERVER_URL = 'http://localhost:8589';

async function testConnection() {
  console.log('Testing connection to Notion MCP server...');
  try {
    const response = await axios.get(`${MCP_SERVER_URL}/api/status`);
    console.log('\n===== Connection Test Results =====');
    console.log('Status:', response.status);
    console.log('MCP Server Running:', response.status === 200 ? 'Yes' : 'No');
    
    if (response.data) {
      console.log('API Response:', JSON.stringify(response.data, null, 2));
      
      // Check specific configuration
      console.log('\n===== Configuration Check =====');
      console.log('Notion API Connected:', response.data.connected ? 'Yes' : 'No');
      console.log('Database Configured:', response.data.configured ? 'Yes' : 'No');
      
      if (!response.data.connected) {
        console.log('\n⚠️ API Key Issue: The Notion API key may be invalid or missing.');
        console.log('Check your .env file and make sure NOTION_API_KEY is set correctly.');
      }
      
      if (!response.data.configured) {
        console.log('\n⚠️ Database Issue: The Notion database ID may be invalid or not shared with the integration.');
        console.log('Check your .env file and make sure NOTION_DATABASE_ID is set correctly.');
        console.log('Also ensure your database is shared with the integration.');
      }
    }
  } catch (error) {
    console.error('\n❌ Connection Error:');
    if (error.code === 'ECONNREFUSED') {
      console.error('The Notion MCP server is not running.');
      console.error('Start it with: ./start-notion-integration.sh');
    } else {
      console.error('Error details:', error.message);
    }
  }
}

// Run the test
testConnection(); 