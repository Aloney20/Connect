export const demoUsers = {
  admin: {
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    employeeId: 'ADM-1001',
  },
  staff: {
    email: 'staff@college.edu',
    password: 'staff123',
    role: 'staff',
    name: 'Dr. Meera Nair',
    employeeId: 'FAC-2101',
  },
  student: {
    email: 'student@college.edu',
    password: 'student123',
    role: 'student',
    name: 'Aarav Kumar',
    studentId: 'STU-2024-101',
  },
};

export const subjects = [
  { id: 'sub-1', name: 'Database Management', code: 'DBMS', credits: 4 },
  { id: 'sub-2', name: 'Java Programming', code: 'JAVA', credits: 4 },
  { id: 'sub-3', name: 'Python', code: 'PY', credits: 3 },
  { id: 'sub-4', name: 'Operating Systems', code: 'OS', credits: 4 },
];

export const students = [
  // MCA Students (Master of Computer Applications)
  {
    id: 'stu-1',
    studentId: 'MCA-2024-001',
    name: 'Aarav Kumar',
    email: 'aarav.mca@college.edu',
    phone: '9876543210',
    department: 'MCA',
    batch: '1st Year',
    semester: 'Semester 1',
    section: 'A',
    dob: '2002-05-12',
    academicYear: '2024-2026',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
  },
  {
    id: 'stu-2',
    studentId: 'MCA-2024-002',
    name: 'Pooja Sharma',
    email: 'pooja.mca@college.edu',
    phone: '9876543211',
    department: 'MCA',
    batch: '1st Year',
    semester: 'Semester 1',
    section: 'A',
    dob: '2002-08-19',
    academicYear: '2024-2026',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
  },
  {
    id: 'stu-3',
    studentId: 'MCA-2023-015',
    name: 'Karthik Raja',
    email: 'karthik.mca@college.edu',
    phone: '9876543212',
    department: 'MCA',
    batch: '2nd Year',
    semester: 'Semester 3',
    section: 'B',
    dob: '2001-11-25',
    academicYear: '2023-2025',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
  },

  // B.Tech CSE Students
  {
    id: 'stu-4',
    studentId: 'CSE-2022-101',
    name: 'Diya Menon',
    email: 'diya.cse@college.edu',
    phone: '9123456780',
    department: 'B.Tech CSE',
    batch: '3rd Year',
    semester: 'Semester 5',
    section: 'A',
    dob: '2004-08-21',
    academicYear: '2022-2026',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
  },
  {
    id: 'stu-5',
    studentId: 'CSE-2022-102',
    name: 'Siddharth Varma',
    email: 'siddharth.cse@college.edu',
    phone: '9123456781',
    department: 'B.Tech CSE',
    batch: '3rd Year',
    semester: 'Semester 5',
    section: 'A',
    dob: '2004-03-14',
    academicYear: '2022-2026',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop',
  },
  {
    id: 'stu-6',
    studentId: 'CSE-2024-201',
    name: 'Ananya Reddy',
    email: 'ananya.cse@college.edu',
    phone: '9123456782',
    department: 'B.Tech CSE',
    batch: '1st Year',
    semester: 'Semester 1',
    section: 'B',
    dob: '2006-01-10',
    academicYear: '2024-2028',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop',
  },

  // B.Tech IT Students
  {
    id: 'stu-7',
    studentId: 'IT-2021-301',
    name: 'Nikhil Shah',
    email: 'nikhil.it@college.edu',
    phone: '9988776655',
    department: 'B.Tech IT',
    batch: '4th Year',
    semester: 'Semester 7',
    section: 'A',
    dob: '2003-12-08',
    academicYear: '2021-2025',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop',
  },
  {
    id: 'stu-8',
    studentId: 'IT-2024-302',
    name: 'Meghna Iyer',
    email: 'meghna.it@college.edu',
    phone: '9988776656',
    department: 'B.Tech IT',
    batch: '1st Year',
    semester: 'Semester 1',
    section: 'A',
    dob: '2006-07-22',
    academicYear: '2024-2028',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop',
  },
];

export const attendance = [
  { id: 'a1', studentId: 'stu-1', subjectId: 'sub-1', date: '2026-08-20', status: 'Present' },
  { id: 'a2', studentId: 'stu-1', subjectId: 'sub-1', date: '2026-08-21', status: 'Present' },
  { id: 'a3', studentId: 'stu-1', subjectId: 'sub-1', date: '2026-08-22', status: 'Late' },
  { id: 'a4', studentId: 'stu-1', subjectId: 'sub-2', date: '2026-08-20', status: 'Absent' },
  { id: 'a5', studentId: 'stu-1', subjectId: 'sub-3', date: '2026-08-20', status: 'Present' },
  { id: 'a6', studentId: 'stu-2', subjectId: 'sub-1', date: '2026-08-20', status: 'Present' },
  { id: 'a7', studentId: 'stu-2', subjectId: 'sub-2', date: '2026-08-20', status: 'Present' },
  { id: 'a8', studentId: 'stu-2', subjectId: 'sub-1', date: '2026-08-21', status: 'Absent' },
];

export const internalMarks = [
  { id: 'm1', studentId: 'stu-1', subjectId: 'sub-1', testName: 'Internal Test 1', marks: 18, max: 20 },
  { id: 'm2', studentId: 'stu-1', subjectId: 'sub-1', testName: 'Internal Test 2', marks: 16, max: 20 },
  { id: 'm3', studentId: 'stu-1', subjectId: 'sub-2', testName: 'Model Exam', marks: 42, max: 50 },
  { id: 'm4', studentId: 'stu-2', subjectId: 'sub-1', testName: 'Internal Test 1', marks: 17, max: 20 },
];

export const weeklyTests = [
  { id: 'wt-1', subjectId: 'sub-1', title: 'Week 1 - SQL Basics', unit: 'Unit 1', date: '2026-08-25', maxMarks: 20 },
  { id: 'wt-2', subjectId: 'sub-2', title: 'Week 2 - OOP Concepts', unit: 'Unit 2', date: '2026-08-27', maxMarks: 20 },
  { id: 'wt-3', subjectId: 'sub-3', title: 'Week 3 - Loops and Functions', unit: 'Unit 3', date: '2026-08-30', maxMarks: 20 },
];

export const weeklyTestMarks = [
  { id: 'wm-1', studentId: 'stu-1', testId: 'wt-1', marks: 18 },
  { id: 'wm-2', studentId: 'stu-1', testId: 'wt-2', marks: 16 },
  { id: 'wm-3', studentId: 'stu-2', testId: 'wt-1', marks: 20 },
];

export const assignments = [
  { id: 'as-1', title: 'ER Diagram Assignment', subjectId: 'sub-1', deadline: '2026-08-29', description: 'Draw and explain an ER diagram for student management.', status: 'Open' },
  { id: 'as-2', title: 'Java OOP Case Study', subjectId: 'sub-2', deadline: '2026-08-31', description: 'Prepare a case study on inheritance and polymorphism.', status: 'Open' },
];

export const submissions = [
  { id: 'subm-1', assignmentId: 'as-1', studentId: 'stu-1', status: 'Submitted', marks: 24, feedback: 'Good explanation and clear diagram.' },
  { id: 'subm-2', assignmentId: 'as-1', studentId: 'stu-2', status: 'Evaluated', marks: 22, feedback: 'Strong work.' },
];

export const practicals = [
  { id: 'p-1', studentId: 'stu-1', subjectId: 'sub-2', experiment: 'Experiment 1: Java Classes', status: 'Completed', marks: 9 },
  { id: 'p-2', studentId: 'stu-1', subjectId: 'sub-2', experiment: 'Experiment 2: Exception Handling', status: 'Pending', marks: 0 },
  { id: 'p-3', studentId: 'stu-2', subjectId: 'sub-2', experiment: 'Experiment 1: Java Classes', status: 'Completed', marks: 10 },
];

export const questionBank = [
  {
    id: 'qb-1',
    subject: 'Java Programming',
    unit: 'Unit 1',
    difficulty: 'Medium',
    question: 'Which keyword is used to create a class in Java?',
    options: ['class', 'interface', 'new', 'object'],
    correctAnswer: 'class',
  },
  {
    id: 'qb-2',
    subject: 'Database Management',
    unit: 'Unit 2',
    difficulty: 'Easy',
    question: 'Which SQL command is used to fetch data?',
    options: ['INSERT', 'DELETE', 'SELECT', 'UPDATE'],
    correctAnswer: 'SELECT',
  },
];

export const onlineTests = [
  { id: 'ot-1', title: 'Java Quiz 1', subject: 'Java Programming', duration: 20, totalMarks: 10, status: 'Active' },
  { id: 'ot-2', title: 'DBMS Quiz', subject: 'Database Management', duration: 25, totalMarks: 10, status: 'Scheduled' },
];

export const quizResults = [
  { id: 'qr-1', studentId: 'stu-1', testId: 'ot-1', score: 8, total: 10, date: '2026-08-18' },
  { id: 'qr-2', studentId: 'stu-2', testId: 'ot-1', score: 7, total: 10, date: '2026-08-18' },
];

export const examSchedules = [
  { id: 'es-1', type: 'Internal Test', subject: 'Database Management', date: '2026-09-02', time: '10:00 AM', venue: 'Room 204' },
  { id: 'es-2', type: 'Model Exam', subject: 'Java Programming', date: '2026-09-05', time: '09:00 AM', venue: 'Main Hall' },
];

export const announcements = [
  { id: 'an-1', title: 'Mid-term Exams Schedule Released', date: '2026-10-15', priority: 'High', content: 'The mid-term exam schedule for odd semesters has been published.' },
  { id: 'an-2', title: 'Campus Placement Drive - Tech Mahindra', date: '2026-10-20', priority: 'Important', content: 'Final year students register by Oct 18.' },
];

export const departments = [
  { id: 'MCA', name: 'Master of Computer Applications', code: 'MCA', icon: 'GraduationCap', color: 'violet' },
  { id: 'B.Tech CSE', name: 'Computer Science & Engineering', code: 'CSE', icon: 'Layers', color: 'sky' },
  { id: 'B.Tech IT', name: 'Information Technology', code: 'IT', icon: 'BookOpen', color: 'emerald' },
  { id: 'B.Tech ECE', name: 'Electronics & Comm. Engineering', code: 'ECE', icon: 'Sparkles', color: 'amber' },
  { id: 'B.Tech MECH', name: 'Mechanical Engineering', code: 'MECH', icon: 'Sparkles', color: 'rose' },
];
