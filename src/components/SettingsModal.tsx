import React from 'react';
import { PatchVersionInfo } from '../types/builder';
import { ThemeMode } from '../utils/theme';
import { isDauntlessForeverSupported } from '../utils/dauntlessForever';
import {
  Settings,
  X,
  Moon,
  Sun,
  Layers,
  Zap,
  Terminal,
  Sparkles,
  Check,
  Info,
  HelpCircle,
  ExternalLink,
  Youtube,
  Github,
  Coffee,
} from 'lucide-react';

const XIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={`fill-current ${className}`} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  versions: PatchVersionInfo[];
  currentVersionId: string;
  onVersionChange: (versionId: string) => void;
  powerSurged: boolean;
  onTogglePowerSurge: () => void;
  onOpenLauncherModal?: () => void;
  onReplayOnboarding?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  versions,
  currentVersionId,
  onVersionChange,
  powerSurged,
  onTogglePowerSurge,
  onOpenLauncherModal,
  onReplayOnboarding,
}) => {
  if (!isOpen) return null;
  const isAwakening = currentVersionId === '2.1.1' || versions.find(v => v.id === currentVersionId)?.era === 'Awakening';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 animate-fade-in">
      <div className="bg-dauntless-card border border-dauntless-border rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden isolate transform-gpu animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-dauntless-border flex items-center justify-between shrink-0 bg-dauntless-card">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">Settings</h2>
              <p className="text-xs text-gray-400">Customise interface theme, game patch era, and preferences</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 modal-scroll overscroll-contain touch-pan-y">
          {/* SECTION 1: INTERFACE THEME */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Interface Appearance
              </label>
              <span className="text-[11px] text-gray-400">Live preview</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Dark Mode Option */}
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  currentTheme === 'dark'
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                    : 'bg-gray-800/40 border-gray-700/60 hover:border-gray-600 hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center text-cyan-300">
                    <Moon className="h-4 w-4" />
                  </div>
                  {currentTheme === 'dark' && (
                    <span className="h-5 w-5 rounded-full bg-cyan-500 text-black flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-sm text-white block">Dark Mode</span>
                  <span className="text-xs text-gray-400 leading-snug block mt-0.5">
                    Deep Slayer forge aesthetic with high contrast glowing perks.
                  </span>
                </div>
              </button>

              {/* Light Mode Option */}
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  currentTheme === 'light'
                    ? 'bg-amber-500/10 border-amber-500/80 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/50'
                    : 'bg-gray-800/40 border-gray-700/60 hover:border-gray-600 hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sun className="h-4 w-4" />
                  </div>
                  {currentTheme === 'light' && (
                    <span className="h-5 w-5 rounded-full bg-amber-500 text-black flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-sm text-white block">Light Mode</span>
                  <span className="text-xs text-gray-400 leading-snug block mt-0.5">
                    Clean daylight layout designed for bright environments.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 2: DAUNTLESS GAME PATCH VERSION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Dauntless Game Patch
              </label>
              <span className="text-[11px] text-gray-400">Target server version</span>
            </div>

            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Gear stats, omnicells, and cell sockets change significantly across eras. Choose which patch to build for:
            </p>

            <div className="space-y-2.5">
              {versions.map(v => {
                const isSelected = v.id === currentVersionId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onVersionChange(v.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/70 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                        : 'bg-gray-800/40 border-gray-700/60 hover:border-gray-600 hover:bg-gray-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                          {v.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">Patch {v.id}</span>
                    </div>

                    <div className="text-[11px] text-gray-400 flex items-center gap-2 mb-1.5">
                      <span>Released: {v.releaseDate}</span>
                      {v.hasOmnicells ? (
                        <span className="text-cyan-400 font-medium">• Omnicells Enabled</span>
                      ) : (
                        <span className="text-gray-500">• Classic Era (No Omnicells)</span>
                      )}
                    </div>

                    <p className="text-xs text-gray-300/80 leading-relaxed">
                      {v.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200/90">
              <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Switching patches preserves your equipped gear when possible, and re-indexes perks based on the chosen era&apos;s data.
              </span>
            </div>
          </div>

          {/* SECTION 3: QUICK PREFERENCES & LAUNCHER */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-2.5">
              <Zap className="h-3.5 w-3.5" />
              Build Preferences & Tools
            </label>

            <div className="space-y-2">
              {/* Power Surge Toggle in Settings (Reforged / Classic only) */}
              {!isAwakening ? (
                <div className="p-3.5 rounded-xl bg-gray-800/40 border border-gray-700/60 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-white block">Power Surge (Tier 6 Max)</span>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      Surges gear to max level with +3 innate perks and max base power.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onTogglePowerSurge}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      powerSurged
                        ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {powerSurged ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-white block">Awakening Gear Levels Active</span>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      Power Surging is not used in Awakening. Adjust gear levels (1-20) directly on each item card.
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                    LEVELS 1-20
                  </span>
                </div>
              )}

              {/* Launcher Commands Shortcut (Only for supported DF versions) */}
              {isDauntlessForeverSupported(currentVersionId) && onOpenLauncherModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLauncherModal();
                  }}
                  className="w-full p-3.5 rounded-xl bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700/60 hover:border-gray-600 text-left flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Terminal className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-white block group-hover:text-amber-300 transition-colors">
                        Dauntless Forever Launcher Commands
                      </span>
                      <span className="text-xs text-gray-400 block mt-0.5">
                        Generate and copy launcher commands to give your character items.
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-amber-400 transition-colors" />
                </button>
              )}

              {/* Replay Onboarding */}
              {onReplayOnboarding && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReplayOnboarding();
                  }}
                  className="w-full p-3 rounded-xl bg-gray-800/20 hover:bg-gray-800/50 border border-gray-700/40 text-left flex items-center justify-between text-xs text-gray-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-cyan-400" />
                    Replay First-Time Welcome & Onboarding Tour
                  </span>
                  <span className="text-cyan-400 font-medium">Reopen</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION 4: COMMUNITY & CREATOR LINKS */}
          <div className="pt-2 border-t border-dauntless-border/60">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-2">
              Creator & Community Links
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="https://buymeacoffee.com/duddyx5"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-left flex items-center justify-between text-xs text-amber-200 transition-colors group"
                title="Support on Buy Me a Coffee"
              >
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-amber-400" />
                  <span className="font-semibold">Support Me (Buy Me a Coffee)</span>
                </div>
                <ExternalLink className="h-3 w-3 text-amber-400/70 group-hover:text-amber-300" />
              </a>

              <a
                href="https://www.youtube.com/@duddyx5"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-gray-800/40 hover:bg-gray-800/80 border border-gray-700/60 hover:border-red-500/40 text-left flex items-center justify-between text-xs text-gray-200 transition-colors group"
                title="YouTube @duddyx5"
              >
                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-400" />
                  <span className="font-semibold">YouTube (@duddyx5)</span>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-red-400" />
              </a>

              <a
                href="https://x.com/duddyx5"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-gray-800/40 hover:bg-gray-800/80 border border-gray-700/60 hover:border-gray-500 text-left flex items-center justify-between text-xs text-gray-200 transition-colors group"
                title="X @duddyx5"
              >
                <div className="flex items-center gap-2">
                  <XIcon className="h-3.5 w-3.5 text-white" />
                  <span className="font-semibold">X (@duddyx5)</span>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-white" />
              </a>

              <a
                href="https://github.com/duddyx5/dauntless-gear-builder"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-gray-800/40 hover:bg-gray-800/80 border border-gray-700/60 hover:border-cyan-500/40 text-left flex items-center justify-between text-xs text-gray-200 transition-colors group"
                title="GitHub Repository"
              >
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-cyan-400" />
                  <span className="font-semibold">GitHub Repository</span>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-cyan-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-gray-900/60 border-t border-dauntless-border flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-500">
            Dauntless Gear Builder • AGPL-3.0
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
