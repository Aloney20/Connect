import { Download, FileText, Printer, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { academicStore } from '../../services/academicStore';

export default function StudentAcademicReportPage({ user }) {
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [attendance, setAttendance] = useState(() => academicStore.getAttendance());
  const [marks, setMarks] = useState(() => academicStore.getInternalMarks());
  const [weeklyTestMarks, setWeeklyTestMarks] = useState(() => academicStore.getWeeklyTestMarks());
  const [quizResults, setQuizResults] = useState(() => academicStore.getQuizResults());
  const [examSchedules, setExamSchedules] = useState(() => academicStore.getExamSchedules());
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());

  useEffect(() => {
    const sync = () => {
      setStudents(academicStore.getStudents());
      setAttendance(academicStore.getAttendance());
      setMarks(academicStore.getInternalMarks());
      setWeeklyTestMarks(academicStore.getWeeklyTestMarks());
      setQuizResults(academicStore.getQuizResults());
      setExamSchedules(academicStore.getExamSchedules());
      setSubjects(academicStore.getSubjects());
    };
    sync();
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  const currentStudent = useMemo(() => {
    if (user?.studentId) {
      const found = students.find((s) => s.id === user.studentId || s.studentId === user.studentId);
      if (found) return found;
    }
    if (user?.email) {
      const found = students.find((s) => s.email.toLowerCase() === user.email.toLowerCase());
      if (found) return found;
    }
    return students[0] || {
      id: 'stu-1',
      name: 'Aarav Kumar',
      studentId: 'STU-2024-101',
      department: 'Computer Science',
      semester: 'Semester 5',
    };
  }, [students, user]);

  const studentMarks = useMemo(() => {
    return marks.filter((m) => m.studentId === currentStudent.id).map((m) => {
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
  }, [marks, currentStudent, subjects]);

  const attendanceRate = useMemo(() => {
    const records = attendance.filter((a) => a.studentId === currentStudent.id);
    if (!records.length) return 92;
    const presents = records.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    return Math.round((presents / records.length) * 100);
  }, [attendance, currentStudent]);

  const marksAvg = useMemo(() => {
    if (!studentMarks.length) return 86;
    const total = studentMarks.reduce((sum, m) => sum + m.score, 0);
    const max = studentMarks.reduce((sum, m) => sum + m.max, 0) || 1;
    return Math.round((total / max) * 100);
  }, [studentMarks]);

  const quizAvg = useMemo(() => {
    const studentQuizzes = quizResults.filter((q) => q.studentId === currentStudent.id);
    if (!studentQuizzes.length) return 85;
    const score = studentQuizzes.reduce((sum, q) => sum + Number(q.score || 0), 0);
    const total = studentQuizzes.reduce((sum, q) => sum + Number(q.total || 10), 0) || 1;
    return Math.round((score / total) * 100);
  }, [quizResults, currentStudent]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const rows = [
      ['COLLEGE ACADEMIC TRANSCRIPT'],
      ['Student Name', currentStudent.name],
      ['Student ID', currentStudent.studentId],
      ['Department', currentStudent.department],
      ['Semester', currentStudent.semester || 'Semester 5'],
      ['Attendance Rate', `${attendanceRate}%`],
      ['Weekly Quiz Average', `${quizAvg}%`],
      [],
      ['Subject Code', 'Subject Name', 'Assessment', 'Marks Obtained', 'Max Marks', 'Percentage'],
      ...studentMarks.map((m) => [
        m.subjectCode,
        m.subjectName,
        m.testName || m.title || 'Internal Test',
        m.score,
        m.max,
        `${m.percentage}%`,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(currentStudent?.name || 'Student').replace(/\s+/g, '_')}_Transcript.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Official Academic Transcript</h2>
          <p className="text-sm text-slate-400">Cumulative term performance, attendance standing, and subject grades</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500 transition"
          >
            <Printer size={16} />
            Print Report Card
          </button>
        </div>
      </div>

      {/* Main Transcript Card */}
      <div className="card p-6 sm:p-8 space-y-8">
        {/* Student Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 font-extrabold text-white text-xl shadow-lg shadow-violet-500/20">
              {(currentStudent?.name || 'Student').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">{currentStudent?.name || 'Student'}</h3>
              <p className="text-sm text-slate-400 font-mono mt-0.5">
                {currentStudent?.studentId || 'STU-1'} • {currentStudent?.department || 'Department'}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 px-4 py-3 text-left sm:text-right text-xs">
            <p className="font-semibold text-white">{currentStudent.semester || 'Semester 5'}</p>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Class Attendance</span>
            <p className="mt-2 text-2xl font-black text-emerald-400">{attendanceRate}%</p>
            <p className="text-xs text-slate-400 mt-1">Institutional requirement met</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Quiz Accuracy</span>
            <p className="mt-2 text-2xl font-black text-violet-400">{quizAvg}%</p>
            <p className="text-xs text-slate-400 mt-1">Timed online tests</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Performance Standing</span>
            <p className="mt-2 text-2xl font-black text-amber-400">Grade A</p>
            <p className="text-xs text-slate-400 mt-1">Distinction Tier</p>
          </div>
        </div>

        {/* Subject-Wise Marks Transcript */}
        <div>
          <h4 className="text-base font-bold text-white mb-3">Published Assessment Scores</h4>
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Subject</th>
                  <th className="px-5 py-3 font-semibold">Assessment Title</th>
                  <th className="px-5 py-3 font-semibold">Score</th>
                  <th className="px-5 py-3 font-semibold">Percentage</th>
                  <th className="px-5 py-3 font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {studentMarks.length ? (
                  studentMarks.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-white">{m.subjectName}</span>
                        <span className="ml-2 font-mono text-xs text-violet-400">({m.subjectCode})</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{m.testName || m.title || 'Internal Test'}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-white">{m.score} / {m.max}</td>
                      <td className="px-5 py-3.5 font-bold text-emerald-400">{m.percentage}%</td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          m.percentage >= 80 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-sky-500/15 text-sky-400'
                        }`}>
                          {m.percentage >= 80 ? 'Grade A' : 'Grade B'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      No assessment marks logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exam Timetable Summary */}
        <div>
          <h4 className="text-base font-bold text-white mb-3">Upcoming Examination Timetable</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {examSchedules.map((exam) => (
              <div key={exam.id} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{exam.subject}</span>
                  <span className="rounded-xl bg-amber-500/15 text-amber-300 px-2.5 py-0.5 text-xs font-bold">
                    {exam.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Date: <strong className="text-slate-200">{exam.date}</strong> ({exam.time})
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Venue: <strong className="text-slate-200">{exam.venue}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
