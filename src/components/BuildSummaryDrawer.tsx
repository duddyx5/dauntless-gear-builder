import React, { useState } from 'react';
import { BuildStats, CalculatedPerk } from '../types/builder';
import { getElementStyle } from '../utils/theme';
import { formatPerkEffect } from '../utils/calculator';
import { isDauntlessForeverSupported } from '../utils/dauntlessForever';
import {
  ChevronUp,
  ChevronDown,
  Shield,
  Zap,
  AlertTriangle,
  Flame,
  Info,
  CheckCircle2,
  X,
  Sparkles,
  Terminal,
} from 'lucide-react';

interface BuildSummaryDrawerProps {
  stats: BuildStats;
  weaponElement: string;
  currentVersionId?: string;
  onOpenLauncherModal?: () => void;
}

export const BuildSummaryDrawer: React.FC<BuildSummaryDrawerProps> = ({
  stats,
  weaponElement,
  currentVersionId,
  onOpenLauncherModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedPerkId, setExpandedPerkId] = useState<string | null>(null);

  const hasOvercapped = stats.perks.some(p => p.isOvercapped);
  const topPerks = stats.perks.slice(0, 5);

  return (
    <>
      {/* 1. COLLAPSED STICKY BOTTOM BAR (Mobile / Small Tablet) */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-dauntless-card/95 backdrop-blur-md border-t border-dauntless-border pb-safe shadow-2xl transition-all lg:hidden">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2.5">
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between gap-3 cursor-pointer select-none"
          >
            {/* Left: Quick Stats (Power, Res, Element) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-900 border border-gray-700">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-bold text-xs text-amber-300 font-display">
                  {stats.totalPower}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-900 border border-gray-700">
                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                <span className="font-bold text-xs text-cyan-300 font-display">
                  {stats.totalResistance}
                </span>
              </div>

              {weaponElement && (
                <span className={`hidden sm:inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getElementStyle(weaponElement).bg} ${getElementStyle(weaponElement).text} ${getElementStyle(weaponElement).border}`}>
                  {weaponElement}
                </span>
              )}
            </div>

            {/* Middle: Horizontal Scroll of Active Top Perks */}
            <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
              {stats.perks.length === 0 ? (
                <span className="text-xs text-gray-500 italic truncate">
                  Equip gear to view active perks...
                </span>
              ) : (
                stats.perks.slice(0, 4).map(p => {
                  const isMax = p.cappedValue === 6;
                  return (
                    <span
                      key={p.perkId}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 border ${
                        p.isOvercapped
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : isMax
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      +{p.totalValue} {p.name}
                    </span>
                  );
                })
              )}
              {stats.perks.length > 4 && (
                <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                  +{stats.perks.length - 4} more
                </span>
              )}
            </div>

            {/* Right: Toggle Button */}
            <button
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition-colors shrink-0"
            >
              <span className="hidden sm:inline">{isExpanded ? 'Hide' : 'Perks'}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-cyan-400" />
              ) : (
                <ChevronUp className="h-4 w-4 text-cyan-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXPANDED FULL SUMMARY DRAWER */}
      {isExpanded && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-fade-in lg:hidden">
          {/* Backdrop tap to close */}
          <div className="absolute inset-0" onClick={() => setIsExpanded(false)} />

          <div
            className="relative z-10 bg-dauntless-card border-t border-dauntless-border rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden max-w-4xl mx-auto w-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

            {/* Header */}
            <div className="p-4 border-b border-dauntless-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    Build Perks & Stats
                  </h3>
                  <span className="text-xs text-gray-400">
                    {stats.perks.length} active perks • Total Power {stats.totalPower} • Resistance {stats.totalResistance}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Overcap Alert */}
            {hasOvercapped && (
              <div className="px-4 py-2.5 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-xs text-red-200">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span>
                  One or more perks exceed the +6 tier maximum. Points beyond +6 are wasted; consider swapping cells.
                </span>
              </div>
            )}

            {/* Scrollable Perks List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 pb-16">
              {/* Elemental Defenses Overview */}
              {(stats.strengths.length > 0 || stats.weaknesses.length > 0) && (
                <div className="p-3 rounded-xl bg-gray-900/70 border border-gray-800 flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-gray-400 font-semibold">Elemental Defense:</span>
                  {stats.strengths.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                      +{s}
                    </span>
                  ))}
                  {stats.weaknesses.map(w => (
                    <span key={w} className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-medium border border-red-500/30">
                      -{w}
                    </span>
                  ))}
                </div>
              )}

              {/* Dauntless Forever Launcher Commands Button (Only for supported DF versions) */}
              {onOpenLauncherModal && currentVersionId && isDauntlessForeverSupported(currentVersionId) && (
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    onOpenLauncherModal();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Terminal className="h-4 w-4 text-amber-400" />
                  <span>Copy Dauntless Forever Launcher Commands</span>
                </button>
              )}

              {stats.perks.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No perks equipped. Tap any equipment or cell socket above to build your slayer!
                </div>
              ) : (
                stats.perks.map(perk => {
                  const isAccordionOpen = expandedPerkId === perk.perkId;
                  const isMax = perk.cappedValue === 6;

                  return (
                    <div
                      key={perk.perkId}
                      className={`p-3.5 rounded-xl border transition-all ${
                        perk.isOvercapped
                          ? 'bg-red-950/20 border-red-500/40'
                          : isMax
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : 'bg-gray-800/30 border-gray-800'
                      }`}
                    >
                      {/* Top Row: Name + Tier Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-bold ${isMax ? 'text-amber-300 font-display' : 'text-white font-display'}`}>
                            {perk.name}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">
                            {perk.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {perk.isOvercapped && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                              Wasted +{perk.totalValue - 6}
                            </span>
                          )}
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                              perk.isOvercapped
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : isMax
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            }`}
                          >
                            +{perk.totalValue}
                          </span>
                        </div>
                      </div>

                      {/* Tier Progress Blocks (1..6) */}
                      <div className="grid grid-cols-6 gap-1 my-2.5">
                        {[1, 2, 3, 4, 5, 6].map(tier => {
                          const isFilled = tier <= perk.cappedValue;
                          return (
                            <div
                              key={tier}
                              className={`h-2 rounded-full transition-colors ${
                                isFilled
                                  ? isMax
                                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                                    : 'bg-cyan-400'
                                  : 'bg-gray-800'
                              }`}
                            />
                          );
                        })}
                      </div>

                      {/* Current Tier Description */}
                      <p className="text-xs text-gray-200 leading-relaxed font-medium">
                        {perk.currentTierDescription}
                      </p>

                      {/* Sources: Which items grant this perk */}
                      <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400">
                        <span className="font-semibold text-gray-500">Sources:</span>
                        {perk.sources.map((src, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-gray-900 border border-gray-700/80 text-gray-300"
                          >
                            {src.sourceName} (+{src.value})
                          </span>
                        ))}
                      </div>

                      {/* Expandable All Tiers Accordion Toggle */}
                      {Object.keys(perk.tiers).length > 0 && (
                        <div className="mt-2 text-right">
                          <button
                            type="button"
                            onClick={() => setExpandedPerkId(isAccordionOpen ? null : perk.perkId)}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                          >
                            {isAccordionOpen ? 'Hide tier effects ▲' : 'View all 6 tiers ▼'}
                          </button>
                        </div>
                      )}

                      {/* Accordion Content */}
                      {isAccordionOpen && Object.keys(perk.tiers).length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-gray-800/80 space-y-1.5 bg-gray-900/60 p-2.5 rounded-lg text-xs">
                          {[1, 2, 3, 4, 5, 6].map(t => {
                            const desc = perk.tiers[String(t)];
                            if (!desc) return null;
                            const isCurrent = t === perk.cappedValue;
                            return (
                              <div
                                key={t}
                                className={`p-1.5 rounded flex items-start gap-2 ${
                                  isCurrent
                                    ? 'bg-cyan-500/20 text-cyan-200 font-semibold'
                                    : 'text-gray-400'
                                }`}
                              >
                                <span className="font-bold shrink-0">+{t}:</span>
                                <span>{formatPerkEffect(desc)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
