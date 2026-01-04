// Counter functionality with localStorage persistence
(function() {
  'use strict';

  // State
  let count = 0;
  let target = 100;
  let counterName = 'Durood Shareef';

  // Elements
  const counterArea = document.getElementById('counter-area');
  const counterValue = document.getElementById('counter-value');
  const counterTitle = document.getElementById('counter-title');
  const counterTarget = document.getElementById('counter-target');
  const resetBtn = document.getElementById('reset-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsOverlay = document.getElementById('settings-modal-overlay');
  const settingsSaveBtn = document.getElementById('settings-save-btn');
  const settingsCancelBtn = document.getElementById('settings-cancel-btn');
  const counterNameInput = document.getElementById('counter-name-input');
  const counterTargetInput = document.getElementById('counter-target-input');

  // Load saved state from localStorage
  function loadState() {
    const saved = localStorage.getItem('duroodCounter');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        count = data.count || 0;
        target = data.target || 100;
        counterName = data.name || 'Durood Shareef';
      } catch (e) {
        console.error('Failed to load counter state:', e);
      }
    }
    updateDisplay();
  }

  // Save state to localStorage
  function saveState() {
    const data = {
      count: count,
      target: target,
      name: counterName
    };
    localStorage.setItem('duroodCounter', JSON.stringify(data));
  }

  // Update the display
  function updateDisplay() {
    counterValue.textContent = count;
    counterTarget.textContent = `of ${target}`;
    counterTitle.textContent = counterName;
    
    // Apply language if Urdu mode is active
    const isUrdu = document.body.classList.contains('urdu-mode');
    if (isUrdu) {
      counterTarget.textContent = `${target} میں سے`;
    }

    // Add celebration effect if target reached
    if (count >= target && count > 0) {
      counterArea.classList.add('target-reached');
      setTimeout(() => counterArea.classList.remove('target-reached'), 1000);
    }
  }

  // Increment counter
  function increment() {
    const previousCount = count;
    count++;
    updateDisplay();
    saveState();
    
    // Check if target just reached
    if (count === target && previousCount < target) {
      const isUrdu = document.body.classList.contains('urdu-mode');
      const congratsMsg = isUrdu 
        ? `ماشاء اللہ! آپ نے ${target} ${counterName} مکمل کر لیے ہیں۔`
        : `MashAllah! You have completed ${target} ${counterName}.`;
      
      setTimeout(() => {
        showCongrats(congratsMsg);
      }, 400);
    }
    
    // Add ripple effect
    counterArea.classList.add('clicked');
    setTimeout(() => counterArea.classList.remove('clicked'), 300);

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  // Reset counter
  function reset() {
    const isUrdu = document.body.classList.contains('urdu-mode');
    const confirmMsg = isUrdu 
      ? 'کیا آپ واقعی کاؤنٹر کو صفر پر ری سیٹ کرنا چاہتے ہیں؟'
      : 'Are you sure you want to reset the counter to 0?';
    
    showConfirm(confirmMsg, () => {
      count = 0;
      updateDisplay();
      saveState();
    });
  }

  // Open settings modal
  function openSettings(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    counterNameInput.value = counterName;
    counterTargetInput.value = target;
    settingsOverlay.classList.add('active');
  }

  // Close settings modal
  function closeSettings() {
    settingsOverlay.classList.remove('active');
  }

  // Save settings
  function saveSettings() {
    const newName = counterNameInput.value.trim();
    const newTarget = parseInt(counterTargetInput.value);

    if (newName) {
      counterName = newName;
    }
    if (newTarget > 0) {
      target = newTarget;
    }

    updateDisplay();
    saveState();
    closeSettings();
  }

  // Event listeners
  counterArea.addEventListener('click', increment);
  
  // Keyboard support - Space or Enter to increment
  counterArea.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      increment();
    }
  });

  resetBtn.addEventListener('click', reset);
  settingsBtn.addEventListener('click', openSettings);
  settingsSaveBtn.addEventListener('click', saveSettings);
  settingsCancelBtn.addEventListener('click', closeSettings);

  // Close settings on overlay click
  settingsOverlay.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) {
      closeSettings();
    }
  });

  // Close settings on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsOverlay.classList.contains('active')) {
      closeSettings();
    }
  });

  // Show confirmation modal
  function showConfirm(message, onConfirm) {
    const confirmOverlay = document.getElementById('confirm-modal-overlay');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmYesBtn = document.getElementById('confirm-yes-btn');
    const confirmNoBtn = document.getElementById('confirm-no-btn');
    
    confirmMessage.textContent = message;
    confirmOverlay.classList.add('active');
    
    const closeModal = () => {
      confirmOverlay.classList.remove('active');
    };
    
    confirmYesBtn.onclick = () => {
      onConfirm();
      closeModal();
    };
    
    confirmNoBtn.onclick = closeModal;
    confirmOverlay.onclick = (e) => {
      if (e.target === confirmOverlay) closeModal();
    };
  }

  // Show congratulations modal
  function showCongrats(message) {
    const congratsOverlay = document.getElementById('congrats-modal-overlay');
    const congratsMessage = document.getElementById('congrats-message');
    const congratsBtn = document.getElementById('congrats-btn');
    
    congratsMessage.textContent = message;
    congratsOverlay.classList.add('active');
    
    const closeModal = () => {
      congratsOverlay.classList.remove('active');
    };
    
    congratsBtn.onclick = closeModal;
    congratsOverlay.onclick = (e) => {
      if (e.target === congratsOverlay) closeModal();
    };
  }

  // Initialize
  loadState();

  // Update display when language changes
  document.addEventListener('languageChanged', updateDisplay);
})();
