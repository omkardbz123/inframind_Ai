import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, 'db.json');

let inMemoryDb = null;
let saveTimeout = null;

function loadDb() {
  if (inMemoryDb) return inMemoryDb;
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      inMemoryDb = JSON.parse(data);
    }
  } catch (err) {
    console.error('[ServerStore] Failed to read db.json:', err);
  }

  if (!inMemoryDb) {
    inMemoryDb = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      tickets: [],
      notifications: [],
      assets: [],
      cctvCameras: [],
    };
  }

  if (!Array.isArray(inMemoryDb.tickets)) inMemoryDb.tickets = [];
  if (!Array.isArray(inMemoryDb.notifications)) inMemoryDb.notifications = [];
  if (!Array.isArray(inMemoryDb.assets)) inMemoryDb.assets = [];
  if (!Array.isArray(inMemoryDb.cctvCameras)) inMemoryDb.cctvCameras = [];
  if (typeof inMemoryDb.version !== 'number') inMemoryDb.version = 1;

  return inMemoryDb;
}

function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      if (inMemoryDb) {
        fs.writeFileSync(DB_PATH, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[ServerStore] Failed to persist db.json:', err);
    }
  }, 100);
}

function bumpVersion() {
  const db = loadDb();
  db.version = (db.version || 1) + 1;
  db.lastUpdated = new Date().toISOString();
  scheduleSave();
  return db.version;
}

export const serverStore = {
  getSyncState(sinceVersion = 0) {
    const db = loadDb();
    return {
      version: db.version,
      lastUpdated: db.lastUpdated,
      tickets: db.tickets,
      notifications: db.notifications,
      assets: db.assets,
      cctvCameras: db.cctvCameras,
    };
  },

  getTickets() {
    const db = loadDb();
    return db.tickets;
  },

  getTicketById(id) {
    const db = loadDb();
    return db.tickets.find((t) => t.id === id) || null;
  },

  createTicket(ticketParams) {
    const db = loadDb();
    const id = ticketParams.id || `T-2026-${String(db.tickets.length + 105).padStart(4, '0')}`;
    const nowIso = new Date().toISOString();

    const newTicket = {
      ...ticketParams,
      id,
      createdAt: ticketParams.createdAt || nowIso,
      timeline: ticketParams.timeline || [
        {
          id: `tl-${Date.now()}`,
          action: 'created',
          toStatus: 'open',
          userId: ticketParams.reporterId || 'student',
          userName: ticketParams.reporterName || 'Anonymous',
          comment: `Fault complaint registered in ${ticketParams.building} (Room ${ticketParams.roomNumber || 'General'}).`,
          timestamp: nowIso,
        },
      ],
    };

    // Prepend to list
    db.tickets.unshift(newTicket);

    // Create automated notification for managers and technicians
    const notif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: ticketParams.assignedTo || 'broadcast',
      title: `🚨 New Fault Ticket #${id}: ${ticketParams.title}`,
      message: `${ticketParams.reporterName} reported ${ticketParams.subcategory} issue in ${ticketParams.building} (Floor ${ticketParams.floor}, Room ${ticketParams.roomNumber || 'General'}).`,
      type: 'ticket_created',
      priority: ticketParams.priority === 'critical' ? 'urgent' : ticketParams.priority === 'high' ? 'high' : 'normal',
      linkedTicketId: id,
      isRead: false,
      createdAt: nowIso,
    };
    db.notifications.unshift(notif);
    if (db.notifications.length > 100) db.notifications.pop();

    bumpVersion();
    return newTicket;
  },

  updateTicket(id, updates) {
    const db = loadDb();
    const index = db.tickets.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const existing = db.tickets[index];
    const nowIso = new Date().toISOString();

    const updatedTimeline = Array.isArray(updates.timeline)
      ? updates.timeline
      : [...(existing.timeline || [])];

    // If status changed and not already logged in timeline
    if (updates.status && updates.status !== existing.status) {
      const lastEntry = updatedTimeline[updatedTimeline.length - 1];
      if (!lastEntry || lastEntry.toStatus !== updates.status) {
        updatedTimeline.push({
          id: `tl-${Date.now()}`,
          action: updates.status === 'resolved' ? 'resolved' : 'status_changed',
          fromStatus: existing.status,
          toStatus: updates.status,
          userId: updates.updatedByUserId || existing.assignedTo || 'staff',
          userName: updates.updatedByUserName || existing.assignedToName || 'Technician',
          comment: updates.resolutionNotes || updates.statusComment || `Status updated to ${updates.status.replace('_', ' ').toUpperCase()}`,
          timestamp: nowIso,
        });
      }
    }

    const updatedTicket = {
      ...existing,
      ...updates,
      timeline: updatedTimeline,
    };

    db.tickets[index] = updatedTicket;

    // Create notification if assigned or resolved
    if (updates.status === 'resolved') {
      db.notifications.unshift({
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: existing.reporterId,
        title: `✅ Ticket #${existing.id} Resolved!`,
        message: `Technician ${existing.assignedToName || 'Maintenance Lead'} has resolved "${existing.title}". Tap to view proof & rate service.`,
        type: 'ticket_resolved',
        priority: 'high',
        linkedTicketId: existing.id,
        isRead: false,
        createdAt: nowIso,
      });
    } else if (updates.assignedTo && updates.assignedTo !== existing.assignedTo) {
      db.notifications.unshift({
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: updates.assignedTo,
        title: `📋 Work Order #${existing.id} Assigned to You`,
        message: `Manager assigned "${existing.title}" in ${existing.building} to you. Target SLA: ${existing.priority.toUpperCase()}.`,
        type: 'ticket_assigned',
        priority: 'high',
        linkedTicketId: existing.id,
        isRead: false,
        createdAt: nowIso,
      });
    }

    bumpVersion();
    return updatedTicket;
  },

  getNotifications() {
    const db = loadDb();
    return db.notifications;
  },

  addNotification(notif) {
    const db = loadDb();
    const newNotif = {
      id: notif.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: notif.userId || 'broadcast',
      title: notif.title,
      message: notif.message,
      type: notif.type || 'system_alert',
      priority: notif.priority || 'normal',
      linkedTicketId: notif.linkedTicketId,
      linkedCameraId: notif.linkedCameraId,
      linkedAssetId: notif.linkedAssetId,
      isRead: false,
      createdAt: notif.createdAt || new Date().toISOString(),
    };
    db.notifications.unshift(newNotif);
    if (db.notifications.length > 100) db.notifications.pop();
    bumpVersion();
    return newNotif;
  },

  getAssets() {
    const db = loadDb();
    return db.assets;
  },

  saveAsset(asset) {
    const db = loadDb();
    const idx = db.assets.findIndex((a) => a.id === asset.id || a.assetTag === asset.assetTag);
    if (idx >= 0) {
      db.assets[idx] = { ...db.assets[idx], ...asset };
    } else {
      db.assets.push(asset);
    }
    bumpVersion();
    return asset;
  },

  getCCTV() {
    const db = loadDb();
    return db.cctvCameras;
  },

  saveCCTVCamera(camera) {
    const db = loadDb();
    const idx = db.cctvCameras.findIndex((c) => c.id === camera.id);
    if (idx >= 0) {
      db.cctvCameras[idx] = { ...db.cctvCameras[idx], ...camera };
    } else {
      db.cctvCameras.push(camera);
    }
    bumpVersion();
    return camera;
  },
};
