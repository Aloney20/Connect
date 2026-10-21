import {
  BookOpen,
  ChevronRight,
  Download,
  Edit2,
  Eye,
  Filter,
  GraduationCap,
  Layers,
  Mail,
  Phone,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';



const normalizeText = (value) => (typeof value === 'string' ? value.trim() : value ?? '');

const parseStudentRow = (row) => {
  const name = normalizeText(row.name ?? row.Name ?? row.studentName ?? row['Student Name'] ?? row['Student name'] ?? row['Full Name']);
  const email = normalizeText(row.email ?? row.Email ?? row['Email ID'] ?? row['Email Address'] ?? row['Email']);
  const studentId = normalizeText(row.studentId ?? row.StudentID ?? row['Student ID'] ?? row.StudentId ?? row['StudentId'] ?? row.id ?? row.ID ?? row['ID']);
  const department = normalizeText(row.department ?? row.Department ?? row['Department'] ?? row['Department Name'] ?? 'MCA');
  let rawSemester = String(row.semester ?? row.Semester ?? row['Semester'] ?? '1');
  let semNumber = rawSemester.match(/\d+/);
  const semester = semNumber ? `Semester ${semNumber[0]}` : 'Semester 1';
  
  const phone = normalizeText(row.phone ?? row.Phone ?? row['Phone Number'] ?? row['Mobile Number'] ?? '9876543210');
  const dob = normalizeText(row.dob ?? row.DOB ?? row['Date of Birth'] ?? row['DOB'] ?? '2004-05-12');

  return { 
    name, 
    email, 
    studentId, 
    department, 
    semester, 
    phone, 
    dob, 
    role: 'student',
    password: 'student123'
  };
};

const emptyForm = {
  name: '',
  studentId: '',
  email: '',
  phone: '9876543210',
  department: 'MCA',
  semester: 'Semester 1',
  dob: '2004-05-12',
  password: 'student123',
};

const getYearOptions = () => ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function StudentsPage() {
  const { user } = useOutletContext() || {};
  const isAdmin = user?.role === 'admin';
  const staffDept = user?.department;

  const [studentList, setStudentList] = useState(() => academicStore.getStudents());
  const [selectedDept, setSelectedDept] = useState(isAdmin ? 'All' : (staffDept || 'All'));
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState(() => academicStore.getDepartments());
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const sync = () => {
      setStudentList(academicStore.getStudents());
      setDepartments(academicStore.getDepartments());
    };
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  // Compute all available departments using the global departments list + departments found in students
  const allDepartments = useMemo(() => {
    const map = new Map();
    departments.forEach(d => map.set(d.id || d.name, d));
    // Also include any department present in the live student records
    studentList.forEach(s => {
      if (s.department && !map.has(s.department)) {
        map.set(s.department, { id: s.department, name: s.department, code: s.department });
      }
    });
    const list = Array.from(map.values());
    if (!isAdmin && staffDept) {
      return list.filter(d => d.name === staffDept || d.id === staffDept);
    }
    return list;
  }, [departments, studentList, isAdmin, staffDept]);

  // Filtered students by Department, Semester, and Search query
  const filteredStudents = useMemo(() => {
    const search = query.toLowerCase().trim();

    return studentList.filter((student) => {
      // Force filter by staff department if not admin
      if (!isAdmin && staffDept && student.department !== staffDept) {
        return false;
      }
      const matchDept = selectedDept === 'All' || student.department === selectedDept;
      const matchSem = selectedSemester === 'All' || student.semester === selectedSemester;

      const matchQuery =
        !search ||
        String(student.name || '').toLowerCase().includes(search) ||
        String(student.studentId || '').toLowerCase().includes(search) ||
        String(student.email || '').toLowerCase().includes(search) ||
        String(student.phone || '').toLowerCase().includes(search);

      return matchDept && matchSem && matchQuery;
    });
  }, [studentList, selectedDept, selectedSemester, query]);

  const handleOpenAdd = () => {
    setEditingId(null);
    const activeDept = (!isAdmin && staffDept) ? staffDept : (selectedDept !== 'All' ? selectedDept : 'MCA');
    setFormData({
      ...emptyForm,
      department: activeDept,
      studentId: `${activeDept.replace(/[^a-zA-Z]/g, '').toUpperCase()}-2024-${100 + studentList.length + 1}`,
    });
    setShowModal(true);
    setNotice('');
  };

  const handleOpenEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      name: student.name || '',
      studentId: student.studentId || '',
      email: student.email || '',
      phone: student.phone || '9876543210',
      department: student.department || 'MCA',
      batch: student.batch || '1st Year',
      semester: student.semester || 'Semester 1',
      dob: student.dob || '2004-05-12',
      password: student.password || 'student123',
    });
    setShowModal(true);
    setNotice('');
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.studentId.trim() || !formData.email.trim()) {
      setNotice('Please fill in required fields (Name, Student ID, Email).');
      return;
    }

    const payload = {
      id: editingId || undefined,
      ...formData,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
    };

    academicStore.saveStudent(payload);
    setShowModal(false);
    setFormData(emptyForm);
    setNotice(`Student "${formData.name}" was ${editingId ? 'updated' : 'added to ' + formData.department} successfully.`);
  };

  const handleDeleteStudent = (id, name) => {
    if (window.confirm(`Delete student record for "${name}"?`)) {
      academicStore.deleteStudent(id);
      setNotice(`Student "${name}" deleted.`);
    }
  };

  const handleDeleteAllStudents = async () => {
    if (studentList.length === 0) return;
    if (window.confirm(`Are you absolutely sure you want to DELETE ALL ${studentList.length} students? This action cannot be undone and will wipe the database.`)) {
      const confirmedAgain = window.confirm("Final warning: This will delete ALL students across all departments. Proceed?");
      if (confirmedAgain) {
        await academicStore.deleteAllStudents();
        setNotice(`All student records have been permanently deleted.`);
      }
    }
  };



  const handleExcelImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      try {
        const data = loadEvent.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const records = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!records.length) {
          setNotice('The uploaded sheet is empty.');
          event.target.value = '';
          return;
        }

        const currentStudents = academicStore.getStudents();
        
        const imported = records
          .map(parseStudentRow)
          .filter((s) => s.name && s.studentId && s.email)
          .map((s, idx) => {
            // Find existing student by studentId to prevent duplicates
            const existing = currentStudents.find(curr => curr.studentId === s.studentId);
            return {
              id: existing ? existing.id : `stu-${Date.now()}-${idx}`,
              ...s,
              photo: existing?.photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
            };
          });

        if (!imported.length) {
          setNotice('No valid student rows found. Expected columns: name, studentId, email, department.');
          event.target.value = '';
          return;
        }

        // Auto-add new departments
        const existingDepts = academicStore.getDepartments();
        const deptSet = new Set(existingDepts.map(d => d.id));
        const newDepts = [];

        imported.forEach(s => {
          if (s.department && s.department !== 'Unassigned' && !deptSet.has(s.department)) {
            deptSet.add(s.department);
            newDepts.push({
              id: s.department,
              name: s.department,
              code: s.department.slice(0, 4).toUpperCase(),
              icon: 'GraduationCap',
              color: 'amber'
            });
          }
        });

        newDepts.forEach(d => academicStore.saveDepartment(d));

        await academicStore.saveStudentBatch(imported);
        setNotice(`Successfully imported ${imported.length} student records across departments (synced with Firestore).`);
      } catch (err) {
        console.error(err);
        setNotice('Could not parse Excel/CSV file. Please check format.');
      } finally {
        event.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleExportExcel = () => {
    const rows = [
      ['Student ID', 'Full Name', 'Department', 'Semester', 'Email', 'Phone', 'DOB'],
      ...filteredStudents.map((s) => [
        s.studentId,
        s.name,
        s.department,
        s.semester || 'Semester 1',
        s.email,
        s.phone || '9876543210',
        s.dob || '2004-05-12',
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    
    const fileName = selectedDept === 'All' 
      ? 'All_Students_Roster.xlsx' 
      : `${selectedDept}_Students.xlsx`;
      
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Student Department & Year Management</h2>
          <p className="text-sm text-slate-400">
            Organized student records by academic department, year, and semester
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDeleteAllStudents}
            disabled={studentList.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="Delete All Students"
          >
            <Trash2 size={16} />
          </button>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleExcelImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            <Upload size={16} /> Import
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            <Download size={16} /> Export (Excel)
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition"
          >
            <Plus size={15} />
            Add Student
          </button>
        </div>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}



      {/* FILTER & SUB-TOOLBAR BAR */}
      <div className="card p-5 space-y-4">
        {/* Search & Extra Selectors */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <CustomSelect
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
              }}
              className="w-full"
              disabled={!isAdmin && !!staffDept}
            >
              {isAdmin && <option value="All">All Departments</option>}
              {allDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name} ({dept.code || dept.id})</option>
              ))}
            </CustomSelect>
          </div>

          <div>
            <CustomSelect
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full text-xs"
            >
              <option value="All">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
              <option value="Semester 5">Semester 5</option>
              <option value="Semester 6">Semester 6</option>
              <option value="Semester 7">Semester 7</option>
              <option value="Semester 8">Semester 8</option>
            </CustomSelect>
          </div>

        </div>
      </div>

      {/* Roster Header Tag & Count */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">
            Showing: <strong className="text-sky-400">{selectedDept === 'All' ? 'All Departments' : selectedDept}</strong>
          </span>
          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-300">
            {filteredStudents.length} Students
          </span>
        </div>
      </div>

      {/* Main Student Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Student</th>
                <th className="px-5 py-3.5 font-semibold">Department</th>
                <th className="px-5 py-3.5 font-semibold">Contact</th>
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStudents.length ? (
                filteredStudents.map((student) => {
                  const deptColor =
                    student.department === 'MCA'
                      ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                      : student.department === 'B.Tech CSE'
                        ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';

                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 font-extrabold text-white text-xs shadow-md">
                            {(student.name || 'ST').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm leading-snug">{student.name}</p>
                            <p className="font-mono text-xs font-semibold text-sky-400">{student.studentId}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-xl border px-2.5 py-1 text-xs font-bold ${deptColor}`}>
                          {student.department || 'MCA'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs text-slate-400 mt-0.5">{student.semester || 'Semester 1'}</p>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-300">
                        <p className="flex items-center gap-1 text-white">{student.email}</p>
                        <p className="text-slate-400 mt-0.5">{student.phone || '9876543210'}</p>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                            title="View Profile"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-2 text-sky-300 hover:bg-sky-500/20 transition"
                            title="Edit Student"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20 transition"
                            title="Delete Student"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No student records found in this department/year selection. Click <strong>"Add Student"</strong> to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Student Record' : 'Enroll New Student'}
              </h3>
              <button onClick={() => setShowModal(false)} className="rounded-xl p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Department *</label>
                  <CustomSelect
                    value={formData.department}
                    onChange={(e) => {
                      const department = e.target.value;
                      const years = getYearOptions(department);
                      setFormData({
                        ...formData,
                        department,
                        batch: years.includes(formData.batch) ? formData.batch : years[0],
                      });
                    }}
                    className="w-full"
                  >
                    {allDepartments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code || d.id})</option>
                    ))}
                  </CustomSelect>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Year *</label>
                  <CustomSelect
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full"
                  >
                    {getYearOptions(formData.department).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </CustomSelect>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Student Roll / ID *</label>
                  <input
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required
                    placeholder="e.g. MCA-2024-005"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-mono text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Full Name *</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. Rahul Verma"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="name@college.edu"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Mobile Phone</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Semester</label>
                  <CustomSelect
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full text-xs"
                  >
                    <option>Semester 1</option>
                    <option>Semester 2</option>
                    <option>Semester 3</option>
                    <option>Semester 4</option>
                    <option>Semester 5</option>
                    <option>Semester 6</option>
                    <option>Semester 7</option>
                    <option>Semester 8</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">DOB</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-2 py-2 text-xs text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-400"
                >
                  {editingId ? 'Update Record' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* View Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-300 font-black text-base">
                  {(selectedStudent.name || 'ST').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedStudent.name}</h3>
                  <p className="font-mono text-xs text-sky-400">{selectedStudent.studentId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="rounded-xl p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
                <p className="font-bold text-white mt-1">{selectedStudent.department}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Academic Year</span>
                <p className="font-bold text-white mt-1">{selectedStudent.batch || selectedStudent.academicYear || '1st Year'}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Semester & Section</span>
                <p className="font-bold text-white mt-1">{selectedStudent.semester} (Sec {selectedStudent.section})</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Date of Birth</span>
                <p className="font-bold text-white mt-1">{selectedStudent.dob || '2004-05-12'}</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-800/40 p-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
                <p className="font-bold text-white mt-1">{selectedStudent.email}</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-800/40 p-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Contact Number</span>
                <p className="font-bold text-white mt-1">{selectedStudent.phone || '9876543210'}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-xl bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
