# Milano Relay Marathon Time Calculator - Project Plan

## Overview

This Quasar application calculates arrival times for the Milano Relay Marathon stages, supporting multiple races with configurable segments (legs). The app uses Firebase for authentication, Firestore database, and real-time updates.

## Key Features

### 1. Authentication & User Management

- **Google Login**: Users authenticate via Google using Firebase Auth
- **Email/Password Login**: Alternative authentication method
- **User Roles**:
  - Captain: Can create/manage teams, set paces, invite runners
  - Runner: Can view team data, update their own name and pace
- **Admin User**: Users with custom claims `admin: true` can manage races, appointments, FAQ, and help content

### 2. Multi-Race Support

- Multiple races can be created and managed
- Each race has configurable segments (legs)
- Segments can be `solo` (individual runner) or `group` (team segment)
- Users can belong to teams across different races

### 3. Team Management

- **Team Creation**: Captain creates team linked to a specific race
- **Runner Invitation**: Captain generates invitation codes for each solo segment
- **Team Membership**: Invited users join by entering code
- **Runner Assignment**: Runners can be assigned to segments directly or via invitation codes
- **Team Pace**: Captain sets pace for group segments

### 4. Time Calculation

- **Start Delay**: Configurable per team
- **Segment Calculations**: Each runner's arrival time calculated based on distance and pace
- **Real-time Updates**: Calculations update as data changes

### 5. Content Management (Admin)

- **Races**: Create/edit/delete races with segments
- **Appointments**: Schedule events with bilingual support
- **FAQ**: Frequently asked questions with bilingual support
- **Help**: Help content sections with bilingual support

### 6. Public Access

- **Read-only Mode**: Non-authenticated users can view race times
- **Time Table**: View calculated times without registration

## Database Schema (Firebase Firestore)

### Collections

```
users/{userId}/
  (user-specific data, managed by the app)

teams/{teamId}/
  name: string
  captainId: string
  raceId: string
  runners: array
  invitationCodes: object
  groupPaces: object
  startDelay: number
  hasCustomStartDelay: boolean

races/{raceId}/
  name: string
  location: string
  date: string
  startTime: string
  defaultStartDelay: number
  isDefault: boolean
  segments: array of {id, name, distance, type}

config/{docId}/
  (configuration documents)

appointments/{appointmentId}/
  title, titleEn, date, time, location, locationEn
  description, descriptionEn
  createdAt, updatedAt

faq/{faqId}/
  question, questionEn, answer, answerEn
  hidden, order
  createdAt, updatedAt

help/{helpId}/
  title, titleEn, body, bodyEn
  hidden, order
  createdAt, updatedAt
```

## Security Rules

See [firestore.rules](../firestore.rules) for current security rules.

Key points:

- `users`: read/write only own document
- `teams`: public read, authenticated write, delete by admin or captain
- `races`, `config`, `appointments`, `faq`, `help`: public read, admin write only

## UI Components & Pages

### Pages

1. **Login Page** - Google/email authentication
2. **Splash Page** - Initial landing
3. **Home/Index Page** - Race selection, team selection, time calculator
4. **Team Page** - Create/join/manage teams
5. **Appointments Page** - View scheduled events
6. **FAQ Page** - Frequently asked questions
7. **Help Page** - How to use the app
8. **Route Page** - Race route information
9. **Admin Page** - Manage races, appointments, FAQ, help (admin only)

### Layouts

- **Main Layout**: Header with navigation, drawer with menu
- **AuthLayout**: Simplified layout for login page

## Technical Stack

- **Frontend**: Quasar Framework (Vue 3)
- **Backend**: Firebase (Auth, Firestore)
- **Build**: Vite (via Quasar App Vite)
- **Mobile**: Capacitor (Android + iOS)
- **State**: Vue Composition API

## Deployment

- Web: Firebase Hosting or any static host
- Mobile: Google Play (Android), App Store (iOS)

## Related Documentation

- [DOCUMENTAZIONE.md](DOCUMENTAZIONE.md) - Technical documentation
- [firebase-setup.md](firebase-setup.md) - Firebase setup guide
- [CUSTOM_CLAIMS_SETUP.md](CUSTOM_CLAIMS_SETUP.md) - Admin setup guide
