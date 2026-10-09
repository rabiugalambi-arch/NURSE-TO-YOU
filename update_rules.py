import sys

content = """rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    match /admins/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /providers/{providerId} {
      allow read: if request.auth != null;
      allow update: if isAdmin() || 
        (request.auth != null && request.auth.uid == providerId && request.resource.data.get('applicationStatus', '') != 'approved' && request.resource.data.get('verified', false) != true) || 
        (request.auth != null && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isBusy', 'currentBookingId']));
      allow create, delete: if isAdmin() || (request.auth != null && request.auth.uid == providerId);
    }
    
    match /providerApplications/{providerId} {
      allow read: if isAdmin() || (request.auth != null && request.auth.uid == providerId);
      allow update: if isAdmin() || (request.auth != null && request.auth.uid == providerId && request.resource.data.get('applicationStatus', '') != 'approved');
      allow create: if isAdmin() || (request.auth != null && request.auth.uid == providerId);
      allow delete: if isAdmin();
    }

    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
    }

    match /services/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
"""

open('firestore.rules', 'w').write(content)
print("Rules updated.")
