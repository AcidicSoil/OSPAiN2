#!/usr/bin/env python3

import requests
import json
import os
import sys
import argparse
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("notion_content.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("notion_content_manager")

class NotionContentManager:
    def __init__(self, token, config_file="notion_databases.json"):
        self.token = token
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        
        # Load database IDs from config file
        try:
            with open(config_file, "r") as f:
                self.databases = json.load(f)
                logger.info(f"Loaded database configuration from {config_file}")
        except FileNotFoundError:
            logger.error(f"Database configuration file {config_file} not found.")
            logger.error("Run create_notion_database.py first to set up the databases.")
            self.databases = {}
    
    def add_competitor(self, name, competitor_type, market_share, strengths, weaknesses, 
                       key_features, website, year_founded):
        """Add a new competitor to the competition analysis database"""
        if "competition" not in self.databases:
            logger.error("Competition database not found in configuration.")
            return False
        
        database_id = self.databases["competition"]
        url = f"{self.base_url}/pages"
        
        # Format key features as a list for multi_select
        if isinstance(key_features, str):
            key_features = [feature.strip() for feature in key_features.split(',')]
        
        data = {
            "parent": {"database_id": database_id},
            "properties": {
                "Name": {"title": [{"text": {"content": name}}]},
                "Type": {"select": {"name": competitor_type}},
                "Market Share": {"number": float(market_share)},
                "Strengths": {"rich_text": [{"text": {"content": strengths}}]},
                "Weaknesses": {"rich_text": [{"text": {"content": weaknesses}}]},
                "Key Features": {"multi_select": [{"name": feature} for feature in key_features]},
                "Website": {"url": website},
                "Year Founded": {"number": int(year_founded)},
                "Last Updated": {"date": {"start": datetime.now().strftime("%Y-%m-%d")}}
            }
        }
        
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code != 200:
            logger.error(f"Failed to add competitor: {response.status_code} - {response.text}")
            return False
        
        logger.info(f"Added competitor: {name}")
        return True
    
    def add_feature(self, name, category, priority, our_solution, notes, competitors=None):
        """Add a new feature to the feature comparison database"""
        if "feature_comparison" not in self.databases:
            logger.error("Feature comparison database not found in configuration.")
            return False
        
        database_id = self.databases["feature_comparison"]
        url = f"{self.base_url}/pages"
        
        # Set up properties
        properties = {
            "Feature": {"title": [{"text": {"content": name}}]},
            "Category": {"select": {"name": category}},
            "Priority": {"select": {"name": priority}},
            "Our Solution": {"select": {"name": our_solution}},
            "Notes": {"rich_text": [{"text": {"content": notes}}]}
        }
        
        # Add competitor checkboxes if provided
        if competitors and isinstance(competitors, dict):
            for competitor, has_feature in competitors.items():
                if competitor in ["Competitor A", "Competitor B", "Competitor C", "Competitor D"]:
                    properties[competitor] = {"checkbox": has_feature}
        
        data = {
            "parent": {"database_id": database_id},
            "properties": properties
        }
        
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code != 200:
            logger.error(f"Failed to add feature: {response.status_code} - {response.text}")
            return False
        
        logger.info(f"Added feature: {name}")
        return True
    
    def add_code_component(self, name, component_type, status, complexity, implementation_notes, dependencies=None):
        """Add a new code component to the code architecture database"""
        if "code_architecture" not in self.databases:
            logger.error("Code architecture database not found in configuration.")
            return False
        
        database_id = self.databases["code_architecture"]
        url = f"{self.base_url}/pages"
        
        data = {
            "parent": {"database_id": database_id},
            "properties": {
                "Component": {"title": [{"text": {"content": name}}]},
                "Type": {"select": {"name": component_type}},
                "Status": {"status": {"name": status}},
                "Complexity": {"select": {"name": complexity}},
                "Implementation Notes": {"rich_text": [{"text": {"content": implementation_notes}}]}
            }
        }
        
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code != 200:
            logger.error(f"Failed to add code component: {response.status_code} - {response.text}")
            return False
        
        logger.info(f"Added code component: {name}")
        return True
    
    def add_market_analysis(self, topic, category, impact, time_horizon, key_findings, source_links=None):
        """Add a new market analysis to the market analysis database"""
        if "market_analysis" not in self.databases:
            logger.error("Market analysis database not found in configuration.")
            return False
        
        database_id = self.databases["market_analysis"]
        url = f"{self.base_url}/pages"
        
        data = {
            "parent": {"database_id": database_id},
            "properties": {
                "Analysis Topic": {"title": [{"text": {"content": topic}}]},
                "Category": {"select": {"name": category}},
                "Impact": {"select": {"name": impact}},
                "Time Horizon": {"select": {"name": time_horizon}},
                "Key Findings": {"rich_text": [{"text": {"content": key_findings}}]},
                "Analysis Date": {"date": {"start": datetime.now().strftime("%Y-%m-%d")}}
            }
        }
        
        if source_links:
            data["properties"]["Source Links"] = {"url": source_links}
        
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code != 200:
            logger.error(f"Failed to add market analysis: {response.status_code} - {response.text}")
            return False
        
        logger.info(f"Added market analysis: {topic}")
        return True
    
    def query_database(self, database_type, filters=None, sorts=None, page_size=10):
        """Query a Notion database with optional filters and sorts"""
        if database_type not in self.databases:
            logger.error(f"Database {database_type} not found in configuration.")
            return None
        
        database_id = self.databases[database_type]
        url = f"{self.base_url}/databases/{database_id}/query"
        
        data = {"page_size": page_size}
        
        if filters:
            data["filter"] = filters
        
        if sorts:
            data["sorts"] = sorts
        
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code != 200:
            logger.error(f"Failed to query database: {response.status_code} - {response.text}")
            return None
        
        results = response.json()
        logger.info(f"Query returned {len(results.get('results', []))} results")
        return results
    
    def list_entries(self, database_type):
        """List all entries in a database with basic information"""
        results = self.query_database(database_type)
        
        if not results:
            return
        
        print(f"\n=== {database_type.upper()} DATABASE ENTRIES ===")
        
        for item in results.get("results", []):
            properties = item.get("properties", {})
            
            # Different properties based on database type
            if database_type == "competition":
                title_prop = properties.get("Name", {}).get("title", [{}])[0].get("text", {}).get("content", "No Name")
                type_prop = properties.get("Type", {}).get("select", {}).get("name", "N/A")
                print(f"- {title_prop} ({type_prop})")
            
            elif database_type == "feature_comparison":
                title_prop = properties.get("Feature", {}).get("title", [{}])[0].get("text", {}).get("content", "No Name")
                status_prop = properties.get("Our Solution", {}).get("select", {}).get("name", "N/A")
                print(f"- {title_prop} ({status_prop})")
            
            elif database_type == "code_architecture":
                title_prop = properties.get("Component", {}).get("title", [{}])[0].get("text", {}).get("content", "No Name")
                status_prop = properties.get("Status", {}).get("status", {}).get("name", "N/A")
                print(f"- {title_prop} ({status_prop})")
            
            elif database_type == "market_analysis":
                title_prop = properties.get("Analysis Topic", {}).get("title", [{}])[0].get("text", {}).get("content", "No Topic")
                impact_prop = properties.get("Impact", {}).get("select", {}).get("name", "N/A")
                print(f"- {title_prop} (Impact: {impact_prop})")
            
            else:
                print(f"- {item.get('id')}")

def main():
    parser = argparse.ArgumentParser(description="Manage content in Notion databases for OSPAiN2 project analysis")
    parser.add_argument("--token", help="Notion API token")
    parser.add_argument("--config", default="notion_databases.json", help="Database configuration file")
    
    # Add subparsers for different commands
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Competitor command
    competitor_parser = subparsers.add_parser("competitor", help="Add a new competitor")
    competitor_parser.add_argument("--name", required=True, help="Competitor name")
    competitor_parser.add_argument("--type", required=True, choices=["Direct Competitor", "Indirect Competitor", "Market Leader", "Emerging Player"], help="Competitor type")
    competitor_parser.add_argument("--market-share", required=True, type=float, help="Market share (decimal)")
    competitor_parser.add_argument("--strengths", required=True, help="Competitor strengths")
    competitor_parser.add_argument("--weaknesses", required=True, help="Competitor weaknesses")
    competitor_parser.add_argument("--features", required=True, help="Key features (comma separated)")
    competitor_parser.add_argument("--website", required=True, help="Website URL")
    competitor_parser.add_argument("--year-founded", required=True, type=int, help="Year founded")
    
    # Feature command
    feature_parser = subparsers.add_parser("feature", help="Add a new feature comparison")
    feature_parser.add_argument("--name", required=True, help="Feature name")
    feature_parser.add_argument("--category", required=True, choices=["UI/UX", "Backend", "API", "Infrastructure", "Integration", "Security"], help="Feature category")
    feature_parser.add_argument("--priority", required=True, choices=["High", "Medium", "Low"], help="Priority level")
    feature_parser.add_argument("--our-solution", required=True, choices=["Implemented", "In Development", "Planned", "Not Planned"], help="Our solution status")
    feature_parser.add_argument("--notes", required=True, help="Feature notes")
    feature_parser.add_argument("--competitor-a", type=bool, default=False, help="Competitor A has this feature")
    feature_parser.add_argument("--competitor-b", type=bool, default=False, help="Competitor B has this feature")
    feature_parser.add_argument("--competitor-c", type=bool, default=False, help="Competitor C has this feature")
    feature_parser.add_argument("--competitor-d", type=bool, default=False, help="Competitor D has this feature")
    
    # Component command
    component_parser = subparsers.add_parser("component", help="Add a new code component")
    component_parser.add_argument("--name", required=True, help="Component name")
    component_parser.add_argument("--type", required=True, choices=["UI Component", "API", "Service", "Utility", "Configuration"], help="Component type")
    component_parser.add_argument("--status", required=True, choices=["Not Started", "In Progress", "Ready for Review", "Completed"], help="Component status")
    component_parser.add_argument("--complexity", required=True, choices=["Low", "Medium", "High"], help="Component complexity")
    component_parser.add_argument("--notes", required=True, help="Implementation notes")
    
    # Analysis command
    analysis_parser = subparsers.add_parser("analysis", help="Add a new market analysis")
    analysis_parser.add_argument("--topic", required=True, help="Analysis topic")
    analysis_parser.add_argument("--category", required=True, choices=["Market Trend", "Technology Analysis", "User Research", "Competitive Intelligence"], help="Analysis category")
    analysis_parser.add_argument("--impact", required=True, choices=["High", "Medium", "Low"], help="Impact level")
    analysis_parser.add_argument("--time-horizon", required=True, choices=["Short-term", "Medium-term", "Long-term"], help="Time horizon")
    analysis_parser.add_argument("--findings", required=True, help="Key findings")
    analysis_parser.add_argument("--source", help="Source URL")
    
    # List command
    list_parser = subparsers.add_parser("list", help="List entries in a database")
    list_parser.add_argument("database", choices=["competition", "feature_comparison", "code_architecture", "market_analysis"], help="Database to list")
    
    args = parser.parse_args()
    
    # Get token from args or environment
    token = args.token or os.environ.get("NOTION_TOKEN")
    
    if not token:
        logger.error("No Notion API token provided. Use --token or set NOTION_TOKEN environment variable.")
        sys.exit(1)
    
    # Create content manager instance
    manager = NotionContentManager(token, args.config)
    
    # Execute command
    if args.command == "competitor":
        success = manager.add_competitor(
            args.name,
            args.type,
            args.market_share,
            args.strengths,
            args.weaknesses,
            args.features,
            args.website,
            args.year_founded
        )
        if not success:
            sys.exit(1)
    
    elif args.command == "feature":
        competitors = {
            "Competitor A": args.competitor_a,
            "Competitor B": args.competitor_b,
            "Competitor C": args.competitor_c,
            "Competitor D": args.competitor_d
        }
        success = manager.add_feature(
            args.name,
            args.category,
            args.priority,
            args.our_solution,
            args.notes,
            competitors
        )
        if not success:
            sys.exit(1)
    
    elif args.command == "component":
        success = manager.add_code_component(
            args.name,
            args.type,
            args.status,
            args.complexity,
            args.notes
        )
        if not success:
            sys.exit(1)
    
    elif args.command == "analysis":
        success = manager.add_market_analysis(
            args.topic,
            args.category,
            args.impact,
            args.time_horizon,
            args.findings,
            args.source
        )
        if not success:
            sys.exit(1)
    
    elif args.command == "list":
        manager.list_entries(args.database)
    
    else:
        logger.error("No command specified")
        parser.print_help()
        sys.exit(1)
    
    logger.info("Command completed successfully")

if __name__ == "__main__":
    main() 