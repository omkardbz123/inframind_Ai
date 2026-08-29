import { DepartmentType } from './user';
import { WingType } from './location';

export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export type AssetStatus = 'operational' | 'faulty' | 'under_repair' | 'decommissioned';

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  performedBy: string;
  performedByName: string;
  cost: number;
  partsReplaced?: string[];
  linkedTicketId?: string;
  beforePhotoURL?: string;
  afterPhotoURL?: string;
}

export interface Asset {
  id: string;
  name: string; // e.g. "Crompton High-Speed Ceiling Fan"
  assetTag: string; // e.g. "FAN-MAB-102-01"
  category: DepartmentType;
  subcategory: string; // "fan", "led_light", "projector", "water_purifier", "air_conditioner"
  brand?: string;
  model?: string;
  serialNumber?: string;

  // Location
  building: string;
  floor: number;
  wing: WingType;
  roomNumber?: string;

  // Lifecycle
  installDate: string; // ISO date
  warrantyExpiry?: string;
  expectedLifespanYears: number; // e.g. 3 or 5 years
  ageInMonths: number;

  // Maintenance & Health
  lastMaintenanceDate?: string;
  maintenanceCount: number;
  totalMaintenanceCost: number;
  condition: AssetCondition;
  predictiveScore: number; // 0 - 100 Risk Score
  predictiveRiskReason?: string;

  // Status
  status: AssetStatus;
  qrCodeDataUrl?: string;
  notes?: string;

  maintenanceHistory: MaintenanceRecord[];
}
