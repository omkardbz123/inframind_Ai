import { create } from 'zustand';
import { AppNotification, NotificationType } from '../types/notification';

interface NotificationStoreState {
  notifications: AppNotification[];
  unreadCount: number;
  permissionGranted: boolean;

  // Actions
  requestPushPermission: () => Promise<boolean>;
  addNotification: (params: {
    userId?: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    linkedTicketId?: string;
    linkedCameraId?: string;
    linkedAssetId?: string;
  }) => AppNotification;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const STORAGE_NOTIFICATIONS_KEY = 'campuscare_app_notifications_v2';

// Setup Broadcast Channel for Cross-Tab / Cross-Device Notification Sync
let notifyChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    notifyChannel = new BroadcastChannel('campuscare_notifications_sync');
  }
} catch {
  // BroadcastChannel fallback
}

/**
 * Play a gentle real-time audio chime using Web Audio API synthesis
 */
function playNotificationChime(priority: string = 'normal') {
  try {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = priority === 'urgent' || priority === 'high' ? 'triangle' : 'sine';
    const now = ctx.currentTime;

    if (priority === 'urgent' || priority === 'high') {
      // 2-tone urgent ping
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.12); // D6
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Soft gentle chime
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch {
    // Audio safety
  }
}

/**
 * Trigger native browser push notification
 */
function triggerBrowserNotification(title: string, body: string, priority: string = 'normal') {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/manifest-icon-192.png',
          badge: '/manifest-icon-192.png',
          tag: `campuscare-${Date.now()}`,
          requireInteraction: priority === 'urgent',
        });
      }
    }
  } catch (e) {
    console.warn('Native notification notice:', e);
  }
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'broadcast',
    title: '👋 Welcome to MIT ACSC CampusCare',
    message: 'Real-time infrastructure management and AI voice complaint system is active.',
    type: 'ticket_created',
    priority: 'normal',
    isRead: false,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
];

export const useNotificationStore = create<NotificationStoreState>((set, get) => {
  let initial = INITIAL_NOTIFICATIONS;
  try {
    const saved = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
    if (saved) {
      initial = JSON.parse(saved);
    }
  } catch {
    initial = INITIAL_NOTIFICATIONS;
  }

  const persist = (items: AppNotification[]) => {
    try {
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(items));
    } catch {}
  };

  const hasPerm =
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission === 'granted'
      : false;

  // Cross-tab broadcast listener
  if (notifyChannel) {
    notifyChannel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'NEW_NOTIFICATION') {
        const state = get();
        const updated = [payload, ...state.notifications].slice(0, 50);
        set({
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        });
        persist(updated);
        playNotificationChime(payload.priority);
        triggerBrowserNotification(payload.title, payload.message, payload.priority);
      }
    };
  }

  // Cross-window storage listener
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_NOTIFICATIONS_KEY && event.newValue) {
        try {
          const fresh: AppNotification[] = JSON.parse(event.newValue);
          set({
            notifications: fresh,
            unreadCount: fresh.filter((n) => !n.isRead).length,
          });
        } catch {}
      }
    });
  }

  return {
    notifications: initial,
    unreadCount: initial.filter((n) => !n.isRead).length,
    permissionGranted: hasPerm,

    requestPushPermission: async () => {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return false;
      }
      try {
        const result = await Notification.requestPermission();
        const granted = result === 'granted';
        set({ permissionGranted: granted });
        return granted;
      } catch {
        return false;
      }
    },

    addNotification: (params) => {
      const state = get();
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: params.userId || 'broadcast',
        title: params.title,
        message: params.message,
        type: params.type,
        priority: params.priority || 'normal',
        linkedTicketId: params.linkedTicketId,
        linkedCameraId: params.linkedCameraId,
        linkedAssetId: params.linkedAssetId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      const updated = [newNotif, ...state.notifications].slice(0, 50);
      set({
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      });
      persist(updated);

      // Play audio chime & fire browser push
      playNotificationChime(params.priority);
      triggerBrowserNotification(params.title, params.message, params.priority);

      if (notifyChannel) {
        notifyChannel.postMessage({
          type: 'NEW_NOTIFICATION',
          payload: newNotif,
        });
      }

      return newNotif;
    },

    markAsRead: (id: string) => {
      const state = get();
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      set({
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      });
      persist(updated);
    },

    markAllAsRead: () => {
      const state = get();
      const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
      set({
        notifications: updated,
        unreadCount: 0,
      });
      persist(updated);
    },

    clearAll: () => {
      set({ notifications: [], unreadCount: 0 });
      persist([]);
    },
  };
});
