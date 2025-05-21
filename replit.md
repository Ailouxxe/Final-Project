# University Online Voting System

## Overview

This is a University Online Voting System built for Pateros Technological College. The system allows students to participate in university elections through a secure online platform. The application features student registration/authentication (restricted to college domain emails), election management, candidate management, real-time voting, and result visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The system is built as a modern web application using the following architecture:

### Frontend
- **Next.js**: Serves as the full-stack React framework providing both client and server components
- **React**: Used for building interactive UI components
- **Tailwind CSS**: Utility-first CSS framework for styling

### Backend
- **Firebase**: Provides authentication, database, and real-time capabilities
- **Next.js API Routes**: Can be utilized for custom server-side functionality if needed

### Data Storage
- **Firestore**: NoSQL database storing all application data (users, elections, candidates, votes)

### Authentication
- **Firebase Authentication**: Handles user registration, login, and session management
- **Custom validation**: Ensures only @paterostechnologicalcollege.edu.ph domain emails can register

## Key Components

### Authentication System
The authentication system restricts access to legitimate students and administrators:
- Students can register with college email domain (@paterostechnologicalcollege.edu.ph)
- Admins are created manually (likely through Firebase console or seeded data)
- Protected routes ensure authenticated access to appropriate sections

### Student Dashboard
- Lists active elections
- Prevents double voting through vote tracking
- Shows confirmation after voting
- Displays voter feed for transparency

### Admin Dashboard
- Comprehensive election management (CRUD operations)
- Candidate management for each election
- Voting period configuration
- Results visualization through charts

### Real-time Components
- Voter feed shows recent voting activity
- Results update in real-time as votes come in

## Data Flow

1. **Authentication Flow**:
   - User registers/logs in → Firebase Auth validates credentials → User directed to appropriate dashboard

2. **Voting Flow**:
   - Student views active elections → Selects an election → Views candidates → Casts vote → Vote recorded in Firestore → Real-time feeds updated

3. **Admin Management Flow**:
   - Admin creates/edits election → Configures candidates → Monitors results → Views analytics

## External Dependencies

### Firebase Services
- **Authentication**: User management and session handling
- **Firestore**: Database for all application data
- **Real-time updates**: For live voter feed and results

### UI Libraries
- **Chart.js**: For visualizing election results
- **Tailwind CSS plugins**: For enhanced UI capabilities (typography, forms, etc.)

## Deployment Strategy

The application is configured to run on Replit with specific workflows:

1. **Development**:
   - Uses `npm run dev` command to run the Next.js development server
   - Listens on port 5000

2. **Production**:
   - Can be deployed to Vercel or similar platforms that support Next.js
   - Environment variables should be configured for production Firebase instances

## Database Schema

The application uses Firestore with the following collections:

1. **users**:
   - User profile information
   - Authentication details
   - Role information (admin/student)

2. **elections**:
   - Election details (title, description)
   - Time boundaries (startDate, endDate)
   - Status information

3. **candidates**:
   - Personal information (name, department)
   - Election association (electionId)
   - Position and manifesto

4. **votes**:
   - Vote records (studentId, candidateId, electionId)
   - Timestamp information
   - Anonymous to maintain vote secrecy

5. **voterFeed**:
   - Anonymous voting activity for transparency
   - Timestamps for real-time display

## Getting Started

To run the application:

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. The application will be available at port 5000

## Next Steps for Development

1. Complete the implementation of unfinished components
2. Add comprehensive test coverage
3. Implement analytics for voting patterns
4. Enhance security measures for vote integrity
5. Add accessibility features