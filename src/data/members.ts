export interface Member {
  id: string;
  fullName: string;
  registerNumber: string;
  department: string;
  classSection: string;
  year: number;
  collegeEmail: string;
  phone: string;
  joinedAt: string;
  status: 'Active' | 'Inactive';
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  technicalInterests?: string[];
  skills?: string[];
  profileCompletion?: number;
}

export const mockMembers: Member[] = [
  {
    id: 'm1',
    fullName: 'Rahul Sharma',
    registerNumber: '21BCE1001',
    department: 'CSE',
    classSection: 'A',
    year: 3,
    collegeEmail: 'rahul.sharma@college.edu',
    phone: '+91 9876543210',
    joinedAt: '2025-08-15',
    status: 'Active'
  },
  {
    id: 'm2',
    fullName: 'Sneha Patel',
    registerNumber: '21BCE1045',
    department: 'CSE',
    classSection: 'B',
    year: 3,
    collegeEmail: 'sneha.patel@college.edu',
    phone: '+91 9876543211',
    joinedAt: '2025-08-20',
    status: 'Active'
  },
  {
    id: 'm3',
    fullName: 'Aditya Kumar',
    registerNumber: '22BIT2015',
    department: 'IT',
    classSection: 'A',
    year: 2,
    collegeEmail: 'aditya.kumar@college.edu',
    phone: '+91 9876543212',
    joinedAt: '2026-01-10',
    status: 'Active'
  },
  {
    id: 'm4',
    fullName: 'Priya Singh',
    registerNumber: '20BEC3092',
    department: 'ECE',
    classSection: 'C',
    year: 4,
    collegeEmail: 'priya.singh@college.edu',
    phone: '+91 9876543213',
    joinedAt: '2024-09-05',
    status: 'Inactive'
  },
  {
    id: 'm5',
    fullName: 'Vikram Reddy',
    registerNumber: '22BCE1104',
    department: 'CSE',
    classSection: 'C',
    year: 2,
    collegeEmail: 'vikram.reddy@college.edu',
    phone: '+91 9876543214',
    joinedAt: '2026-02-14',
    status: 'Active'
  },
  {
    id: 'm6',
    fullName: 'Neha Gupta',
    registerNumber: '23BAI4001',
    department: 'AI&DS',
    classSection: 'A',
    year: 1,
    collegeEmail: 'neha.gupta@college.edu',
    phone: '+91 9876543215',
    joinedAt: '2026-08-01',
    status: 'Active'
  },
  {
    id: 'm7',
    fullName: 'Ananya Desai',
    registerNumber: '21BIT2088',
    department: 'IT',
    classSection: 'B',
    year: 3,
    collegeEmail: 'ananya.desai@college.edu',
    phone: '+91 9876543216',
    joinedAt: '2025-09-12',
    status: 'Active'
  },
  {
    id: 'm8',
    fullName: 'Rohan Mehta',
    registerNumber: '21BCE1205',
    department: 'CSE',
    classSection: 'D',
    year: 3,
    collegeEmail: 'rohan.mehta@college.edu',
    phone: '+91 9876543217',
    joinedAt: '2025-08-25',
    status: 'Active'
  },
  {
    id: 'm9',
    fullName: 'Karthik Iyer',
    registerNumber: '20BCE1055',
    department: 'CSE',
    classSection: 'B',
    year: 4,
    collegeEmail: 'karthik.iyer@college.edu',
    phone: '+91 9876543218',
    joinedAt: '2024-08-15',
    status: 'Active'
  },
  {
    id: 'm10',
    fullName: 'Meera Joshi',
    registerNumber: '22BEC3011',
    department: 'ECE',
    classSection: 'A',
    year: 2,
    collegeEmail: 'meera.joshi@college.edu',
    phone: '+91 9876543219',
    joinedAt: '2026-01-20',
    status: 'Active'
  },
  {
    id: 'm11',
    fullName: 'Arjun Nair',
    registerNumber: '23BCE1099',
    department: 'CSE',
    classSection: 'B',
    year: 1,
    collegeEmail: 'arjun.nair@college.edu',
    phone: '+91 9876543220',
    joinedAt: '2026-08-10',
    status: 'Active'
  },
  {
    id: 'm12',
    fullName: 'Sanya Kapoor',
    registerNumber: '22BAI4045',
    department: 'AI&DS',
    classSection: 'B',
    year: 2,
    collegeEmail: 'sanya.kapoor@college.edu',
    phone: '+91 9876543221',
    joinedAt: '2026-02-05',
    status: 'Inactive'
  },
  {
    id: 'm13',
    fullName: 'Ishaan Verma',
    registerNumber: '21BEC3102',
    department: 'ECE',
    classSection: 'C',
    year: 3,
    collegeEmail: 'ishaan.verma@college.edu',
    phone: '+91 9876543222',
    joinedAt: '2025-09-01',
    status: 'Active'
  },
  {
    id: 'm14',
    fullName: 'Tara Menon',
    registerNumber: '20BIT2022',
    department: 'IT',
    classSection: 'A',
    year: 4,
    collegeEmail: 'tara.menon@college.edu',
    phone: '+91 9876543223',
    joinedAt: '2024-08-20',
    status: 'Active'
  },
  {
    id: 'm15',
    fullName: 'Devansh Agarwal',
    registerNumber: '23BCE1150',
    department: 'CSE',
    classSection: 'C',
    year: 1,
    collegeEmail: 'devansh.agarwal@college.edu',
    phone: '+91 9876543224',
    joinedAt: '2026-08-12',
    status: 'Active'
  }
];

export const getMemberAchievements = (memberId: string) => {
  // In a real app, you would query based on student ID. Since our mockAchievements
  // just have studentName string, we'll mock the relationship based on some logic.
  // For demo, we just return a consistent subset of achievements for a user based on their ID length/chars.
  const num = parseInt(memberId.replace('m', '')) || 0;
  return num % 2 === 0 ? ['a1', 'a3'] : ['a2']; 
};

export const getMemberCourses = (memberId: string) => {
  const num = parseInt(memberId.replace('m', '')) || 0;
  return num % 3 === 0 ? ['c1', 'c2'] : ['c3'];
};

export const getMemberProjectInterests = (memberId: string) => {
  const num = parseInt(memberId.replace('m', '')) || 0;
  return num % 2 !== 0 ? ['p1', 'p2'] : ['p3', 'p4'];
};
