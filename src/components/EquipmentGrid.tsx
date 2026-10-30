import React, { useState } from 'react';
import {
  BuildState,
  PatchData,
  PatchVersionInfo,
  WeaponItem,
  ArmourItem,
} from '../types/builder';
import { PickerSlotType } from './SlotPickerSheet';
import { parseCellSpec } from '../utils/calculator';
import { getElementStyle, resolveAssetUrl } from '../utils/theme';
import {
  Sword,
  Shield,
  Sparkles,
  Zap,
  ChevronRight,
  ChevronDown,
  Check,
  Layers,
} from 'lucide-react';

interface EquipmentGridProps {
  build: BuildState;
  patchData: PatchData;
  patchInfo?: PatchVersionInfo;
  powerSurged: boolean;
  onOpenPicker: (slot: PickerSlotType, socket?: string | null) => void;
  onGearLevelChange?: (slot: string, level: number) => void;
  onWeaponTalentChange?: (slotKey: 'weapon' | 'secondaryWeapon', tierIndex: number, optionIndex: number) => void;
}

export const EquipmentGrid: React.FC<EquipmentGridProps> = ({
  build,
  patchData,
  patchInfo,
  powerSurged,
  onOpenPicker,
  onGearLevelChange,
  onWeaponTalentChange,
}) => {
  const [openTalentMenu, setOpenTalentMenu] = useState<{
    slotKey: 'weapon' | 'secondaryWeapon';
    tierIndex: number;
  } | null>(null);

  const isAwakening = patchInfo?.era === 'Awakening' || patchData.version === '2.1.1';
  const hasCellSockets = patchInfo?.hasCellSockets !== false;
  const hasOmnicells = patchInfo?.hasOmnicells !== false;

  const currentWeapon = patchData.weapons.find(w => w.id === build.weapon);
  const currentSecondaryWeapon = patchData.weapons.find(w => w.id === build.secondaryWeapon);
  const currentHead = patchData.armour.find(a => a.id === build.head);
  const currentTorso = patchData.armour.find(a => a.id === build.torso);
  const currentArms = patchData.armour.find(a => a.id === build.arms);
  const currentLegs = patchData.armour.find(a => a.id === build.legs);
  const currentLantern = patchData.lanterns.find(l => l.id === build.lantern);
  const currentOmnicell = patchData.omnicells.find(o => o.id === build.omnicell);

  const getWeaponPower = (w: WeaponItem, slotKey: string) => {
    if (!isAwakening) {
      return powerSurged ? w.maxPower : w.basePower;
    }
    const lvl = build.gearLevels?.[slotKey] ?? 20;
    return w.basePower + Math.round((w.maxPower - w.basePower) * ((lvl - 1) / 19));
  };

  const getArmourRes = (a: ArmourItem, slotKey: string) => {
    if (!isAwakening) {
      return powerSurged ? a.maxResistance : a.baseResistance;
    }
    const lvl = build.gearLevels?.[slotKey] ?? 20;
    return a.baseResistance + Math.round((a.maxResistance - a.baseResistance) * ((lvl - 1) / 19));
  };

  const getArmourPerks = (a: ArmourItem, slotKey: string) => {
    if (isAwakening && a.stats && a.stats.length > 0) {
      const lvl = build.gearLevels?.[slotKey] ?? 20;
      const match = a.stats
        .filter(st => st.min_level <= lvl)
        .reduce((prev, curr) => (prev.min_level < curr.min_level ? curr : prev), a.stats[0]);
      if (match && match.perks) {
        return Object.entries(match.perks).map(([pId, val]) => ({
          id: pId,
          name: patchData.perks[pId]?.name || pId.charAt(0).toUpperCase() + pId.slice(1).replace(/_/g, ' '),
          value: val,
        }));
      }
    }
    return a.perks.map(p => ({
      id: p.id,
      name: p.name,
      value: isAwakening ? p.value : (powerSurged ? p.value : (p.baseValue ?? p.value)),
    }));
  };

  const renderGearLevelControl = (slotKey: string) => {
    if (!isAwakening || !onGearLevelChange) return null;
    const currentLevel = build.gearLevels?.[slotKey] ?? 20;

    return (
      <div
        className="flex items-center gap-1.5 bg-[#0a151b] border border-[#21333d] rounded-lg px-2 py-0.5 text-xs shrink-0 select-none"
        onClick={e => e.stopPropagation()}
      >
        <span className="text-[10px] font-bold text-gray-400 uppercase">Lv</span>
        <button
          type="button"
          disabled={currentLevel <= 1}
          onClick={() => onGearLevelChange(slotKey, currentLevel - 1)}
          className="w-5 h-5 rounded bg-[#101c22] hover:bg-[#1a2d36] disabled:opacity-30 text-white font-bold flex items-center justify-center transition-colors text-xs"
          title="Decrease Gear Level"
        >
          -
        </button>
        <span className="font-mono font-bold text-cyan-300 w-5 text-center text-xs">
          {currentLevel}
        </span>
        <button
          type="button"
          disabled={currentLevel >= 20}
          onClick={() => onGearLevelChange(slotKey, currentLevel + 1)}
          className="w-5 h-5 rounded bg-[#101c22] hover:bg-[#1a2d36] disabled:opacity-30 text-white font-bold flex items-center justify-center transition-colors text-xs"
          title="Increase Gear Level"
        >
          +
        </button>
      </div>
    );
  };

  // Helper for weapon talents section in Awakening
  const renderWeaponTalentsSection = (
    weapon: WeaponItem | undefined,
    slotKey: 'weapon' | 'secondaryWeapon'
  ) => {
    if (!isAwakening || !weapon || !weapon.talents || weapon.talents.length === 0) return null;
    const chosenIndices = slotKey === 'weapon'
      ? (build.weaponTalents || [0, 0, 0, 0, 0])
      : (build.secondaryWeaponTalents || [0, 0, 0, 0, 0]);

    return (
      <div className="mt-3 pt-3 border-t border-[#1d313a] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Weapon Talents
          </span>
          <span className="text-[9px] text-gray-500 uppercase tracking-wide">5 Tiers Configurable</span>
        </div>

        <div className="space-y-1.5">
          {weapon.talents.map((tier, tIdx) => {
            const selectedOptIdx = chosenIndices[tIdx] ?? 0;
            const selectedOpt = tier.options[selectedOptIdx] || tier.options[0];
            const isMenuOpen = openTalentMenu?.slotKey === slotKey && openTalentMenu?.tierIndex === tIdx;

            return (
              <div key={tier.name + tIdx} className="relative">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenTalentMenu(isMenuOpen ? null : { slotKey, tierIndex: tIdx });
                  }}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#0a151b] hover:bg-[#101e25] border border-[#21333d] cursor-pointer transition-colors text-xs gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-bold text-gray-500 block">
                      Tier {tIdx + 1}: {tier.name}
                    </span>
                    <span className="font-medium text-cyan-200 block truncate text-[11px]">
                      {selectedOpt?.text || 'Select Talent'}
                    </span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                </div>

                {/* Options Dropdown Menu */}
                {isMenuOpen && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#0d191f] border border-cyan-500/50 rounded-xl p-1.5 shadow-2xl space-y-1 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between px-2 py-1 border-b border-[#21333d]">
                      <span className="text-[10px] font-bold uppercase text-gray-400">
                        Choose {tier.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenTalentMenu(null)}
                        className="text-[10px] text-cyan-400 hover:text-white"
                      >
                        Done
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 modal-scroll overscroll-contain">
                      {tier.options.map((opt, oIdx) => {
                        const isSelected = oIdx === selectedOptIdx;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => {
                              if (onWeaponTalentChange) {
                                onWeaponTalentChange(slotKey, tIdx, oIdx);
                              }
                              setOpenTalentMenu(null);
                            }}
                            className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-start justify-between gap-2 ${
                              isSelected
                                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-semibold'
                                : 'hover:bg-[#15252e] text-gray-300'
                            }`}
                          >
                            <span className="leading-tight flex-1 text-[11px]">{opt.text}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper for cell button
  const renderCellButton = (
    cellSpec: string | null,
    allowedSocket: string,
    slotType: PickerSlotType
  ) => {
    const parsed = parseCellSpec(cellSpec, patchData.cells);

    if (!parsed) {
      return (
        <button
          type="button"
          onClick={() => onOpenPicker(slotType, allowedSocket)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-dashed border-[#2a424e] bg-[#091419]/70 text-gray-400 hover:border-cyan-500/50 hover:text-cyan-300 transition-all cursor-pointer"
        >
          <span className="w-2 h-2 border border-gray-500/80 bg-gray-700/80 rotate-45 inline-block shrink-0" />
          <span className="capitalize text-[10.5px]">Empty {allowedSocket} Socket</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onOpenPicker(slotType, allowedSocket)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-[#2a424e] bg-[#101e25] hover:border-cyan-400 text-cyan-200 transition-all cursor-pointer"
      >
        <span className="cell-gem" />
        <span className="font-semibold text-cyan-300 truncate text-[11px]">
          {isAwakening ? `${parsed.perkName} Cell` : `+${parsed.variantLevel} ${parsed.perkName}`}
        </span>
        <span className="text-[9.5px] text-gray-400 uppercase hidden sm:inline">
          · {allowedSocket}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full space-y-3.5">
      {/* 1. WEAPONS SECTION */}
      {isAwakening ? (
        /* Awakening Dual Weapons Layout */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Dual Weapon Loadout (Awakening)
            </span>
            <span className="text-[11px] text-gray-400">Weapon Swap Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Primary Weapon */}
            <article className="gear-card p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1 px-1">
                  <span className="kicker !mb-0">Primary Weapon</span>
                  {renderGearLevelControl('weapon')}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenPicker('weapon')}
                  className="gear-main"
                >
                  <span className="gear-image-wrap">
                    {currentWeapon?.icon ? (
                      <img
                        src={resolveAssetUrl(currentWeapon.icon)}
                        alt={currentWeapon.name}
                        className="gear-image"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Sword className="h-6 w-6 text-gray-500 -rotate-45" />
                    )}
                    {currentWeapon && (
                      <span className="equipped-check">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </span>

                  <span className="gear-copy">
                    <span className="gear-meta">{currentWeapon?.typeName || 'Primary Weapon'}</span>
                    <strong>{currentWeapon ? currentWeapon.name : 'Choose Primary Weapon...'}</strong>
                    {currentWeapon && (
                      <span className="gear-badges">
                        <em className={`element ${currentWeapon.element.toLowerCase()}`}>
                          {currentWeapon.element}
                        </em>
                        <em>
                          <Zap className="h-3 w-3 text-amber-400" /> {getWeaponPower(currentWeapon, 'weapon')} power
                        </em>
                      </span>
                    )}
                  </span>
                  <span className="slot-label">Primary <ChevronRight className="h-3.5 w-3.5" /></span>
                </button>

                {/* Abilities */}
                {currentWeapon && (
                  <div className="mt-2.5 pt-2 border-t border-[#1d313a] space-y-1 text-xs">
                    {currentWeapon.specialName && (
                      <p className="text-[11px] text-gray-300 leading-snug">
                        <strong className="text-cyan-300">Special: </strong>
                        {currentWeapon.specialName}
                        {currentWeapon.specialDesc && ` — ${currentWeapon.specialDesc}`}
                      </p>
                    )}
                    {currentWeapon.passiveName && (
                      <p className="text-[11px] text-gray-300 leading-snug">
                        <strong className="text-blue-300">Passive: </strong>
                        {currentWeapon.passiveName}
                        {currentWeapon.passiveDesc && ` — ${currentWeapon.passiveDesc}`}
                      </p>
                    )}
                    {currentWeapon.activeName && (
                      <p className="text-[11px] text-gray-300 leading-snug">
                        <strong className="text-amber-300">Active: </strong>
                        {currentWeapon.activeName}
                        {currentWeapon.activeDesc && ` — ${currentWeapon.activeDesc}`}
                      </p>
                    )}
                    {currentWeapon.uniqueEffect && !currentWeapon.specialName && (
                      <div className="text-[11px] text-gray-300/90 italic flex items-start gap-1">
                        <Sparkles className="h-3 w-3 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{currentWeapon.uniqueEffect}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Talents Builder */}
                {renderWeaponTalentsSection(currentWeapon, 'weapon')}
              </div>
            </article>

            {/* Secondary Weapon */}
            <article className="gear-card p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1 px-1">
                  <span className="kicker !mb-0 !text-blue-400">Secondary Weapon</span>
                  {renderGearLevelControl('secondaryWeapon')}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenPicker('secondaryWeapon')}
                  className="gear-main"
                >
                  <span className="gear-image-wrap">
                    {currentSecondaryWeapon?.icon ? (
                      <img
                        src={resolveAssetUrl(currentSecondaryWeapon.icon)}
                        alt={currentSecondaryWeapon.name}
                        className="gear-image"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Sword className="h-6 w-6 text-gray-500 -rotate-45" />
                    )}
                    {currentSecondaryWeapon && (
                      <span className="equipped-check">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </span>

                  <span className="gear-copy">
                    <span className="gear-meta">{currentSecondaryWeapon?.typeName || 'Auxiliary Weapon'}</span>
                    <strong>{currentSecondaryWeapon ? currentSecondaryWeapon.name : 'Choose Secondary Weapon...'}</strong>
                    {currentSecondaryWeapon ? (
                      <span className="gear-badges">
                        <em className={`element ${currentSecondaryWeapon.element.toLowerCase()}`}>
                          {currentSecondaryWeapon.element}
                        </em>
                        <em>
                          <Zap className="h-3 w-3 text-amber-400" /> {getWeaponPower(currentSecondaryWeapon, 'secondaryWeapon')} power
                        </em>
                      </span>
                    ) : (
                      <span className="gear-subtitle">Tap to equip swap weapon</span>
                    )}
                  </span>
                  <span className="slot-label">Secondary <ChevronRight className="h-3.5 w-3.5" /></span>
                </button>

                {/* Abilities */}
                {currentSecondaryWeapon && (
                  <div className="mt-2.5 pt-2 border-t border-[#1d313a] space-y-1 text-xs">
                    {currentSecondaryWeapon.specialName && (
                      <p className="text-[11px] text-gray-300 leading-snug">
                        <strong className="text-cyan-300">Special: </strong>
                        {currentSecondaryWeapon.specialName}
                        {currentSecondaryWeapon.specialDesc && ` — ${currentSecondaryWeapon.specialDesc}`}
                      </p>
                    )}
                    {currentSecondaryWeapon.passiveName && (
                      <p className="text-[11px] text-gray-300 leading-snug">
                        <strong className="text-blue-300">Passive: </strong>
                        {currentSecondaryWeapon.passiveName}
                        {currentSecondaryWeapon.passiveDesc && ` — ${currentSecondaryWeapon.passiveDesc}`}
                      </p>
                    )}
                    {currentSecondaryWeapon.activeName && (
                      <p className="text-[11px] text-gray-300 leading-snug">
                        <strong className="text-amber-300">Active: </strong>
                        {currentSecondaryWeapon.activeName}
                        {currentSecondaryWeapon.activeDesc && ` — ${currentSecondaryWeapon.activeDesc}`}
                      </p>
                    )}
                    {currentSecondaryWeapon.uniqueEffect && !currentSecondaryWeapon.specialName && (
                      <div className="text-[11px] text-gray-300/90 italic flex items-start gap-1">
                        <Sparkles className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
                        <span>{currentSecondaryWeapon.uniqueEffect}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Talents Builder */}
                {renderWeaponTalentsSection(currentSecondaryWeapon, 'secondaryWeapon')}
              </div>
            </article>
          </div>
        </div>
      ) : (
        /* Reforged / Classic Single Weapon Layout */
        <article className="gear-card weapon-card">
          <button
            type="button"
            onClick={() => onOpenPicker('weapon')}
            className="gear-main"
          >
            <span className="gear-image-wrap">
              {currentWeapon?.icon ? (
                <img
                  src={resolveAssetUrl(currentWeapon.icon)}
                  alt={currentWeapon.name}
                  className="gear-image"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Sword className="h-7 w-7 text-gray-500 -rotate-45" />
              )}
              {currentWeapon && (
                <span className="equipped-check">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              )}
            </span>

            <span className="gear-copy">
              <span className="gear-meta">
                {currentWeapon ? `Weapon · ${currentWeapon.typeName}` : 'Primary Weapon'}
              </span>
              <strong>{currentWeapon ? currentWeapon.name : 'Choose a Weapon...'}</strong>
              {currentWeapon ? (
                <span className="gear-badges">
                  <em className={`element ${currentWeapon.element.toLowerCase()}`}>
                    {currentWeapon.element}
                  </em>
                  <em>
                    <Zap className="h-3 w-3 text-amber-400" /> {powerSurged ? currentWeapon.maxPower : currentWeapon.basePower} power
                  </em>
                  {currentWeapon.perks.map(p => (
                    <em key={p.id}>
                      +{powerSurged ? p.value : (p.baseValue ?? p.value)} {p.name}
                    </em>
                  ))}
                </span>
              ) : (
                <span className="gear-subtitle">Tap to browse swords, axes, hammers, chainblades...</span>
              )}
            </span>
            <span className="slot-label">Weapon <ChevronRight className="h-3.5 w-3.5" /></span>
          </button>

          {/* Unique Effect Preview */}
          {currentWeapon?.uniqueEffect && (
            <div className="px-4 py-2 border-t border-[#1d313a] text-xs text-gray-300/90 italic leading-snug flex items-start gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>{currentWeapon.uniqueEffect}</span>
            </div>
          )}

          {/* Weapon Cell Sockets */}
          {hasCellSockets && currentWeapon && currentWeapon.cellSockets && currentWeapon.cellSockets.length > 0 && (
            <div className="gear-footer">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Sockets:</span>
                {renderCellButton(build.weaponCells[0] || null, currentWeapon.cellSockets[0] || 'prismatic', 'weaponCell_0')}
                {currentWeapon.cellSockets[1] &&
                  renderCellButton(build.weaponCells[1] || null, currentWeapon.cellSockets[1], 'weaponCell_1')}
              </div>
              <span className="hidden sm:inline text-[11px] text-gray-400">
                {currentWeapon.perks.map(p => `+${powerSurged ? p.value : (p.baseValue ?? p.value)} ${p.name}`).join(', ')}
              </span>
            </div>
          )}
        </article>
      )}

      {/* 2. ARMOUR PIECES (Head, Torso, Arms, Legs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { slot: 'head' as const, label: 'Head', eyebrow: 'Head Armour', icon: Shield, item: currentHead, cellSpec: build.headCell, cellSlot: 'headCell' as const },
          { slot: 'torso' as const, label: 'Torso', eyebrow: 'Torso Armour', icon: Shield, item: currentTorso, cellSpec: build.torsoCell, cellSlot: 'torsoCell' as const },
          { slot: 'arms' as const, label: 'Arms', eyebrow: 'Arms Armour', icon: Shield, item: currentArms, cellSpec: build.armsCell, cellSlot: 'armsCell' as const },
          { slot: 'legs' as const, label: 'Legs', eyebrow: 'Legs Armour', icon: Shield, item: currentLegs, cellSpec: build.legsCell, cellSlot: 'legsCell' as const },
        ].map(({ slot, label, eyebrow, icon: Icon, item, cellSpec, cellSlot }) => (
          <article
            key={slot}
            className="gear-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 p-2 px-3 pb-0">
                <span className="gear-meta !mb-0">{eyebrow}</span>
                {renderGearLevelControl(slot)}
              </div>

              <button
                type="button"
                onClick={() => onOpenPicker(slot)}
                className="gear-main"
              >
                <span className="gear-image-wrap">
                  {item?.icon ? (
                    <img
                      src={resolveAssetUrl(item.icon)}
                      alt={item.name}
                      className="gear-image"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Icon className="h-5 w-5 text-gray-500 -rotate-45" />
                  )}
                  {item && (
                    <span className="equipped-check">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </span>

                <span className="gear-copy">
                  <span className="gear-meta">{item?.behemoth ? `${item.behemoth} Armour` : label}</span>
                  <strong>{item ? item.name : `Select ${label}...`}</strong>

                  {item ? (
                    <span className="gear-badges">
                      <em>
                        <Shield className="h-3 w-3 text-cyan-400" /> {getArmourRes(item, slot)} res
                      </em>
                      {item.strength && (
                        <em className={`element ${item.strength.toLowerCase()}`}>
                          +{item.strength}
                        </em>
                      )}
                      {getArmourPerks(item, slot).map(p => (
                        <em key={p.id}>
                          +{p.value} {p.name}
                        </em>
                      ))}
                    </span>
                  ) : (
                    <span className="gear-subtitle">Tap to pick armour piece</span>
                  )}
                </span>
                <span className="slot-label">{label} <ChevronRight className="h-3.5 w-3.5" /></span>
              </button>
            </div>

            {/* Cell Socket Button(s) in Footer */}
            {hasCellSockets && item && (
              <div className="gear-footer">
                <div className="flex flex-wrap items-center gap-1.5">
                  {renderCellButton(cellSpec, item.cellSocket || 'prismatic', cellSlot)}
                  {isAwakening && slot === 'torso' &&
                    renderCellButton(build.torsoCell2 || null, 'prismatic', 'torsoCell2')}
                  {isAwakening && slot === 'legs' &&
                    renderCellButton(build.legsCell2 || null, 'prismatic', 'legsCell2')}
                </div>
                <span className="text-[10px] text-gray-400 truncate max-w-[140px] hidden sm:inline">
                  {getArmourPerks(item, slot).map(p => `+${p.value} ${p.name}`).join(', ')}
                </span>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* 3. LANTERN & OMNICELL */}
      <div className={`grid grid-cols-1 ${hasOmnicells ? 'sm:grid-cols-2' : ''} gap-3`}>
        {/* Lantern / Lantern Core */}
        <article className="gear-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 p-2 px-3 pb-0">
              <span className="gear-meta !mb-0">{isAwakening ? 'Lantern Core' : 'Lantern'}</span>
              {isAwakening && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 uppercase">
                  Core
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenPicker('lantern')}
              className="gear-main"
            >
              <span className="gear-image-wrap">
                {currentLantern?.icon ? (
                  <img
                    src={resolveAssetUrl(currentLantern.icon)}
                    alt={currentLantern.name}
                    className="gear-image"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Sparkles className="h-5 w-5 text-yellow-400 -rotate-45" />
                )}
                {currentLantern && (
                  <span className="equipped-check">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </span>

              <span className="gear-copy">
                <span className="gear-meta">{isAwakening ? 'Core Ability' : 'Utility'}</span>
                <strong>
                  {currentLantern ? currentLantern.name : isAwakening ? 'Choose Lantern Core...' : 'Select Lantern...'}
                </strong>

                {currentLantern ? (
                  isAwakening ? (
                    <span className="gear-subtitle line-clamp-2">
                      {currentLantern.activeName ? `${currentLantern.activeName} · ${currentLantern.activeDesc || ''}` : currentLantern.description}
                    </span>
                  ) : (
                    <span className="gear-subtitle line-clamp-1">
                      {currentLantern.holdAbility}
                    </span>
                  )
                ) : (
                  <span className="gear-subtitle">
                    {isAwakening ? 'Tap to equip Core (Discipline, Bastion, Iceborne...)' : 'Tap to pick lantern'}
                  </span>
                )}
              </span>
              <span className="slot-label">Lantern <ChevronRight className="h-3.5 w-3.5" /></span>
            </button>
          </div>

          {/* Awakening Active details card */}
          {isAwakening && currentLantern?.activeName && (
            <div className="px-3 pb-3 pt-1">
              <div className="p-2 rounded-lg bg-[#0a151b] border border-[#21333d] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-xs flex items-center gap-1">
                    <Zap className="h-3 w-3 text-amber-400" />
                    {currentLantern.activeName}
                  </span>
                  {currentLantern.cooldown && (
                    <span className="text-[10px] font-mono text-cyan-300">
                      CD: {currentLantern.cooldown}s
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-[11px] leading-snug">
                  {currentLantern.activeDesc}
                </p>
                {currentLantern.secondaryEffect && (
                  <p className="text-cyan-300/90 text-[10.5px] leading-snug pt-1 border-t border-[#1d313a]">
                    {currentLantern.secondaryEffect}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Cell socket for lantern (ONLY in Reforged / Classic) */}
          {hasCellSockets && currentLantern && !isAwakening && (
            <div className="gear-footer">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Socket:</span>
                {renderCellButton(build.lanternCell, currentLantern.cellSocket || 'prismatic', 'lanternCell')}
              </div>
            </div>
          )}
        </article>

        {/* Omnicell (Visible for Reforged / patches with Omnicells, hidden in Awakening) */}
        {hasOmnicells && (
          <article className="gear-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 p-2 px-3 pb-0">
                <span className="gear-meta !mb-0">Combat Style</span>
              </div>

              <button
                type="button"
                onClick={() => onOpenPicker('omnicell')}
                className="gear-main"
              >
                <span className="gear-image-wrap">
                  {currentOmnicell?.icon ? (
                    <img
                      src={resolveAssetUrl(currentOmnicell.icon)}
                      alt={currentOmnicell.name}
                      className="gear-image"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Zap className="h-5 w-5 text-purple-400 -rotate-45" />
                  )}
                  {currentOmnicell && (
                    <span className="equipped-check">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </span>

                <span className="gear-copy">
                  <span className="gear-meta">Omnicell</span>
                  <strong>{currentOmnicell ? currentOmnicell.name : 'Select Omnicell...'}</strong>

                  {currentOmnicell ? (
                    <span className="gear-subtitle line-clamp-2">
                      <b className="text-cyan-300">Active:</b> {currentOmnicell.active}
                    </span>
                  ) : (
                    <span className="gear-subtitle">Tap to pick (Discipline, Iceborne, Bastion...)</span>
                  )}
                </span>
                <span className="slot-label">Omnicell <ChevronRight className="h-3.5 w-3.5" /></span>
              </button>
            </div>

            {currentOmnicell && (
              <div className="gear-footer">
                <span className="text-[10px] text-gray-300 truncate">
                  <b className="text-purple-300">Passive:</b> {currentOmnicell.passive}
                </span>
              </div>
            )}
          </article>
        )}
      </div>
    </div>
  );
};
