import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Search,
  Users,
  X,
  XCircle,
  AlertTriangle,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { academicStore } from '../../services/academicStore.js';
import CustomSelect from '../../components/ui/CustomSelect';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ViewAttendancePage() {
  const { user } = useOutletContext() || {};
  const isAdmin = user?.role === 'admin';
  const staffDept = user?.department;

  const [students, setStudents] = useState(() => academicStore.getStudents() || []);
  const [attendanceRecords, setAttendanceRecords] = useState(() => academicStore.getAttendance() || []);

  // Filter States
  const [filterDept, setFilterDept] = useState(isAdmin ? 'All' : (staffDept || 'All'));
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Default to current month YYYY-MM (e.g. '2026-10')
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('All'); // 'All' | 'Low' | 'Regular' | 'Perfect'
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'matrix'
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

  // Sync data with academicStore
  useEffect(() => {
    const sync = () => {
      setStudents(academicStore.getStudents() || []);
      setAttendanceRecords(academicStore.getAttendance() || []);
    };
    sync();
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  // Unique departments
  const departments = useMemo(() => {
    if (!isAdmin && staffDept) return [staffDept];
    const depts = new Set(students.map((s) => s.department).filter(Boolean));
    return ['All', ...Array.from(depts)];
  }, [students, isAdmin, staffDept]);

  // Available months from attendance records
  const availableMonths = useMemo(() => {
    const months = new Set();
    attendanceRecords.forEach((r) => {
      if (r.date && r.date.length >= 7) {
        months.add(r.date.slice(0, 7));
      }
    });
    // Ensure currently selected month is included
    months.add(selectedMonth);
    return Array.from(months).sort().reverse();
  }, [attendanceRecords, selectedMonth]);

  // Navigate months easily
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  // Distinct working dates recorded in selected month
  const workingDatesInMonth = useMemo(() => {
    const dates = new Set();
    attendanceRecords.forEach((r) => {
      if (r.date && r.date.startsWith(selectedMonth)) {
        dates.add(r.date);
      }
    });
    return Array.from(dates).sort();
  }, [attendanceRecords, selectedMonth]);

  // Number of days in the month
  const totalDaysInMonth = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  }, [selectedMonth]);

  // Compute monthly attendance for filtered students
  const monthlyStudentAttendance = useMemo(() => {
    let list = students;
    if (!isAdmin && staffDept) {
      list = list.filter((s) => s.department === staffDept);
    }
    if (filterDept !== 'All') {
      list = list.filter((s) => s.department === filterDept);
    }

    const monthRecords = attendanceRecords.filter((r) => r.date && r.date.startsWith(selectedMonth));

    return list.map((student) => {
      // Find all records for this student in this month
      const sRecords = monthRecords.filter((r) => r.studentId === student.id);

      // Group records by date
      const dateMap = {};
      sRecords.forEach((r) => {
        if (!dateMap[r.date]) dateMap[r.date] = [];
        dateMap[r.date].push(r);
      });

      const presentDates = [];
      const absentDates = [];
      const lateDates = [];

      Object.entries(dateMap).forEach(([date, records]) => {
        const hasPresent = records.some((r) => r.status === 'Present');
        const hasLate = records.some((r) => r.status === 'Late');
        const allAbsent = records.every((r) => r.status === 'Absent');

        if (hasPresent) {
          presentDates.push(date);
        } else if (hasLate) {
          lateDates.push(date);
          presentDates.push(date); // Count late as attended
        } else if (allAbsent) {
          absentDates.push(date);
        }
      });

      // Sort dates ascending
      presentDates.sort();
      absentDates.sort();
      lateDates.sort();

      const totalRecordedDays = presentDates.length + absentDates.length;
      const percentage = totalRecordedDays > 0 ? Math.round((presentDates.length / totalRecordedDays) * 100) : 0;

      return {
        ...student,
        presentDates,
        absentDates,
        lateDates,
        totalPresent: presentDates.length,
        totalAbsent: absentDates.length,
        totalRecordedDays,
        percentage,
        dateMap,
      };
    }).filter((s) => {
      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = String(s.name || '').toLowerCase().includes(q);
        const matchesId = String(s.studentId || '').toLowerCase().includes(q);
        const matchesEmail = String(s.email || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesEmail) return false;
      }

      // Filter by attendance status
      if (attendanceFilter === 'Low') return s.percentage < 75 && s.totalRecordedDays > 0;
      if (attendanceFilter === 'Regular') return s.percentage >= 75;
      if (attendanceFilter === 'Perfect') return s.percentage === 100 && s.totalRecordedDays > 0;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, attendanceRecords, selectedMonth, filterDept, isAdmin, staffDept, searchQuery, attendanceFilter]);

  // Overall Month Statistics
  const stats = useMemo(() => {
    const totalStudents = monthlyStudentAttendance.length;
    if (totalStudents === 0) {
      return { totalStudents: 0, avgPercentage: 0, regularCount: 0, lowCount: 0, workingDays: workingDatesInMonth.length };
    }
    const sumPercentage = monthlyStudentAttendance.reduce((acc, s) => acc + s.percentage, 0);
    const avgPercentage = Math.round(sumPercentage / totalStudents);
    const regularCount = monthlyStudentAttendance.filter((s) => s.percentage >= 75).length;
    const lowCount = monthlyStudentAttendance.filter((s) => s.percentage < 75 && s.totalRecordedDays > 0).length;

    return {
      totalStudents,
      avgPercentage,
      regularCount,
      lowCount,
      workingDays: workingDatesInMonth.length,
    };
  }, [monthlyStudentAttendance, workingDatesInMonth]);

  // Format date helper: "2026-10-04" -> "04 Oct"
  const formatDateChip = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const day = parts[2];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const monthShort = MONTH_NAMES[monthIndex]?.slice(0, 3) || parts[1];
    return `${day} ${monthShort}`;
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    if (!monthlyStudentAttendance.length) return;
    const monthLabel = selectedMonth;

    const data = monthlyStudentAttendance.map((s, idx) => ({
      'S.No': idx + 1,
      'Student Name': s.name,
      'Student ID / Roll No': s.studentId,
      'Department': s.department,
      'Month': monthLabel,
      'Total Recorded Days': s.totalRecordedDays,
      'Days Present': s.totalPresent,
      'Days Absent': s.totalAbsent,
      'Attendance Percentage': `${s.percentage}%`,
      'Dates Present': s.presentDates.map(formatDateChip).join(', ') || 'None',
      'Dates Absent': s.absentDates.map(formatDateChip).join(', ') || 'None',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Attendance');
    XLSX.writeFile(wb, `Attendance_Report_${selectedMonth}_${filterDept}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Monthly Attendance History</h2>
          <p className="text-sm text-slate-500">
            View exact days students attended and missed in a full monthly overview
          </p>
        </div>

        {/* Top Right Corner: Student Monthly Attendance Breakdown & Export Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xs transition"
            style={{
              background: '#dbeafe',
              color: '#1a56db',
              border: '1px solid rgba(26, 86, 219, 0.25)'
            }}
          >
            <CalendarDays size={15} style={{ color: '#1a56db' }} />
            <span>Student Monthly Attendance Breakdown for {selectedMonth}</span>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 transition shadow-xs"
            style={{
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1'
            }}
          >
            <Download size={15} style={{ color: '#64748b' }} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="card p-5 space-y-4 bg-white border border-slate-200/80 shadow-sm rounded-2xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          {/* Month Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Select Month & Year</label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition shadow-xs"
                title="Previous Month"
              >
                <ChevronLeft size={18} />
              </button>

              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 font-semibold outline-none focus:border-blue-500 transition shadow-xs"
              />

              <button
                type="button"
                onClick={handleNextMonth}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition shadow-xs"
                title="Next Month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Department</label>
            <CustomSelect
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full"
              disabled={!isAdmin && !!staffDept}
            >
              {isAdmin && <option value="All">All Departments</option>}
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </CustomSelect>
          </div>

          {/* Attendance Status Filter */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Attendance Filter</label>
            <CustomSelect
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="w-full"
            >
              <option value="All">All Students</option>
              <option value="Regular">Regular Attendance</option>
              <option value="Low">Low Attendance</option>
              <option value="Perfect">100% Present</option>
            </CustomSelect>
          </div>

          {/* Search Box */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Search Student</label>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 transition shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Footer Counter */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900 font-bold">{monthlyStudentAttendance.length}</strong> students
          </div>
        </div>
      </div>

      {/* Monthly Metrics Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4 flex items-center gap-3.5 bg-white border border-slate-200/80 shadow-sm rounded-2xl">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Class Working Days</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{stats.workingDays} Days</h4>
            <p className="text-[11px] text-slate-400">recorded in {selectedMonth}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3.5 bg-white border border-slate-200/80 shadow-sm rounded-2xl">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Average Class Attendance</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{stats.avgPercentage}%</h4>
            <p className="text-[11px] text-emerald-600 font-medium">{stats.regularCount} regular students</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3.5 bg-white border border-slate-200/80 shadow-sm rounded-2xl">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Attendance Shortage</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{stats.lowCount} Students</h4>
            <p className="text-[11px] text-amber-600 font-medium">Require attendance notice</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3.5 bg-white border border-slate-200/80 shadow-sm rounded-2xl">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Enrolled Students</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{stats.totalStudents}</h4>
            <p className="text-[11px] text-slate-400">{filterDept === 'All' ? 'All Departments' : filterDept}</p>
          </div>
        </div>
      </div>

      {/* View Mode 1: Summary & Exact Dates (Present & Absent Dates) */}
      {viewMode === 'summary' && (
        <div className="card overflow-hidden bg-white border border-slate-200/80 shadow-sm rounded-2xl">
          <div className="border-b border-slate-200 p-4 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <CalendarDays size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                  Student Monthly Attendance Breakdown for {selectedMonth}
                </h3>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Present Dates
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span> Absent Dates
                  </span>
                </div>
              </div>
            </div>

            {/* Right Corner View Mode Switcher */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('summary')}
                className="px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                style={
                  viewMode === 'summary'
                    ? { background: '#dbeafe', color: '#1a56db', border: '1px solid rgba(26,86,219,0.35)', fontWeight: 700 }
                    : { background: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600 }
                }
              >
                <CalendarDays size={14} />
                <span>Monthly Breakdown</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className="px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                style={
                  viewMode === 'matrix'
                    ? { background: '#dbeafe', color: '#1a56db', border: '1px solid rgba(26,86,219,0.35)', fontWeight: 700 }
                    : { background: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600 }
                }
              >
                <FileSpreadsheet size={14} />
                <span>Register Grid</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5 font-semibold w-72">Student</th>
                  <th className="px-5 py-3.5 font-semibold">Exact Dates Present</th>
                  <th className="px-5 py-3.5 font-semibold">Exact Dates Absent</th>
                  <th className="px-4 py-3.5 font-semibold text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {monthlyStudentAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-12 text-center text-slate-500">
                      <p className="font-semibold text-slate-700">No attendance data found for {selectedMonth}</p>
                      <p className="text-xs text-slate-400 mt-1">Try selecting another month or adjust your department filter.</p>
                    </td>
                  </tr>
                ) : (
                  monthlyStudentAttendance.map((student) => {
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition">
                        {/* Student Info */}
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900 text-sm leading-tight">{student.name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{student.studentId}</p>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                            {student.department}
                          </span>
                        </td>

                        {/* Exact Dates Present */}
                        <td className="px-5 py-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-emerald-700">
                                {student.totalPresent} Days Present
                              </span>
                            </div>

                            {student.presentDates.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-md">
                                {student.presentDates.map((d) => (
                                  <span
                                    key={d}
                                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm"
                                    title={`Present on ${d}`}
                                  >
                                    {formatDateChip(d)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No days present</span>
                            )}
                          </div>
                        </td>

                        {/* Exact Dates Absent */}
                        <td className="px-5 py-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-xs font-bold ${
                                  student.totalAbsent > 0 ? 'text-rose-700' : 'text-emerald-700'
                                }`}
                              >
                                {student.totalAbsent > 0
                                  ? `${student.totalAbsent} Days Missed`
                                  : '100% Present (No Absences)'}
                              </span>
                            </div>

                            {student.absentDates.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-md">
                                {student.absentDates.map((d) => (
                                  <span
                                    key={d}
                                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 shadow-sm"
                                    title={`Absent on ${d}`}
                                  >
                                    {formatDateChip(d)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-emerald-700 font-medium">
                                ✓ Excellent attendance
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action: Open Detailed Calendar Modal */}
                        <td className="px-4 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForModal(student)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition shadow-xs"
                            title="View Month Calendar"
                          >
                            <Calendar size={13} />
                            <span>Calendar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Mode 2: Full Monthly Register Grid (Spreadsheet Matrix 1 to 31) */}
      {viewMode === 'matrix' && (
        <div className="card overflow-hidden bg-white border border-slate-200/80 shadow-sm rounded-2xl">
          <div className="border-b border-slate-200 p-4 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <FileSpreadsheet size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                  Attendance Register Matrix ({selectedMonth})
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Monthly day-by-day attendance grid for {monthlyStudentAttendance.length} students
                </p>
              </div>
            </div>

            {/* Right Corner View Mode Switcher */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('summary')}
                className="px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                style={
                  viewMode === 'summary'
                    ? { background: '#dbeafe', color: '#1a56db', border: '1px solid rgba(26,86,219,0.35)', fontWeight: 700 }
                    : { background: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600 }
                }
              >
                <CalendarDays size={14} />
                <span>Monthly Breakdown</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className="px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                style={
                  viewMode === 'matrix'
                    ? { background: '#dbeafe', color: '#1a56db', border: '1px solid rgba(26,86,219,0.35)', fontWeight: 700 }
                    : { background: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600 }
                }
              >
                <FileSpreadsheet size={14} />
                <span>Register Grid</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-center text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold sticky left-0 bg-slate-50 z-10 w-48 shadow-xs border-r border-slate-200">
                    Student Name
                  </th>
                  <th className="px-2 py-3 font-bold w-16 text-slate-600">Present</th>
                  {Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).map((day) => {
                    const dayStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
                    const hasWorking = workingDatesInMonth.includes(dayStr);
                    return (
                      <th
                        key={day}
                        className={`px-1.5 py-2 font-mono font-medium ${
                          hasWorking ? 'text-blue-700 bg-blue-50/80 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {day}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono bg-white">
                {monthlyStudentAttendance.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-2.5 text-left font-sans font-semibold text-slate-900 sticky left-0 bg-white z-10 shadow-xs border-r border-slate-200 truncate max-w-xs">
                      {student.name}
                    </td>
                    <td className="px-2 py-2.5 font-bold font-sans text-emerald-700">
                      {student.totalPresent}d
                    </td>
                    {Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).map((day) => {
                      const dayStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
                      const isPresent = student.presentDates.includes(dayStr);
                      const isAbsent = student.absentDates.includes(dayStr);

                      if (isPresent) {
                        return (
                          <td key={day} className="p-1">
                            <span
                              className="inline-flex h-6 w-6 items-center justify-center text-[11px] shadow-xs"
                              style={{
                                background: '#16a34a',
                                color: '#ffffff',
                                fontWeight: 800,
                                borderRadius: '5px'
                              }}
                              title={`Present on ${dayStr}`}
                            >
                              P
                            </span>
                          </td>
                        );
                      }
                      if (isAbsent) {
                        return (
                          <td key={day} className="p-1">
                            <span
                              className="inline-flex h-6 w-6 items-center justify-center text-[11px] shadow-xs"
                              style={{
                                background: '#dc2626',
                                color: '#ffffff',
                                fontWeight: 800,
                                borderRadius: '5px'
                              }}
                              title={`Absent on ${dayStr}`}
                            >
                              A
                            </span>
                          </td>
                        );
                      }
                      return (
                        <td key={day} className="p-1 text-slate-300">
                          -
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Full Student Monthly Calendar Inspection */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{selectedStudentForModal.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {selectedStudentForModal.studentId} • {selectedStudentForModal.department} • Month: {selectedMonth}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <p className="text-[11px] text-slate-500 font-semibold uppercase">Total Present</p>
                  <p className="text-xl font-bold text-emerald-600 mt-0.5">{selectedStudentForModal.totalPresent} Days</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-semibold uppercase">Total Absent</p>
                  <p className="text-xl font-bold text-rose-600 mt-0.5">{selectedStudentForModal.totalAbsent} Days</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-semibold uppercase">Total Recorded Days</p>
                  <p className="text-xl font-bold text-blue-600 mt-0.5">{selectedStudentForModal.totalRecordedDays} Days</p>
                </div>
              </div>

              {/* Exact Dates Lists */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={14} /> Days Present ({selectedStudentForModal.presentDates.length}):
                  </h4>
                  {selectedStudentForModal.presentDates.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      {selectedStudentForModal.presentDates.map((d) => (
                        <span
                          key={d}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono shadow-xs"
                        >
                          {formatDateChip(d)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No present records this month.</p>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <XCircle size={14} /> Days Absent ({selectedStudentForModal.absentDates.length}):
                  </h4>
                  {selectedStudentForModal.absentDates.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
                      {selectedStudentForModal.absentDates.map((d) => (
                        <span
                          key={d}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 font-mono shadow-xs"
                        >
                          {formatDateChip(d)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                      ✓ No absences recorded! 100% regular attendance this month.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/80 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-700 transition"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
