from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
import os
import logging
import datetime
import sys
from urllib.parse import urlparse
import requests
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("notion_proxy.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("notion_proxy")

load_dotenv()

class NotionProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
        logger.info(f"OPTIONS request to {self.path}")

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "healthy"}).encode())
            return

        self.handle_request('GET')

    def do_POST(self):
        self.handle_request('POST')

    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Notion-Version')

    def handle_request(self, method):
        try:
            # Read request body for POST requests
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            
            # Log request details
            body_str = body.decode('utf-8') if body else "None"
            logger.info(f"{method} request to {self.path}")
            logger.debug(f"Request headers: {self.headers}")
            logger.debug(f"Request body: {body_str[:200]}...")

            # Check for API key in request
            auth_header = self.headers.get('Authorization', '')
            if not auth_header or not auth_header.startswith('Bearer '):
                logger.warning("Missing or invalid Authorization header")
                self.send_error_response(401, "Missing or invalid API key")
                return

            # Forward the request to Notion API
            notion_url = f'https://api.notion.com/v1{self.path}'
            headers = {
                'Authorization': self.headers.get('Authorization'),
                'Notion-Version': self.headers.get('Notion-Version', '2022-06-28'),
                'Content-Type': 'application/json'
            }

            request = Request(
                notion_url,
                data=body,
                headers=headers,
                method=method
            )

            try:
                with urlopen(request) as response:
                    response_data = response.read()
                    logger.info(f"Success response from Notion API: {response.status}")
                    logger.debug(f"Response data: {response_data[:200]}...")
                    
                    self.send_response(response.status)
                    self.send_cors_headers()
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(response_data)
            except HTTPError as e:
                error_body = e.read().decode('utf-8') if hasattr(e, 'read') else ""
                logger.error(f"HTTP Error from Notion API: {e.code}")
                logger.error(f"Error response: {error_body}")
                
                self.send_response(e.code)
                self.send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                
                error_response = {
                    'error': {
                        'status': e.code,
                        'message': error_body
                    }
                }
                self.wfile.write(json.dumps(error_response).encode())
            except URLError as e:
                logger.error(f"URL Error: {str(e)}")
                self.send_error_response(500, f"Failed to connect to Notion API: {str(e)}")

        except Exception as e:
            logger.exception(f"Unexpected error: {str(e)}")
            self.send_error_response(500, f"Internal server error: {str(e)}")
    
    def send_error_response(self, status_code, message):
        self.send_response(status_code)
        self.send_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        error_response = {
            'error': {
                'status': status_code,
                'message': message,
                'timestamp': datetime.datetime.now().isoformat()
            }
        }
        self.wfile.write(json.dumps(error_response).encode())
        logger.error(f"Sent error response: {status_code} - {message}")

def run_server(port=8001):
    server_address = ('', port)
    httpd = HTTPServer(server_address, NotionProxyHandler)
    logger.info(f'Starting Notion proxy server on port {port}...')
    logger.info(f'Access at http://localhost:{port}')
    logger.info(f'Press Ctrl+C to stop the server')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server shutdown requested")
        httpd.server_close()
        logger.info("Server shutdown complete")

if __name__ == '__main__':
    run_server() 