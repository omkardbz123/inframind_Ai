import { BuildingInfo } from '../types/location';
import { UserProfile, DepartmentType } from '../types/user';

export const COLLEGE_CONFIG = {
  name: "MAEER's MIT Arts, Commerce & Science College (MIT ACSC), Alandi, Pune",
  shortName: 'MIT ACSC, Alandi',
  tagline: 'Affiliated to Savitribai Phule Pune University (SPPU) | Accredited with "A" Grade by NAAC',
  domain: 'mitacsc.ac.in',
  allowedDomains: ['mitacsc.ac.in', 'mitacsc.edu.in', 'college.edu', 'mit.edu', 'gmail.com'],
  supportEmail: 'facilities@mitacsc.ac.in',
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
    name: 'Lab & Projector AV Tech',
    icon: 'Monitor',
    color: 'indigo',
    description: 'Overhead classroom projectors, smart podiums, sound systems, lab PCs, and HDMI cables.',
    managerName: 'Prof. Anjali Deshmukh (IT Infrastructure Head)',
    subcategories: ['Projector Display / Bulb', 'Sound System & Mic', 'Smart Interactive Board', 'Lab PC Hardware', 'HDMI Cable / Switch', 'Podium Power'],
  },
  {
    id: 'janitorial',
    name: 'Janitorial & Sanitation',
    icon: 'Sparkles',
    color: 'emerald',
    description: 'Classroom cleanliness, washroom sanitization, garbage bins, spills, and hygiene.',
    managerName: 'Mrs. Rekha Jadhav (Sanitation Lead)',
    subcategories: ['Classroom Floor Cleaning', 'Washroom Deep Clean', 'Garbage Bin Overflow', 'Liquid Spill Clean', 'Window Glass Clean', 'Dusting & Sanitizing'],
  },
  {
    id: 'furniture',
    name: 'Furniture & Carpentry',
    icon: 'Armchair',
    color: 'orange',
    description: 'Student desks, teacher podiums, broken chairs, door latches, windows, and whiteboards.',
    managerName: 'Mr. Dilip Pawar (Estate Carpentry Lead)',
    subcategories: ['Student Desk / Bench', 'Teacher Chair / Desk', 'Door Handle / Lock', 'Window Glass / Latch', 'Green / White Board', 'Cupboard Drawer'],
  },
  {
    id: 'network',
    name: 'Campus Wi-Fi & LAN',
    icon: 'Wifi',
    color: 'cyan',
    description: 'Campus Wi-Fi access points, computer lab LAN ports, switches, and internet gateways.',
    managerName: 'Er. Vikas Mehta (Network Administrator)',
    subcategories: ['Wi-Fi Access Point Down', 'Lab LAN Port Dead', 'Slow Internet Speed', 'Network Switch Failure', 'Router Reboot Request'],
  },
];

export const CAMPUS_BUILDINGS: BuildingInfo[] = [
  {
    id: 'bldg-mit-main',
    name: 'MIT ACSC Main Academic Building',
    code: 'MAB',
    totalRooms: 48,
    floors: [
      {
        floorNumber: 0,
        floorName: 'Ground Floor',
        wings: [
          {
            wing: 'east',
            label: 'East Wing (Administration, Principal Secretariat & Admissions)',
            rooms: [
              { number: '001', name: 'Principal Secretariat & Dean Office', type: 'office', capacity: 20 },
              { number: '002', name: 'Student Facilitation & Examination Cell', type: 'office', capacity: 40 },
              { number: '003', name: 'Central Campus Server Room', type: 'office', capacity: 10 },
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
            label: 'West Wing (Animation & Multimedia Design)',
            rooms: [
              { number: '210', name: 'Animation & VFX Graphics Studio', type: 'lab', capacity: 40 },
              { number: '211', name: 'UI/UX & Mobile Computing Lab', type: 'lab', capacity: 40 },
              { number: '212', name: 'Classroom 212 (B.Sc Animation)', type: 'classroom', capacity: 60 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bldg-karad-tower',
    name: 'Dr. Vishwanath Karad Research Center',
    code: 'VRC',
    totalRooms: 24,
    floors: [
      {
        floorNumber: 0,
        floorName: 'Ground Floor',
        wings: [
          {
            wing: 'north',
            label: 'North Wing (Central Knowledge Resource Library)',
            rooms: [
              { number: 'LIB-G1', name: 'Digital Reference & E-Journal Section', type: 'library', capacity: 200 },
              { number: 'LIB-G2', name: 'Silent Reading Hall', type: 'library', capacity: 150 },
            ],
          },
        ],
      },
    ],
  },
];

export const DEMO_USERS: UserProfile[] = [
  {
    uid: 'user-student-01',
    email: 'omkar.student@mitacsc.ac.in',
    displayName: 'Omkar Sharma',
    role: 'student',
    collegeId: 'MITACSC-2024-CS-089',
    phone: '+91 98230 11223',
    isActive: true,
    createdAt: '2025-08-01T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    uid: 'user-teacher-01',
    email: 'dr.deshpande@mitacsc.ac.in',
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
    email: 'rajesh.electrician@mitacsc.ac.in',
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
    email: 'suresh.plumber@mitacsc.ac.in',
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
    email: 'nitin.avtech@mitacsc.ac.in',
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
    email: 'ramesh.manager@mitacsc.ac.in',
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
    email: 'principal.admin@mitacsc.ac.in',
    displayName: 'Dr. B. B. Waphare (Principal & Dean)',
    role: 'admin',
    employeeId: 'ADM-PRIN-001',
    phone: '+91 98200 99887',
    isActive: true,
    createdAt: '2021-01-01T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
];
