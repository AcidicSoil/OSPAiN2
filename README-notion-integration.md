# Notion Integration Setup Guide

This guide will help you set up the Notion integration for the TodoManager component in your application.

## Prerequisites

1. A Notion account
2. Access to create integrations at [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
3. A Notion database to store tasks

## Step 1: Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "Create new integration"
3. Give your integration a name (e.g., "OSPAiN2 TodoManager")
4. Select the workspace where your task database resides
5. Choose appropriate capabilities (read/write content, read user information)
6. Save your integration
7. Copy the "Internal Integration Token" (this is your `NOTION_API_KEY`)

## Step 2: Share Your Database with the Integration

1. Open your Notion database for tasks
2. Click the "..." menu in the top right corner
3. Select "Add connections"
4. Find your integration name and click to add it
5. Confirm the integration has access to the database

## Step 3: Get Your Database ID

1. Open your Notion database in a web browser
2. Look at the URL. It will look something like: `https://www.notion.so/workspace/1234567890abcdef1234567890abcdef`
3. The part after the last slash and before any question mark is your database ID
4. Copy this ID (it's your `NOTION_DATABASE_ID`)

## Step 4: Configure the Notion MCP Server

1. Open the `.env` file in `.cursor/mcp-servers/notion-integration/`
2. Replace `your_notion_api_key_here` with your actual Notion API key
3. Replace `your_notion_database_id_here` with your actual database ID
4. Save the file

## Step 5: Start the Notion MCP Server

Run the following command in your terminal:

```bash
cd .cursor/mcp-servers/notion-integration && node index.js
```

You should see output indicating that the server is running on port 8589.

## Step 6: Test the Integration

1. Navigate to the Tasks page in your application
2. Click the "Setup Notion" or "Sync with Notion" button
3. If properly configured, you should be able to sync tasks between your application and Notion

## Troubleshooting

If you encounter issues with the integration:

1. Check that your API key is correct
2. Verify that your database ID is correct
3. Ensure the database is shared with your integration
4. Check the console for any error messages
5. Restart the MCP server after making changes to the `.env` file

## Database Schema Requirements

Your Notion database should have the following properties for optimal integration:

- Title: Name/title of the task
- Status: Status of the task (checkbox or select)
- Priority: Priority level (select or number)
- Description: Description of the task (text)
- Category: Category of the task (select)
- Tags: Tags for the task (multi-select)
- Due Date: Due date of the task (date)

The integration will attempt to map these fields automatically, but having them in your database will ensure the best experience. 