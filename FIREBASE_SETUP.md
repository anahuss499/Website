# Firebase Setup Guide for Mahmood Masjid Website

## Overview
Your website now uses **Firebase Authentication** and **Cloud Firestore** to store real user accounts securely in the cloud.

## What's Been Implemented

### 1. **Firebase Authentication**
- Email/Password registration and login
- Google OAuth sign-in
- Secure password handling (Firebase handles encryption)
- Session persistence
- Password reset capabilities (can be added)

### 2. **Cloud Firestore Database**
User data is stored in the `users` collection with this structure:
```javascript
{
  name: "User Name",
  email: "user@example.com",
  createdAt: timestamp,
  lastLogin: timestamp,
  preferences: {
    language: "en",
    emailNotifications: true
  }
}
```

## Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `mahmood-masjid` (or your choice)
4. Disable Google Analytics (optional for now)
5. Click **"Create project"**

### Step 2: Add Web App

1. In your Firebase project, click the **Web icon** (`</>`)
2. Register app with nickname: `Mahmood Masjid Website`
3. ✅ Check **"Also set up Firebase Hosting"** (optional)
4. Click **"Register app"**
5. Copy the configuration object shown

### Step 3: Configure Your Website

1. Open `/workspaces/Website/assets/js/firebase-config.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "mahmood-masjid.firebaseapp.com",
  projectId: "mahmood-masjid",
  storageBucket: "mahmood-masjid.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### Step 4: Enable Authentication Methods

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

3. Enable **Google Sign-In**:
   - Click on "Google"
   - Toggle "Enable"
   - Enter support email: `contact.mahmoodmasjid@gmail.com`
   - Click "Save"

### Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location closest to Pakistan (e.g., `asia-south1`)
5. Click **"Enable"**

### Step 6: Configure Security Rules

1. Go to **Firestore Database** → **Rules**
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false; // Prevent deletion
    }
    
    // Admin collection (optional - for future admin features)
    match /admin/{document=**} {
      allow read, write: if false; // Only via admin SDK
    }
  }
}
```

3. Click **"Publish"**

### Step 7: Set Up Authentication Redirect URLs

1. Go to **Authentication** → **Settings**
2. Under **Authorized domains**, add:
   - `localhost` (for testing)
   - `mahmoodmasjid.com`
   - `www.mahmoodmasjid.com`
   - Your custom domain if different

## Testing

### Local Testing
1. Open your website locally
2. Go to `/login.html`
3. Try creating an account
4. Check Firebase Console → **Authentication** to see the new user
5. Check **Firestore Database** → **users** collection to see stored data

### Verify It's Working
- ✅ Sign up creates new user in Firebase Authentication
- ✅ User data appears in Firestore `users` collection
- ✅ Login works with created credentials
- ✅ Google sign-in opens popup and creates account
- ✅ Session persists after page reload

## Security Best Practices

### API Key Security
⚠️ Your Firebase API key in `firebase-config.js` is **safe to expose** in client-side code. Firebase automatically restricts it to:
- Your authorized domains
- Your security rules
- Your authentication settings

### Additional Security Measures
1. **Enable App Check** (recommended):
   - Prevents unauthorized access to your Firebase resources
   - Go to Firebase Console → App Check

2. **Set up Email Verification**:
   - Go to Authentication → Templates
   - Customize email verification template

3. **Add reCAPTCHA** to prevent bots

## Cost Estimate

Firebase **Free Tier (Spark Plan)** includes:
- 10,000 document writes/day
- 50,000 document reads/day
- 20,000 document deletes/day
- 1 GB storage
- Authentication: Unlimited users

**This is more than enough for a community mosque website!**

## Advanced Features You Can Add Later

1. **Email Verification**
```javascript
await user.sendEmailVerification();
```

2. **Password Reset**
```javascript
await auth.sendPasswordResetEmail(email);
```

3. **User Profile Pictures**
Use Firebase Storage to upload profile images

4. **Admin Dashboard**
Create admin panel to manage users and content

5. **Analytics**
Track user engagement with Firebase Analytics

## Troubleshooting

### "Firebase is not defined"
- Check that Firebase CDN scripts load before your scripts
- Look in browser console for network errors

### "Permission denied" errors
- Verify Firestore security rules are set correctly
- Ensure user is authenticated before accessing data

### Google Sign-In popup blocked
- Check browser popup blocker settings
- Ensure domain is in authorized domains list

### CORS errors
- Add your domain to Firebase authorized domains
- Check that you're using HTTPS (required for production)

## Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)

For website-specific issues:
- Email: contact.mahmoodmasjid@gmail.com

---

## Summary

Your authentication system now:
✅ Stores real user accounts in Firebase cloud
✅ Encrypts passwords automatically
✅ Supports email/password and Google sign-in
✅ Persists user sessions
✅ Scales automatically with user growth
✅ Includes professional error handling
✅ Works across all devices

**Next Steps:**
1. Complete Firebase setup following steps above
2. Test account creation and login
3. Deploy updated website
4. Monitor users in Firebase Console
