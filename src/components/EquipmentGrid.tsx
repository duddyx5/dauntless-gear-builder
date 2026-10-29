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
import { getElementStyle, getSocketStyle, getCellCategoryIcon, resolveAssetUrl } from '../utils/theme';
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

  const renderGearLevelControl = (slotKey: string) => {
    if (!isAwakening || !onGearLevelChange) return null;
    const currentLevel = build.gearLevels?.[slotKey] ?? 20;

    return (
      <div
        className="flex items-center gap-1.5 bg-gray-900/90 border border-gray-700/80 rounded-lg px-2 py-0.5 text-xs shrink-0 select-none"
        onClick={e => e.stopPropagation()}
      >
        <span className="text-[10px] font-bold text-gray-400 uppercase">Lv</span>
        <button
          type="button"
          disabled={currentLevel <= 1}
          onClick={() => onGearLevelChange(slotKey, currentLevel - 1)}
          className="w-5 h-5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-gray-800 text-white font-bold flex items-center justify-center transition-colors text-xs"
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
          className="w-5 h-5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-gray-800 text-white font-bold flex items-center justify-center transition-colors text-xs"
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
      <div className="mt-3 pt-3 border-t border-gray-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Weapon Talents
          </span>
          <span className="text-[10px] text-gray-400">5 Tiers Configurable</span>
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
                  className="flex items-center justify-between p-2 rounded-xl bg-gray-900/60 hover:bg-gray-800/70 border border-gray-700/60 cursor-pointer transition-colors text-xs gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">
                      Tier {tIdx + 1}: {tier.name}
                    </span>
                    <span className="font-medium text-cyan-200 block truncate">
                      {selectedOpt?.text || 'Select Talent'}
                    </span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                </div>

                {/* Options Dropdown Menu */}
                {isMenuOpen && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 z-30 bg-gray-900 border border-cyan-500/50 rounded-xl p-1.5 shadow-2xl space-y-1 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between px-2 py-1 border-b border-gray-800">
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
                                : 'hover:bg-gray-800 text-gray-300'
                            }`}
                          >
                            <span className="leading-tight flex-1">{opt.text}</span>
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
    const sockStyle = getSocketStyle(allowedSocket);

    if (!parsed) {
      return (
        <button
          type="button"
          onClick={() => onOpenPicker(slotType, allowedSocket)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-dashed transition-all ${sockStyle.bg} ${sockStyle.text} ${sockStyle.border} hover:brightness-125`}
        >
          <img
            src={resolveAssetUrl(getCellCategoryIcon(allowedSocket))}
            alt={allowedSocket}
            className="h-3.5 w-3.5 object-contain shrink-0 opacity-70 filter drop-shadow"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="capitalize">Empty {allowedSocket} Socket</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onOpenPicker(slotType, allowedSocket)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${sockStyle.bg} ${sockStyle.border} hover:brightness-125`}
      >
        <img
          src={resolveAssetUrl(getCellCategoryIcon(parsed.cell?.slot || allowedSocket))}
          alt={allowedSocket}
          className="h-3.5 w-3.5 object-contain shrink-0 filter drop-shadow"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <span className="font-semibold text-cyan-300 truncate">
          +{parsed.variantLevel} {parsed.perkName}
        </span>
        <span className="text-[10px] text-gray-400 uppercase hidden sm:inline">
          ({allowedSocket})
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
            <div className="bg-dauntless-card border border-dauntless-border hover:border-gray-600 rounded-2xl p-3.5 flex flex-col justify-between transition-all shadow-lg">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Primary Weapon
                  </span>
                  {renderGearLevelControl('weapon')}
                </div>

                <div
                  onClick={() => onOpenPicker('weapon')}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className="h-14 w-14 rounded-xl bg-gray-900 border border-gray-700 group-hover:border-cyan-400 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-inner transition-colors">
                    {currentWeapon?.icon ? (
                      <img
                        src={resolveAssetUrl(currentWeapon.icon)}
                        alt={currentWeapon.name}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Sword className="h-7 w-7 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-400 font-medium block">
                      {currentWeapon?.typeName || 'Weapon'}
                    </span>
                    <h3 className="font-display font-bold text-base text-white group-hover:text-cyan-300 transition-colors truncate">
                      {currentWeapon ? currentWeapon.name : 'Choose Primary Weapon...'}
                    </h3>

                    {currentWeapon && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${getElementStyle(currentWeapon.element).bg} ${getElementStyle(currentWeapon.element).text} ${getElementStyle(currentWeapon.element).border}`}>
                          {currentWeapon.element}
                        </span>
                        <span className="text-amber-400 font-semibold font-mono">
                          {getWeaponPower(currentWeapon, 'weapon')} Power
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Abilities */}
                {currentWeapon && (
                  <div className="mt-2.5 pt-2 border-t border-gray-800/80 space-y-1 text-xs">
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
            </div>

            {/* Secondary Weapon */}
            <div className="bg-dauntless-card border border-dauntless-border hover:border-gray-600 rounded-2xl p-3.5 flex flex-col justify-between transition-all shadow-lg">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Secondary Weapon
                  </span>
                  {renderGearLevelControl('secondaryWeapon')}
                </div>

                <div
                  onClick={() => onOpenPicker('secondaryWeapon')}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className="h-14 w-14 rounded-xl bg-gray-900 border border-gray-700 group-hover:border-blue-400 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-inner transition-colors">
                    {currentSecondaryWeapon?.icon ? (
                      <img
                        src={resolveAssetUrl(currentSecondaryWeapon.icon)}
                        alt={currentSecondaryWeapon.name}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Sword className="h-7 w-7 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-400 font-medium block">
                      {currentSecondaryWeapon?.typeName || 'Auxiliary Weapon'}
                    </span>
                    <h3 className="font-display font-bold text-base text-white group-hover:text-blue-300 transition-colors truncate">
                      {currentSecondaryWeapon ? currentSecondaryWeapon.name : 'Choose Secondary Weapon...'}
                    </h3>

                    {currentSecondaryWeapon ? (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${getElementStyle(currentSecondaryWeapon.element).bg} ${getElementStyle(currentSecondaryWeapon.element).text} ${getElementStyle(currentSecondaryWeapon.element).border}`}>
                          {currentSecondaryWeapon.element}
                        </span>
                        <span className="text-amber-400 font-semibold font-mono">
                          {getWeaponPower(currentSecondaryWeapon, 'secondaryWeapon')} Power
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-500 flex items-center gap-0.5 mt-1">
                        Tap to equip weapon swap <ChevronRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Abilities */}
                {currentSecondaryWeapon && (
                  <div className="mt-2.5 pt-2 border-t border-gray-800/80 space-y-1 text-xs">
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
            </div>
          </div>
        </div>
      ) : (
        /* Reforged / Classic Single Weapon Layout */
        <div className="bg-dauntless-card border border-dauntless-border hover:border-gray-600 rounded-2xl p-3.5 transition-all shadow-lg">
          <div className="flex items-start justify-between gap-3">
            {/* Main Weapon Click Area */}
            <div
              onClick={() => onOpenPicker('weapon')}
              className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer group"
            >
              <div className="h-14 w-14 rounded-xl bg-gray-900 border border-gray-700 group-hover:border-cyan-400 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-inner transition-colors">
                {currentWeapon?.icon ? (
                  <img
                    src={resolveAssetUrl(currentWeapon.icon)}
                    alt={currentWeapon.name}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Sword className="h-7 w-7 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <span className="uppercase tracking-wider font-bold text-gray-500">Weapon</span>
                  {currentWeapon && (
                    <>
                      <span>•</span>
                      <span>{currentWeapon.typeName}</span>
                    </>
                  )}
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors truncate">
                  {currentWeapon ? currentWeapon.name : 'Choose a Weapon...'}
                </h3>

                {currentWeapon ? (
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${getElementStyle(currentWeapon.element).bg} ${getElementStyle(currentWeapon.element).text} ${getElementStyle(currentWeapon.element).border}`}>
                      {currentWeapon.element}
                    </span>
                    <span className="text-amber-400 font-semibold font-mono">
                      {powerSurged ? currentWeapon.maxPower : currentWeapon.basePower} Power
                    </span>
                    {currentWeapon.perks.map(p => (
                      <span
                        key={p.id}
                        className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-800 text-cyan-300 border border-gray-700"
                      >
                        +{powerSurged ? p.value : (p.baseValue ?? p.value)} {p.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    Tap to browse swords, axes, hammers, chainblades... <ChevronRight className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Unique Effect Preview */}
          {currentWeapon?.uniqueEffect && (
            <div className="mt-2.5 pt-2 border-t border-gray-800/80 text-xs text-gray-300/90 italic leading-snug flex items-start gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>{currentWeapon.uniqueEffect}</span>
            </div>
          )}

          {/* Weapon Cell Sockets */}
          {hasCellSockets && currentWeapon && currentWeapon.cellSockets && currentWeapon.cellSockets.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-gray-800/80 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-gray-400 font-medium">Sockets:</span>
              {renderCellButton(build.weaponCells[0] || null, currentWeapon.cellSockets[0] || 'prismatic', 'weaponCell_0')}
              {currentWeapon.cellSockets[1] &&
                renderCellButton(build.weaponCells[1] || null, currentWeapon.cellSockets[1], 'weaponCell_1')}
            </div>
          )}
        </div>
      )}

      {/* 2. ARMOUR PIECES (Head, Torso, Arms, Legs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {[
          { slot: 'head' as const, label: 'Head Armour', icon: Shield, item: currentHead, cellSpec: build.headCell, cellSlot: 'headCell' as const },
          { slot: 'torso' as const, label: 'Torso Armour', icon: Shield, item: currentTorso, cellSpec: build.torsoCell, cellSlot: 'torsoCell' as const },
          { slot: 'arms' as const, label: 'Arms Armour', icon: Shield, item: currentArms, cellSpec: build.armsCell, cellSlot: 'armsCell' as const },
          { slot: 'legs' as const, label: 'Legs Armour', icon: Shield, item: currentLegs, cellSpec: build.legsCell, cellSlot: 'legsCell' as const },
        ].map(({ slot, label, icon: Icon, item, cellSpec, cellSlot }) => (
          <div
            key={slot}
            className="bg-dauntless-card border border-dauntless-border hover:border-gray-600 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  {label}
                </span>
                {renderGearLevelControl(slot)}
              </div>

              <div
                onClick={() => onOpenPicker(slot)}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <div className="h-12 w-12 rounded-xl bg-gray-900 border border-gray-700 group-hover:border-cyan-400 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-inner transition-colors">
                  {item?.icon ? (
                    <img
                      src={resolveAssetUrl(item.icon)}
                      alt={item.name}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Icon className="h-5 w-5 text-gray-500 group-hover:text-cyan-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                    {item ? item.name : `Select ${label}...`}
                  </h4>

                  {item ? (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-gray-400">
                      <span className="text-gray-300 font-medium font-mono">
                        {getArmourRes(item, slot)} Res
                      </span>
                      {item.strength && <span className="text-emerald-400">+{item.strength}</span>}
                      {item.weakness && <span className="text-red-400">-{item.weakness}</span>}
                      {item.perks.map(p => (
                        <span
                          key={p.id}
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-800 text-cyan-300 border border-gray-700 truncate"
                        >
                          +{powerSurged ? p.value : (p.baseValue ?? p.value)} {p.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-500 flex items-center gap-0.5 mt-0.5">
                      Tap to pick <ChevronRight className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Cell Socket Button (Hidden in Awakening) */}
            {hasCellSockets && item && (
              <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-500 uppercase">Socket</span>
                {renderCellButton(cellSpec, item.cellSocket || 'prismatic', cellSlot)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 3. LANTERN & OMNICELL */}
      <div className={`grid grid-cols-1 ${hasOmnicells ? 'sm:grid-cols-2' : ''} gap-2.5`}>
        {/* Lantern */}
        <div className="bg-dauntless-card border border-dauntless-border hover:border-gray-600 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-md">
          <div
            onClick={() => onOpenPicker('lantern')}
            className="flex items-start gap-3 cursor-pointer group"
          >
            <div className="h-12 w-12 rounded-xl bg-gray-900 border border-gray-700 group-hover:border-cyan-400 flex items-center justify-center p-1 shrink-0 overflow-hidden transition-colors">
              {currentLantern?.icon ? (
                <img
                  src={resolveAssetUrl(currentLantern.icon)}
                  alt={currentLantern.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Sparkles className="h-5 w-5 text-yellow-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                Lantern
              </span>
              <h4 className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                {currentLantern ? currentLantern.name : 'Select Lantern...'}
              </h4>

              {currentLantern ? (
                <p className="text-[11px] text-gray-300/80 mt-1 line-clamp-2">
                  {currentLantern.holdAbility}
                </p>
              ) : (
                <span className="text-[11px] text-gray-500 flex items-center gap-0.5 mt-0.5">
                  Tap to pick lantern <ChevronRight className="h-3 w-3" />
                </span>
              )}
            </div>
          </div>

          {hasCellSockets && currentLantern && (
            <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-500 uppercase">Socket</span>
              {renderCellButton(build.lanternCell, currentLantern.cellSocket || 'prismatic', 'lanternCell')}
            </div>
          )}
        </div>

        {/* Omnicell (Visible for Reforged / patches with Omnicells, hidden in Awakening) */}
        {hasOmnicells && (
          <div className="bg-dauntless-card border border-dauntless-border hover:border-gray-600 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-md">
            <div
              onClick={() => onOpenPicker('omnicell')}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <div className="h-12 w-12 rounded-xl bg-gray-900 border border-gray-700 group-hover:border-cyan-400 flex items-center justify-center p-1 shrink-0 overflow-hidden transition-colors">
                {currentOmnicell?.icon ? (
                  <img
                    src={resolveAssetUrl(currentOmnicell.icon)}
                    alt={currentOmnicell.name}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Zap className="h-5 w-5 text-purple-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  Omnicell
                </span>
                <h4 className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                  {currentOmnicell ? currentOmnicell.name : 'Select Omnicell...'}
                </h4>

                {currentOmnicell ? (
                  <div className="mt-1 space-y-0.5 text-[11px]">
                    <p className="text-cyan-300/90 line-clamp-1">
                      <span className="font-bold">Active:</span> {currentOmnicell.active}
                    </p>
                    <p className="text-gray-400 line-clamp-1">
                      <span className="font-bold">Passive:</span> {currentOmnicell.passive}
                    </p>
                  </div>
                ) : (
                  <span className="text-[11px] text-gray-500 flex items-center gap-0.5 mt-0.5">
                    Tap to pick (Discipline, Iceborne, Bastion...) <ChevronRight className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
