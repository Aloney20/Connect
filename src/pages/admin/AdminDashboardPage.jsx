import { ArrowUpRight, BookOpenCheck, BriefcaseBusiness, ChevronRight, FileText, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { academicStore } from '../../services/academicStore';

export default function AdminDashboardPage() {
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [staff, setStaff] = useState(() => academicStore.getStaff());
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());
  const [marks, setMarks] = useState(() => academicStore.getInternalMarks());
  const [attendance, setAttendance] = useState(() => academicStore.getAttendance());
  const [announcements, setAnnouncements] = useState(() => academicStore.getAnnouncements());

  useEffect(() => {
    const loadAll = () => {
      setStudents(academicStore.getStudents());
      setStaff(academicStore.getStaff());
      setSubjects(academicStore.getSubjects());
      setMarks(academicStore.getInternalMarks());
      setAttendance(academicStore.getAttendance());
      setAnnouncements(academicStore.getAnnouncements());
    };

    loadAll();
    const unsubscribe = academicStore.subscribe(loadAll);
    return unsubscribe;
  }, []);

  const performance = useMemo(() => {
    if (!students.length) return [];
    return students.map((student) => {
      const studentMarks = marks.filter((mark) => mark.studentId === student.id);
      if (!studentMarks.length) {
        return { name: student.name.split(' ')[0], average: 80 };
      }
      const totalScore = studentMarks.reduce((sum, mark) => sum + Number(mark.score || mark.marks || 0), 0);
      const totalPossible = studentMarks.reduce((sum, mark) => sum + Number(mark.total || mark.max || 100), 0) || 1;
      const average = Math.round((totalScore / totalPossible) * 100);
      return { name: student.name.split(' ')[0], average: Number.isFinite(average) ? average : 0 };
    }).slice(0, 6);
  }, [students, marks]);

  const classAverage = useMemo(() => {
    if (!marks.length) return 85;
    const totalScore = marks.reduce((sum, mark) => sum + Number(mark.score || mark.marks || 0), 0);
    const totalPossible = marks.reduce((sum, mark) => sum + Number(mark.total || mark.max || 100), 0) || 1;
    return Math.round((totalScore / totalPossible) * 100);
  }, [marks]);

  const attendanceRate = useMemo(() => {
    if (!attendance.length) return 92;
    const presents = attendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    return Math.round((presents / attendance.length) * 100);
  }, [attendance]);

  const cards = [
    { title: 'Total Students', value: students.length, icon: Users, accent: 'sky', link: '/admin/students' },
    { title: 'Faculty & Staff', value: staff.length, icon: BriefcaseBusiness, accent: 'amber', link: '/admin/staff' },
    { title: 'Academic Subjects', value: subjects.length, icon: BookOpenCheck, accent: 'violet', link: '/admin/marks' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Executive Admin Dashboard</h2>
          <p className="text-sm text-slate-400">Institutional overview, academic metrics & management actions</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, icon: Icon, accent, link }) => (
          <Link
            key={title}
            to={link}
            className="group card p-5 transition-all hover:scale-[1.01] hover:border-amber-500/40"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
                <p className="mt-2 text-3xl font-extrabold">{value}</p>
              </div>
              <div className={`rounded-2xl p-3 ${
                accent === 'sky'
                  ? 'bg-sky-500/15 text-sky-400'
                  : accent === 'amber'
                    ? 'bg-amber-500/15 text-amber-400'
                    : accent === 'violet'
                      ? 'bg-violet-500/15 text-violet-400'
                      : 'bg-emerald-500/15 text-emerald-400'
              }`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-amber-400 transition">
              <span>Manage records</span>
              <ChevronRight size={14} />
            </div>
          </Link>
        ))}
      </div>



      {/* Quick Navigation Links */}
      <div className="card p-6">
        <h3 className="text-lg font-bold">Admin Management Modules</h3>
        <p className="text-xs text-slate-400 mt-1">Jump directly to any institutional module</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/admin/students"
            className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4 transition hover:border-sky-500/50 hover:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-sky-500/15 p-2.5 text-sky-400">
                <Users size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Students Management</h4>
                <p className="text-xs text-slate-400 mt-0.5">Add, edit, excel import students</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/staff"
            className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4 transition hover:border-amber-500/50 hover:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-400">
                <GraduationCap size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Staff & Faculty</h4>
                <p className="text-xs text-slate-400 mt-0.5">Faculty directory & assignments</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/reports"
            className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4 transition hover:border-rose-500/50 hover:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-rose-500/15 p-2.5 text-rose-400">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Academic Reports</h4>
                <p className="text-xs text-slate-400 mt-0.5">Printable grade sheets & CSV export</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
