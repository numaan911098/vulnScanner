import socketio
import asyncio
import threading
import time
import json
from datetime import datetime
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.sio = socketio.AsyncServer(
            cors_allowed_origins="*",
            async_mode='eventlet',
            logger=True,
            engineio_logger=True
        )
        self.active_scans: Dict[str, dict] = {}
        self.scan_logs: Dict[str, List[dict]] = {}
        
    def get_socketio_instance(self):
        return self.sio
    
    async def emit_log(self, scan_id: str, log_type: str, message: str, command: str = None):
        """Emit a log message to connected clients"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'type': log_type,
            'message': message,
            'command': command,
            'scan_id': scan_id
        }
        
        # Store log entry
        if scan_id not in self.scan_logs:
            self.scan_logs[scan_id] = []
        self.scan_logs[scan_id].append(log_entry)
        
        # Emit to clients
        await self.sio.emit('scan_log', log_entry, room=f'scan_{scan_id}')
        logger.info(f"Emitted log for scan {scan_id}: {message}")
    
    async def emit_progress(self, scan_id: str, progress: dict):
        """Emit progress update to connected clients"""
        progress_data = {
            'scan_id': scan_id,
            'timestamp': datetime.now().isoformat(),
            **progress
        }
        
        # Update active scan data
        if scan_id in self.active_scans:
            self.active_scans[scan_id].update(progress_data)
        
        await self.sio.emit('scan_progress', progress_data, room=f'scan_{scan_id}')
        logger.info(f"Emitted progress for scan {scan_id}: {progress}")
    
    async def emit_error(self, scan_id: str, error: str, stack_trace: str = None):
        """Emit error message to connected clients"""
        error_data = {
            'scan_id': scan_id,
            'timestamp': datetime.now().isoformat(),
            'error': error,
            'stack_trace': stack_trace
        }
        
        await self.sio.emit('scan_error', error_data, room=f'scan_{scan_id}')
        logger.error(f"Emitted error for scan {scan_id}: {error}")
    
    async def start_scan_session(self, scan_id: str, scan_config: dict):
        """Initialize a new scan session"""
        self.active_scans[scan_id] = {
            'scan_id': scan_id,
            'start_time': datetime.now().isoformat(),
            'status': 'starting',
            'progress': 0,
            'current_phase': 'Initializing',
            'estimated_time_remaining': None,
            'scan_speed': 0,
            'config': scan_config
        }
        
        await self.emit_log(scan_id, 'INFO', f'Starting scan session for {scan_config.get("target", "unknown target")}')
        await self.emit_progress(scan_id, self.active_scans[scan_id])
    
    async def end_scan_session(self, scan_id: str, status: str = 'completed'):
        """End a scan session"""
        if scan_id in self.active_scans:
            self.active_scans[scan_id]['status'] = status
            self.active_scans[scan_id]['end_time'] = datetime.now().isoformat()
            
            await self.emit_log(scan_id, 'INFO', f'Scan session ended with status: {status}')
            await self.emit_progress(scan_id, self.active_scans[scan_id])
    
    def get_scan_logs(self, scan_id: str) -> List[dict]:
        """Get all logs for a specific scan"""
        return self.scan_logs.get(scan_id, [])
    
    def get_active_scan(self, scan_id: str) -> Optional[dict]:
        """Get active scan data"""
        return self.active_scans.get(scan_id)

# Global instance
websocket_manager = WebSocketManager()