# Donation Tracking & Email Reminders Guide

## Overview
Your donation system now stores complete donation information in Firebase Firestore, including user emails for sending reminders and receipts.

## What's Stored

### Donation Data Structure in Firestore

Each donation in the `donations` collection contains:

```javascript
{
  // Core donation info
  campaignId: "camp_12345" or null,  // null for general donations
  campaignTitle: "Mosque Renovation Project",
  amount: 5000,  // in PKR
  
  // Donor information
  donorName: "Ahmed Khan",
  donorEmail: "ahmed@example.com",  // ✅ Required for reminders
  donorPhone: "+92 300 1234567",
  userId: "firebase_user_id" or null,  // if logged in
  
  // Metadata
  timestamp: Firestore.Timestamp,
  status: "pending",  // pending, completed, failed
  paymentMethod: "bank_transfer",  // bank_transfer, easypaisa, jazzcash, card
  recurring: false,
  message: "Optional donor message",
  receiptSent: false,
  
  // Receipt/verification
  receiptUrl: null,  // URL to uploaded receipt (future feature)
  verifiedAt: null,
  verifiedBy: null
}
```

## Firebase Console - View Donations

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in the left menu
4. You'll see the `donations` collection
5. Click on any document to view full details

## Security Rules for Donations

Update your Firestore security rules to allow donation creation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    
    // Donations collection
    match /donations/{donationId} {
      // Anyone can create a donation (for anonymous donations)
      allow create: if true;
      
      // Users can read their own donations
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid ||
                      resource.data.donorEmail == request.auth.token.email);
      
      // Only admins can update/delete (via admin SDK)
      allow update, delete: if false;
    }
    
    // Admin-only collections
    match /admin/{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Querying Donations

### Get All Donations (Admin)
```javascript
const donations = await db.collection('donations')
  .orderBy('timestamp', 'desc')
  .get();

donations.forEach(doc => {
  const data = doc.data();
  console.log(`${data.donorName}: ${data.amount} PKR - ${data.donorEmail}`);
});
```

### Get Pending Donations
```javascript
const pending = await db.collection('donations')
  .where('status', '==', 'pending')
  .orderBy('timestamp', 'desc')
  .get();
```

### Get Donations for a Campaign
```javascript
const campaignDonations = await db.collection('donations')
  .where('campaignId', '==', 'camp_12345')
  .get();
```

### Get Donations by Email
```javascript
const userDonations = await db.collection('donations')
  .where('donorEmail', '==', 'ahmed@example.com')
  .orderBy('timestamp', 'desc')
  .get();
```

### Get Donations This Month
```javascript
const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);

const monthlyDonations = await db.collection('donations')
  .where('timestamp', '>=', startOfMonth)
  .get();
```

## Email Reminder System

### Option 1: Firebase Cloud Functions (Recommended)

Create a scheduled function to send reminders:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'contact.mahmoodmasjid@gmail.com',
    pass: 'your-app-password'  // Generate in Gmail settings
  }
});

// Send monthly donation reminders
exports.sendMonthlyReminders = functions.pubsub
  .schedule('0 9 1 * *')  // 9 AM on 1st of each month
  .timeZone('Asia/Karachi')
  .onRun(async (context) => {
    // Get all users who donated before
    const donorsSnapshot = await admin.firestore()
      .collection('donations')
      .where('status', '==', 'completed')
      .get();
    
    // Create unique list of donor emails
    const donors = new Map();
    donorsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.donorEmail && !donors.has(data.donorEmail)) {
        donors.set(data.donorEmail, {
          name: data.donorName,
          email: data.donorEmail
        });
      }
    });
    
    // Send reminder to each donor
    const promises = [];
    donors.forEach((donor) => {
      const mailOptions = {
        from: 'Mahmood Masjid <contact.mahmoodmasjid@gmail.com>',
        to: donor.email,
        subject: 'Monthly Donation Reminder - Mahmood Masjid',
        html: `
          <h2>Assalamu Alaikum ${donor.name}!</h2>
          <p>This is a gentle reminder about supporting Mahmood Masjid this month.</p>
          <p>Your previous contributions have helped us:</p>
          <ul>
            <li>Maintain our mosque facilities</li>
            <li>Support educational programs</li>
            <li>Assist community members in need</li>
          </ul>
          <p>
            <a href="https://www.mahmoodmasjid.com/donate.html" 
               style="background:#32cd32;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;">
              Donate Now
            </a>
          </p>
          <p>Jazakallahu Khairan for your continued support!</p>
          <hr>
          <small>If you wish to stop receiving these reminders, reply with "UNSUBSCRIBE"</small>
        `
      };
      
      promises.push(transporter.sendMail(mailOptions));
    });
    
    await Promise.all(promises);
    console.log(`Sent ${promises.length} reminder emails`);
  });

// Send receipt after donation
exports.sendDonationReceipt = functions.firestore
  .document('donations/{donationId}')
  .onCreate(async (snap, context) => {
    const donation = snap.data();
    
    if (!donation.donorEmail) return;
    
    const mailOptions = {
      from: 'Mahmood Masjid <contact.mahmoodmasjid@gmail.com>',
      to: donation.donorEmail,
      subject: `Donation Receipt - ${donation.amount} PKR`,
      html: `
        <h2>Jazakallahu Khairan, ${donation.donorName}!</h2>
        <p>Thank you for your generous donation to Mahmood Masjid.</p>
        
        <h3>Donation Details:</h3>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr>
            <td style="padding:8px;border:1px solid #ddd;"><strong>Amount:</strong></td>
            <td style="padding:8px;border:1px solid #ddd;">Rs ${donation.amount.toLocaleString('en-PK')}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;"><strong>Campaign:</strong></td>
            <td style="padding:8px;border:1px solid #ddd;">${donation.campaignTitle}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;"><strong>Donation ID:</strong></td>
            <td style="padding:8px;border:1px solid #ddd;">${context.params.donationId}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;"><strong>Date:</strong></td>
            <td style="padding:8px;border:1px solid #ddd;">${new Date().toLocaleDateString('en-PK')}</td>
          </tr>
        </table>
        
        <h3>Bank Transfer Details:</h3>
        <p>
          <strong>Bank:</strong> Allied Bank Limited<br>
          <strong>IBAN:</strong> PK41ABPA0010154454310012<br>
          <strong>Title:</strong> Mahmood Masjid
        </p>
        
        <p><strong>Note:</strong> Please quote Donation ID when making the transfer.</p>
        
        <p>May Allah accept your donation and grant you rewards in this life and the hereafter.</p>
        
        <hr>
        <small>Mahmood Masjid, Mahmood Abad, Gujrat, Punjab, Pakistan</small>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    // Mark receipt as sent
    await snap.ref.update({ receiptSent: true });
  });
```

**Deploy Cloud Functions:**
```bash
cd functions
npm install nodemailer
firebase deploy --only functions
```

### Option 2: Manual Email via Firebase Console

1. Export donor emails from Firestore
2. Use email service (MailChimp, SendGrid, etc.)
3. Create reminder campaign
4. Schedule monthly

### Option 3: Export to Excel for Manual Contact

Create an admin page to export donor data:

```javascript
// Export to CSV
async function exportDonors() {
  const donations = await db.collection('donations').get();
  
  const csvData = [];
  csvData.push(['Name', 'Email', 'Total Donated', 'Last Donation']);
  
  const donorMap = new Map();
  
  donations.forEach(doc => {
    const d = doc.data();
    if (!donorMap.has(d.donorEmail)) {
      donorMap.set(d.donorEmail, {
        name: d.donorName,
        email: d.donorEmail,
        total: 0,
        lastDate: null
      });
    }
    
    const donor = donorMap.get(d.donorEmail);
    donor.total += d.amount;
    if (!donor.lastDate || d.timestamp > donor.lastDate) {
      donor.lastDate = d.timestamp;
    }
  });
  
  donorMap.forEach((donor) => {
    csvData.push([
      donor.name,
      donor.email,
      donor.total,
      donor.lastDate ? donor.lastDate.toDate().toLocaleDateString() : 'N/A'
    ]);
  });
  
  // Convert to CSV and download
  const csv = csvData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'donors.csv';
  a.click();
}
```

## Email Templates

### Welcome Email (First Donation)
```
Subject: Jazakallahu Khairan for Your First Donation!

Assalamu Alaikum {name},

Welcome to the Mahmood Masjid donor community! 

Your donation of Rs {amount} has been received and will support {campaign}.

You are now part of a community working to:
✅ Maintain our beautiful mosque
✅ Educate our children in Islamic values
✅ Support families in need

We'll send you:
- Monthly impact reports
- Gentle reminders (you can opt out anytime)
- Updates on special campaigns

Jazakallahu Khairan,
Mahmood Masjid Team
```

### Monthly Reminder
```
Subject: Monthly Donation Reminder - Mahmood Masjid

Assalamu Alaikum {name},

This month, your support can help us:
🕌 {current_campaign_1}
📚 {current_campaign_2}
❤️ {current_campaign_3}

Last month, donors like you helped us raise Rs {last_month_total}!

[Donate Now Button]

May Allah reward you abundantly.
```

### Year-End Summary
```
Subject: Your 2026 Impact - Mahmood Masjid

Assalamu Alaikum {name},

Jazakallahu Khairan for your generous support this year!

Your Impact in 2026:
💰 Total Donated: Rs {total_amount}
📊 Number of Donations: {donation_count}
🎯 Campaigns Supported: {campaigns_list}

Together with {total_donors} donors, we:
✅ Completed mosque renovation
✅ Educated 50+ children
✅ Supported 100+ families

[Download Tax Receipt]

May Allah bless you in 2027!
```

## Analytics & Reports

Track donation metrics in Firestore:

```javascript
// Total donations this month
const monthStart = new Date();
monthStart.setDate(1);

const snapshot = await db.collection('donations')
  .where('timestamp', '>=', monthStart)
  .get();

let total = 0;
snapshot.forEach(doc => {
  total += doc.data().amount;
});

console.log(`This month: Rs ${total}`);
```

## Best Practices

1. **Always collect email** - Required for reminders and receipts
2. **Send immediate receipt** - Builds trust and confirms donation
3. **Monthly reminders** - Not too frequent, not forgotten
4. **Impact updates** - Show how donations are used
5. **Easy opt-out** - Respect donor preferences
6. **Secure data** - Use Firebase security rules
7. **GDPR compliance** - Allow data deletion requests

## Next Steps

1. ✅ Complete Firebase setup (see FIREBASE_SETUP.md)
2. ✅ Test donation flow on donate.html
3. ⬜ Set up Firebase Cloud Functions for emails
4. ⬜ Configure email service (Gmail/SendGrid)
5. ⬜ Create email templates
6. ⬜ Test reminder system
7. ⬜ Set up analytics dashboard
8. ⬜ Train admin on using Firebase Console

---

All donation data is now securely stored with email addresses for follow-up and reminders! 🎉
