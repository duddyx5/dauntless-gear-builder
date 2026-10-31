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

export const createEmptyBuild = (version: string = '1.14.7'): BuildState => ({
  version,
  weapon: null,
  bondedWeapon: null,
  secondaryWeapon: null,
  gearLevels: {
    weapon: 20,
    secondaryWeapon: 20,
    head: 20,
    torso: 20,
    arms: 20,
    legs: 20,
  },
  weaponTalents: [0, 0, 0, 0, 0, 0, 0],
  secondaryWeaponTalents: [0, 0, 0, 0, 0, 0, 0],
  weaponCells: [null, null],
  head: null,
  headCell: null,
  torso: null,
  torsoCell: null,
  torsoCell2: null,
  arms: null,
  armsCell: null,
  legs: null,
  legsCell: null,
  legsCell2: null,
  lantern: null,
  lanternCell: null,
  omnicell: null,
  powerSurged: true,
});

export const DEFAULT_BUILD: BuildState = {
  version: '1.14.7',
  weapon: 'inferno_s_razor',
  bondedWeapon: null,
  secondaryWeapon: null,
  gearLevels: {
    weapon: 20,
    secondaryWeapon: 20,
    head: 20,
    torso: 20,
    arms: 20,
    legs: 20,
  },
  weaponCells: ['overpower_cell:+3', 'ragehunter_cell:+3'],
  head: 'hellplate_casque',
  headCell: 'molten_cell:+3',
  torso: 'hellplate_cuirass',
  torsoCell: 'predator_cell:+3',
  torsoCell2: null,
  arms: 'malkarion_s_grasp',
  armsCell: 'pulse_cell:+3',
  legs: 'thrax_s_guile',
  legsCell: 'catalyst_cell:+3',
  legsCell2: null,
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
  // PATCH 1.4.4 (Classic / Pre-Reforged)
  // ---------------------------------------------------------
  {
    name: '1.4.4 Classic Low-Life Iceborne (Sword)',
    description: 'Pre-Reforged +15 legacy meta build combining Discipline, Iceborne, Rage & Wild Frenzy for constant 50% HP high DPS.',
    version: '1.4.4',
    era: 'Classic (Pre-Reforged)',
    tags: ['Sword', 'Blaze', 'Low-Life', 'Classic'],
    build: {
      version: '1.4.4',
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
      powerSurged: false,
    }
  },
  {
    name: '1.4.4 Skullforge Stagger Hammer',
    description: 'Classic stamina shield build with The Skullforge, Overpower +6, and heavy blunt damage at max +15 upgrade.',
    version: '1.4.4',
    era: 'Classic (Pre-Reforged)',
    tags: ['Hammer', 'Blaze', 'Stagger', 'Classic'],
    build: {
      version: '1.4.4',
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
      powerSurged: false,
    }
  },

  // ---------------------------------------------------------
  // PATCH 1.6.2 (Early Reforged)
  // ---------------------------------------------------------
  {
    name: '1.6.2 Early Reforged Low-Life Crit (Sword)',
    description: 'Early Reforged meta low-life build using Power Surged gear, Discipline, Iceborne, Rage & Wild Frenzy for constant 50% HP high DPS.',
    version: '1.6.2',
    era: 'Early Reforged',
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
    era: 'Early Reforged',
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
      bondedWeapon: 'sahvyt_s_javelin',
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
    name: '2.1.1 Alluring Moons / Bane & Balm Build',
    description: 'Awakening meta: Alluring Moons & Bane & Balm, Discipline Core, Inertia 7/7, Strategist 7/4, Warmth 4/4, +75 Frost / +25 Radiant defense.',
    version: '2.1.1',
    era: 'Awakening',
    tags: ['Dual Weapons', 'Umbral', 'Terra', 'Awakening', 'Discipline'],
    build: {
      version: '2.1.1',
      weapon: 'alluring_moons',
      secondaryWeapon: 'bane_balm',
      gearLevels: { weapon: 20, secondaryWeapon: 20, head: 20, torso: 20, arms: 20, legs: 20 },
      weaponCells: [],
      head: 'adversary_s_guile',
      headCell: null,
      torso: 'adversary_s_pride',
      torsoCell: 'overpower_cell',
      torsoCell2: 'overpower_cell',
      arms: 'adversary_s_wrath',
      armsCell: null,
      legs: 'greaves_of_valour',
      legsCell: null,
      legsCell2: null,
      lantern: 'discipline',
      lanternCell: null,
      omnicell: null,
      powerSurged: false,
    }
  },
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
      powerSurged: false,
    }
  }
];

export function parseCellSpec(cellSpec: string | null, cellsList: CellItem[]): { cell: CellItem | null; variantLevel: number; perkId: string; perkName: string; perkValue: number } | null {
  if (!cellSpec) return null;
  const [cellId, levelStr] = cellSpec.split(':');
  const level = levelStr ? parseInt(levelStr.replace('+', ''), 10) : 1;
  const cell = cellsList.find(c => c.id === cellId) || null;
  if (!cell) {
    const found = cellsList.find(c => c.id.includes(cellId) || c.name.toLowerCase().includes(cellId.replace(/_/g, ' ')));
    if (!found) return null;
    const variant = found.variants.find(v => v.level === level) || found.variants[found.variants.length - 1];
    return {
      cell: found,
      variantLevel: variant ? variant.level : 1,
      perkId: variant ? variant.perkId : found.id.replace(/_cell$/, ''),
      perkName: variant ? variant.perkName : found.name.replace(/ Cell$/, ''),
      perkValue: variant ? variant.perkValue : 1,
    };
  }
  const variant = cell.variants.find(v => v.level === level) || cell.variants[cell.variants.length - 1];
  return {
    cell,
    variantLevel: variant ? variant.level : 1,
    perkId: variant ? variant.perkId : cell.id.replace(/_cell$/, ''),
    perkName: variant ? variant.perkName : cell.name.replace(/ Cell$/, ''),
    perkValue: variant ? variant.perkValue : 1,
  };
}

export function formatPerkEffect(desc: unknown): string {
  if (!desc) return '';
  if (Array.isArray(desc)) {
    return desc
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .join('. ');
  }
  return String(desc);
}

export function calculateBuildStats(build: BuildState, data: PatchData): BuildStats {
  const isAwakening = data.version === '2.1.1';
  const isClassic = data.version === '1.4.4';
  const isSurged = isClassic ? true : build.powerSurged;
  let totalPower = 0;
  let totalResistance = 0;
  let element = 'Neutral';
  const strengthsSet = new Set<string>();
  const weaknessesSet = new Set<string>();

  const perkMap: Record<string, { total: number; sources: PerkSource[]; name: string }> = {};
  const talentStats: Record<string, number> = {};

  function addTalentStat(stat: string, val: number) {
    if (!stat || val <= 0) return;
    const key = stat.toLowerCase().trim();
    talentStats[key] = (talentStats[key] || 0) + val;
  }

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

  // 1. Primary Weapon
  const weapon = data.weapons.find(w => w.id === build.weapon);
  if (weapon) {
    if (isAwakening) {
      const lvl = Math.max(build.gearLevels?.weapon ?? 20, build.secondaryWeapon ? (build.gearLevels?.secondaryWeapon ?? 20) : 0);
      const power = weapon.basePower + Math.round((weapon.maxPower - weapon.basePower) * ((lvl - 1) / 19));
      totalPower = power;
    } else {
      totalPower += isSurged ? weapon.maxPower : weapon.basePower;
    }
    element = weapon.element;
    if (weapon.perks) {
      weapon.perks.forEach(p => {
        const val = isAwakening ? p.value : (isSurged ? p.value : (p.baseValue ?? p.value));
        addPerkPoint(p.id, p.name, val, weapon.name, 'Primary Weapon');
      });
    }

    // Legendary Weapon Bonding (Available in all versions except Awakening 2.1.1)
    if (!isAwakening && weapon.isLegendary && build.bondedWeapon) {
      const bondedWeapon = data.weapons.find(w => w.id === build.bondedWeapon);
      if (bondedWeapon && bondedWeapon.perks) {
        bondedWeapon.perks.forEach(p => {
          const val = isSurged ? p.value : (p.baseValue ?? p.value);
          addPerkPoint(p.id, p.name, val, `${bondedWeapon.name} (Bond)`, 'Bonded Weapon');
        });
      }
    }

    // Awakening Weapon Talents stats
    if (isAwakening && weapon.talents) {
      const chosenIndices = build.weaponTalents || [0, 0, 0, 0, 0];
      weapon.talents.forEach((tier, tIdx) => {
        const optIdx = chosenIndices[tIdx] ?? 0;
        const opt = tier.options[optIdx];
        if (opt && opt.stat) {
          addTalentStat(opt.stat, (opt as any).value ?? 1);
        }
      });
    }
  }

  // Secondary Weapon (Awakening Dual Weapons)
  if (isAwakening && build.secondaryWeapon) {
    const secWeapon = data.weapons.find(w => w.id === build.secondaryWeapon);
    if (secWeapon) {
      if (secWeapon.perks) {
        secWeapon.perks.forEach(p => {
          addPerkPoint(p.id, p.name, p.value, secWeapon.name, 'Secondary Weapon');
        });
      }

      // Secondary Weapon Talents stats
      if (secWeapon.talents) {
        const chosenIndices = build.secondaryWeaponTalents || [0, 0, 0, 0, 0];
        secWeapon.talents.forEach((tier, tIdx) => {
          const optIdx = chosenIndices[tIdx] ?? 0;
          const opt = tier.options[optIdx];
          if (opt && opt.stat) {
            addTalentStat(opt.stat, (opt as any).value ?? 1);
          }
        });
      }
    }
  }

  // Weapon Cells (Reforged / Classic)
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
    const cellSpecs = s === 'head'
      ? [build.headCell]
      : s === 'torso'
        ? [build.torsoCell, isAwakening ? (build.torsoCell2 || null) : null]
        : s === 'arms'
          ? [build.armsCell]
          : [build.legsCell, isAwakening ? (build.legsCell2 || null) : null];
    const armour = data.armour.find(a => a.id === armourId);

    if (armour) {
      if (isAwakening) {
        const lvl = build.gearLevels?.[s] ?? 20;
        const res = armour.baseResistance + Math.round((armour.maxResistance - armour.baseResistance) * ((lvl - 1) / 19));
        totalResistance += res;
      } else {
        totalResistance += isSurged ? armour.maxResistance : armour.baseResistance;
      }
      if (armour.strength) strengthsSet.add(armour.strength);
      if (armour.weakness) weaknessesSet.add(armour.weakness);

      if (isAwakening && armour.stats && armour.stats.length > 0) {
        const lvl = build.gearLevels?.[s] ?? 20;
        const matchingStat = armour.stats
          .filter(st => st.min_level <= lvl)
          .reduce((prev, curr) => (prev.min_level < curr.min_level ? curr : prev), armour.stats[0]);
        if (matchingStat && matchingStat.perks) {
          Object.entries(matchingStat.perks).forEach(([pId, val]) => {
            const perkDef = data.perks[pId] || Object.values(data.perks).find(p => p.id === pId);
            addPerkPoint(pId, perkDef?.name || pId, val, armour.name, armour.slotName || s);
          });
        }
      } else if (armour.perks) {
        armour.perks.forEach(p => {
          const val = isAwakening ? p.value : (isSurged ? p.value : (p.baseValue ?? p.value));
          addPerkPoint(p.id, p.name, val, armour.name, armour.slotName || s);
        });
      }
    }

    cellSpecs.forEach((cellSpec, cIdx) => {
      if (cellSpec) {
        const parsed = parseCellSpec(cellSpec, data.cells);
        if (parsed) {
          const slotLabel = isAwakening && (s === 'torso' || s === 'legs')
            ? `${s.charAt(0).toUpperCase() + s.slice(1)} Cell ${cIdx + 1}`
            : `${s.charAt(0).toUpperCase() + s.slice(1)} Cell`;
          addPerkPoint(parsed.perkId, parsed.perkName, parsed.perkValue, parsed.cell?.name || cellSpec, slotLabel);
        }
      }
    });
  }

  // 3. Lantern (Only has cell socket in Reforged / Classic; in Awakening 2.1.1 lanterns do not have cell sockets)
  if (!isAwakening && build.lanternCell) {
    const parsed = parseCellSpec(build.lanternCell, data.cells);
    if (parsed) {
      addPerkPoint(parsed.perkId, parsed.perkName, parsed.perkValue, parsed.cell?.name || build.lanternCell, 'Lantern Cell');
    }
  }

  // 4. Transform accumulated perks
  const calculatedPerks: CalculatedPerk[] = Object.entries(perkMap).map(([pId, entry]) => {
    const perkDef = data.perks[pId] || Object.values(data.perks).find(p => p.id === pId || p.name.toLowerCase() === entry.name.toLowerCase());
    const totalValue = entry.total;
    const threshold = (perkDef as any)?.threshold ?? 6;
    const isActive = isAwakening ? totalValue >= threshold : true;
    const cappedValue = isAwakening ? totalValue : Math.min(totalValue, 6);
    const isOvercapped = !isAwakening && totalValue > 6;
    const tiers = perkDef?.tiers || {};
    const rawTierDesc = isAwakening
      ? (perkDef?.description || (typeof tiers === 'object' ? Object.values(tiers)[0] : '') || '')
      : (tiers[String(cappedValue)] || perkDef?.description || `+${cappedValue} Points`);
    const currentTierDesc = formatPerkEffect(rawTierDesc);

    return {
      perkId: pId,
      name: perkDef?.name || entry.name,
      totalValue,
      cappedValue,
      isOvercapped,
      threshold,
      isActive,
      type: perkDef?.type || 'General',
      icon: perkDef?.icon || `/assets/icons/perks/${entry.name.replace(/\s+/g, '')}.png`,
      description: perkDef?.description || '',
      currentTierDescription: currentTierDesc,
      tiers,
      sources: entry.sources,
    };
  });

  calculatedPerks.sort((a, b) => {
    if (isAwakening) {
      const aAct = a.isActive ? 1 : 0;
      const bAct = b.isActive ? 1 : 0;
      if (bAct !== aAct) return bAct - aAct;
      return b.totalValue - a.totalValue;
    }
    if (b.cappedValue !== a.cappedValue) {
      return b.cappedValue - a.cappedValue;
    }
    return b.totalValue - a.totalValue;
  });

  const elementalResistances: { element: string; value: number }[] = [];
  if (isAwakening) {
    const oppositesMap: Record<string, string> = {
      blaze: 'frost',
      frost: 'blaze',
      shock: 'terra',
      terra: 'shock',
      radiant: 'umbral',
      umbral: 'radiant',
    };
    const elementTotals: Record<string, number> = {};
    for (const s of slots) {
      const armourId = build[s];
      const armour = data.armour.find(a => a.id === armourId);
      if (armour && armour.strength) {
        const el = armour.strength.toLowerCase();
        const opp = oppositesMap[el];
        elementTotals[el] = (elementTotals[el] || 0) + 25;
        if (opp) {
          elementTotals[opp] = (elementTotals[opp] || 0) - 25;
        }
      }
    }
    Object.entries(elementTotals).forEach(([el, val]) => {
      if (val > 0) {
        elementalResistances.push({
          element: el.charAt(0).toUpperCase() + el.slice(1),
          value: val,
        });
      }
    });
    elementalResistances.sort((a, b) => b.value - a.value);
  }

  return {
    totalPower: Math.round(totalPower),
    totalResistance: Math.round(totalResistance),
    element,
    strengths: Array.from(strengthsSet),
    weaknesses: Array.from(weaknessesSet),
    perks: calculatedPerks,
    elementalResistances,
    talentStats,
  };
}

export function encodeBuildToHash(build: BuildState): string {
  try {
    const compact: Record<string, any> = {
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
    if (build.bondedWeapon) compact.bw = build.bondedWeapon;
    if (build.secondaryWeapon) compact.w2 = build.secondaryWeapon;
    if (build.gearLevels) compact.gl = build.gearLevels;
    if (build.weaponTalents) compact.wt = build.weaponTalents;
    if (build.secondaryWeaponTalents) compact.w2t = build.secondaryWeaponTalents;
    if (build.torsoCell2) compact.tc2 = build.torsoCell2;
    if (build.legsCell2) compact.lc2 = build.legsCell2;
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
      bondedWeapon: compact.bw || null,
      secondaryWeapon: compact.w2 || null,
      weaponTalents: compact.wt || [0, 0, 0, 0, 0],
      secondaryWeaponTalents: compact.w2t || [0, 0, 0, 0, 0],
      gearLevels: compact.gl || {
        weapon: 20,
        secondaryWeapon: 20,
        head: 20,
        torso: 20,
        arms: 20,
        legs: 20,
      },
      weaponCells: compact.wc || [],
      head: compact.h || null,
      headCell: compact.hc || null,
      torso: compact.t || null,
      torsoCell: compact.tc || null,
      torsoCell2: compact.tc2 || null,
      arms: compact.a || null,
      armsCell: compact.ac || null,
      legs: compact.l || null,
      legsCell: compact.lc || null,
      legsCell2: compact.lc2 || null,
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
