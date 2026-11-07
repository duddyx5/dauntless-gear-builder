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
