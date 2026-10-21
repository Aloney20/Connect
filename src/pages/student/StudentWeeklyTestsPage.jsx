import { BriefcaseBusiness, Calendar, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { academicStore } from '../../services/academicStore';

export default function StudentWeeklyTestsPage({ user }) {
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [weeklyTests, setWeeklyTests] = useState(() => academicStore.getWeeklyTests());
  const [weeklyTestMarks, setWeeklyTestMarks] = useState(() => academicStore.getWeeklyTestMarks());
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());

  useEffect(() => {
    const sync = () => {
      setStudents(academicStore.getStudents());
      setWeeklyTests(academicStore.getWeeklyTests());
      setWeeklyTestMarks(academicStore.getWeeklyTestMarks());
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

  const studentTests = useMemo(() => {
    return weeklyTests.map((test) => {
      const markEntry = weeklyTestMarks.find((m) => m.studentId === currentStudent.id && m.testId === test.id);
      const subject = subjects.find((s) => s.id === test.subjectId);
      const marks = markEntry ? Number(markEntry.marks) : 18;
      const max = Number(test.maxMarks || 20);
      const pct = Math.round((marks / max) * 100);
      return {
        ...test,
        subjectName: subject?.name || 'Subject',
        subjectCode: subject?.code || 'CS',
        obtainedMarks: marks,
        percentage: pct,
      };
    });
  }, [weeklyTests, weeklyTestMarks, currentStudent, subjects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Weekly Assessment Tests</h2>
          <p className="text-sm text-slate-400">Regular unit tests, progress evaluations, and scorecards</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {studentTests.map((test) => (
          <div key={test.id} className="card p-6 flex flex-col justify-between hover:border-violet-500/40 transition">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-mono font-bold text-violet-400 uppercase">{test.subjectCode}</span>
                  <h3 className="mt-1 text-lg font-bold text-white leading-snug">{test.title}</h3>
                </div>
                <span className="rounded-xl bg-violet-500/15 border border-violet-500/30 px-2.5 py-1 text-xs font-bold text-violet-300">
                  {test.maxMarks} Max
                </span>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                <p><strong className="text-slate-300">Subject:</strong> {test.subjectName}</p>
                <p><strong className="text-slate-300">Unit:</strong> {test.unit}</p>
                <p><strong className="text-slate-300">Test Date:</strong> {test.date}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-800/50 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Score Obtained</span>
                <p className="font-mono text-lg font-extrabold text-white mt-0.5">
                  {test.obtainedMarks} / {test.maxMarks}
                </p>
              </div>
              <span className={`rounded-xl px-2.5 py-1 text-xs font-bold ${
                test.percentage >= 75 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
              }`}>
                {test.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
