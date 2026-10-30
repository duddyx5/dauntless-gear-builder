import { BuildState, PatchData } from '../types/builder';
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

// Special alias dictionary for items where display name differs from catalog
const SPECIAL_ALIASES: Record<string, string> = {
  // Cells
  'wild frenzy cell': 'CELL_LOWHP_ATKSPD_E',
  '+3 wild frenzy cell': 'CELL_LOWHP_ATKSPD_E',
  '+2 wild frenzy cell': 'CELL_LOWHP_ATKSPD_R',
  '+1 wild frenzy cell': 'CELL_LOWHP_ATKSPD_UC',
  'pulse cell': 'CELL_CRIT_ON_HIT_E',
  '+3 pulse cell': 'CELL_CRIT_ON_HIT_E',
  'assassin\'s frenzy cell': 'CELL_PART_BREAK_ATKSPD_UP_E',
  '+3 assassin\'s frenzy cell': 'CELL_PART_BREAK_ATKSPD_UP_E',
  'catalyst cell': 'CELL_BETTER_CONSUMABLE_E',
  '+3 catalyst cell': 'CELL_BETTER_CONSUMABLE_E',

  // Common Gear
  'the hunger': 'WP_EB_CROWBEAR_EXOTIC',
  'the godhand': 'WP_MS_BUGBEAR_EXOTIC',
  'molten edict': 'WP_IH_SNOUT_EXOTIC',
  'the skullforge': 'AR_SNOUT_EXOTIC_HELM',
  'prismatic grace': 'AR_BUGBEAR_EXOTIC_HELM',
  'tragic echo': 'AR_CROWBEAR_EXOTIC_HELM',
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Find the best matching Dauntless Forever item for a given name and category.
 */
export function findDFItem(
  name: string,
  cat: 'Weapons' | 'Armour' | 'Lanterns' | 'Cells',
  items: DFItem[]
): DFItem | null {
  if (!name) return null;
  const lower = name.toLowerCase().trim();

  // 1. Direct alias match
  if (SPECIAL_ALIASES[lower]) {
    const id = SPECIAL_ALIASES[lower];
    const found = items.find(i => i.id === id);
    if (found) return found;
  }

  // 2. Exact name match within category
  const exact = items.find(i => i.cat === cat && i.name.toLowerCase() === lower);
  if (exact) return exact;

  // 3. For Cells: check "+3 [Name] Cell"
  if (cat === 'Cells') {
    const withPlus3 = `+3 ${lower}`;
    const cellMatch = items.find(i => i.cat === 'Cells' && (i.name.toLowerCase() === withPlus3 || i.name.toLowerCase().includes(lower)));
    if (cellMatch) return cellMatch;
  }

  // 4. Normalized string match
  const norm = normalize(name);
  const normMatch = items.find(i => i.cat === cat && normalize(i.name) === norm);
  if (normMatch) return normMatch;

  // 5. Partial inclusion match
  const partial = items.find(i => i.cat === cat && (normalize(i.name).includes(norm) || norm.includes(normalize(i.name))));
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
  // Determine target game version (1.6.2 vs 1.14.7)
  const targetVer: '1.6.2' | '1.14.7' = forcedTargetVersion || (build.version === '1.6.2' ? '1.6.2' : '1.14.7');
  const catalog = dfItems[targetVer] || dfItems['1.14.7'] || [];

  const gearList: ResolvedDFItem[] = [];
  const cellsMap: Record<string, { dfItem: DFItem; count: number; name: string }> = {};
  const unresolved: string[] = [];

  // Helper to resolve gear
  function resolveGear(slotName: string, itemId: string | null, cat: 'Weapons' | 'Armour' | 'Lanterns') {
    if (!itemId) return;
    let displayName = itemId;

    if (cat === 'Weapons') {
      const item = patchData.weapons.find(w => w.id === itemId);
      if (item) displayName = item.name;
    } else if (cat === 'Armour') {
      const item = patchData.armour.find(a => a.id === itemId);
      if (item) displayName = item.name;
    } else if (cat === 'Lanterns') {
      const item = patchData.lanterns.find(l => l.id === itemId);
      if (item) displayName = item.name;
    }

    const matched = findDFItem(displayName, cat, catalog);
    if (matched) {
      gearList.push({
        slotName,
        itemName: displayName,
        dfId: matched.id,
        category: cat,
        how: (matched.how as any) || 'g',
      });
    } else {
      unresolved.push(`${slotName}: ${displayName}`);
    }
  }

  // 1. Weapon
  resolveGear('Weapon', build.weapon, 'Weapons');

  // 2. Armour
  resolveGear('Head', build.head, 'Armour');
  resolveGear('Torso', build.torso, 'Armour');
  resolveGear('Arms', build.arms, 'Armour');
  resolveGear('Legs', build.legs, 'Armour');

  // 3. Lantern
  resolveGear('Lantern', build.lantern, 'Lanterns');

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
    const tierName = `+${parsed.variantLevel || 3} ${cellName}`;

    const matched = findDFItem(tierName, 'Cells', catalog) || findDFItem(cellName, 'Cells', catalog);
    if (matched) {
      if (!cellsMap[matched.id]) {
        cellsMap[matched.id] = { dfItem: matched, count: 0, name: matched.name };
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

  // Build command strings
  const gearIds = gearList.map(g => g.dfId);
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
    gearIds.length > 0 ? `# 1. Add Build Gear (Weapons, Armour, Lantern)\n${addGearCmd}\n` : '',
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
