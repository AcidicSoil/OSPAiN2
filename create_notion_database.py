#!/usr/bin/env python3

import requests
import json
import os
import sys
import argparse
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("notion_setup.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("notion_setup")

class NotionDatabaseSetup:
    def __init__(self, token):
        self.token = token
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        self.created_databases = {}
    
    def create_page(self, parent_id, title, icon_emoji=None):
        """Create a new page in a parent page"""
        url = f"{self.base_url}/pages"
        
        data = {
            "parent": {"page_id": parent_id},
            "properties": {
                "title": {"title": [{"text": {"content": title}}]}
            }
        }
        
        if icon_emoji:
            data["icon"] = {"type": "emoji", "emoji": icon_emoji}
        
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code != 200:
            logger.error(f"Failed to create page: {response.status_code} - {response.text}")
            return None
        
        page_data = response.json()
        logger.info(f"Created page: {title} with ID: {page_data['id']}")
        return page_data['id']
    
    def create_competition_database(self, parent_id):
        """Create a competition analysis database"""
        url = f"{self.base_url}/databases"
        
        data = {
            "parent": {"page_id": parent_id},
            "title": [{"text": {"content": "Competition Analysis"}}],
            "icon": {"type": "emoji", "emoji": "🏆"},
            "properties": {
                "Name": {"title": {}},
                "Type": {
                    "select": {
                        "options": [
                            {"name": "Direct Competitor", "color": "red"},
                            {"name": "Indirect Competitor", "color": "yellow"},
                            {"name": "Market Leader", "color": "green"},
                            {"name": "Emerging Player", "color": "blue"}
                        ]
                    }
                },
                "Market Share": {"number": {"format": "percent"}},
                "Strengths": {"rich_text": {}},
                "Weaknesses": {"rich_text": {}},
                "Key Features": {"multi_select": {
                    "options": [
                        {"name": "LLM Integration", "color": "blue"},
                        {"name": "Knowledge Graph", "color": "green"},
                        {"name": "Local Models", "color": "orange"},
                        {"name": "Content Management", "color": "purple"},
                        {"name": "UI Components", "color": "pink"},
                        {"name": "Testing Framework", "color": "gray"}
                    ]
                }},
                "Website": {"url": {}},
                "Year Founded": {"number": {}},
                "Last Updated": {"date": {}}
            }
        }
        
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code != 200:
            logger.error(f"Failed to create database: {response.status_code} - {response.text}")
            return None
        
        db_data = response.json()
        logger.info(f"Created competition database with ID: {db_data['id']}")
        self.created_databases["competition"] = db_data['id']
        return db_data['id']
    
    def create_feature_comparison_database(self, parent_id):
        """Create a feature comparison database"""
        url = f"{self.base_url}/databases"
        
        data = {
            "parent": {"page_id": parent_id},
            "title": [{"text": {"content": "Feature Comparison"}}],
            "icon": {"type": "emoji", "emoji": "📊"},
            "properties": {
                "Feature": {"title": {}},
                "Our Solution": {"select": {
                    "options": [
                        {"name": "Implemented", "color": "green"},
                        {"name": "In Development", "color": "yellow"},
                        {"name": "Planned", "color": "orange"},
                        {"name": "Not Planned", "color": "red"}
                    ]
                }},
                "Category": {"select": {
                    "options": [
                        {"name": "UI/UX", "color": "blue"},
                        {"name": "Backend", "color": "green"},
                        {"name": "API", "color": "orange"},
                        {"name": "Infrastructure", "color": "purple"},
                        {"name": "Integration", "color": "pink"},
                        {"name": "Security", "color": "gray"}
                    ]
                }},
                "Priority": {"select": {
                    "options": [
                        {"name": "High", "color": "red"},
                        {"name": "Medium", "color": "yellow"},
                        {"name": "Low", "color": "blue"}
                    ]
                }},
                "Competitor A": {"checkbox": {}},
                "Competitor B": {"checkbox": {}},
                "Competitor C": {"checkbox": {}},
                "Competitor D": {"checkbox": {}},
                "Notes": {"rich_text": {}}
            }
        }
        
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code != 200:
            logger.error(f"Failed to create database: {response.status_code} - {response.text}")
            return None
        
        db_data = response.json()
        logger.info(f"Created feature comparison database with ID: {db_data['id']}")
        self.created_databases["feature_comparison"] = db_data['id']
        return db_data['id']
    
    def create_code_architecture_database(self, parent_id):
        """Create a code architecture database"""
        url = f"{self.base_url}/databases"
        
        data = {
            "parent": {"page_id": parent_id},
            "title": [{"text": {"content": "Code Architecture"}}],
            "icon": {"type": "emoji", "emoji": "🔧"},
            "properties": {
                "Component": {"title": {}},
                "Type": {"select": {
                    "options": [
                        {"name": "UI Component", "color": "blue"},
                        {"name": "API", "color": "green"},
                        {"name": "Service", "color": "orange"},
                        {"name": "Utility", "color": "purple"},
                        {"name": "Configuration", "color": "pink"}
                    ]
                }},
                "Status": {"status": {
                    "options": [
                        {"name": "Not Started", "color": "gray"},
                        {"name": "In Progress", "color": "blue"},
                        {"name": "Ready for Review", "color": "yellow"},
                        {"name": "Completed", "color": "green"}
                    ]
                }},
                "Dependencies": {"relation": {}},
                "Complexity": {"select": {
                    "options": [
                        {"name": "Low", "color": "green"},
                        {"name": "Medium", "color": "yellow"},
                        {"name": "High", "color": "red"}
                    ]
                }},
                "Documentation": {"files": {}},
                "Assigned To": {"people": {}},
                "Implementation Notes": {"rich_text": {}}
            }
        }
        
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code != 200:
            logger.error(f"Failed to create database: {response.status_code} - {response.text}")
            return None
        
        db_data = response.json()
        logger.info(f"Created code architecture database with ID: {db_data['id']}")
        self.created_databases["code_architecture"] = db_data['id']
        return db_data['id']
    
    def create_market_analysis_database(self, parent_id):
        """Create a market analysis database"""
        url = f"{self.base_url}/databases"
        
        data = {
            "parent": {"page_id": parent_id},
            "title": [{"text": {"content": "Market Analysis"}}],
            "icon": {"type": "emoji", "emoji": "📈"},
            "properties": {
                "Analysis Topic": {"title": {}},
                "Category": {"select": {
                    "options": [
                        {"name": "Market Trend", "color": "blue"},
                        {"name": "Technology Analysis", "color": "green"},
                        {"name": "User Research", "color": "orange"},
                        {"name": "Competitive Intelligence", "color": "purple"}
                    ]
                }},
                "Impact": {"select": {
                    "options": [
                        {"name": "High", "color": "red"},
                        {"name": "Medium", "color": "yellow"},
                        {"name": "Low", "color": "blue"}
                    ]
                }},
                "Time Horizon": {"select": {
                    "options": [
                        {"name": "Short-term", "color": "blue"},
                        {"name": "Medium-term", "color": "yellow"},
                        {"name": "Long-term", "color": "green"}
                    ]
                }},
                "Key Findings": {"rich_text": {}},
                "Source Links": {"url": {}},
                "Analysis Date": {"date": {}},
                "Supporting Documents": {"files": {}}
            }
        }
        
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code != 200:
            logger.error(f"Failed to create database: {response.status_code} - {response.text}")
            return None
        
        db_data = response.json()
        logger.info(f"Created market analysis database with ID: {db_data['id']}")
        self.created_databases["market_analysis"] = db_data['id']
        return db_data['id']
    
    def setup_workspace(self):
        """Set up the entire workspace structure"""
        # First, create a root page to contain everything
        workspace_id = self.create_page(os.environ.get("NOTION_PAGE_ID", ""), 
                                       "OSPAiN2 Project Analysis", 
                                       "🔬")
        
        if not workspace_id:
            logger.error("Failed to create workspace root page. Check NOTION_PAGE_ID env variable.")
            return False
        
        # Create the competition analysis database
        competition_db_id = self.create_competition_database(workspace_id)
        
        # Create the feature comparison database
        feature_db_id = self.create_feature_comparison_database(workspace_id)
        
        # Create the code architecture database
        architecture_db_id = self.create_code_architecture_database(workspace_id)
        
        # Create the market analysis database
        market_db_id = self.create_market_analysis_database(workspace_id)
        
        # Save the database IDs to a config file
        with open("notion_databases.json", "w") as f:
            json.dump(self.created_databases, f, indent=2)
            
        logger.info(f"Workspace setup complete. Configuration saved to notion_databases.json")
        logger.info(f"Root workspace page ID: {workspace_id}")
        
        # Create sample entries for competition database
        if competition_db_id:
            logger.info("Creating sample competitor entries...")
            self.create_sample_competitors(competition_db_id)
        
        return True
    
    def create_sample_competitors(self, database_id):
        """Create sample competitor entries in the competition database"""
        competitors = [
            {
                "Name": "CompetitorA",
                "Type": "Direct Competitor",
                "Market Share": 0.35,
                "Strengths": "Strong API integration, established user base, excellent documentation",
                "Weaknesses": "High pricing, limited customization, centralized infrastructure",
                "Key Features": ["LLM Integration", "Content Management"],
                "Website": "https://competitora.example.com",
                "Year Founded": 2018
            },
            {
                "Name": "IndustryLeader",
                "Type": "Market Leader",
                "Market Share": 0.65,
                "Strengths": "Brand recognition, extensive feature set, enterprise support",
                "Weaknesses": "Complex architecture, high learning curve, expensive",
                "Key Features": ["LLM Integration", "Content Management", "UI Components", "Testing Framework"],
                "Website": "https://industryleader.example.com",
                "Year Founded": 2015
            },
            {
                "Name": "NewEntrant",
                "Type": "Emerging Player",
                "Market Share": 0.05,
                "Strengths": "Innovative approach, modern tech stack, agile development",
                "Weaknesses": "Limited features, small team, early-stage product",
                "Key Features": ["Local Models", "Knowledge Graph"],
                "Website": "https://newentrant.example.com",
                "Year Founded": 2023
            }
        ]
        
        url = f"{self.base_url}/pages"
        
        for competitor in competitors:
            data = {
                "parent": {"database_id": database_id},
                "properties": {
                    "Name": {"title": [{"text": {"content": competitor["Name"]}}]},
                    "Type": {"select": {"name": competitor["Type"]}},
                    "Market Share": {"number": competitor["Market Share"]},
                    "Strengths": {"rich_text": [{"text": {"content": competitor["Strengths"]}}]},
                    "Weaknesses": {"rich_text": [{"text": {"content": competitor["Weaknesses"]}}]},
                    "Key Features": {"multi_select": [{"name": feature} for feature in competitor["Key Features"]]},
                    "Website": {"url": competitor["Website"]},
                    "Year Founded": {"number": competitor["Year Founded"]},
                    "Last Updated": {"date": {"start": "2025-03-17"}}
                }
            }
            
            response = requests.post(url, headers=self.headers, json=data)
            
            if response.status_code != 200:
                logger.error(f"Failed to create competitor entry: {response.status_code} - {response.text}")
            else:
                logger.info(f"Created sample competitor: {competitor['Name']}")

def main():
    parser = argparse.ArgumentParser(description="Set up Notion database structure for OSPAiN2 project analysis")
    parser.add_argument("--token", help="Notion API token")
    args = parser.parse_args()
    
    # Get token from args or environment
    token = args.token or os.environ.get("NOTION_TOKEN")
    
    if not token:
        logger.error("No Notion API token provided. Use --token or set NOTION_TOKEN environment variable.")
        sys.exit(1)
    
    # Create setup instance and run
    setup = NotionDatabaseSetup(token)
    if setup.setup_workspace():
        logger.info("Setup completed successfully")
        
        # Print the database IDs for the user
        with open("notion_databases.json", "r") as f:
            db_config = json.load(f)
            
        print("\n=== Notion Database Configuration ===")
        print("Add these IDs to your application config:\n")
        for name, db_id in db_config.items():
            print(f"{name.upper()}_DATABASE_ID: {db_id}")
    else:
        logger.error("Setup failed. Check notion_setup.log for details.")
        sys.exit(1)

if __name__ == "__main__":
    main() 