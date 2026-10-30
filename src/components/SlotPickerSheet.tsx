import React, { useState, useMemo } from 'react';
import {
  WeaponItem,
  ArmourItem,
  CellItem,
  LanternItem,
  OmnicellItem,
  PatchData,
} from '../types/builder';
import { getElementStyle, getSocketStyle, getCellCategoryIcon, resolveAssetUrl } from '../utils/theme';
import { formatPerkEffect } from '../utils/calculator';
import { Search, X, Trash2, Shield, Zap, Sparkles, Check, ChevronRight } from 'lucide-react';

export type PickerSlotType =
  | 'weapon'
  | 'secondaryWeapon'
  | 'weaponCell_0'
  | 'weaponCell_1'
  | 'head'
  | 'headCell'
  | 'torso'
  | 'torsoCell'
  | 'torsoCell2'
  | 'arms'
  | 'armsCell'
  | 'legs'
  | 'legsCell'
  | 'legsCell2'
  | 'lantern'
  | 'lanternCell'
  | 'omnicell';

interface SlotPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  slotType: PickerSlotType | null;
  patchData: PatchData;
  currentSelectedId: string | null;
  onSelect: (id: string | null) => void;
  allowedSocket?: string | null;
  powerSurged: boolean;
}

export const SlotPickerSheet: React.FC<SlotPickerSheetProps> = ({
  isOpen,
  onClose,
  slotType,
  patchData,
  currentSelectedId,
  onSelect,
  allowedSocket,
  powerSurged,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState<string>('All');
  const [selectedWeaponType, setSelectedWeaponType] = useState<string>('All');
  const [selectedCellTier, setSelectedCellTier] = useState<number>(3); // default +3 cells

  if (!isOpen || !slotType) return null;

  const isCellPicker = slotType.includes('Cell');
  const isWeaponPicker = slotType === 'weapon' || slotType === 'secondaryWeapon';
  const isArmourPicker = ['head', 'torso', 'arms', 'legs'].includes(slotType);
  const isLanternPicker = slotType === 'lantern';
  const isOmnicellPicker = slotType === 'omnicell';
  const isAwakening = patchData.version === '2.1.1';

  const titleMap: Record<PickerSlotType, string> = {
    weapon: 'Select Primary Weapon',
    secondaryWeapon: 'Select Secondary Weapon',
    weaponCell_0: 'Select Weapon Cell (Slot 1)',
    weaponCell_1: 'Select Weapon Cell (Slot 2)',
    head: 'Select Head Armour (Helmet)',
    headCell: 'Select Head Cell',
    torso: 'Select Torso Armour (Chest)',
    torsoCell: isAwakening ? 'Select Torso Cell (Slot 1)' : 'Select Torso Cell',
    torsoCell2: 'Select Torso Cell (Slot 2)',
    arms: 'Select Arms Armour (Gauntlets)',
    armsCell: 'Select Arms Cell',
    legs: 'Select Legs Armour (Greaves)',
    legsCell: isAwakening ? 'Select Legs Cell (Slot 1)' : 'Select Legs Cell',
    legsCell2: 'Select Legs Cell (Slot 2)',
    lantern: isAwakening ? 'Select Lantern Core' : 'Select Lantern',
    lanternCell: 'Select Lantern Cell',
    omnicell: 'Select Omnicell',
  };

  const elements = ['All', 'Blaze', 'Frost', 'Shock', 'Terra', 'Radiant', 'Umbral', 'Neutral'];
  const weaponTypes = ['All', 'Sword', 'Axe', 'Hammer', 'Chain Blades', 'War Pike', 'Strikers', 'Repeaters'];

  // Filtered Weapons
  const filteredWeapons = useMemo(() => {
    if (!isWeaponPicker) return [];
    return patchData.weapons.filter(w => {
      const matchSearch =
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.behemoth.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.perks.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchElem = selectedElement === 'All' || w.element.toLowerCase() === selectedElement.toLowerCase();
      const matchType =
        selectedWeaponType === 'All' ||
        w.type.toLowerCase() === selectedWeaponType.toLowerCase().replace(/\s+/g, '') ||
        w.typeName.toLowerCase() === selectedWeaponType.toLowerCase();
      return matchSearch && matchElem && matchType;
    });
  }, [patchData.weapons, isWeaponPicker, searchTerm, selectedElement, selectedWeaponType]);

  // Filtered Armour
  const filteredArmour = useMemo(() => {
    if (!isArmourPicker) return [];
    const targetSlot = slotType;
    return patchData.armour.filter(a => {
      if (a.slot !== targetSlot) return false;
      const matchSearch =
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.behemoth.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.perks.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchElem =
        selectedElement === 'All' ||
        (a.strength && a.strength.toLowerCase() === selectedElement.toLowerCase());
      return matchSearch && matchElem;
    });
  }, [patchData.armour, isArmourPicker, slotType, searchTerm, selectedElement]);

  // Filtered Cells
  const filteredCells = useMemo(() => {
    if (!isCellPicker) return [];
    return patchData.cells.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.variants.some(v => v.perkName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchSocket =
        !allowedSocket ||
        allowedSocket.toLowerCase() === 'prismatic' ||
        c.slot.toLowerCase() === allowedSocket.toLowerCase() ||
        (allowedSocket.toLowerCase() === 'defence' && c.slot.toLowerCase() === 'defense') ||
        (allowedSocket.toLowerCase() === 'defense' && c.slot.toLowerCase() === 'defence');
      return matchSearch && matchSocket;
    });
  }, [patchData.cells, isCellPicker, searchTerm, allowedSocket]);

  // Filtered Lanterns
  const filteredLanterns = useMemo(() => {
    if (!isLanternPicker) return [];
    return patchData.lanterns.filter(l =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.holdAbility && l.holdAbility.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.activeName && l.activeName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [patchData.lanterns, isLanternPicker, searchTerm]);

  // Filtered Omnicells
  const filteredOmnicells = useMemo(() => {
    if (!isOmnicellPicker) return [];
    return patchData.omnicells.filter(o =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.active.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.passive.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patchData.omnicells, isOmnicellPicker, searchTerm]);

  return (
    <div
      className="modal-layer !p-0 sm:!p-6 !place-items-end sm:!place-items-center animate-fade-in"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="picker-sheet w-full max-w-2xl max-h-[90dvh] sm:max-h-[82vh]"
        role="dialog"
        aria-modal="true"
        aria-label={titleMap[slotType]}
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-[#36505b] mx-auto mt-2.5 mb-1 sm:hidden" />

        {/* Header */}
        <header className="summary-heading !border-b !border-[#21333d]">
          <div>
            <p className="kicker">Equipment library</p>
            <h2>{titleMap[slotType]}</h2>
          </div>

          <div className="flex items-center gap-2">
            {currentSelectedId && (
              <button
                type="button"
                onClick={() => {
                  onSelect(null);
                  onClose();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors cursor-pointer"
                title="Unequip item"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Unequip</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="icon-button text-gray-400 hover:text-white"
              aria-label="Close picker"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Search Bar + Filter Controls */}
        <div className="p-3 bg-[#0a151b] border-b border-[#21333d] space-y-2 shrink-0">
          <label className="search-field !m-0">
            <Search className="h-4 w-4 text-gray-500 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, behemoth, perk..."
              autoFocus={false}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            )}
          </label>

          {/* Weapon Type Filters */}
          {isWeaponPicker && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {weaponTypes.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedWeaponType(t)}
                  className={`px-2.5 py-1 rounded-md shrink-0 font-bold transition-colors cursor-pointer ${
                    selectedWeaponType === t
                      ? 'bg-cyan-500 text-black'
                      : 'bg-[#101e25] text-gray-400 hover:text-white border border-[#20343d]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Element Filters */}
          {(isWeaponPicker || isArmourPicker) && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {elements.map(el => {
                const isSelected = selectedElement === el;
                return (
                  <button
                    key={el}
                    type="button"
                    onClick={() => setSelectedElement(el)}
                    className={`px-2.5 py-1 rounded-md shrink-0 font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a3440] text-cyan-300 border border-cyan-400'
                        : 'bg-[#101e25] text-gray-400 hover:text-white border border-[#20343d]'
                    }`}
                  >
                    {el}
                  </button>
                );
              })}
            </div>
          )}

          {/* Cell Tier Selector (Reforged / Classic only) */}
          {isCellPicker && !isAwakening && (
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Cell Tier:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedCellTier(lvl)}
                    className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                      selectedCellTier === lvl
                        ? 'bg-cyan-500 text-black'
                        : 'bg-[#101e25] text-gray-400 hover:text-white border border-[#20343d]'
                    }`}
                  >
                    +{lvl}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Results List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 modal-scroll">
          {/* Weapons */}
          {isWeaponPicker && (
            filteredWeapons.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">No weapons found matching filters.</div>
            ) : (
              filteredWeapons.map(w => {
                const isEquipped = currentSelectedId === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      onSelect(w.id);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-[#12262e] border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-[#101e25] border-[#203640] hover:border-[#3e6977] hover:bg-[#12222a]'
                    }`}
                  >
                    <span className="w-12 h-12 rounded-lg bg-[#09151a] border border-[#21333d] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {w.icon ? (
                        <img
                          src={resolveAssetUrl(w.icon)}
                          alt={w.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Zap className="h-5 w-5 text-gray-600" />
                      )}
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="flex items-center justify-between gap-1">
                        <strong className="font-display font-bold text-base text-white truncate">
                          {w.name}
                        </strong>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getElementStyle(w.element).bg} ${getElementStyle(w.element).text} ${getElementStyle(w.element).border}`}>
                          {w.element}
                        </span>
                      </span>

                      <span className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <span>{w.typeName}</span>
                        <span>•</span>
                        <span>{w.behemoth}</span>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold font-mono">
                          {powerSurged ? w.maxPower : w.basePower} Power
                        </span>
                      </span>

                      {/* Perks & Sockets */}
                      <span className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {w.perks.map(p => (
                          <em key={p.id} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#0a151b] text-cyan-300 border border-[#21333d] not-italic">
                            +{powerSurged ? p.value : (p.baseValue ?? p.value)} {p.name}
                          </em>
                        ))}
                        {w.cellSockets.map((s, idx) => (
                          <em key={idx} className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#0a151b] text-gray-300 border border-[#21333d] not-italic">
                            {s}
                          </em>
                        ))}
                      </span>

                      {w.uniqueEffect && (
                        <p className="text-[10.5px] text-gray-300 mt-1 italic line-clamp-2">
                          {w.uniqueEffect}
                        </p>
                      )}
                    </span>

                    <span className="self-center shrink-0">
                      {isEquipped ? (
                        <span className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </span>
                  </button>
                );
              })
            )
          )}

          {/* Armour */}
          {isArmourPicker && (
            filteredArmour.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">No armour found matching filters.</div>
            ) : (
              filteredArmour.map(a => {
                const isEquipped = currentSelectedId === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      onSelect(a.id);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-[#12262e] border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-[#101e25] border-[#203640] hover:border-[#3e6977] hover:bg-[#12222a]'
                    }`}
                  >
                    <span className="w-12 h-12 rounded-lg bg-[#09151a] border border-[#21333d] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {a.icon ? (
                        <img
                          src={resolveAssetUrl(a.icon)}
                          alt={a.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Shield className="h-5 w-5 text-gray-600" />
                      )}
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="flex items-center justify-between gap-1">
                        <strong className="font-display font-bold text-base text-white truncate">
                          {a.name}
                        </strong>
                        <span className="text-xs text-gray-400 font-mono font-semibold">
                          {powerSurged ? a.maxResistance : a.baseResistance} Res
                        </span>
                      </span>

                      <span className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <span>{a.behemoth}</span>
                        {a.strength && <span className="text-emerald-400 font-semibold">+{a.strength}</span>}
                        {a.weakness && <span className="text-red-400 font-semibold">-{a.weakness}</span>}
                      </span>

                      <span className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {a.perks.map(p => (
                          <em key={p.id} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#0a151b] text-cyan-300 border border-[#21333d] not-italic">
                            +{isAwakening ? p.value : (powerSurged ? p.value : (p.baseValue ?? p.value))} {p.name}
                          </em>
                        ))}
                        <em className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#0a151b] text-gray-300 border border-[#21333d] not-italic">
                          {isAwakening && a.cellSockets && a.cellSockets.length > 1 ? 'Sockets (2)' : a.cellSocket}
                        </em>
                      </span>
                    </span>

                    <span className="self-center shrink-0">
                      {isEquipped ? (
                        <span className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </span>
                  </button>
                );
              })
            )
          )}

          {/* Cells */}
          {isCellPicker && (
            filteredCells.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">No cells found.</div>
            ) : (
              filteredCells.map(c => {
                const targetSpec = isAwakening ? c.id : `${c.id}:+${selectedCellTier}`;
                const isEquipped = currentSelectedId === targetSpec || (isAwakening && currentSelectedId?.startsWith(c.id));
                const variant = isAwakening
                  ? c.variants[0]
                  : (c.variants.find(v => v.level === selectedCellTier) || c.variants[0]);
                const perkName = variant?.perkName || c.name.replace(/ Cell$/i, '');
                const perkDef = patchData.perks[variant?.perkId || ''];

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelect(targetSpec);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-[#12262e] border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-[#101e25] border-[#203640] hover:border-[#3e6977] hover:bg-[#12222a]'
                    }`}
                  >
                    <span className="w-11 h-11 rounded-lg bg-[#09151a] border border-[#21333d] flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative">
                      <img
                        src={resolveAssetUrl(c.icon || getCellCategoryIcon(c.slot))}
                        alt={c.name}
                        className="w-full h-full object-contain filter drop-shadow"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          const fallback = resolveAssetUrl(getCellCategoryIcon(c.slot));
                          if (img.src !== fallback) {
                            img.src = fallback;
                          }
                        }}
                      />
                      {!isAwakening && (
                        <span className={`absolute -bottom-0.5 -right-0.5 text-[8.5px] font-black px-1 rounded font-mono ${
                          selectedCellTier === 3 ? 'bg-purple-600 text-white' :
                          selectedCellTier === 2 ? 'bg-blue-600 text-white' :
                          'bg-emerald-600 text-white'
                        }`}>
                          +{selectedCellTier}
                        </span>
                      )}
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="flex items-center justify-between gap-1">
                        <strong className="font-display font-bold text-base text-white truncate">
                          {isAwakening ? `${perkName} Cell` : `+${selectedCellTier} ${perkName} Cell`}
                        </strong>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#0a151b] text-gray-300 border border-[#21333d]">
                          {c.slot}
                        </span>
                      </span>

                      {perkDef && (
                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                          {formatPerkEffect(
                            isAwakening
                              ? (perkDef.description || Object.values(perkDef.tiers || {})[0] || '')
                              : (perkDef.tiers[String(selectedCellTier)] || perkDef.description)
                          )}
                        </p>
                      )}
                    </span>

                    <span className="self-center shrink-0">
                      {isEquipped ? (
                        <span className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </span>
                  </button>
                );
              })
            )
          )}

          {/* Lanterns */}
          {isLanternPicker && (
            filteredLanterns.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">No lanterns found.</div>
            ) : (
              filteredLanterns.map(l => {
                const isEquipped = currentSelectedId === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      onSelect(l.id);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-[#12262e] border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-[#101e25] border-[#203640] hover:border-[#3e6977] hover:bg-[#12222a]'
                    }`}
                  >
                    <span className="w-12 h-12 rounded-lg bg-[#09151a] border border-[#21333d] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {l.icon ? (
                        <img
                          src={resolveAssetUrl(l.icon)}
                          alt={l.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Sparkles className="h-5 w-5 text-yellow-400" />
                      )}
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="flex items-center justify-between gap-1">
                        <strong className="font-display font-bold text-base text-white truncate">
                          {l.name}
                        </strong>
                        {isAwakening && l.cooldown && (
                          <span className="text-[10px] font-mono text-cyan-300">
                            CD: {l.cooldown}s
                          </span>
                        )}
                      </span>

                      {isAwakening ? (
                        <div className="mt-1 space-y-1 text-xs">
                          {l.activeName && (
                            <p className="text-[11px] text-amber-300 font-semibold">
                              {l.activeName}: <span className="text-gray-300 font-normal">{l.activeDesc}</span>
                            </p>
                          )}
                          {l.description && (
                            <p className="text-gray-400 text-[10.5px] line-clamp-2">
                              {l.description}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-300 mt-1 line-clamp-2">
                          {l.holdAbility}
                        </p>
                      )}
                    </span>

                    <span className="self-center shrink-0">
                      {isEquipped ? (
                        <span className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </span>
                  </button>
                );
              })
            )
          )}

          {/* Omnicells */}
          {isOmnicellPicker && (
            filteredOmnicells.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">No omnicells found.</div>
            ) : (
              filteredOmnicells.map(o => {
                const isEquipped = currentSelectedId === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      onSelect(o.id);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-[#12262e] border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-[#101e25] border-[#203640] hover:border-[#3e6977] hover:bg-[#12222a]'
                    }`}
                  >
                    <span className="w-12 h-12 rounded-lg bg-[#09151a] border border-[#21333d] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {o.icon ? (
                        <img
                          src={resolveAssetUrl(o.icon)}
                          alt={o.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Zap className="h-5 w-5 text-purple-400" />
                      )}
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="flex items-center justify-between gap-1">
                        <strong className="font-display font-bold text-base text-white truncate">
                          {o.name}
                        </strong>
                        {o.cooldown > 0 && (
                          <span className="text-[10px] font-mono text-gray-400">
                            {o.cooldown}s CD
                          </span>
                        )}
                      </span>

                      <p className="text-[11px] text-gray-300 mt-1 line-clamp-2">
                        <b className="text-cyan-400">Active:</b> {o.active}
                      </p>
                      <p className="text-[10.5px] text-gray-400 mt-0.5 line-clamp-1">
                        <b className="text-purple-400">Passive:</b> {o.passive}
                      </p>
                    </span>

                    <span className="self-center shrink-0">
                      {isEquipped ? (
                        <span className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </span>
                  </button>
                );
              })
            )
          )}
        </div>
      </section>
    </div>
  );
};
