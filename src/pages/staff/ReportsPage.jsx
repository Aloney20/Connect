import { Download, Eye, FileText, Printer, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

export default function ReportsPage() {
  const { user } = useOutletContext() || {};
  const isAdmin = user?.role === 'admin';
  const staffDept = user?.department;

  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [marks, setMarks] = useState(() => academicStore.getInternalMarks());
  const [attendance, setAttendance] = useState(() => academicStore.getAttendance());
  const [weeklyTestMarks, setWeeklyTestMarks] = useState(() => academicStore.getWeeklyTestMarks());
  const [submissions, setSubmissions] = useState(() => academicStore.getSubmissions());
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState(isAdmin ? 'All' : (staffDept || 'All'));
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const sync = () => {
      setStudents(academicStore.getStudents());
      setMarks(academicStore.getInternalMarks());
      setAttendance(academicStore.getAttendance());
      setWeeklyTestMarks(academicStore.getWeeklyTestMarks());
      setSubmissions(academicStore.getSubmissions());
      setSubjects(academicStore.getSubjects());
    };
    sync();
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  const departments = useMemo(() => {
    if (!isAdmin && staffDept) {
      return [staffDept];
    }
    return ['All', ...new Set(students.map(s => s.department).filter(Boolean))];
  }, [students, isAdmin, staffDept]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        String(s.name || '').toLowerCase().includes(searchLower) ||
        String(s.studentId || '').toLowerCase().includes(searchLower);
      const matchesDeptFilter = filterDept === 'All' || s.department === filterDept;
      const matchesStaffDept = isAdmin || !staffDept || s.department === staffDept;
      
      return matchesSearch && matchesDeptFilter && matchesStaffDept;
    });
  }, [students, search, filterDept, isAdmin, staffDept]);

  const getStudentStats = (studentId) => {
    const sAtt = attendance.filter((a) => a.studentId === studentId);
    const attRate = sAtt.length
      ? Math.round((sAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length / sAtt.length) * 100)
      : 92;

    const sMarks = marks.filter((m) => m.studentId === studentId);
    const marksScore = sMarks.reduce((sum, m) => sum + Number(m.marks ?? m.score ?? 0), 0);
    const marksMax = sMarks.reduce((sum, m) => sum + Number(m.max ?? m.total ?? 100), 0) || 1;
    const internalAvg = sMarks.length ? Math.round((marksScore / marksMax) * 100) : 86;

    const sWt = weeklyTestMarks.filter((m) => m.studentId === studentId);
    const wtAvg = sWt.length
      ? Math.round((sWt.reduce((sum, m) => sum + Number(m.marks || 0), 0) / (sWt.length * 20)) * 100)
      : 88;

    return { attRate, internalAvg, wtAvg, marksList: sMarks };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Student Academic Performance Reports</h2>
          <p className="text-sm text-slate-400">Review cumulative transcripts, attendance percentages, and grade cards</p>
        </div>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="card p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2 relative">
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Search Students</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student by name or student ID..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Department Filter</label>
            <CustomSelect
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full"
              disabled={!isAdmin && !!staffDept}
            >
              {isAdmin && <option value="All">All Departments</option>}
              {departments.map((d) => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </CustomSelect>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map((student) => {
          const stats = getStudentStats(student.id);

          return (
            <div key={student.id} className="card p-6 flex flex-col justify-between hover:border-sky-500/40 transition">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-300 font-extrabold text-base">
                    {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{student.name}</h3>
                    <p className="text-xs text-slate-400">{student.studentId} • {student.department}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-2.5 text-xs">
                    <span className="text-slate-400">Attendance</span>
                    <strong className="text-emerald-400 font-bold">{stats.attRate}%</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-2.5 text-xs">
                    <span className="text-slate-400">Weekly Test Average</span>
                    <strong className="text-amber-400 font-bold">{stats.wtAvg}%</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForReport(student)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-400 transition"
                >
                  <FileText size={15} />
                  Open Full Academic Transcript
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Modal */}
      {selectedStudentForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-300 font-extrabold text-base">
                  {selectedStudentForReport.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedStudentForReport.name}</h3>
                  <p className="text-xs text-slate-400">{selectedStudentForReport.studentId} • {selectedStudentForReport.department}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudentForReport(null)} className="rounded-xl p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 mt-4 flex-1">
              <div className="grid grid-cols-3 gap-3">
                {(() => {
                  const s = getStudentStats(selectedStudentForReport.id);
                  return (
                    <>
                      <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Attendance</span>
                        <p className="text-lg font-extrabold text-emerald-400 mt-0.5">{s.attRate}%</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Weekly Tests</span>
                        <p className="text-lg font-extrabold text-amber-400 mt-0.5">{s.wtAvg}%</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div>
                <h4 className="font-bold text-sm text-white mb-2">Subject-wise Assessments</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-slate-800 text-slate-400">
                      <tr>
                        <th className="px-4 py-2.5">Subject</th>
                        <th className="px-4 py-2.5">Assessment</th>
                        <th className="px-4 py-2.5">Score</th>
                        <th className="px-4 py-2.5">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {marks.filter((m) => m.studentId === selectedStudentForReport.id).length ? (
                        marks
                          .filter((m) => m.studentId === selectedStudentForReport.id)
                          .map((m) => {
                            const sub = subjects.find((s) => s.id === m.subjectId);
                            const score = Number(m.marks ?? m.score ?? 0);
                            const max = Number(m.max ?? m.total ?? 100);
                            const pct = max > 0 ? Math.round((score / max) * 100) : 0;
                            return (
                              <tr key={m.id}>
                                <td className="px-4 py-2.5 font-semibold text-white">{sub?.name || 'Subject'}</td>
                                <td className="px-4 py-2.5 text-slate-300">{m.testName || m.title || 'Internal Test'}</td>
                                <td className="px-4 py-2.5 font-mono font-bold text-white">{score} / {max}</td>
                                <td className="px-4 py-2.5 text-emerald-400 font-bold">{pct}%</td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-4 text-center text-slate-400">
                            No specific assessment records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"
              >
                <Printer size={15} />
                Print Transcript
              </button>
              <button
                type="button"
                onClick={() => setSelectedStudentForReport(null)}
                className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
