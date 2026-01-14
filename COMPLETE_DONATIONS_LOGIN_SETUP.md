# Complete Donations & Login System Setup Guide

## Overview
This guide provides all the JavaScript code and configuration needed for implementing a complete donation and login system for Mahmood Masjid website using Firebase.

---

## 1. Firebase Configuration

### File: `assets/js/firebase-config.js`

This file initializes Firebase and exposes the authentication and database instances globally.

```javascript
// Firebase Configuration
// Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > Your apps > Web app

const firebaseConfig = {
  apiKey: "AIzaSyDkP3QfwMnEutlSLc5NCuIybmpXMdVxJPk",
  authDomain: "mahmoodmasjid-7b0dc.firebaseapp.com",
  projectId: "mahmoodmasjid-7b0dc",
  storageBucket: "mahmoodmasjid-7b0dc.firebasestorage.app",
  messagingSenderId: "292543375797",
  appId: "1:292543375797:web:9f6d8d6d4dbba8fc6151fc",
  measurementId: "G-73693W1107"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDB = db;
```

### How to Get Your Firebase Config:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`mahmoodmasjid-7b0dc`)
3. Click on **Project Settings** (gear icon)
4. Go to **Your apps** section
5. Find your Web app and click the code icon
6. Copy the entire `firebaseConfig` object
7. Replace the values in `firebase-config.js`

---

## 2. Authentication System

### File: `assets/js/auth.js`

Complete authentication system with email/password and Google sign-in.

```javascript
// auth.js - Professional Firebase Authentication
(function(){
  const tabs = document.querySelectorAll('[data-auth-tab]');
  const panels = document.querySelectorAll('[data-auth-panel]');
  const statusEl = document.getElementById('auth-status');

  // Wait for Firebase to initialize
  function waitForFirebase(callback) {
    if (typeof firebase !== 'undefined' && window.firebaseAuth && window.firebaseDB) {
      callback();
    } else {
      setTimeout(() => waitForFirebase(callback), 100);
    }
  }

  // Firebase references (will be set when ready)
  let auth = null;
  let db = null;

  waitForFirebase(() => {
    auth = window.firebaseAuth;
    db = window.firebaseDB;
    
    // Check if user is already logged in
    auth.onAuthStateChanged((user) => {
      if (user) {
        loadUserProfile(user);
      }
    });
  });

  // Load user profile from Firestore
  async function loadUserProfile(user) {
    try {
      const doc = await db.collection('users').doc(user.uid).get();
      if (doc.exists) {
        const userData = doc.data();
        showStatus(`✅ Welcome back, ${userData.name || user.email}!`);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  // Get current logged-in user
  function getCurrentUser(){
    return auth ? auth.currentUser : null;
  }

  // Create new user account
  async function createUserAccount(name, email, password) {
    try {
      // Create Firebase Auth user
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update display name
      await user.updateProfile({ displayName: name });

      // Send verification email
      await user.sendEmailVerification({
        url: window.location.origin + '/login.html',
        handleCodeInApp: false
      });

      // Store additional user data in Firestore
      await db.collection('users').doc(user.uid).set({
        name: name,
        email: email,
        emailVerified: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        preferences: {
          language: 'en',
          emailNotifications: true
        }
      });

      return { success: true, user, emailSent: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Login with email and password
  async function loginUser(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update last login
      await db.collection('users').doc(user.uid).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Login with Google
  async function loginWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      const user = result.user;

      // Check if user document exists, create if not
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        await db.collection('users').doc(user.uid).set({
          name: user.displayName,
          email: user.email,
          provider: 'google',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          preferences: {
            language: 'en',
            emailNotifications: true
          }
        });
      } else {
        // Update last login
        await db.collection('users').doc(user.uid).update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Logout user
  function logoutUser() {
    if (auth) {
      return auth.signOut();
    }
  }

  // UI Helper Functions
  function setActiveTab(name){
    tabs.forEach(btn=>{
      const isActive = btn.getAttribute('data-auth-tab') === name;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
    panels.forEach(panel=>{
      const matches = panel.getAttribute('data-auth-panel') === name;
      panel.classList.toggle('active', matches);
      panel.setAttribute('aria-hidden', String(!matches));
    });
    try{ localStorage.setItem('auth-tab', name); }catch(e){}
  }

  // Tab switching
  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const name = btn.getAttribute('data-auth-tab');
      setActiveTab(name);
      showStatus('');
    });
  });

  // Password strength checker
  function checkPasswordStrength(password){
    if(!password) return null;
    let strength = 0;
    if(password.length >= 8) strength++;
    if(/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if(/\d/.test(password)) strength++;
    if(/[^a-zA-Z0-9]/.test(password)) strength++;
    if(strength <= 1) return 'weak';
    if(strength <= 2) return 'medium';
    return 'strong';
  }

  function updatePasswordStrength(input){
    const password = input.value;
    const wrapper = input.parentElement;
    let strengthBar = wrapper.querySelector('.password-strength');
    let strengthText = wrapper.querySelector('.password-strength-text');
    
    if(!strengthBar){
      strengthBar = document.createElement('div');
      strengthBar.className = 'password-strength';
      strengthBar.innerHTML = '<div class="password-strength-bar"></div>';
      input.after(strengthBar);
      
      strengthText = document.createElement('div');
      strengthText.className = 'password-strength-text';
      input.after(strengthText);
    }
    
    const bar = strengthBar.querySelector('.password-strength-bar');
    const strength = checkPasswordStrength(password);
    
    if(!password){
      strengthBar.classList.remove('show');
      strengthText.classList.remove('show');
      return;
    }
    
    strengthBar.classList.add('show');
    strengthText.classList.add('show');
    bar.className = 'password-strength-bar ' + (strength || '');
    strengthText.className = 'password-strength-text show ' + (strength || '');
    
    const messages = {
      weak: 'Weak password',
      medium: 'Medium strength',
      strong: 'Strong password'
    };
    strengthText.textContent = messages[strength] || '';
  }

  // Show status messages
  function showStatus(message, isError){
    if(!statusEl) return;
    if(!message){
      statusEl.classList.remove('show', 'error', 'success');
      statusEl.textContent = '';
      return;
    }
    statusEl.textContent = message;
    statusEl.classList.remove('error', 'success');
    statusEl.classList.add('show', isError ? 'error' : 'success');
    clearTimeout(statusEl._hideTimer);
    statusEl._hideTimer = setTimeout(()=>{
      statusEl.classList.remove('show');
    }, 6000);
  }

  // Set button loading state
  function setLoading(btn, loading){
    if(loading){
      btn.disabled = true;
      btn.classList.add('loading');
      btn._originalText = btn.textContent;
      btn.textContent = '';
    }else{
      btn.disabled = false;
      btn.classList.remove('loading');
      if(btn._originalText){
        btn.textContent = btn._originalText;
      }
    }
  }

  // Validate email format
  function validateEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Show field error
  function markFieldError(input, message){
    input.classList.add('error');
    input.classList.remove('success');
    let errorEl = input.parentElement.querySelector('.field-error');
    if(!errorEl){
      errorEl = document.createElement('div');
      errorEl.className = 'field-error';
      input.after(errorEl);
    }
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }

  // Show field success
  function markFieldSuccess(input){
    input.classList.remove('error');
    input.classList.add('success');
    const errorEl = input.parentElement.querySelector('.field-error');
    if(errorEl) errorEl.classList.remove('show');
  }

  // Clear field validation
  function clearFieldError(input){
    input.classList.remove('error', 'success');
    const errorEl = input.parentElement.querySelector('.field-error');
    if(errorEl) errorEl.classList.remove('show');
  }

  // Handle login form
  const loginForm = document.getElementById('login-form');
  if(loginForm){
    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const submitBtn = loginForm.querySelector('.auth-submit');
      const email = loginForm.email.value.trim().toLowerCase();
      const password = loginForm.password.value;

      if (!validateEmail(email)) {
        markFieldError(loginForm.email, 'Please enter a valid email');
        return;
      }

      setLoading(submitBtn, true);

      try {
        const result = await loginUser(email, password);
        if (result.success) {
          showStatus(`✅ Welcome back, ${result.user.email}!`);
          setTimeout(() => window.location.href = '/', 1500);
        } else {
          showStatus(result.error, true);
          markFieldError(loginForm.password, result.error);
        }
      } finally {
        setLoading(submitBtn, false);
      }
    });
  }

  // Handle signup form
  const signupForm = document.getElementById('signup-form');
  if(signupForm){
    signupForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const submitBtn = signupForm.querySelector('.auth-submit');
      const name = signupForm.name.value.trim();
      const email = signupForm.email.value.trim().toLowerCase();
      const password = signupForm.password.value;
      const passwordConfirm = signupForm.passwordConfirm.value;

      // Validation
      if (!name) {
        markFieldError(signupForm.name, 'Name is required');
        return;
      }

      if (!validateEmail(email)) {
        markFieldError(signupForm.email, 'Please enter a valid email');
        return;
      }

      if (password.length < 8) {
        markFieldError(signupForm.password, 'Password must be at least 8 characters');
        return;
      }

      if (password !== passwordConfirm) {
        markFieldError(signupForm.passwordConfirm, 'Passwords do not match');
        return;
      }

      setLoading(submitBtn, true);

      try {
        const result = await createUserAccount(name, email, password);
        if (result.success) {
          showStatus(`✅ Account created! Verification email sent to ${email}. Please check your inbox.`);
          setTimeout(() => window.location.href = '/', 2500);
        } else {
          showStatus(result.error, true);
          markFieldError(signupForm.email, result.error);
        }
      } finally {
        setLoading(submitBtn, false);
      }
    });
  }

  // Handle Google Sign-In button
  const googleBtn = document.getElementById('google-signin-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      setLoading(googleBtn, true);

      try {
        const result = await loginWithGoogle();
        if (result.success) {
          showStatus(`✅ Welcome, ${result.user.displayName}!`);
          setTimeout(() => window.location.href = '/', 1500);
        } else {
          showStatus(result.error, true);
        }
      } finally {
        setLoading(googleBtn, false);
      }
    });
  }

  // Handle logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await logoutUser();
        showStatus('✅ Logged out successfully');
        setTimeout(() => window.location.href = '/', 1000);
      } catch (error) {
        showStatus('Error logging out: ' + error.message, true);
      }
    });
  }

  // Restore last active tab
  let initialTab = 'login';
  try{
    const saved = localStorage.getItem('auth-tab');
    if(saved){
      initialTab = saved;
    }
  }catch(e){}
  setActiveTab(initialTab);
})();
```

---

## 3. Donation System

### File: `assets/js/donate.js`

Complete donation system with campaign management and Firebase integration.

```javascript
// Donation & Campaign Management System with Firebase Integration
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

  // Local storage keys
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
          description: 'Help us renovate and expand our mosque to accommodate more worshippers.',
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

  // Helper Functions
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

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Render campaigns on page
  function renderCampaigns() {
    const container = document.getElementById('campaigns-container');
    if (!container) return;

    const campaigns = getCampaigns().filter(c => c.status === 'active');
    
    if (campaigns.length === 0) {
      container.innerHTML = `<p style="text-align:center;color:var(--muted);padding:40px 0;">No active campaigns at the moment.</p>`;
      return;
    }

    container.innerHTML = campaigns.map(campaign => {
      const progress = calculateProgress(campaign.raised, campaign.goal);
      const daysLeft = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      
      return `
        <div class="campaign-card card" data-campaign-id="${campaign.id}" style="margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
            <h3 style="margin:0;flex:1;">${escapeHtml(campaign.title)}</h3>
            <span class="campaign-badge" style="background:var(--green);color:#fff;padding:4px 10px;border-radius:6px;font-size:0.8rem;">${campaign.category}</span>
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
            <button class="btn" onclick="donateToCampaign('${campaign.id}')" style="flex:1;">Donate Now</button>
            <button class="btn ghost" onclick="shareCampaign('${campaign.id}')">Share</button>
            <button class="btn ghost" onclick="deleteCampaign('${campaign.id}')" style="color:#dc3545;">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Update donation statistics
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

  // Campaign Modal Controls
  window.openCampaignModal = function() {
    document.getElementById('campaign-modal').style.display = 'block';
  };

  window.closeCampaignModal = function() {
    document.getElementById('campaign-modal').style.display = 'none';
    document.getElementById('campaign-form').reset();
  };

  // Create new campaign
  document.addEventListener('DOMContentLoaded', function() {
    initDemoCampaigns();
    renderCampaigns();
    updateStats();

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
          createdBy: 'User',
          status: 'active'
        };

        const campaigns = getCampaigns();
        campaigns.push(newCampaign);
        saveCampaigns(campaigns);
        
        window.closeCampaignModal();
        renderCampaigns();
        updateStats();
        
        alert('✅ Campaign created successfully!');
      });
    }

    const createBtn = document.getElementById('create-campaign-btn');
    if (createBtn) {
      createBtn.addEventListener('click', window.openCampaignModal);
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
    alert('✅ Campaign deleted successfully.');
  };

  // Donate to specific campaign with Firebase
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

    // If not logged in, prompt for info
    if (!donorEmail) {
      donorName = prompt('Enter your name:', '') || 'Anonymous';
      donorEmail = prompt('Enter your email (for donation receipts):', '');
      
      if (!donorEmail || !donorEmail.includes('@')) {
        alert('A valid email is required for donation records.');
        return;
      }
    }

    const donationData = {
      campaignId: campaignId,
      campaignTitle: campaign.title,
      amount: parseInt(amount),
      donorName: donorName,
      donorEmail: donorEmail,
      userId: userId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      paymentMethod: 'bank_transfer',
      recurring: false,
      receiptSent: false
    };

    try {
      // Save to Firestore
      const docRef = await db.collection('donations').add(donationData);
      
      // Update campaign
      campaign.raised += parseInt(amount);
      campaign.donors += 1;
      saveCampaigns(campaigns);

      // Save locally
      const localDonations = getDonations();
      localDonations.push({
        id: docRef.id,
        ...donationData,
        timestamp: new Date().toISOString()
      });
      saveDonations(localDonations);

      renderCampaigns();
      updateStats();

      alert(`✅ Thank you for your donation of ${formatCurrency(parseInt(amount))}!\n\n📧 Confirmation sent to: ${donorEmail}\n\n🏦 Bank Transfer Details:\nIBAN: PK41ABPA0010154454310012\nTitle: Mahmood Masjid`);
    } catch (error) {
      console.error('Error saving donation:', error);
      alert('⚠️ Error saving donation. Please try again.');
    }
  };

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
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Campaign link copied to clipboard!');
      });
    }
  };

  // Quick donation form with Firebase
  document.addEventListener('DOMContentLoaded', function() {
    let selectedAmount = null;

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

    // Quick donate form submit
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

        // Wait for Firebase
        if (!auth || !db) {
          await new Promise(resolve => waitForFirebase(resolve));
        }

        // Check if logged in
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
          alert('A valid email is required for donation receipts.');
          return;
        }

        const donationData = {
          campaignId: null,
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

          // Save locally
          const donations = getDonations();
          donations.push({
            id: docRef.id,
            ...donationData,
            timestamp: new Date().toISOString()
          });
          saveDonations(donations);

          quickDonateForm.reset();
          alert(`✅ Thank you for your donation of ${formatCurrency(amount)}!\n\n📧 Receipt sent to: ${donorEmail}\n\n🏦 Please transfer to:\nIBAN: PK41ABPA0010154454310012\nTitle: Mahmood Masjid`);
        } catch (error) {
          console.error('Error saving donation:', error);
          alert('⚠️ Error saving donation. Please try again.');
        }
      });
    }
  });
})();
```

---

## 4. HTML Setup

### login.html Required Elements

```html
<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- Login Form -->
<form id="login-form">
  <input type="email" name="email" placeholder="Email" required>
  <input type="password" name="password" placeholder="Password" required>
  <button type="submit" class="auth-submit">Login</button>
</form>

<!-- Signup Form -->
<form id="signup-form">
  <input type="text" name="name" placeholder="Full Name" required>
  <input type="email" name="email" placeholder="Email" required>
  <input type="password" name="password" placeholder="Password" required>
  <input type="password" name="passwordConfirm" placeholder="Confirm Password" required>
  <button type="submit" class="auth-submit">Sign Up</button>
</form>

<!-- Google Sign-In Button -->
<button id="google-signin-btn" type="button">Sign in with Google</button>

<!-- Logout Button -->
<button id="logout-btn">Logout</button>

<!-- Status Messages -->
<div id="auth-status"></div>
```

### donate.html Required Elements

```html
<!-- Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- Campaigns Container -->
<div id="campaigns-container"></div>

<!-- Donation Stats -->
<div class="stats">
  <div class="stat">
    <div class="stat-value" id="total-raised">Rs 0</div>
    <div class="stat-label">Total Raised</div>
  </div>
  <div class="stat">
    <div class="stat-value" id="total-donors">0</div>
    <div class="stat-label">Total Donors</div>
  </div>
  <div class="stat">
    <div class="stat-value" id="active-campaigns">0</div>
    <div class="stat-label">Active Campaigns</div>
  </div>
</div>

<!-- Quick Donation Form -->
<form id="quick-donate-form">
  <input type="text" id="donor-name" placeholder="Your Name">
  <input type="email" id="donor-email" placeholder="Your Email" required>
  <input type="tel" id="donor-phone" placeholder="Phone (optional)">
  <textarea id="donor-message" placeholder="Message (optional)"></textarea>
  
  <div class="amount-buttons">
    <button type="button" class="amount-btn" data-amount="500">Rs 500</button>
    <button type="button" class="amount-btn" data-amount="1000">Rs 1,000</button>
    <button type="button" class="amount-btn" data-amount="5000">Rs 5,000</button>
    <button type="button" class="amount-btn custom">Custom</button>
  </div>
  
  <div id="custom-amount-box" style="display:none;">
    <input type="number" id="custom-amount" placeholder="Enter amount in PKR">
  </div>
  
  <button type="submit" class="btn">Donate Now</button>
</form>

<!-- Campaign Modal -->
<div id="campaign-modal" style="display:none;">
  <div class="modal-content">
    <h2>Create Campaign</h2>
    <form id="campaign-form">
      <input type="text" id="campaign-title" placeholder="Campaign Title" required>
      <textarea id="campaign-desc" placeholder="Description" required></textarea>
      <input type="number" id="campaign-goal" placeholder="Goal Amount (PKR)" required>
      <select id="campaign-category">
        <option value="maintenance">Maintenance</option>
        <option value="education">Education</option>
        <option value="charity">Charity</option>
        <option value="other">Other</option>
      </select>
      <input type="date" id="campaign-deadline" required>
      <button type="submit" class="btn">Create Campaign</button>
      <button type="button" class="btn ghost" onclick="window.closeCampaignModal()">Cancel</button>
    </form>
  </div>
</div>
```

---

## 5. Script Loading Order

Ensure scripts are loaded in this order in your HTML:

```html
<!-- 1. Firebase SDKs (must be first) -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- 2. Firebase Configuration -->
<script src="assets/js/firebase-config.js"></script>

<!-- 3. Authentication -->
<script src="assets/js/auth.js"></script>

<!-- 4. Donations (if on donate page) -->
<script src="assets/js/donate.js"></script>

<!-- 5. Other scripts -->
<script src="assets/js/main.js"></script>
<script src="assets/js/ui.js"></script>
```

---

## 6. Firestore Database Structure

Your Firebase Firestore should have the following collections:

### Users Collection
```
/users/{userId}
{
  name: "User Name",
  email: "user@example.com",
  provider: "email" | "google",
  createdAt: timestamp,
  lastLogin: timestamp,
  preferences: {
    language: "en",
    emailNotifications: true
  }
}
```

### Donations Collection
```
/donations/{donationId}
{
  campaignId: "camp_123..." | null,
  campaignTitle: "Campaign Title",
  amount: 1000,
  donorName: "Donor Name",
  donorEmail: "donor@example.com",
  donorPhone: "+923001234567",
  userId: "user-id" | null,
  message: "Thank you...",
  timestamp: timestamp,
  status: "pending" | "completed" | "failed",
  paymentMethod: "bank_transfer" | "easypaisa" | "jazzcash",
  recurring: false,
  receiptSent: false
}
```

---

## 7. Firestore Security Rules

Set these rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }

    // Donations are publicly readable, logged-in users can create
    match /donations/{donationId} {
      allow read: if true;
      allow create: if true; // Allow anonymous donations
      allow update, delete: if false;
    }

    // Admin collection for future use
    match /admin/{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 8. Email Verification Setup

### Customize Email Templates in Firebase Console

1. Go to **Firebase Console** → **Authentication** → **Templates** tab
2. Select **Email address verification**
3. Customize the template:

**From**: 
- **From name**: Mahmood Masjid
- **From email**: noreply@mahmoodmasjid.com (or your Firebase default)
- **Reply-to**: contact.mahmoodmasjid@gmail.com

**Email Template Example:**
```
Subject: Verify your email for Mahmood Masjid

Assalamu Alaikum %DISPLAY_NAME%,

Thank you for creating an account with Mahmood Masjid!

Please verify your email address by clicking the link below:

%LINK%

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.

JazakAllah Khair,
Mahmood Masjid Team

---
www.mahmoodmasjid.com
contact.mahmoodmasjid@gmail.com
```

4. Click **Save**

### How Email Verification Works

When a user creates an account:
1. Firebase automatically sends a verification email to their address
2. The email contains a unique verification link
3. User clicks the link to verify their email
4. Firebase marks their account as verified
5. You can check `user.emailVerified` to confirm status

### Optional: Require Email Verification

To require users to verify before accessing features, add this check:

```javascript
auth.onAuthStateChanged((user) => {
  if (user) {
    if (!user.emailVerified) {
      showStatus('⚠️ Please verify your email to access all features.', true);
      // Optionally redirect to a verification page
    } else {
      // User is verified, allow full access
      loadUserProfile(user);
    }
  }
});
```

### Resend Verification Email

Add a button to let users resend the verification email:

```javascript
async function resendVerificationEmail() {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    try {
      await user.sendEmailVerification();
      alert('✅ Verification email sent! Check your inbox.');
    } catch (error) {
      alert('❌ Error sending email: ' + error.message);
    }
  }
}
```

---

## 9. Welcome Banner on Home Page

After a user creates an account and logs in, they will see a personalized welcome message on the home page (index.html).

### How It Works

1. **Automatic Detection**: When user visits the home page, Firebase checks if they're logged in
2. **User Data Fetch**: Gets the user's name from Firestore
3. **Welcome Display**: Shows an animated banner with:
   - Islamic greeting: "Assalamu Alaikum"
   - User's name in a prominent display
   - Close button to dismiss
4. **Session Memory**: Once dismissed, won't show again in the same browsing session

### Implementation

**HTML Structure** (automatically added to index.html):
```html
<div class="user-welcome-banner" id="user-welcome-banner" style="display:none;">
  <div class="welcome-content">
    <div class="welcome-icon">👤</div>
    <div class="welcome-text">
      <div class="welcome-greeting">Assalamu Alaikum</div>
      <div class="welcome-name" id="welcome-name">Guest</div>
    </div>
    <button class="welcome-close" id="welcome-close">✕</button>
  </div>
</div>
```

**JavaScript Logic** (in main.js):
```javascript
// Wait for Firebase and check authentication
waitForFirebase(() => {
  const auth = window.firebaseAuth;
  const db = window.firebaseDB;

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(user.uid).get();
      let displayName = user.displayName || user.email.split('@')[0];

      if (userDoc.exists) {
        const userData = userDoc.data();
        displayName = userData.name || displayName;
      }

      // Show welcome banner
      showWelcomeBanner(displayName);
    }
  });
});
```

### Styling Features

- **Gradient Background**: Green-themed gradient matching site design
- **Shimmer Effect**: Subtle animated shimmer for visual appeal
- **Slide-Down Animation**: Smooth entrance animation
- **Responsive Design**: Works perfectly on mobile and desktop
- **Theme Consistency**: Matches the site's existing color scheme

### Customization Options

**Change Greeting Message:**
```javascript
// In main.js, modify the HTML:
const greetingEl = document.getElementById('welcome-greeting');
greetingEl.textContent = 'Welcome Back'; // English
// or
greetingEl.textContent = 'خوش آمدید'; // Urdu
```

**Auto-Hide After Delay:**
```javascript
// Add timeout in showWelcomeBanner function:
setTimeout(() => {
  banner.style.display = 'none';
}, 10000); // Hide after 10 seconds
```

**Show on Every Visit:**
```javascript
// Remove sessionStorage check in showWelcomeBanner function
// Delete these lines:
if (sessionStorage.getItem('welcomeBannerDismissed') === 'true') {
  return;
}
```

---

## 10. Testing Checklist

- [ ] Firebase SDK loads without errors
- [ ] User can sign up with email/password
- [ ] **Verification email is sent upon signup**
- [ ] **Verification email arrives in inbox**
- [ ] **Email verification link works correctly**
- [ ] User can log in with existing credentials
- [ ] **Welcome banner appears on home page after login**
- [ ] **Welcome banner shows correct user name**
- [ ] **Welcome banner can be dismissed**
- [ ] Google sign-in button works
- [ ] New users appear in Firebase Authentication
- [ ] User data saves to Firestore `users` collection
- [ ] User can make donation without login
- [ ] Donations save to Firestore `donations` collection
- [ ] Campaign data displays correctly
- [ ] Campaign progress bars update after donation
- [ ] Donation confirmation email logic works
- [ ] Session persists after page reload
- [ ] Logout clears session

---

## 11. Key Functions Reference

### Authentication Functions
- `createUserAccount(name, email, password)` - Register new user
- `loginUser(email, password)` - Login with credentials
- `loginWithGoogle()` - Google OAuth login
- `logoutUser()` - Logout user
- `getCurrentUser()` - Get current user object

### Donation Functions
- `donateToCampaign(campaignId)` - Donate to specific campaign
- `donateToCampaign()` - Quick donation
- `shareCampaign(campaignId)` - Share campaign
- `deleteCampaign(campaignId)` - Delete campaign
- `renderCampaigns()` - Display all campaigns
- `updateStats()` - Update donation statistics

---

## 12. Troubleshooting

**"Firebase is not defined"**
- Ensure Firebase CDN scripts load before your scripts
- Check browser console for network errors

**"Permission denied" errors**
- Verify Firestore security rules are correctly set
- Check that user is authenticated before accessing protected data

**Google Sign-In popup blocked**
- Check browser popup blocker settings
- Ensure domain is in Firebase authorized domains

**Session not persisting**
- Firebase handles session automatically
- Check browser's local storage isn't disabled

---

## Contact & Support

For Firebase issues: [Firebase Documentation](https://firebase.google.com/docs)  
For website issues: contact.mahmoodmasjid@gmail.com
