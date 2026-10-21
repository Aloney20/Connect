export function Toaster({ toasts = [] }) {
  return (
    <div className="fixed right-5 top-5 z-50 flex w-[320px] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-xl border px-4 py-3 text-sm shadow-lg ${
            toast.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100'
              : toast.type === 'error'
                ? 'border-rose-500/40 bg-rose-500/15 text-rose-100'
                : 'border-sky-500/40 bg-sky-500/15 text-sky-100'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
