import { WingType } from './location';

export type CCTVAnalysisResult = 'all_ok' | 'failure_detected' | 'inconclusive' | 'power_outage';

export interface CCTVSnapshotRecord {
  id: string;
  timestamp: string; // ISO
  imageURL: string;
  analysisResult: CCTVAnalysisResult;
  confidenceScore: number; // 0.0 - 1.0
  totalLEDsVisible: number;
  workingLEDs: number;
  failedLEDs: number;
  detectedIssues: string[];
  electricityStatus: 'on' | 'off';
  geminiExplanation: string;
  autoTicketId?: string;
}

export interface CCTVCamera {
  id: string;
  name: string; // e.g. "CAM-MAB-2F-CORRIDOR-E" or "CAM-PHONE-OMKAR-01"
  building: string;
  floor: number;
  wing: WingType;
  areaDescription: string; // e.g. "2nd Floor East Corridor (Rooms 201-208)"
  
  // Images
  referenceImageURL: string; // Base image when lights are verified ON
  referenceImageTimestamp: string;
  currentSnapshotURL: string;
  currentSnapshotTimestamp: string;

  // Status
  isActive: boolean;
  lastAnalysisResult: CCTVAnalysisResult;
  consecutiveFailures: number;
  electricityGridActive: boolean;

  // Phone CCTV Node Specifics
  isPhoneNode?: boolean;
  deviceBattery?: number;
  lastHeartbeat?: string;
  isLiveStreaming?: boolean;
  torchOn?: boolean;
  resolution?: string;

  // History
  snapshots: CCTVSnapshotRecord[];
}
