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


## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript, Firebase Functions
- **Database**: Firestore
- **AI**: Google Gemini API
- **Authentication**: Firebase Auth
- **CVE Data**: Shodan API


## License

This project is licensed under the MIT License.