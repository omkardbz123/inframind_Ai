import { BuildingInfo } from '../types/location';
import { UserProfile, DepartmentType } from '../types/user';

export const COLLEGE_CONFIG = {
  name: "MAEER's MIT Arts, Commerce & Science College (MIT ACSC), Alandi, Pune",
  shortName: 'MIT ACSC, Alandi',
  tagline: 'Affiliated to Savitribai Phule Pune University (SPPU) | Accredited with "A" Grade by NAAC',
  domain: 'mitacsc.edu.in',
  allowedDomains: ['mitacsc.edu.in', 'mitacsc.ac.in', 'gmail.com'],
  supportEmail: 'facilities@mitacsc.edu.in',
  emergencyHelpline: '+91 20 3025 3500',
  ambulanceHelpline: '108',
  fireHelpline: '101',
  securityOffice: 'Main Security Gate, Alandi Campus Ground Floor',
};

export const DEPARTMENTS: {
  id: DepartmentType;
  name: string;
  icon: string;
  color: string;
  description: string;
  managerName: string;
  subcategories: string[];
}[] = [
  {
    id: 'electrical',
    name: 'Electrical Maintenance',
    icon: 'Zap',
    color: 'maroon',
    description: 'Corridor LED fixtures, classroom ceiling fans, switchboards, MCB trip, and power backup.',
    managerName: 'Er. Ramesh Kulkarni (Chief Electrical Supervisor)',
    subcategories: ['LED Tube Light', 'Ceiling Fan', 'Power Socket / Switch', 'Exhaust Fan', 'MCB Tripping', 'Corridor Lighting', 'AC Power Supply'],
  },
  {
    id: 'plumbing',
    name: 'Plumbing & RO Water',
    icon: 'Droplets',
    color: 'blue',
    description: 'Commercial RO water purifiers, washroom taps, drainage, coolers, and pipeline leaks.',
    managerName: 'Mr. Suresh Patil (Estate Plumbing Supervisor)',
    subcategories: ['RO Water Purifier', 'Washroom Tap Leak', 'Water Cooler', 'Drainage Blockage', 'Flush Tank Issue', 'Pipeline Burst', 'Low Water Pressure'],
  },
  {
    id: 'technical',
    name: 'Lab & IT Audio-Visual',
    icon: 'Monitor',
    color: 'emerald',
    description: 'Ceiling projectors, smart podiums, computer lab workstations, LAN switches, and PA speakers.',
    managerName: 'Mr. Nitin Gore (Senior System & AV Administrator)',
    subcategories: ['Ceiling Projector', 'Smart Board / Podium', 'Computer Lab PC', 'Wi-Fi / LAN Switch', 'Classroom PA Speaker', 'UPS Power Failure'],
  },
  {
    id: 'janitorial',
    name: 'Housekeeping & Cleanliness',
    icon: 'Sparkles',
    color: 'amber',
    description: 'Classroom cleanliness, desk sanitization, washroom hygiene, waste bins, and water spill clearing.',
    managerName: 'Mrs. Sunita Jadhav (Housekeeping Superintendent)',
    subcategories: ['Classroom Dusting & Desks', 'Washroom Deep Cleaning', 'Floor Spill / Water Hazard', 'Dustbin Overflow', 'Window Glass Cleaning'],
  },
  {
    id: 'furniture',
    name: 'Civil & Furniture Works',
    icon: 'Hammer',
    color: 'purple',
    description: 'Door hinges, window latch, student bench repairs, floor tiles, and ceiling plaster inspection.',
    managerName: 'Er. Sandeep Mane (Civil Infrastructure Engineer)',
    subcategories: ['Door Handle / Lock', 'Broken Student Bench', 'Window Glass / Latch', 'Loose Floor Tile', 'Ceiling Crack / Leakage', 'Notice Board Repair'],
  },
];

export const CAMPUS_BUILDINGS: BuildingInfo[] = [
  {
    id: 'bld-mab',
    name: 'Main Academic Building (MAB)',
    code: 'MAB',
    totalRooms: 45,
    floors: [
      {
        floorNumber: 0,
        floorName: 'Ground Floor',
        wings: [
          {
            wing: 'east',
            label: 'East Wing (Administration & Admissions)',
            rooms: [
              { number: '001', name: 'Principal Office & Dean Secretariat', type: 'office' },
              { number: '002', name: 'Student Admissions & Accounts Hall', type: 'office' },
              { number: '003', name: 'Central Staff Room (Junior College)', type: 'office' },
              { number: '004', name: 'Ground Floor East Restroom (G-E-RR)', type: 'washroom' },
            ],
          },
          {
            wing: 'west',
            label: 'West Wing (First Year B.Sc / BCA Lecture Halls)',
            rooms: [
              { number: '010', name: 'Lecture Hall 010 (B.Sc CS)', type: 'classroom', capacity: 80 },
              { number: '011', name: 'Lecture Hall 011 (BCA)', type: 'classroom', capacity: 80 },
              { number: '012', name: 'Electronics & Digital Systems Lab', type: 'lab', capacity: 45 },
              { number: '013', name: 'Ground Floor Water Purifier Station (G-W-RO)', type: 'corridor' },
            ],
          },
          {
            wing: 'central',
            label: 'Central Atrium & Auditorium Lobby',
            rooms: [
              { number: 'AUD-1', name: 'Swami Vivekananda Central Auditorium', type: 'auditorium', capacity: 500 },
              { number: 'CAN-1', name: 'MIT ACSC Cafeteria Hub', type: 'canteen', capacity: 200 },
            ],
          },
        ],
      },
      {
        floorNumber: 1,
        floorName: '1st Floor',
        wings: [
          {
            wing: 'east',
            label: 'East Wing (Computer Science & AI Labs)',
            rooms: [
              { number: '101', name: 'Classroom 101 (TY B.Sc CS)', type: 'classroom', capacity: 75 },
              { number: '102', name: 'Classroom 102 (TY BCA)', type: 'classroom', capacity: 75 },
              { number: '103', name: 'AI & Data Analytics Lab', type: 'lab', capacity: 45 },
              { number: '104', name: 'Cloud Computing & Web Tech Lab', type: 'lab', capacity: 45 },
            ],
          },
          {
            wing: 'west',
            label: 'West Wing (Commerce, BBA & B.Com Classrooms)',
            rooms: [
              { number: '110', name: 'Classroom 110 (SY BBA IB)', type: 'classroom', capacity: 70 },
              { number: '111', name: 'Classroom 111 (SY B.Com)', type: 'classroom', capacity: 70 },
              { number: '112', name: 'Accounting & Finance Simulation Lab', type: 'lab', capacity: 40 },
              { number: '113', name: '1st Floor RO Water Station (1F-W-RO)', type: 'corridor' },
            ],
          },
        ],
      },
      {
        floorNumber: 2,
        floorName: '2nd Floor',
        wings: [
          {
            wing: 'east',
            label: 'East Wing (M.Sc CS & MCA PG Section)',
            rooms: [
              { number: '201', name: 'Classroom 201 (M.Sc CS Sem-1)', type: 'classroom', capacity: 60 },
              { number: '202', name: 'Classroom 202 (M.Sc CS Sem-3)', type: 'classroom', capacity: 60 },
              { number: '203', name: 'PG Project & Research Lab', type: 'lab', capacity: 35 },
              { number: '205', name: '2nd Floor East Corridor (CCTV Cam Hub)', type: 'corridor' },
            ],
          },
          {
            wing: 'west',
            label: 'West Wing (Faculty Cabins & Meeting Rooms)',
            rooms: [
              { number: '210', name: 'Head of Department (Computer Science)', type: 'office' },
              { number: '211', name: 'Faculty Cabin Complex A', type: 'office' },
              { number: '212', name: 'IQAC & NAAC Quality Cell', type: 'office' },
              { number: '214', name: '2nd Floor RO Cooler Station (2F-W-RO)', type: 'corridor' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bld-rnd',
    name: 'Dr. Vishwanath Karad Research Tower',
    code: 'RND',
    totalRooms: 15,
    floors: [
      {
        floorNumber: 0,
        floorName: 'Ground Floor',
        wings: [
          {
            wing: 'central',
            label: 'Innovation Hub & Robotics Centre',
            rooms: [
              { number: 'R-001', name: 'Robotics & IoT Prototyping Lab', type: 'lab', capacity: 30 },
              { number: 'R-002', name: 'Hardware Fabrication Workshop', type: 'lab', capacity: 25 },
            ],
          },
        ],
      },
      {
        floorNumber: 1,
        floorName: '1st Floor',
        wings: [
          {
            wing: 'central',
            label: 'Central Digital Library & Reading Arena',
            rooms: [
              { number: 'LIB-1', name: 'Central Digital Knowledge Repository', type: 'library', capacity: 200 },
              { number: 'LIB-2', name: 'Faculty Research Cubicles', type: 'library', capacity: 40 },
            ],
          },
        ],
      },
    ],
  },
];

export const CAMPUS_LOCATIONS = CAMPUS_BUILDINGS;

export const DEMO_USERS: UserProfile[] = [
  {
    uid: 'user-student-01',
    email: '5454317@mitacsc.edu.in',
    displayName: 'Omkar Bhujbal',
    photoURL: '/avatars/user_5454317.png',
    role: 'student',
    collegeId: 'MITACSC-2024-CS-089',
    phone: '+91 98230 11223',
    isActive: true,
    createdAt: '2025-08-01T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    uid: 'user-teacher-01',
    email: 'dr.deshpande@mitacsc.edu.in',
    displayName: 'Dr. Rajiv Deshpande (Prof. CS)',
    role: 'teacher',
    collegeId: 'MITACSC-FAC-042',
    phone: '+91 98220 44556',
    isActive: true,
    createdAt: '2024-06-15T09:30:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    uid: 'user-electrician-01',
    email: 'rajesh.electrician@mitacsc.edu.in',
    displayName: 'Rajesh Kamble (Senior Electrician)',
    role: 'employee',
    department: 'electrical',
    employeeId: 'EMP-ELEC-012',
    phone: '+91 97654 32101',
    isActive: true,
    createdAt: '2023-01-10T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    uid: 'user-plumber-01',
    email: 'suresh.plumber@mitacsc.edu.in',
    displayName: 'Suresh Patil (Plumbing Tech)',
    role: 'employee',
    department: 'plumbing',
    employeeId: 'EMP-PLUMB-007',
    phone: '+91 97654 88990',
    isActive: true,
    createdAt: '2023-03-20T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    uid: 'user-tech-01',
    email: 'nitin.avtech@mitacsc.edu.in',
    displayName: 'Nitin Gore (Audio-Visual & Lab Tech)',
    role: 'employee',
    department: 'technical',
    employeeId: 'EMP-TECH-019',
    phone: '+91 98811 22334',
    isActive: true,
    createdAt: '2023-07-12T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    uid: 'user-manager-01',
    email: 'ramesh.manager@mitacsc.edu.in',
    displayName: 'Er. Ramesh Kulkarni (Facilities Manager)',
    role: 'manager',
    department: 'electrical',
    employeeId: 'MGR-ESTATE-002',
    phone: '+91 94220 11998',
    isActive: true,
    createdAt: '2022-04-01T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    uid: 'user-admin-01',
    email: 'principal.admin@mitacsc.edu.in',
    displayName: 'Dr. B. B. Waphare (Principal & Dean)',
    role: 'admin',
    employeeId: 'ADM-PRIN-001',
    phone: '+91 98200 99887',
    isActive: true,
    createdAt: '2021-01-01T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
];
