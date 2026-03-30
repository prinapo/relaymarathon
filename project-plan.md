# Milano Relay Marathon Time Calculator - Project Plan

## Overview
This Quasar application calculates arrival times for the Milano Relay Marathon stages, considering start delays and individual runner paces. There are 4 main legs plus a final team segment where all runners finish together. The app uses Firebase for authentication, database, and real-time updates. Only Quasar primitive components are used for the UI.

## Key Features

### 1. Authentication & User Management
- **Google Login**: Users authenticate via Google using Firebase Auth
- **User Roles**: 
  - Captain: Can create/manage teams, set paces, invite runners
  - Runner: Can view team data, update their own pace
- **Admin User**: giovanni.prinetti@gmail.com has admin privileges to set global distances

### 2. Team Management
- **Team Creation**: Captain creates team with name and auto-generated ID
- **Runner Invitation**: Captain generates invitation codes linked to team and leg (1-4)
- **Team Membership**: Invited users join by entering code, auto-populated with Google name
- **Runner Management**: Captain can remove/add runners, change positions
- **Team Pace**: Captain sets pace for final together segment

### 3. Distance & Pace Configuration
- **Global Distances**: Admin sets distances for 4 legs + final team segment via Firebase
- **Team Paces**: Captain sets paces for each runner on legs 1-4, and team pace for final segment
- **Individual Pace Updates**: Runners can update their own pace

### 4. Time Calculation
- **Start Delay**: Only first runner has configurable start delay
- **Runner Transitions**: Each subsequent runner starts immediately when previous runner arrives
- **Stage Calculations**: 
  - Runner 1: Time = Distance1 / Pace1 + Delay
  - Runner 2-4: Start at previous arrival, Time = PreviousArrival + Distance / Pace
  - Final Segment: Starts at reconnection arrival, Time = ReconnectionArrival + Distance5 / TeamPace
- **Real-time Updates**: Calculations update as data changes

### 5. Public Access
- **Time Table**: View calculated times without registration
- **Read-only Mode**: Non-authenticated users see public table

## Database Schema (Firebase Firestore)

### Collections
```
users/
  {userId}/
    email: string
    name: string
    isCaptain: boolean
    teams: [teamId]

teams/
  {teamId}/
    name: string
    captainId: string
    invitationCodes: {
      leg1: string,
      leg2: string,
      leg3: string,
      leg4: string
    }
    teamPace: number, // min/km for final segment
    runners: [
      {
        id: string,
        name: string,
        leg: number, // 1-4
        pace: number, // min/km
        startDelay: number // minutes
      }
    ]

config/
  distances: {
    leg1: number,
    leg2: number,
    leg3: number,
    leg4: number, // to reconnection point
    leg5: number  // final together segment (400-500m)
  }
```

## UI Components & Pages

### Layout
- **Main Layout**: q-layout with header, drawer, page container
- **Header**: q-header with title, login/logout buttons
- **Drawer**: q-drawer with navigation (Dashboard, Team, Settings)

### Pages
1. **Login Page**
   - q-card with Google login button
   - q-btn for Google auth

2. **Dashboard**
   - q-table showing calculated times for all teams
   - q-select to filter by team
   - Public access allowed

3. **Team Management** (Captain only)
   - q-input for team name
   - q-btn to create team
   - q-list of current runners
   - q-dialog for inviting runners
   - q-input for invitation codes

4. **Runner Profile**
   - q-input for pace update
   - q-input for start delay
   - q-btn to save changes

5. **Admin Settings** (Admin only)
   - q-input fields for 5 distances (legs 1-4 + final segment)
   - q-btn to save to Firebase

### Components
- **TimeCalculator**: q-card displaying calculated times including reconnection point and final finish
- **RunnerCard**: q-card for each runner with pace/delay inputs
- **InvitationDialog**: q-dialog with code generation/display
- **PublicTable**: q-table for non-authenticated users

## Implementation Plan

### Phase 1: Setup & Authentication
- Configure Firebase Auth
- Implement Google login
- Create user profile management
- Set up routing with Vue Router

### Phase 2: Team Management
- Team creation for captains
- Invitation code generation
- Runner joining via codes
- Basic team CRUD operations

### Phase 3: Pace & Distance Management
- Admin distance configuration
- Captain pace setting
- Runner self-pace updates
- Firebase real-time listeners

### Phase 4: Time Calculations
- Implement calculation logic
- Real-time updates
- Public table display
- Export/share functionality

### Phase 5: UI Polish & Testing
- Responsive design
- Error handling
- Unit tests
- Performance optimization

## Technical Stack
- **Frontend**: Quasar Framework (Vue 3)
- **Backend**: Firebase (Auth, Firestore)
- **Build**: Vite
- **Styling**: Quasar's built-in styling
- **State**: Vue Composition API + Pinia (if needed)

## Security Considerations
- Firebase security rules for data access
- Admin-only distance editing
- Captain-only team management
- User data privacy compliance

## Deployment
- Firebase Hosting for web deployment
- Environment variables for Firebase config
- CI/CD with GitHub Actions