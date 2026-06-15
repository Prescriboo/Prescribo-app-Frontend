'use client';

import { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { X, Download, RotateCcw, Loader2, ExternalLink } from 'lucide-react';
import DOMPurify from 'dompurify';

interface Props {
  version: string;
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  onDownload?: () => void;
  isDownloaded: boolean;
  platform?: string;
}

const GITHUB_REPO = 'Prescriboo/Prescribo-app-Frontend';
const DOWNLOAD_URL = 'https://www.prescribo.co/download';

export default function UpdateChangelogModal({ version, isOpen, onClose, onInstall, onDownload, isDownloaded, platform }: Props) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNotes = useCallback(async () => {
    if (!version || !isOpen) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/tags/v${version}`);
      if (!res.ok) throw new Error('Failed to fetch release notes');
      const data = await res.json();
      const rawHtml = data.body ? await marked(data.body) : '<p>No release notes available.</p>';
      const html = typeof window !== 'undefined' ? DOMPurify.sanitize(rawHtml) : rawHtml;
      setNotes(html);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [version, isOpen]);

  useEffect(() => {
    if (isOpen) fetchNotes();
  }, [isOpen, fetchNotes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {isDownloaded ? 'Update Ready' : 'Update Available'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Prescribo {version}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-brand-600" />
              <span className="ml-2 text-sm text-gray-500">Loading release notes...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={fetchNotes}
                className="mt-2 text-sm text-brand-600 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <div
              className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-ul:list-disc prose-ol:list-decimal"
              dangerouslySetInnerHTML={{ __html: notes }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <a
            href={DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            Go to Download Page <ExternalLink size={14} />
          </a>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Later
            </button>
            {isDownloaded ? (
              platform === 'darwin' ? (
                <button
                  onClick={onInstall}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition flex items-center gap-2"
                >
                  <ExternalLink size={14} /> Open Download Page
                </button>
              ) : (
                <button
                  onClick={onInstall}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition flex items-center gap-2"
                >
                  <RotateCcw size={14} /> Restart Now
                </button>
              )
            ) : (
              platform === 'darwin' ? (
                <button
                  onClick={onDownload}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition flex items-center gap-2"
                >
                  <ExternalLink size={14} /> Download from Website
                </button>
              ) : (
                <button
                  onClick={onDownload}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition flex items-center gap-2"
                >
                  <Download size={14} /> Download & Install
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
