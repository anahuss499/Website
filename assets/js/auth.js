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

  // User management with Firebase
  function getCurrentUser(){
    return auth ? auth.currentUser : null;
  }

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

  async function loginWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      // Add scopes for email and profile
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await auth.signInWithPopup(provider);
      const user = result.user;

      // Check if user document exists, create if not
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        // New user - create account
        await db.collection('users').doc(user.uid).set({
          name: user.displayName || 'User',
          email: user.email,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL || null,
          provider: 'google',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          preferences: {
            language: 'en',
            emailNotifications: true
          }
        });
      } else {
        // Existing user - update last login and email verification status
        await db.collection('users').doc(user.uid).update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          emailVerified: user.emailVerified,
          photoURL: user.photoURL || null
        });
      }

      return { success: true, user, isNewUser: !userDoc.exists };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      return { success: false, error: error.message };
    }
  }

  function logoutUser() {
    if (auth) {
      return auth.signOut();
    }
  }

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

  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const name = btn.getAttribute('data-auth-tab');
      setActiveTab(name);
      showStatus('');
    });
  });

  // restore last tab if available, otherwise default to login
  let initialTab = 'login';
  try{
    const saved = localStorage.getItem('auth-tab');
    if(saved){
      initialTab = saved;
    }
  }catch(e){}
  setActiveTab(initialTab);



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

  function validateEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

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

  function markFieldSuccess(input){
    input.classList.remove('error');
    input.classList.add('success');
    const errorEl = input.parentElement.querySelector('.field-error');
    if(errorEl) errorEl.classList.remove('show');
  }

  function clearFieldError(input){
    input.classList.remove('error', 'success');
    const errorEl = input.parentElement.querySelector('.field-error');
    if(errorEl) errorEl.classList.remove('show');
  }

  // Check if already logged in
  const currentUser = getCurrentUser();
  if(currentUser){
    showStatus(`Welcome back, ${currentUser.name}! You are logged in.`);
  }

  // Handle login form
  const loginForm = document.getElementById('login-form');
  if(loginForm){
    // Wrap inputs
    loginForm.querySelectorAll('input[type="email"], input[type="password"]').forEach(input=>{
      if(!input.parentElement.classList.contains('input-wrapper')){
        const wrapper = document.createElement('div');
        wrapper.className = 'input-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
      }
    });

    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const submitBtn = loginForm.querySelector('.auth-submit');
      const email = loginForm.email.value.trim().toLowerCase();
      const password = loginForm.password.value;
      const remember = loginForm.remember?.checked;

      // Clear previous errors
      loginForm.querySelectorAll('input').forEach(clearFieldError);

      if(!email){
        markFieldError(loginForm.email, 'Email is required');
        showStatus('Please fill all fields', true);
        return;
      }

      if(!validateEmail(email)){
        markFieldError(loginForm.email, 'Invalid email format');
        showStatus('Please enter a valid email', true);
        return;
      }

      if(!password){
        markFieldError(loginForm.password, 'Password is required');
        showStatus('Please fill all fields', true);
        return;
      }

      // Show loading
      setLoading(submitBtn, true);

      // Wait for Firebase to be ready
      if (!auth) {
        showStatus('⏳ Connecting to server...', false);
        await new Promise(resolve => {
          waitForFirebase(resolve);
        });
      }

      // Login with Firebase
      const result = await loginUser(email, password);

      setLoading(submitBtn, false);

      if (result.success) {
        // Set persistence if remember me is checked
        if (remember) {
          await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        }

        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(result.user.uid).get();
        const userData = userDoc.data();

        loginForm.querySelectorAll('input').forEach(markFieldSuccess);
        showStatus(`✅ Welcome back, ${userData?.name || result.user.email}!`);
        setTimeout(() => { window.location.href = '/'; }, 1800);
      } else {
        // Handle specific Firebase errors
        let errorMessage = result.error;
        if (result.error.includes('user-not-found')) {
          markFieldError(loginForm.email, 'Account not found');
          errorMessage = 'Account not found. Please sign up first.';
        } else if (result.error.includes('wrong-password')) {
          markFieldError(loginForm.password, 'Incorrect password');
          errorMessage = 'Incorrect password. Please try again.';
        } else if (result.error.includes('too-many-requests')) {
          errorMessage = 'Too many failed attempts. Please try again later.';
        }
        showStatus(errorMessage, true);
      }
    });
  }

  // Clear field errors on input
  const signupPasswordInput = document.getElementById('signup-password');
  if(signupPasswordInput){
    signupPasswordInput.addEventListener('input', (e)=>{
      clearFieldError(e.target);
    });
  }

  // Real-time validation
  document.querySelectorAll('.auth-form input[type="email"]').forEach(input=>{
    input.addEventListener('blur', (e)=>{
      const email = e.target.value.trim();
      if(email && !validateEmail(email)){
        markFieldError(e.target, 'Please enter a valid email');
      }else if(email){
        markFieldSuccess(e.target);
      }
    });
    input.addEventListener('focus', (e)=>clearFieldError(e.target));
  });

  // Handle signup form
  const signupForm = document.getElementById('signup-form');
  if(signupForm){
    signupForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const submitBtn = signupForm.querySelector('.auth-submit');
      
      const name = signupForm.name.value.trim();
      const email = signupForm.email.value.trim().toLowerCase();
      const password = signupForm.password.value;
      const confirm = signupForm.confirm.value;
      const agree = signupForm.policy?.checked;

      // Clear previous errors
      signupForm.querySelectorAll('input').forEach(clearFieldError);

      if(!name){
        markFieldError(signupForm.name, 'Name is required');
        showStatus('Please fill all fields', true);
        return;
      }

      if(!email){
        markFieldError(signupForm.email, 'Email is required');
        showStatus('Please fill all fields', true);
        return;
      }

      if(!validateEmail(email)){
        markFieldError(signupForm.email, 'Invalid email format');
        showStatus('Please enter a valid email', true);
        return;
      }

      if(!password){
        markFieldError(signupForm.password, 'Password is required');
        showStatus('Please fill all fields', true);
        return;
      }

      if(password.length < 6){
        markFieldError(signupForm.password, 'Must be at least 6 characters');
        showStatus('Password must be at least 6 characters', true);
        return;
      }

      if(password !== confirm){
        markFieldError(signupForm.confirm, 'Passwords do not match');
        showStatus('Passwords do not match', true);
        return;
      }

      if(!agree){
        showStatus('Please agree to receive updates', true);
        return;
      }

      // Show loading state
      setLoading(submitBtn, true);

      // Wait for Firebase to be ready
      if (!auth) {
        showStatus('⏳ Connecting to server...', false);
        await new Promise(resolve => {
          waitForFirebase(resolve);
        });
      }

      // Create account with Firebase
      const result = await createUserAccount(name, email, password);

      setLoading(submitBtn, false);

      if (result.success) {
        signupForm.querySelectorAll('input').forEach(markFieldSuccess);
        showStatus(`✅ Account created! Verification email sent to ${email}. Please check your inbox.`);
        setTimeout(() => { window.location.href = '/'; }, 2500);
      } else {
        // Handle specific Firebase errors
        let errorMessage = result.error;
        if (result.error.includes('email-already-in-use')) {
          markFieldError(signupForm.email, 'Email already registered');
          errorMessage = 'Email already registered. Please login.';
        } else if (result.error.includes('weak-password')) {
          markFieldError(signupForm.password, 'Password too weak');
          errorMessage = 'Password is too weak. Use at least 6 characters.';
        } else if (result.error.includes('invalid-email')) {
          markFieldError(signupForm.email, 'Invalid email');
          errorMessage = 'Please enter a valid email address.';
        }
        showStatus(errorMessage, true);
      }
    });
  }

  // Google sign-in with Firebase
  document.querySelectorAll('.google-btn').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      btn.disabled = true;
      btn.style.opacity = '0.6';
      const originalText = btn.querySelector('.google-text').textContent;
      btn.querySelector('.google-text').textContent = 'Connecting...';

      // Wait for Firebase to be ready
      if (!auth) {
        showStatus('⏳ Connecting to server...', false);
        await new Promise(resolve => {
          waitForFirebase(resolve);
        });
      }

      const result = await loginWithGoogle();

      if (result.success) {
        // Get user data
        const userDoc = await db.collection('users').doc(result.user.uid).get();
        const userData = userDoc.data();

        btn.querySelector('.google-text').textContent = '✓ Connected';
        
        // Show different message for new vs existing users
        if (result.isNewUser) {
          showStatus(`🎉 Welcome! Account created with Google as ${userData?.name || result.user.displayName}!`);
        } else {
          showStatus(`✅ Signed in with Google as ${userData?.name || result.user.displayName}!`);
        }
        
        setTimeout(() => { window.location.href = '/'; }, 1500);
      } else {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.querySelector('.google-text').textContent = originalText;
        
        let errorMessage = result.error;
        if (result.error.includes('popup-closed-by-user')) {
          errorMessage = 'Sign-in cancelled. Please try again.';
        } else if (result.error.includes('popup-blocked')) {
          errorMessage = 'Pop-up blocked. Please allow pop-ups and try again.';
        } else if (result.error.includes('auth/unauthorized-domain')) {
          errorMessage = 'This domain is not authorized. Please contact support.';
        } else if (result.error.includes('auth/operation-not-allowed')) {
          errorMessage = 'Google sign-in is not enabled. Please contact support.';
        }
        showStatus(errorMessage, true);
      }
    });
  });

  // Logout functionality
  window.authLogout = async function(){
    if (auth) {
      await logoutUser();
      showStatus('✅ Logged out successfully');
      setTimeout(() => { window.location.reload(); }, 1500);
    }
  };

  // update footer year on this page
  const yearEl = document.getElementById('current-year');
  if(yearEl){
    yearEl.textContent = new Date().getFullYear();
  }
})();
