import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CalendarClock, Check, Megaphone, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { academicStore } from '../../services/academicStore.js';

export default function StudentNotificationBell() {
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState(() => academicStore.getAnnouncements() || []);
  const [examSchedules, setExamSchedules] = useState(() => academicStore.getExamSchedules() || []);
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  // Read state stored in localStorage
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem('student_read_notifications');
      return new Set(stored ? JSON.parse(stored) : []);
    } catch (e) {
      return new Set();
    }
  });

  // Sync with academicStore
  useEffect(() => {
    const sync = () => {
      setAnnouncements(academicStore.getAnnouncements() || []);
      setExamSchedules(academicStore.getExamSchedules() || []);
    };
    const unsub = academicStore.subscribe(sync);
    return unsub;
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Combine announcements and exams into unified notification feed
  const allNotifications = useMemo(() => {
    const list = [];

    (announcements || []).forEach((a) => {
      list.push({
        id: `ann-${a.id}`,
        type: 'announcement',
        title: a.title,
        detail: a.description || a.content || 'Campus announcement',
        date: a.date || 'Notice',
        tag: a.priority || 'Notice',
        route: '/student/announcements',
      });
    });

    (examSchedules || []).forEach((e) => {
      list.push({
        id: `exam-${e.id}`,
        type: 'exam',
        title: `${e.subject} (${e.type || 'Exam'})`,
        detail: `${e.date || ''}${e.time ? ' at ' + e.time : ''}${e.venue ? ' • ' + e.venue : ''}`,
        date: e.date || 'Upcoming',
        tag: e.type || 'Exam',
        route: '/student/exam-schedule',
      });
    });

    // Unread items first, then date descending
    return list.sort((a, b) => {
      const aRead = readIds.has(a.id);
      const bRead = readIds.has(b.id);
      if (aRead !== bRead) return aRead ? 1 : -1;
      return String(b.date).localeCompare(String(a.date));
    });
  }, [announcements, examSchedules, readIds]);

  const unreadCount = useMemo(() => {
    return allNotifications.filter((n) => !readIds.has(n.id)).length;
  }, [allNotifications, readIds]);

  const totalCount = allNotifications.length;

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    const next = new Set([...readIds, ...allNotifications.map((n) => n.id)]);
    setReadIds(next);
    try {
      localStorage.setItem('student_read_notifications', JSON.stringify(Array.from(next)));
    } catch (err) {}
  };

  const handleItemClick = (item) => {
    if (!readIds.has(item.id)) {
      const next = new Set(readIds);
      next.add(item.id);
      setReadIds(next);
      try {
        localStorage.setItem('student_read_notifications', JSON.stringify(Array.from(next)));
      } catch (err) {}
    }
    setOpen(false);
    navigate(item.route);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Prominent Notification Bar Button */}
      <button
        type="button"
        id="student-notification-button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition shadow-sm hover:border-indigo-400 hover:bg-slate-50 cursor-pointer"
        style={{
          borderColor: open ? '#4f46e5' : '#cbd5e1',
          background: open ? '#ede9fe' : '#ffffff',
          color: open ? '#4f46e5' : '#0f172a',
        }}
        title={`${unreadCount} unread notices and exams`}
      >
        <div className="relative flex items-center justify-center">
          <Bell size={15} className={unreadCount > 0 ? 'text-indigo-600' : 'text-slate-500'} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-rose-500 ring-1 ring-white animate-ping" />
          )}
        </div>
        <span className="font-semibold text-xs">Notifications</span>
        <span
          className={`flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full text-[11px] font-bold ${
            unreadCount > 0
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {unreadCount > 0 ? unreadCount : totalCount}
        </span>
      </button>

      {/* Pop-up Flyout Panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl shadow-slate-900/15 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ width: '22rem' }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">Notifications & Alerts</span>
              {unreadCount > 0 && (
                <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition px-1.5 py-0.5 rounded hover:bg-indigo-50"
                  title="Mark all as read"
                >
                  <Check size={12} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Clean Notification List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {allNotifications.length > 0 ? (
              allNotifications.map((item) => {
                const isRead = readIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition hover:bg-slate-50 ${
                      !isRead ? 'bg-indigo-50/30' : 'bg-white'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center mt-0.5 ${
                        item.type === 'announcement'
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {item.type === 'announcement' ? (
                        <Megaphone size={15} />
                      ) : (
                        <CalendarClock size={15} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50/60 px-1.5 py-0.2 rounded">
                          {item.tag}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.date}</span>
                      </div>

                      <h4
                        className={`text-xs mt-1 leading-snug line-clamp-1 ${
                          isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.detail}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!isRead && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 mt-2 shrink-0 ring-2 ring-indigo-100" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400">
                <Bell size={20} className="mx-auto mb-1.5 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No notifications yet</p>
                <p className="text-[11px] text-slate-400">You are all caught up with announcements and exams.</p>
              </div>
            )}
          </div>

          {/* Clean Footer Links */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/student/announcements');
              }}
              className="hover:text-indigo-600 transition flex items-center gap-1 font-semibold"
            >
              <span>View All Notices</span>
              <ChevronRight size={12} />
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/student/exam-schedule');
              }}
              className="hover:text-indigo-600 transition flex items-center gap-1 font-semibold"
            >
              <span>Exam Timetable</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
