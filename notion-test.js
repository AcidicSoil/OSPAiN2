// Notion Integration Tests
const mockData = {
    models: [
        { model: 'GPT-4o', mmlu: 88.7, speed: 79, cost: 30.00 },
        { model: 'Claude 3.5 Sonnet', mmlu: 88.7, speed: 78, cost: 3.00 },
        { model: 'Llama 3.1 70b', mmlu: 88.6, speed: 2100, cost: 0.05 },
        { model: 'DeepSeek R1', mmlu: 90.8, speed: 58, cost: 0.55 }
    ]
};

class NotionTester {
    constructor() {
        this.apiEndpoint = 'http://localhost:8001';  // Updated to use our proxy
        this.testResults = [];
        this.apiKey = document.getElementById('apiKey').value;
        this.databaseId = document.getElementById('databaseId').value;
    }

    async runTests() {
        console.log('🧪 Starting Notion Integration Tests...\n');

        // Test 1: Mock Data Test
        await this.testMockData();

        // Test 2: API Connection Test
        await this.testAPIConnection();

        // Test 3: Database Query Test
        await this.testDatabaseQuery();

        // Test 4: Create Page Test
        await this.testCreatePage();

        // Display Results
        this.displayResults();
    }

    async testMockData() {
        try {
            console.log('Test 1: Validating Mock Data Structure...');
            const isValid = mockData.models.every(model => 
                'model' in model && 
                'mmlu' in model && 
                'speed' in model && 
                'cost' in model
            );
            this.logResult('Mock Data Validation', isValid);
        } catch (error) {
            this.logResult('Mock Data Validation', false, error.message);
        }
    }

    async testAPIConnection() {
        try {
            console.log('Test 2: Testing Notion API Connection...');
            const response = await fetch(`${this.apiEndpoint}/users/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(`API Error: ${response.status} - ${errorData?.message || response.statusText}`);
            }
            
            this.logResult('API Connection', true);
        } catch (error) {
            console.error('API Connection Error:', error);
            this.logResult('API Connection', false, error.message);
        }
    }

    async testDatabaseQuery() {
        try {
            console.log('Test 3: Testing Database Query...');
            const response = await fetch(`${this.apiEndpoint}/databases/${this.databaseId}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    page_size: 10
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(`Database Error: ${response.status} - ${errorData?.message || response.statusText}`);
            }
            
            this.logResult('Database Query', true);
        } catch (error) {
            console.error('Database Query Error:', error);
            this.logResult('Database Query', false, error.message);
        }
    }

    async testCreatePage() {
        try {
            console.log('Test 4: Testing Page Creation...');
            const response = await fetch(`${this.apiEndpoint}/pages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    parent: { database_id: this.databaseId },
                    properties: {
                        Model: {
                            title: [
                                {
                                    text: {
                                        content: 'Test Model'
                                    }
                                }
                            ]
                        },
                        MMLU: {
                            number: 88.5
                        },
                        Speed: {
                            number: 100
                        },
                        Cost: {
                            number: 1.50
                        }
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(`Page Creation Error: ${response.status} - ${errorData?.message || response.statusText}`);
            }
            
            this.logResult('Page Creation', true);
        } catch (error) {
            console.error('Page Creation Error:', error);
            this.logResult('Page Creation', false, error.message);
        }
    }

    logResult(testName, success, error = null) {
        this.testResults.push({
            name: testName,
            success,
            error
        });
        console.log(`${success ? '✅' : '❌'} ${testName}: ${success ? 'Passed' : 'Failed'}${error ? ` (${error})` : ''}\n`);
    }

    displayResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('------------------------');
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.success).length;
        console.log(`Passed: ${passed}/${total} (${Math.round(passed/total * 100)}%)`);
        
        if (passed < total) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => !r.success)
                .forEach(r => console.log(`- ${r.name}: ${r.error}`));
        }
    }
}

// Update the run tests function to be triggered by button click
document.getElementById('runTests').addEventListener('click', () => {
    const tester = new NotionTester();
    tester.runTests();
}); 