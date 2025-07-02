from flask import Flask, request, jsonify, make_response
from flask_socketio import SocketIO, emit, join_room, leave_room
import threading
import uuid
import json
from datetime import datetime
from db import get_processed_results, save_processed_results, save_scan_results, save_scan_data, get_saved_scans, change_scan_status, save_pdf_report, get_reports, get_pdf_report, get_scan_info, delete_scan
from scan import run_nmap_scan, run_whatweb_scan, run_wpscan, find_subdomains
from filter import parse_nmap_results, filter_whatweb_scan, parse_wp_results, find_vulnerabilities, find_users, find_themes, filter_subdomains
from flask_cors import CORS
from auth import auth
from report import convert_scan_data_to_pdf
from websocket_manager import websocket_manager
from scan_engine import scan_engine
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
CORS(app, origins=["http://localhost:5173"])

# Initialize SocketIO with threading mode
socketio = SocketIO(
    app, 
    cors_allowed_origins=["http://localhost:5173"],
    async_mode='threading',
    logger=True,
    engineio_logger=True
)

# Use the websocket manager's socketio instance
socketio.server = websocket_manager.get_socketio_instance()

app.register_blueprint(auth, url_prefix='/auth')

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    logger.info(f'Client connected: {request.sid}')
    emit('connected', {'status': 'Connected to VulnScanner'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f'Client disconnected: {request.sid}')

@socketio.on('join_scan')
def handle_join_scan(data):
    scan_id = data.get('scan_id')
    if scan_id:
        join_room(f'scan_{scan_id}')
        logger.info(f'Client {request.sid} joined scan room: {scan_id}')
        
        # Send existing logs if any
        logs = websocket_manager.get_scan_logs(scan_id)
        for log in logs[-50:]:  # Send last 50 logs
            emit('scan_log', log)
        
        # Send current progress if scan is active
        active_scan = websocket_manager.get_active_scan(scan_id)
        if active_scan:
            emit('scan_progress', active_scan)

@socketio.on('leave_scan')
def handle_leave_scan(data):
    scan_id = data.get('scan_id')
    if scan_id:
        leave_room(f'scan_{scan_id}')
        logger.info(f'Client {request.sid} left scan room: {scan_id}')

@socketio.on('request_system_resources')
def handle_system_resources():
    resources = scan_engine.get_system_resources()
    emit('system_resources', resources)

def run_scan_in_thread(target, scan_id, scan_config):
    """Run scan in a separate thread"""
    try:
        scan_engine.run_full_scan_sync(scan_id, target, scan_config)
    except Exception as e:
        logger.error(f'Error in scan thread: {str(e)}')
        websocket_manager.emit_error(scan_id, str(e))

@app.route('/start-active-scan', methods=['POST'])
def start_active_scan():
    try:
        data = request.json
        target = data['target']
        scan_name = data.get('name', f'Scan-{datetime.now().strftime("%Y%m%d-%H%M%S")}')
        scan_id = str(uuid.uuid4())
        
        scan_config = {
            'target': target,
            'name': scan_name,
            'scan_id': scan_id,
            'timestamp': datetime.now().isoformat()
        }
        
        # Save initial scan data
        scan_data = {
            'name': scan_name,
            'target': target,
            'time': datetime.now().isoformat(),
            'status': 'pending',
            '_id': scan_id
        }
        save_scan_data(scan_data)
        
        # Start scan in thread
        thread = threading.Thread(target=run_scan_in_thread, args=(target, scan_id, scan_config))
        thread.daemon = True
        thread.start()
        
        logger.info(f'Started scan {scan_id} for target {target}')
        return jsonify({'scan_id': scan_id, 'status': 'pending'}), 202
        
    except Exception as e:
        logger.error(f'Error starting scan: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/cancel-scan/<scan_id>', methods=['POST'])
def cancel_scan(scan_id):
    try:
        success = scan_engine.cancel_scan(scan_id)
        if success:
            # Update database status
            from db import change_scan_status_to
            change_scan_status_to(scan_id, 'cancelled')
            
            logger.info(f'Cancelled scan {scan_id}')
            return jsonify({'status': 'cancelled'}), 200
        else:
            return jsonify({'error': 'Scan not found or already completed'}), 404
            
    except Exception as e:
        logger.error(f'Error cancelling scan: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/scan-results/<scan_id>', methods=['GET'])
def scan_results(scan_id):
    try:
        processed_data = get_processed_results(scan_id)
        if not processed_data:
            return jsonify({'status': 'pending'})
        
        return jsonify(processed_data)
        
    except Exception as e:
        logger.error(f'Error fetching scan results: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/scan-logs/<scan_id>', methods=['GET'])
def get_scan_logs(scan_id):
    try:
        logs = websocket_manager.get_scan_logs(scan_id)
        return jsonify({'logs': logs})
        
    except Exception as e:
        logger.error(f'Error fetching scan logs: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/export-logs/<scan_id>', methods=['GET'])
def export_scan_logs(scan_id):
    try:
        logs = websocket_manager.get_scan_logs(scan_id)
        scan_info = get_scan_info(scan_id)
        
        export_data = {
            'scan_info': scan_info,
            'logs': logs,
            'exported_at': datetime.now().isoformat(),
            'total_logs': len(logs)
        }
        
        response = make_response(json.dumps(export_data, indent=2))
        response.headers['Content-Type'] = 'application/json'
        response.headers['Content-Disposition'] = f'attachment; filename=scan_logs_{scan_id}.json'
        
        return response
        
    except Exception as e:
        logger.error(f'Error exporting scan logs: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/system-resources', methods=['GET'])
def get_system_resources():
    try:
        resources = scan_engine.get_system_resources()
        return jsonify(resources)
        
    except Exception as e:
        logger.error(f'Error fetching system resources: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/save-scan', methods=['POST'])
def save_scan():
    try:
        data = request.json
        scan_data = {
            'name': data['name'],
            'target': data['target'],
            'time': data['Time'],
            'status': data['status'],
            '_id': data['scan_id']
        }
        save_scan_data(scan_data)
        return jsonify({'status': 'done'}), 200
        
    except Exception as e:
        logger.error(f'Error saving scan: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/all-scans', methods=['GET'])
def get_all_scans():
    try:
        all_saved_scans = get_saved_scans()
        return jsonify(all_saved_scans)
        
    except Exception as e:
        logger.error(f'Error fetching all scans: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/reports', methods=['GET'])
def list_reports():
    try:
        report_data = get_reports()
        return jsonify(report_data)
        
    except Exception as e:
        logger.error(f'Error fetching reports: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/report/<scan_id>', methods=['GET'])
def get_report(scan_id):
    try:
        scan_info = get_scan_info(scan_id)
        pdf_data = get_pdf_report(scan_id)
        
        if pdf_data and scan_info:
            response = make_response(pdf_data)
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = f'attachment; filename=report_{scan_info["name"]}.pdf'
            return response
        else:
            return jsonify({'error': 'Report not found or scan info missing'}), 404
            
    except Exception as e:
        logger.error(f'Error fetching report: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/delete-scan', methods=['POST'])
def delete_scan_route():
    try:
        data = request.get_json()
        if 'scan_id' not in data:
            return jsonify({"error": "Scan ID is required"}), 400
        
        scan_id = data['scan_id']
        delete_scan(scan_id)
        return jsonify({"message": "Scan deleted successfully"}), 200
        
    except Exception as e:
        logger.error(f'Error deleting scan: {str(e)}')
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info('Starting VulnScanner backend with WebSocket support')
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)