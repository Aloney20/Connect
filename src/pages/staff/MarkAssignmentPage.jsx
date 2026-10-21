import { CheckCircle2, CheckSquare, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

export default function MarkAssignmentPage() {
  const { user } = useOutletContext() || {};
  const isAdmin = user?.role === 'admin';
  const staffDept = user?.department;

  const [assignments, setAssignments] = useState(() => academicStore.getAssignments());
  const [submissions, setSubmissions] = useState(() => academicStore.getSubmissions());
  const [students, setStudents] = useState(() => academicStore.getStudents());
  
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [filterDept, setFilterDept] = useState(isAdmin ? 'All' : (staffDept || 'All'));
  
  const [statusMap, setStatusMap] = useState({});
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const sync = () => {
      setAssignments(academicStore.getAssignments());
      setSubmissions(academicStore.getSubmissions());
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

  // When selected assignment or department changes, initialize status map
  useEffect(() => {
    if (!selectedAssignmentId) {
      setStatusMap({});
      return;
    }
    
    const initialStatus = {};
    students.forEach((student) => {
      const match = submissions.find((s) => s.studentId === student.id && s.assignmentId === selectedAssignmentId);
      if (match) {
        initialStatus[student.id] = match.status; // 'Submitted' or 'Not Submitted'
      } else {
        initialStatus[student.id] = 'Not Submitted';
      }
    });
    setStatusMap(initialStatus);
  }, [selectedAssignmentId, submissions, students]);

  const filteredStudents = useMemo(() => {
    if (!selectedAssignmentId) return [];
    let list = students;
    if (!isAdmin && staffDept) {
      list = list.filter(s => s.department === staffDept);
    }
    if (filterDept !== 'All') {
      list = list.filter(s => s.department === filterDept);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [students, selectedAssignmentId, filterDept, isAdmin, staffDept]);

  const selectedAssignment = useMemo(() => {
    return assignments.find(t => t.id === selectedAssignmentId);
  }, [assignments, selectedAssignmentId]);

  const handleStatusChange = (studentId, value) => {
    setStatusMap(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleSaveStatus = () => {
    if (!selectedAssignment) return;

    const recordsToSave = [];
    filteredStudents.forEach((student) => {
      const statusVal = statusMap[student.id];
      if (statusVal) {
        recordsToSave.push({
          assignmentId: selectedAssignment.id,
          studentId: student.id,
          status: statusVal
        });
      }
    });

    if (recordsToSave.length > 0) {
      academicStore.saveSubmissionBatch(recordsToSave);
    }

    setNotice(`Assignment statuses saved successfully for ${filteredStudents.length} students.`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleMarkAllSubmitted = () => {
    if (!selectedAssignment) return;
    const newStatus = { ...statusMap };
    filteredStudents.forEach((student) => {
      newStatus[student.id] = 'Submitted';
    });
    setStatusMap(newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Mark Assignment Status</h2>
          <p className="text-sm text-slate-400">Mark students as Submitted or Not Submitted</p>
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
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Select Assignment</label>
            <CustomSelect
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              className="w-full"
            >
              <option value="">-- Choose an Assignment --</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
              ))}
            </CustomSelect>
          </div>
        </div>
      </div>

      {selectedAssignment && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <div>
              <h3 className="font-bold text-lg text-white">Enter Statuses</h3>
              <p className="text-xs text-slate-400">Showing {filteredStudents.length} students</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleMarkAllSubmitted}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
              >
                <CheckSquare size={16} />
                Mark All Submitted
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition"
              >
                <CheckCircle2 size={16} />
                Save Statuses
              </button>
            </div>
          </div>

          <div className="p-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStudents.length === 0 ? (
              <p className="col-span-full text-center text-sm text-slate-500 py-8">No students found for this department.</p>
            ) : (
              filteredStudents.map((student) => {
                const isSubmitted = statusMap[student.id] === 'Submitted';
                return (
                  <div key={student.id} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-800/40 p-4 hover:border-sky-500/30 transition">
                    <div className="mb-4">
                      <p className="font-bold text-sm text-white truncate">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.studentId} • {student.department}</p>
                    </div>
                    
                    <div className="mt-auto grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStatusChange(student.id, 'Submitted')}
                        className={`rounded-lg py-2 text-xs font-bold transition ${
                          isSubmitted 
                            ? 'bg-green-500 text-white shadow-md shadow-green-500/20' 
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        Submitted
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'Not Submitted')}
                        className={`rounded-lg py-2 text-xs font-bold transition ${
                          !isSubmitted 
                            ? 'bg-red-500 text-white shadow-md shadow-red-500/20' 
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        Not Submitted
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
