import { BuildState, PatchData, WeaponItem, ArmourItem } from '../types/builder';
import { parseCellSpec } from './calculator';

export const DAUNTLESS_FOREVER_SUPPORTED_VERSIONS = ['1.6.2', '1.14.7'];

export function isDauntlessForeverSupported(versionId: string): boolean {
  return DAUNTLESS_FOREVER_SUPPORTED_VERSIONS.includes(versionId);
}

export interface DFItem {
  id: string;
  name: string;
  cat: string;
  desc?: string;
  gearType?: string;
  how?: string;
}

export interface ResolvedDFItem {
  slotName: string;
  itemName: string;
  dfId: string;
  category: string;
  count?: number;
  how: 'g' | 's' | 'u' | 'i';
}

export interface DFBuildCommands {
  targetVersion: '1.6.2' | '1.14.7';
  gearList: ResolvedDFItem[];
  cellsList: ResolvedDFItem[];
  unresolved: string[];
  powershellScript: string;
  addGearCmd: string;
  setCellsCmd: string;
  rawIds: string;
}

let cachedDFData: { '1.6.2': DFItem[]; '1.14.7': DFItem[] } | null = null;

export async function loadDFItems(): Promise<{ '1.6.2': DFItem[]; '1.14.7': DFItem[] }> {
  if (cachedDFData) return cachedDFData;
  try {
    const res = await fetch('./data/dauntless-forever-items.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cachedDFData = await res.json();
    return cachedDFData!;
  } catch (err) {
    console.warn('Could not load dauntless-forever-items.json, using fallback', err);
    return { '1.6.2': [], '1.14.7': [] };
  }
}

// Phoenix Labs internal Behemoth codenames used in Dauntless Forever's item catalog
const BEHEMOTH_CODENAMES: Record<string, string> = {
  agarus: 'FUNGUY',
  alyra: 'AMBER',
  boreus: 'HOST',
  charrogg: 'SALLY',
  chronovore: 'GLITTER',
  drask: 'FULGAR',
  embermane: 'LERAWR',
  fenroar: 'FENROAR',
  frostwulf: 'FROSTWOLF',
  'frostwülf': 'FROSTWOLF',
  gnasher: 'BEAVER',
  hellion: 'LAVAROLLER',
  kharabak: 'SCISSORS',
  koshai: 'PAPER',
  malkarion: 'THUNDERBIRD',
  nayzaga: 'ELECTROQUILL',
  pangar: 'MCROLLIN',
  phaelanx: 'HABANERO',
  quillshot: 'BULLSEYE',
  rezakiri: 'BUGBEAR',
  riftstalker: 'SHADOWCAT',
  sahvyt: 'MANTIS',
  shrike: 'MOONFACE',
  shrowd: 'CROWBEAR',
  skarn: 'ROCK',
  skraev: 'SNOWFLAKE',
  stormclaw: 'SHOCKMANE',
  thrax: 'RANDALL',
  'thunderdeep drask': 'FULGAR_ALPHA',
  thunderdeep: 'FULGAR_ALPHA',
  torgadoro: 'ARMSTRONG',
  urska: 'MINT',
  valomyr: 'SALT',
};

const WEAPON_TYPE_PREFIX: Record<string, string> = {
  sword: 'WP_EB',
  axe: 'WP_GA',
  hammer: 'WP_IH',
  chainblades: 'WP_CB',
  'chain blades': 'WP_CB',
  warpike: 'WP_MS',
  'war pike': 'WP_MS',
  aetherstrikers: 'WP_AC',
  'aether strikers': 'WP_AC',
  strikers: 'WP_AC',
  repeater: 'WP_DP',
  repeaters: 'WP_DP',
};

const ARMOUR_SLOT_SUFFIX: Record<string, string> = {
  head: 'HELM',
  torso: 'CHEST',
  arms: 'ARMS',
  legs: 'LEGS',
};

// Direct ID aliases for Exotics, Event weapons, Cosmetic/Starter sets, and Omnicells
const DIRECT_GEAR_ALIASES: Record<string, string> = {
  'the hunger': 'WP_EB_CROWBEAR_EXOTIC',
  'the godhand': 'WP_MS_BUGBEAR_EXOTIC',
  'molten edict': 'WP_IH_SALLY_EXOTIC',
  'the twin suns': 'WP_DP_EXOTIC_BOMBS',
  repeater: 'WP_DP_OSTIAN',
  'silver sword': 'WP_EB_FROSTFALL_L10R',
  'the golden claws': 'WP_AC_SPRINGTIDE_L10',
  'training sword': 'WP_EB_TRAINING',

  'the skullforge': 'AR_SALLY_EXOTIC_HELM',
  'prismatic grace': 'AR_BUGBEAR_EXOTIC_HELM',
  'tragic echo': 'AR_CROWBEAR_EXOTIC_HELM',
  'hands of the rift': 'AR_SHADOWCAT_ARMS',
  'timeweave helm': 'AR_CRYSTAL_HELM',
  'timeweave robes': 'AR_CRYSTAL_CHEST',
  'timeweave gauntlets': 'AR_CRYSTAL_ARMS',
  'timeweave leggings': 'AR_CRYSTAL_LEGS',
  'krolachi shave': 'AR_NAKED_HELM',
  'krolachi tunic': 'AR_NAKED_CHEST',
  'krolachi wraps': 'AR_NAKED_ARMS',
  'krolachi shorts': 'AR_NAKED_LEGS',
  "recruit's breastplate": 'AR_BEGINNER_CHEST',
  "recruit's gloves": 'AR_BEGINNER_ARMS',
  "recruit's greaves": 'AR_BEGINNER_LEGS',

  artificer: 'PR_FRANK',
  bastion: 'PR_BASTION',
  discipline: 'PR_DISCIPLINE',
  iceborne: 'PR_ICEBORNE',
  revenant: 'PR_DARKNESS',
  tempest: 'PR_TEMPEST',
};

// Cell prefix aliases (without _UC / _R / _E tier suffix) for cells whose internal catalog display name wasn't localized
const CELL_PREFIX_ALIASES: Record<string, string> = {
  'wild frenzy cell': 'CELL_LOWHP_ATKSPD',
  'pulse cell': 'CELL_RHYTHMIC',
  "assassin's frenzy cell": 'CELL_PART_BREAK_ATKSPD_UP',
  'catalyst cell': 'CELL_BETTER_CONSUMABLE',
  'galvanized cell': 'CELL_HPSHIELD_CRIT',
  'impulse cell': 'CELL_CRIT_DAMAGE_FROM_MS',
  'inertia cell': 'CELL_CRIT_CHANCE_WHILE_SPRINT',
  'recycle cell': 'CELL_SAME_PART_DMG_UP',
  'conservation cell': 'CELL_MS_DOWN_SHIELD_UP',
  'aegis cell': 'CELL_SHIELDS_HIT_ABSORB',
  'omnisurge cell': 'CELL_OMNISURGE',
  'tactician cell': 'CELL_TEAMEXPOSE',
  'rushdown cell': 'CELL_INTERRUPT_STAM',
  'aetheric evasion cell': 'CELL_LANTERNCHARGE_FLAT',
  'stop cell': 'CELL_DODGE_STAGGER',
  'drop cell': 'CELL_MIN_STAM',
  'roll cell': 'CELL_STAGGER_FREE_DODGE',
  'water cell': 'CELL_DODGE_DR',
  'fire cell': 'CELL_ATKSPD_MVSPD_SELFHARM',
  'earth cell': 'CELL_SHIELD_DETONATION',
  'reduce cell': 'CELL_DMGUP_ATKSPDDOWN',
  'pack hunter cell': 'CELL_KILL_FAUNA_DMG',
  'pack caller cell': 'CELL_BREAK_SUMMON_FAUNA',
  'pack walker cell': 'CELL_NEAR_FAUNA_MS_AS',
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Find the best matching Dauntless Forever item for a given name, category, and optional metadata.
 */
export function findDFItem(
  name: string,
  cat: 'Weapons' | 'Armour' | 'Lanterns' | 'Cells' | 'Omnicells',
  items: DFItem[],
  meta?: { weapon?: WeaponItem; armour?: ArmourItem; cellLevel?: number }
): DFItem | null {
  if (!name) return null;
  const lower = name.toLowerCase().trim();

  // 1. Cells: exact tier-aware resolution (_UC = +1, _R = +2, _E = +3)
  if (cat === 'Cells') {
    const levelMatch = lower.match(/^\+([123])\s+(.+)$/);
    const lvl = meta?.cellLevel || (levelMatch ? parseInt(levelMatch[1], 10) : 3);
    const rawBase = (levelMatch ? levelMatch[2] : lower).trim();
    const baseCellName = rawBase.endsWith(' cell') ? rawBase : `${rawBase} cell`;
    const tierSuffix = lvl === 1 ? '_UC' : lvl === 2 ? '_R' : '_E';

    // 1a. Direct prefix alias
    const aliasPrefix = CELL_PREFIX_ALIASES[baseCellName];
    if (aliasPrefix) {
      const aliased = items.find(i => i.id === `${aliasPrefix}${tierSuffix}`);
      if (aliased) return aliased;
    }

    // 1b. Exact "+N <Name>" match
    const exactTierName = `+${lvl} ${baseCellName}`;
    const exactTier = items.find(i => i.cat === 'Cells' && i.name.toLowerCase() === exactTierName && i.id.endsWith(tierSuffix));
    if (exactTier) return exactTier;

    // 1c. Find sibling tier (+3 or +2) by name and swap suffix (_E / _R -> target tierSuffix)
    // This resolves all +1 cells in 1.6.2 where only +2/+3 have display names in the catalog.
    const sibling = items.find(
      i =>
        i.cat === 'Cells' &&
        /_(?:UC|R|E)$/.test(i.id) &&
        (i.name.toLowerCase() === `+3 ${baseCellName}` ||
          i.name.toLowerCase() === `+2 ${baseCellName}` ||
          i.name.toLowerCase() === `+1 ${baseCellName}` ||
          i.name.toLowerCase() === baseCellName)
    );
    if (sibling) {
      const stem = sibling.id.replace(/_(?:UC|R|E)$/, '');
      const exactIdMatch = items.find(i => i.id === `${stem}${tierSuffix}`);
      if (exactIdMatch) return exactIdMatch;
    }

    return null;
  }

  // 2. Direct gear/omnicell ID alias
  if (DIRECT_GEAR_ALIASES[lower]) {
    const aliasId = DIRECT_GEAR_ALIASES[lower];
    const found = items.find(i => i.id === aliasId);
    if (found) return found;
  }

  // 3. Exact display name match within category
  const exact = items.find(i => i.cat === cat && i.name.toLowerCase() === lower);
  if (exact) return exact;

  // 4. Codename construction from Behemoth + WeaponType / ArmourSlot
  if (cat === 'Weapons' && meta?.weapon) {
    const bKey = (meta.weapon.behemoth || '').toLowerCase().trim();
    const wPrefix = WEAPON_TYPE_PREFIX[(meta.weapon.type || '').toLowerCase().trim()];
    const bCode = BEHEMOTH_CODENAMES[bKey] || (lower.startsWith("recruit's") ? 'BEGINNER' : null);
    if (wPrefix && bCode) {
      const codeId = `${wPrefix}_${bCode}`;
      const byCode = items.find(i => i.id === codeId);
      if (byCode) return byCode;
    }
  }

  if (cat === 'Armour' && meta?.armour) {
    const bKey = (meta.armour.behemoth || '').toLowerCase().trim();
    const aSuffix = ARMOUR_SLOT_SUFFIX[(meta.armour.slot || '').toLowerCase().trim()];
    const bCode = BEHEMOTH_CODENAMES[bKey] || (lower.startsWith("recruit's") ? 'BEGINNER' : null);
    if (aSuffix && bCode) {
      const codeId = `AR_${bCode}_${aSuffix}`;
      const byCode = items.find(i => i.id === codeId);
      if (byCode) return byCode;
    }
  }

  // 5. Normalized string match
  const norm = normalize(name);
  const normMatch = items.find(i => i.cat === cat && normalize(i.name) === norm);
  if (normMatch) return normMatch;

  // 6. Partial inclusion match
  const partial = items.find(i => i.cat === cat && normalize(i.name).length >= 5 && (normalize(i.name).includes(norm) || norm.includes(normalize(i.name))));
  if (partial) return partial;

  return null;
}

/**
 * Generate full Dauntless Forever commands and script for a given build.
 */
export function generateDFCommands(
  build: BuildState,
  patchData: PatchData,
  dfItems: { '1.6.2': DFItem[]; '1.14.7': DFItem[] },
  forcedTargetVersion?: '1.6.2' | '1.14.7'
): DFBuildCommands {
  const targetVer: '1.6.2' | '1.14.7' = forcedTargetVersion || (build.version === '1.6.2' ? '1.6.2' : '1.14.7');
  const catalog = dfItems[targetVer] || dfItems['1.14.7'] || [];

  const gearList: ResolvedDFItem[] = [];
  const seenGearIds = new Set<string>();
  const cellsMap: Record<string, { dfItem: DFItem; count: number; name: string }> = {};
  const unresolved: string[] = [];

  function resolveGear(slotName: string, itemId: string | null | undefined, cat: 'Weapons' | 'Armour' | 'Lanterns' | 'Omnicells') {
    if (!itemId) return;
    let displayName = itemId;
    let weaponMeta: WeaponItem | undefined;
    let armourMeta: ArmourItem | undefined;

    if (cat === 'Weapons') {
      weaponMeta = patchData.weapons.find(w => w.id === itemId);
      if (weaponMeta) displayName = weaponMeta.name;
    } else if (cat === 'Armour') {
      armourMeta = patchData.armour.find(a => a.id === itemId);
      if (armourMeta) displayName = armourMeta.name;
    } else if (cat === 'Lanterns') {
      const item = patchData.lanterns.find(l => l.id === itemId);
      if (item) displayName = item.name;
    } else if (cat === 'Omnicells') {
      const item = patchData.omnicells.find(o => o.id === itemId);
      if (item) displayName = item.name;
    }

    const matched = findDFItem(displayName, cat, catalog, { weapon: weaponMeta, armour: armourMeta });
    if (matched) {
      gearList.push({
        slotName,
        itemName: displayName,
        dfId: matched.id,
        category: cat,
        how: (matched.how as any) || 'g',
      });
      seenGearIds.add(matched.id);
    } else {
      unresolved.push(`${slotName}: ${displayName}`);
    }
  }

  // 1. Primary Weapon & Bonded Weapon (needed in inventory to bond onto Legendary weapons!)
  resolveGear('Weapon', build.weapon, 'Weapons');
  const equippedWeapon = patchData.weapons.find(w => w.id === build.weapon);
  if (equippedWeapon?.isLegendary && build.bondedWeapon) {
    resolveGear('Bonded Weapon', build.bondedWeapon, 'Weapons');
  }

  // 2. Armour
  resolveGear('Head', build.head, 'Armour');
  resolveGear('Torso', build.torso, 'Armour');
  resolveGear('Arms', build.arms, 'Armour');
  resolveGear('Legs', build.legs, 'Armour');

  // 3. Lantern & Omnicell (1.14.7)
  resolveGear('Lantern', build.lantern, 'Lanterns');
  if (targetVer === '1.14.7' && build.omnicell) {
    resolveGear('Omnicell', build.omnicell, 'Omnicells');
  }

  // 4. Cells
  const allCellSpecs = [
    ...(build.weaponCells || []),
    build.headCell,
    build.torsoCell,
    build.torsoCell2,
    build.armsCell,
    build.legsCell,
    build.legsCell2,
    build.lanternCell,
  ].filter(Boolean) as string[];

  allCellSpecs.forEach(spec => {
    const parsed = parseCellSpec(spec, patchData.cells);
    if (!parsed) return;
    const cellName = parsed.cell ? parsed.cell.name : spec;
    const lvl = parsed.variantLevel || 3;
    const tierName = `+${lvl} ${cellName}`;

    const matched = findDFItem(tierName, 'Cells', catalog, { cellLevel: lvl });
    if (matched) {
      if (!cellsMap[matched.id]) {
        cellsMap[matched.id] = { dfItem: matched, count: 0, name: tierName };
      }
      cellsMap[matched.id].count += 1;
    } else {
      unresolved.push(`Cell: ${tierName}`);
    }
  });

  const cellsList: ResolvedDFItem[] = Object.values(cellsMap).map(c => ({
    slotName: 'Cell',
    itemName: c.name,
    dfId: c.dfItem.id,
    category: 'Cells',
    count: c.count,
    how: 's',
  }));

  const gearIds = Array.from(seenGearIds);
  const cellAssignments = cellsList.map(c => `${c.dfId}=${c.count || 1}`);

  const addGearCmd = gearIds.length > 0 ? `& $node tools\\items.js addgear '*' ${gearIds.join(' ')}` : '';
  const setCellsCmd = cellAssignments.length > 0 ? `& $node tools\\items.js set '*' ${cellAssignments.join(' ')}` : '';

  const powershellScript = [
    `# Dauntless Forever (${targetVer}) - Build Items Injector`,
    `$v = @("$env:LOCALAPPDATA\\DauntlessForever\\versions\\${targetVer}", "$env:LOCALAPPDATA\\DauntlessOffline\\versions\\${targetVer}") | Where-Object { Test-Path "$_\\tools\\items.js" } | Select-Object -First 1`,
    'if (-not $v) { Write-Error "Dauntless Forever / Offline version folder not found!"; exit }',
    'cd $v',
    '$node = (Get-Content config.json -Raw | ConvertFrom-Json).Node; if (-not $node) { $node = "node" }',
    '',
    gearIds.length > 0 ? `# 1. Add Build Gear (Weapons, Bond, Armour, Lantern, Omnicell)\n${addGearCmd}\n` : '',
    cellAssignments.length > 0 ? `# 2. Set Cells Inventory\n${setCellsCmd}\n` : '',
    'Write-Host "Build items successfully injected into Dauntless Forever!" -ForegroundColor Green',
  ].filter(Boolean).join('\n');

  const rawIds = [...gearIds, ...cellsList.map(c => c.dfId)].join('\n');

  return {
    targetVersion: targetVer,
    gearList,
    cellsList,
    unresolved,
    powershellScript,
    addGearCmd,
    setCellsCmd,
    rawIds,
  };
}
