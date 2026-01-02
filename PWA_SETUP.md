# Progressive Web App (PWA) Setup Guide

Your website has been converted into a Progressive Web App that users can install as a native application with daily notification support!

## Features Implemented

✅ **Installable App**
- Users can install the website on their phone (Android/iOS) or desktop
- Appears as a native app with your brand colors and logo

✅ **Daily Notifications**
- Automatic reminders for Quran reading (default: 8:00 AM)
- Automatic reminders for Durood recitation (default: 6:00 PM)
- Users can customize notification times

✅ **Offline Support**
- Service Worker caches essential files
- Users can access the app even without internet

✅ **Customizable Settings**
- Users can enable/disable notifications
- Can set custom reminder times

## What Was Added

1. **manifest.json** - Makes the site installable
2. **service-worker.js** - Handles offline functionality and push notifications
3. **assets/js/pwa.js** - PWA initialization and notification management
4. Updated all HTML files with manifest links and PWA script references

## How Users Install the App

### On Android/iOS:
1. Open the website in their browser
2. They'll see a prompt: "Add to Home Screen" or install button
3. Click to install as an app

### On Desktop (Chrome/Edge):
1. Open the website
2. Click the address bar's "Install" icon
3. App opens in a window without browser UI

## How to Configure Notifications

The default notification times are:
- **Quran Reading**: 8:00 AM
- **Duroor Recitation**: 6:00 PM

### To Change Times:

Edit `/assets/js/pwa.js` and find the `scheduleDefaultNotifications()` function:

```javascript
const notifications = [
  {
    title: 'Daily Quran Reading',
    body: 'Time to read and reflect on the Quran',
    time: '08:00' // Change this to HH:MM format
  },
  {
    title: 'Durood on Prophet Muhammad',
    body: 'Send blessings upon the Prophet Muhammad',
    time: '18:00' // Change this to HH:MM format
  }
];
```

## Important: HTTPS Required

PWAs require HTTPS to work. Make sure your website is served over HTTPS (not HTTP).

### Check your deployment:
- ✅ If deployed on GitHub Pages, Vercel, Netlify, etc., you get HTTPS automatically
- ❌ If self-hosted, configure HTTPS with SSL/TLS certificates

## Testing Locally

For local testing with HTTPS:
```bash
# Using Python 3.7+
python -m http.server --bind 127.0.0.1 8443
```

Or use a tool like:
- [localhost.run](https://localhost.run/)
- [ngrok](https://ngrok.com/)

## Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome  | ✅      | ✅     |
| Edge    | ✅      | ✅     |
| Firefox | ⚠️      | ❌     |
| Safari  | ⚠️      | ⚠️     |

*Note: Firefox and Safari have limited PWA support*

## Future Enhancements

You can extend this with:

1. **Server-side Push Notifications**
   - Integrate with services like Firebase Cloud Messaging (FCM)
   - Send notifications even when the app is closed

2. **User Preference Settings Page**
   - Allow users to customize notification times via UI
   - Store preferences in localStorage

3. **Multiple Notification Types**
   - Add reminders for specific Surahs
   - Prayer time alerts
   - Islamic calendar events

4. **Sync Functionality**
   - Sync user progress across devices
   - Store reading history

## Troubleshooting

**Issue**: Notifications not showing
- **Solution**: Check browser notification permissions
- Go to Settings → Notifications → Your app → Allow notifications

**Issue**: App doesn't appear installable
- **Solution**: Ensure HTTPS is enabled
- Check browser console for service worker errors

**Issue**: Offline functionality not working
- **Solution**: Clear browser cache and reload
- Service Worker takes ~5 minutes to fully activate

## Questions?

For more info on PWA development, see:
- [MDN Web Docs - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
