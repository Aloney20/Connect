import { CheckCircle2, Download, FileText, Send, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { academicStore } from '../../services/academicStore';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function StudentAssignmentsPage({ user }) {
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [assignments, setAssignments] = useState(() => academicStore.getAssignments());
  const [submissions, setSubmissions] = useState(() => academicStore.getSubmissions());
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [notice, setNotice] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const sync = () => {
      setStudents(academicStore.getStudents());
      setAssignments(academicStore.getAssignments());
      setSubmissions(academicStore.getSubmissions());
      setSubjects(academicStore.getSubjects());
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

  const studentAssignments = useMemo(() => {
    return assignments.map((assignment) => {
      const subm = submissions.find((s) => s.assignmentId === assignment.id && s.studentId === currentStudent.id);
      const subject = subjects.find((s) => s.id === assignment.subjectId);
      return {
        ...assignment,
        subjectName: subject?.name || 'Subject',
        subjectCode: subject?.code || 'CS',
        submission: subm || null,
      };
    });
  }, [assignments, submissions, currentStudent, subjects]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSubmissionFile(null);
      setFileError('');
      return;
    }
    
    if (file.type !== 'application/pdf') {
      setFileError('Only PDF files are allowed.');
      setSubmissionFile(null);
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setFileError('File size must be less than 2MB.');
      setSubmissionFile(null);
      return;
    }
    
    setFileError('');
    setSubmissionFile(file); // store actual File object
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    setIsUploading(true);
    let finalFileData = null;
    let finalFileName = null;

    if (submissionFile) {
      if (storage) {
        try {
          const storagePath = `submissions/${submittingAssignment.subjectCode || 'General'}/${submittingAssignment.id}/${currentStudent.id}_${Date.now()}_${submissionFile.name}`;
          const storageRef = ref(storage, storagePath);
          const metadata = { contentType: 'application/pdf' };
          
          // 8-second timeout for Firebase upload
          const uploadPromise = uploadBytes(storageRef, submissionFile, metadata);
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase upload timeout')), 8000));
          
          const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
          finalFileData = await getDownloadURL(snapshot.ref);
          finalFileName = submissionFile.name;
        } catch (err) {
          console.warn('Firebase upload failed or timed out, falling back to local base64 storage:', err);
          finalFileData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('File reading failed'));
            reader.readAsDataURL(submissionFile);
          });
          finalFileName = submissionFile.name;
        }
      } else {
        finalFileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(new Error('File reading failed'));
          reader.readAsDataURL(submissionFile);
        });
        finalFileName = submissionFile.name;
      }
    }

    academicStore.saveSubmission({
      id: submittingAssignment.submission?.id, // keep same ID if editing
      assignmentId: submittingAssignment.id,
      studentId: currentStudent.id,
      status: 'Submitted',
      notes: submissionText.trim() || 'Attached coursework files for review.',
      fileName: finalFileName || submittingAssignment.submission?.fileName,
      fileData: finalFileData || submittingAssignment.submission?.fileData,
      marks: submittingAssignment.submission?.marks || null,
      feedback: submittingAssignment.submission?.feedback || 'Pending faculty evaluation.',
    });

    setNotice(`Assignment "${submittingAssignment.title}" submitted successfully.`);
    setSubmittingAssignment(null);
    setSubmissionText('');
    setSubmissionFile(null);
    setIsUploading(false);
  };

  const handleDownloadBrief = (assignment) => {
    const text = `ASSIGNMENT BRIEF\nTitle: ${assignment.title}\nSubject: ${assignment.subjectName}\nDeadline: ${assignment.deadline}\n\nDescription:\n${assignment.description}\n`;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${assignment.title.replace(/\s+/g, '_')}_Brief.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Coursework & Assignment Submissions</h2>
          <p className="text-sm text-slate-400">View tasks, submit deliverables, and track faculty feedback & grades</p>
        </div>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Assignments Grid */}
      <div className="grid gap-6 xl:grid-cols-2">
        {studentAssignments.map((assignment) => {
          const isSubmitted = !!assignment.submission;
          const isEvaluated = assignment.submission?.status === 'Evaluated';

          return (
            <div key={assignment.id} className="card p-6 flex flex-col justify-between hover:border-violet-500/40 transition">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-violet-400 uppercase">
                      {assignment.subjectName} ({assignment.subjectCode})
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-white leading-snug">{assignment.title}</h3>
                  </div>
                  <span className={`rounded-xl px-3 py-1 text-xs font-bold ${
                    isEvaluated
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                      : isSubmitted
                        ? 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
                        : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                  }`}>
                    {isEvaluated ? 'Evaluated' : isSubmitted ? 'Submitted' : 'Pending Submission'}
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-300 leading-relaxed">{assignment.description}</p>

                <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-800/40 p-3.5 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Deadline: <strong className="text-white font-mono">{assignment.deadline}</strong></span>
                  {assignment.submission?.marks !== undefined && isEvaluated && (
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      Score: {assignment.submission.marks} / 25
                    </span>
                  )}
                </div>

                {assignment.submission?.feedback && isEvaluated && (
                  <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                    <strong>Faculty Feedback:</strong> {assignment.submission.feedback}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => handleDownloadBrief(assignment)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                >
                  <Download size={14} />
                  Download Brief
                </button>

                {!isEvaluated && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittingAssignment(assignment);
                      setSubmissionText(assignment.submission?.notes || '');
                      setSubmissionFile(null);
                      setFileError('');
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/20 transition hover:bg-violet-500"
                  >
                    <Upload size={14} />
                    {isSubmitted ? 'Edit Submission' : 'Submit Assignment'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Submit: {submittingAssignment.title}</h3>
                <p className="text-xs text-slate-400">Due by {submittingAssignment.deadline}</p>
              </div>
              <button onClick={() => setSubmittingAssignment(null)} className="rounded-xl p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Attach Solution or Code / Notes *</label>
                <textarea
                  rows={4}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  required
                  placeholder="Paste your solution links, github repository or summary comments..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>

              <div className="rounded-2xl border border-dashed border-slate-700 p-5 text-center relative overflow-hidden hover:border-violet-500/50 transition bg-slate-800/20">
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <Upload size={24} className="mx-auto text-violet-400 mb-2" />
                {submissionFile ? (
                  <>
                    <p className="mt-2 text-sm font-bold text-emerald-400 truncate px-4">{submissionFile.name}</p>
                    <p className="text-[11px] text-slate-400">Click to change file</p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-xs font-semibold text-white">Click or drag PDF to upload</p>
                    <p className="text-[11px] text-slate-400">Max size 2MB</p>
                  </>
                )}
                {fileError && <p className="mt-2 text-xs text-rose-500 font-bold">{fileError}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  disabled={isUploading}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-500/20 hover:bg-violet-500 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Confirm & Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
