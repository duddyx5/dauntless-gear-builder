import React from 'react';
import {
  BuildState,
  PatchData,
  PatchVersionInfo,
} from '../types/builder';
import { PickerSlotType } from './SlotPickerSheet';
import { parseCellSpec } from '../utils/calculator';
import { getElementStyle, getSocketStyle, resolveAssetUrl } from '../utils/theme';
import {
  Sword,
  Shield,
  Sparkles,
  Zap,
  Plus,
  Flame,
  ChevronRight,
} from 'lucide-react';

interface EquipmentGridProps {
  build: BuildState;
  patchData: PatchData;
  patchInfo?: PatchVersionInfo;
  powerSurged: boolean;
  onOpenPicker: (slot: PickerSlotType, socket?: string | null) => void;
}

export const EquipmentGrid: React.FC<EquipmentGridProps> = ({
  build,
  patchData,
  patchInfo,
  powerSurged,
  onOpenPicker,
}) => {
  const currentWeapon = patchData.weapons.find(w => w.id === build.weapon);
  const currentHead = patchData.armour.find(a => a.id === build.head);
  const currentTorso = patchData.armour.find(a => a.id === build.torso);
  const currentArms = patchData.armour.find(a => a.id === build.arms);
  const currentLegs = patchData.armour.find(a => a.id === build.legs);
  const currentLantern = patchData.lanterns.find(l => l.id === build.lantern);
  const currentOmnicell = patchData.omnicells.find(o => o.id === build.omnicell);

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
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${sockStyle.bg} ${sockStyle.text} ${sockStyle.border} hover:bg-opacity-80`}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="capitalize">{allowedSocket} Cell</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onOpenPicker(slotType, allowedSocket)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-900/90 border border-gray-700/80 hover:border-cyan-400 text-xs transition-all active:scale-95 group max-w-full"
      >
        <span className={`h-2 w-2 rounded-full ${sockStyle.pill} shrink-0`} />
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
      {/* 1. WEAPON SLOT */}
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
                  <span className="text-amber-400 font-semibold">
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
        {currentWeapon && currentWeapon.cellSockets && currentWeapon.cellSockets.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-gray-800/80 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-gray-400 font-medium">Sockets:</span>
            {renderCellButton(build.weaponCells[0] || null, currentWeapon.cellSockets[0] || 'prismatic', 'weaponCell_0')}
            {currentWeapon.cellSockets[1] &&
              renderCellButton(build.weaponCells[1] || null, currentWeapon.cellSockets[1], 'weaponCell_1')}
          </div>
        )}
      </div>

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
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  {label}
                </span>
                <h4 className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                  {item ? item.name : `Select ${label}...`}
                </h4>

                {item ? (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-gray-400">
                    <span className="text-gray-300 font-medium">
                      {powerSurged ? item.maxResistance : item.baseResistance} Res
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

            {/* Cell Socket Button */}
            {item && (
              <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-500 uppercase">Socket</span>
                {renderCellButton(cellSpec, item.cellSocket || 'prismatic', cellSlot)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 3. LANTERN & OMNICELL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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

          {currentLantern && (
            <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-500 uppercase">Socket</span>
              {renderCellButton(build.lanternCell, currentLantern.cellSocket || 'prismatic', 'lanternCell')}
            </div>
          )}
        </div>

        {/* Omnicell (Visible for Reforged / patches with Omnicells) */}
        {patchInfo?.hasOmnicells !== false && (
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
