import { useState, useEffect, useCallback } from 'react';

export interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  serviceWorkerReady: boolean;
  updateAvailable: boolean;
  installPrompt: Event | null;
  dismissInstall: () => void;
  install: () => Promise<void>;
  applyUpdate: () => Promise<void>;
}

export function usePWA(): PWAInstallState {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => {
    // Check if already installed (PWA mode)
    const checkInstalled = () => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
          || (window.navigator as any).standalone === true;
        setIsInstalled(isStandalone);
      }
    };
    checkInstalled();

    // Online/Offline detection
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial offline check
    setIsOffline(!navigator.onLine);

    // Install prompt handler
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    });

    // Service Worker Ready
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setServiceWorkerReady(true);
      });

      // Check for updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });
    }

    // Listen for updatefound events
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('updatefound', () => {
        setUpdateAvailable(true);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) return;

    const promptEvent = installPrompt as any;
    promptEvent.prompt();
    
    const { outcome } = await promptEvent.userChoice;
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  }, [installPrompt]);

  const dismissInstall = useCallback(() => {
    setIsInstallable(false);
    setInstallPrompt(null);
  }, []);

  const applyUpdate = useCallback(async () => {
    if (!navigator.serviceWorker?.controller) return;

    try {
      await navigator.serviceWorker.controller.postMessage({
        type: 'SKIP_WAITING'
      });
      
      window.location.reload();
    } catch (error) {
      console.error('Failed to apply update:', error);
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOffline,
    serviceWorkerReady,
    updateAvailable,
    installPrompt,
    dismissInstall,
    install,
    applyUpdate
  };
}

export function useOfflineIndicator() {
  const [showOffline, setShowOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setShowOffline(true);
      setWasOffline(true);
    };

    const handleOnline = () => {
      setShowOffline(false);
      // Hide after 2 seconds of being back online
      setTimeout(() => setWasOffline(false), 2000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Initial state
    if (!navigator.onLine) {
      setShowOffline(true);
      setWasOffline(true);
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return { showOffline, wasOffline };
}
