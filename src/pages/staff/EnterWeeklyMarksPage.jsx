import { CheckCircle2, Search, X, Download, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';
import * as XLSX from 'xlsx';

export default function EnterWeeklyMarksPage() {
  const { user } = useOutletContext() || {};
  const isAdmin = user?.role === 'admin';
  const staffDept = user?.department;

  const [weeklyTestList, setWeeklyTestList] = useState(() => academicStore.getWeeklyTests());
  const [weeklyTestMarks, setWeeklyTestMarks] = useState(() => academicStore.getWeeklyTestMarks());
  const [students, setStudents] = useState(() => academicStore.getStudents());
  
  const [selectedTestId, setSelectedTestId] = useState('');
  const [filterDept, setFilterDept] = useState(isAdmin ? 'All' : (staffDept || 'All'));
  
  const [marksMap, setMarksMap] = useState({});
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const sync = () => {
      setWeeklyTestList(academicStore.getWeeklyTests());
      setWeeklyTestMarks(academicStore.getWeeklyTestMarks());
      setStudents(academicStore.getStudents());
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

  // When selected test or department changes, initialize marks map
  useEffect(() => {
    if (!selectedTestId) {
      setMarksMap({});
      return;
    }
    
    const initialMarks = {};
    students.forEach((student) => {
      const match = weeklyTestMarks.find((m) => m.studentId === student.id && m.testId === selectedTestId);
      if (match) {
        initialMarks[student.id] = match.marks;
      }
    });
    setMarksMap(initialMarks);
  }, [selectedTestId, weeklyTestMarks, students]);

  const filteredStudents = useMemo(() => {
    if (!selectedTestId) return [];
    let list = students;
    if (!isAdmin && staffDept) {
      list = list.filter(s => s.department === staffDept);
    }
    if (filterDept !== 'All') {
      list = list.filter(s => s.department === filterDept);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [students, selectedTestId, filterDept, isAdmin, staffDept]);

  const selectedTest = useMemo(() => {
    return weeklyTestList.find(t => t.id === selectedTestId);
  }, [weeklyTestList, selectedTestId]);

  const handleMarkChange = (studentId, value) => {
    setMarksMap(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleSaveMarks = () => {
    if (!selectedTest) return;

    filteredStudents.forEach((student) => {
      const marksVal = marksMap[student.id];
      if (marksVal !== undefined && marksVal !== '') {
        academicStore.saveWeeklyTestMark(student.id, selectedTest.id, Number(marksVal));
      }
    });

    setNotice(`Marks saved successfully for ${filteredStudents.length} students.`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleExportExcel = () => {
    if (!selectedTest) return;

    const data = filteredStudents.map(student => ({
      'Student ID': student.studentId,
      'Student Name': student.name,
      'Department': student.department,
      'Marks': marksMap[student.id] ?? ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marks');

    const baseName = `${selectedTest.title}_${filterDept}_Marks`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${baseName}.xlsx`;
    XLSX.writeFile(wb, fileName);
    setNotice(`Exported marks template to ${fileName}`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const newMarksMap = { ...marksMap };
        let importCount = 0;

        data.forEach(row => {
          // Check for exact column name or normalized name
          const studentIdStr = row['Student ID'] || row['studentId'] || row['student_id'];
          const marksVal = row['Marks'] || row['marks'] || row['score'];

          if (studentIdStr && marksVal !== undefined) {
            // Find student by their registration ID
            const student = filteredStudents.find(s => s.studentId === studentIdStr);
            if (student) {
              newMarksMap[student.id] = marksVal;
              importCount++;
            }
          }
        });

        setMarksMap(newMarksMap);
        setNotice(`Successfully imported marks for ${importCount} students. Don't forget to save!`);
      } catch (err) {
        console.error("Import error:", err);
        setNotice("Failed to import Excel file. Please ensure it matches the exported format.");
      }
      setTimeout(() => setNotice(''), 5000);
      e.target.value = null; // Reset input
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Enter Weekly Marks</h2>
          <p className="text-sm text-slate-400">Enter marks for weekly questions</p>
        </div>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}

      <div className="card p-5">
        <div className="grid gap-4 sm:grid-cols-3">
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
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Select Question</label>
            <CustomSelect
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              className="w-full"
            >
              <option value="">-- Choose a Question --</option>
              {weeklyTestList.map((test) => (
                <option key={test.id} value={test.id}>{test.title} (Max: {test.maxMarks})</option>
              ))}
            </CustomSelect>
          </div>
        </div>
      </div>

      {selectedTest && (
        <div className="card overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 p-5 gap-4">
            <div>
              <h3 className="font-bold text-lg text-white">Enter Marks</h3>
              <p className="text-xs text-slate-400">Showing {filteredStudents.length} students</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
              >
                <Download size={16} />
                Export Excel
              </button>
              
              <label className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-bold text-sky-400 hover:bg-sky-500/20 transition cursor-pointer">
                <Upload size={16} />
                Import Excel
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleImportExcel}
                />
              </label>

              <button
                onClick={handleSaveMarks}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition"
              >
                <CheckCircle2 size={16} />
                Save Marks
              </button>
            </div>
          </div>

          <div className="p-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStudents.length === 0 ? (
              <p className="col-span-full text-center text-sm text-slate-500 py-8">No students found for this department.</p>
            ) : (
              filteredStudents.map((student) => (
                <div key={student.id} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-800/40 p-4 hover:border-sky-500/30 transition">
                  <div className="mb-3">
                    <p className="font-bold text-sm text-white truncate">{student.name}</p>
                    <p className="text-xs text-slate-400">{student.studentId} • {student.department}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-700/50 pt-3">
                    <span className="text-xs font-semibold text-slate-400">Score:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={selectedTest.maxMarks}
                        value={marksMap[student.id] ?? ''}
                        onChange={(e) => handleMarkChange(student.id, e.target.value)}
                        className="w-20 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-white font-mono text-center outline-none focus:border-sky-500"
                        placeholder="-"
                      />
                      <span className="text-xs font-bold text-slate-500">/ {selectedTest.maxMarks}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
