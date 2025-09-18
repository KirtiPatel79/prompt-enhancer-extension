document.addEventListener('DOMContentLoaded', () => {
 // const apiUrlInput = document.getElementById('apiUrl');
  const userRoleSelect = document.getElementById('userRole');
  const optimizationLevelSelect = document.getElementById('optimizationLevel');
  const saveButton = document.getElementById('saveButton'); // ✅ fixed
  const status = document.getElementById('status');         // ✅ added

  // Load saved settings
  chrome.storage.sync.get(['userRole', 'optimizationLevel'], (settings) => {
    // apiUrlInput.value = settings.apiUrl || 'http://localhost:8000/enhance';
    userRoleSelect.value = settings.userRole || 'general';
    optimizationLevelSelect.value = settings.optimizationLevel || 'balanced';
  });

  // Save settings
  saveButton.addEventListener('click', () => {
    // const apiUrl = apiUrlInput.value.trim();
    const userRole = userRoleSelect.value;
    const optimizationLevel = optimizationLevelSelect.value;

    // if (!apiUrl) {
    //   status.textContent = 'Error: API URL is required';
    //   status.classList.add('error');
    //   return;
    // }

    chrome.storage.sync.set({
      // apiUrl,
      userRole,
      optimizationLevel
    }, () => {
      status.textContent = 'Settings saved';
      status.classList.remove('error');
      setTimeout(() => { status.textContent = ''; }, 2000);
    });
  });
});
