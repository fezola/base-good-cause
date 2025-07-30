/**
 * Utility to clear all mock/test data from localStorage and browser storage
 * Run this to clean up any cached mock campaigns or contributors
 */

export const clearAllMockData = () => {
  try {
    // Clear campaign-related localStorage data
    localStorage.removeItem('basefunded_campaigns');
    localStorage.removeItem('basefunded_contributors');
    localStorage.removeItem('fundme_has_seen_loading');
    
    // Clear any other mock data keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('mock') || 
        key.includes('test') || 
        key.includes('demo') ||
        key.includes('sample')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ All mock data cleared from localStorage');
    console.log('🗑️ Removed keys:', ['basefunded_campaigns', 'basefunded_contributors', 'fundme_has_seen_loading', ...keysToRemove]);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to clear mock data:', error);
    return false;
  }
};

export const clearSessionStorage = () => {
  try {
    sessionStorage.clear();
    console.log('✅ Session storage cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear session storage:', error);
    return false;
  }
};

export const clearAllBrowserData = () => {
  const localStorageCleared = clearAllMockData();
  const sessionStorageCleared = clearSessionStorage();
  
  if (localStorageCleared && sessionStorageCleared) {
    console.log('🎉 All browser mock data cleared successfully!');
    console.log('💡 You can now create real campaigns with your account');
    return true;
  }
  
  return false;
};

// Auto-run in development to help with testing
if (import.meta.env.DEV) {
  // Add to window for easy access in console
  (window as any).clearMockData = clearAllBrowserData;
  console.log('🛠️ Development mode: Use clearMockData() in console to clear all mock data');
}
