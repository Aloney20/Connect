import { CheckCircle2, Edit2, GraduationCap, Mail, Phone, User, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { academicStore } from '../../services/academicStore';

export default function StudentProfilePage({ user }) {
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const sync = () => setStudents(academicStore.getStudents());
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  const student = useMemo(() => {
    if (user?.studentId) {
      const found = students.find((s) => s.id === user.studentId || s.studentId === user.studentId);
      if (found) return found;
    }
    if (user?.email) {
      const found = students.find((s) => s.email.toLowerCase() === user.email.toLowerCase());
      if (found) return found;
    }
    return students[0] || {
      id: 'stu-1',
      name: 'Aarav Kumar',
      studentId: 'STU-2024-101',
      department: 'Computer Science',
      semester: 'Semester 5',
      email: 'student@college.edu',
      phone: '9876543210',
      dob: '2004-05-12',
    };
  }, [students, user]);

  const [form, setForm] = useState({
    name: student.name,
    email: student.email,
    phone: student.phone || '9876543210',
    dob: student.dob || '2004-05-12',
  });

  useEffect(() => {
    setForm({
      name: student.name,
      email: student.email,
      phone: student.phone || '9876543210',
      dob: student.dob || '2004-05-12',
    });
  }, [student]);

  const handleSave = (e) => {
    e.preventDefault();
    academicStore.saveStudent({
      ...student,
      name: form.name,
      email: form.email,
      phone: form.phone,
      dob: form.dob,
    });
    setEditing(false);
    setNotice('Profile contact details updated successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Student Identity & Academic Profile</h2>
          <p className="text-sm text-slate-400">Institutional registration and verified contact info</p>
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <Edit2 size={16} />
          {editing ? 'Cancel Editing' : 'Edit Contact Info'}
        </button>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center border-b border-slate-800 pb-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-500 font-black text-white text-3xl shadow-xl shadow-violet-500/20">
            {(student?.name || 'Student').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white">{student?.name || 'Student'}</h3>
            <p className="font-mono text-sm font-semibold text-violet-400 mt-0.5">{student?.studentId || 'STU-1'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-xl bg-violet-500/15 border border-violet-500/30 px-3 py-1 text-xs font-bold text-violet-300">
                {student?.department || 'Department'}
              </span>
              <span className="rounded-xl bg-sky-500/15 border border-sky-500/30 px-3 py-1 text-xs font-bold text-sky-300">
                {student?.semester || 'Semester 5'}
              </span>
            </div>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Date of Birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-500/20 hover:bg-violet-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Email Address</span>
              <p className="mt-1 font-bold text-sm text-white">{student.email}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Mobile Contact</span>
              <p className="mt-1 font-bold text-sm text-white">{student.phone || '9876543210'}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Academic Year</span>
              <p className="mt-1 font-bold text-sm text-white">{student.academicYear || '2024-2025'}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
              <span className="text-[10px] font-bold uppercase text-slate-400">Date of Birth</span>
              <p className="mt-1 font-bold text-sm text-white">{student.dob || '2004-05-12'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
