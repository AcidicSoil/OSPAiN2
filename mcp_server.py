import subprocess
import sys
import os
import signal
import time
import logging
import json
from pathlib import Path

# Set up logging directory
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    filename=log_dir / "mcp_manager.log",
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("MCPManager")

class MCPServerManager:
    def __init__(self):
        self.servers = {}
        self.server_configs = []
        self.current_mode = self.get_current_mode()
    
    def add_server(self, name, script_path, port, additional_args=None):
        """Add a server configuration"""
        self.server_configs.append({
            "name": name,
            "script_path": script_path,
            "port": port,
            "args": additional_args or []
        })
    
    def get_current_mode(self):
        """Get the current development mode from .current_mode file"""
        try:
            mode_file = Path("development-modes/.current_mode")
            if mode_file.exists():
                current_mode = mode_file.read_text().strip()
                if current_mode in ["design", "engineering", "testing", "deployment", "maintenance"]:
                    logger.info(f"Current development mode: {current_mode}")
                    return current_mode
            return None
        except Exception as e:
            logger.error(f"Error reading current mode: {str(e)}")
            return None
    
    def check_mode_change(self):
        """Check if the development mode has changed and reconfigure servers if needed"""
        new_mode = self.get_current_mode()
        if new_mode and new_mode != self.current_mode:
            logger.info(f"Mode changed from {self.current_mode} to {new_mode}")
            self.current_mode = new_mode
            self.reconfigure_servers_for_mode()
            return True
        return False
    
    def reconfigure_servers_for_mode(self):
        """Reconfigure servers based on the current development mode"""
        if not self.current_mode:
            return
        
        logger.info(f"Reconfiguring servers for {self.current_mode} mode")
        
        # Notify each running server about the mode change via environment variable or command
        for name, process in self.servers.items():
            if self.is_process_running(process):
                logger.info(f"Notifying server {name} about mode change")
                # Here we could implement a mechanism to notify the server about the mode change
                # For example, by sending a signal or making an API call to the server
                try:
                    # Example approach: Create a mode change file that servers can watch
                    mode_change_file = Path(f"logs/{name}_mode.txt")
                    mode_change_file.write_text(self.current_mode)
                    logger.info(f"Created mode change file for {name}")
                except Exception as e:
                    logger.error(f"Error notifying server {name} about mode change: {str(e)}")
    
    def apply_mode_specific_config(self, config):
        """Apply mode-specific configuration to a server config"""
        if not self.current_mode:
            return config
        
        # Clone the config to avoid modifying the original
        updated_config = config.copy()
        
        # Add mode information to the server arguments
        updated_config["args"] = updated_config["args"].copy() if updated_config["args"] else []
        updated_config["args"].extend(["--mode", self.current_mode])
        
        # Mode-specific optimizations could be applied here
        if self.current_mode == "design":
            # Design mode optimizations
            if "prompt_engineering" in config["name"]:
                # Prioritize design-related templates and examples
                updated_config["args"].extend(["--optimize-for", "design"])
        elif self.current_mode == "engineering":
            # Engineering mode optimizations
            if "docker_integration" in config["name"]:
                # More aggressive caching for engineering tasks
                updated_config["args"].extend(["--cache-level", "aggressive"])
        elif self.current_mode == "testing":
            # Testing mode optimizations
            updated_config["args"].extend(["--verbose", "true"])
        # Add other mode-specific optimizations as needed
        
        return updated_config
    
    def start_all_servers(self):
        """Start all configured servers"""
        for config in self.server_configs:
            self.start_server(config)
    
    def start_server(self, config):
        """Start a single server with hidden window"""
        name = config["name"]
        
        # Check if server is already running
        if name in self.servers and self.is_process_running(self.servers[name]):
            logger.info(f"Server {name} is already running")
            return
        
        # Apply mode-specific configuration
        mode_config = self.apply_mode_specific_config(config)
        
        # Build command
        cmd = [sys.executable, mode_config["script_path"], "--port", str(mode_config["port"])] + mode_config["args"]
        
        # Prepare log files
        stdout_log = open(log_dir / f"{name}_out.log", "a")
        stderr_log = open(log_dir / f"{name}_err.log", "a")
        
        # Set environment variables including the current mode
        env = os.environ.copy()
        if self.current_mode:
            env["DEVELOPMENT_MODE"] = self.current_mode
        
        # Start the process with hidden window
        try:
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            startupinfo.wShowWindow = 0  # SW_HIDE
            
            process = subprocess.Popen(
                cmd,
                stdout=stdout_log,
                stderr=stderr_log,
                startupinfo=startupinfo,
                creationflags=subprocess.CREATE_NO_WINDOW,
                env=env
            )
            
            self.servers[name] = process
            logger.info(f"Started server {name} with PID {process.pid}, mode: {self.current_mode}")
            
        except Exception as e:
            logger.error(f"Failed to start server {name}: {str(e)}")
    
    def stop_server(self, name):
        """Stop a specific server"""
        if name in self.servers:
            process = self.servers[name]
            if self.is_process_running(process):
                logger.info(f"Stopping server {name}")
                try:
                    process.terminate()
                    # Give it a moment to terminate gracefully
                    for _ in range(10):
                        if not self.is_process_running(process):
                            break
                        time.sleep(0.5)
                    
                    # Force kill if still running
                    if self.is_process_running(process):
                        process.kill()
                    
                    logger.info(f"Server {name} stopped")
                except Exception as e:
                    logger.error(f"Error stopping server {name}: {str(e)}")
            
            del self.servers[name]
    
    def stop_all_servers(self):
        """Stop all running servers"""
        for name in list(self.servers.keys()):
            self.stop_server(name)
    
    def is_process_running(self, process):
        """Check if a process is still running"""
        return process is not None and process.poll() is None
    
    def monitor_servers(self):
        """Monitor all servers and restart any that have crashed"""
        # Check for mode changes first
        mode_changed = self.check_mode_change()
        
        # Restart or start servers as needed
        for config in self.server_configs:
            name = config["name"]
            if name not in self.servers or not self.is_process_running(self.servers[name]):
                logger.info(f"Server {name} is not running. Starting it...")
                self.start_server(config)
            elif mode_changed:
                # If mode changed and we want to restart servers with new configuration
                # Uncomment these lines to implement restarting on mode change
                # logger.info(f"Restarting server {name} due to mode change")
                # self.stop_server(name)
                # self.start_server(config)
                pass


def create_tray_icon():
    """Create a system tray icon for managing the servers (optional)"""
    try:
        import pystray
        from PIL import Image, ImageDraw
        
        # Create a simple icon
        icon_size = 64
        image = Image.new('RGB', (icon_size, icon_size), color='blue')
        draw = ImageDraw.Draw(image)
        draw.text((10, 10), "MCP", fill='white')
        
        # Define menu items and callbacks
        def exit_app(icon):
            icon.stop()
            manager.stop_all_servers()
            
        def restart_servers():
            manager.stop_all_servers()
            manager.start_all_servers()
        
        def refresh_mode():
            current_mode = manager.get_current_mode()
            manager.reconfigure_servers_for_mode()
            return f"Current Mode: {current_mode}"
        
        # Create the menu
        menu = pystray.Menu(
            pystray.MenuItem("Current Mode", refresh_mode),
            pystray.MenuItem("Restart All Servers", lambda: restart_servers()),
            pystray.MenuItem("Exit", exit_app)
        )
        
        # Create the icon
        icon = pystray.Icon("mcp_manager", image, "MCP Server Manager", menu)
        
        # Run the icon in a separate thread
        import threading
        threading.Thread(target=icon.run, daemon=True).start()
        
        return True
    except ImportError:
        logger.warning("pystray/PIL not installed. No system tray icon will be created.")
        return False


if __name__ == "__main__":
    # Create the server manager
    manager = MCPServerManager()
    
    # Configure your servers here
    
    # Prompt Engineering Assistant
    manager.add_server(
        name="prompt_engineering",
        script_path="src/mcp-servers/prompt-engineering/server.py",
        port=3001
    )
    
    # Docker Integration
    manager.add_server(
        name="docker_integration",
        script_path="src/mcp-servers/docker/server.py",
        port=3002
    )
    
    # Mouse Automation
    manager.add_server(
        name="mouse_automation",
        script_path="src/mcp-servers/automation/server.py",
        port=3003
    )
    
    # Knowledge Graph
    manager.add_server(
        name="knowledge_graph",
        script_path="/c/Users/comfy/Projects/mcp-knowledge-graph/dist/index.js",
        port=3005,
        additional_args=["--memory-path", "./data/memory.jsonl"]
    )
    
    # Repository Tools
    manager.add_server(
        name="repository_tools",
        script_path="src/mcp-servers/repository-tools/repository-tools-server.ts",
        port=3006
    )
    
    # Start all configured servers
    manager.start_all_servers()
    
    # Optional: Create system tray icon
    has_tray = create_tray_icon()
    
    try:
        # Main loop
        print("MCP servers running in background. Press Ctrl+C to exit.")
        while True:
            # Check servers every 30 seconds
            manager.monitor_servers()
            time.sleep(30)
    except KeyboardInterrupt:
        print("Shutting down...")
    finally:
        manager.stop_all_servers()