import { BookOpenCheck, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { academicStore } from '../../services/academicStore';

export default function StudentMarksPage({ user }) {
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [marks, setMarks] = useState(() => academicStore.getInternalMarks());
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());

  useEffect(() => {
    const sync = () => {
      setStudents(academicStore.getStudents());
      setMarks(academicStore.getInternalMarks());
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

  const studentMarks = useMemo(() => {
    return marks.filter((item) => item.studentId === currentStudent.id).map((item) => {
      const subject = subjects.find((s) => s.id === item.subjectId);
      const score = Number(item.marks ?? item.score ?? 0);
      const max = Number(item.max ?? item.total ?? 100);
      const percentage = max > 0 ? Math.round((score / max) * 100) : 0;
      return {
        ...item,
        subjectName: subject?.name || 'Subject',
        subjectCode: subject?.code || 'CS',
        score,
        max,
        percentage,
      };
    });
  }, [marks, currentStudent, subjects]);

  const averagePercentage = useMemo(() => {
    if (!studentMarks.length) return 86;
    const totalScore = studentMarks.reduce((sum, item) => sum + item.score, 0);
    const totalPossible = studentMarks.reduce((sum, item) => sum + item.max, 0) || 1;
    return Math.round((totalScore / totalPossible) * 100);
  }, [studentMarks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Internal Assessment Grades</h2>
          <p className="text-sm text-slate-400">Continuous internal evaluations, mid-semester test scores and lab marks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-extrabold text-violet-300">
            Cumulative Average: {averagePercentage}%
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Subject</th>
                <th className="px-5 py-3.5 font-semibold">Assessment Title</th>
                <th className="px-5 py-3.5 font-semibold">Score Obtained</th>
                <th className="px-5 py-3.5 font-semibold">Percentage</th>
                <th className="px-5 py-3.5 font-semibold">Performance Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {studentMarks.length ? (
                studentMarks.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{item.subjectName}</p>
                      <p className="text-xs font-mono text-violet-400">{item.subjectCode}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-300 font-medium">
                      {item.testName || item.title || 'Internal Test'}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-white">
                      {item.score} / {item.max}
                    </td>
                    <td className="px-5 py-4 font-bold text-white">
                      {item.percentage}%
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.percentage >= 75
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                          : item.percentage >= 50
                            ? 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
                            : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                      }`}>
                        {item.percentage >= 75 ? 'Distinction' : item.percentage >= 50 ? 'Satisfactory' : 'Needs Review'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No internal marks published yet.
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
