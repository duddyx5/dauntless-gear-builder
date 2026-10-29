import React, { useState } from 'react';
import { PatchVersionInfo } from '../types/builder';
import {
  Share2,
  Bookmark,
  RotateCcw,
  Zap,
  Info,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  versions: PatchVersionInfo[];
  currentVersionId: string;
  onVersionChange: (versionId: string) => void;
  powerSurged: boolean;
  onTogglePowerSurge: () => void;
  onShare: () => void;
  onOpenPresets: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  versions,
  currentVersionId,
  onVersionChange,
  powerSurged,
  onTogglePowerSurge,
  onShare,
  onOpenPresets,
  onReset,
}) => {
  const [showVersionModal, setShowVersionModal] = useState(false);
  const currentVersion = versions.find(v => v.id === currentVersionId) || versions[0];

  return (
    <>
      <header className="sticky top-0 z-40 bg-dauntless-bg/95 backdrop-blur border-b border-dauntless-border px-3 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Brand + Version Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-base sm:text-lg tracking-wider text-white uppercase truncate">
                  Dauntless Gear Builder
                </span>
              </div>

              {/* Version Selector Button */}
              <button
                type="button"
                onClick={() => setShowVersionModal(true)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-300 transition-colors group text-left"
              >
                <Layers className="h-3 w-3 text-cyan-400 shrink-0" />
                <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
                  {currentVersion?.name || currentVersionId}
                </span>
                <ChevronDown className="h-3 w-3 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Power Surge Toggle */}
            <button
              type="button"
              onClick={onTogglePowerSurge}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                powerSurged
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                  : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:border-gray-600'
              }`}
              title="Toggle Power Surged (+3 perks & max gear level)"
            >
              <Zap className={`h-3.5 w-3.5 ${powerSurged ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
              <span className="hidden md:inline">Surged</span>
            </button>

            {/* Presets */}
            <button
              type="button"
              onClick={onOpenPresets}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 border border-gray-700 transition-colors"
              title="Load Preset or Saved Build"
            >
              <Bookmark className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Builds</span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={onShare}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all active:scale-95"
              title="Share Build URL"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/30"
              title="Clear Build"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Version Selection Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-dauntless-card border border-dauntless-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-dauntless-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Select Game Patch</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVersionModal(false)}
                className="text-gray-400 hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <p className="text-xs text-gray-400 leading-relaxed">
                Gear, perks, and cell sockets change significantly across Dauntless updates. Choose a patch to load accurate stats from that era:
              </p>

              <div className="space-y-2">
                {versions.map(v => {
                  const isSelected = v.id === currentVersionId;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        onVersionChange(v.id);
                        setShowVersionModal(false);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                          : 'bg-gray-800/40 border-gray-700/60 hover:border-gray-600 hover:bg-gray-800/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold text-sm ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                          {v.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-2 mb-1.5">
                        <span>Released: {v.releaseDate}</span>
                        {v.hasOmnicells && <span>• Has Omnicells</span>}
                      </div>
                      <p className="text-xs text-gray-300/80 leading-relaxed">
                        {v.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-200/90">
                <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Switching between Reforged and Awakening patches will re-index your build. Any items that did not exist in the selected patch will be flagged.
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-900/60 border-t border-dauntless-border text-right">
              <button
                type="button"
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
