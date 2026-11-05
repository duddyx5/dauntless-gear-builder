import React from 'react';
import { X, Download, Share, PlusSquare, Smartphone, Laptop, CheckCircle2 } from 'lucide-react';
import { resolveAssetUrl } from '../utils/theme';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  canNativeInstall: boolean;
  onNativeInstall: () => void;
  isIOS: boolean;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isOpen,
  onClose,
  canNativeInstall,
  onNativeInstall,
  isIOS,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-layer animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      onClick={onClose}
    >
      <div
        className="modal-container max-w-md w-full mx-4 p-6 bg-[#0b171d] border border-dauntless-border rounded-xl shadow-2xl animate-scale-up text-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1d3039]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#14232c] border border-cyan-500/30 p-2 flex items-center justify-center shrink-0 shadow-inner">
              <img
                src={resolveAssetUrl('/pwa-192x192.png')}
                alt="Dauntless Gear Builder Icon"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <h2 id="install-modal-title" className="text-base font-bold text-white uppercase tracking-wide font-display">
                Install Gear Builder
              </h2>
              <p className="text-xs text-cyan-400">Progressive Web App (PWA)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-button text-gray-400 hover:text-white"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Benefits List */}
        <div className="my-5 p-3.5 rounded-lg bg-[#0e1d24] border border-[#1a2f3a] text-xs space-y-2">
          <div className="flex items-start gap-2.5 text-gray-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Offline Support:</strong> Access all gear stats, perk tables, and patch databases even without an internet connection.</span>
          </div>
          <div className="flex items-start gap-2.5 text-gray-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Full-Screen Experience:</strong> Runs like a native mobile or desktop app without browser toolbars.</span>
          </div>
          <div className="flex items-start gap-2.5 text-gray-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Quick Launch:</strong> Add an icon directly to your phone home screen, desktop dock, or Start menu.</span>
          </div>
        </div>

        {/* Native 1-Click Install Button if supported */}
        {canNativeInstall ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                onNativeInstall();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Install App Now</span>
            </button>
            <p className="text-[11px] text-gray-400 text-center">
              Works instantly on Chrome, Edge, Android, and other modern browsers.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Specific Instructions */
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-1.5 text-cyan-300">
              <Smartphone className="h-4 w-4 text-cyan-400" />
              <span>Instructions for iPhone / iPad</span>
            </div>
            <ol className="space-y-2.5 text-xs text-gray-300 bg-[#071015] p-3.5 rounded-lg border border-[#162731]">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share</strong> button{' '}
                  <Share className="h-3.5 w-3.5 inline mx-0.5 text-cyan-400 align-text-bottom" /> in Safari's bottom toolbar.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Scroll down the menu and tap <strong className="text-white">Add to Home Screen</strong>{' '}
                  <PlusSquare className="h-3.5 w-3.5 inline mx-0.5 text-cyan-400 align-text-bottom" />.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>
                  Tap <strong className="text-white">Add</strong> in the top-right corner to place the app on your home screen.
                </span>
              </li>
            </ol>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-lg bg-[#14232c] hover:bg-[#1b2f3b] border border-[#233a47] text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Got it
            </button>
          </div>
        ) : (
          /* Desktop / General Browser Instructions */
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-1.5 text-cyan-300">
              <Laptop className="h-4 w-4 text-cyan-400" />
              <span>How to Install</span>
            </div>
            <div className="text-xs text-gray-300 bg-[#071015] p-3.5 rounded-lg border border-[#162731] space-y-2">
              <p>
                In your browser's address bar or main menu:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Look for the <strong className="text-white">Install</strong> icon <Download className="h-3 w-3 inline text-cyan-400" /> on the right side of the address bar.</li>
                <li>Or open the browser menu (<strong className="text-white">⋮</strong> or <strong className="text-white">⋯</strong>) and select <strong className="text-white">"Install Dauntless Gear Builder"</strong>.</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-lg bg-[#14232c] hover:bg-[#1b2f3b] border border-[#233a47] text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
