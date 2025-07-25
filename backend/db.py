from pymongo import MongoClient
from werkzeug.security import generate_password_hash
import os

# Get MongoDB URI from environment variable or use default
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')

client = MongoClient(MONGODB_URI)

db = client.scan_results_db


def save_scan_results(scan_id, scan_data):
    """Save scan results to MongoDB."""
    scans_collection = db.scans
    scan_data['_id'] = scan_id
    scans_collection.insert_one(scan_data)

def get_scan_results(scan_id):
    """Retrieve scan results from MongoDB."""
    scans_collection = db.scans
    return scans_collection.find_one({'_id': scan_id})

def save_processed_results(scan_id, processed_data):
    """Save processed scan results to MongoDB."""
    processed_scans_collection = db.processed_scans
    processed_data['_id'] = scan_id
    processed_scans_collection.insert_one(processed_data)

def get_processed_results(scan_id):
    """Retrieve processed scan results from MongoDB."""
    processed_scans_collection = db.processed_scans
    return processed_scans_collection.find_one({'_id': scan_id})

def create_user(username, password):
    """Create a new user with hashed password."""
    users_collection = db.users
    hashed_password = generate_password_hash(password)
    users_collection.insert_one({'_id': username, 'password': hashed_password})

def get_user(username):
    """Retrieve a user by username."""
    users_collection = db.users
    return users_collection.find_one({'_id': username})

def save_scan_data(scan_data):
    """Save scan data to MongoDB."""
    saved_scans_collection = db.saved_scans
    saved_scans_collection.insert_one(scan_data)

def get_saved_scans():
    """Retrieve all scans from MongoDB."""
    saved_scans_collection = db.saved_scans
    cursor = saved_scans_collection.find()
    return [document for document in cursor]

def change_scan_status(scan_id):
    """Change status of scan after completed"""
    saved_scans_collection = db.saved_scans
    result = saved_scans_collection.update_one(
        {'_id': scan_id},
        {'$set': {'status': 'completed'}}
    )
    
    if result.modified_count > 0:
        print("Scan status updated successfully.")
    else:
        print("Scan not found.")

def change_scan_status_to(scan_id, status):
    """Change status of scan to specific status"""
    saved_scans_collection = db.saved_scans
    result = saved_scans_collection.update_one(
        {'_id': scan_id},
        {'$set': {'status': status}}
    )
    
    if result.modified_count > 0:
        print(f"Scan status updated to {status} successfully.")
    else:
        print("Scan not found.")

def save_pdf_report(scan_id, pdf_data):
    """Save PDF report binary data to MongoDB."""
    reports_collection = db.pdf_reports
    reports_collection.insert_one({'_id': scan_id, 'pdf_data': pdf_data})

def get_pdf_report(scan_id):
    """Retrieve a specific PDF report by scan ID."""
    reports_collection = db.pdf_reports
    report = reports_collection.find_one({'_id': scan_id}, {'pdf_data': 1})
    return report['pdf_data'] if report else None

def get_reports():
    """Retrieve a list of available report IDs along with name and target."""
    reports_collection = db.pdf_reports
    saved_scans_collection = db.saved_scans

    reports = []
    for report in reports_collection.find({}, {'_id': 1}):
        scan_id = report['_id']
        scan = saved_scans_collection.find_one({'_id': scan_id}, {'name': 1, 'target': 1})
        if scan:
            reports.append({
                'scan_id': scan_id,
                'name': scan['name'],
                'target': scan['target']
            })
    
    return reports

def get_scan_info(scan_id):
    """Retrieve the name and target for a specific scan by scan ID."""
    saved_scans_collection = db.saved_scans
    scan_info = saved_scans_collection.find_one({'_id': scan_id}, {'name': 1, 'target': 1})
    return {
        'name': scan_info['name'],
        'target': scan_info['target']
    } if scan_info else None

def delete_scan(scan_id):
    saved_scans_collection = db.saved_scans
    reports_collection = db.pdf_reports
    processed_scans_collection = db.processed_scans
    scans_collection = db.scans

    saved_scans_collection.delete_one({"_id": scan_id})
    reports_collection.delete_one({"_id": scan_id})
    processed_scans_collection.delete_one({"_id": scan_id})
    scans_collection.delete_one({"_id": scan_id})

def save_scan_logs(scan_id, logs):
    """Save scan logs to MongoDB."""
    logs_collection = db.scan_logs
    logs_collection.insert_one({'_id': scan_id, 'logs': logs})

def get_scan_logs_from_db(scan_id):
    """Retrieve scan logs from MongoDB."""
    logs_collection = db.scan_logs
    result = logs_collection.find_one({'_id': scan_id})
    return result['logs'] if result else []