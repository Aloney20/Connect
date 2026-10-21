import { CheckCircle2, Edit2, FileText, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

export default function PostAssignmentPage() {
  const [assignments, setAssignments] = useState(() => academicStore.getAssignments());
  const [subjects, setSubjects] = useState(() => academicStore.getSubjects());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notice, setNotice] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    deadline: '',
    description: '',
  });

  useEffect(() => {
    const sync = () => {
      setAssignments(academicStore.getAssignments());
      const sub = academicStore.getSubjects();
      setSubjects(sub);
      if (!formData.subjectId && sub.length) {
        setFormData((prev) => ({ ...prev, subjectId: sub[0].id }));
      }
    };
    sync();
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, [formData.subjectId]);

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.deadline || !formData.subjectId) {
      setNotice('Please fill in title, subject and deadline.');
      return;
    }

    academicStore.saveAssignment({
      title: formData.title.trim(),
      subjectId: formData.subjectId,
      deadline: formData.deadline,
      description: formData.description || 'Complete the assignment and upload the submission files.',
      status: 'Open',
    });

    setFormData({
      title: '',
      subjectId: subjects[0]?.id || '',
      deadline: '',
      description: '',
    });
    setShowCreateModal(false);
    setNotice(`Assignment "${formData.title}" published successfully.`);
  };

  const handleDeleteAssignment = (id, title) => {
    if (window.confirm(`Delete assignment "${title}"?`)) {
      academicStore.deleteAssignment(id);
      setNotice(`Assignment "${title}" deleted.`);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Post Assignment</h2>
          <p className="text-sm text-slate-400">Publish homework briefs for students</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition"
        >
          <Plus size={16} />
          Create Assignment
        </button>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Grid of assignments */}
      <div className="grid gap-6 xl:grid-cols-2">
        {assignments.map((assignment) => {
          const subject = subjects.find((s) => s.id === assignment.subjectId);


          return (
            <div key={assignment.id} className="card p-6 flex flex-col justify-between hover:border-sky-500/40 transition">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-semibold text-sky-400">{subject?.name || 'Computer Science'} ({subject?.code || 'CS'})</span>
                    <h3 className="mt-1 text-xl font-bold text-white leading-snug">{assignment.title}</h3>
                  </div>
                  <span className="rounded-xl bg-sky-500/15 border border-sky-500/30 px-3 py-1 text-xs font-bold text-sky-300">
                    {assignment.status || 'Open'}
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-300 line-clamp-3">{assignment.description}</p>


                <button
                  type="button"
                  onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20 transition"
                  title="Delete Assignment"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Create New Assignment</h3>
              <button onClick={() => setShowCreateModal(false)} className="rounded-xl p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Assignment Title *</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Relational Schema Normalization"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Subject *</label>
                  <CustomSelect
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </CustomSelect>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">Deadline Date *</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Assignment Description & Instructions</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain requirements, deliverables, and format guidelines..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-sky-500/20 hover:bg-sky-400"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
