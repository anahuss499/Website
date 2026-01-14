# Donation Platform - Data Storage Guide

## 📍 Where is the Information Stored?

### **Current Status: DEMO MODE (Browser LocalStorage)**

The donation platform is currently running in **DEMO MODE** using your browser's **LocalStorage** for temporary data storage. This is a client-side solution for testing and demonstration purposes.

---

## 🗄️ Current Data Storage (LocalStorage)

### What is LocalStorage?
LocalStorage is a web browser feature that stores data locally on the user's computer. It's like a small database inside your browser.

### What Data is Stored?

#### 1. **Campaigns** (Key: `mm_campaigns`)
```javascript
{
  id: "camp_1234567890_abc123",
  title: "Mosque Renovation Project",
  description: "Help us renovate and expand our mosque...",
  goal: 500000,
  raised: 125000,
  donors: 45,
  category: "maintenance",
  deadline: "2026-06-30",
  createdAt: "2026-01-13T10:30:00.000Z",
  createdBy: "Admin",
  status: "active"
}
```

#### 2. **Donations** (Key: `mm_donations`)
```javascript
{
  id: "don_1234567890",
  campaignId: "camp_1234567890_abc123", // or null for general donations
  amount: 5000,
  name: "John Doe",
  email: "john@example.com",
  phone: "+92-300-1234567",
  message: "May Allah accept this donation",
  timestamp: "2026-01-13T10:30:00.000Z",
  status: "pending" // pending, completed, failed
}
```

#### 3. **Statistics** (Key: `mm_stats`)
```javascript
{
  totalRaised: 368500,
  totalDonors: 155,
  activeCampaigns: 3
}
```

### How to View Your Data?

**Option 1: Browser Developer Tools**
1. Open your browser (Chrome, Firefox, Edge)
2. Press `F12` or `Right-click → Inspect`
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Click on **Local Storage** → `https://www.mahmoodmasjid.com`
5. You'll see keys: `mm_campaigns`, `mm_donations`, `mm_stats`

**Option 2: JavaScript Console**
```javascript
// View all campaigns
console.log(JSON.parse(localStorage.getItem('mm_campaigns')));

// View all donations
console.log(JSON.parse(localStorage.getItem('mm_donations')));

// View stats
console.log(JSON.parse(localStorage.getItem('mm_stats')));
```

### ⚠️ Limitations of LocalStorage

1. **Browser-Specific**: Data only exists in the browser where it was created
2. **Not Permanent**: Clearing browser data deletes everything
3. **Not Shared**: Other users can't see your campaigns or donations
4. **No Backup**: If you lose your browser data, it's gone forever
5. **Limited Size**: Maximum ~5-10MB of data
6. **Security**: Data is stored in plain text (not encrypted)
7. **No Real Payments**: This is demo mode - no actual money is processed

---

## 🚀 Production Data Storage (For Real Website)

To make this a real donation platform, you need a **backend server** and **database**. Here's what you should implement:

### Recommended Technology Stack

#### **Backend Options:**

**Option 1: Node.js + Express**
```
Technology Stack:
├── Backend: Node.js + Express.js
├── Database: PostgreSQL or MongoDB
├── Authentication: JWT (JSON Web Tokens)
├── Payment Gateway: Stripe / PayPal / JazzCash
└── Email Service: SendGrid / AWS SES
```

**Option 2: Django + Python**
```
Technology Stack:
├── Backend: Django + Django REST Framework
├── Database: PostgreSQL
├── Authentication: Django Auth + JWT
├── Payment Gateway: Stripe / PayPal / EasyPaisa
└── Email Service: SendGrid / AWS SES
```

---

## 🗃️ Database Schema (Production)

### PostgreSQL Database Structure

#### **Table 1: users**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user', -- user, admin, moderator
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table 2: campaigns**
```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal DECIMAL(12,2) NOT NULL,
    raised DECIMAL(12,2) DEFAULT 0,
    donors INTEGER DEFAULT 0,
    category VARCHAR(50),
    deadline DATE,
    image_url VARCHAR(500),
    created_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table 3: donations**
```sql
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(12,2) NOT NULL,
    donor_name VARCHAR(255),
    donor_email VARCHAR(255),
    donor_phone VARCHAR(50),
    message TEXT,
    payment_method VARCHAR(50), -- bank_transfer, stripe, paypal, jazzcash
    payment_id VARCHAR(255), -- transaction ID from payment gateway
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    receipt_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Table 4: transactions**
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID REFERENCES donations(id),
    gateway VARCHAR(50), -- stripe, paypal, jazzcash, bank
    gateway_transaction_id VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    status VARCHAR(20), -- pending, success, failed
    gateway_response JSONB, -- Store full gateway response
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Backend API Endpoints (Production)

### Authentication Endpoints
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login and get JWT token
POST   /api/auth/logout          - Logout user
GET    /api/auth/me              - Get current user info
```

### Campaign Endpoints
```
GET    /api/campaigns            - List all active campaigns
GET    /api/campaigns/:id        - Get single campaign details
POST   /api/campaigns            - Create new campaign (authenticated)
PUT    /api/campaigns/:id        - Update campaign (creator/admin only)
DELETE /api/campaigns/:id        - Delete campaign (creator/admin only)
GET    /api/campaigns/:id/donations - Get campaign donations
```

### Donation Endpoints
```
POST   /api/donations            - Create new donation
GET    /api/donations/:id        - Get donation details
GET    /api/donations/my         - Get user's donation history (authenticated)
POST   /api/donations/:id/verify - Verify bank transfer (admin only)
```

### Payment Gateway Endpoints
```
POST   /api/payments/stripe/create-intent      - Create Stripe payment
POST   /api/payments/stripe/webhook           - Stripe webhook
POST   /api/payments/paypal/create-order      - Create PayPal order
POST   /api/payments/paypal/webhook           - PayPal webhook
POST   /api/payments/jazzcash/initiate        - Initiate JazzCash payment
POST   /api/payments/jazzcash/callback        - JazzCash callback
```

### Statistics Endpoints
```
GET    /api/stats/overall        - Get overall donation stats
GET    /api/stats/campaigns/:id  - Get campaign-specific stats
```

---

## 💳 Payment Gateway Integration

### Recommended Payment Providers for Pakistan:

#### **1. International Payments**
- **Stripe** - Credit/Debit cards worldwide
  - Website: https://stripe.com
  - Fees: ~2.9% + $0.30 per transaction
  
- **PayPal** - Global payment processor
  - Website: https://paypal.com
  - Fees: ~3.4% + fixed fee

#### **2. Local Pakistan Payments**
- **JazzCash** - Mobile wallet payments
  - Website: https://www.jazzcash.com.pk/
  - Popular in Pakistan
  
- **EasyPaisa** - Mobile wallet payments
  - Website: https://easypaisa.com.pk/
  - Very popular in Pakistan

- **Bank Transfers** - Direct IBAN transfers
  - Current IBAN: PK41ABPA0010154454310012
  - Manual verification required

---

## 📧 Email Notifications (Production)

### What Emails to Send:

1. **Donor Confirmation Email**
   - Thank you message
   - Donation receipt
   - Tax deduction certificate (if applicable)

2. **Campaign Creator Notifications**
   - New donation received
   - Milestone reached (25%, 50%, 75%, 100%)
   - Campaign deadline approaching

3. **Admin Notifications**
   - New campaign created (for approval)
   - Large donations (>Rs 50,000)
   - Failed payments

### Email Service Providers:
- **SendGrid** - 100 emails/day free
- **AWS SES** - Very cheap, reliable
- **Mailgun** - Good for developers
- **Postmark** - Excellent deliverability

---

## 🔒 Security Considerations

### Must Implement:

1. **HTTPS Only** - Never use HTTP for donations
2. **Input Validation** - Sanitize all user inputs
3. **SQL Injection Prevention** - Use parameterized queries
4. **XSS Protection** - Escape all outputs
5. **CSRF Tokens** - Protect form submissions
6. **Rate Limiting** - Prevent spam/abuse
7. **Password Hashing** - Use bcrypt (12+ rounds)
8. **JWT Security** - Short expiry, secure storage
9. **PCI Compliance** - For credit card processing
10. **Data Encryption** - Encrypt sensitive data at rest

---

## 🚀 Deployment & Hosting

### Recommended Hosting Providers:

#### **Backend + Database:**
- **DigitalOcean** - $6-12/month for droplet
- **AWS (Amazon Web Services)** - Scalable, pay-as-you-go
- **Heroku** - Easy deployment, free tier available
- **Vercel** - Great for Next.js applications
- **Railway** - Simple, modern hosting

#### **Frontend (Static Files):**
- **Vercel** - Free for static sites
- **Netlify** - Free with good features
- **GitHub Pages** - Free (current setup)
- **Cloudflare Pages** - Free + fast CDN

#### **Database Hosting:**
- **DigitalOcean Managed PostgreSQL** - $15/month
- **AWS RDS** - Managed database service
- **MongoDB Atlas** - Free tier available
- **Supabase** - PostgreSQL + Auth + Storage

---

## 📊 Data Migration Plan

### Moving from LocalStorage to Production:

1. **Export Current Demo Data**
   ```javascript
   // Run in browser console
   const campaigns = localStorage.getItem('mm_campaigns');
   const donations = localStorage.getItem('mm_donations');
   
   // Download as JSON files
   const blob = new Blob([campaigns], {type: 'application/json'});
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = 'campaigns.json';
   a.click();
   ```

2. **Import to Production Database**
   ```sql
   -- Import JSON to PostgreSQL
   COPY campaigns(id, title, description, goal, raised, donors, category, deadline, created_at, status)
   FROM '/path/to/campaigns.json'
   WITH (FORMAT json);
   ```

---

## 📝 Implementation Checklist

### Phase 1: Backend Setup (2-3 weeks)
- [ ] Choose tech stack (Node.js/Django)
- [ ] Setup development environment
- [ ] Create database schema
- [ ] Implement user authentication
- [ ] Build REST API endpoints
- [ ] Add input validation
- [ ] Implement security measures
- [ ] Write unit tests

### Phase 2: Payment Integration (1-2 weeks)
- [ ] Register with payment gateways
- [ ] Implement Stripe/PayPal SDK
- [ ] Setup local payment methods (JazzCash/EasyPaisa)
- [ ] Create payment webhooks
- [ ] Test payment flows
- [ ] Handle payment failures
- [ ] Generate receipts

### Phase 3: Frontend Updates (1 week)
- [ ] Replace localStorage with API calls
- [ ] Add authentication UI (login/register)
- [ ] Implement payment forms
- [ ] Add error handling
- [ ] Show payment status
- [ ] Display receipts

### Phase 4: Email & Notifications (1 week)
- [ ] Setup email service (SendGrid/SES)
- [ ] Design email templates
- [ ] Implement donation confirmations
- [ ] Add campaign notifications
- [ ] Setup admin alerts

### Phase 5: Testing & Deployment (1-2 weeks)
- [ ] Test all payment methods
- [ ] Security audit
- [ ] Load testing
- [ ] Setup production environment
- [ ] Configure domain & SSL
- [ ] Deploy backend & database
- [ ] Update frontend API URLs
- [ ] Monitor & fix issues

---

## 💰 Estimated Costs (Monthly)

### Minimum Setup:
- **Hosting**: $10-15 (DigitalOcean droplet)
- **Database**: $15 (Managed PostgreSQL)
- **Domain**: $1-2 (already have .com)
- **SSL**: Free (Let's Encrypt)
- **Email**: Free-$10 (SendGrid/SES)
- **Payment Fees**: ~3% per transaction
- **Total**: ~$30-40/month + transaction fees

### Recommended Setup:
- **Backend Hosting**: $12 (DigitalOcean)
- **Database**: $15 (Managed DB)
- **CDN**: Free (Cloudflare)
- **Email Service**: $15 (SendGrid)
- **Backup Storage**: $5 (AWS S3)
- **Monitoring**: Free (UptimeRobot)
- **Total**: ~$50/month + transaction fees

---

## 🆘 Getting Help

### Where to Find Developers:
1. **Upwork** - Hire freelancers
2. **Fiverr** - Quick projects
3. **Freelancer.com** - Pakistani developers
4. **Local Universities** - CS students
5. **GitHub** - Open source contributors

### What to Ask For:
"I need a backend developer to build a donation platform API with:
- Node.js + Express + PostgreSQL
- User authentication (JWT)
- Campaign management CRUD
- Stripe/PayPal/JazzCash integration
- Email notifications
- Admin dashboard"

**Budget**: $500-2000 depending on complexity

---

## 📚 Additional Resources

### Tutorials:
- **Stripe Integration**: https://stripe.com/docs
- **PayPal Integration**: https://developer.paypal.com
- **Node.js REST API**: https://nodejs.org/en/docs
- **PostgreSQL Basics**: https://www.postgresql.org/docs

### Code Examples:
All integration code examples are included in:
- `/workspaces/Website/assets/js/donate.js` (lines 360-500)
- See the comments section starting with "Backend Integration Guide"

---

## ✅ Current Demo Features

### What Works Now:
✅ Campaign creation and display
✅ Donation amount selection
✅ Progress tracking
✅ Campaign sharing
✅ Statistics display
✅ Bilingual support (English/Urdu)
✅ Responsive design
✅ Bank account details display

### What Requires Backend:
❌ Real payment processing
❌ User accounts & authentication
❌ Permanent data storage
❌ Email notifications
❌ Receipt generation
❌ Admin moderation
❌ Multi-user access
❌ Payment verification

---

## 📞 Questions?

If you need help implementing the production version, you can:

1. **Hire a Developer**: Budget $500-2000
2. **Use a Platform**: GoFundMe, LaunchGood, or Ketto
3. **Keep Demo Mode**: For internal mosque use only
4. **Gradual Migration**: Start with backend, add payments later

**Remember**: The current demo is perfect for testing and understanding how the system works. For real donations with actual money, you MUST implement a proper backend with security and payment gateway integration.

---

*Last Updated: January 13, 2026*
*Website: https://www.mahmoodmasjid.com*
*Contact: contact.mahmoodmasjid@gmail.com*
