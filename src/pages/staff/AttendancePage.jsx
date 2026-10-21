import { Check, CheckCircle2, Clock, ShieldCheck, UserCheck, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

export default function AttendancePage() {
  const { user } = useOutletContext() || {};
  const isAdmin = user?.role === 'admin';
  const staffDept = user?.department;

  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [attendanceRecords, setAttendanceRecords] = useState(() => academicStore.getAttendance());
  
  const [filterDept, setFilterDept] = useState(isAdmin ? 'All' : (staffDept || 'All'));
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statusMap, setStatusMap] = useState({});
  const [notice, setNotice] = useState('');

  const departments = useMemo(() => {
    if (!isAdmin && staffDept) {
      return [staffDept];
    }
    return ['All', ...new Set(students.map(s => s.department).filter(Boolean))];
  }, [students, isAdmin, staffDept]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (!isAdmin && staffDept && s.department !== staffDept) return false;
      if (filterDept !== 'All' && s.department !== filterDept) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, filterDept, isAdmin, staffDept]);

  useEffect(() => {
    const sync = () => {
      setStudents(academicStore.getStudents());
      setAttendanceRecords(academicStore.getAttendance());
    };
    sync();
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  // When date changes, prefill status from existing records or default to Present
  useEffect(() => {
    if (!filteredStudents.length) {
      setStatusMap({});
      return;
    }
    const currentRecords = academicStore.getAttendance();
    const map = {};
    filteredStudents.forEach((student) => {
      const match = currentRecords.find(
        (r) => r.studentId === student.id && r.date === selectedDate
      );
      map[student.id] = match ? match.status : 'Present';
    });
    setStatusMap(map);
  }, [filteredStudents, selectedDate]);

  const chooseStatus = (studentId, status) => {
    setStatusMap((current) => ({ ...current, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const map = {};
    filteredStudents.forEach((s) => {
      map[s.id] = 'Present';
    });
    setStatusMap(map);
    setNotice('All students marked as Present. Click "Save Attendance" to persist.');
  };

  const handleSaveAttendance = () => {
    if (!filteredStudents.length) {
      setNotice('No students to mark.');
      return;
    }

    const records = filteredStudents.map((student) => ({
      id: `att-${selectedDate}-${student.id}`,
      studentId: student.id,
      session: 'Daily',
      department: student.department,
      date: selectedDate,
      status: statusMap[student.id] || 'Present',
    }));

    academicStore.saveAttendanceBatch(records);
    setNotice(`Daily attendance recorded successfully for ${selectedDate}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Daily Attendance</h2>
          <p className="text-sm text-slate-400">Record daily classroom attendance by department</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            <UserCheck size={16} />
            Mark All Present
          </button>
          <button
            type="button"
            onClick={handleSaveAttendance}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition"
          >
            <Check size={16} />
            Save Attendance
          </button>
        </div>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Selector Toolbar */}
      <div className="card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Department</label>
            <CustomSelect
              value={filterDept}
              onChange={(e) => {
                setFilterDept(e.target.value);
              }}
              className="w-full"
              disabled={!isAdmin && !!staffDept}
            >
              {isAdmin && <option value="All">All Departments</option>}
              {departments.map((d) => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </CustomSelect>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
            />
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-3 flex-1 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total In Class</span>
              <p className="text-lg font-bold text-white mt-0.5">{filteredStudents.length} Students</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-3 flex-1 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Present Today</span>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">
                {Object.values(statusMap).filter((v) => v === 'Present').length} / {filteredStudents.length}
              </p>
            </div>
          </div>
        </div>

      {/* Main Grid: Student Roster */}
      <div className="grid gap-6">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-800 p-4">
            <h3 className="font-bold text-base">
              Marking Daily Attendance on {selectedDate} {filterDept !== 'All' ? `(${filterDept})` : ''}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Student</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Attendance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-5 py-8 text-center text-slate-400">
                      No students found for the selected department.
                    </td>
                  </tr>
                ) : filteredStudents.map((student) => {
                  const currentStatus = statusMap[student.id] || 'Present';
                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <p className="font-bold text-white">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.studentId} • {student.department}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          currentStatus === 'Present'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`status-${student.id}`}
                              checked={currentStatus === 'Present'}
                              onChange={() => chooseStatus(student.id, 'Present')}
                              className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500 focus:ring-offset-slate-900"
                            />
                            <span className={`text-sm font-semibold ${currentStatus === 'Present' ? 'text-emerald-400' : 'text-slate-400'}`}>Present</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name={`status-${student.id}`}
                              checked={currentStatus === 'Absent'}
                              onChange={() => chooseStatus(student.id, 'Absent')}
                              className="w-4 h-4 text-rose-500 bg-slate-800 border-slate-700 focus:ring-rose-500 focus:ring-offset-slate-900"
                            />
                            <span className={`text-sm font-semibold ${currentStatus === 'Absent' ? 'text-rose-400' : 'text-slate-400'}`}>Absent</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
