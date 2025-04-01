
/**
 * Utilities for managing local storage and offline capabilities
 */

// Check if storage is available
export const isStorageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Get item with fallback for errors
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Set item with error handling
export const setStorageItem = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
};

// Remove item with error handling
export const removeStorageItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
};

// Check storage usage
export const getStorageUsage = (): { used: number; total: number; percentage: number } => {
  try {
    let total = 1024 * 1024 * 5; // Assume 5MB default
    
    // Try to estimate available storage on modern browsers
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        if (estimate.quota) {
          total = estimate.quota;
        }
      });
    }
    
    // Calculate current usage
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += value.length * 2; // Unicode chars take 2 bytes
        }
      }
    }
    
    return {
      used,
      total,
      percentage: (used / total) * 100
    };
  } catch (error) {
    console.error("Error calculating storage usage:", error);
    return { used: 0, total: 0, percentage: 0 };
  }
};

// Purge old data (if storage is getting full)
export const purgeOldData = (threshold = 80): void => {
  try {
    const usage = getStorageUsage();
    
    if (usage.percentage > threshold) {
      // This is just an example - in real app you'd have a more sophisticated approach
      // Maybe delete old logs, images, or unused items
      console.warn(`Storage usage is high (${usage.percentage.toFixed(1)}%). Consider cleaning up.`);
    }
  } catch (error) {
    console.error("Error in purge function:", error);
  }
};

// Check if we're online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Add online/offline event listeners
export const setupConnectivityListeners = (
  onlineCallback: () => void,
  offlineCallback: () => void
): (() => void) => {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);
  
  // Return function to remove listeners
  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
};
