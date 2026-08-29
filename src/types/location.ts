export type WingType = 'east' | 'west' | 'north' | 'south' | 'central';

export type RoomType =
  | 'classroom'
  | 'lab'
  | 'office'
  | 'corridor'
  | 'washroom'
  | 'canteen'
  | 'library'
  | 'auditorium'
  | 'seminar_hall'
  | 'parking';

export interface RoomInfo {
  number: string; // e.g. "002", "101", "Lab-3"
  name: string; // e.g. "Computer Graphics Lab", "Lecture Hall 2"
  type: RoomType;
  capacity?: number;
}

export interface WingInfo {
  wing: WingType;
  label: string;
  rooms: RoomInfo[];
}

export interface FloorInfo {
  floorNumber: number; // 0 = Ground Floor, 1 = 1st Floor, etc.
  floorName: string; // e.g. "Ground Floor", "2nd Floor"
  wings: WingInfo[];
}

export interface BuildingInfo {
  id: string;
  name: string; // e.g. "Main Academic Block", "Science & Tech Tower"
  code: string; // e.g. "MAB", "STT"
  floors: FloorInfo[];
  totalRooms: number;
}
