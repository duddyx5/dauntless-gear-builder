import React, { useState, useMemo } from 'react';
import {
  WeaponItem,
  ArmourItem,
  CellItem,
  LanternItem,
  OmnicellItem,
  PatchData,
} from '../types/builder';
import { getElementStyle, getSocketStyle, resolveAssetUrl } from '../utils/theme';
import { Search, X, Trash2, Shield, Zap, Sparkles, Filter } from 'lucide-react';

export type PickerSlotType =
  | 'weapon'
  | 'weaponCell_0'
  | 'weaponCell_1'
  | 'head'
  | 'headCell'
  | 'torso'
  | 'torsoCell'
  | 'arms'
  | 'armsCell'
  | 'legs'
  | 'legsCell'
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
  // If picking a cell, the allowed socket type (e.g. 'brutality')
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
  const isWeaponPicker = slotType === 'weapon';
  const isArmourPicker = ['head', 'torso', 'arms', 'legs'].includes(slotType);
  const isLanternPicker = slotType === 'lantern';
  const isOmnicellPicker = slotType === 'omnicell';

  const titleMap: Record<PickerSlotType, string> = {
    weapon: 'Select Weapon',
    weaponCell_0: 'Select Weapon Cell (Slot 1)',
    weaponCell_1: 'Select Weapon Cell (Slot 2)',
    head: 'Select Head Armour (Helmet)',
    headCell: 'Select Head Cell',
    torso: 'Select Torso Armour (Chest)',
    torsoCell: 'Select Torso Cell',
    arms: 'Select Arms Armour (Gauntlets)',
    armsCell: 'Select Arms Cell',
    legs: 'Select Legs Armour (Greaves)',
    legsCell: 'Select Legs Cell',
    lantern: 'Select Lantern',
    lanternCell: 'Select Lantern Cell',
    omnicell: 'Select Omnicell',
  };

  // Elements filter list
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
    const targetSlot = slotType; // 'head' | 'torso' | 'arms' | 'legs'
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
      // If allowedSocket is specified and not prismatic, prioritize/filter matching sockets
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
      l.holdAbility.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patchData.lanterns, isLanternPicker, searchTerm]);

  // Filtered Omnicells
  const filteredOmnicells = useMemo(() => {
    if (!isOmnicellPicker) return [];
    return patchData.omnicells.filter(o =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.passive.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patchData.omnicells, isOmnicellPicker, searchTerm]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/75 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Container */}
      <div
        className="relative z-10 bg-dauntless-card border border-dauntless-border rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

        {/* Header */}
        <div className="p-4 border-b border-dauntless-border flex items-center justify-between gap-2 shrink-0">
          <div>
            <h3 className="font-display font-bold text-lg text-white tracking-wide">
              {titleMap[slotType]}
            </h3>
            {allowedSocket && allowedSocket.toLowerCase() !== 'prismatic' && (
              <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded bg-gray-800 text-cyan-300 border border-gray-700">
                Socket: {allowedSocket}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentSelectedId && (
              <button
                type="button"
                onClick={() => {
                  onSelect(null);
                  onClose();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                title="Unequip"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Unequip</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Bar + Filters */}
        <div className="p-3 bg-gray-900/60 border-b border-dauntless-border space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, behemoth, perk..."
              className="w-full pl-9 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              autoFocus={false}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Weapons Type Filter */}
          {isWeaponPicker && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {weaponTypes.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedWeaponType(t)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
                    selectedWeaponType === t
                      ? 'bg-cyan-500 text-black font-semibold'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Element Filter for Weapons & Armour */}
          {(isWeaponPicker || isArmourPicker) && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {elements.map(el => {
                const isSelected = selectedElement === el;
                return (
                  <button
                    key={el}
                    type="button"
                    onClick={() => setSelectedElement(el)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                      isSelected
                        ? 'bg-gray-700 text-white font-bold ring-1 ring-cyan-400'
                        : 'bg-gray-800/80 text-gray-400 hover:text-white'
                    }`}
                  >
                    {el}
                  </button>
                );
              })}
            </div>
          )}

          {/* Cell Tier Selector */}
          {isCellPicker && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium">Cell Tier:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedCellTier(lvl)}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      selectedCellTier === lvl
                        ? 'bg-cyan-500 text-black'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    +{lvl}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Item List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-gray-800/40">
          {/* 1. Weapons List */}
          {isWeaponPicker && (
            filteredWeapons.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">No weapons found matching filters.</div>
            ) : (
              filteredWeapons.map(w => {
                const isEquipped = currentSelectedId === w.id;
                const elemStyle = getElementStyle(w.element);
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      onSelect(w.id);
                      onClose();
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isEquipped
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                        : 'bg-gray-800/30 border-gray-800 hover:border-gray-700 hover:bg-gray-800/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {w.icon ? (
                          <img
                            src={resolveAssetUrl(w.icon)}
                            alt={w.name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              // fallback if icon missing
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Zap className="h-6 w-6 text-gray-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-semibold text-sm text-white truncate">
                            {w.name}
                          </h4>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${elemStyle.bg} ${elemStyle.text} ${elemStyle.border}`}>
                            {w.element}
                          </span>
                        </div>

                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{w.typeName}</span>
                          <span>•</span>
                          <span>{w.behemoth}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold">
                            {powerSurged ? w.maxPower : w.basePower} Power
                          </span>
                        </div>

                        {/* Perks & Sockets */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {w.perks.map(p => (
                            <span
                              key={p.id}
                              className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-800 text-cyan-300 border border-gray-700"
                            >
                              +{powerSurged ? p.value : (p.baseValue ?? p.value)} {p.name}
                            </span>
                          ))}
                          {w.cellSockets.map((s, idx) => {
                            const sockStyle = getSocketStyle(s);
                            return (
                              <span
                                key={idx}
                                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${sockStyle.bg} ${sockStyle.text} ${sockStyle.border}`}
                              >
                                {s}
                              </span>
                            );
                          })}
                        </div>

                        {/* Unique Effect */}
                        {w.uniqueEffect && (
                          <p className="text-[11px] text-gray-300/80 mt-1.5 bg-gray-900/50 p-2 rounded-lg border border-gray-800/80 italic leading-snug">
                            {w.uniqueEffect}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}

          {/* 2. Armour List */}
          {isArmourPicker && (
            filteredArmour.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">No armour found matching filters.</div>
            ) : (
              filteredArmour.map(a => {
                const isEquipped = currentSelectedId === a.id;
                const sockStyle = getSocketStyle(a.cellSocket);
                return (
                  <div
                    key={a.id}
                    onClick={() => {
                      onSelect(a.id);
                      onClose();
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isEquipped
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                        : 'bg-gray-800/30 border-gray-800 hover:border-gray-700 hover:bg-gray-800/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {a.icon ? (
                          <img
                            src={resolveAssetUrl(a.icon)}
                            alt={a.name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Shield className="h-6 w-6 text-gray-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-semibold text-sm text-white truncate">
                            {a.name}
                          </h4>
                          <span className="text-xs text-gray-400 font-medium">
                            {powerSurged ? a.maxResistance : a.baseResistance} Res
                          </span>
                        </div>

                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{a.behemoth}</span>
                          {a.strength && (
                            <span className="text-emerald-400">+{a.strength}</span>
                          )}
                          {a.weakness && (
                            <span className="text-red-400">-{a.weakness}</span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {a.perks.map(p => (
                            <span
                              key={p.id}
                              className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-800 text-cyan-300 border border-gray-700"
                            >
                              +{powerSurged ? p.value : (p.baseValue ?? p.value)} {p.name}
                            </span>
                          ))}
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${sockStyle.bg} ${sockStyle.text} ${sockStyle.border}`}
                          >
                            {a.cellSocket}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}

          {/* 3. Cells List */}
          {isCellPicker && (
            filteredCells.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">No cells found.</div>
            ) : (
              filteredCells.map(c => {
                const targetSpec = `${c.id}:+${selectedCellTier}`;
                const isEquipped = currentSelectedId === targetSpec;
                const sockStyle = getSocketStyle(c.slot);
                const variant = c.variants.find(v => v.level === selectedCellTier) || c.variants[0];
                const perkName = variant?.perkName || c.name.replace(/ Cell$/i, '');
                const perkDef = patchData.perks[variant?.perkId || ''];

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelect(targetSpec);
                      onClose();
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isEquipped
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                        : 'bg-gray-800/30 border-gray-800 hover:border-gray-700 hover:bg-gray-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {c.icon ? (
                          <img
                            src={resolveAssetUrl(c.icon)}
                            alt={c.name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Sparkles className="h-5 w-5 text-gray-500" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-semibold text-sm text-white truncate">
                            +{selectedCellTier} {perkName} Cell
                          </h4>
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${sockStyle.bg} ${sockStyle.text} ${sockStyle.border}`}
                          >
                            {c.slot}
                          </span>
                        </div>

                        {perkDef && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {perkDef.tiers[String(selectedCellTier)] || perkDef.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}

          {/* 4. Lanterns List */}
          {isLanternPicker && (
            filteredLanterns.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">No lanterns found.</div>
            ) : (
              filteredLanterns.map(l => {
                const isEquipped = currentSelectedId === l.id;
                const sockStyle = getSocketStyle(l.cellSocket);
                return (
                  <div
                    key={l.id}
                    onClick={() => {
                      onSelect(l.id);
                      onClose();
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isEquipped
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                        : 'bg-gray-800/30 border-gray-800 hover:border-gray-700 hover:bg-gray-800/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {l.icon ? (
                          <img
                            src={resolveAssetUrl(l.icon)}
                            alt={l.name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Sparkles className="h-6 w-6 text-yellow-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-semibold text-sm text-white truncate">
                            {l.name}
                          </h4>
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${sockStyle.bg} ${sockStyle.text} ${sockStyle.border}`}
                          >
                            {l.cellSocket}
                          </span>
                        </div>

                        <p className="text-xs text-gray-300 mt-1 leading-snug">
                          {l.holdAbility}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}

          {/* 5. Omnicells List */}
          {isOmnicellPicker && (
            filteredOmnicells.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">No omnicells found for this patch.</div>
            ) : (
              filteredOmnicells.map(o => {
                const isEquipped = currentSelectedId === o.id;
                return (
                  <div
                    key={o.id}
                    onClick={() => {
                      onSelect(o.id);
                      onClose();
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isEquipped
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                        : 'bg-gray-800/30 border-gray-800 hover:border-gray-700 hover:bg-gray-800/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {o.icon ? (
                          <img
                            src={resolveAssetUrl(o.icon)}
                            alt={o.name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Zap className="h-6 w-6 text-purple-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-semibold text-sm text-white truncate">
                            {o.name}
                          </h4>
                          {o.cooldown > 0 && (
                            <span className="text-[10px] font-bold text-gray-400">
                              {o.cooldown}s CD
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                          <span className="text-cyan-400 font-semibold">Active:</span> {o.active}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                          <span className="text-amber-400 font-semibold">Passive:</span> {o.passive}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
};
