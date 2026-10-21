import { Bell, BookOpen, BriefcaseBusiness, CalendarClock, ChevronRight, ClipboardCheck, FileText, GraduationCap, LayoutDashboard, LogOut, Menu, MoonStar, SunMedium, Trophy, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import StudentNotificationBell from '../components/student/StudentNotificationBell';
import StudentNotificationBanner from '../components/student/StudentNotificationBanner';

const navItems = [
  { label: 'My Profile', to: '/student/profile', icon: UserRound },
  { label: 'Attendance', to: '/student/attendance', icon: ClipboardCheck },
  { label: 'Weekly Tests', to: '/student/weekly-tests', icon: BriefcaseBusiness },
  { label: 'Assignments', to: '/student/assignments', icon: FileText },
  { label: 'Exam Schedule', to: '/student/exam-schedule', icon: CalendarClock },
  { label: 'Announcements', to: '/student/announcements', icon: Bell },
];

export default function StudentLayout({ user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('college-user');
    localStorage.removeItem('saas-user');
    window.dispatchEvent(new Event('college-user-changed'));
    navigate('/login', { replace: true });
  };

  const currentNav = navItems.find((item) => (item.to === '/student' ? location.pathname === '/student' : location.pathname.startsWith(item.to)));

  return (
    <div className="flex min-h-screen" style={{background:'#f0f4f8',color:'#0f172a'}}>
      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 backdrop-blur-sm" style={{background:'rgba(15,23,42,0.3)'}} onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative z-50 flex w-72 flex-col p-5 shadow-2xl transition-all" style={{borderRight:'1px solid #e2e8f0',background:'#ffffff',color:'#0f172a'}}>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl font-bold" style={{background:'linear-gradient(135deg,#4338ca,#6366f1)',color:'#fff',boxShadow:'0 4px 12px rgba(67,56,202,0.25)'}}>
                  S
                </div>
                <div>
                  <div className="font-bold">College Portal</div>
                  <div className="text-xs font-semibold" style={{color:'#4f46e5'}}>Student Workspace</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl border p-1.5 transition" style={{borderColor:'#e2e8f0',color:'#64748b'}}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
              {navItems.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/student'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive ? 'font-semibold' : ''
                    }`
                  }
                  style={({ isActive }) => isActive
                    ? {background:'#ede9fe',color:'#4f46e5',border:'1px solid rgba(79,70,229,0.2)'}
                    : {color:'#64748b'}
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto pt-4" style={{borderTop:'1px solid #e2e8f0'}}>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition"
                style={{color:'#e11d48'}}
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col p-5 lg:flex" style={{borderRight:'1px solid #e2e8f0',background:'#ffffff',boxShadow:'2px 0 8px rgba(0,0,0,0.04)'}}>
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl font-extrabold text-lg" style={{background:'linear-gradient(135deg,#4338ca,#6366f1)',color:'#fff',boxShadow:'0 4px 16px rgba(67,56,202,0.3)'}}>
            S
          </div>
          <div>
            <div className="font-bold text-base leading-tight">College Portal</div>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{color:'#4f46e5'}}>Student Portal</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/student'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  isActive ? 'font-semibold' : ''
                }`
              }
              style={({ isActive }) => isActive
                ? {background:'#ede9fe',color:'#4f46e5',border:'1px solid rgba(79,70,229,0.2)'}
                : {color:'#64748b'}
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-3 rounded-2xl" style={{borderTop:'1px solid #e2e8f0',background:'#f8fafc'}}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm" style={{background:'#ede9fe',color:'#4f46e5'}}>
              ST
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold" style={{color:'#0f172a'}}>{user?.name || 'Aarav Kumar'}</p>
              <p className="truncate text-[10px]" style={{color:'#64748b'}}>{user?.email || 'student@college.edu'}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="rounded-lg p-1.5 transition"
              style={{color:'#94a3b8'}}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 px-5 py-3.5 backdrop-blur-md" style={{borderBottom:'1px solid #e2e8f0',background:'rgba(255,255,255,0.96)',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border p-2 lg:hidden transition"
                style={{borderColor:'#e2e8f0',color:'#64748b'}}
              >
                <Menu size={20} />
              </button>

              <div>
                <div className="flex items-center gap-2 text-xs" style={{color:'#64748b'}}>
                  <span>Student</span>
                  <ChevronRight size={12} />
                  <span className="font-medium" style={{color:'#4f46e5'}}>{currentNav?.label || 'Dashboard'}</span>
                </div>
                <h1 className="text-lg font-bold sm:text-xl" style={{color:'#0f172a'}}>{currentNav?.label || 'Student Portal'}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StudentNotificationBell />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition"
                style={{borderColor:'#e2e8f0',background:'#f8fafc',color:'#64748b'}}
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Top Notification Bar Banner */}
        <StudentNotificationBanner />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
