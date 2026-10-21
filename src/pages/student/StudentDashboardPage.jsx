import { Activity, Bell, BookOpenCheck, CalendarClock, ChevronRight, ClipboardCheck, FileText, GraduationCap, TrendingUp, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import { academicStore } from '../../services/academicStore';

export default function StudentDashboardPage({ user }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [attendance, setAttendance] = useState(() => academicStore.getAttendance());
  const [marks, setMarks] = useState(() => academicStore.getInternalMarks());
  const [assignments, setAssignments] = useState(() => academicStore.getAssignments());
  const [submissions, setSubmissions] = useState(() => academicStore.getSubmissions());
  const [weeklyTests, setWeeklyTests] = useState(() => academicStore.getWeeklyTests());
  const [quizResults, setQuizResults] = useState(() => academicStore.getQuizResults());
  const [examSchedules, setExamSchedules] = useState(() => academicStore.getExamSchedules());
  const [announcements, setAnnouncements] = useState(() => academicStore.getAnnouncements());

  useEffect(() => {
    const sync = () => {
      setStudents(academicStore.getStudents());
      setAttendance(academicStore.getAttendance());
      setMarks(academicStore.getInternalMarks());
      setAssignments(academicStore.getAssignments());
      setSubmissions(academicStore.getSubmissions());
      setWeeklyTests(academicStore.getWeeklyTests());
      setQuizResults(academicStore.getQuizResults());
      setExamSchedules(academicStore.getExamSchedules());
      setAnnouncements(academicStore.getAnnouncements());
    };
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
    return students[0] || { id: 'stu-1', name: 'Aarav Kumar', studentId: 'STU-2024-101', semester: 'Semester 5' };
  }, [students, user]);

  const studentAttendanceRate = useMemo(() => {
    const records = attendance.filter((a) => a.studentId === currentStudent.id);
    if (!records.length) return 92;
    const presents = records.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    return Math.round((presents / records.length) * 100);
  }, [attendance, currentStudent]);

  const studentMarksAvg = useMemo(() => {
    const sMarks = marks.filter((m) => m.studentId === currentStudent.id);
    if (!sMarks.length) return 86;
    const score = sMarks.reduce((sum, m) => sum + Number(m.marks ?? m.score ?? 0), 0);
    const max = sMarks.reduce((sum, m) => sum + Number(m.max ?? m.total ?? 100), 0) || 1;
    return Math.round((score / max) * 100);
  }, [marks, currentStudent]);

  const mySubmissions = useMemo(() => {
    return submissions.filter((s) => s.studentId === currentStudent.id);
  }, [submissions, currentStudent]);

  const statItems = [
    { title: 'My Attendance', value: `${studentAttendanceRate}%`, icon: <ClipboardCheck className="h-5 w-5" />, accent: 'green' },
    { title: 'Assessment Average', value: `${studentMarksAvg}%`, icon: <Trophy className="h-5 w-5" />, accent: 'amber' },
    { title: 'Open Tasks', value: assignments.length, icon: <FileText className="h-5 w-5" />, accent: 'blue' },
    { title: 'Upcoming Exams', value: examSchedules.length, icon: <CalendarClock className="h-5 w-5" />, accent: 'purple' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Welcome Back, {currentStudent.name}!</h2>
          <p className="text-sm text-slate-400">
            {currentStudent.department} • {currentStudent.semester || 'Semester 5'}
          </p>
        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => (
          <StatCard key={item.title} title={item.title} value={item.value} icon={item.icon} accent={item.accent} />
        ))}
      </div>



      {/* Coursework & Timetable */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white">Upcoming Weekly Tests</h3>
            <Link to="/student/weekly-tests" className="text-xs text-violet-400 hover:underline">View All</Link>
          </div>

          <div className="space-y-3">
            {weeklyTests.slice(0, 3).map((test) => (
              <div key={test.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-3.5">
                <div>
                  <p className="font-bold text-sm text-white">{test.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{test.unit} • Date: {test.date}</p>
                </div>
                <span className="rounded-xl bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-300">
                  {test.maxMarks} Marks
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white">Exam Timetable</h3>
            <Link to="/student/exam-schedule" className="text-xs text-violet-400 hover:underline">Full Schedule</Link>
          </div>

          <div className="space-y-3">
            {examSchedules.slice(0, 3).map((exam) => (
              <div key={exam.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-3.5">
                <div>
                  <p className="font-bold text-sm text-white">{exam.subject}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{exam.date} • {exam.time} ({exam.venue})</p>
                </div>
                <span className="rounded-xl bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">
                  {exam.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
