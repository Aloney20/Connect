import { CheckCircle2, Megaphone, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { academicStore } from '../../services/academicStore';
import CustomSelect from '../../components/ui/CustomSelect';

const emptyForm = {
  title: '',
  description: '',
  priority: 'Important',
};

export default function AnnouncementsPage() {
  const [announcementList, setAnnouncementList] = useState(() => academicStore.getAnnouncements());
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const sync = () => setAnnouncementList(academicStore.getAnnouncements());
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setNotice('Please provide title and description.');
      return;
    }

    academicStore.saveAnnouncement({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      date: new Date().toISOString().slice(0, 10),
    });

    setForm(emptyForm);
    setShowModal(false);
    setNotice(`Announcement "${form.title}" broadcasted to students successfully.`);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete announcement "${title}"?`)) {
      academicStore.deleteAnnouncement(id);
      setNotice(`Announcement "${title}" removed.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Campus Announcements & Broadcasts</h2>
          <p className="text-sm text-slate-400">Publish institutional notices, exam circulars, and departmental updates</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition"
        >
          <Plus size={16} />
          New Announcement
        </button>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Announcements List */}
      <div className="grid gap-5">
        {announcementList.map((announcement) => (
          <div key={announcement.id} className="card p-6 flex flex-col justify-between hover:border-sky-500/40 transition">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-sky-500/15 p-3 text-sky-400 mt-0.5">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{announcement.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">Published on {announcement.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded-xl px-3 py-1 text-xs font-bold ${
                  announcement.priority === 'Urgent'
                    ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                    : announcement.priority === 'Important'
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                      : 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
                }`}>
                  {announcement.priority}
                </span>
                <button
                  onClick={() => handleDelete(announcement.id, announcement.title)}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20 transition"
                  title="Delete Announcement"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-300 whitespace-pre-line leading-relaxed pl-12">
              {announcement.description}
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Broadcast New Notice</h3>
              <button onClick={() => setShowModal(false)} className="rounded-xl p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Notice Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. Mid-Semester Exam Schedule & Room Allocations"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Priority Level</label>
                <CustomSelect
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full"
                >
                  <option>Important</option>
                  <option>Urgent</option>
                  <option>General</option>
                </CustomSelect>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Notice Body & Details *</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  placeholder="Write the full announcement text here..."
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
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
