# OSPAiN2 Notion Integration

A comprehensive system for managing OSPAiN2 project content, competitor analysis, and code documentation in Notion.

## Overview

This integration creates a structured Notion workspace with databases for:

- **Competition Analysis**: Track competitors, their features, and market position
- **Feature Comparison**: Compare your features with competitor offerings
- **Code Architecture**: Document components, dependencies, and implementation status
- **Market Analysis**: Store market research, trends, and strategic insights

## Setup Instructions

### Prerequisites

1. **Notion API Key**:
   - Create an integration at [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Generate a new secret (API key)
   - Share a page with your integration (click "Share" on a page in Notion, and invite your integration)

2. **Python Environment**:
   - Python 3.6+ required
   - Install dependencies: `pip install requests`

3. **Environment Setup**:
   ```bash
   # Set your Notion API token (recommended)
   export NOTION_TOKEN="your_notion_api_key_here"
   
   # Optional: Set a parent page ID if you want to create everything in a specific page
   export NOTION_PAGE_ID="your_notion_page_id_here"
   ```

### Installation

1. Clone this repository or download the files:
   - `notion_proxy.py` - Local proxy server for Notion API requests
   - `create_notion_database.py` - Setup script for database creation
   - `notion_content_manager.py` - CLI for managing database content
   - `notion_tests.html` and `notion_tests.js` - Testing interface

2. Install dependencies:
   ```bash
   pip install requests
   ```

### Setting Up Databases

1. Run the database setup script:
   ```bash
   python create_notion_database.py --token "your_api_key_here"
   ```

2. Note the database IDs output by the script - they'll be saved to `notion_databases.json`

## Usage

### Running the Notion API Proxy

This proxy handles CORS issues and provides detailed logging for troubleshooting:

```bash
python notion_proxy.py
```

The proxy will run on port 8001. Keep this terminal open while using the test interface.

### Using the Test Interface

1. Open another terminal and run a simple HTTP server:
   ```bash
   python -m http.server 8000
   ```

2. Open your browser to http://localhost:8000/notion_tests.html

3. Enter your API Key and Database ID (from `notion_databases.json`) and run the tests

### Managing Content from CLI

The `notion_content_manager.py` script provides a command-line interface for adding and viewing content:

#### Adding a Competitor

```bash
python notion_content_manager.py competitor \
  --name "Competitor Name" \
  --type "Direct Competitor" \
  --market-share 0.25 \
  --strengths "Strong API, good documentation" \
  --weaknesses "Limited customization, high price" \
  --features "LLM Integration,Content Management" \
  --website "https://example.com" \
  --year-founded 2020
```

#### Adding a Feature Comparison

```bash
python notion_content_manager.py feature \
  --name "Authentication API" \
  --category "API" \
  --priority "High" \
  --our-solution "Implemented" \
  --notes "OAuth2 with JWT support" \
  --competitor-a true \
  --competitor-b true \
  --competitor-c false
```

#### Adding a Code Component

```bash
python notion_content_manager.py component \
  --name "AuthService" \
  --type "Service" \
  --status "In Progress" \
  --complexity "Medium" \
  --notes "Service for handling authentication and authorization"
```

#### Adding Market Analysis

```bash
python notion_content_manager.py analysis \
  --topic "AI Agent Framework Trends" \
  --category "Technology Analysis" \
  --impact "High" \
  --time-horizon "Medium-term" \
  --findings "Multi-agent systems showing significant adoption in enterprise environments" \
  --source "https://example.com/report"
```

#### Listing Entries

```bash
python notion_content_manager.py list competition
python notion_content_manager.py list feature_comparison
python notion_content_manager.py list code_architecture
python notion_content_manager.py list market_analysis
```

## Troubleshooting

### Common Errors

1. **401 Unauthorized**:
   - Check your API key is correct
   - Ensure your integration has access to the page/database

2. **404 Not Found**:
   - Verify database IDs are correct
   - Check that the database still exists in Notion

3. **400 Bad Request**:
   - Check your request formatting (especially select options and dates)
   - Make sure required fields are provided

### Debugging

- Check `notion_proxy.log` for detailed request/response logging
- Check `notion_setup.log` for database setup issues
- Check `notion_content.log` for content management issues

## Database Structure

### Competition Analysis

- **Name**: Title property
- **Type**: Select (Direct Competitor, Indirect Competitor, Market Leader, Emerging Player)
- **Market Share**: Number (percentage)
- **Strengths**: Text
- **Weaknesses**: Text
- **Key Features**: Multi-select
- **Website**: URL
- **Year Founded**: Number
- **Last Updated**: Date

### Feature Comparison

- **Feature**: Title property
- **Our Solution**: Select (Implemented, In Development, Planned, Not Planned)
- **Category**: Select (UI/UX, Backend, API, Infrastructure, Integration, Security)
- **Priority**: Select (High, Medium, Low)
- **Competitor X**: Checkbox (for each competitor)
- **Notes**: Text

### Code Architecture

- **Component**: Title property
- **Type**: Select (UI Component, API, Service, Utility, Configuration)
- **Status**: Status (Not Started, In Progress, Ready for Review, Completed)
- **Dependencies**: Relation
- **Complexity**: Select (Low, Medium, High)
- **Documentation**: Files
- **Assigned To**: People
- **Implementation Notes**: Text

### Market Analysis

- **Analysis Topic**: Title property
- **Category**: Select (Market Trend, Technology Analysis, User Research, Competitive Intelligence)
- **Impact**: Select (High, Medium, Low)
- **Time Horizon**: Select (Short-term, Medium-term, Long-term)
- **Key Findings**: Text
- **Source Links**: URL
- **Analysis Date**: Date
- **Supporting Documents**: Files

## Development and Extension

### Adding New Database Types

1. Add a new method to `NotionDatabaseSetup` class in `create_notion_database.py`
2. Add a corresponding method to `NotionContentManager` class in `notion_content_manager.py`
3. Update the CLI parser in `notion_content_manager.py` to add the new command

### Customizing Database Properties

Modify the property definitions in `create_notion_database.py` to add/modify fields for each database type.

## Data Import/Export

For batch import of data, create JSON or CSV files with your data and create a custom import script using the `NotionContentManager` class.

Example:
```python
import json
from notion_content_manager import NotionContentManager

with open('competitors.json', 'r') as f:
    competitors = json.load(f)

manager = NotionContentManager('your_token_here')

for comp in competitors:
    manager.add_competitor(
        comp['name'],
        comp['type'],
        comp['market_share'],
        comp['strengths'],
        comp['weaknesses'],
        comp['features'],
        comp['website'],
        comp['year_founded']
    )
``` 