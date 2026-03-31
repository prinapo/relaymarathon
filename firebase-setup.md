# Firebase Setup - Already Configured

Your Firebase project "milano-relay-marathon" is already set up with the web app "Milano Relay Marathon Timing". The configuration in `.env` matches your existing setup.

## Confirm Current Setup
1. **Authentication**: Google provider should be enabled
2. **Firestore**: Database should exist
3. **Security Rules**: Update to the rules provided below if not already set
4. **Admin User**: giovanni.prinetti@gmail.com should have access

## Firestore Security Rules
Go to Firestore > Rules and ensure these rules are set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Teams: public read for displaying times, write only for captains
    match /teams/{teamId} {
      allow read: if true;  // Public read for time table
      allow create: if request.auth != null && request.auth.uid == request.resource.data.captainId;
      allow update, delete: if request.auth != null && request.auth.uid == get(/databases/$(database)/documents/teams/$(teamId)).data.captainId;
    }
    
    // Config: public read, write only for admin
    match /config/distances {
      allow read: if true;  // Public read for calculations
      allow write: if request.auth != null && request.auth.token.email == 'giovanni.prinetti@gmail.com';
    }

    match /help/{helpId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## Set Initial Distances
After completing the setup above, login to the app as admin (giovanni.prinetti@gmail.com) and use the Admin panel to set the actual race distances. The app will create the `config/distances` document automatically.

Default values for testing:
- Leg 1: 10000 meters (10km)
- Leg 2: 10000 meters (10km)  
- Leg 3: 10000 meters (10km)
- Leg 4: 5000 meters (to reconnection)
- Leg 5: 500 meters (final team segment)

Adjust these values in the Admin panel according to the actual Milano Relay Marathon distances.