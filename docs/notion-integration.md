# Notion Integration and Testing

## Overview
This document describes the Notion integration testing framework and its integration with the OSPAiN₂ startup ecosystem. The testing framework ensures reliable communication between our services and the Notion API.

## Prerequisites
- Python 3.x
- Required Python packages:
  - requests
  - python-dotenv
- Notion API token
- Notion database ID (optional, for database-specific tests)

## Configuration
1. Create a `.env` file in the project root with the following variables:
   ```
   NOTION_TOKEN=your_notion_api_token
   NOTION_DATABASE_ID=your_database_id  # Optional
   ```

## Test Suite Components
The test suite (`tests/notion_integration_test.py`) includes:
1. Authentication tests
2. Database access tests
3. Page creation tests
4. Error handling tests
5. CORS header verification
6. Proxy server health checks

## Running Tests
### Automated Testing
Tests are automatically run during system startup if:
1. The `.env` file exists
2. Required Python packages are installed
3. Notion services are running properly

### Manual Testing
To run tests manually:
- Windows: `startup\run_notion_tests.bat`
- Unix/Linux: `./startup/run_notion_tests.sh`

## Test Categories
### 1. Proxy Health (test_01_proxy_health)
- Verifies the proxy server is running
- Checks health endpoint response

### 2. Authentication (test_02_auth_status)
- Validates Notion API token
- Verifies bot user access

### 3. Database Access (test_03_database_access)
- Tests database query functionality
- Skipped if no database ID is configured

### 4. Page Creation (test_04_create_page)
- Tests creating new pages in a database
- Verifies page creation response
- Skipped if no database ID is configured

### 5. Error Handling (test_05_error_handling)
- Tests invalid authentication scenarios
- Tests invalid database access
- Verifies appropriate error responses

### 6. CORS Headers (test_06_cors_headers)
- Verifies CORS headers are properly set
- Tests OPTIONS request handling

## Integration with Startup Scripts
The Notion integration tests are integrated into the main startup scripts:
- `start-all.sh` (Unix/Linux)
- `start-all.bat` (Windows)

The scripts:
1. Start Notion services
2. Check for required configuration
3. Run integration tests
4. Report test results

## Troubleshooting
### Common Issues
1. **401 Unauthorized**
   - Check NOTION_TOKEN in .env file
   - Verify token has necessary permissions

2. **404 Not Found**
   - Verify NOTION_DATABASE_ID if using database tests
   - Check database exists and is accessible

3. **Connection Errors**
   - Verify proxy server is running (port 8001)
   - Check network connectivity

### Debug Mode
To enable verbose logging:
1. Set LOG_LEVEL=DEBUG in .env file
2. Rerun tests to see detailed output

## Contributing
When adding new tests:
1. Follow the existing test structure
2. Add clear docstrings
3. Include both positive and negative test cases
4. Update this documentation

## Future Enhancements
- [ ] Add performance testing
- [ ] Implement parallel test execution
- [ ] Add database schema validation
- [ ] Expand error scenario coverage 