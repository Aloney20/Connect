import { CheckCircle2, ClipboardCheck, Clock, XCircle, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { academicStore } from '../../services/academicStore';

export default function StudentAttendancePage({ user }) {
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [attendance, setAttendance] = useState(() => academicStore.getAttendance());
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const sync = () => {
      setStudents(academicStore.getStudents());
      setAttendance(academicStore.getAttendance());
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
    return students[0] || { id: 'stu-1' };
  }, [students, user]);

  const studentAttendance = useMemo(() => {
    let filtered = attendance.filter((a) => a.studentId === currentStudent.id);
    if (filterDate) {
      filtered = filtered.filter((a) => a.date === filterDate);
    }
    // Sort by date descending
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [attendance, currentStudent, filterDate]);

  return (
    <div className="space-y-6">
      {/* History Table */}
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 p-4">
          <h3 className="font-bold text-base text-white">Daily Attendance History</h3>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-400">Track Date:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500"
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate('')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {studentAttendance.length ? (
                studentAttendance.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-mono text-xs text-slate-300">{item.date}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          item.status === 'Present'
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                            : item.status === 'Late'
                              ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                              : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={2} className="px-5 py-8 text-center text-slate-400">
                    No attendance logs recorded.
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
