import unittest
import os
import requests
import json
from dotenv import load_dotenv

class NotionIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        load_dotenv()
        cls.base_url = "http://localhost:8001"
        cls.headers = {
            "Authorization": f"Bearer {os.getenv('NOTION_API_KEY')}",
            "Content-Type": "application/json",
            "Notion-Version": os.getenv('NOTION_API_VERSION', '2022-06-28')
        }

    def test_01_auth_status(self):
        """Test authentication status with Notion API"""
        response = requests.get(f"{self.base_url}/users/me", headers=self.headers)
        self.assertEqual(response.status_code, 200, "Authentication failed")

    def test_02_database_access(self):
        """Test database access"""
        db_id = os.getenv('NOTION_COMPETITION_DB')
        if not db_id:
            self.skipTest("No database ID configured")
        
        response = requests.post(
            f"{self.base_url}/databases/{db_id}/query",
            headers=self.headers,
            json={"page_size": 1}
        )
        self.assertEqual(response.status_code, 200, "Database access failed")

    def test_03_create_page(self):
        """Test page creation"""
        db_id = os.getenv('NOTION_COMPETITION_DB')
        if not db_id:
            self.skipTest("No database ID configured")
            
        test_data = {
            "parent": {"database_id": db_id},
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
        self.assertEqual(response.status_code, 200, "Page creation failed")

    def test_04_proxy_health(self):
        """Test proxy server health"""
        response = requests.get(f"{self.base_url}/health")
        self.assertEqual(response.status_code, 200, "Proxy server health check failed")

def run_tests():
    # Create a test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(NotionIntegrationTests)
    
    # Run the tests and capture results
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\nTest Summary:")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Skipped: {len(result.skipped)}")
    
    return result.wasSuccessful()

if __name__ == '__main__':
    run_tests() 