import { create } from 'zustand';
import { Asset, AssetCondition, AssetStatus, MaintenanceRecord } from '../types/asset';
import { DepartmentType } from '../types/user';
import { WingType } from '../types/location';

interface AddAssetParams {
  name: string;
  assetTag: string;
  category: DepartmentType;
  subcategory: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  building: string;
  floor: number;
  wing: WingType;
  roomNumber?: string;
  installDate: string;
  warrantyExpiry?: string;
  expectedLifespanYears: number;
  condition: AssetCondition;
  notes?: string;
}

interface AssetStoreState {
  assets: Asset[];
  searchQuery: string;
  selectedCategory: DepartmentType | 'all';
  selectedCondition: AssetCondition | 'all';

  // Actions
  addAsset: (params: AddAssetParams) => Asset;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  logMaintenance: (assetId: string, record: Omit<MaintenanceRecord, 'id'>) => void;
  recalculatePredictiveScores: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: DepartmentType | 'all') => void;
  setSelectedCondition: (condition: AssetCondition | 'all') => void;
}

const STORAGE_ASSETS_KEY = 'campuscare_assets_store';

function computePredictiveScore(asset: {
  installDate: string;
  expectedLifespanYears: number;
  maintenanceCount: number;
  condition: AssetCondition;
  lastMaintenanceDate?: string;
}): { score: number; reason: string } {
  const install = new Date(asset.installDate);
  const now = new Date();
  const ageMonths = Math.max(1, (now.getFullYear() - install.getFullYear()) * 12 + (now.getMonth() - install.getMonth()));
  const lifespanMonths = asset.expectedLifespanYears * 12;

  const ageRatio = Math.min(1.2, ageMonths / lifespanMonths);

  const conditionMap: Record<AssetCondition, number> = {
    excellent: 0.1,
    good: 0.25,
    fair: 0.5,
    poor: 0.8,
    critical: 1.0,
  };

  const conditionScore = conditionMap[asset.condition] || 0.3;

  // Maintenance frequency penalty
  const expectedMaintenance = (ageMonths / 12) * 1.5;
  const maintFrequencyRatio = Math.min(1.5, (asset.maintenanceCount || 0) / (expectedMaintenance || 1));

  // Calculate weighted index
  const rawScore = Math.round(
    (ageRatio * 0.35 + conditionScore * 0.35 + maintFrequencyRatio * 0.3) * 100
  );

  const score = Math.min(99, Math.max(12, rawScore));

  let reason = 'Asset operating within expected lifecycle parameters.';
  if (score >= 80) {
    reason = `Critical risk of imminent breakdown! Age (${Math.round(ageMonths / 12)} yrs) exceeds expected lifespan and condition is degraded.`;
  } else if (score >= 60) {
    reason = `Moderate degradation detected. Preventive bearing / capacitor overhaul scheduled soon.`;
  }

  return { score, reason };
}

const INITIAL_ASSETS: Asset[] = [
  {
    id: 'asset-fan-01',
    name: 'Crompton High-Speed 1200mm Ceiling Fan #3',
    assetTag: 'FAN-MAB-002-03',
    category: 'electrical',
    subcategory: 'Ceiling Fan',
    brand: 'Crompton Greaves',
    model: 'Aura Prime 70W',
    serialNumber: 'CG-2022-8871',
    building: 'Main Academic Block (MAB)',
    floor: 0,
    wing: 'east',
    roomNumber: '002',
    installDate: '2022-01-15',
    warrantyExpiry: '2024-01-15',
    expectedLifespanYears: 3,
    ageInMonths: 48,
    lastMaintenanceDate: '2025-09-10',
    maintenanceCount: 4,
    totalMaintenanceCost: 1450,
    condition: 'poor',
    predictiveScore: 89,
    predictiveRiskReason: 'Exceeded 3-year expected lifecycle (48 months in service). 4 prior capacitor & bearing repairs. Imminent motor failure risk.',
    status: 'under_repair',
    notes: 'Motor coil overheating noticed in summer semester.',
    maintenanceHistory: [
      {
        id: 'm-1',
        date: '2025-09-10',
        type: 'corrective',
        description: 'Replaced 2.5uF starting capacitor and lubricated ball bearings.',
        performedBy: 'user-electrician-01',
        performedByName: 'Rajesh Kamble',
        cost: 350,
        partsReplaced: ['EPCOS 2.5uF Capacitor'],
      },
    ],
  },
  {
    id: 'asset-ro-01',
    name: 'Kent Commercial 50 LPH RO Water Purifier',
    assetTag: 'RO-MAB-2F-W01',
    category: 'plumbing',
    subcategory: 'RO Water Purifier',
    brand: 'Kent RO Systems',
    model: 'Elite 50+',
    serialNumber: 'KT-RO-2023-401',
    building: 'Main Academic Block (MAB)',
    floor: 2,
    wing: 'west',
    roomNumber: '213',
    installDate: '2023-04-10',
    warrantyExpiry: '2024-04-10',
    expectedLifespanYears: 4,
    ageInMonths: 34,
    lastMaintenanceDate: '2026-01-15',
    maintenanceCount: 3,
    totalMaintenanceCost: 2200,
    condition: 'fair',
    predictiveScore: 74,
    predictiveRiskReason: 'Sediment and carbon pre-filters reaching 6-month saturation limit. TDS variance detected.',
    status: 'operational',
    notes: 'High student footfall water station on 2nd floor west corridor.',
    maintenanceHistory: [
      {
        id: 'm-2',
        date: '2026-01-15',
        type: 'preventive',
        description: 'TDS calibration and sediment filter cartridge renewal.',
        performedBy: 'user-plumber-01',
        performedByName: 'Suresh Patil',
        cost: 850,
        partsReplaced: ['Spun Sediment Filter 10"', 'Activated Carbon Block'],
      },
    ],
  },
  {
    id: 'asset-proj-01',
    name: 'Epson High-Lumen 3LCD Interactive Projector',
    assetTag: 'PROJ-MAB-101-01',
    category: 'technical',
    subcategory: 'Projector Display / Bulb',
    brand: 'Epson',
    model: 'EB-685Wi',
    serialNumber: 'EPS-2023-9921',
    building: 'Main Academic Block (MAB)',
    floor: 1,
    wing: 'east',
    roomNumber: '101',
    installDate: '2023-08-20',
    warrantyExpiry: '2025-08-20',
    expectedLifespanYears: 4,
    ageInMonths: 30,
    lastMaintenanceDate: '2025-11-05',
    maintenanceCount: 2,
    totalMaintenanceCost: 3500,
    condition: 'fair',
    predictiveScore: 68,
    predictiveRiskReason: 'Projector UHE lamp runtime exceeded 3,800 hours (Rated for 4,000h max). Dimming expected.',
    status: 'operational',
    notes: 'Used heavily 6 hours/day for SE Computer lectures.',
    maintenanceHistory: [],
  },
  {
    id: 'asset-led-01',
    name: 'Philips 20W T8 LED Batten Corridor Fixtures (Bank of 8)',
    assetTag: 'LED-MAB-2F-E-CORR',
    category: 'electrical',
    subcategory: 'LED Tube Light',
    brand: 'Philips Lumileds',
    model: 'Essential SmartBright 20W',
    serialNumber: 'PH-BATT-2024-08',
    building: 'Main Academic Block (MAB)',
    floor: 2,
    wing: 'east',
    installDate: '2024-02-01',
    expectedLifespanYears: 5,
    ageInMonths: 24,
    lastMaintenanceDate: '2025-08-20',
    maintenanceCount: 1,
    totalMaintenanceCost: 400,
    condition: 'fair',
    predictiveScore: 82,
    predictiveRiskReason: 'Night CCTV visual anomaly detected. 2 fixtures degraded in lumen output.',
    status: 'operational',
    maintenanceHistory: [],
  },
  {
    id: 'asset-ac-01',
    name: 'Daikin 2.0 Ton Inverter Cassette AC (Server Room)',
    assetTag: 'AC-MAB-003-SRV',
    category: 'electrical',
    subcategory: 'AC Power Supply',
    brand: 'Daikin',
    model: 'FCQ71EXV',
    serialNumber: 'DK-2024-1102',
    building: 'Main Academic Block (MAB)',
    floor: 0,
    wing: 'east',
    roomNumber: '003',
    installDate: '2024-01-10',
    warrantyExpiry: '2029-01-10',
    expectedLifespanYears: 7,
    ageInMonths: 25,
    lastMaintenanceDate: '2026-02-01',
    maintenanceCount: 1,
    totalMaintenanceCost: 1200,
    condition: 'excellent',
    predictiveScore: 22,
    predictiveRiskReason: 'Optimal refrigerant pressure and temperature telemetry. 24x7 cooling stable.',
    status: 'operational',
    maintenanceHistory: [],
  },
];

export const useAssetStore = create<AssetStoreState>((set, get) => {
  let initialAssets = INITIAL_ASSETS;
  try {
    const saved = localStorage.getItem(STORAGE_ASSETS_KEY);
    if (saved) {
      initialAssets = JSON.parse(saved);
    }
  } catch {
    initialAssets = INITIAL_ASSETS;
  }

  const persist = (assets: Asset[]) => {
    localStorage.setItem(STORAGE_ASSETS_KEY, JSON.stringify(assets));
  };

  return {
    assets: initialAssets,
    searchQuery: '',
    selectedCategory: 'all',
    selectedCondition: 'all',

    addAsset: (params: AddAssetParams) => {
      const state = get();
      const newId = `asset-${Date.now()}`;
      const install = new Date(params.installDate);
      const now = new Date();
      const ageMonths = Math.max(1, (now.getFullYear() - install.getFullYear()) * 12 + (now.getMonth() - install.getMonth()));

      const { score, reason } = computePredictiveScore({
        installDate: params.installDate,
        expectedLifespanYears: params.expectedLifespanYears,
        maintenanceCount: 0,
        condition: params.condition,
      });

      const newAsset: Asset = {
        id: newId,
        name: params.name,
        assetTag: params.assetTag,
        category: params.category,
        subcategory: params.subcategory,
        brand: params.brand,
        model: params.model,
        serialNumber: params.serialNumber,
        building: params.building,
        floor: params.floor,
        wing: params.wing,
        roomNumber: params.roomNumber,
        installDate: params.installDate,
        warrantyExpiry: params.warrantyExpiry,
        expectedLifespanYears: params.expectedLifespanYears,
        ageInMonths: ageMonths,
        maintenanceCount: 0,
        totalMaintenanceCost: 0,
        condition: params.condition,
        predictiveScore: score,
        predictiveRiskReason: reason,
        status: 'operational',
        notes: params.notes,
        maintenanceHistory: [],
      };

      const updated = [newAsset, ...state.assets];
      set({ assets: updated });
      persist(updated);
      return newAsset;
    },

    updateAsset: (id: string, updates: Partial<Asset>) => {
      const state = get();
      const updated = state.assets.map((a) => (a.id === id ? { ...a, ...updates } : a));
      set({ assets: updated });
      persist(updated);
    },

    logMaintenance: (assetId: string, record: Omit<MaintenanceRecord, 'id'>) => {
      const state = get();
      const newRecordId = `m-${Date.now()}`;
      const newRecord: MaintenanceRecord = { id: newRecordId, ...record };

      const updated = state.assets.map((a) => {
        if (a.id === assetId) {
          const newCount = (a.maintenanceCount || 0) + 1;
          const newCost = (a.totalMaintenanceCost || 0) + record.cost;
          const { score, reason } = computePredictiveScore({
            installDate: a.installDate,
            expectedLifespanYears: a.expectedLifespanYears,
            maintenanceCount: newCount,
            condition: a.condition,
            lastMaintenanceDate: record.date,
          });

          return {
            ...a,
            lastMaintenanceDate: record.date,
            maintenanceCount: newCount,
            totalMaintenanceCost: newCost,
            predictiveScore: score,
            predictiveRiskReason: reason,
            maintenanceHistory: [newRecord, ...a.maintenanceHistory],
          };
        }
        return a;
      });

      set({ assets: updated });
      persist(updated);
    },

    recalculatePredictiveScores: () => {
      const state = get();
      const updated = state.assets.map((a) => {
        const { score, reason } = computePredictiveScore({
          installDate: a.installDate,
          expectedLifespanYears: a.expectedLifespanYears,
          maintenanceCount: a.maintenanceCount,
          condition: a.condition,
          lastMaintenanceDate: a.lastMaintenanceDate,
        });
        return {
          ...a,
          predictiveScore: score,
          predictiveRiskReason: reason,
        };
      });
      set({ assets: updated });
      persist(updated);
    },

    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
    setSelectedCondition: (selectedCondition) => set({ selectedCondition }),
  };
});
