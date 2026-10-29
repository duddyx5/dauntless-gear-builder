import React, { useState } from 'react';
import { BuildStats, CalculatedPerk } from '../types/builder';
import { getElementStyle } from '../utils/theme';
import { formatPerkEffect } from '../utils/calculator';
import { isDauntlessForeverSupported } from '../utils/dauntlessForever';
import {
  Shield,
  Zap,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Terminal,
} from 'lucide-react';

interface DesktopStatsSidebarProps {
  stats: BuildStats;
  weaponElement: string;
  currentVersionId?: string;
  onOpenLauncherModal?: () => void;
}

export const DesktopStatsSidebar: React.FC<DesktopStatsSidebarProps> = ({
  stats,
  weaponElement,
  currentVersionId,
  onOpenLauncherModal,
}) => {
  const [expandedPerkId, setExpandedPerkId] = useState<string | null>(null);
  const hasOvercapped = stats.perks.some(p => p.isOvercapped);
  const elemStyle = getElementStyle(weaponElement);

  return (
    <aside className="space-y-4 sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto pr-1">
      {/* 1. POWER & RESISTANCE OVERVIEW CARD */}
      <div className="bg-dauntless-card border border-dauntless-border rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-dauntless-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h3 className="font-display font-bold text-base text-white tracking-wide uppercase">
              Build Overview
            </h3>
          </div>
          {weaponElement && (
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${elemStyle.bg} ${elemStyle.text} ${elemStyle.border}`}
            >
              {weaponElement}
            </span>
          )}
        </div>

        {/* Big Power / Resistance Badges */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Power</span>
              <span className="font-display font-bold text-xl text-amber-300">
                {stats.totalPower}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Resistance</span>
              <span className="font-display font-bold text-xl text-cyan-300">
                {stats.totalResistance}
              </span>
            </div>
          </div>
        </div>

        {/* Elemental Defenses */}
        {(stats.strengths.length > 0 || stats.weaknesses.length > 0) && (
          <div className="mt-3 pt-3 border-t border-gray-800/80 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-gray-500 font-semibold text-[11px] uppercase mr-1">Elements:</span>
            {stats.strengths.map(s => (
              <span
                key={s}
                className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30"
              >
                +{s}
              </span>
            ))}
            {stats.weaknesses.map(w => (
              <span
                key={w}
                className="px-2 py-0.5 rounded bg-red-500/15 text-red-300 font-semibold text-[11px] border border-red-500/30"
              >
                -{w}
              </span>
            ))}
          </div>
        )}

        {/* Quick Launch / Inject Button (Only for supported DF versions) */}
        {onOpenLauncherModal && currentVersionId && isDauntlessForeverSupported(currentVersionId) && (
          <button
            type="button"
            onClick={onOpenLauncherModal}
            className="w-full mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/15 hover:from-amber-500/25 hover:to-yellow-500/25 border border-amber-500/35 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Terminal className="h-4 w-4 text-amber-400" />
            <span>Copy Dauntless Forever Commands</span>
          </button>
        )}
      </div>

      {/* 2. ACTIVE PERKS CARD */}
      <div className="bg-dauntless-card border border-dauntless-border rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-dauntless-border">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-base text-white tracking-wide uppercase">
              Active Perks
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              {stats.perks.length}
            </span>
          </div>

          {hasOvercapped && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-400" />
              Overcapped
            </span>
          )}
        </div>

        {/* Overcap Notice */}
        {hasOvercapped && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-950/30 border border-red-500/30 text-[11px] text-red-200 leading-snug flex items-start gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
            <span>Points above +6 are wasted. Switch cells to optimize your tier distribution.</span>
          </div>
        )}

        {/* Perks List */}
        <div className="mt-3 space-y-2.5">
          {stats.perks.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-xs italic">
              No equipment or cells active. Select gear on the left to activate perks.
            </div>
          ) : (
            stats.perks.map(perk => {
              const isAccordionOpen = expandedPerkId === perk.perkId;
              const isMax = perk.cappedValue === 6;

              return (
                <div
                  key={perk.perkId}
                  className={`p-3 rounded-xl border transition-all ${
                    perk.isOvercapped
                      ? 'bg-red-950/20 border-red-500/40'
                      : isMax
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-gray-800/30 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {/* Top: Name & Tier Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className={`text-sm font-bold truncate block ${isMax ? 'text-amber-300 font-display' : 'text-white font-display'}`}>
                        {perk.name}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">
                        {perk.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {perk.isOvercapped && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          +{perk.totalValue - 6} wasted
                        </span>
                      )}
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
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

                  {/* 1..6 Tier Progress Blocks */}
                  <div className="grid grid-cols-6 gap-1 my-2">
                    {[1, 2, 3, 4, 5, 6].map(tier => {
                      const isFilled = tier <= perk.cappedValue;
                      return (
                        <div
                          key={tier}
                          className={`h-1.5 rounded-full transition-colors ${
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
                  <p className="text-xs text-gray-200 leading-snug font-medium">
                    {perk.currentTierDescription}
                  </p>

                  {/* Sources Pill Row */}
                  <div className="mt-2 pt-2 border-t border-gray-800/80 flex flex-wrap items-center gap-1 text-[10px] text-gray-400">
                    <span className="font-semibold text-gray-500">Sources:</span>
                    {perk.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-300 truncate max-w-[150px]"
                        title={src.sourceName}
                      >
                        {src.sourceName} (+{src.value})
                      </span>
                    ))}
                  </div>

                  {/* Expand/Collapse All Tiers Button */}
                  {Object.keys(perk.tiers).length > 0 && (
                    <div className="mt-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => setExpandedPerkId(isAccordionOpen ? null : perk.perkId)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-0.5"
                      >
                        <span>{isAccordionOpen ? 'Hide tiers' : 'View all 6 tiers'}</span>
                        {isAccordionOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>
                  )}

                  {/* Expanded All 6 Tiers Accordion */}
                  {isAccordionOpen && Object.keys(perk.tiers).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-800/80 space-y-1 bg-gray-900/60 p-2 rounded-lg text-xs">
                      {[1, 2, 3, 4, 5, 6].map(t => {
                        const desc = perk.tiers[String(t)];
                        if (!desc) return null;
                        const isCurrent = t === perk.cappedValue;
                        return (
                          <div
                            key={t}
                            className={`p-1 rounded flex items-start gap-1.5 text-[11px] ${
                              isCurrent
                                ? 'bg-cyan-500/20 text-cyan-200 font-semibold'
                                : 'text-gray-400'
                            }`}
                          >
                            <span className="font-bold shrink-0">+{t}:</span>
                            <span className="leading-tight">{formatPerkEffect(desc)}</span>
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
    </aside>
  );
};
