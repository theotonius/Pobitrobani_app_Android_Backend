import { useEffect, useState, useCallback } from 'react';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { Network, NetworkStatus } from '@capacitor/network';
import { Share } from '@capacitor/share';
import { PushNotifications, ActionPerformed, Token } from '@capacitor/push-notifications';
import { nativeStorage } from '../lib/storage';

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    connected: true,
    connectionType: 'unknown',
  });

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      const handler = () => setNetworkStatus(prev => ({
        ...prev,
        connected: navigator.onLine,
      }));
      window.addEventListener('online', handler);
      window.addEventListener('offline', handler);
      return () => {
        window.removeEventListener('online', handler);
        window.removeEventListener('offline', handler);
      };
    }

    Network.getStatus().then(status => setNetworkStatus(status));

    let listener: PluginListenerHandle | null = null;
    Network.addListener('networkStatusChange', status => {
      setNetworkStatus(status);
    }).then(l => { listener = l; });

    return () => {
      listener?.remove();
    };
  }, []);

  return networkStatus;
}

export async function shareContent(options: {
  text?: string;
  title?: string;
  url?: string;
  dialogTitle?: string;
}) {
  if (Capacitor.isNativePlatform()) {
    await Share.share(options);
  } else {
    if (navigator.share) {
      await navigator.share(options);
    } else {
      const text = options.text || '';
      await navigator.clipboard.writeText(text);
    }
  }
}

export function usePushNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [notificationData, setNotificationData] = useState<any>(null);

  const register = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    let permResult = await PushNotifications.checkPermissions();
    if (permResult.receive === 'prompt') {
      permResult = await PushNotifications.requestPermissions();
    }

    if (permResult.receive !== 'granted') {
      setHasPermission(false);
      return;
    }

    setHasPermission(true);
    await PushNotifications.register();

    PushNotifications.addListener('registration', (token: Token) => {
      setPushToken(token.value);
      nativeStorage.set('sacred_word_push_token', token.value);
    });

    PushNotifications.addListener('registrationError', (err: any) => {
      console.error('Push registration error:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
      setNotificationData(notification.data);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      setNotificationData(action.notification.data);
    });
  }, []);

  const unregister = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    await PushNotifications.unregister();
    setPushToken(null);
    setNotificationData(null);
    await nativeStorage.remove('sacred_word_push_token');
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      nativeStorage.get('sacred_word_push_token').then(token => {
        if (token) setPushToken(token);
      });
    }
    return () => {};
  }, []);

  return {
    pushToken,
    hasPermission,
    notificationData,
    register,
    unregister,
  };
}
