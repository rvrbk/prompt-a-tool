import { ref, onMounted } from 'vue';

/**
 * Composable for PWA (Progressive Web App) functionality
 * Handles service worker registration, updates, and installation prompts
 */
export default function usePWA() {
  const isPWAInstalled = ref(false);
  const canInstallPWA = ref(false);
  const showInstallPrompt = ref(false);
  const isOffline = ref(false);
  const hasUpdates = ref(false);
  const deferredPrompt = ref(null);
  const registration = ref(null);
  const newVersionAvailable = ref(false);

  // Check if app is running in standalone mode
  const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: window-controls-overlay)').matches ||
           window.navigator.standalone;
  };

  // Check if app is installed (PWA or native)
  const checkPWAInstalled = async () => {
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches) {
      isPWAInstalled.value = true;
      return true;
    }

    // Check for Chrome/Edge installed PWAs
    if (window.navigator && window.navigator.getInstalledRelatedApps) {
      try {
        const relatedApps = await window.navigator.getInstalledRelatedApps();
        isPWAInstalled.value = relatedApps.length > 0;
        return isPWAInstalled.value;
      } catch (error) {
        console.warn('getInstalledRelatedApps not supported:', error);
      }
    }

    return false;
  };

  // Register periodic sync
  const registerPeriodicSync = async (reg) => {
    if (!('periodicSync' in reg)) {
      console.log('[PWA] Periodic sync not supported');
      return;
    }

    // Check if we're on HTTPS or localhost (required for periodic sync)
    const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isSecureContext) {
      console.warn('[PWA] Periodic sync requires HTTPS or localhost');
      return;
    }

    try {
      const isActive = reg.active?.state === 'activated';
      const isControlling = navigator.serviceWorker.controller?.state === 'activated';

      if (!isActive && !isControlling) {
        console.log('[PWA] Waiting for service worker to be active before registering periodic sync');
        await new Promise((resolve) => {
          const checkActive = () => {
            if (reg.active?.state === 'activated' || navigator.serviceWorker.controller?.state === 'activated') {
              resolve();
            } else {
              setTimeout(checkActive, 100);
            }
          };
          checkActive();
        });
      }

      // Check if already registered
      const existingSync = await reg.periodicSync.getTags();
      if (existingSync.includes('sync-prompt-data')) {
        console.log('[PWA] Periodic sync already registered');
        return;
      }

      await reg.periodicSync.register('sync-prompt-data', {
        minInterval: 1000 * 60 * 15, // 15 minutes
      });
      console.log('[PWA] Periodic sync registered');
    } catch (error) {
      // Handle permission errors gracefully
      if (error.name === 'NotAllowedError') {
        console.warn('[PWA] Periodic sync permission denied. This may require user interaction or HTTPS.');
      } else {
        console.error('[PWA] Periodic sync registration failed:', error);
      }
    }
  };

  // Register service worker
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        // Unregister old service workers first
        const oldRegistrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of oldRegistrations) {
          if (reg.scope !== '/sw.js') {
            await reg.unregister();
          }
        }

        registration.value = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          type: 'classic',
        });

        console.log('[PWA] Service Worker registered');

        // Register periodic sync after service worker is active
        await registerPeriodicSync(registration.value);

        // Check for updates
        checkForUpdates();

        // Listen for update found events
        registration.value.addEventListener('updatefound', () => {
          console.log('[PWA] New service worker version found');
          checkForUpdates();
        });

        // Listen for controller changes (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[PWA] Service worker controller changed');
          // Re-register periodic sync after controller change
          registerPeriodicSync(registration.value);
          window.location.reload();
        });

        return registration.value;
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  };

  // Check for service worker updates
  const checkForUpdates = async () => {
    if (!registration.value) return false;

    try {
      const response = await fetch('/sw.js', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const currentSW = await caches.match('/sw.js');
      
      if (currentSW) {
        const currentText = await currentSW.text();
        const newText = await response.text();
        
        if (currentText !== newText) {
          newVersionAvailable.value = true;
          hasUpdates.value = true;
          return true;
        }
      }

      // Also check if there's a waiting service worker
      if (registration.value.waiting) {
        newVersionAvailable.value = true;
        hasUpdates.value = true;
        return true;
      }

      hasUpdates.value = false;
      newVersionAvailable.value = false;
      return false;
    } catch (error) {
      console.error('[PWA] Update check failed:', error);
      return false;
    }
  };

  // Update service worker
  const updateServiceWorker = async () => {
    if (!registration.value || !registration.value.waiting) {
      return false;
    }

    try {
      // Send skip waiting message to the waiting service worker
      registration.value.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Wait for the new service worker to activate
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (navigator.serviceWorker.controller?.state === 'activated') {
            clearInterval(interval);
            resolve();
          }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(interval);
          resolve();
        }, 5000);
      });

      // Reload the page to use the new version
      window.location.reload();
      return true;
    } catch (error) {
      console.error('[PWA] Update failed:', error);
      return false;
    }
  };

  // Show PWA installation prompt
  const showInstallationPrompt = () => {
    if (deferredPrompt.value) {
      deferredPrompt.value.prompt();
      
      deferredPrompt.value.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted installation');
          isPWAInstalled.value = true;
        } else {
          console.log('[PWA] User dismissed installation');
        }
        deferredPrompt.value = null;
        showInstallPrompt.value = false;
      });
    }
  };

  // Handle beforeinstallprompt event
  const handleBeforeInstallPrompt = (event) => {
    event.preventDefault();
    deferredPrompt.value = event;
    canInstallPWA.value = true;
    
    // Auto-show prompt if not already standalone
    if (!isPWAInstalled.value) {
      // Delay slightly to avoid showing immediately on page load
      setTimeout(() => {
        if (!isPWAInstalled.value) {
          showInstallPrompt.value = true;
        }
      }, 2000);
    }
  };

  // Check offline status
  const checkOfflineStatus = () => {
    isOffline.value = !navigator.onLine;
  };

  // Send message to service worker
  const sendSWMessage = async (message) => {
    if (!registration.value || !registration.value.active) return null;
    
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      registration.value.active.postMessage(
        { ...message, _messageId: Date.now() },
        [messageChannel.port2]
      );
    });
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  // Show notification
  const showNotification = async (title, options = {}) => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return false;
    }

    const notification = new Notification(title, {
      body: options.body || '',
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      data: options.data || {},
      actions: options.actions || [],
      vibrate: options.vibrate || [200, 100, 200],
      tag: options.tag || Date.now().toString(),
      renotify: options.renotify || false,
      requireInteraction: options.requireInteraction || false,
    });

    return notification;
  };

  // Subscribe to push notifications
  const subscribeToPush = async (vapidPublicKey) => {
    if (!('PushManager' in window)) {
      return null;
    }

    try {
      const subscription = await registration.value.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      
      return subscription;
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error);
      return null;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPush = async () => {
    if (!registration.value || !registration.value.pushManager) {
      return false;
    }

    try {
      const subscription = await registration.value.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      return false;
    } catch (error) {
      console.error('[PWA] Push unsubscription failed:', error);
      return false;
    }
  };

  // Helper function to convert URL base64 to Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  };

  // Initialize PWA functionality
  onMounted(() => {
    // Check offline status
    checkOfflineStatus();
    
    // Listen for online/offline events
    window.addEventListener('online', checkOfflineStatus);
    window.addEventListener('offline', checkOfflineStatus);

    // Check if PWA is already installed
    checkPWAInstalled();

    // Register service worker
    registerServiceWorker();

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      isPWAInstalled.value = true;
      canInstallPWA.value = false;
      deferredPrompt.value = null;
    });

    // Periodically check for updates
    setInterval(checkForUpdates, 1000 * 60 * 60); // Check every hour
  });

  return {
    // State
    isPWAInstalled,
    canInstallPWA,
    showInstallPrompt,
    isOffline,
    hasUpdates,
    newVersionAvailable,
    
    // Methods
    checkPWAInstalled,
    registerServiceWorker,
    registerPeriodicSync,
    checkForUpdates,
    updateServiceWorker,
    showInstallationPrompt,
    sendSWMessage,
    requestNotificationPermission,
    showNotification,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
