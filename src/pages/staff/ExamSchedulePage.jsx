import { CalendarClock, Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

const emptyForm = {
  type: 'Internal Test',
  subject: 'Database Management',
  date: new Date().toISOString().slice(0, 10),
  time: '10:00 AM - 12:00 PM',
  venue: 'Lecture Hall 204',
};

export default function ExamSchedulePage() {
  const [scheduleList, setScheduleList] = useState(() => academicStore.getExamSchedules());
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const sync = () => {
      setScheduleList(academicStore.getExamSchedules());
      setSubjects(academicStore.getSubjects());
    };
    sync();
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  const filtered = scheduleList.filter((e) => {
    return (
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()) ||
      (e.venue || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      type: 'Internal Test',
      subject: subjects[0]?.name || 'Database Management',
      date: new Date().toISOString().slice(0, 10),
      time: '10:00 AM - 12:00 PM',
      venue: 'Exam Hall 101',
    });
    setShowModal(true);
    setNotice('');
  };

  const handleOpenEdit = (exam) => {
    setEditingId(exam.id);
    setForm({
      type: exam.type,
      subject: exam.subject,
      date: exam.date,
      time: exam.time,
      venue: exam.venue,
    });
    setShowModal(true);
    setNotice('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.subject || !form.date) {
      setNotice('Please provide subject and exam date.');
      return;
    }

    academicStore.saveExamSchedule({
      id: editingId || undefined,
      type: form.type,
      subject: form.subject,
      date: form.date,
      time: form.time,
      venue: form.venue,
    });

    setShowModal(false);
    setNotice(`Exam schedule for "${form.subject}" saved successfully.`);
  };

  const handleDelete = (id, subject) => {
    if (window.confirm(`Delete exam schedule for "${subject}"?`)) {
      academicStore.deleteExamSchedule(id);
      setNotice('Exam schedule deleted.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Institutional Examination Timetable</h2>
          <p className="text-sm text-slate-400">Schedule internal exams, model exams, and practical lab tests</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition"
        >
          <Plus size={16} />
          Add Exam Schedule
        </button>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search timetable by subject, type or venue..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Exam Type</th>
                <th className="px-5 py-3.5 font-semibold">Subject</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold">Time</th>
                <th className="px-5 py-3.5 font-semibold">Venue / Room</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length ? (
                filtered.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        exam.type === 'Internal Test'
                          ? 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
                          : exam.type === 'Model Exam'
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                            : 'bg-violet-500/15 border border-violet-500/30 text-violet-400'
                      }`}>
                        {exam.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-white">{exam.subject}</td>
                    <td className="px-5 py-4 text-slate-300 font-mono text-xs">{exam.date}</td>
                    <td className="px-5 py-4 text-slate-300">{exam.time}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 font-medium">
                        {exam.venue}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(exam)}
                          className="inline-flex items-center gap-1 rounded-xl border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition"
                        >
                          <Edit2 size={13} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id, exam.subject)}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No scheduled exams found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Exam Timetable Entry' : 'Add Exam Timetable Entry'}
              </h3>
              <button onClick={() => setShowModal(false)} className="rounded-xl p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Exam Category</label>
                  <CustomSelect
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full"
                  >
                    <option value="Internal Test">Internal Test</option>
                    <option value="Model Exam">Model Exam</option>
                    <option value="Practical Lab Exam">Practical Lab Exam</option>
                    <option value="University Exam">University Exam</option>
                  </CustomSelect>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Subject Name *</label>
                  <CustomSelect
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>{s.name} ({s.code})</option>
                    ))}
                  </CustomSelect>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Time Window</label>
                  <input
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    placeholder="10:00 AM - 12:00 PM"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Venue / Examination Hall</label>
                <input
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="e.g. Science Block - Room 302"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-400"
                >
                  {editingId ? 'Update Exam' : 'Schedule Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
