import { BellRing, BookOpenCheck, CalendarClock, ChevronRight, FileText, GraduationCap, Megaphone, NotebookPen, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';
import { academicStore } from '../../services/academicStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());
  const [assignments, setAssignments] = useState(() => academicStore.getAssignments());
  const [announcements, setAnnouncements] = useState(() => academicStore.getAnnouncements());
  const [attendance, setAttendance] = useState(() => academicStore.getAttendance());

  useEffect(() => {
    const sync = () => {
      setStudents(academicStore.getStudents());
      setSubjects(academicStore.getSubjects());
      setAssignments(academicStore.getAssignments());
      setAnnouncements(academicStore.getAnnouncements());
      setAttendance(academicStore.getAttendance());
    };
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  const stats = [
    { title: 'Enrolled Students', value: students.length, icon: <Users className="h-5 w-5" />, accent: 'blue' },
    { title: 'Assigned Subjects', value: subjects.length, icon: <BookOpenCheck className="h-5 w-5" />, accent: 'green' },
    { title: 'Active Assignments', value: assignments.length, icon: <FileText className="h-5 w-5" />, accent: 'purple' },
    { title: 'Notices', value: announcements.length, icon: <Megaphone className="h-5 w-5" />, accent: 'amber' },
  ];

  const quickActions = [
    { label: 'Manage Students', path: '/staff/students', desc: 'Add or import students', icon: Users, color: 'text-sky-400 bg-sky-500/15' },
    { label: 'Mark Attendance', path: '/staff/attendance', desc: 'Daily attendance tracker', icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-500/15' },
    { label: 'Internal Marks', path: '/staff/internal-marks', desc: 'Record midterm & unit tests', icon: TrendingUp, color: 'text-amber-400 bg-amber-500/15' },
    { label: 'Assignments', path: '/staff/assignments', desc: 'Create tasks & grade submissions', icon: FileText, color: 'text-indigo-400 bg-indigo-500/15' },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Faculty Workspace"
        subtitle="Department teaching console, student tracking and grading controls"
      />

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} accent={stat.accent} />
        ))}
      </div>

      {/* Highlights */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Quick Actions Grid */}
        <div className="card p-6">
          <h3 className="text-lg font-bold">Academic Management Quick Actions</h3>
          <p className="text-xs text-slate-400 mt-0.5">Click any action to navigate directly</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-800/50 p-3.5 text-left transition hover:border-sky-500/40 hover:bg-slate-800 group"
                >
                  <div className={`rounded-xl p-2.5 ${action.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white group-hover:text-sky-400 transition">{action.label}</p>
                    <p className="text-[11px] text-slate-400 truncate">{action.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-sky-400 transition" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <BellRing size={18} />
              <h3>Notice Board</h3>
            </div>
            <Link to="/staff/announcements" className="text-xs text-sky-400 hover:underline">View All</Link>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-xs text-white truncate">{item.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    item.priority === 'Urgent' ? 'bg-rose-500/15 text-rose-400' : 'bg-sky-500/15 text-sky-400'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                <p className="text-[10px] text-slate-500 mt-2">{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
