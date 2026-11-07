import Hashids from 'hashids';
import Sqids from 'sqids';
import { BuildState } from '../types/builder';
import namesData from './dauntlessBuilderNames.json';

const alphabetV7 = 'MNWboUQG19y_Oja2ZEh4liLfst053FTCkpBVrw~Ix.7dJDnmugeKYS6-vcR8zqHAPX';
const alphabetV8 = 'h1tiFLYU5eO6rSEfg_JdlVHvMz0NToujK9-ncwXp7P24axkRWsAG3bBImyD8CZQq';

const hashids = new Hashids('spicy');
const sqidsV7 = new Sqids({ alphabet: alphabetV7 });
const sqidsV8 = new Sqids({ alphabet: alphabetV8 });

interface NamesMap {
  Weapons: Record<string, string>;
  Cells: Record<string, string>;
  Armours: Record<string, string>;
  Lanterns: Record<string, string>;
  Omnicells: Record<string, string>;
  [key: string]: Record<string, string>;
}

const names = namesData as NamesMap;

// Build reverse lookup caches
const weaponReverseMap: Record<string, number> = {};
for (const [id, val] of Object.entries(names.Weapons || {})) {
  const norm = normalizeId(val);
  if (norm) weaponReverseMap[norm] = Number(id);
}

const cellReverseMap: Record<string, number> = {};
for (const [id, val] of Object.entries(names.Cells || {})) {
  const norm = normalizeCellId(val);
  if (norm) cellReverseMap[norm] = Number(id);
}

const armourReverseMap: Record<string, number> = {};
for (const [id, val] of Object.entries(names.Armours || {})) {
  const norm = normalizeId(val);
  if (norm) armourReverseMap[norm] = Number(id);
}

const lanternReverseMap: Record<string, number> = {};
for (const [id, val] of Object.entries(names.Lanterns || {})) {
  const norm = normalizeId(val);
  if (norm) lanternReverseMap[norm] = Number(id);
}

const omnicellReverseMap: Record<string, number> = {};
for (const [id, val] of Object.entries(names.Omnicells || {})) {
  const norm = normalizeId(val);
  if (norm) omnicellReverseMap[norm] = Number(id);
}

const partsReverseMap: Record<string, Record<string, number>> = {};
for (const key of Object.keys(names)) {
  if (key.startsWith('Parts:')) {
    partsReverseMap[key] = {};
    for (const [id, val] of Object.entries(names[key])) {
      const norm = normalizeId(val);
      if (norm) partsReverseMap[key][norm] = Number(id);
    }
  }
}

function decodeId(id: string): number[] | null {
  try {
    const d8 = sqidsV8.decode(id);
    if (d8 && d8.length >= 20) return d8;
  } catch {
    // try next
  }

  try {
    const d7 = sqidsV7.decode(id);
    if (d7 && d7.length >= 20) return d7;
  } catch {
    // try next
  }

  try {
    const dh = hashids.decode(id) as number[];
    if (dh && dh.length >= 20) return dh;
  } catch {
    // try next
  }

  return null;
}

function normalizeId(name: string | undefined): string | null {
  if (!name || name === 'REMOVED') return null;
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function normalizeCellId(name: string | undefined): string | null {
  if (!name || name === 'REMOVED') return null;
  const m = name.match(/(\+[123])\s+(.+)\s+Cell/i);
  if (m) {
    const lvl = m[1];
    const cellBase = m[2].toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + '_cell';
    return `${cellBase}:${lvl}`;
  }
  return null;
}

export function isDauntlessBuilderUrl(input: string): boolean {
  if (!input) return false;
  return /\/b\/[A-Za-z0-9_.\-~]{20,}/.test(input) || /^[A-Za-z0-9_.\-~]{25,100}$/.test(input.trim());
}

export function importFromDauntlessBuilder(input: string): BuildState | null {
  if (!input) return null;
  const m = input.match(/\/b\/([A-Za-z0-9_.\-~]+)/);
  const rawId = m ? m[1] : input.trim();
  const data = decodeId(rawId);
  if (!data || data.length < 20) return null;

  const weapon = normalizeId(names.Weapons[data[2]]);
  const bondedWeapon = normalizeId(names.Weapons[data[9]]);

  const isRepeater = weapon?.includes('repeater') || weapon?.includes('cannons') || weapon?.includes('eruptions') || weapon?.includes('needles') || weapon?.includes('deadlights') || weapon?.includes('torments') || weapon?.includes('mechanics');

  let weaponSpecial: string | null = null;
  let weaponMod: string | null = null;
  let repeaterChamber: string | null = null;
  let repeaterGrip: string | null = null;
  let repeaterMod: string | null = null;

  if (isRepeater) {
    const repMap = names['Parts:Repeater'];
    if (repMap) {
      repeaterChamber = normalizeId(repMap[data[6]]) || 'marksman_chamber';
      repeaterGrip = normalizeId(repMap[data[7]]) || 'captain_s_grip';
      repeaterMod = normalizeId(repMap[data[8]]) || 'precision_sights';
    }
  } else {
    // Map weapon category for parts
    let partTypeKey: string | null = null;
    if (weapon) {
      if (weapon.includes('sword') || weapon.includes('razor') || weapon.includes('hunger') || weapon.includes('pride') || weapon.includes('blade') || weapon.includes('cutlass') || weapon.includes('saber') || weapon.includes('fury') || weapon.includes('call') || weapon.includes('edicts') || weapon.includes('edge')) partTypeKey = 'Parts:Sword';
      else if (weapon.includes('axe') || weapon.includes('cleaver') || weapon.includes('frost') || weapon.includes('scythe') || weapon.includes('voltage') || weapon.includes('judgement') || weapon.includes('fall') || weapon.includes('shredder')) partTypeKey = 'Parts:Axe';
      else if (weapon.includes('hammer') || weapon.includes('maul') || weapon.includes('slam') || weapon.includes('cyclone') || weapon.includes('crash') || weapon.includes('impact') || weapon.includes('anvil') || weapon.includes('crusher') || weapon.includes('break')) partTypeKey = 'Parts:Hammer';
      else if (weapon.includes('chain') || weapon.includes('teeth') || weapon.includes('skinner') || weapon.includes('pincers') || weapon.includes('cruelties') || weapon.includes('realities') || weapon.includes('claws') || weapon.includes('fangs') || weapon.includes('blades') || weapon.includes('scythes')) partTypeKey = 'Parts:Chainblades';
      else if (weapon.includes('pike') || weapon.includes('spear') || weapon.includes('spire') || weapon.includes('javelin') || weapon.includes('conductor') || weapon.includes('glaive') || weapon.includes('skewer') || weapon.includes('needle') || weapon.includes('godhand')) partTypeKey = 'Parts:Warpike';
      else if (weapon.includes('striker') || weapon.includes('breaker') || weapon.includes('fist') || weapon.includes('currents') || weapon.includes('tackler') || weapon.includes('claw') || weapon.includes('lion') || weapon.includes('fists')) partTypeKey = 'Parts:Aetherstrikers';
    }

    if (partTypeKey && names[partTypeKey]) {
      weaponSpecial = normalizeId(names[partTypeKey][data[6]]);
      weaponMod = normalizeId(names[partTypeKey][data[7]]);
    }
  }

  return {
    version: '1.14.7',
    weapon,
    bondedWeapon,
    weaponSpecial,
    weaponMod,
    weaponCells: [normalizeCellId(names.Cells[data[4]]), normalizeCellId(names.Cells[data[5]])],
    head: normalizeId(names.Armours[data[10]]),
    headCell: normalizeCellId(names.Cells[data[12]]),
    torso: normalizeId(names.Armours[data[13]]),
    torsoCell: normalizeCellId(names.Cells[data[15]]),
    arms: normalizeId(names.Armours[data[16]]),
    armsCell: normalizeCellId(names.Cells[data[18]]),
    legs: normalizeId(names.Armours[data[19]]),
    legsCell: normalizeCellId(names.Cells[data[21]]),
    lantern: normalizeId(names.Lanterns[data[22]]),
    lanternCell: normalizeCellId(names.Cells[data[23]]),
    omnicell: normalizeId(names.Omnicells[data[24]]),
    powerSurged: true,
    ...(isRepeater ? {
      repeaterChamber: repeaterChamber || 'marksman_chamber',
      repeaterGrip: repeaterGrip || 'captain_s_grip',
      repeaterMod: repeaterMod || 'precision_sights'
    } : {})
  };
}

export function exportToDauntlessBuilder(build: BuildState): string | null {
  try {
    if (build.version === '2.1.1') return null; // Awakening format uses talents/dual weapons

    const wId = build.weapon ? (weaponReverseMap[build.weapon] || 0) : 0;
    const bondId = build.bondedWeapon ? (weaponReverseMap[build.bondedWeapon] || 0) : 0;

    const wc1 = (build.weaponCells && build.weaponCells[0]) ? (cellReverseMap[build.weaponCells[0]] || 0) : 0;
    const wc2 = (build.weaponCells && build.weaponCells[1]) ? (cellReverseMap[build.weaponCells[1]] || 0) : 0;

    const isRepeater = build.weapon?.includes('repeater') || build.weapon?.includes('cannons') || build.weapon?.includes('eruptions') || build.weapon?.includes('needles') || build.weapon?.includes('deadlights') || build.weapon?.includes('torments') || build.weapon?.includes('mechanics');

    let p1 = 0;
    let p2 = 0;
    let p3 = 0;

    if (isRepeater) {
      const repMap = partsReverseMap['Parts:Repeater'] || {};
      if (build.repeaterChamber) p1 = repMap[build.repeaterChamber] || 0;
      if (build.repeaterGrip) p2 = repMap[build.repeaterGrip] || 0;
      if (build.repeaterMod) p3 = repMap[build.repeaterMod] || 0;
    } else if (build.weapon) {
      let partKey: string | null = null;
      const w = build.weapon;
      if (w.includes('sword') || w.includes('razor') || w.includes('hunger') || w.includes('pride') || w.includes('blade') || w.includes('cutlass') || w.includes('saber') || w.includes('fury') || w.includes('call') || w.includes('edicts') || w.includes('edge')) partKey = 'Parts:Sword';
      else if (w.includes('axe') || w.includes('cleaver') || w.includes('frost') || w.includes('scythe') || w.includes('voltage') || w.includes('judgement') || w.includes('fall') || w.includes('shredder')) partKey = 'Parts:Axe';
      else if (w.includes('hammer') || w.includes('maul') || w.includes('slam') || w.includes('cyclone') || w.includes('crash') || w.includes('impact') || w.includes('anvil') || w.includes('crusher') || w.includes('break')) partKey = 'Parts:Hammer';
      else if (w.includes('chain') || w.includes('teeth') || w.includes('skinner') || w.includes('pincers') || w.includes('cruelties') || w.includes('realities') || w.includes('claws') || w.includes('fangs') || w.includes('blades') || w.includes('scythes')) partKey = 'Parts:Chainblades';
      else if (w.includes('pike') || w.includes('spear') || w.includes('spire') || w.includes('javelin') || w.includes('conductor') || w.includes('glaive') || w.includes('skewer') || w.includes('needle') || w.includes('godhand')) partKey = 'Parts:Warpike';
      else if (w.includes('striker') || w.includes('breaker') || w.includes('fist') || w.includes('currents') || w.includes('tackler') || w.includes('claw') || w.includes('lion') || w.includes('fists')) partKey = 'Parts:Aetherstrikers';

      if (partKey && partsReverseMap[partKey]) {
        const pm = partsReverseMap[partKey];
        if (build.weaponSpecial) p1 = pm[build.weaponSpecial] || 0;
        if (build.weaponMod) p2 = pm[build.weaponMod] || 0;
      }
    }

    const hId = build.head ? (armourReverseMap[build.head] || 0) : 0;
    const hc = build.headCell ? (cellReverseMap[build.headCell] || 0) : 0;

    const tId = build.torso ? (armourReverseMap[build.torso] || 0) : 0;
    const tc = build.torsoCell ? (cellReverseMap[build.torsoCell] || 0) : 0;

    const aId = build.arms ? (armourReverseMap[build.arms] || 0) : 0;
    const ac = build.armsCell ? (cellReverseMap[build.armsCell] || 0) : 0;

    const lId = build.legs ? (armourReverseMap[build.legs] || 0) : 0;
    const lc = build.legsCell ? (cellReverseMap[build.legsCell] || 0) : 0;

    const ltId = build.lantern ? (lanternReverseMap[build.lantern] || 0) : 0;
    const ltc = build.lanternCell ? (cellReverseMap[build.lanternCell] || 0) : 0;

    const oId = build.omnicell ? (omnicellReverseMap[build.omnicell] || 0) : 0;

    const params = [
      8, // CURRENT_BUILD_ID in dauntless-builder-reforged
      0, // flags
      wId,
      build.powerSurged ? 1 : 0,
      wc1,
      wc2,
      p1,
      p2,
      p3,
      bondId,
      hId,
      build.powerSurged ? 1 : 0,
      hc,
      tId,
      build.powerSurged ? 1 : 0,
      tc,
      aId,
      build.powerSurged ? 1 : 0,
      ac,
      lId,
      build.powerSurged ? 1 : 0,
      lc,
      ltId,
      ltc,
      oId,
    ];

    return sqidsV8.encode(params);
  } catch (err) {
    console.error('Failed to export to dauntless-builder format:', err);
    return null;
  }
}
