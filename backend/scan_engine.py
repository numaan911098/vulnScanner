import asyncio
import subprocess
import time
import json
import traceback
import psutil
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Callable
from websocket_manager import websocket_manager
from scan import run_nmap_scan, run_whatweb_scan, run_wpscan, find_subdomains
from filter import parse_nmap_results, filter_whatweb_scan, parse_wp_results, find_vulnerabilities, find_users, find_themes, filter_subdomains
import logging

logger = logging.getLogger(__name__)

class ScanEngine:
    def __init__(self):
        self.active_scans: Dict[str, dict] = {}
        self.scan_phases = [
            {'name': 'Network Discovery', 'weight': 25, 'function': 'run_nmap_scan'},
            {'name': 'Web Technology Detection', 'weight': 20, 'function': 'run_whatweb_scan'},
            {'name': 'WordPress Analysis', 'weight': 30, 'function': 'run_wpscan'},
            {'name': 'Subdomain Enumeration', 'weight': 25, 'function': 'find_subdomains'}
        ]
    
    async def run_command_with_logging(self, scan_id: str, command: List[str], phase_name: str) -> str:
        """Run a command with real-time logging"""
        try:
            await websocket_manager.emit_log(
                scan_id, 'INFO', 
                f'Executing: {" ".join(command)}', 
                command=" ".join(command)
            )
            
            # Start the process
            process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1
            )
            
            output_lines = []
            
            # Read output line by line
            while True:
                output = process.stdout.readline()
                if output == '' and process.poll() is not None:
                    break
                if output:
                    line = output.strip()
                    output_lines.append(line)
                    
                    # Emit real-time output
                    await websocket_manager.emit_log(
                        scan_id, 'OUTPUT', 
                        line, 
                        command=" ".join(command)
                    )
            
            # Wait for process to complete
            return_code = process.poll()
            
            if return_code != 0:
                error_msg = f"Command failed with return code {return_code}"
                await websocket_manager.emit_log(scan_id, 'ERROR', error_msg)
                raise subprocess.CalledProcessError(return_code, command)
            
            result = '\n'.join(output_lines)
            await websocket_manager.emit_log(
                scan_id, 'SUCCESS', 
                f'Command completed successfully. Output length: {len(result)} characters'
            )
            
            return result
            
        except Exception as e:
            error_msg = f"Error executing command: {str(e)}"
            await websocket_manager.emit_log(scan_id, 'ERROR', error_msg)
            await websocket_manager.emit_error(scan_id, error_msg, traceback.format_exc())
            raise
    
    async def update_progress(self, scan_id: str, phase_index: int, phase_progress: float):
        """Update scan progress"""
        total_progress = 0
        
        # Calculate progress based on completed phases
        for i, phase in enumerate(self.scan_phases):
            if i < phase_index:
                total_progress += phase['weight']
            elif i == phase_index:
                total_progress += phase['weight'] * (phase_progress / 100)
        
        # Calculate estimated time remaining
        if scan_id in self.active_scans:
            scan_data = self.active_scans[scan_id]
            elapsed_time = time.time() - scan_data['start_time']
            
            if total_progress > 0:
                estimated_total_time = elapsed_time / (total_progress / 100)
                estimated_remaining = max(0, estimated_total_time - elapsed_time)
                
                # Calculate scan speed (items per second)
                scan_speed = total_progress / elapsed_time if elapsed_time > 0 else 0
                
                progress_data = {
                    'progress': round(total_progress, 2),
                    'current_phase': self.scan_phases[phase_index]['name'],
                    'phase_progress': round(phase_progress, 2),
                    'estimated_time_remaining': round(estimated_remaining),
                    'scan_speed': round(scan_speed, 2),
                    'elapsed_time': round(elapsed_time)
                }
                
                await websocket_manager.emit_progress(scan_id, progress_data)
    
    async def run_scan_phase(self, scan_id: str, target: str, phase_index: int):
        """Run a specific scan phase"""
        phase = self.scan_phases[phase_index]
        phase_name = phase['name']
        
        await websocket_manager.emit_log(
            scan_id, 'INFO', 
            f'Starting phase: {phase_name}'
        )
        
        try:
            # Update progress to show phase start
            await self.update_progress(scan_id, phase_index, 0)
            
            # Run the appropriate scan function
            if phase['function'] == 'run_nmap_scan':
                result = await self.run_nmap_with_progress(scan_id, target, phase_index)
            elif phase['function'] == 'run_whatweb_scan':
                result = await self.run_whatweb_with_progress(scan_id, target, phase_index)
            elif phase['function'] == 'run_wpscan':
                result = await self.run_wpscan_with_progress(scan_id, target, phase_index)
            elif phase['function'] == 'find_subdomains':
                result = await self.run_subdomains_with_progress(scan_id, target, phase_index)
            else:
                result = ""
            
            # Update progress to show phase completion
            await self.update_progress(scan_id, phase_index, 100)
            
            await websocket_manager.emit_log(
                scan_id, 'SUCCESS', 
                f'Completed phase: {phase_name}'
            )
            
            return result
            
        except Exception as e:
            error_msg = f"Error in phase {phase_name}: {str(e)}"
            await websocket_manager.emit_log(scan_id, 'ERROR', error_msg)
            await websocket_manager.emit_error(scan_id, error_msg, traceback.format_exc())
            raise
    
    async def run_nmap_with_progress(self, scan_id: str, target: str, phase_index: int) -> str:
        """Run nmap scan with progress updates"""
        import socket
        
        # Resolve domain to IP
        try:
            ip_address = socket.gethostbyname(target)
            await websocket_manager.emit_log(scan_id, 'INFO', f'Resolved {target} to {ip_address}')
        except socket.gaierror:
            await websocket_manager.emit_log(scan_id, 'ERROR', f'Unable to resolve domain: {target}')
            return "Unable to resolve domain to IP address."
        
        command = ['nmap', '-sV', ip_address, '-n', '-T4', '-F', '--min-rate', '1000']
        
        # Simulate progress updates during scan
        await self.update_progress(scan_id, phase_index, 25)
        
        result = await self.run_command_with_logging(scan_id, command, 'Network Discovery')
        
        await self.update_progress(scan_id, phase_index, 100)
        return result
    
    async def run_whatweb_with_progress(self, scan_id: str, target: str, phase_index: int) -> str:
        """Run whatweb scan with progress updates"""
        command = ['whatweb', target]
        
        await self.update_progress(scan_id, phase_index, 50)
        
        result = await self.run_command_with_logging(scan_id, command, 'Web Technology Detection')
        
        # Clean ANSI escape codes
        import re
        clean_result = re.sub(r'\033\[[0-9;]*[mK]', '', result)
        
        await self.update_progress(scan_id, phase_index, 100)
        return clean_result
    
    async def run_wpscan_with_progress(self, scan_id: str, target: str, phase_index: int) -> str:
        """Run wpscan with progress updates"""
        command = [
            'wpscan', '--url', target, '--random-user-agent', 
            '--enumerate', 'u,vp,vt', '--api-token', 
            'pMSnMTtaJO2yOC6ERtHqps9qqpbJzVZEizjaVo4DKtY'
        ]
        
        # Update progress during different phases of wpscan
        await self.update_progress(scan_id, phase_index, 20)
        
        result = await self.run_command_with_logging(scan_id, command, 'WordPress Analysis')
        
        # Clean ANSI escape codes
        import re
        clean_result = re.sub(r'\033\[[0-9;]*[mK]', '', result)
        
        await self.update_progress(scan_id, phase_index, 100)
        return clean_result
    
    async def run_subdomains_with_progress(self, scan_id: str, target: str, phase_index: int) -> List[str]:
        """Run subdomain enumeration with progress updates"""
        import tldextract
        
        # Extract domain
        extracted = tldextract.extract(target)
        normalized_domain = f"{extracted.domain}.{extracted.suffix}"
        
        await websocket_manager.emit_log(scan_id, 'INFO', f'Finding subdomains for: {normalized_domain}')
        
        # Find subdomains
        await self.update_progress(scan_id, phase_index, 30)
        
        find_command = ['assetfinder', '--subs-only', normalized_domain]
        subdomains_output = await self.run_command_with_logging(scan_id, find_command, 'Subdomain Discovery')
        subdomains = subdomains_output.strip().split('\n') if subdomains_output.strip() else []
        
        await websocket_manager.emit_log(scan_id, 'INFO', f'Found {len(subdomains)} potential subdomains')
        
        # Check which subdomains are alive
        await self.update_progress(scan_id, phase_index, 60)
        
        alive_subdomains = []
        for i, subdomain in enumerate(subdomains):
            if subdomain.strip():
                try:
                    # Use httpx to check if subdomain is alive
                    check_command = ['httpx', '-silent', '-timeout', '10']
                    process = subprocess.Popen(
                        check_command,
                        stdin=subprocess.PIPE,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        universal_newlines=True
                    )
                    
                    stdout, stderr = process.communicate(input=subdomain.strip())
                    
                    if stdout.strip():
                        alive_subdomains.append(subdomain.strip())
                        await websocket_manager.emit_log(
                            scan_id, 'SUCCESS', 
                            f'Alive subdomain found: {subdomain.strip()}'
                        )
                    
                    # Update progress
                    progress = 60 + (40 * (i + 1) / len(subdomains))
                    await self.update_progress(scan_id, phase_index, progress)
                    
                except Exception as e:
                    await websocket_manager.emit_log(
                        scan_id, 'WARNING', 
                        f'Error checking subdomain {subdomain}: {str(e)}'
                    )
        
        await websocket_manager.emit_log(scan_id, 'INFO', f'Found {len(alive_subdomains)} alive subdomains')
        await self.update_progress(scan_id, phase_index, 100)
        
        return alive_subdomains
    
    async def run_full_scan(self, scan_id: str, target: str, scan_config: dict):
        """Run a complete security scan"""
        try:
            # Initialize scan session
            self.active_scans[scan_id] = {
                'start_time': time.time(),
                'target': target,
                'config': scan_config,
                'status': 'running'
            }
            
            await websocket_manager.start_scan_session(scan_id, scan_config)
            
            # Store raw results
            raw_results = {}
            
            # Run each scan phase
            for i, phase in enumerate(self.scan_phases):
                if scan_id not in self.active_scans:  # Check if scan was cancelled
                    await websocket_manager.emit_log(scan_id, 'WARNING', 'Scan was cancelled')
                    return
                
                phase_result = await self.run_scan_phase(scan_id, target, i)
                
                # Store raw result
                if phase['function'] == 'run_nmap_scan':
                    raw_results['nmap_raw'] = phase_result
                elif phase['function'] == 'run_whatweb_scan':
                    raw_results['whatweb_raw'] = phase_result
                elif phase['function'] == 'run_wpscan':
                    raw_results['wpscan_raw'] = phase_result
                elif phase['function'] == 'find_subdomains':
                    raw_results['subdomain_raw'] = phase_result
            
            # Process results
            await websocket_manager.emit_log(scan_id, 'INFO', 'Processing scan results...')
            
            processed_data = {
                'nmap': parse_nmap_results(raw_results.get('nmap_raw', '')),
                'whatweb': filter_whatweb_scan(raw_results.get('whatweb_raw', '')),
                'general': parse_wp_results(raw_results.get('wpscan_raw', '')),
                'vulnerabilities': find_vulnerabilities(raw_results.get('wpscan_raw', '')),
                'users': find_users(raw_results.get('wpscan_raw', '')),
                'themes': find_themes(raw_results.get('wpscan_raw', '')),
                'subdomains': filter_subdomains(raw_results.get('subdomain_raw', []))
            }
            
            # Save results to database
            from db import save_scan_results, save_processed_results, change_scan_status, save_pdf_report
            from report import convert_scan_data_to_pdf
            
            save_scan_results(scan_id, raw_results)
            save_processed_results(scan_id, processed_data)
            change_scan_status(scan_id)
            
            # Generate PDF report
            await websocket_manager.emit_log(scan_id, 'INFO', 'Generating PDF report...')
            pdf_data = convert_scan_data_to_pdf(raw_results)
            save_pdf_report(scan_id, pdf_data)
            
            # Complete scan
            await websocket_manager.end_scan_session(scan_id, 'completed')
            await websocket_manager.emit_log(scan_id, 'SUCCESS', 'Scan completed successfully!')
            
            # Clean up
            if scan_id in self.active_scans:
                del self.active_scans[scan_id]
                
        except Exception as e:
            error_msg = f"Scan failed: {str(e)}"
            await websocket_manager.emit_log(scan_id, 'ERROR', error_msg)
            await websocket_manager.emit_error(scan_id, error_msg, traceback.format_exc())
            await websocket_manager.end_scan_session(scan_id, 'failed')
            
            # Clean up
            if scan_id in self.active_scans:
                del self.active_scans[scan_id]
    
    def cancel_scan(self, scan_id: str):
        """Cancel an active scan"""
        if scan_id in self.active_scans:
            del self.active_scans[scan_id]
            return True
        return False
    
    def get_system_resources(self) -> dict:
        """Get current system resource usage"""
        return {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent,
            'network_io': psutil.net_io_counters()._asdict() if psutil.net_io_counters() else {}
        }

# Global instance
scan_engine = ScanEngine()