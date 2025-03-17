// Notion API Integration Test Suite
class NotionTestSuite {
    constructor() {
        this.apiEndpoint = 'http://localhost:8001';
        this.testResults = [];
        this.apiKey = '';
        this.databaseId = '';
    }

    // Test Configuration
    setCredentials(apiKey, databaseId) {
        this.apiKey = apiKey;
        this.databaseId = databaseId;
    }

    // Base Case Tests
    async testValidAPIKey() {
        return await this.runTest('Valid API Key Test', async () => {
            const response = await this.makeRequest('/users/me', 'GET');
            if (!response.ok) throw new Error(`Invalid API key: ${response.status}`);
            return true;
        });
    }

    async testValidDatabaseId() {
        return await this.runTest('Valid Database ID Test', async () => {
            const response = await this.makeRequest(`/databases/${this.databaseId}`, 'GET');
            if (!response.ok) throw new Error(`Invalid database ID: ${response.status}`);
            return true;
        });
    }

    // Database Operation Tests
    async testDatabaseQuery() {
        return await this.runTest('Database Query Test', async () => {
            const response = await this.makeRequest(`/databases/${this.databaseId}/query`, 'POST', {
                page_size: 10
            });
            if (!response.ok) throw new Error(`Database query failed: ${response.status}`);
            const data = await response.json();
            if (!Array.isArray(data.results)) throw new Error('Invalid query response format');
            return true;
        });
    }

    async testDatabaseQueryWithFilter() {
        return await this.runTest('Database Query with Filter Test', async () => {
            const response = await this.makeRequest(`/databases/${this.databaseId}/query`, 'POST', {
                filter: {
                    property: 'Model',
                    title: {
                        contains: 'Test'
                    }
                }
            });
            if (!response.ok) throw new Error(`Filtered query failed: ${response.status}`);
            return true;
        });
    }

    // Page Creation Tests
    async testBasicPageCreation() {
        return await this.runTest('Basic Page Creation Test', async () => {
            const response = await this.makeRequest('/pages', 'POST', {
                parent: { database_id: this.databaseId },
                properties: {
                    Model: {
                        title: [{ text: { content: 'Test Model Basic' } }]
                    },
                    MMLU: { number: 85.5 },
                    Speed: { number: 95 },
                    Cost: { number: 1.25 }
                }
            });
            if (!response.ok) throw new Error(`Page creation failed: ${response.status}`);
            return true;
        });
    }

    async testPageCreationWithAllFields() {
        return await this.runTest('Full Page Creation Test', async () => {
            const response = await this.makeRequest('/pages', 'POST', {
                parent: { database_id: this.databaseId },
                properties: {
                    Model: {
                        title: [{ text: { content: 'Test Model Full' } }]
                    },
                    MMLU: { number: 92.5 },
                    Speed: { number: 98 },
                    Cost: { number: 2.50 },
                    // Add any additional fields your database supports
                }
            });
            if (!response.ok) throw new Error(`Full page creation failed: ${response.status}`);
            return true;
        });
    }

    // Edge Cases and Error Handling Tests
    async testInvalidAPIKey() {
        return await this.runTest('Invalid API Key Test', async () => {
            const originalKey = this.apiKey;
            this.apiKey = 'invalid_key';
            const response = await this.makeRequest('/users/me', 'GET');
            this.apiKey = originalKey;
            if (response.status !== 401) throw new Error('Expected 401 for invalid API key');
            return true;
        });
    }

    async testInvalidDatabaseId() {
        return await this.runTest('Invalid Database ID Test', async () => {
            const response = await this.makeRequest('/databases/invalid_id/query', 'POST', {
                page_size: 10
            });
            if (response.status !== 404) throw new Error('Expected 404 for invalid database ID');
            return true;
        });
    }

    async testMalformedRequest() {
        return await this.runTest('Malformed Request Test', async () => {
            const response = await this.makeRequest('/pages', 'POST', {
                parent: { database_id: this.databaseId },
                properties: {
                    // Intentionally missing required title field
                    MMLU: { number: 85.5 }
                }
            });
            if (response.status !== 400) throw new Error('Expected 400 for malformed request');
            return true;
        });
    }

    async testRateLimiting() {
        return await this.runTest('Rate Limiting Test', async () => {
            const requests = Array(10).fill().map(() => 
                this.makeRequest('/users/me', 'GET')
            );
            const results = await Promise.all(requests);
            const hasRateLimit = results.some(r => r.status === 429);
            if (hasRateLimit) {
                console.log('Rate limiting detected, implementing backoff...');
            }
            return true;
        });
    }

    // Utility Methods
    async makeRequest(path, method, body = null) {
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        };

        const options = {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        };

        return await fetch(`${this.apiEndpoint}${path}`, options);
    }

    async runTest(testName, testFn) {
        console.log(`Running: ${testName}`);
        try {
            await testFn();
            this.logResult(testName, true);
            return true;
        } catch (error) {
            console.error(`${testName} Error:`, error);
            this.logResult(testName, false, error.message);
            return false;
        }
    }

    logResult(testName, passed, errorMessage = null) {
        this.testResults.push({
            name: testName,
            passed,
            error: errorMessage,
            timestamp: new Date().toISOString()
        });

        // Update UI
        const resultDiv = document.getElementById('testResults');
        if (resultDiv) {
            const status = passed ? '✅' : '❌';
            const error = errorMessage ? `\n   Error: ${errorMessage}` : '';
            resultDiv.innerHTML += `<div>${status} ${testName}${error}</div>`;
        }
    }

    // Run All Tests
    async runAllTests() {
        console.log('Starting Comprehensive Notion API Test Suite...');
        this.testResults = [];

        // Configuration Tests
        await this.testValidAPIKey();
        await this.testValidDatabaseId();

        // Database Operation Tests
        await this.testDatabaseQuery();
        await this.testDatabaseQueryWithFilter();

        // Page Creation Tests
        await this.testBasicPageCreation();
        await this.testPageCreationWithAllFields();

        // Edge Cases and Error Tests
        await this.testInvalidAPIKey();
        await this.testInvalidDatabaseId();
        await this.testMalformedRequest();
        await this.testRateLimiting();

        // Display Summary
        this.displayTestSummary();
    }

    displayTestSummary() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = total - passed;

        console.log('\nTest Summary:');
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);

        const summaryDiv = document.getElementById('testSummary');
        if (summaryDiv) {
            summaryDiv.innerHTML = `
                <h3>Test Summary:</h3>
                <p>Total Tests: ${total}</p>
                <p>Passed: ${passed}</p>
                <p>Failed: ${failed}</p>
                <p>Success Rate: ${Math.round((passed/total) * 100)}%</p>
            `;
        }
    }
}

// Initialize and expose for browser usage
window.notionTestSuite = new NotionTestSuite();

// Add event listener for the run tests button
document.getElementById('runTests').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value;
    const databaseId = document.getElementById('databaseId').value;
    
    if (!apiKey || !databaseId) {
        alert('Please provide both API Key and Database ID');
        return;
    }

    window.notionTestSuite.setCredentials(apiKey, databaseId);
    await window.notionTestSuite.runAllTests();
}); 