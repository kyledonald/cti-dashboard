# CTI Dashboard for SMEs - Final Year University Project

A comprehensive Cyber Threat Intelligence dashboard for SMEs to manage security incidents, track threat actors, monitor CVEs, and generate AI-powered threat summaries.

## Note

This is a university project so there will be no active development or support for this application.

## Features

### Core Functionality

- **Security Incidents Management**: Create, track, and manage security incidents with Kanban-style workflow
- **Threat Actor Intelligence**: Build up threat actor profiles
- **CVE Monitoring**: Real-time CVE data from Shodan with CVSS scoring and known exploited vulnerabilities (KEV)
- **User Management**: Role-based access control (Admin, Editor, Viewer) with organization-specific data
- **AI Summary Generation**: Generate downloadable threat summaries for any security incident

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript, Firebase Functions
- **Database**: Firestore
- **AI**: Google Gemini API (1.5 Flash)
- **Authentication**: Firebase Auth
- **CVE Data**: Shodan API

## Code Summary

The backend code consists of:

- 51 total files created or modified, including backend logic (controllers, services, middleware, models, routes)
- 14 unit test suites (containing a total of 133 mocked unit tests)
- 1 Deployment file detailing the CI/CD process
- Approximately 6600 lines of created or modified code

The React web app consists of:

- 174 manually created/modified files
- 13 web pages (including the local /testing page)
- 9 comprehensive end-to-end tests using Playwright (that run against the live Cloud functions) and mimic typical user journeys
- Approximately 14800 lines of created or modified code

In total the project comprises approximately:

- 229 files created/modified by the developer, containing a total of around 21500 lines of code.
