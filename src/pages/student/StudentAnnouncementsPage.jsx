import { Bell, Megaphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { academicStore } from '../../services/academicStore';

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(() => academicStore.getAnnouncements());

  useEffect(() => {
    const sync = () => setAnnouncements(academicStore.getAnnouncements());
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Campus Notices & Announcements</h2>
          <p className="text-sm text-slate-400">Official circulars, exam notifications, and campus alerts</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-5">
        {announcements.length ? (
          announcements.map((announcement) => (
            <div key={announcement.id} className="card p-6 flex flex-col justify-between hover:border-violet-500/40 transition">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="rounded-2xl bg-violet-500/15 p-3 text-violet-400 mt-0.5">
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white leading-snug">{announcement.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">Published on {announcement.date}</p>
                  </div>
                </div>

                <span className={`rounded-xl px-3 py-1 text-xs font-bold ${
                  announcement.priority === 'Urgent'
                    ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                    : announcement.priority === 'Important'
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                      : 'bg-violet-500/15 border border-violet-500/30 text-violet-300'
                }`}>
                  {announcement.priority}
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-300 whitespace-pre-line leading-relaxed pl-12">
                {announcement.description}
              </p>
            </div>
          ))
        ) : (
          <div className="card p-10 text-center text-slate-400">
            No announcements broadcasted at this time.
          </div>
        )}
      </div>
    </div>
  );
}
