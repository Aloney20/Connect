import { BookOpenCheck, Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

const initialForm = {
  studentId: '',
  subjectId: '',
  testName: '',
  type: 'Internal',
  marks: '',
  max: '20',
};

export default function AdminMarksPage() {
  const [marks, setMarks] = useState(() => academicStore.getInternalMarks());
  const [students, setStudents] = useState(() => academicStore.getStudents());
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const sync = () => {
      setMarks(academicStore.getInternalMarks());
      setStudents(academicStore.getStudents());
      setSubjects(academicStore.getSubjects());
    };
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  const filteredMarks = useMemo(() => {
    return marks.filter((mark) => {
      const student = students.find((s) => s.id === mark.studentId);
      const subject = subjects.find((s) => s.id === mark.subjectId);
      const term = `${student?.name || ''} ${subject?.name || ''} ${mark.testName || ''} ${mark.type || ''}`.toLowerCase();
      return term.includes(search.toLowerCase());
    });
  }, [marks, search, students, subjects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      studentId: students[0]?.id || '',
      subjectId: subjects[0]?.id || '',
      testName: 'Internal Test 1',
      type: 'Internal',
      marks: '18',
      max: '20',
    });
    setShowModal(true);
    setNotice('');
  };

  const handleOpenEdit = (mark) => {
    setEditingId(mark.id);
    setForm({
      studentId: mark.studentId,
      subjectId: mark.subjectId,
      testName: mark.testName || mark.title || 'Internal Test',
      type: mark.type || 'Internal',
      marks: String(mark.marks ?? mark.score ?? 0),
      max: String(mark.max ?? mark.total ?? 20),
    });
    setShowModal(true);
    setNotice('');
  };

  const handleSaveMark = (e) => {
    e.preventDefault();
    if (!form.studentId || !form.subjectId || form.marks === '') {
      setNotice('Please fill in student, subject, and marks.');
      return;
    }

    const payload = {
      id: editingId || undefined,
      studentId: form.studentId,
      subjectId: form.subjectId,
      testName: form.testName || 'Internal Test',
      title: form.testName || 'Internal Test',
      type: form.type || 'Internal',
      marks: Number(form.marks),
      score: Number(form.marks),
      max: Number(form.max || 20),
      total: Number(form.max || 20),
    };

    academicStore.saveInternalMark(payload);
    setShowModal(false);
    setForm(initialForm);
    setNotice(`Marks for assessment "${payload.testName}" recorded successfully.`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this assessment record?')) {
      academicStore.deleteInternalMark(id);
      setNotice('Record deleted successfully.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Institutional Marks & Grading</h2>
          <p className="text-sm text-slate-400">Record, inspect and adjust internal marks across all departments</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition active:scale-[0.98]"
        >
          <Plus size={16} />
          Record Assessment Mark
        </button>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, subject, or assessment..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Student</th>
                <th className="px-5 py-3.5 font-semibold">Subject</th>
                <th className="px-5 py-3.5 font-semibold">Assessment</th>
                <th className="px-5 py-3.5 font-semibold">Score / Max</th>
                <th className="px-5 py-3.5 font-semibold">Percentage</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredMarks.length ? (
                filteredMarks.map((item) => {
                  const student = students.find((s) => s.id === item.studentId);
                  const subject = subjects.find((s) => s.id === item.subjectId);
                  const score = Number(item.marks ?? item.score ?? 0);
                  const max = Number(item.max ?? item.total ?? 100);
                  const pct = max > 0 ? Math.round((score / max) * 100) : 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <p className="font-bold text-white">{student?.name || 'Student'}</p>
                        <p className="text-xs text-slate-400">{student?.studentId || 'N/A'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-200">{subject?.name || 'Subject'}</span>
                        <p className="text-xs text-amber-400 font-mono">{subject?.code || ''}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 font-medium">
                          {item.testName || item.title || 'Internal Test'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-white">
                        {score} / {max}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${pct >= 75 ? 'bg-emerald-500/15 text-emerald-400' : pct >= 50 ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'
                          }`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="inline-flex items-center gap-1 rounded-xl border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition"
                          >
                            <Edit2 size={13} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No assessment records found.
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
                {editingId ? 'Edit Assessment Mark' : 'Record New Assessment Mark'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMark} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Select Student *</label>
                  <CustomSelect
                    value={form.studentId}
                    onChange={(e) => handleChange({ target: { name: 'studentId', value: e.target.value } })}
                    className="w-full"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
                    ))}
                  </CustomSelect>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Subject *</label>
                  <CustomSelect
                    value={form.subjectId}
                    onChange={(e) => handleChange({ target: { name: 'subjectId', value: e.target.value } })}
                    className="w-full"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                    ))}
                  </CustomSelect>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Assessment Name / Title</label>
                <input
                  name="testName"
                  value={form.testName}
                  onChange={handleChange}
                  placeholder="e.g. Internal Test 1 / Model Exam / Lab Test"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Marks Obtained *</label>
                  <input
                    type="number"
                    name="marks"
                    value={form.marks}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 18"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Maximum Marks *</label>
                  <input
                    type="number"
                    name="max"
                    value={form.max}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 20"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>
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
                  className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400"
                >
                  {editingId ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
