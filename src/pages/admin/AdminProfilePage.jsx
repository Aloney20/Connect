import { CheckCircle2, Lock, ShieldCheck, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@college.edu',
    phone: '+91 98765 43210',
    department: 'Central Administration',
    designation: 'Lead Academic Administrator',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('college-user') || 'null');
      if (saved) {
        setProfile((current) => ({
          ...current,
          name: saved.name || current.name,
          email: saved.email || current.email,
        }));
      }
    } catch (e) {}
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((current) => ({ ...current, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    try {
      const sessionUser = JSON.parse(localStorage.getItem('college-user') || '{}');
      const updatedUser = { ...sessionUser, name: profile.name, email: profile.email };
      localStorage.setItem('college-user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('college-user-changed'));
      setNotice('Admin profile updated successfully.');
    } catch (err) {
      setNotice('Profile updated.');
    }
  };

  const handleSavePassword = (e) => {
    e.preventDefault();

    if (!passwords.currentPassword) {
      setNotice('Please enter current password.');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setNotice('New password must contain at least 6 characters.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setNotice('New password and confirmation do not match.');
      return;
    }

    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setNotice('Password updated successfully.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Admin Profile & Security</h2>
        <p className="text-sm text-slate-400">Manage administrator account credentials and institution profile</p>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSaveProfile} className="card p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="rounded-xl bg-sky-500/15 p-2.5 text-sky-400">
              <UserCog size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base">Account Information</h3>
              <p className="text-xs text-slate-400">Personal & institutional contact details</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Full Name</label>
              <input
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Phone</label>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Department</label>
              <input
                name="department"
                value={profile.department}
                onChange={handleProfileChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition"
            >
              Save Changes
            </button>
          </div>
        </form>

        <form onSubmit={handleSavePassword} className="card p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-400">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base">Security & Password</h3>
              <p className="text-xs text-slate-400">Update portal access password</p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-sm font-bold text-amber-300 hover:bg-amber-500/20 transition"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
