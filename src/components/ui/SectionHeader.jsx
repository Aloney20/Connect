export default function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Overview</p>
        <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
