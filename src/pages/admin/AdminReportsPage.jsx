import { Download, Eye, FileText, Printer, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

export default function AdminReportsPage() {
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [marks, setMarks] = useState(() => academicStore.getInternalMarks());
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());
  const [attendance, setAttendance] = useState(() => academicStore.getAttendance());
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  const departments = useMemo(() => {
    return ['All', ...new Set(students.map(s => s.department).filter(Boolean))];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (filterDept !== 'All' && s.department !== filterDept) return false;
      return true;
    });
  }, [students, filterDept]);

  useEffect(() => {
    const sync = () => {
      const s = academicStore.getStudents();
      setStudents(s);
      setMarks(academicStore.getInternalMarks());
      setSubjects(academicStore.getSubjects());
      setAttendance(academicStore.getAttendance());
      if (!selectedStudentId && s.length) {
        setSelectedStudentId(s[0].id);
      }
    };
    sync();
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, [selectedStudentId]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || filteredStudents[0];
  }, [students, selectedStudentId, filteredStudents]);

  const studentMarks = useMemo(() => {
    if (!selectedStudent) return [];
    return marks.filter((m) => m.studentId === selectedStudent.id).map((m) => {
      const sub = subjects.find((s) => s.id === m.subjectId);
      const score = Number(m.marks ?? m.score ?? 0);
      const max = Number(m.max ?? m.total ?? 100);
      const pct = max > 0 ? Math.round((score / max) * 100) : 0;
      return {
        ...m,
        subjectName: sub?.name || 'Subject',
        subjectCode: sub?.code || 'CS',
        score,
        max,
        percentage: pct,
      };
    });
  }, [marks, selectedStudent, subjects]);

  const studentAttendanceRate = useMemo(() => {
    if (!selectedStudent) return 90;
    const sAtt = attendance.filter((a) => a.studentId === selectedStudent.id);
    if (!sAtt.length) return 92;
    const present = sAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    return Math.round((present / sAtt.length) * 100);
  }, [attendance, selectedStudent]);

  const handleDownloadCSV = () => {
    const rows = [
      ['Student Name', selectedStudent?.name || ''],
      ['Student ID', selectedStudent?.studentId || ''],
      ['Department', selectedStudent?.department || ''],
      ['Attendance Rate', `${studentAttendanceRate}%`],
      [],
      ['Subject Code', 'Subject Name', 'Assessment', 'Marks Obtained', 'Max Marks', 'Percentage', 'Grade'],
      ...studentMarks.map((r) => [
        r.subjectCode,
        r.subjectName,
        r.testName || r.title || 'Internal Test',
        r.score,
        r.max,
        `${r.percentage}%`,
        r.percentage >= 80 ? 'A' : r.percentage >= 60 ? 'B' : r.percentage >= 50 ? 'C' : 'F',
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(selectedStudent?.name || 'student').replace(/\s+/g, '_')}_Academic_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Student Academic Reports</h2>
          <p className="text-sm text-slate-400">Generate, inspect, print and download complete student transcripts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Printer size={16} />
            Print Transcript
          </button>
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Student Selector Card */}
      <div className="card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-2xl">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Department</label>
              <CustomSelect
                value={filterDept}
                onChange={(e) => {
                  setFilterDept(e.target.value);
                  setSelectedStudentId('');
                }}
                className="w-full"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
                ))}
              </CustomSelect>
            </div>
            
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Student Name</label>
              <CustomSelect
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full"
              >
                {!selectedStudentId && <option value="">-- Select --</option>}
                {filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </CustomSelect>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-800/60 px-4 py-2 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Attendance</p>
              <p className="text-lg font-extrabold text-emerald-400">{studentAttendanceRate}%</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-800/60 px-4 py-2 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Assessments</p>
              <p className="text-lg font-extrabold text-amber-400">{studentMarks.length}</p>
            </div>
          </div>
        </div>

        {selectedStudent && (
          <div className="mt-5 grid gap-4 sm:grid-cols-3 border-t border-slate-800 pt-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Learner Name</span>
              <p className="mt-1 font-bold text-white text-base">{selectedStudent.name}</p>
              <p className="text-xs text-slate-400">{selectedStudent.studentId}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
              <p className="mt-1 font-bold text-white text-base">{selectedStudent.department}</p>
              <p className="text-xs text-slate-400">{selectedStudent.semester || 'Semester 5'}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3.5">
              <p className="text-xs text-slate-400">{selectedStudent.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Marks Transcript Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-400" />
            <h3 className="font-bold text-base">Assessment & Marks Breakdown</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Subject</th>
                <th className="px-5 py-3.5 font-semibold">Assessment Title</th>
                <th className="px-5 py-3.5 font-semibold">Score</th>
                <th className="px-5 py-3.5 font-semibold">Percentage</th>
                <th className="px-5 py-3.5 font-semibold">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {studentMarks.length ? (
                studentMarks.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{row.subjectName}</p>
                      <p className="text-xs font-mono text-amber-400">{row.subjectCode}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-300 font-medium">
                      {row.testName || row.title || 'Internal Test'}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-white">
                      {row.score} / {row.max}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-white">{row.percentage}%</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        row.percentage >= 80 ? 'bg-emerald-500/15 text-emerald-400' : row.percentage >= 60 ? 'bg-sky-500/15 text-sky-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {row.percentage >= 80 ? 'Grade A' : row.percentage >= 60 ? 'Grade B' : 'Grade C'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    No assessment records found for this student.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
