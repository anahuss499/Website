# How to Enable Notifications on Mobile

## Quick Start (for Users)

### Step 1: Go to Test Page
Open this link on your mobile phone:
```
https://yoursite.com/test-notifications.html
```

### Step 2: Check Your Notification Permission
1. Tap the **"Check Permission"** button
2. You should see one of these messages:
   - ✅ **"Notifications are ENABLED"** → All set! Your notifications should work
   - ❌ **"Notifications are BLOCKED"** → Your browser blocked notifications. See "Unblock Notifications" below
   - ⚠️ **"Notifications not yet requested"** → Tap "Request Permission" button

### Step 3: Unblock Notifications (if blocked)

**On Android:**
1. Open browser settings
2. Go to Notifications/Permissions
3. Find "Mahmood Masjid" or this website
4. Enable notifications
5. Go back to test page and refresh

**On iPhone/iPad:**
1. Go to device Settings
2. Scroll down to Safari (or your browser)
3. Tap Notifications
4. Enable notifications for the site

### Step 4: Test It
Click the **"Test Notification (Immediate)"** button. You should see a notification appear immediately.

---

## What's Been Fixed

✅ **Better permission checking** - App now verifies notifications are actually enabled  
✅ **Improved service worker** - More reliable notification scheduling  
✅ **Debug interface** - Test page to diagnose issues  
✅ **Better logging** - You can see what's happening in real-time  

---

## Known Limitations

⚠️ **Notifications only work when app is active** (currently)
- This is a browser limitation, not a bug
- When you close the app/browser, scheduled notifications won't fire
- This is because browsers pause JavaScript when minimized

### Why?
Mobile browsers pause background JavaScript to save battery. To get notifications while the app is closed, we'd need:
- A server to send push notifications (Web Push API)
- More complex backend infrastructure
- Different implementation approach

---

## Troubleshooting

### "Service Worker not registered"
- Check your internet connection
- Refresh the page
- Try again in a few seconds

### "Notifications blocked" message
- See "Unblock Notifications" section above
- Different browsers may require different steps

### Notification doesn't appear
- Make sure app/browser tab is in foreground
- Check your device notification center (might be quiet)
- Try a test notification on the test page first

### Still not working?
- Share a screenshot of the test page with the errors
- Let us know your device model and browser name

---

## For Developers

See `NOTIFICATION_FIXES.md` in the root directory for technical details.

The test page at `/test-notifications.html` includes:
- Permission status checker
- Service worker validator
- Test notification sender
- Scheduled notification system
- Real-time debug logs

---

Last updated: January 3, 2026
