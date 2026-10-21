import { Eye, Download, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

export default function ViewAssignmentPage() {
  const { user } = useOutletContext() || {};
  const isAdmin = user?.role === 'admin';
  const staffDept = user?.department;

  const [assignments, setAssignments] = useState(() => academicStore.getAssignments());
  const [submissions, setSubmissions] = useState(() => academicStore.getSubmissions());
  const [students, setStudents] = useState(() => academicStore.getStudents());
  
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [filterDept, setFilterDept] = useState(isAdmin ? 'All' : (staffDept || 'All'));
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewingPdf, setViewingPdf] = useState(null);

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

  const filteredStudentsWithStatus = useMemo(() => {
    if (!selectedAssignmentId) return [];
    let list = students;
    if (!isAdmin && staffDept) {
      list = list.filter(s => s.department === staffDept);
    }
    if (filterDept !== 'All') {
      list = list.filter(s => s.department === filterDept);
    }
    
    return list.map(student => {
      const match = submissions.find(s => s.studentId === student.id && s.assignmentId === selectedAssignmentId);
      return {
        ...student,
        status: match ? match.status : 'Not Submitted',
        submissionFile: match && match.fileData ? { name: match.fileName, data: match.fileData } : null,
      };
    }).filter(student => {
      if (statusFilter === 'All') return true;
      return student.status === statusFilter;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, selectedAssignmentId, filterDept, submissions, isAdmin, staffDept, statusFilter]);

  const selectedAssignment = useMemo(() => {
    return assignments.find(t => t.id === selectedAssignmentId);
  }, [assignments, selectedAssignmentId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">View Assignments</h2>
          <p className="text-sm text-slate-400">View student submission statuses for assignments</p>
        </div>
      </div>

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

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Status</label>
            <CustomSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full"
            >
              <option value="All">All Students</option>
              <option value="Submitted">Submitted</option>
              <option value="Not Submitted">Not Submitted</option>
            </CustomSelect>
          </div>
        </div>
      </div>

      {selectedAssignment && (
        <div className="card overflow-hidden">
          <div className="border-b border-slate-800 p-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-400" />
              Status for {selectedAssignment.title}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Student</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Submission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStudentsWithStatus.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-5 py-8 text-center text-slate-400">
                      No students found for this department.
                    </td>
                  </tr>
                ) : filteredStudentsWithStatus.map((student) => {
                  const isSubmitted = student.status === 'Submitted';
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <p className="font-bold text-white">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.studentId} • {student.department}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold ${
                          isSubmitted 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {student.submissionFile ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewingPdf(student.submissionFile)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition"
                            >
                              <Eye size={14} />
                              View PDF
                            </button>
                            <a
                              href={student.submissionFile.data}
                              download={student.submissionFile.name || `${student.name.replace(/ /g, '_')}_submission.pdf`}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
                              title="Download PDF"
                            >
                              <Download size={14} />
                            </a>
                          </div>
                        ) : student.status === 'Submitted' ? (
                          <span className="text-xs text-slate-500 font-medium">Text Only</span>
                        ) : (
                          <span className="text-xs font-bold text-rose-500/70">Not Uploaded</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl h-[85vh] rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <h3 className="text-lg font-bold text-white">{viewingPdf.name || 'Submission PDF'}</h3>
              <button onClick={() => setViewingPdf(null)} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-slate-800/50 p-2 sm:p-4">
              <object
                data={viewingPdf.data}
                type="application/pdf"
                className="w-full h-full rounded-xl bg-white"
              >
                <div className="flex h-full items-center justify-center flex-col text-slate-400">
                  <p>Your browser does not support inline PDFs.</p>
                  <a href={viewingPdf.data} download={viewingPdf.name} className="mt-4 text-sky-400 underline">Download PDF instead</a>
                </div>
              </object>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
