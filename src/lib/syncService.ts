import { useTicketStore } from '../store/ticketStore';
import { useAssetStore } from '../store/assetStore';
import { useNotificationStore } from '../store/notificationStore';
import { useCCTVStore } from '../store/cctvStore';
import { useAuthStore } from '../store/authStore';
import { Ticket } from '../types/ticket';

let syncInterval: any = null;
let currentVersion = 0;
let isSyncing = false;

// Get base API URL (supports local Vite server port 5180, Express 5000, or Cloudflare tunnel)
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

export async function fetchServerSyncState(forceFull = false): Promise<boolean> {
  if (isSyncing) return false;
  isSyncing = true;

  try {
    const url = `${getApiBaseUrl()}/api/sync?sinceVersion=${forceFull ? 0 : currentVersion}`;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      isSyncing = false;
      return false;
    }

    const data = await res.json();
    if (!data || !data.success) {
      isSyncing = false;
      return false;
    }

    const serverVersion = data.version || 1;

    // If data changed or first sync
    if (serverVersion !== currentVersion || forceFull) {
      const prevTickets = useTicketStore.getState().tickets;
      const currentUser = useAuthStore.getState().currentUser;

      if (Array.isArray(data.tickets) && data.tickets.length > 0) {
        useTicketStore.setState({ tickets: data.tickets });
        try {
          localStorage.setItem('campuscare_tickets_store', JSON.stringify(data.tickets));
        } catch {}

        // Check if a new ticket was assigned to the currently logged in user
        if (currentUser && prevTickets.length > 0 && data.tickets.length > prevTickets.length) {
          const latestTicket: Ticket = data.tickets[0];
          const isAssignedToMe = latestTicket.assignedTo === currentUser.uid;
          const isMyDept = latestTicket.category === currentUser.department;
          const isManagerOrAdmin = currentUser.role === 'manager' || currentUser.role === 'admin';

          if (isAssignedToMe || isMyDept || isManagerOrAdmin) {
            console.log(`[Realtime Sync] New ticket detected on campus: #${latestTicket.id}`);
          }
        }
      }

      if (Array.isArray(data.notifications) && data.notifications.length > 0) {
        useNotificationStore.setState({
          notifications: data.notifications,
          unreadCount: data.notifications.filter((n: any) => !n.isRead).length,
        });
        try {
          localStorage.setItem('campuscare_app_notifications_v2', JSON.stringify(data.notifications));
        } catch {}
      }

      if (Array.isArray(data.assets) && data.assets.length > 0) {
        useAssetStore.setState({ assets: data.assets });
        try {
          localStorage.setItem('campuscare_assets_store', JSON.stringify(data.assets));
        } catch {}
      }

      if (Array.isArray(data.cctvCameras) && data.cctvCameras.length > 0) {
        useCCTVStore.setState({ cameras: data.cctvCameras });
        try {
          localStorage.setItem('campuscare_cctv_store', JSON.stringify(data.cctvCameras));
        } catch {}
      }

      currentVersion = serverVersion;
    }

    isSyncing = false;
    return true;
  } catch (err) {
    // Graceful offline fallback
    isSyncing = false;
    return false;
  }
}

export const syncService = {
  start() {
    if (typeof window === 'undefined') return;

    // Immediate initial sync
    fetchServerSyncState(true);

    // Periodic live sync every 2.5 seconds
    if (!syncInterval) {
      syncInterval = setInterval(() => {
        fetchServerSyncState(false);
      }, 2500);
    }

    // Immediate sync on tab focus or visibility change
    window.addEventListener('focus', () => fetchServerSyncState(true));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        fetchServerSyncState(true);
      }
    });
  },

  stop() {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  },

  async triggerImmediateSync() {
    return fetchServerSyncState(true);
  },

  async pushNewTicket(ticket: Ticket): Promise<Ticket> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ticket) {
          fetchServerSyncState(true);
          return data.ticket;
        }
      }
    } catch (err) {
      console.warn('[SyncService] Local fallback for pushNewTicket:', err);
    }
    return ticket;
  },

  async pushTicketUpdate(id: string, updates: Partial<Ticket>): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        fetchServerSyncState(true);
        return true;
      }
    } catch (err) {
      console.warn('[SyncService] Local fallback for pushTicketUpdate:', err);
    }
    return false;
  },
};
