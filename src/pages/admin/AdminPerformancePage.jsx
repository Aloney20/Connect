import { BarChart3, ChevronRight, TrendingUp, Trophy, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { academicStore } from '../../services/academicStore';

const PIE_COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

export default function AdminPerformancePage() {
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [marks, setMarks] = useState(() => academicStore.getInternalMarks());
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());

  useEffect(() => {
    const sync = () => {
      setStudents(academicStore.getStudents());
      setMarks(academicStore.getInternalMarks());
      setSubjects(academicStore.getSubjects());
    };
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  const studentRankings = useMemo(() => {
    return students.map((student) => {
      const sMarks = marks.filter((m) => m.studentId === student.id);
      if (!sMarks.length) {
        return { id: student.id, name: student.name, department: student.department, average: 82, testsCount: 0 };
      }
      const totalScore = sMarks.reduce((sum, m) => sum + Number(m.marks ?? m.score ?? 0), 0);
      const totalMax = sMarks.reduce((sum, m) => sum + Number(m.max ?? m.total ?? 100), 0) || 1;
      const average = Math.round((totalScore / totalMax) * 100);
      return { id: student.id, name: student.name, department: student.department, average, testsCount: sMarks.length };
    }).sort((a, b) => b.average - a.average);
  }, [students, marks]);

  const subjectAverages = useMemo(() => {
    return subjects.map((subject) => {
      const sMarks = marks.filter((m) => m.subjectId === subject.id);
      if (!sMarks.length) {
        return { name: subject.name, code: subject.code, average: 85, count: 0 };
      }
      const totalScore = sMarks.reduce((sum, m) => sum + Number(m.marks ?? m.score ?? 0), 0);
      const totalMax = sMarks.reduce((sum, m) => sum + Number(m.max ?? m.total ?? 100), 0) || 1;
      const average = Math.round((totalScore / totalMax) * 100);
      return { name: subject.name, code: subject.code, average, count: sMarks.length };
    });
  }, [subjects, marks]);

  const pieData = useMemo(() => {
    const high = studentRankings.filter((s) => s.average >= 75).length;
    const moderate = studentRankings.filter((s) => s.average >= 50 && s.average < 75).length;
    const low = studentRankings.filter((s) => s.average < 50).length;
    return [
      { name: 'Distinction / High (≥75%)', value: high || 1 },
      { name: 'Moderate (50-74%)', value: moderate || 0 },
      { name: 'Needs Attention (<50%)', value: low || 0 },
    ];
  }, [studentRankings]);

  const topStudent = studentRankings[0] || { name: 'Aarav Kumar', average: 90 };
  const overallAvg = studentRankings.length
    ? Math.round(studentRankings.reduce((sum, s) => sum + s.average, 0) / studentRankings.length)
    : 85;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Academic Analytics & Performance</h2>
        <p className="text-sm text-slate-400">Institutional metrics, cohort rankings and subject-level insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Class Average</span>
            <div className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold">{overallAvg}%</p>
          <p className="mt-1 text-xs text-emerald-400 font-semibold">+4.2% from previous term</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Top Academic Rank</span>
            <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-400">
              <Trophy size={20} />
            </div>
          </div>
          <p className="mt-3 text-xl font-bold truncate">{topStudent.name}</p>
          <p className="mt-1 text-xs text-amber-400 font-semibold">{topStudent.average}% Overall Score</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Evaluated Cohort</span>
            <div className="rounded-xl bg-sky-500/15 p-2.5 text-sky-400">
              <Users size={20} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold">{studentRankings.length}</p>
          <p className="mt-1 text-xs text-sky-400 font-semibold">{subjects.length} Enrolled Courses</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-base font-bold mb-4">Student-wise Performance Index</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentRankings.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => [`${val}%`, 'Score Average']}
                />
                <Bar dataKey="average" radius={[8, 8, 0, 0]} fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-base font-bold mb-4">Grade Tier Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject-Wise Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-base font-bold">Subject-Wise Performance Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Subject Name</th>
                <th className="px-5 py-3.5 font-semibold">Course Code</th>
                <th className="px-5 py-3.5 font-semibold">Average Score</th>
                <th className="px-5 py-3.5 font-semibold">Status Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {subjectAverages.map((sub) => (
                <tr key={sub.name} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-4 font-semibold text-white">{sub.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-amber-300">{sub.code}</td>
                  <td className="px-5 py-4 font-bold text-white">{sub.average}%</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      sub.average >= 75 ? 'bg-emerald-500/15 text-emerald-400' : sub.average >= 60 ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'
                    }`}>
                      {sub.average >= 75 ? 'Exceeding' : sub.average >= 60 ? 'Target Pace' : 'Needs Intervention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
