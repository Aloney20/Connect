import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarClock, ChevronRight, Megaphone, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { academicStore } from '../../services/academicStore.js';

export default function StudentNotificationBanner() {
  const [announcements, setAnnouncements] = useState(() => academicStore.getAnnouncements());
  const [examSchedules, setExamSchedules] = useState(() => academicStore.getExamSchedules());
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => {
      setAnnouncements(academicStore.getAnnouncements());
      setExamSchedules(academicStore.getExamSchedules());
    };
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  // Most recent announcement or exam schedule
  const latestItem = useMemo(() => {
    const all = [
      ...announcements.map((a) => ({
        id: a.id,
        type: 'announcement',
        title: a.title,
        date: a.date,
        priority: a.priority || 'Notice',
        route: '/student/announcements',
      })),
      ...examSchedules.map((e) => ({
        id: e.id,
        type: 'exam',
        title: `Upcoming Exam: ${e.subject} (${e.type || 'Exam'}) on ${e.date || ''} ${e.time ? 'at ' + e.time : ''}`,
        date: e.date,
        priority: e.type || 'Exam',
        route: '/student/exam-schedule',
      })),
    ];
    return all[0] || null;
  }, [announcements, examSchedules]);

  const totalCount = (announcements?.length || 0) + (examSchedules?.length || 0);

  if (dismissed || !latestItem) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-white to-violet-50 border-b border-indigo-100 px-4 py-2.5 text-xs text-slate-800 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            {latestItem.type === 'announcement' ? <Megaphone size={13} /> : <CalendarClock size={13} />}
          </div>
          <div className="truncate flex items-center gap-2">
            <span className="font-bold text-indigo-700 uppercase text-[10px] tracking-wide shrink-0 bg-indigo-100/80 px-2 py-0.5 rounded-full">
              {latestItem.priority}
            </span>
            <span className="font-semibold text-slate-900 truncate">
              {latestItem.title}
            </span>
            {latestItem.date && (
              <span className="text-slate-400 text-[11px] hidden md:inline">
                • {latestItem.date}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate(latestItem.route)}
            className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 px-2.5 py-1 rounded-lg hover:bg-indigo-100/50 transition text-xs"
          >
            <span>View All ({totalCount})</span>
            <ChevronRight size={13} />
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition"
            title="Dismiss notice"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
