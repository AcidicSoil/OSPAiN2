import unittest
import os
import requests
import json
import time
from dotenv import load_dotenv

class NotionIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        load_dotenv()
        cls.base_url = "http://localhost:8001"
        cls.headers = {
            "Authorization": f"Bearer {os.getenv('NOTION_TOKEN')}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        cls.database_id = os.getenv('NOTION_DATABASE_ID')
        
        # Wait for services to be ready
        cls._wait_for_services()

    @classmethod
    def _wait_for_services(cls, timeout=30):
        """Wait for services to be available"""
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                response = requests.get(f"{cls.base_url}/health")
                if response.status_code == 200:
                    return True
                time.sleep(1)
            except requests.RequestException:
                time.sleep(1)
        raise TimeoutError("Services did not become available within timeout period")

    def test_01_proxy_health(self):
        """Test the health endpoint of the proxy server"""
        response = requests.get(f"{self.base_url}/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    def test_02_auth_status(self):
        """Test authentication status with Notion API"""
        response = requests.get(
            f"{self.base_url}/users/me",
            headers=self.headers
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("bot", response.json())

    def test_03_database_access(self):
        """Test database access"""
        if not self.database_id:
            self.skipTest("No database ID configured")
            
        response = requests.post(
            f"{self.base_url}/databases/{self.database_id}/query",
            headers=self.headers,
            json={"page_size": 1}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("results", response.json())

    def test_04_create_page(self):
        """Test page creation in database"""
        if not self.database_id:
            self.skipTest("No database ID configured")
            
        test_data = {
            "parent": {"database_id": self.database_id},
            "properties": {
                "Name": {
                    "title": [
                        {
                            "text": {
                                "content": "Test Entry"
                            }
                        }
                    ]
                }
            }
        }
        
        response = requests.post(
            f"{self.base_url}/pages",
            headers=self.headers,
            json=test_data
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("id", response.json())

    def test_05_error_handling(self):
        """Test error handling for invalid requests"""
        # Test invalid auth
        response = requests.get(
            f"{self.base_url}/users/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        self.assertEqual(response.status_code, 401)

        # Test invalid database ID
        response = requests.post(
            f"{self.base_url}/databases/invalid_id/query",
            headers=self.headers,
            json={"page_size": 1}
        )
        self.assertEqual(response.status_code, 404)

    def test_06_cors_headers(self):
        """Test CORS headers are properly set"""
        response = requests.options(f"{self.base_url}/users/me")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Access-Control-Allow-Origin", response.headers)
        self.assertIn("Access-Control-Allow-Methods", response.headers)
        self.assertIn("Access-Control-Allow-Headers", response.headers)

def run_tests():
    """Run the test suite"""
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(NotionIntegrationTests)
    
    # Run tests and capture results
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\nTest Summary:")
    print(f"Tests Run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Skipped: {len(result.skipped)}")
    
    return len(result.failures) + len(result.errors) == 0

if __name__ == '__main__':
    run_tests() 