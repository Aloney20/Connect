export default function StatCard({ title, value, icon, accent = 'blue' }) {
  const accentMap = {
    blue: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    amber: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
    purple: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{value}</h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${accentMap[accent]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
