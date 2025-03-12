#!/usr/bin/env python3
"""
Simple HTTP server for viewing the Ollama Ecosystem Design UI
Run this script and then visit http://localhost:8000 in your web browser
"""
import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent.absolute()

# Change to the UI directory
os.chdir(SCRIPT_DIR)

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

if __name__ == "__main__":
    handler = CustomHTTPRequestHandler

    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving Ollama Ecosystem Design UI at http://localhost:{PORT}")
        print("Open your browser to view the UI (launching browser automatically)")
        print("Press Ctrl+C to stop the server")
        
        # Open the browser automatically
        webbrowser.open(f"http://localhost:{PORT}")
        
        # Start the server
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped by user")
            httpd.server_close() 