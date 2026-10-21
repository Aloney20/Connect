import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, Check, RefreshCw, X, ChevronDown, ChevronUp, ExternalLink, Database } from 'lucide-react';
import { academicStore } from '../../services/academicStore';

export default function FirebaseStatusBar() {
  const [status, setStatus] = useState(() => academicStore.getFirebaseStatus());
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsub = academicStore.subscribeStatus((newStatus) => {
      setStatus(newStatus);
      if (newStatus.status === 'permission-denied') {
        setDismissed(false);
      }
    });
    return unsub;
  }, []);

  const handleRecheck = async () => {
    setChecking(true);
    await academicStore.checkFirebaseConnection();
    setChecking(false);
  };

  const copyRule = () => {
    const ruleText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;
    navigator.clipboard?.writeText(ruleText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (dismissed || status.status === 'connected') return null;

  if (status.status === 'permission-denied') {
    return (
      <div className="bg-gradient-to-r from-amber-950/90 via-rose-950/90 to-amber-950/90 border-b border-amber-500/30 text-amber-100 backdrop-blur-md z-50 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle size={18} className="animate-pulse" />
            </div>
            <div>
              <span className="font-semibold text-amber-300">Firebase Firestore Permission Denied (403):</span>{' '}
              <span className="text-amber-200/90 text-xs sm:text-sm">
                Firebase is blocking read/write requests because Security Rules are locked.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition"
            >
              <span>{expanded ? 'Hide Guide' : 'How to Fix (1 min)'}</span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <button
              onClick={handleRecheck}
              disabled={checking}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
              <span>{checking ? 'Checking...' : 'Re-check Connection'}</span>
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="text-amber-400/60 hover:text-amber-300 p-1 rounded-lg hover:bg-amber-500/10 transition"
              title="Dismiss warning"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Expandable Step-by-Step Instructions */}
        {expanded && (
          <div className="border-t border-amber-500/20 bg-slate-950/90 px-4 py-4 text-xs text-slate-300">
            <div className="max-w-4xl mx-auto space-y-3">
              <h4 className="text-amber-400 font-semibold text-sm flex items-center gap-2">
                <Database size={16} /> Steps to enable Firestore data in your Firebase Console:
              </h4>

              <ol className="space-y-2 list-decimal list-inside text-slate-300">
                <li>
                  Open your Firebase project rules page:{' '}
                  <a
                    href="https://console.firebase.google.com/project/test-mark-system/firestore/rules"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline inline-flex items-center gap-1 font-mono"
                  >
                    console.firebase.google.com → Firestore Database → Rules
                    <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  In the editor, replace existing rules with the following rule allowing read and write:
                </li>
              </ol>

              <div className="relative bg-slate-900 border border-slate-700/60 rounded-lg p-3 font-mono text-xs text-emerald-400">
                <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}</pre>
                <button
                  onClick={copyRule}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded flex items-center gap-1.5 text-xs transition"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Rule'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 text-slate-400">
                <span>Once you click <strong>Publish</strong> in Firebase Console, click:</span>
                <button
                  onClick={handleRecheck}
                  disabled={checking}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg flex items-center gap-1.5 text-xs transition"
                >
                  <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
                  <span>Re-check & Load Live Data</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
