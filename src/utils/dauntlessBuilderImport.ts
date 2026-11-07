import Hashids from 'hashids';
import Sqids from 'sqids';
import { BuildState } from '../types/builder';
import namesData from './dauntlessBuilderNames.json';

const alphabetV7 = 'MNWboUQG19y_Oja2ZEh4liLfst053FTCkpBVrw~Ix.7dJDnmugeKYS6-vcR8zqHAPX';
const alphabetV8 = 'h1tiFLYU5eO6rSEfg_JdlVHvMz0NToujK9-ncwXp7P24axkRWsAG3bBImyD8CZQq';
const alphabetAwakening = 'tr1GwdIv2NFgTOLso3zfJ95QbenZACWDqiRl@y8haYE7K-cHx6uUPmVX4BkS_0pjM';

const hashids = new Hashids('spicy');
const sqidsV7 = new Sqids({ alphabet: alphabetV7 });
const sqidsV8 = new Sqids({ alphabet: alphabetV8 });
const sqidsAwakening = new Sqids({ alphabet: alphabetAwakening });

const AWAKENING_BUILD_VERSION = 10;

interface DF162Meta {
  weapons: string[];
  armours: { id: string; slot: string }[];
  lanterns: string[];
  cells: string[];
  parts: { id: string; wt: string; kind: string }[];
}

interface Awakening211Meta {
  weapons: Record<string, string>;
  armours: Record<string, string>;
  cells: Record<string, string>;
  cores: Record<string, string>;
}

interface NamesMeta {
  weaponTypes: Record<string, string>;
  partKinds: Record<string, Record<string, string>>;
  df162: DF162Meta;
  awakening211?: Awakening211Meta;
}

interface NamesMap {
  Weapons: Record<string, string>;
  Cells: Record<string, string>;
  Armours: Record<string, string>;
  Lanterns: Record<string, string>;
  Omnicells: Record<string, string>;
  _meta?: NamesMeta;
  [key: string]: any;
}

export interface SharePlatformLink {
  id: 'self' | 'reforged-db' | 'awakening-db' | 'dauntless-forever';
  name: string;
  domain: string;
  supportedPatches: string[];
  badgeLabel: string;
  description: string;
  isCompatible: boolean;
  url: string | null;
  switchPatches: string[];
}

const names = namesData as NamesMap;
const meta = names._meta;

const PART_KEY_TO_WT: Record<string, string> = {
  'Parts:Aetherstrikers': 'aetherstrikers',
  'Parts:Axe': 'axe',
  'Parts:Chainblades': 'chainblades',
  'Parts:Hammer': 'hammer',
  'Parts:Repeater': 'repeater',
  'Parts:Sword': 'sword',
  'Parts:Warpike': 'warpike',
};

const EXOTIC_MELEE_WEAPONS = new Set<string>([
  'the_hunger',
  'the_godhand',
  'molten_edict',
]);

const DEFAULT_WEAPON_PARTS_BY_KEY: Record<string, { special: string; mod: string }> = {
  'Parts:Sword': { special: 'valiant_overdrive', mod: 'dynamic_bladecore' },
  'Parts:Axe': { special: 'grim_onslaught', mod: 'overcharged_cylinder' },
  'Parts:Hammer': { special: 'mighty_landbreaker', mod: 'extended_clip' },
  'Parts:Chainblades': { special: 'reaper_s_dance', mod: 'hurricane_blades' },
  'Parts:Warpike': { special: 'savage_wellspring', mod: 'executioner_s_spearhead' },
  'Parts:Aetherstrikers': { special: 'titan_s_crash', mod: 'cyclonic_strikeplate' },
};

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

// Build reverse lookup caches for Reforged (1.12.0 / 1.14.7)
const weaponReverseMap: Record<string, number> = {};
for (const [id, val] of Object.entries(names.Weapons || {})) {
  const norm = normalizeId(val as string);
  if (norm) weaponReverseMap[norm] = Number(id);
}

const cellReverseMap: Record<string, number> = {};
for (const [id, val] of Object.entries(names.Cells || {})) {
  const norm = normalizeCellId(val as string);
  if (norm) cellReverseMap[norm] = Number(id);
}

const armourReverseMap: Record<string, number> = {};
for (const [id, val] of Object.entries(names.Armours || {})) {
  const norm = normalizeId(val as string);
  if (norm) armourReverseMap[norm] = Number(id);
}

const lanternReverseMap: Record<string, number> = {};
for (const [id, val] of Object.entries(names.Lanterns || {})) {
  const norm = normalizeId(val as string);
  if (norm) lanternReverseMap[norm] = Number(id);
}

const omnicellReverseMap: Record<string, number> = {};
for (const [id, val] of Object.entries(names.Omnicells || {})) {
  const norm = normalizeId(val as string);
  if (norm) omnicellReverseMap[norm] = Number(id);
}

const partsReverseMap: Record<string, Record<string, number>> = {};
for (const key of Object.keys(names)) {
  if (key.startsWith('Parts:')) {
    partsReverseMap[key] = {};
    for (const [id, val] of Object.entries(names[key] as Record<string, string>)) {
      const norm = normalizeId(val);
      if (norm) partsReverseMap[key][norm] = Number(id);
    }
  }
}

// Build reverse lookup caches for Awakening (2.1.1)
const awWeaponReverseMap: Record<string, number> = {};
const awArmourReverseMap: Record<string, number> = {};
const awCellReverseMap: Record<string, number> = {};
const awCoreReverseMap: Record<string, number> = {};

if (meta?.awakening211) {
  for (const [id, slug] of Object.entries(meta.awakening211.weapons || {})) {
    awWeaponReverseMap[slug] = Number(id);
  }
  for (const [id, slug] of Object.entries(meta.awakening211.armours || {})) {
    awArmourReverseMap[slug] = Number(id);
  }
  for (const [id, slug] of Object.entries(meta.awakening211.cells || {})) {
    awCellReverseMap[slug] = Number(id);
  }
  for (const [id, slug] of Object.entries(meta.awakening211.cores || {})) {
    awCoreReverseMap[slug] = Number(id);
  }
}

function getWeaponPartMapKey(weaponId: string | null | undefined): string | null {
  if (!weaponId) return null;
  if (meta?.weaponTypes?.[weaponId]) return meta.weaponTypes[weaponId];
  if (weaponId.includes('repeater') || weaponId === 'the_twin_suns' || weaponId === 'screams_of_the_shrike') return 'Parts:Repeater';
  if (weaponId.includes('sword') || weaponId.includes('razor') || weaponId.includes('hunger')) return 'Parts:Sword';
  if (weaponId.includes('axe') || weaponId.includes('cleaver')) return 'Parts:Axe';
  if (weaponId.includes('hammer') || weaponId.includes('maul') || weaponId.includes('edict')) return 'Parts:Hammer';
  if (weaponId.includes('chain') || weaponId.includes('fangs') || weaponId.includes('blades')) return 'Parts:Chainblades';
  if (weaponId.includes('pike') || weaponId.includes('spear') || weaponId.includes('godhand')) return 'Parts:Warpike';
  if (weaponId.includes('striker') || weaponId.includes('claws') || weaponId.includes('fists')) return 'Parts:Aetherstrikers';
  return null;
}

function b64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function b64UrlDecode(str: string): string {
  let clean = str.replace(/-/g, '+').replace(/_/g, '/');
  while (clean.length % 4 !== 0) clean += '=';
  return decodeURIComponent(escape(atob(clean)));
}

function calcAwakeningChecksum(data: number[]): number {
  let checksum = 0;
  for (const d of data) {
    checksum ^= d;
  }
  return checksum;
}

function serializeAwakeningTalents(talents?: number[], rawMask?: number): number {
  if (typeof rawMask === 'number' && rawMask >= 0) {
    return rawMask & 0x1ffffff;
  }
  if (!talents || talents.length === 0) return 0;
  let mask = 0;
  for (let row = 0; row < 5; row++) {
    const rawCol = talents[row];
    if (rawCol !== undefined && rawCol !== null && rawCol >= 0) {
      const col = Math.max(0, Math.min(4, rawCol));
      mask |= 1 << (row * 5 + col);
    }
  }
  return mask;
}

function parseAwakeningTalents(mask: number): number[] {
  const result = [0, 0, 0, 0, 0];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if ((mask & (1 << (row * 5 + col))) !== 0) {
        result[row] = col;
        break;
      }
    }
  }
  return result;
}

function mapOurWeaponLevelToAwakening(lvl?: number): number {
  const safe = lvl !== undefined ? lvl : 20;
  if (safe <= 1) return 1;
  return Math.max(1, Math.min(60, Math.round(safe * 3)));
}

function mapAwakeningWeaponLevelToOurs(dbLvl: number): number {
  if (!Number.isFinite(dbLvl) || dbLvl <= 3) return 1;
  return Math.max(1, Math.min(20, Math.round(dbLvl / 3)));
}

function clampAwakeningArmourLevel(lvl?: number): number {
  const safe = lvl !== undefined ? lvl : 20;
  return Math.max(1, Math.min(20, Math.round(safe)));
}

function mapAwakeningCellId(spec: string | null | undefined): number {
  if (!spec) return 0;
  const baseSlug = spec.split(':')[0];
  return awCellReverseMap[baseSlug] || 0;
}

/**
 * Encodes a Patch 2.1.1 (Awakening) build using the official dauntless-builder.com v10 Sqids format
 * (23 integer fields + XOR checksum = 24 numbers).
 */
export function encodeAwakening211(build: BuildState): string | null {
  if (!meta?.awakening211) return null;
  try {
    const w1Id = build.weapon ? (awWeaponReverseMap[build.weapon] || 0) : 0;
    if (build.weapon && !w1Id) return null;
    const w1Lvl = w1Id > 0 ? mapOurWeaponLevelToAwakening(build.gearLevels?.weapon) : 1;
    const w1Talents = w1Id > 0 ? serializeAwakeningTalents(build.weaponTalents, build.weaponTalentsMask) : 0;

    const w2Id = build.secondaryWeapon ? (awWeaponReverseMap[build.secondaryWeapon] || 0) : 0;
    if (build.secondaryWeapon && !w2Id) return null;
    const w2Lvl = w2Id > 0 ? mapOurWeaponLevelToAwakening(build.gearLevels?.secondaryWeapon) : 1;
    const w2Talents = w2Id > 0
      ? serializeAwakeningTalents(build.secondaryWeaponTalents, build.secondaryWeaponTalentsMask)
      : 0;

    const headId = build.head ? (awArmourReverseMap[build.head] || 0) : 0;
    const headLvl = headId > 0 ? clampAwakeningArmourLevel(build.gearLevels?.head) : 1;
    const headCell = headId > 0 ? mapAwakeningCellId(build.headCell) : 0;

    const torsoId = build.torso ? (awArmourReverseMap[build.torso] || 0) : 0;
    const torsoLvl = torsoId > 0 ? clampAwakeningArmourLevel(build.gearLevels?.torso) : 1;
    const torsoCell1 = torsoId > 0 ? mapAwakeningCellId(build.torsoCell) : 0;
    const torsoCell2 = torsoId > 0 ? mapAwakeningCellId(build.torsoCell2) : 0;

    const armsId = build.arms ? (awArmourReverseMap[build.arms] || 0) : 0;
    const armsLvl = armsId > 0 ? clampAwakeningArmourLevel(build.gearLevels?.arms) : 1;
    const armsCell = armsId > 0 ? mapAwakeningCellId(build.armsCell) : 0;

    const legsId = build.legs ? (awArmourReverseMap[build.legs] || 0) : 0;
    const legsLvl = legsId > 0 ? clampAwakeningArmourLevel(build.gearLevels?.legs) : 1;
    const legsCell1 = legsId > 0 ? mapAwakeningCellId(build.legsCell) : 0;
    const legsCell2 = legsId > 0 ? mapAwakeningCellId(build.legsCell2) : 0;

    const coreId = build.lantern ? (awCoreReverseMap[build.lantern] || 0) : 0;

    const data: number[] = [
      AWAKENING_BUILD_VERSION,
      0, // flags
      w1Id,
      w1Lvl,
      w1Talents,
      w2Id,
      w2Lvl,
      w2Talents,
      headId,
      headLvl,
      headCell,
      torsoId,
      torsoLvl,
      torsoCell1,
      torsoCell2,
      armsId,
      armsLvl,
      armsCell,
      legsId,
      legsLvl,
      legsCell1,
      legsCell2,
      coreId,
    ];

    const checksum = calcAwakeningChecksum(data);
    return sqidsAwakening.encode([...data, checksum]);
  } catch (err) {
    console.warn('Failed to encode 2.1.1 Awakening build:', err);
    return null;
  }
}

/**
 * Decodes an official dauntless-builder.com v10 Sqids build code into our BuildState (Patch 2.1.1).
 */
export function decodeAwakening211(input: string): BuildState | null {
  if (!meta?.awakening211 || !input) return null;
  try {
    const rawId = extractRawCode(input);
    if (!rawId) return null;

    const data = sqidsAwakening.decode(rawId);
    if (!data || data.length !== 24) return null;
    if (data[0] !== AWAKENING_BUILD_VERSION || data[1] > 3) return null;

    // Verify canonical Sqid encoding & XOR checksum to guarantee zero collisions with Reforged Sqids
    const body = data.slice(0, 23);
    const checksum = data[23];
    if (calcAwakeningChecksum(body) !== checksum) return null;
    if (sqidsAwakening.encode(data) !== rawId) return null;

    const aw = meta.awakening211;
    const weapon = data[2] > 0 ? (aw.weapons[String(data[2])] || null) : null;
    const secondaryWeapon = data[5] > 0 ? (aw.weapons[String(data[5])] || null) : null;

    const head = data[8] > 0 ? (aw.armours[String(data[8])] || null) : null;
    const torso = data[11] > 0 ? (aw.armours[String(data[11])] || null) : null;
    const arms = data[15] > 0 ? (aw.armours[String(data[15])] || null) : null;
    const legs = data[18] > 0 ? (aw.armours[String(data[18])] || null) : null;
    const lantern = data[22] > 0 ? (aw.cores[String(data[22])] || null) : null;

    const cellById = (id: number): string | null => (id > 0 ? (aw.cells[String(id)] || null) : null);

    return {
      version: '2.1.1',
      weapon,
      secondaryWeapon,
      weaponTalents: weapon ? parseAwakeningTalents(data[4]) : [0, 0, 0, 0, 0],
      secondaryWeaponTalents: secondaryWeapon ? parseAwakeningTalents(data[7]) : [0, 0, 0, 0, 0],
      weaponTalentsMask: weapon ? data[4] : undefined,
      secondaryWeaponTalentsMask: secondaryWeapon ? data[7] : undefined,
      gearLevels: {
        weapon: weapon ? mapAwakeningWeaponLevelToOurs(data[3]) : 20,
        secondaryWeapon: secondaryWeapon ? mapAwakeningWeaponLevelToOurs(data[6]) : 20,
        head: head ? clampAwakeningArmourLevel(data[9]) : 20,
        torso: torso ? clampAwakeningArmourLevel(data[12]) : 20,
        arms: arms ? clampAwakeningArmourLevel(data[16]) : 20,
        legs: legs ? clampAwakeningArmourLevel(data[19]) : 20,
      },
      weaponCells: [],
      head,
      headCell: head ? cellById(data[10]) : null,
      torso,
      torsoCell: torso ? cellById(data[13]) : null,
      torsoCell2: torso ? cellById(data[14]) : null,
      arms,
      armsCell: arms ? cellById(data[17]) : null,
      legs,
      legsCell: legs ? cellById(data[20]) : null,
      legsCell2: legs ? cellById(data[21]) : null,
      lantern,
      lanternCell: null,
      omnicell: null,
      powerSurged: false,
    };
  } catch {
    return null;
  }
}

/**
 * Encodes a Patch 1.6.2 build using the compact array format from builder.dauntlessforever.com:
 * "162." + base64url([wIdx, wl, [mod, special, barrel, chamber, grip, prism], [[h,hl],[t,tl],[a,al],[l,ll]], lanIdx, [w0,w1,h,t,a,l,lan], bondIdx?])
 */
export function encodeDF162(build: BuildState): string | null {
  if (!meta?.df162) return null;
  try {
    const df = meta.df162;
    const wl = build.powerSurged ? 1 : 0;
    const wIdx = build.weapon ? df.weapons.indexOf(build.weapon) : -1;
    const partMapKey = getWeaponPartMapKey(build.weapon);
    const wt = partMapKey ? PART_KEY_TO_WT[partMapKey] : null;

    const findPartIdx = (partId: string | null | undefined, kind: string): number => {
      if (!partId || !wt) return -1;
      return df.parts.findIndex(p => p.wt === wt && p.kind === kind && p.id === partId);
    };

    const isExoticMelee = Boolean(build.weapon && EXOTIC_MELEE_WEAPONS.has(build.weapon));
    const defParts = partMapKey ? DEFAULT_WEAPON_PARTS_BY_KEY[partMapKey] : undefined;
    const effectiveMeleeSpecial = isExoticMelee
      ? null
      : (build.weaponSpecial === undefined ? defParts?.special : build.weaponSpecial);
    const effectiveMeleeMod = build.weaponMod === undefined ? defParts?.mod : build.weaponMod;

    const modId = wt === 'repeater' ? build.repeaterMod : effectiveMeleeMod;
    const partsArr = [
      findPartIdx(modId, 'mods'),
      findPartIdx(wt === 'repeater' ? null : effectiveMeleeSpecial, 'specials'),
      findPartIdx(build.repeaterBarrel, 'barrels'),
      findPartIdx(build.repeaterChamber, 'chambers'),
      findPartIdx(build.repeaterGrip, 'grips'),
      findPartIdx(build.repeaterPrism, 'prisms'),
    ];

    const findArmourIdx = (id: string | null | undefined, slot: string): number => {
      if (!id) return -1;
      return df.armours.findIndex(a => a.slot === slot && a.id === id);
    };

    const armoursArr = [
      [findArmourIdx(build.head, 'head'), wl],
      [findArmourIdx(build.torso, 'torso'), wl],
      [findArmourIdx(build.arms, 'arms'), wl],
      [findArmourIdx(build.legs, 'legs'), wl],
    ];

    const lanIdx = build.lantern ? df.lanterns.indexOf(build.lantern) : -1;

    const encodeCellSpec = (spec: string | null | undefined): number => {
      if (!spec) return -1;
      const [cellId, tierStr] = spec.split(':');
      const cIdx = df.cells.indexOf(cellId);
      if (cIdx < 0) return -1;
      const tierNum = tierStr ? Math.max(1, Math.min(3, parseInt(tierStr.replace('+', ''), 10) || 3)) : 3;
      return cIdx * 3 + (tierNum - 1);
    };

    const cellsArr = [
      encodeCellSpec(build.weaponCells?.[0]),
      encodeCellSpec(build.weaponCells?.[1]),
      encodeCellSpec(build.headCell),
      encodeCellSpec(build.torsoCell),
      encodeCellSpec(build.armsCell),
      encodeCellSpec(build.legsCell),
      encodeCellSpec(build.lanternCell),
    ];

    const bondIdx = build.bondedWeapon ? df.weapons.indexOf(build.bondedWeapon) : -1;
    const payload: any[] = [wIdx, wl, partsArr, armoursArr, lanIdx, cellsArr];
    if (bondIdx >= 0) payload.push(bondIdx);

    return '162.' + b64UrlEncode(JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to encode 162 build:', err);
    return null;
  }
}

export function decodeDF162(input: string): BuildState | null {
  if (!meta?.df162 || !input) return null;
  try {
    const cleaned = extractRawCode(input);
    if (!cleaned.startsWith('162.')) return null;
    const b64Part = cleaned.slice(4);
    const parsed = JSON.parse(b64UrlDecode(b64Part));
    if (!Array.isArray(parsed) || parsed.length < 6) return null;

    const df = meta.df162;
    const ok = (v: any, len: number) => Number.isInteger(v) && v >= 0 && v < len;

    const weapon = ok(parsed[0], df.weapons.length) ? df.weapons[parsed[0]] : null;
    const wl = parsed[1] === 0 ? 0 : 1;

    let weaponMod: string | null = null;
    let weaponSpecial: string | null = null;
    let repeaterBarrel: string | null = null;
    let repeaterChamber: string | null = null;
    let repeaterGrip: string | null = null;
    let repeaterPrism: string | null = null;
    let repeaterMod: string | null = null;

    const rawParts = Array.isArray(parsed[2]) ? parsed[2] : [];
    const partKeys = ['mods', 'specials', 'barrels', 'chambers', 'grips', 'prisms'];
    partKeys.forEach((kind, idx) => {
      const pIdx = rawParts[idx];
      if (!ok(pIdx, df.parts.length)) return;
      const pObj = df.parts[pIdx];
      if (kind === 'mods') {
        if (pObj.wt === 'repeater') repeaterMod = pObj.id;
        else weaponMod = pObj.id;
      } else if (kind === 'specials') weaponSpecial = pObj.id;
      else if (kind === 'barrels') repeaterBarrel = pObj.id;
      else if (kind === 'chambers') repeaterChamber = pObj.id;
      else if (kind === 'grips') repeaterGrip = pObj.id;
      else if (kind === 'prisms') repeaterPrism = pObj.id;
    });

    const rawArmours = Array.isArray(parsed[3]) ? parsed[3] : [];
    const getArmour = (slotIdx: number, expectedSlot: string): [string | null, number] => {
      const entry = rawArmours[slotIdx];
      if (!Array.isArray(entry) || !ok(entry[0], df.armours.length)) return [null, 1];
      const item = df.armours[entry[0]];
      if (item.slot !== expectedSlot) return [null, 1];
      return [item.id, entry[1] === 0 ? 0 : 1];
    };

    const [head, hl] = getArmour(0, 'head');
    const [torso, tl] = getArmour(1, 'torso');
    const [arms, al] = getArmour(2, 'arms');
    const [legs, ll] = getArmour(3, 'legs');

    const lantern = ok(parsed[4], df.lanterns.length) ? df.lanterns[parsed[4]] : null;

    const decodeCellVal = (v: any): string | null => {
      if (!Number.isInteger(v) || v < 0) return null;
      const cIdx = Math.floor(v / 3);
      const tier = (v % 3) + 1;
      if (!ok(cIdx, df.cells.length)) return null;
      return `${df.cells[cIdx]}:+${tier}`;
    };

    const rawCells = Array.isArray(parsed[5]) ? parsed[5] : [];
    const bondedWeapon = ok(parsed[6], df.weapons.length) ? df.weapons[parsed[6]] : null;

    const hasGear = Boolean(weapon || head || torso || arms || legs);
    const anySurged = Boolean(
      (weapon && wl === 1) ||
      (head && hl === 1) ||
      (torso && tl === 1) ||
      (arms && al === 1) ||
      (legs && ll === 1)
    );

    return {
      version: '1.6.2',
      weapon,
      bondedWeapon,
      weaponSpecial,
      weaponMod,
      repeaterBarrel,
      repeaterChamber,
      repeaterGrip,
      repeaterPrism,
      repeaterMod,
      weaponCells: [decodeCellVal(rawCells[0]), decodeCellVal(rawCells[1])],
      head,
      headCell: decodeCellVal(rawCells[2]),
      torso,
      torsoCell: decodeCellVal(rawCells[3]),
      arms,
      armsCell: decodeCellVal(rawCells[4]),
      legs,
      legsCell: decodeCellVal(rawCells[5]),
      lantern,
      lanternCell: decodeCellVal(rawCells[6]),
      omnicell: null,
      powerSurged: hasGear ? anySurged : true,
    };
  } catch (err) {
    console.warn('Failed to decode 162 build:', err);
    return null;
  }
}

function extractRawCode(input: string): string {
  let s = String(input || '').trim();
  try {
    if (s.includes('%40')) s = decodeURIComponent(s);
  } catch {
    // ignore malformed percent encoding
  }
  const slashB = s.match(/\/b\/([A-Za-z0-9_.\-~@]+)/);
  if (slashB) return slashB[1];
  const hashDotB = s.match(/#b\.([A-Za-z0-9_.\-~@]+)/);
  if (hashDotB) return hashDotB[1];
  const hashEqB = s.match(/[#?&]b=([A-Za-z0-9_.\-~@]+)/);
  if (hashEqB) return hashEqB[1];
  s = s.replace(/^#?b[.=]/, '').replace(/[?#].*$/, '');
  return s;
}

function decodeReforgedId(id: string): number[] | null {
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

export function isDauntlessBuilderUrl(input: string): boolean {
  if (!input) return false;
  const raw = extractRawCode(input);
  if (raw.startsWith('162.') || raw.startsWith('112.')) return true;
  if (/\/b\/[A-Za-z0-9_.\-~@]{20,}/.test(input) || /#b\.[A-Za-z0-9_.\-~@]{20,}/.test(input)) return true;
  return /^[A-Za-z0-9_.\-~@]{25,110}$/.test(raw);
}

export function importFromDauntlessBuilder(input: string): BuildState | null {
  if (!input) return null;
  let rawId = extractRawCode(input);
  if (!rawId) return null;

  if (rawId.startsWith('162.')) {
    return decodeDF162(rawId);
  }

  const lowerInput = input.toLowerCase();
  const isExplicitReforgedUrl =
    lowerInput.includes('reforged.dauntless-builder.com') ||
    lowerInput.includes('dauntlessforever.com') ||
    rawId.startsWith('112.');

  // Check Awakening 2.1.1 v10 Sqid (verified via canonical Sqid + XOR checksum)
  if (!isExplicitReforgedUrl) {
    const awakeningBuild = decodeAwakening211(rawId);
    if (awakeningBuild) return awakeningBuild;
  }

  let targetVersion = '1.14.7';
  if (rawId.startsWith('112.')) {
    targetVersion = '1.12.0';
    rawId = rawId.slice(4);
  }

  let data = decodeReforgedId(rawId);
  if (!data || data.length < 20) return null;
  if (data[0] === 5 && data.length === 24) {
    data = [6, 0, ...data.slice(1)];
  }
  if (![6, 7, 8].includes(data[0]) || data.length < 25) return null;

  const weapon = normalizeId(names.Weapons[data[2]]);
  const bondedWeapon = normalizeId(names.Weapons[data[9]]);

  const partTypeKey = getWeaponPartMapKey(weapon);
  const isRepeater = partTypeKey === 'Parts:Repeater';
  const isExoticRepeater = weapon === 'the_twin_suns';
  const isExoticMelee = Boolean(weapon && EXOTIC_MELEE_WEAPONS.has(weapon));

  let weaponSpecial: string | null = null;
  let weaponMod: string | null = null;
  let repeaterChamber: string | null = null;
  let repeaterGrip: string | null = null;
  let repeaterMod: string | null = null;

  if (partTypeKey && names[partTypeKey]) {
    const partTable = names[partTypeKey] as Record<string, string>;
    const kindTable = meta?.partKinds?.[partTypeKey] || {};

    [data[6], data[7], data[8]].forEach((rawPartNum, slotIdx) => {
      const partSlug = normalizeId(partTable[rawPartNum]);
      if (!partSlug) return;
      const pKind = kindTable[partSlug];

      if (isRepeater) {
        if (pKind === 'chambers' && !isExoticRepeater) repeaterChamber = partSlug;
        else if (pKind === 'grips' && !isExoticRepeater) repeaterGrip = partSlug;
        else if (pKind === 'mods') repeaterMod = partSlug;
        else if (!pKind) {
          if (slotIdx === 0 && !isExoticRepeater) repeaterChamber = partSlug;
          else if (slotIdx === 1 && !isExoticRepeater) repeaterGrip = partSlug;
          else if (slotIdx === 2) repeaterMod = partSlug;
        }
      } else {
        if (pKind === 'specials' && !isExoticMelee) weaponSpecial = partSlug;
        else if (pKind === 'mods') weaponMod = partSlug;
        else if (!pKind) {
          if (slotIdx === 0 && !isExoticMelee) weaponSpecial = partSlug;
          else if (slotIdx === 1) weaponMod = partSlug;
        }
      }
    });
  }

  const hasAnyGear = data[2] > 0 || data[10] > 0 || data[13] > 0 || data[16] > 0 || data[19] > 0;
  const anySurged =
    (data[2] > 0 && data[3] >= 1) ||
    (data[10] > 0 && data[11] >= 1) ||
    (data[13] > 0 && data[14] >= 1) ||
    (data[16] > 0 && data[17] >= 1) ||
    (data[19] > 0 && data[20] >= 1);

  return {
    version: targetVersion,
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
    powerSurged: hasAnyGear ? anySurged : true,
    ...(isRepeater
      ? {
          repeaterChamber: isExoticRepeater ? null : repeaterChamber,
          repeaterGrip: isExoticRepeater ? null : repeaterGrip,
          repeaterMod,
        }
      : {}),
  };
}

export function encodeReforged1147(build: BuildState): string | null {
  try {
    const wId = build.weapon ? (weaponReverseMap[build.weapon] || 0) : 0;
    if (build.weapon && !wId) return null;

    const bondId = build.bondedWeapon ? (weaponReverseMap[build.bondedWeapon] || 0) : 0;

    const wc1 = build.weaponCells && build.weaponCells[0] ? (cellReverseMap[build.weaponCells[0]] || 0) : 0;
    const wc2 = build.weaponCells && build.weaponCells[1] ? (cellReverseMap[build.weaponCells[1]] || 0) : 0;

    const partKey = getWeaponPartMapKey(build.weapon);
    const isRepeater = partKey === 'Parts:Repeater';
    const isExoticRepeater = build.weapon === 'the_twin_suns';
    const isExoticMelee = Boolean(build.weapon && EXOTIC_MELEE_WEAPONS.has(build.weapon));

    let p1 = 0;
    let p2 = 0;
    let p3 = 0;

    if (wId > 0 && partKey && partsReverseMap[partKey]) {
      const pm = partsReverseMap[partKey];
      if (isRepeater) {
        if (!isExoticRepeater && build.repeaterChamber) p1 = pm[build.repeaterChamber] || 0;
        if (!isExoticRepeater && build.repeaterGrip) p2 = pm[build.repeaterGrip] || 0;
        if (build.repeaterMod) p3 = pm[build.repeaterMod] || 0;
      } else {
        const defParts = DEFAULT_WEAPON_PARTS_BY_KEY[partKey];
        const effectiveSpecial = isExoticMelee
          ? null
          : (build.weaponSpecial === undefined ? defParts?.special : build.weaponSpecial);
        const effectiveMod = build.weaponMod === undefined ? defParts?.mod : build.weaponMod;
        if (effectiveSpecial) p1 = pm[effectiveSpecial] || 0;
        if (effectiveMod) p2 = pm[effectiveMod] || 0;
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
      wId > 0 && build.powerSurged ? 1 : 0,
      wId > 0 ? wc1 : 0,
      wId > 0 ? wc2 : 0,
      wId > 0 ? p1 : 0,
      wId > 0 ? p2 : 0,
      wId > 0 ? p3 : 0,
      wId > 0 ? bondId : 0,
      hId,
      hId > 0 && build.powerSurged ? 1 : 0,
      hId > 0 ? hc : 0,
      tId,
      tId > 0 && build.powerSurged ? 1 : 0,
      tId > 0 ? tc : 0,
      aId,
      aId > 0 && build.powerSurged ? 1 : 0,
      aId > 0 ? ac : 0,
      lId,
      lId > 0 && build.powerSurged ? 1 : 0,
      lId > 0 ? lc : 0,
      ltId,
      ltId > 0 ? ltc : 0,
      oId,
    ];

    return sqidsV8.encode(params);
  } catch (err) {
    console.error('Failed to export to dauntless-builder-reforged format:', err);
    return null;
  }
}

export function exportToDauntlessBuilder(build: BuildState): string | null {
  if (build.version === '1.4.4') return null;
  if (build.version === '2.1.1') return encodeAwakening211(build);
  if (build.version === '1.6.2') return encodeDF162(build);

  const sqid = encodeReforged1147(build);
  if (!sqid) return null;
  return build.version === '1.12.0' ? `112.${sqid}` : sqid;
}

/**
 * Generates direct share/import links across this builder and external community builders:
 * - Dauntless Gear Builder (This Site — All Patches)
 * - reforged.dauntless-builder.com (Patch 1.14.7)
 * - dauntless-builder.com (Patch 2.1.1)
 * - builder.dauntlessforever.com (Patches 1.6.2 & 1.14.7)
 */
export function getSharePlatformLinks(build: BuildState, ownUrl: string): SharePlatformLink[] {
  const ver = build.version || '1.14.7';
  const ownDomain =
    typeof window !== 'undefined' && window.location.host
      ? `${window.location.host}${window.location.pathname.replace(/\/$/, '')}`
      : 'duddyx5.github.io/dauntless-gear-builder';

  const reforgedCompatible = ver === '1.14.7';
  const reforgedSqid = reforgedCompatible ? encodeReforged1147(build) : null;

  const awakeningCompatible = ver === '2.1.1';
  const awakeningSqid = awakeningCompatible ? encodeAwakening211(build) : null;

  const dfCompatible = ver === '1.6.2' || ver === '1.14.7';
  const dfCode = ver === '1.6.2' ? encodeDF162(build) : ver === '1.14.7' ? reforgedSqid : null;

  return [
    {
      id: 'self',
      name: 'Dauntless Gear Builder (This Site)',
      domain: ownDomain,
      supportedPatches: ['1.4.4', '1.6.2', '1.12.0', '1.14.7', '2.1.1'],
      badgeLabel: 'All Patches',
      description: `Direct short link to open this Patch ${ver} loadout right here.`,
      isCompatible: true,
      url: ownUrl,
      switchPatches: [],
    },
    {
      id: 'reforged-db',
      name: 'Reforged Dauntless Builder',
      domain: 'reforged.dauntless-builder.com',
      supportedPatches: ['1.14.7'],
      badgeLabel: 'Patch 1.14.7',
      description: 'Generate a /b/ link to view or import directly on reforged.dauntless-builder.com.',
      isCompatible: reforgedCompatible && Boolean(reforgedSqid),
      url: reforgedSqid ? `https://reforged.dauntless-builder.com/b/${reforgedSqid}` : null,
      switchPatches: ['1.14.7'],
    },
    {
      id: 'awakening-db',
      name: 'Dauntless Builder (Awakening)',
      domain: 'dauntless-builder.com',
      supportedPatches: ['2.1.1'],
      badgeLabel: 'Patch 2.1.1',
      description: 'Generate a /b/ link with dual weapons, talents & lantern cores for dauntless-builder.com.',
      isCompatible: awakeningCompatible && Boolean(awakeningSqid),
      url: awakeningSqid ? `https://dauntless-builder.com/b/${awakeningSqid}` : null,
      switchPatches: ['2.1.1'],
    },
    {
      id: 'dauntless-forever',
      name: 'Dauntless Forever Builder',
      domain: 'builder.dauntlessforever.com',
      supportedPatches: ['1.6.2', '1.14.7'],
      badgeLabel: '1.6.2 & 1.14.7',
      description: 'Generate a #b. link to open directly on Dauntless Forever (builder.dauntlessforever.com).',
      isCompatible: dfCompatible && Boolean(dfCode),
      url: dfCode ? `https://builder.dauntlessforever.com/#b.${dfCode}` : null,
      switchPatches: ['1.6.2', '1.14.7'],
    },
  ];
}
