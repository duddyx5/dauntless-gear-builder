import React, { useState } from 'react';
import { BuildStats, CalculatedPerk } from '../types/builder';
import { getElementStyle, getCellCategoryIcon, resolveAssetUrl } from '../utils/theme';
import { formatPerkEffect } from '../utils/calculator';
import { isDauntlessForeverSupported } from '../utils/dauntlessForever';
import {
  Shield,
  Zap,
  AlertTriangle,
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
  const isAwakening = currentVersionId === '2.1.1';
  const hasOvercapped = !isAwakening && stats.perks.some(p => p.isOvercapped);
  const activePerksCount = isAwakening
    ? stats.perks.filter(p => p.isActive).length
    : stats.perks.length;

  return (
    <aside className="space-y-4">
      <div className="summary-content">
        {/* Header */}
        <header className="summary-heading">
          <div>
            <p className="kicker">Live build</p>
            <h2>Build overview</h2>
          </div>
          <span className={isAwakening ? 'status-live' : stats.totalPower > 500 ? 'status-live' : 'status-base'}>
            {isAwakening ? 'Awakening 2.1.1' : stats.totalPower > 500 ? 'Power surged' : 'Base stats'}
          </span>
        </header>

        {/* 2-Column Power & Resistance Metrics */}
        <div className="stat-grid">
          <div>
            <span className="stat-icon power">
              <Zap className="h-5 w-5" />
            </span>
            <p>
              <small>Total power</small>
              <strong>{stats.totalPower}</strong>
            </p>
          </div>
          <div>
            <span className="stat-icon defence">
              <Shield className="h-5 w-5" />
            </span>
            <p>
              <small>Resistance</small>
              <strong>{stats.totalResistance}</strong>
            </p>
          </div>
        </div>

        {/* Element Match Row */}
        <div className="element-row">
          <span>Element match</span>
          {weaponElement && (
            <em className={`element ${weaponElement.toLowerCase()}`}>
              {weaponElement} weapon
            </em>
          )}
          {!isAwakening && stats.strengths.map(s => (
            <em key={s} className="element font-semibold">+{s}</em>
          ))}
          {!isAwakening && stats.weaknesses.map(w => (
            <em key={w} className="element !text-red-400 !border-red-500/30">-{w}</em>
          ))}
        </div>

        {/* Elemental Resistances (Awakening 2.1.1) */}
        {isAwakening && stats.elementalResistances && stats.elementalResistances.length > 0 && (
          <div className="px-3.5 pt-3 pb-2 border-b border-[#1c2d35]">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">
              Elemental Resistances
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {stats.elementalResistances.map(({ element, value }) => (
                <div
                  key={element}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0a151b] border border-[#20343d] text-xs"
                >
                  <span className="font-semibold text-gray-300">{element}</span>
                  <span className="font-mono font-bold text-cyan-400">+{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Attributes / Stats from Weapon Talents (Awakening 2.1.1) */}
        {isAwakening && stats.talentStats && Object.keys(stats.talentStats).length > 0 && (
          <div className="px-3.5 pt-3 pb-2 border-b border-[#1c2d35]">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">
              Core Attributes (Talents)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(stats.talentStats).map(([stat, val]) => (
                <div
                  key={stat}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0a151b] border border-[#20343d] text-xs"
                >
                  <span className="font-semibold text-gray-300 uppercase text-[10px] tracking-wide">{stat}</span>
                  <span className="font-mono font-bold text-amber-400">+{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Perks Section Heading */}
        <div className="perk-heading">
          <h3>Active perks</h3>
          <span className="badge">{activePerksCount}</span>
          {hasOvercapped && (
            <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 uppercase">
              <AlertTriangle className="h-3 w-3 text-red-400" /> Overcapped
            </span>
          )}
        </div>

        {/* Perk List */}
        <div className="perk-list px-3.5 pb-4 space-y-2">
          {stats.perks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs italic">
              No equipment or cells active. Select gear to activate perks.
            </div>
          ) : (
            stats.perks.map(perk => {
              const isAccordionOpen = expandedPerkId === perk.perkId;
              const isMax = perk.cappedValue === 6;
              const isItemActive = isAwakening ? perk.isActive : true;

              return (
                <div
                  key={perk.perkId}
                  className={`perk-card ${
                    isAwakening
                      ? isItemActive ? 'maxed' : 'opacity-60'
                      : isMax ? 'maxed' : ''
                  }`}
                >
                  {/* Perk Title & Value */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <strong className={`truncate text-sm ${isAwakening ? (isItemActive ? 'text-emerald-300' : 'text-gray-400') : (isMax ? 'text-amber-300' : 'text-white')}`}>
                        {perk.name}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 font-mono text-xs font-bold">
                      {isAwakening ? (
                        <div className="flex items-center gap-1">
                          <span className={isItemActive ? 'text-emerald-400' : 'text-gray-500'}>
                            {perk.totalValue}/{perk.threshold ?? 6}
                          </span>
                          <span className={`text-[8.5px] uppercase font-bold px-1.5 py-0.2 rounded border ${isItemActive ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
                            {isItemActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ) : (
                        <span className={isMax ? 'text-amber-300' : 'text-cyan-300'}>
                          +{perk.totalValue}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 6-Tier Meter (Reforged / Classic) */}
                  {!isAwakening && (
                    <div className="perk-meter">
                      {[1, 2, 3, 4, 5, 6].map(tier => (
                        <i
                          key={tier}
                          className={tier <= perk.cappedValue ? 'filled' : ''}
                        />
                      ))}
                    </div>
                  )}

                  {/* Current Tier Description */}
                  <p className="text-[11px] text-gray-300 mt-1.5 leading-snug">
                    {perk.currentTierDescription}
                  </p>

                  {/* Sources Row */}
                  <div className="mt-2 pt-1.5 border-t border-[#1c2d35] flex flex-wrap items-center gap-1 text-[9.5px] text-gray-400">
                    <span className="font-semibold text-gray-500">Sources:</span>
                    {perk.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-[#0a151b] border border-[#20343d] text-gray-300"
                        title={src.sourceName}
                      >
                        {src.sourceName} (+{src.value})
                      </span>
                    ))}
                  </div>

                  {/* Accordion Expand All 6 Tiers */}
                  {Object.keys(perk.tiers).length > 0 && (
                    <div className="mt-1 text-right">
                      <button
                        type="button"
                        onClick={() => setExpandedPerkId(isAccordionOpen ? null : perk.perkId)}
                        className="text-[9.5px] text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{isAccordionOpen ? 'Hide tiers' : 'View all 6 tiers'}</span>
                        {isAccordionOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>
                  )}

                  {isAccordionOpen && Object.keys(perk.tiers).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#1c2d35] space-y-1 bg-[#091419] p-2 rounded text-xs">
                      {[1, 2, 3, 4, 5, 6].map(t => {
                        const desc = perk.tiers[String(t)];
                        if (!desc) return null;
                        const isCurrent = t === perk.cappedValue;
                        return (
                          <div
                            key={t}
                            className={`p-1 rounded flex items-start gap-1.5 text-[10.5px] ${
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

        {/* Quick Launch / Inject Button (Only for supported DF versions) */}
        {onOpenLauncherModal && currentVersionId && isDauntlessForeverSupported(currentVersionId) && (
          <div className="p-3 border-t border-[#1c2d35]">
            <button
              type="button"
              onClick={onOpenLauncherModal}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500/15 to-yellow-500/15 hover:from-amber-500/25 hover:to-yellow-500/25 border border-amber-500/35 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Terminal className="h-4 w-4 text-amber-400" />
              <span>Copy Dauntless Forever Commands</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
