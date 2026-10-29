import {
  BuildState,
  PatchData,
  BuildStats,
  CalculatedPerk,
  PerkSource,
  WeaponItem,
  ArmourItem,
  CellItem,
  LanternItem,
  OmnicellItem,
} from '../types/builder';

export const DEFAULT_BUILD: BuildState = {
  version: '1.14.7',
  weapon: 'inferno_s_razor',
  weaponCells: ['overpower_cell:+3', 'ragehunter_cell:+3'],
  head: 'hellplate_casque',
  headCell: 'molten_cell:+3',
  torso: 'hellplate_cuirass',
  torsoCell: 'predator_cell:+3',
  arms: 'malkarion_s_grasp',
  armsCell: 'pulse_cell:+3',
  legs: 'thrax_s_guile',
  legsCell: 'catalyst_cell:+3',
  lantern: 'drask_s_eye',
  lanternCell: 'conduit_cell:+3',
  omnicell: 'discipline',
  powerSurged: true,
};

export interface PresetBuildItem {
  name: string;
  description: string;
  version: string;
  era: string;
  tags: string[];
  build: BuildState;
}

export const PRESET_BUILDS: PresetBuildItem[] = [
  // ---------------------------------------------------------
  // PATCH 1.6.2 (Classic Escalation)
  // ---------------------------------------------------------
  {
    name: '1.6.2 Classic Low-Life Crit (Sword)',
    description: 'Classic meta low-life build using Discipline, Iceborne, Rage & Wild Frenzy for constant 50% HP high DPS.',
    version: '1.6.2',
    era: 'Classic Escalation',
    tags: ['Sword', 'Blaze', 'Low-Life', 'Crit'],
    build: {
      version: '1.6.2',
      weapon: 'inferno_s_razor',
      weaponCells: ['overpower_cell:+3', 'ragehunter_cell:+3'],
      head: 'hellplate_casque',
      headCell: 'discipline_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'iceborne_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'predator_cell:+3',
      legs: 'hellplate_greaves',
      legsCell: 'rage_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: true,
    }
  },
  {
    name: '1.6.2 Hellion Stagger Hammer',
    description: 'High-impact stagger build with Skullforge stamina shield, Overpower +6, and heavy blunt damage.',
    version: '1.6.2',
    era: 'Classic Escalation',
    tags: ['Hammer', 'Blaze', 'Stagger'],
    build: {
      version: '1.6.2',
      weapon: 'inferno_s_burden',
      weaponCells: ['knockout_king_cell:+3', 'overpower_cell:+3'],
      head: 'the_skullforge',
      headCell: 'ragehunter_cell:+3',
      torso: 'hellplate_cuirass',
      torsoCell: 'molten_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'overpower_cell:+3',
      legs: 'hellplate_greaves',
      legsCell: 'iceborne_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: true,
    }
  },

  // ---------------------------------------------------------
  // PATCH 1.12.0 (Reforged Mid-Era)
  // ---------------------------------------------------------
  {
    name: '1.12.0 Bastion Shield Tank (Axe)',
    description: 'Enormous shield stack build with Bastion omnicell, Galvanized crit chance, Tenacious, and Skarn defiance.',
    version: '1.12.0',
    era: 'Reforged Mid-Era',
    tags: ['Axe', 'Frost', 'Shields', 'Tank'],
    build: {
      version: '1.12.0',
      weapon: 'onus_of_boreus',
      weaponCells: ['tenacious_cell:+3', 'tough_cell:+3'],
      head: 'sight_of_stone',
      headCell: 'tough_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'aegis_cell:+3',
      arms: 'might_of_stone',
      armsCell: 'galvanized_cell:+3',
      legs: 'boreal_march',
      legsCell: 'tenacious_cell:+3',
      lantern: 'skarn_s_defiance',
      lanternCell: 'cascade_cell:+3',
      omnicell: 'bastion',
      powerSurged: true,
    }
  },
  {
    name: '1.12.0 Tempest Shock War Pike',
    description: 'High-speed wound damage build combining Tempest speed bonuses, Savagery, and Sahvyt pulse crits.',
    version: '1.12.0',
    era: 'Reforged Mid-Era',
    tags: ['War Pike', 'Shock', 'Wound', 'Speed'],
    build: {
      version: '1.12.0',
      weapon: 'the_conductor',
      weaponCells: ['savagery_cell:+3', 'relentless_cell:+3'],
      head: 'bladed_mask',
      headCell: 'pulse_cell:+3',
      torso: 'bladed_jacket',
      torsoCell: 'adrenaline_cell:+3',
      arms: 'bladed_gloves',
      armsCell: 'endurance_cell:+3',
      legs: 'bladed_boots',
      legsCell: 'catalyst_cell:+3',
      lantern: 'embermane_s_rapture',
      lanternCell: 'catalyst_cell:+3',
      omnicell: 'tempest',
      powerSurged: true,
    }
  },

  // ---------------------------------------------------------
  // PATCH 1.14.7 (Reforged Final)
  // ---------------------------------------------------------
  {
    name: '1.14.7 Inferno Overpower Meta (Sword)',
    description: 'Top-tier stagger DPS build: +6 Overpower, +6 Ragehunter, +6 Predator, and Discipline omnicell parry.',
    version: '1.14.7',
    era: 'Reforged Final',
    tags: ['Sword', 'Blaze', 'DPS Meta', 'Stagger'],
    build: {
      version: '1.14.7',
      weapon: 'inferno_s_razor',
      weaponCells: ['overpower_cell:+3', 'ragehunter_cell:+3'],
      head: 'hellplate_casque',
      headCell: 'molten_cell:+3',
      torso: 'hellplate_cuirass',
      torsoCell: 'predator_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'pulse_cell:+3',
      legs: 'thrax_s_guile',
      legsCell: 'catalyst_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: 'discipline',
      powerSurged: true,
    }
  },
  {
    name: '1.14.7 Iceborne Immortal (Axe)',
    description: 'High-sustain lifesteal build using Iceborne omnicell, Tough, and Tenacious for reliable Escalation clears.',
    version: '1.14.7',
    era: 'Reforged Final',
    tags: ['Axe', 'Frost', 'Sustain', 'Escalation'],
    build: {
      version: '1.14.7',
      weapon: 'onus_of_boreus',
      weaponCells: ['tough_cell:+3', 'tenacious_cell:+3'],
      head: 'sight_of_stone',
      headCell: 'tough_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'rage_cell:+3',
      arms: 'might_of_stone',
      armsCell: 'overpower_cell:+3',
      legs: 'boreal_march',
      legsCell: 'tenacious_cell:+3',
      lantern: 'skarn_s_defiance',
      lanternCell: 'cascade_cell:+3',
      omnicell: 'iceborne',
      powerSurged: true,
    }
  },
  {
    name: '1.14.7 Revenant Hyper-Crit (Chain Blades)',
    description: 'Aggressive Umbral burst build: Void orbs, high crit scaling with Pulse & Predator, and Timeweave synergy.',
    version: '1.14.7',
    era: 'Reforged Final',
    tags: ['Chain Blades', 'Umbral', 'Crit', 'Burst'],
    build: {
      version: '1.14.7',
      weapon: 'stalker_s_trap',
      weaponCells: ['predator_cell:+3', 'cunning_cell:+3'],
      head: 'dark_watch',
      headCell: 'rage_cell:+3',
      torso: 'timeweave_robes',
      torsoCell: 'pulse_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'catalyst_cell:+3',
      legs: 'thrax_s_guile',
      legsCell: 'catalyst_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: 'revenant',
      powerSurged: true,
    }
  },

  // ---------------------------------------------------------
  // PATCH 2.1.1 (Awakening)
  // ---------------------------------------------------------
  {
    name: '2.1.1 Awakening Bastion Nova (Silver Sword)',
    description: 'Awakening meta: legendary Silver Sword with Ardent Cyclone and Bastion Shield Nova ground slam.',
    version: '2.1.1',
    era: 'Awakening',
    tags: ['Sword', 'Frost', 'Awakening', 'Talents'],
    build: {
      version: '2.1.1',
      weapon: 'the_silver_sword',
      weaponCells: [],
      head: null,
      headCell: null,
      torso: null,
      torsoCell: null,
      arms: null,
      armsCell: null,
      legs: null,
      legsCell: null,
      lantern: 'bastion',
      lanternCell: null,
      omnicell: null,
      powerSurged: true,
    }
  }
];

export function parseCellSpec(cellSpec: string | null, cellsList: CellItem[]): { cell: CellItem | null; variantLevel: number; perkId: string; perkName: string; perkValue: number } | null {
  if (!cellSpec) return null;
  const [cellId, levelStr] = cellSpec.split(':');
  const level = parseInt(levelStr?.replace('+', '') || '3', 10);
  const cell = cellsList.find(c => c.id === cellId) || null;
  if (!cell) {
    const found = cellsList.find(c => c.id.includes(cellId) || c.name.toLowerCase().includes(cellId.replace(/_/g, ' ')));
    if (!found) return null;
    const variant = found.variants.find(v => v.level === level) || found.variants[found.variants.length - 1];
    return {
      cell: found,
      variantLevel: variant ? variant.level : 3,
      perkId: variant ? variant.perkId : found.id.replace(/_cell$/, ''),
      perkName: variant ? variant.perkName : found.name.replace(/ Cell$/, ''),
      perkValue: variant ? variant.perkValue : 3,
    };
  }
  const variant = cell.variants.find(v => v.level === level) || cell.variants[cell.variants.length - 1];
  return {
    cell,
    variantLevel: variant ? variant.level : 3,
    perkId: variant ? variant.perkId : cell.id.replace(/_cell$/, ''),
    perkName: variant ? variant.perkName : cell.name.replace(/ Cell$/, ''),
    perkValue: variant ? variant.perkValue : 3,
  };
}

export function calculateBuildStats(build: BuildState, data: PatchData): BuildStats {
  const isSurged = build.powerSurged;
  let totalPower = 0;
  let totalResistance = 0;
  let element = 'Neutral';
  const strengthsSet = new Set<string>();
  const weaknessesSet = new Set<string>();

  const perkMap: Record<string, { total: number; sources: PerkSource[]; name: string }> = {};

  function addPerkPoint(perkId: string, perkName: string, value: number, sourceName: string, slot: string) {
    if (!perkId || value <= 0) return;
    const key = perkId.toLowerCase().trim();
    if (!perkMap[key]) {
      perkMap[key] = {
        total: 0,
        sources: [],
        name: perkName || perkId
      };
    }
    perkMap[key].total += value;
    perkMap[key].sources.push({ sourceName, slot, value });
  }

  // 1. Weapon
  const weapon = data.weapons.find(w => w.id === build.weapon);
  if (weapon) {
    totalPower += isSurged ? weapon.maxPower : weapon.basePower;
    element = weapon.element;
    if (weapon.perks) {
      weapon.perks.forEach(p => {
        const val = isSurged ? p.value : (p.baseValue ?? p.value);
        addPerkPoint(p.id, p.name, val, weapon.name, 'Weapon');
      });
    }
  }

  // Weapon Cells
  if (build.weaponCells && Array.isArray(build.weaponCells)) {
    build.weaponCells.forEach((spec, idx) => {
      const parsed = parseCellSpec(spec, data.cells);
      if (parsed) {
        addPerkPoint(parsed.perkId, parsed.perkName, parsed.perkValue, parsed.cell?.name || spec || '', `Weapon Cell ${idx + 1}`);
      }
    });
  }

  // 2. Armour pieces
  const slots: ('head' | 'torso' | 'arms' | 'legs')[] = ['head', 'torso', 'arms', 'legs'];
  for (const s of slots) {
    const armourId = build[s];
    const cellSpec = s === 'head' ? build.headCell : s === 'torso' ? build.torsoCell : s === 'arms' ? build.armsCell : build.legsCell;
    const armour = data.armour.find(a => a.id === armourId);

    if (armour) {
      totalResistance += isSurged ? armour.maxResistance : armour.baseResistance;
      if (armour.strength) strengthsSet.add(armour.strength);
      if (armour.weakness) weaknessesSet.add(armour.weakness);

      if (armour.perks) {
        armour.perks.forEach(p => {
          const val = isSurged ? p.value : (p.baseValue ?? p.value);
          addPerkPoint(p.id, p.name, val, armour.name, armour.slotName || s);
        });
      }
    }

    if (cellSpec) {
      const parsed = parseCellSpec(cellSpec, data.cells);
      if (parsed) {
        addPerkPoint(parsed.perkId, parsed.perkName, parsed.perkValue, parsed.cell?.name || cellSpec, `${s.charAt(0).toUpperCase() + s.slice(1)} Cell`);
      }
    }
  }

  // 3. Lantern
  const lantern = data.lanterns.find(l => l.id === build.lantern);
  if (build.lanternCell) {
    const parsed = parseCellSpec(build.lanternCell, data.cells);
    if (parsed) {
      addPerkPoint(parsed.perkId, parsed.perkName, parsed.perkValue, parsed.cell?.name || build.lanternCell, 'Lantern Cell');
    }
  }

  // 4. Transform accumulated perks
  const calculatedPerks: CalculatedPerk[] = Object.entries(perkMap).map(([pId, entry]) => {
    const perkDef = data.perks[pId] || Object.values(data.perks).find(p => p.id === pId || p.name.toLowerCase() === entry.name.toLowerCase());
    const totalValue = entry.total;
    const cappedValue = Math.min(totalValue, 6);
    const isOvercapped = totalValue > 6;
    const tiers = perkDef?.tiers || {};
    const currentTierDesc = tiers[String(cappedValue)] || perkDef?.description || `+${cappedValue} Points`;

    return {
      perkId: pId,
      name: perkDef?.name || entry.name,
      totalValue,
      cappedValue,
      isOvercapped,
      type: perkDef?.type || 'General',
      icon: perkDef?.icon || `/assets/icons/perks/${entry.name.replace(/\s+/g, '')}.png`,
      description: perkDef?.description || '',
      currentTierDescription: currentTierDesc,
      tiers,
      sources: entry.sources,
    };
  });

  calculatedPerks.sort((a, b) => {
    if (b.cappedValue !== a.cappedValue) {
      return b.cappedValue - a.cappedValue;
    }
    return b.totalValue - a.totalValue;
  });

  return {
    totalPower,
    totalResistance,
    element,
    strengths: Array.from(strengthsSet),
    weaknesses: Array.from(weaknessesSet),
    perks: calculatedPerks,
  };
}

export function encodeBuildToHash(build: BuildState): string {
  try {
    const compact = {
      v: build.version,
      w: build.weapon || '',
      wc: build.weaponCells.filter(Boolean),
      h: build.head || '',
      hc: build.headCell || '',
      t: build.torso || '',
      tc: build.torsoCell || '',
      a: build.arms || '',
      ac: build.armsCell || '',
      l: build.legs || '',
      lc: build.legsCell || '',
      lt: build.lantern || '',
      ltc: build.lanternCell || '',
      o: build.omnicell || '',
      ps: build.powerSurged ? 1 : 0,
    };
    const json = JSON.stringify(compact);
    return encodeURIComponent(btoa(json));
  } catch (err) {
    console.error('Failed to encode build:', err);
    return '';
  }
}

export function decodeBuildFromHash(hashStr: string): Partial<BuildState> | null {
  try {
    if (!hashStr) return null;
    const clean = hashStr.startsWith('#') ? hashStr.slice(1) : hashStr;
    const params = new URLSearchParams(clean);
    const code = params.get('b') || clean;
    if (!code) return null;
    const json = atob(decodeURIComponent(code));
    const compact = JSON.parse(json);

    return {
      version: compact.v || '1.14.7',
      weapon: compact.w || null,
      weaponCells: compact.wc || [],
      head: compact.h || null,
      headCell: compact.hc || null,
      torso: compact.t || null,
      torsoCell: compact.tc || null,
      arms: compact.a || null,
      armsCell: compact.ac || null,
      legs: compact.l || null,
      legsCell: compact.lc || null,
      lantern: compact.lt || null,
      lanternCell: compact.ltc || null,
      omnicell: compact.o || null,
      powerSurged: compact.ps !== 0,
    };
  } catch (err) {
    console.warn('Could not decode build string:', err);
    return null;
  }
}
