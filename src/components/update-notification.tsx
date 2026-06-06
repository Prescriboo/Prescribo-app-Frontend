'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, RotateCcw, X, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react';
import UpdateChangelogModal from './update-changelog-modal';

interface UpdateInfo {
  version: string;
  releaseDate?: string;
}

interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

type UpdateState =
  | { type: 'idle' }
  | { type: 'checking' }
  | { type: 'available'; info: UpdateInfo }
  | { type: 'downloading'; progress: UpdateProgress }
  | { type: 'downloaded'; info: UpdateInfo }
  | { type: 'error'; message: string }
  | { type: 'not-available'; currentVersion: string };

export default function UpdateNotification() {
  const [state, setState] = useState<UpdateState>({ type: 'idle' });
  const [isElectron, setIsElectron] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [changelogVersion, setChangelogVersion] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.electron) return;
    setIsElectron(true);

    const unsubChecking = window.electron.updater.onChecking(() => {
      setState({ type: 'checking' });
    });

    const unsubAvailable = window.electron.updater.onAvailable((info) => {
      setState({ type: 'available', info });
      setChangelogVersion(info.version);
      setDismissed(false);
    });

    const unsubNotAvailable = window.electron.updater.onNotAvailable((data) => {
      setState({ type: 'not-available', currentVersion: data.version });
    });

    const unsubProgress = window.electron.updater.onProgress((progress) => {
      setState({ type: 'downloading', progress });
    });

    const unsubDownloaded = window.electron.updater.onDownloaded((info) => {
      setState({ type: 'downloaded', info });
      setChangelogVersion(info.version);
      setDismissed(false);
    });

    const unsubError = window.electron.updater.onError((err) => {
      setState({ type: 'error', message: err.message });
    });

    return () => {
      unsubChecking();
      unsubAvailable();
      unsubNotAvailable();
      unsubProgress();
      unsubDownloaded();
      unsubError();
    };
  }, []);

  const handleCheck = useCallback(async () => {
    if (!window.electron) return;
    setState({ type: 'checking' });
    try {
      const result = await window.electron.updater.check();
      if (!result.success) {
        setState({ type: 'error', message: result.error || 'Check failed' });
      }
      // The event listeners above will handle success cases
    } catch (err: any) {
      setState({ type: 'error', message: err.message });
    }
  }, []);

  const handleInstall = useCallback(() => {
    if (!window.electron) return;
    window.electron.updater.install();
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  if (!isElectron) return null;

  // Don't show anything for idle, not-available, or dismissed states
  if (state.type === 'idle' || state.type === 'not-available') return null;
  if (dismissed && (state.type === 'available' || state.type === 'error')) return null;

  const bannerClasses =
    'fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-lg w-[calc(100%-2rem)] rounded-xl shadow-lg border px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2';

  if (state.type === 'checking') {
    return (
      <div className={`${bannerClasses} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800`}>
        <Loader2 size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0 animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Checking for updates...</p>
        </div>
      </div>
    );
  }

  if (state.type === 'available') {
    return (
      <>
        <div
          className={`${bannerClasses} bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 cursor-pointer`}
          onClick={() => setShowChangelog(true)}
        >
          <Download size={18} className="text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-brand-800 dark:text-brand-300">
              Update available - Prescribo {state.info.version}
            </p>
            <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">
              Downloading in the background... Click to see what's new.
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
            className="text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        <UpdateChangelogModal
          version={changelogVersion}
          isOpen={showChangelog}
          onClose={() => setShowChangelog(false)}
          onInstall={handleInstall}
          isDownloaded={false}
        />
      </>
    );
  }

  if (state.type === 'downloading') {
    const { percent, bytesPerSecond } = state.progress;
    const speed = bytesPerSecond > 1024 * 1024
      ? `${(bytesPerSecond / 1024 / 1024).toFixed(1)} MB/s`
      : `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;

    return (
      <div className={`${bannerClasses} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800`}>
        <Loader2 size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0 animate-spin" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Downloading update... {percent}%
            </p>
            <span className="text-xs text-blue-600 dark:text-blue-400">{speed}</span>
          </div>
          <div className="w-full h-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (state.type === 'downloaded') {
    return (
      <>
        <div
          className={`${bannerClasses} bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 cursor-pointer`}
          onClick={() => setShowChangelog(true)}
        >
          <CheckCircle2 size={18} className="text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
              Prescribo {state.info.version} is ready to install
            </p>
            <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
              Restart the app to apply the update. Click to see what's new.
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleInstall(); }}
            className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 transition flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw size={12} /> Restart
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
            className="text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        <UpdateChangelogModal
          version={changelogVersion}
          isOpen={showChangelog}
          onClose={() => setShowChangelog(false)}
          onInstall={handleInstall}
          isDownloaded={true}
        />
      </>
    );
  }

  if (state.type === 'error') {
    return (
      <div className={`${bannerClasses} bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800`}>
        <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            Update check failed
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
            {state.message}
          </p>
        </div>
        <button
          onClick={handleCheck}
          className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition shrink-0"
        >
          Retry
        </button>
        <button onClick={handleDismiss} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 shrink-0">
          <X size={16} />
        </button>
      </div>
    );
  }

  return null;
}
