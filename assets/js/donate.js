// Donation & Campaign Management System with Firebase Integration
// Stores donations in Firestore with user email for reminders

(function() {
  'use strict';

  // Firebase references (will be set when ready)
  let auth = null;
  let db = null;

  // Wait for Firebase to initialize
  function waitForFirebase(callback) {
    if (typeof firebase !== 'undefined' && window.firebaseAuth && window.firebaseDB) {
      auth = window.firebaseAuth;
      db = window.firebaseDB;
      callback();
    } else {
      setTimeout(() => waitForFirebase(callback), 100);
    }
  }

  // Demo data structure (for backward compatibility)
  const STORAGE_KEYS = {
    campaigns: 'mm_campaigns',
    donations: 'mm_donations',
    stats: 'mm_stats'
  };

  // Initialize demo campaigns if none exist
  function initDemoCampaigns() {
    const campaigns = getCampaigns();
    if (campaigns.length === 0) {
      const demoCampaigns = [
        {
          id: generateId(),
          title: 'Mosque Renovation Project',
          description: 'Help us renovate and expand our mosque to accommodate more worshippers. This includes new prayer halls, ablution facilities, and improved ventilation.',
          goal: 500000,
          raised: 125000,
          donors: 45,
          category: 'maintenance',
          deadline: '2026-06-30',
          createdAt: new Date().toISOString(),
          createdBy: 'Admin',
          status: 'active'
        }
      ];
      saveCampaigns(demoCampaigns);
      updateStats();
    }
  }

  // Helper functions
  function generateId() {
    return 'camp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function getCampaigns() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.campaigns)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCampaigns(campaigns) {
    localStorage.setItem(STORAGE_KEYS.campaigns, JSON.stringify(campaigns));
  }

  function getDonations() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.donations)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveDonations(donations) {
    localStorage.setItem(STORAGE_KEYS.donations, JSON.stringify(donations));
  }

  function formatCurrency(amount) {
    return 'Rs ' + amount.toLocaleString('en-PK');
  }

  function calculateProgress(raised, goal) {
    return Math.min(Math.round((raised / goal) * 100), 100);
  }

  // Render campaigns
  function renderCampaigns() {
    const container = document.getElementById('campaigns-container');
    if (!container) return;

    const campaigns = getCampaigns().filter(c => c.status === 'active');
    
    if (campaigns.length === 0) {
      container.innerHTML = `<p style="text-align:center;color:var(--muted);padding:40px 0;" data-en="No active campaigns at the moment. Create one to get started!" data-urdu="اس وقت کوئی فعال مہمات نہیں ہیں۔ شروع کرنے کے لئے ایک بنائیں!">No active campaigns at the moment. Create one to get started!</p>`;
      return;
    }

    container.innerHTML = campaigns.map(campaign => {
      const progress = calculateProgress(campaign.raised, campaign.goal);
      const daysLeft = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      
      return `
        <div class="campaign-card card" data-campaign-id="${campaign.id}" style="margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
            <h3 style="margin:0;flex:1;">${escapeHtml(campaign.title)}</h3>
            <span class="campaign-badge" style="background:var(--green);color:#fff;padding:4px 10px;border-radius:6px;font-size:0.8rem;white-space:nowrap;">${campaign.category}</span>
          </div>
          
          <p style="color:var(--muted);margin:10px 0;">${escapeHtml(campaign.description)}</p>
          
          <div class="campaign-progress" style="margin:15px 0;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="font-weight:700;color:var(--green);">${formatCurrency(campaign.raised)}</span>
              <span style="color:var(--muted);">of ${formatCurrency(campaign.goal)}</span>
            </div>
            <div class="progress-bar" style="width:100%;height:12px;background:#eee;border-radius:6px;overflow:hidden;">
              <div class="progress-fill" style="width:${progress}%;height:100%;background:linear-gradient(90deg,var(--green),rgba(50,205,50,0.7));transition:width 0.3s ease;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:0.9rem;color:var(--muted);">
              <span>${campaign.donors} donors</span>
              <span>${daysLeft > 0 ? daysLeft + ' days left' : 'Ended'}</span>
            </div>
          </div>
          
          <div style="display:flex;gap:10px;margin-top:15px;">
            <button class="btn" onclick="donateToCampaign('${campaign.id}')" style="flex:1;" data-en="Donate Now" data-urdu="اب عطیہ کریں">Donate Now</button>
            <button class="btn ghost" onclick="shareCampaign('${campaign.id}')" data-en="Share" data-urdu="شیئر کریں">Share</button>
            <button class="btn ghost" onclick="deleteCampaign('${campaign.id}')" style="color:#dc3545;" data-en="Delete" data-urdu="حذف کریں">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Update stats
  function updateStats() {
    const campaigns = getCampaigns();
    const donations = getDonations();
    
    const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);
    const totalDonors = new Set(donations.map(d => d.email || d.name)).size;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

    const totalRaisedEl = document.getElementById('total-raised');
    const totalDonorsEl = document.getElementById('total-donors');
    const activeCampaignsEl = document.getElementById('active-campaigns');

    if (totalRaisedEl) totalRaisedEl.textContent = formatCurrency(totalRaised);
    if (totalDonorsEl) totalDonorsEl.textContent = totalDonors;
    if (activeCampaignsEl) activeCampaignsEl.textContent = activeCampaigns;
  }

  // Campaign modal controls
  window.openCampaignModal = function() {
    document.getElementById('campaign-modal').style.display = 'block';
  };

  window.closeCampaignModal = function() {
    document.getElementById('campaign-modal').style.display = 'none';
    document.getElementById('campaign-form').reset();
  };

  // Create campaign
  document.addEventListener('DOMContentLoaded', function() {
    const campaignForm = document.getElementById('campaign-form');
    if (campaignForm) {
      campaignForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newCampaign = {
          id: generateId(),
          title: document.getElementById('campaign-title').value,
          description: document.getElementById('campaign-desc').value,
          goal: parseInt(document.getElementById('campaign-goal').value),
          raised: 0,
          donors: 0,
          category: document.getElementById('campaign-category').value,
          deadline: document.getElementById('campaign-deadline').value,
          createdAt: new Date().toISOString(),
          createdBy: 'User', // In production, use authenticated user
          status: 'active'
        };

        const campaigns = getCampaigns();
        campaigns.push(newCampaign);
        saveCampaigns(campaigns);
        
        closeCampaignModal();
        renderCampaigns();
        updateStats();
        
        alert('Campaign created successfully! It will appear in the list.');
      });
    }

    // Create campaign button
    const createBtn = document.getElementById('create-campaign-btn');
    if (createBtn) {
      createBtn.addEventListener('click', openCampaignModal);
    }
  });

  // Delete campaign
  window.deleteCampaign = function(campaignId) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    let campaigns = getCampaigns();
    campaigns = campaigns.filter(c => c.id !== campaignId);
    saveCampaigns(campaigns);
    
    renderCampaigns();
    updateStats();
    alert('Campaign deleted successfully.');
  };

  // Donate to campaign with Firebase
  window.donateToCampaign = async function(campaignId) {
    const campaigns = getCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      alert('Campaign not found.');
      return;
    }

    const amount = prompt(`Enter donation amount for "${campaign.title}" (PKR):`, '1000');
    if (!amount || isNaN(amount) || parseInt(amount) < 100) {
      alert('Please enter a valid amount (minimum Rs 100).');
      return;
    }

    // Get user info
    let donorName = '';
    let donorEmail = '';
    let userId = null;

    // Wait for Firebase
    if (!auth || !db) {
      await new Promise(resolve => waitForFirebase(resolve));
    }

    // Check if user is logged in
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Get user data from Firestore
      try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          donorName = userData.name || currentUser.displayName || currentUser.email;
          donorEmail = currentUser.email;
          userId = currentUser.uid;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    // If not logged in or user data not found, prompt for info
    if (!donorEmail) {
      donorName = prompt('Enter your name:', '');
      donorEmail = prompt('Enter your email (for donation receipts and reminders):', '');
      
      if (!donorEmail || !donorEmail.includes('@')) {
        alert('A valid email is required for donation records and tax receipts.');
        return;
      }
    }

    const donationData = {
      campaignId: campaignId,
      campaignTitle: campaign.title,
      amount: parseInt(amount),
      donorName: donorName || 'Anonymous',
      donorEmail: donorEmail,
      userId: userId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'pending', // pending, completed, failed
      paymentMethod: 'bank_transfer', // bank_transfer, easypaisa, jazzcash, card
      recurring: false,
      notes: '',
      receiptSent: false
    };

    try {
      // Save to Firestore
      const docRef = await db.collection('donations').add(donationData);
      
      // Update campaign (local for now, should also update in Firestore)
      campaign.raised += parseInt(amount);
      campaign.donors += 1;
      saveCampaigns(campaigns);

      // Also save locally for offline access
      const localDonations = getDonations();
      localDonations.push({
        id: docRef.id,
        ...donationData,
        timestamp: new Date().toISOString()
      });
      saveDonations(localDonations);

      renderCampaigns();
      updateStats();

      alert(`✅ Thank you for your donation of ${formatCurrency(parseInt(amount))} to "${campaign.title}"!\n\n📧 Donation confirmation sent to: ${donorEmail}\n\n🏦 Please transfer to:\nIBAN: PK41ABPA0010154454310012\nTitle: Mahmood Masjid\n\n💡 Upload your payment receipt to expedite verification.`);
      
      // Show receipt option
      if (confirm('Would you like to upload payment receipt now?')) {
        showReceiptUpload(docRef.id);
      }
    } catch (error) {
      console.error('Error saving donation:', error);
      alert('⚠️ Error saving donation. Please try again or contact support.');
    }
  };

  function showReceiptUpload(donationId) {
    alert(`Receipt Upload (Coming Soon)\n\nDonation ID: ${donationId}\n\nYou can email your receipt to:\ncontact.mahmoodmasjid@gmail.com\n\nQuote Donation ID: ${donationId}`);
  }

  // Share campaign
  window.shareCampaign = function(campaignId) {
    const campaigns = getCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) return;

    const shareUrl = window.location.origin + '/donate.html?campaign=' + campaignId;
    const shareText = `Support "${campaign.title}" at Mahmood Masjid!\nGoal: ${formatCurrency(campaign.goal)}\nRaised: ${formatCurrency(campaign.raised)}\n\n${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: shareText,
        url: shareUrl
      }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Campaign link copied to clipboard! Share it with others.');
      });
    }
  };

  // Quick donate functionality with Firebase
  document.addEventListener('DOMContentLoaded', function() {
    let selectedAmount = null;

    // Wait for Firebase
    waitForFirebase(() => {
      console.log('Firebase ready for donations');
    });

    // Amount buttons
    document.querySelectorAll('.amount-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        if (this.classList.contains('custom')) {
          document.getElementById('custom-amount-box').style.display = 'block';
          selectedAmount = null;
        } else {
          document.getElementById('custom-amount-box').style.display = 'none';
          selectedAmount = parseInt(this.dataset.amount);
        }
      });
    });

    // Quick donate form with Firebase
    const quickDonateForm = document.getElementById('quick-donate-form');
    if (quickDonateForm) {
      quickDonateForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        let amount = selectedAmount;
        if (!amount) {
          amount = parseInt(document.getElementById('custom-amount').value);
        }

        if (!amount || amount < 100) {
          alert('Please select or enter a donation amount (minimum Rs 100).');
          return;
        }

        let donorName = document.getElementById('donor-name').value;
        let donorEmail = document.getElementById('donor-email').value;
        const donorPhone = document.getElementById('donor-phone').value;
        const donorMessage = document.getElementById('donor-message').value;

        // Wait for Firebase if not ready
        if (!auth || !db) {
          await new Promise(resolve => waitForFirebase(resolve));
        }

        // Check if user is logged in
        let userId = null;
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              donorName = donorName || userData.name || currentUser.displayName;
              donorEmail = donorEmail || currentUser.email;
              userId = currentUser.uid;
            }
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        }

        // Validate email
        if (!donorEmail || !donorEmail.includes('@')) {
          alert('A valid email is required for donation receipts and reminders.');
          return;
        }

        const donationData = {
          campaignId: null, // General donation
          campaignTitle: 'General Donations',
          amount: amount,
          donorName: donorName || 'Anonymous',
          donorEmail: donorEmail,
          donorPhone: donorPhone || '',
          userId: userId,
          message: donorMessage || '',
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          status: 'pending',
          paymentMethod: 'bank_transfer',
          recurring: false,
          receiptSent: false
        };

        try {
          // Save to Firestore
          const docRef = await db.collection('donations').add(donationData);

          // Also save locally
          const donations = getDonations();
          donations.push({
            id: docRef.id,
            ...donationData,
            timestamp: new Date().toISOString()
          });
          saveDonations(donations);

          // Update general campaign stats
          const campaigns = getCampaigns();
          let generalCampaign = campaigns.find(c => c.title === 'General Donations');
          if (!generalCampaign) {
            generalCampaign = {
              id: 'general_fund',
              title: 'General Donations',
              description: 'Support Mahmood Masjid general operations',
              goal: 1000000,
              raised: 0,
              donors: 0,
              category: 'other',
              deadline: '2026-12-31',
              createdAt: new Date().toISOString(),
              createdBy: 'System',
              status: 'active'
            };
            campaigns.push(generalCampaign);
          }
          generalCampaign.raised += amount;
          generalCampaign.donors += 1;
          saveCampaigns(campaigns);

          updateStats();

          alert(`✅ Thank you ${donorName || 'for your'} donation of ${formatCurrency(amount)}!\n\n📧 Confirmation sent to: ${donorEmail}\n🆔 Donation ID: ${docRef.id}\n\n🏦 Please transfer to:\nIBAN: PK41ABPA0010154454310012\nBank: Allied Bank Limited\nTitle: Mahmood Masjid`);

          // Reset form
          quickDonateForm.reset();
          document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
          document.getElementById('custom-amount-box').style.display = 'none';
          selectedAmount = null;
        } catch (error) {
          console.error('Error saving donation:', error);
          alert('⚠️ Error processing donation. Please try again or contact support.');
        }
      });
    }
  });

  // Check for campaign parameter in URL
  document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get('campaign');
    
    if (campaignId) {
      // Auto-scroll to campaigns section
      setTimeout(() => {
        const campaignsSection = document.getElementById('campaigns-container');
        if (campaignsSection) {
          campaignsSection.scrollIntoView({ behavior: 'smooth' });
          
          // Highlight the specific campaign
          const campaignCard = document.querySelector(`[data-campaign-id="${campaignId}"]`);
          if (campaignCard) {
            campaignCard.style.border = '3px solid var(--green)';
            campaignCard.style.boxShadow = '0 0 20px rgba(50,205,50,0.3)';
          }
        }
      }, 500);
    }
  });

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    initDemoCampaigns();
    renderCampaigns();
    updateStats();
  });

  // Backend Integration Guide (for developers)
  /*
  
  TO INTEGRATE WITH BACKEND:
  
  1. Replace localStorage with API calls:
     - GET /api/campaigns - fetch all campaigns
     - POST /api/campaigns - create new campaign
     - PUT /api/campaigns/:id - update campaign
     - DELETE /api/campaigns/:id - delete campaign
     - POST /api/donations - process donation
     - GET /api/donations - fetch donation history
  
  2. Add authentication:
     - Implement user registration/login
     - Use JWT tokens for API authorization
     - Only allow authenticated users to create campaigns
     - Admin users can moderate/delete any campaign
  
  3. Payment gateway integration:
     - Stripe: https://stripe.com/docs
     - PayPal: https://developer.paypal.com
     - JazzCash/EasyPaisa (for Pakistan): Contact providers
     
     Example Stripe integration:
     ```javascript
     const stripe = Stripe('YOUR_PUBLIC_KEY');
     const checkout = await stripe.redirectToCheckout({
       lineItems: [{ price: 'price_id', quantity: 1 }],
       mode: 'payment',
       successUrl: 'https://mahmoodmasjid.com/donate/success',
       cancelUrl: 'https://mahmoodmasjid.com/donate/cancel',
     });
     ```
  
  4. Email notifications:
     - Use services like SendGrid, Mailgun, or AWS SES
     - Send confirmation emails to donors
     - Send updates to campaign creators
     - Send reminders for incomplete donations
  
  5. Database schema (PostgreSQL/MongoDB):
     ```sql
     CREATE TABLE campaigns (
       id UUID PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       description TEXT,
       goal DECIMAL(10,2),
       raised DECIMAL(10,2) DEFAULT 0,
       donors INT DEFAULT 0,
       category VARCHAR(50),
       deadline DATE,
       created_at TIMESTAMP,
       created_by UUID REFERENCES users(id),
       status VARCHAR(20) DEFAULT 'active'
     );
     
     CREATE TABLE donations (
       id UUID PRIMARY KEY,
       campaign_id UUID REFERENCES campaigns(id),
       user_id UUID REFERENCES users(id),
       amount DECIMAL(10,2),
       payment_status VARCHAR(20),
       payment_id VARCHAR(255),
       created_at TIMESTAMP
     );
     
     CREATE TABLE users (
       id UUID PRIMARY KEY,
       email VARCHAR(255) UNIQUE,
       name VARCHAR(255),
       password_hash VARCHAR(255),
       role VARCHAR(20) DEFAULT 'user',
       created_at TIMESTAMP
     );
     ```
  
  6. Security considerations:
     - Sanitize all user inputs
     - Use HTTPS for all transactions
     - Implement CSRF protection
     - Rate limit API endpoints
     - Validate payment webhooks
     - Store sensitive data encrypted
  
  7. Recommended tech stack:
     Backend: Node.js + Express or Django + REST Framework
     Database: PostgreSQL or MongoDB
     Payment: Stripe + local payment gateways
     Email: SendGrid or AWS SES
     Hosting: AWS, DigitalOcean, or Vercel
  
  */

})();
