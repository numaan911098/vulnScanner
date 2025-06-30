# VulnScanner - Security Dashboard

A comprehensive vulnerability scanning dashboard with a React frontend and Flask backend.

## Features

- **Web Application Security Scanning**: Comprehensive security assessment of web applications
- **Network Security Analysis**: Deep network infrastructure security analysis
- **WordPress Vulnerability Detection**: Specialized WordPress security scanning
- **Subdomain Discovery**: Find and analyze subdomains
- **PDF Report Generation**: Detailed security reports in PDF format
- **User Authentication**: Secure login and registration system
- **Real-time Scan Monitoring**: Track scan progress and status

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for data visualization
- React Router for navigation

### Backend
- Flask (Python)
- MongoDB for data storage
- Security tools: nmap, whatweb, wpscan, assetfinder, httpx

## Quick Start with Docker

1. **Clone and setup the project structure:**
   ```bash
   # Create backend directory and move your Python files there
   mkdir backend
   # Move all your Python files (app.py, db.py, etc.) to the backend directory
   ```

2. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## Manual Setup (Alternative)

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB
- Security tools: nmap, whatweb, wpscan, assetfinder, httpx

### Frontend Setup
```bash
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### MongoDB Setup
Make sure MongoDB is running on localhost:27017 or update the connection string in `backend/db.py`.

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Start New Scan**: Enter target URL and scan name
3. **Monitor Progress**: View scan status in real-time
4. **Review Results**: Analyze security findings and vulnerabilities
5. **Download Reports**: Generate and download PDF reports

## Security Tools Included

- **nmap**: Network port scanning and service detection
- **whatweb**: Web technology identification
- **wpscan**: WordPress vulnerability scanner
- **assetfinder**: Subdomain discovery
- **httpx**: HTTP toolkit for subdomain validation

## API Endpoints

- `POST /auth/login` - User authentication
- `POST /auth/signup` - User registration
- `POST /start-active-scan` - Start new security scan
- `GET /scan-results/<scan_id>` - Get scan results
- `GET /all-scans` - List all scans
- `GET /reports` - List available reports
- `GET /report/<scan_id>` - Download PDF report
- `POST /delete-scan` - Delete scan

## Environment Variables

- `MONGODB_URI`: MongoDB connection string (default: mongodb://localhost:27017/)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational and authorized security testing purposes only.