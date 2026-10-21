import { CalendarClock, Download, MapPin, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { academicStore } from '../../services/academicStore';

export default function StudentExamSchedulePage() {
  const [examSchedules, setExamSchedules] = useState(() => academicStore.getExamSchedules());

  useEffect(() => {
    const sync = () => setExamSchedules(academicStore.getExamSchedules());
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Institutional Examination Timetable</h2>
          <p className="text-sm text-slate-400">Scheduled internal tests, model examinations, and hall allocations</p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-300 hover:bg-violet-500/20 transition"
        >
          <Printer size={16} />
          Print Timetable
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Exam Type</th>
                <th className="px-5 py-3.5 font-semibold">Subject</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold">Time</th>
                <th className="px-5 py-3.5 font-semibold">Hall / Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {examSchedules.length ? (
                examSchedules.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        exam.type === 'Internal Test'
                          ? 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
                          : exam.type === 'Model Exam'
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                            : 'bg-violet-500/15 border border-violet-500/30 text-violet-400'
                      }`}>
                        {exam.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-white">{exam.subject}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-300">{exam.date}</td>
                    <td className="px-5 py-4 text-slate-300">{exam.time}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 font-medium">
                        <MapPin size={12} className="text-violet-400" />
                        {exam.venue}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No examination timetable entries published.
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
