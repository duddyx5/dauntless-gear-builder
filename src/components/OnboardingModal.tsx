import React from 'react';
import { PatchVersionInfo } from '../types/builder';
import { ThemeMode, resolveAssetUrl } from '../utils/theme';
import {
  Sparkles,
  Moon,
  Sun,
  Layers,
  Settings,
  Check,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  versions: PatchVersionInfo[];
  currentVersionId: string;
  onVersionChange: (versionId: string) => void;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  versions,
  currentVersionId,
  onVersionChange,
  onComplete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 animate-fade-in">
      <div className="bg-dauntless-card border border-dauntless-border rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden isolate transform-gpu animate-slide-up">
        {/* Hero Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-cyan-950/70 via-dauntless-card to-blue-950/50 border-b border-dauntless-border shrink-0 text-center relative overflow-hidden">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gray-900/90 border border-cyan-500/40 p-2 shadow-xl shadow-cyan-500/25 mb-3 overflow-hidden">
            <img
              src={resolveAssetUrl('/assets/logo.png')}
              alt="Dauntless Gear Builder"
              className="h-full w-full object-contain filter drop-shadow"
            />
          </div>

          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-wide uppercase">
            Welcome to Dauntless Gear Builder
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto mt-1.5 leading-relaxed">
            Your interactive workshop for planning optimal weapons, armor, cells, and perk synergies. Let&apos;s get you setup!
          </p>
        </div>

        {/* Scrollable Setup Options */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 modal-scroll overscroll-contain touch-pan-y">
          {/* STEP 1: CHOOSE THEME */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold font-mono">
                1
              </span>
              <h3 className="font-bold text-sm text-white uppercase tracking-wide">
                Choose Your Interface Theme
              </h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Pick your preferred color palette. You can preview it right now!
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Dark Theme Button */}
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  currentTheme === 'dark'
                    ? 'bg-cyan-950/40 border-cyan-500/90 shadow-md shadow-cyan-500/15 ring-2 ring-cyan-500/40'
                    : 'bg-gray-800/40 border-gray-700/60 hover:border-gray-600'
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
                  <span className="font-bold text-sm text-white block">Dark Mode</span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Classic Ramsgate forge vibe with glowing stats.
                  </span>
                </div>
              </button>

              {/* Light Theme Button */}
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  currentTheme === 'light'
                    ? 'bg-amber-500/10 border-amber-500/90 shadow-md shadow-amber-500/15 ring-2 ring-amber-500/40'
                    : 'bg-gray-800/40 border-gray-700/60 hover:border-gray-600'
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
                  <span className="font-bold text-sm text-white block">Light Mode</span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Clean, crisp daytime palette for well-lit rooms.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: CHOOSE DAUNTLESS VERSION */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold font-mono">
                2
              </span>
              <h3 className="font-bold text-sm text-white uppercase tracking-wide">
                What Dauntless Version are you playing?
              </h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Select your private server or target patch. All weapons, perks, and sockets will match this era:
            </p>

            <div className="space-y-2">
              {versions.map(v => {
                const isSelected = v.id === currentVersionId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onVersionChange(v.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                        : 'bg-gray-800/40 border-gray-700/60 hover:border-gray-600 hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                          {v.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            Selected
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-mono">v{v.id}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-2">
                      <span>{v.releaseDate}</span>
                      {v.era === 'Awakening' || v.id === '2.1.1' ? (
                        <span className="text-amber-400">• Awakening Era (Lantern Cores)</span>
                      ) : v.era === 'Reforged' ? (
                        <span className="text-cyan-400">• Reforged ({v.hasOmnicells ? 'Omnicells' : 'No Omnicells'})</span>
                      ) : (
                        <span className="text-emerald-400">• Classic Era (+15 Upgrades)</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* REASSURANCE NOTE */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3 text-xs text-cyan-200">
            <div className="h-7 w-7 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400 mt-0.5">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold block text-white mb-0.5">
                Change anytime in Settings
              </span>
              <span>
                You can switch between patch versions and toggle light/dark mode at any time by clicking the{' '}
                <strong className="text-cyan-300">Settings</strong> icon in the navigation bar.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-5 bg-gray-900/80 border-t border-dauntless-border flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-gray-400 hidden sm:inline">
            Press get started to begin building
          </span>
          <button
            type="button"
            onClick={onComplete}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 ml-auto"
          >
            <span>Start Building</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
