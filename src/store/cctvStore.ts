import { create } from 'zustand';
import { CCTVCamera, CCTVSnapshotRecord, CCTVAnalysisResult } from '../types/cctv';
import { compareCCTVImagesWithGemini } from '../lib/gemini';
import { sendTransactionalEmail } from '../lib/emailSimulator';
import { useTicketStore } from './ticketStore';

interface CCTVStoreState {
  cameras: CCTVCamera[];
  selectedCameraId: string;
  isAnalyzing: boolean;
  activeElectricityGrid: boolean;

  // Actions
  selectCamera: (id: string) => void;
  toggleElectricityGrid: (status?: boolean) => void;
  runCameraAnalysis: (cameraId: string, customApiKey?: string) => Promise<CCTVSnapshotRecord>;
  updateCameraImages: (cameraId: string, refImage?: string, currentImage?: string) => void;
  setPresetScenario: (
    cameraId: string,
    scenario: 'all_ok' | 'two_leds_dead' | 'flicker_dim' | 'power_cut'
  ) => void;

  // Phone CCTV Node Management
  registerPhoneNode: (cameraData: Partial<CCTVCamera>) => CCTVCamera;
  updatePhoneHeartbeat: (
    cameraId: string,
    snapshotBase64?: string,
    battery?: number,
    torch?: boolean
  ) => void;
  removeCamera: (cameraId: string) => void;
}

const STORAGE_CCTV_KEY = 'campuscare_cctv_store';

// High quality sample images for reference & night comparison
const REF_CORRIDOR_ON =
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'; // Bright illuminated corridor
const CURRENT_CORRIDOR_DEFECT =
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'; // Dim/dark segment corridor
const CURRENT_CORRIDOR_OK =
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80';
const CURRENT_BLACKOUT =
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'; // Pitch dark

const INITIAL_CAMERAS: CCTVCamera[] = [
  {
    id: 'CAM-MAB-2F-EAST-01',
    name: 'CAM-MAB-2F-EAST-01 (Corridor Ceiling)',
    building: 'Main Academic Building (MAB)',
    floor: 2,
    wing: 'east',
    areaDescription: '2nd Floor East Corridor (Overhead Rooms 201-208)',
    referenceImageURL: REF_CORRIDOR_ON,
    referenceImageTimestamp: '2026-08-20T19:00:00Z',
    currentSnapshotURL: CURRENT_CORRIDOR_DEFECT,
    currentSnapshotTimestamp: new Date().toISOString(),
    isActive: true,
    lastAnalysisResult: 'failure_detected',
    consecutiveFailures: 2,
    electricityGridActive: true,
    isPhoneNode: false,
    snapshots: [
      {
        id: 'snap-1',
        timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
        imageURL: CURRENT_CORRIDOR_DEFECT,
        analysisResult: 'failure_detected',
        confidenceScore: 0.94,
        totalLEDsVisible: 8,
        workingLEDs: 6,
        failedLEDs: 2,
        detectedIssues: [
          'LED Fixture #3 (near room 202) is unlit.',
          'LED Fixture #7 shows severe lumen drop (65% below baseline).',
        ],
        electricityStatus: 'on',
        geminiExplanation:
          'Comparison against baseline confirms localized electrical driver failure in East corridor fixtures while building grid remains powered.',
        autoTicketId: 'T-2026-0104',
      },
    ],
  },
  {
    id: 'CAM-MAB-0F-ATRIUM-02',
    name: 'CAM-MAB-0F-ATRIUM-02 (Central Lobby)',
    building: 'Main Academic Building (MAB)',
    floor: 0,
    wing: 'central',
    areaDescription: 'Ground Floor Central Atrium & Auditorium Lobby',
    referenceImageURL: REF_CORRIDOR_ON,
    referenceImageTimestamp: '2026-08-20T19:00:00Z',
    currentSnapshotURL: CURRENT_CORRIDOR_OK,
    currentSnapshotTimestamp: new Date().toISOString(),
    isActive: true,
    lastAnalysisResult: 'all_ok',
    consecutiveFailures: 0,
    electricityGridActive: true,
    isPhoneNode: false,
    snapshots: [
      {
        id: 'snap-2',
        timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
        imageURL: CURRENT_CORRIDOR_OK,
        analysisResult: 'all_ok',
        confidenceScore: 0.98,
        totalLEDsVisible: 12,
        workingLEDs: 12,
        failedLEDs: 0,
        detectedIssues: ['All 12 high-bay atrium LEDs working at 100% lumen output.'],
        electricityStatus: 'on',
        geminiExplanation: 'Visual pattern matches daytime baseline calibration.',
      },
    ],
  },
  {
    id: 'CAM-PHONE-LIVE-DEMO',
    name: '📱 Phone CCTV Node #1 (Classroom 101)',
    building: 'Main Academic Building (MAB)',
    floor: 1,
    wing: 'east',
    areaDescription: 'Classroom 101 Ceiling LED Array & Projector Screen',
    referenceImageURL: REF_CORRIDOR_ON,
    referenceImageTimestamp: '2026-08-20T19:00:00Z',
    currentSnapshotURL: CURRENT_CORRIDOR_OK,
    currentSnapshotTimestamp: new Date().toISOString(),
    isActive: true,
    isPhoneNode: true,
    isLiveStreaming: true,
    deviceBattery: 88,
    lastHeartbeat: new Date().toISOString(),
    lastAnalysisResult: 'all_ok',
    consecutiveFailures: 0,
    electricityGridActive: true,
    snapshots: [],
  },
];

// Setup Broadcast Channel for Cross-Tab / Cross-Device Phone Sync
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('campuscare_cctv_sync');
  }
} catch {
  // BroadcastChannel fallback
}

export const useCCTVStore = create<CCTVStoreState>((set, get) => {
  let initial = INITIAL_CAMERAS;
  try {
    const saved = localStorage.getItem(STORAGE_CCTV_KEY);
    if (saved) {
      initial = JSON.parse(saved);
    }
  } catch {
    initial = INITIAL_CAMERAS;
  }

  const persist = (cameras: CCTVCamera[]) => {
    try {
      localStorage.setItem(STORAGE_CCTV_KEY, JSON.stringify(cameras));
    } catch {
      // Storage quota safety
    }
  };

  // Listen for broadcast sync messages
  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'REGISTER_PHONE' || type === 'UPDATE_HEARTBEAT') {
        const state = get();
        const existingIdx = state.cameras.findIndex((c) => c.id === payload.id);
        let updated: CCTVCamera[];
        if (existingIdx >= 0) {
          updated = [...state.cameras];
          updated[existingIdx] = { ...updated[existingIdx], ...payload };
        } else {
          updated = [payload, ...state.cameras];
        }
        set({ cameras: updated });
        persist(updated);
      } else if (type === 'GRID_TOGGLE') {
        set({ activeElectricityGrid: payload.gridActive });
      }
    };
  }

  return {
    cameras: initial,
    selectedCameraId: initial[0].id,
    isAnalyzing: false,
    activeElectricityGrid: true,

    selectCamera: (id: string) => set({ selectedCameraId: id }),

    toggleElectricityGrid: (status?: boolean) => {
      set((state) => {
        const next = status !== undefined ? status : !state.activeElectricityGrid;
        const updatedCameras = state.cameras.map((c) => ({
          ...c,
          electricityGridActive: next,
        }));
        persist(updatedCameras);

        if (syncChannel) {
          syncChannel.postMessage({
            type: 'GRID_TOGGLE',
            payload: { gridActive: next },
          });
        }

        return { activeElectricityGrid: next, cameras: updatedCameras };
      });
    },

    registerPhoneNode: (cameraData: Partial<CCTVCamera>) => {
      const state = get();
      const newId = cameraData.id || `CAM-PHONE-${Math.floor(100 + Math.random() * 900)}`;

      const phoneCamera: CCTVCamera = {
        id: newId,
        name: cameraData.name || `📱 Smartphone Node (${newId})`,
        building: cameraData.building || 'Main Academic Building (MAB)',
        floor: cameraData.floor ?? 1,
        wing: cameraData.wing || 'east',
        areaDescription: cameraData.areaDescription || 'Classroom / Corridor Light Sensor',
        referenceImageURL: cameraData.referenceImageURL || REF_CORRIDOR_ON,
        referenceImageTimestamp: new Date().toISOString(),
        currentSnapshotURL: cameraData.currentSnapshotURL || CURRENT_CORRIDOR_OK,
        currentSnapshotTimestamp: new Date().toISOString(),
        isActive: true,
        isPhoneNode: true,
        isLiveStreaming: true,
        deviceBattery: cameraData.deviceBattery ?? 92,
        lastHeartbeat: new Date().toISOString(),
        lastAnalysisResult: 'all_ok',
        consecutiveFailures: 0,
        electricityGridActive: state.activeElectricityGrid,
        snapshots: [],
      };

      const filtered = state.cameras.filter((c) => c.id !== newId);
      const updated = [phoneCamera, ...filtered];

      set({ cameras: updated, selectedCameraId: newId });
      persist(updated);

      if (syncChannel) {
        syncChannel.postMessage({
          type: 'REGISTER_PHONE',
          payload: phoneCamera,
        });
      }

      return phoneCamera;
    },

    updatePhoneHeartbeat: (cameraId, snapshotBase64, battery, torch) => {
      const state = get();
      const updated = state.cameras.map((c) => {
        if (c.id === cameraId) {
          return {
            ...c,
            currentSnapshotURL: snapshotBase64 || c.currentSnapshotURL,
            currentSnapshotTimestamp: new Date().toISOString(),
            lastHeartbeat: new Date().toISOString(),
            isLiveStreaming: true,
            isActive: true,
            deviceBattery: battery !== undefined ? battery : c.deviceBattery,
            torchOn: torch !== undefined ? torch : c.torchOn,
          };
        }
        return c;
      });

      set({ cameras: updated });
      persist(updated);

      if (syncChannel) {
        syncChannel.postMessage({
          type: 'UPDATE_HEARTBEAT',
          payload: {
            id: cameraId,
            currentSnapshotURL: snapshotBase64,
            deviceBattery: battery,
            torchOn: torch,
            lastHeartbeat: new Date().toISOString(),
          },
        });
      }
    },

    removeCamera: (cameraId: string) => {
      const state = get();
      const updated = state.cameras.filter((c) => c.id !== cameraId);
      set({
        cameras: updated,
        selectedCameraId: updated[0]?.id || '',
      });
      persist(updated);
    },

    setPresetScenario: (cameraId, scenario) => {
      const state = get();
      const updated = state.cameras.map((c) => {
        if (c.id === cameraId) {
          let snapUrl = CURRENT_CORRIDOR_OK;
          let gridOn = true;
          if (scenario === 'two_leds_dead' || scenario === 'flicker_dim') {
            snapUrl = CURRENT_CORRIDOR_DEFECT;
          } else if (scenario === 'power_cut') {
            snapUrl = CURRENT_BLACKOUT;
            gridOn = false;
          }
          return {
            ...c,
            currentSnapshotURL: snapUrl,
            currentSnapshotTimestamp: new Date().toISOString(),
            electricityGridActive: gridOn,
          };
        }
        return c;
      });

      set({ cameras: updated });
      persist(updated);
    },

    updateCameraImages: (cameraId, refImage, currentImage) => {
      const state = get();
      const updated = state.cameras.map((c) => {
        if (c.id === cameraId) {
          return {
            ...c,
            referenceImageURL: refImage || c.referenceImageURL,
            currentSnapshotURL: currentImage || c.currentSnapshotURL,
            currentSnapshotTimestamp: new Date().toISOString(),
          };
        }
        return c;
      });

      set({ cameras: updated });
      persist(updated);
    },

    runCameraAnalysis: async (cameraId: string, customApiKey?: string) => {
      const state = get();
      const camera = state.cameras.find((c) => c.id === cameraId);
      if (!camera) throw new Error('Camera not found');

      set({ isAnalyzing: true });

      try {
        const isGridOn = state.activeElectricityGrid && camera.electricityGridActive;
        const result = await compareCCTVImagesWithGemini(
          camera.referenceImageURL,
          camera.currentSnapshotURL,
          isGridOn,
          {
            building: camera.building,
            floor: camera.floor,
            wing: camera.wing,
            area: camera.areaDescription,
          },
          customApiKey
        );

        let autoTicketId: string | undefined = undefined;

        // If failure detected, create auto work order
        if (result.status === 'failure_detected') {
          const ticketStore = useTicketStore.getState();
          const autoTicket = await ticketStore.createTicket({
            title: `AI Vision Alert: ${camera.areaDescription} LED Failure`,
            description: `Automated CCTV inspection identified ${result.failedLEDs} failed LED fixture(s). Issues: ${result.detectedIssues.join(', ')}. Gemini Recommendation: ${result.recommendation}`,
            category: 'electrical',
            subcategory: 'LED Tube Light',
            priority: 'high',
            building: camera.building,
            floor: camera.floor,
            wing: camera.wing,
            locationDescription: camera.areaDescription,
            reporterId: 'system-cctv-ai',
            reporterName: `CCTV Node (${camera.name})`,
            reporterEmail: 'facilities.electrical@mitacsc.edu.in',
            reporterRole: 'Automated AI Monitor',
            isAutoDetected: true,
            source: 'cctv',
            aiAnalysis: `Gemini 3.5 Flash Lite Confidence: ${Math.round(result.confidence * 100)}%. ${result.recommendation}`,
            urgencyScore: 88,
          });

          autoTicketId = autoTicket.id;

          // Dispatch email alert to Electrical dept head & Admin
          sendTransactionalEmail({
            to: 'facilities.electrical@mitacsc.edu.in',
            subject: `🚨 [CCTV AI Alert] LED Failure in ${camera.areaDescription} (Ticket #${autoTicket.id})`,
            template: 'LEDFailureAlert',
            ticket: autoTicket,
            customData: {
              cameraName: camera.name,
              areaDescription: camera.areaDescription,
              confidence: `${Math.round(result.confidence * 100)}%`,
              ticketId: autoTicket.id,
            },
            hasPdfAttachment: true,
          });
        }

        const snapshotRecord: CCTVSnapshotRecord = {
          id: `snap-${Date.now()}`,
          timestamp: new Date().toISOString(),
          imageURL: camera.currentSnapshotURL,
          analysisResult: result.status,
          confidenceScore: result.confidence,
          totalLEDsVisible: result.totalLEDsVisible,
          workingLEDs: result.workingLEDs,
          failedLEDs: result.failedLEDs,
          detectedIssues: result.detectedIssues,
          electricityStatus: result.electricityStatus,
          geminiExplanation: result.recommendation,
          autoTicketId,
        };

        const updatedCameras = state.cameras.map((c) => {
          if (c.id === cameraId) {
            const consecutive = result.status === 'failure_detected' ? (c.consecutiveFailures || 0) + 1 : 0;
            return {
              ...c,
              lastAnalysisResult: result.status,
              consecutiveFailures: consecutive,
              snapshots: [snapshotRecord, ...(c.snapshots || [])].slice(0, 20),
            };
          }
          return c;
        });

        set({ cameras: updatedCameras, isAnalyzing: false });
        persist(updatedCameras);

        return snapshotRecord;
      } catch (err) {
        set({ isAnalyzing: false });
        throw err;
      }
    },
  };
});
