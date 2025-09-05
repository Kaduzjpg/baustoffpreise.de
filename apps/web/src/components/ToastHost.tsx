"use client";
import { useEffect, useState } from 'react';

type Toast = {
  id: string;
  title: string;
  variant?: 'success' | 'error' | 'info';
};

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function onToast(e: any) {
      const t: Toast = {
        id: Math.random().toString(36).slice(2),
        title: e?.detail?.title || 'Hinweis',
        variant: e?.detail?.variant || 'info'
      };
      setToasts((prev) => [...prev, t]);
      setTimeout(() => dismiss(t.id), e?.detail?.timeout ?? 2500);
    }
    const dismiss = (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id));
    (window as any).dismissToast = dismiss;
    window.addEventListener('toast', onToast);
    return () => window.removeEventListener('toast', onToast);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] w-full max-w-sm -translate-x-1/2 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className={`pointer-events-auto rounded-lg border bg-white px-4 py-3 shadow-soft animate-[fadeIn_.15s_ease] ${
          t.variant === 'success' ? 'border-green-500/30' : t.variant === 'error' ? 'border-red-500/30' : 'border-slate-200'
        }`}>
          <div className="text-sm">
            {t.title}
          </div>
        </div>
      ))}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: .6; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}









