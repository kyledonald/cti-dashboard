# CTI Dashboard

A comprehensive Cyber Threat Intelligence dashboard for organizations to manage security incidents, track threat actors, monitor CVEs, and generate AI-powered threat reports.

## Features

### Core Functionality
- **Security Incidents Management**: Create, track, and manage security incidents with Kanban-style workflow
- **Threat Actor Intelligence**: Comprehensive threat actor profiles with country flags, risk assessments, and targeting analysis
- **CVE Monitoring**: Real-time CVE data from Shodan with CVSS scoring and known exploited vulnerabilities
- **User Management**: Role-based access control (Admin, Editor, Viewer) with organization-specific data
- **AI Threat Reports**: AI-generated comprehensive threat reports for security incidents using Google Gemini

### AI Threat Reports Feature
- **Automatic Report Generation**: Generate detailed threat reports for any security incident
- **Structured Analysis**: Executive summary, threat analysis, risk assessment, recommendations, and IOCs
- **Organization-Scoped**: Reports are organization-specific and respect user permissions
- **Real-time Generation**: Uses Google Gemini AI for professional, actionable threat intelligence

## Setup

### Prerequisites
- Node.js 18+ 
- Firebase project with Firestore
- Google Gemini API key

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```bash
   # Google Gemini API Key for AI Threat Reports
   # Get your API key from: https://makersuite.google.com/app/apikey
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # GCP Project ID (if using GCP)
   GCP_PROJECT=your_gcp_project_id
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd web-app
   npm install
   ```

2. **Environment Configuration**
   Copy `env.example` to `.env.local` and configure:
   ```bash
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### AI Reports
- `GET /ai-reports` - Get all AI reports (with optional organization filter)
- `GET /ai-reports/:reportId` - Get specific AI report
- `GET /ai-reports/incident/:incidentId` - Get AI report for specific incident
- `POST /ai-reports/generate/:incidentId` - Generate AI report for incident
- `DELETE /ai-reports/:reportId` - Delete AI report (admin/editor only)

### Incidents
- `GET /incidents` - Get all incidents
- `POST /incidents` - Create new incident
- `PUT /incidents/:id` - Update incident
- `DELETE /incidents/:id` - Delete incident

### Threat Actors
- `GET /threat-actors` - Get all threat actors
- `POST /threat-actors` - Create new threat actor
- `PUT /threat-actors/:id` - Update threat actor
- `DELETE /threat-actors/:id` - Delete threat actor

## Usage

### Generating AI Threat Reports
1. Navigate to the Incidents page
2. Open an incident detail view
3. Click "Generate AI Report" button (requires editor/admin permissions)
4. Wait for the AI to generate a comprehensive threat report
5. View the report in the AI Reports page

### Managing Incidents
1. Create incidents from the Incidents page or from CVE data
2. Assign incidents to team members
3. Track progress through the Kanban board
4. Add resolution comments and notes
5. Generate AI threat reports for analysis

## Permissions

- **Viewers**: Can view incidents, threat actors, CVEs, and AI reports
- **Editors**: Can create, edit, and delete incidents, threat actors, and AI reports
- **Admins**: Full access to all features including user management

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript, Firebase Functions
- **Database**: Firestore
- **AI**: Google Gemini API
- **Authentication**: Firebase Auth
- **CVE Data**: Shodan API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.