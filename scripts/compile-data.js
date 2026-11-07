import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

function interpolate(template, values) {
  if (template === null || template === undefined) return '';
  if (Array.isArray(template)) {
    return template
      .filter(item => item !== null && item !== undefined)
      .map(item => interpolate(item, values))
      .filter(str => typeof str === 'string' && str.trim().length > 0)
      .join('. ')
      .replace(/\.\s*\./g, '.');
  }
  if (typeof template !== 'string') return String(template);
  let res = template.replace(/\{\{\s*NL\s*\}\}/gi, '\n');
  if (!values) return res;
  return res.replace(/\{+\s*(\w+)\s*\}+/g, (match, key) => {
    if (values[key] !== undefined) return values[key];
    const lowerKey = key.toLowerCase();
    for (const [vKey, vVal] of Object.entries(values)) {
      if (vKey.toLowerCase() === lowerKey) return vVal;
    }
    return match;
  });
}

const POWER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><path d="M64 8 L120 64 L64 120 L8 64 Z" fill="%23ef4444" fill-opacity="0.2" stroke="%23ef4444" stroke-width="4" stroke-linejoin="round"/><g fill="%23ffffff"><path d="M38 90 L34 86 L78 42 L82 34 L88 34 L94 40 L94 46 L86 50 Z" /><path d="M32 96 L26 90 L32 84 L38 90 Z" /><path d="M46 80 L38 72 L42 68 L50 76 Z" /><path d="M90 90 L94 86 L50 42 L46 34 L40 34 L34 40 L34 46 L42 50 Z" /><path d="M96 96 L102 90 L96 84 L90 90 Z" /><path d="M82 80 L90 72 L86 68 L78 76 Z" /><polygon points="64,48 72,64 64,80 56,64" fill="%23fca5a5" /></g></svg>`;

const DEFENCE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><path d="M64 12 L110 26 C110 74 86 106 64 118 C42 106 18 74 18 26 Z" fill="%2310b981" fill-opacity="0.2" stroke="%2310b981" stroke-width="4" stroke-linejoin="round"/><g fill="%23ffffff"><path d="M64 24 L96 34 C96 68 78 92 64 102 C50 92 32 68 32 34 Z" fill="none" stroke="%23ffffff" stroke-width="3" /><path d="M64 36 L86 44 C86 64 74 80 64 88 C54 80 42 64 42 44 Z" fill="%236ee7b7" fill-opacity="0.5" /><polygon points="64,46 76,58 64,74 52,58" fill="%23ffffff" /></g></svg>`;

const TECHNIQUE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><polygon points="64,10 114,35 114,93 64,118 14,93 14,35" fill="%23eab308" fill-opacity="0.2" stroke="%23eab308" stroke-width="4" stroke-linejoin="round"/><g fill="%23ffffff"><path d="M64 24 C72 44 82 62 100 70 C84 76 68 70 54 56 C44 46 40 34 42 26 C48 24 56 23 64 24 Z" /><path d="M40 34 L28 46 L34 52 L46 40 Z" /><path d="M64 104 C56 84 46 66 28 58 C44 52 60 58 74 72 C84 82 88 94 86 102 C80 104 72 105 64 104 Z" /><path d="M88 94 L100 82 L94 76 L82 88 Z" /><circle cx="64" cy="64" r="6" fill="%23fef08a" /></g></svg>`;

const MOBILITY_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><path d="M20 70 C20 36 50 16 94 14 C98 50 82 86 44 110 C30 100 20 86 20 70 Z" fill="%2306b6d4" fill-opacity="0.2" stroke="%2306b6d4" stroke-width="4" stroke-linejoin="round"/><g fill="%23ffffff"><path d="M36 68 C42 46 64 30 100 24 C88 42 78 54 52 64 C44 68 38 68 36 68 Z" /><path d="M32 78 C38 62 56 50 86 44 C76 60 64 72 44 80 C38 82 34 80 32 78 Z" /><path d="M32 90 C38 78 52 70 74 64 C64 76 54 86 38 92 C34 92 32 91 32 90 Z" /></g></svg>`;

const UTILITY_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><polygon points="40,12 88,12 116,40 116,88 88,116 40,116 12,88 12,40" fill="%23a855f7" fill-opacity="0.2" stroke="%23a855f7" stroke-width="4" stroke-linejoin="round"/><g fill="%23ffffff"><path d="M56 22 C56 16 72 16 72 22 L76 28 L52 28 Z" /><path d="M46 32 L82 32 L88 48 L78 86 L50 86 L40 48 Z" fill="none" stroke="%23ffffff" stroke-width="3" /><polygon points="64,42 76,58 64,74 52,58" fill="%23e9d5ff" /><circle cx="64" cy="58" r="4" fill="%23ffffff" /><path d="M46 92 L82 92 L86 102 L42 102 Z" /></g></svg>`;

const BARREL_ICONS = {
  animus_barrel: '/assets/icons/elements/Terra.png',
  blizzard_barrel: '/assets/icons/elements/Frost.png',
  cryo_barrel: '/assets/icons/elements/Frost.png',
  dawnstar_barrel: '/assets/icons/elements/Radiant.png',
  dynamic_carbine: '/assets/icons/elements/Shock.png',
  eldritch_barrel: '/assets/icons/elements/Umbral.png',
  inferno_barrel: '/assets/icons/elements/Blaze.png',
  standard_barrel: '/assets/icons/weapons/generic/RecruitsRepeaters.png',
  storm_barrel: '/assets/icons/elements/Shock.png',
  sylvan_barrel: '/assets/icons/elements/Terra.png',
  twilight_barrel: '/assets/icons/elements/Umbral.png',
  volcanic_barrel: '/assets/icons/elements/Blaze.png',
};

const PRISM_ICONS = {
  brilliant_prism: '/assets/icons/elements/Radiant.png',
  eclipse_prism: '/assets/icons/elements/Umbral.png',
  ferocious_prism: '/assets/icons/perks/Prismatic.png',
  firestorm_prism: '/assets/icons/elements/Blaze.png',
  frostbite_prism: '/assets/icons/elements/Frost.png',
  glacial_prism: '/assets/icons/elements/Frost.png',
  primal_prism: '/assets/icons/elements/Terra.png',
  searing_prism: '/assets/icons/elements/Blaze.png',
  snowdrift_prism: '/assets/icons/elements/Frost.png',
  stoneheart_prism: '/assets/icons/elements/Terra.png',
};

function getCellCategoryIconPath(slot) {
  const key = (slot || 'prismatic').toLowerCase().trim();
  switch (key) {
    case 'power':
      return POWER_SVG;
    case 'technique':
      return TECHNIQUE_SVG;
    case 'defence':
    case 'defense':
      return DEFENCE_SVG;
    case 'mobility':
      return MOBILITY_SVG;
    case 'utility':
      return UTILITY_SVG;
    case 'alacrity':
      return '/assets/icons/perks/Alacrity.png';
    case 'brutality':
      return '/assets/icons/perks/Brutality.png';
    case 'finesse':
      return '/assets/icons/perks/Finesse.png';
    case 'fortitude':
      return '/assets/icons/perks/Fortitude.png';
    case 'insight':
      return '/assets/icons/perks/Insight.png';
    case 'prismatic':
    default:
      return '/assets/icons/perks/Prismatic.png';
  }
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function scanDir(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanDir(full));
    } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      results.push(full);
    }
  }
  return results;
}

// --------------------------------------------------------------------------
// GENERIC YAML COMPILER (Used for 1.6.2, 1.12.0, 1.14.7)
// --------------------------------------------------------------------------
function compileYamlPatch(patchId, baseDir) {
  const outDir = path.join(process.cwd(), `public/data/patches/${patchId}`);
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Perks
  const perksMap = {};
  const perkFiles = scanDir(path.join(baseDir, 'perks'));
  for (const f of perkFiles) {
    const doc = yaml.load(fs.readFileSync(f, 'utf8'));
    if (!doc || !doc.name) continue;
    const id = slugify(doc.name);
    const tiers = {};
    if (doc.effects) {
      for (const [tierNum, tierObj] of Object.entries(doc.effects)) {
        const combinedValues = { ...(doc.values || {}), ...(tierObj.values || {}) };
        tiers[tierNum] = interpolate(tierObj.description, combinedValues);
      }
    }
    perksMap[id] = {
      id,
      name: doc.name,
      type: doc.type || 'General',
      description: interpolate(doc.description, doc.values) || '',
      icon: doc.icon || `/assets/icons/perks/${doc.name.replace(/\s+/g, '')}.png`,
      tiers
    };
  }

  // 2. Cells
  const cellsList = [];
  const cellFiles = scanDir(path.join(baseDir, 'cells'));
  for (const f of cellFiles) {
    const doc = yaml.load(fs.readFileSync(f, 'utf8'));
    if (!doc || !doc.name) continue;
    const slot = doc.slot || path.basename(path.dirname(f));
    const variants = [];
    if (doc.variants) {
      for (const [varName, varData] of Object.entries(doc.variants)) {
        const levelMatch = varName.match(/\+(\d+)/);
        const level = levelMatch ? parseInt(levelMatch[1], 10) : 3;
        const perkEntries = Object.entries(varData.perks || {});
        const perkName = perkEntries.length > 0 ? perkEntries[0][0] : doc.name.replace(/ Cell$/i, '');
        const perkVal = perkEntries.length > 0 ? perkEntries[0][1] : level;
        variants.push({
          name: varName,
          level,
          rarity: varData.rarity || (level === 1 ? 'uncommon' : level === 2 ? 'rare' : 'epic'),
          perkId: slugify(perkName),
          perkName,
          perkValue: perkVal
        });
      }
    }
    cellsList.push({
      id: slugify(doc.name),
      name: doc.name,
      slot: slot.toLowerCase(),
      slotName: slot.charAt(0).toUpperCase() + slot.slice(1),
      icon: doc.icon || getCellCategoryIconPath(slot),
      variants: variants.sort((a, b) => a.level - b.level)
    });
  }

  // 3. Armours
  const armoursList = [];
  const armourFiles = scanDir(path.join(baseDir, 'armours'));
  for (const f of armourFiles) {
    const doc = yaml.load(fs.readFileSync(f, 'utf8'));
    if (!doc || !doc.name) continue;
    const type = (doc.type || 'Head').toLowerCase();
    const behemothDir = path.basename(path.dirname(f));
    const behemoth = doc.behemoth || (behemothDir.charAt(0).toUpperCase() + behemothDir.slice(1));

    // For 1.4.4 (Pre-Reforged, Nov 2020), Urska was released in 1.5.3 (Feb 2021)
    if (patchId === '1.4.4' && behemoth.toLowerCase() === 'urska') {
      continue;
    }

    const desc = interpolate(doc.description, {
      typeAlt: doc.type,
      type: doc.type,
      behemoth
    });

    let cellSocket = 'prismatic';
    if (typeof doc.cells === 'string') {
      cellSocket = doc.cells.toLowerCase();
    } else if (Array.isArray(doc.cells) && doc.cells.length > 0) {
      cellSocket = String(doc.cells[0]).toLowerCase();
    }

    const perks = [];
    if (Array.isArray(doc.perks)) {
      const perkGroups = {};
      for (const p of doc.perks) {
        if (!p.name) continue;
        if (!perkGroups[p.name]) perkGroups[p.name] = [];
        perkGroups[p.name].push(p);
      }
      for (const [pName, group] of Object.entries(perkGroups)) {
        const psPerk = group.find(p => p.powerSurged === true || p.from === 1 || p.to === 1) || group[group.length - 1];
        const basePerk = group.find(p => p.powerSurged === false || p.from === 0 || p.to === 0) || group[0];
        perks.push({
          id: slugify(pName),
          name: pName,
          value: psPerk ? psPerk.value : 3,
          baseValue: basePerk ? basePerk.value : (psPerk ? psPerk.value : 1)
        });
      }
    }

    let baseResistance = 20;
    let maxResistance = 30;
    if (patchId === '1.4.4') {
      baseResistance = 25;
      maxResistance = 137.5;
    } else if (doc.resistance) {
      if (typeof doc.resistance.base === 'number') {
        baseResistance = doc.resistance.base;
      } else if (typeof doc.resistance[0] === 'number') {
        baseResistance = doc.resistance[0];
      }
      if (typeof doc.resistance.powerSurged === 'number') {
        maxResistance = doc.resistance.powerSurged;
      } else if (typeof doc.resistance[1] === 'number') {
        maxResistance = doc.resistance[1];
      }
    }

    armoursList.push({
      id: slugify(doc.name),
      name: doc.name,
      slot: type,
      slotName: doc.type || 'Head',
      behemoth,
      icon: doc.icon || '',
      description: desc,
      strength: doc.strength || null,
      weakness: doc.weakness || null,
      baseResistance,
      maxResistance,
      cellSocket,
      perks
    });
  }

  // 4. Weapons
  const weaponsList = [];
  const weaponFiles = scanDir(path.join(baseDir, 'weapons'));
  for (const f of weaponFiles) {
    const doc = yaml.load(fs.readFileSync(f, 'utf8'));
    if (!doc || !doc.name) continue;
    const type = (doc.type || 'Sword').toLowerCase();
    const behemothDir = path.basename(path.dirname(f));
    const behemoth = doc.behemoth || (behemothDir.charAt(0).toUpperCase() + behemothDir.slice(1));

    // For 1.4.4 (Pre-Reforged, Nov 2020), Urska was released in 1.5.3 (Feb 2021)
    if (patchId === '1.4.4' && behemoth.toLowerCase() === 'urska') {
      continue;
    }

    const desc = interpolate(doc.description, {
      type: doc.type,
      behemoth
    });

    const cellSockets = [];
    if (Array.isArray(doc.cells)) {
      doc.cells.forEach(c => cellSockets.push(String(c).toLowerCase()));
    } else if (typeof doc.cells === 'string') {
      cellSockets.push(doc.cells.toLowerCase());
    }

    const perks = [];
    if (Array.isArray(doc.perks)) {
      const perkGroups = {};
      for (const p of doc.perks) {
        if (!p.name) continue;
        if (!perkGroups[p.name]) perkGroups[p.name] = [];
        perkGroups[p.name].push(p);
      }
      for (const [pName, group] of Object.entries(perkGroups)) {
        const psPerk = group.find(p => p.powerSurged === true || p.from === 1 || p.to === 1) || group[group.length - 1];
        const basePerk = group.find(p => p.powerSurged === false || p.from === 0 || p.to === 0) || group[0];
        perks.push({
          id: slugify(pName),
          name: pName,
          value: psPerk ? psPerk.value : 3,
          baseValue: basePerk ? basePerk.value : (psPerk ? psPerk.value : 1)
        });
      }
    }

    let uniqueEffect = null;
    if (Array.isArray(doc.unique_effects) && doc.unique_effects.length > 0) {
      const ue = doc.unique_effects.find(u => u.powerSurged === true || u.from === 1 || u.to === 1) || doc.unique_effects[doc.unique_effects.length - 1];
      const combinedValues = { ...(doc.values || {}), ...(ue.values || {}) };
      uniqueEffect = interpolate(ue.description, combinedValues);
    }

    let basePower = 80;
    let maxPower = 120;
    if (patchId === '1.4.4') {
      basePower = 100;
      maxPower = 550;
    } else if (doc.power) {
      if (typeof doc.power.base === 'number') {
        basePower = doc.power.base;
      } else if (typeof doc.power[0] === 'number') {
        basePower = doc.power[0];
      }
      if (typeof doc.power.powerSurged === 'number') {
        maxPower = doc.power.powerSurged;
      } else if (typeof doc.power[1] === 'number') {
        maxPower = doc.power[1];
      }
    }

    const isLegendary = !!doc.bond || ['Malkarion', 'Torgadoro', 'Thrax', 'Agarus', 'Urska', 'Chronovore'].includes(behemoth);
    const bondElement = (doc.bond && doc.bond.elemental) || (isLegendary ? (doc.elemental || 'Neutral') : null);

    const legendaryIcons = {
      'Agarus': '/assets/icons/abilities/AgarusLegendaryWeaponAbility.png',
      'Chronovore': '/assets/icons/abilities/ChronovoreLegendaryWeaponAbility.png',
      'Malkarion': '/assets/icons/abilities/MalkarionLegendaryWeaponAbility.png',
      'Thrax': '/assets/icons/abilities/ThraxLegendaryWeaponAbility.png',
      'Torgadoro': '/assets/icons/abilities/TorgadoroLegendaryWeaponAbility.png',
      'Urska': '/assets/icons/abilities/UrskaLegendaryWeaponAbility.png'
    };
    const legendaryIcon = isLegendary ? (legendaryIcons[behemoth] || null) : null;

    weaponsList.push({
      id: slugify(doc.name),
      name: doc.name,
      type,
      typeName: doc.type || 'Sword',
      behemoth,
      icon: doc.icon || '',
      description: desc,
      damageType: doc.damage || 'Cutting',
      element: doc.elemental || 'Neutral',
      basePower,
      maxPower,
      cellSockets,
      perks,
      uniqueEffect,
      isLegendary,
      bondElement,
      legendaryIcon
    });
  }

  // 5. Lanterns
  const lanternsList = [];
  const lanternFiles = scanDir(path.join(baseDir, 'lanterns'));
  for (const f of lanternFiles) {
    const doc = yaml.load(fs.readFileSync(f, 'utf8'));
    if (!doc || !doc.name) continue;
    let holdDesc = '';
    let instantDesc = '';
    if (doc.lantern_ability) {
      holdDesc = interpolate(doc.lantern_ability.hold, doc.values);
      instantDesc = interpolate(doc.lantern_ability.instant, doc.values);
    }
    const cellSocket = (typeof doc.cells === 'string' ? doc.cells : 'prismatic').toLowerCase();

    lanternsList.push({
      id: slugify(doc.name),
      name: doc.name,
      icon: doc.icon || '',
      description: doc.description || '',
      cellSocket,
      holdAbility: holdDesc,
      instantAbility: instantDesc
    });
  }

  // 6. Omnicells (may not exist in 1.6.2)
  const omnicellsList = [];
  const omnicellDir = path.join(baseDir, 'omnicells');
  if (fs.existsSync(omnicellDir)) {
    const omnicellFiles = scanDir(omnicellDir);
    for (const f of omnicellFiles) {
      const doc = yaml.load(fs.readFileSync(f, 'utf8'));
      if (!doc || !doc.name) continue;
      const passiveDesc = interpolate(doc.passive, { ...(doc.values || {}), ...(doc.passive_values || {}) });
      const activeDesc = interpolate(doc.active, { ...(doc.values || {}), ...(doc.active_values || {}) });

      omnicellsList.push({
        id: slugify(doc.name),
        name: doc.name,
        icon: doc.icon || '',
        abilityIcon: doc.ability_icon || '',
        passive: passiveDesc,
        active: activeDesc,
        cooldown: (doc.active_values && doc.active_values.cooldown) || 0
      });
    }
  }

  // 7. Repeater Parts
  const repeaterParts = {
    barrels: [],
    chambers: [],
    grips: [],
    prisms: [],
    mods: []
  };

  const repeaterPartsDir = path.join(baseDir, 'parts/repeater');
  if (fs.existsSync(repeaterPartsDir)) {
    const categories = ['barrels', 'chambers', 'grips', 'prisms', 'mods'];
    for (const cat of categories) {
      const catDir = path.join(repeaterPartsDir, cat);
      if (fs.existsSync(catDir)) {
        const files = scanDir(catDir);
        for (const f of files) {
          const doc = yaml.load(fs.readFileSync(f, 'utf8'));
          if (!doc || !doc.name) continue;
          const id = slugify(doc.name);

          // Urska barrel was 1.5.3+
          if (patchId === '1.4.4' && (id.includes('cryo_cannon') || id.includes('urska'))) {
            continue;
          }

          let icon = doc.icon || '';
          if (icon && !fs.existsSync(path.join(process.cwd(), 'public', icon.replace(/^\//, '')))) {
            if (BARREL_ICONS[id]) icon = BARREL_ICONS[id];
            else if (PRISM_ICONS[id]) icon = PRISM_ICONS[id];
            else icon = '/assets/icons/perks/Prismatic.png';
          } else if (!icon) {
            if (BARREL_ICONS[id]) icon = BARREL_ICONS[id];
            else if (PRISM_ICONS[id]) icon = PRISM_ICONS[id];
            else icon = '/assets/icons/perks/Prismatic.png';
          }

          let basePower = 40;
          let maxPower = 120;
          if (cat === 'barrels') {
            if (patchId === '1.4.4') {
              basePower = 100;
              maxPower = 550;
            } else if (doc.power) {
              if (typeof doc.power.base === 'number') basePower = doc.power.base;
              else if (typeof doc.power[0] === 'number') basePower = doc.power[0];
              if (typeof doc.power.powerSurged === 'number') maxPower = doc.power.powerSurged;
              else if (typeof doc.power[1] === 'number') maxPower = doc.power[1];
            }
          }

          const rawEffects = (Array.isArray(doc.part_effect) ? doc.part_effect : (doc.part_effect ? [doc.part_effect] : []))
            .map(eff => typeof eff === 'string' ? interpolate(eff, doc.values || {}) : eff);
          const isLegendary = ['Animus Barrel', 'Dynamic Carbine', 'Eldritch Barrel', 'Volcanic Barrel'].includes(doc.name) || rawEffects.some(e => typeof e === 'string' && e.includes('Legendary Ability'));

          repeaterParts[cat].push({
            id,
            name: doc.name,
            slot: cat.slice(0, -1), // barrel, chamber, grip, prism, mod
            description: doc.description || '',
            icon,
            element: doc.elemental || (cat === 'barrels' ? 'Neutral' : null),
            basePower: cat === 'barrels' ? basePower : undefined,
            maxPower: cat === 'barrels' ? maxPower : undefined,
            partEffect: rawEffects,
            uniqueEffect: (cat === 'prisms' || cat === 'barrels') && rawEffects.length > 0 ? rawEffects.join('. ') : undefined,
            isLegendary
          });
        }
      }
    }
  }

  // 8. Melee Weapon Parts (Specials and Mods for Sword, Axe, Hammer, Chain Blades, War Pike, Aether Strikers)
  const weaponParts = {
    sword: { specials: [], mods: [] },
    axe: { specials: [], mods: [] },
    hammer: { specials: [], mods: [] },
    chainblades: { specials: [], mods: [] },
    warpike: { specials: [], mods: [] },
    aetherstrikers: { specials: [], mods: [] }
  };

  const partsDir = path.join(baseDir, 'parts');
  if (fs.existsSync(partsDir)) {
    const meleeTypes = ['sword', 'axe', 'hammer', 'chainblades', 'warpike', 'aetherstrikers'];
    for (const wt of meleeTypes) {
      const wtDir = path.join(partsDir, wt);
      if (!fs.existsSync(wtDir)) continue;

      for (const cat of ['specials', 'mods']) {
        const catDir = path.join(wtDir, cat);
        if (!fs.existsSync(catDir)) continue;

        const files = scanDir(catDir);
        for (const f of files) {
          const doc = yaml.load(fs.readFileSync(f, 'utf8'));
          if (!doc || !doc.name) continue;

          const rawEffects = (Array.isArray(doc.part_effect) ? doc.part_effect : (doc.part_effect ? [doc.part_effect] : []))
            .map(eff => typeof eff === 'string' ? interpolate(eff, doc.values || {}) : eff);

          weaponParts[wt][cat].push({
            id: slugify(doc.name),
            name: doc.name,
            category: cat.slice(0, -1), // special or mod
            weaponType: wt,
            icon: doc.icon || '',
            description: rawEffects.join(' '),
            partEffect: rawEffects,
            tags: doc.tags || []
          });
        }
      }
    }
  }

  fs.writeFileSync(path.join(outDir, 'perks.json'), JSON.stringify(perksMap, null, 2));
  fs.writeFileSync(path.join(outDir, 'cells.json'), JSON.stringify(cellsList, null, 2));
  fs.writeFileSync(path.join(outDir, 'armour.json'), JSON.stringify(armoursList, null, 2));
  fs.writeFileSync(path.join(outDir, 'weapons.json'), JSON.stringify(weaponsList, null, 2));
  fs.writeFileSync(path.join(outDir, 'lanterns.json'), JSON.stringify(lanternsList, null, 2));
  fs.writeFileSync(path.join(outDir, 'omnicells.json'), JSON.stringify(omnicellsList, null, 2));
  fs.writeFileSync(path.join(outDir, 'repeaterParts.json'), JSON.stringify(repeaterParts, null, 2));
  fs.writeFileSync(path.join(outDir, 'weaponParts.json'), JSON.stringify(weaponParts, null, 2));

  console.log(`[Patch ${patchId}] Compiled:
  - Perks: ${Object.keys(perksMap).length}
  - Cells: ${cellsList.length}
  - Armours: ${armoursList.length}
  - Weapons: ${weaponsList.length}
  - Lanterns: ${lanternsList.length}
  - Omnicells: ${omnicellsList.length}
  - Repeater Parts: Barrels=${repeaterParts.barrels.length}, Chambers=${repeaterParts.chambers.length}, Grips=${repeaterParts.grips.length}, Prisms=${repeaterParts.prisms.length}, Mods=${repeaterParts.mods.length}`);
}

// --------------------------------------------------------------------------
// COMPILE 2.1.1 (Awakening)
// --------------------------------------------------------------------------
function compileAwakening() {
  const filePath = path.join(
    '/Users/justinherbert/.gemini/antigravity/brain/7df35147-ed2a-430a-91fe-0ec5817bcd6c/.system_generated/steps/14/content.md'
  );
  if (!fs.existsSync(filePath)) {
    console.warn("Could not find step 14 content for 2.1.1, skipping 2.1.1");
    return;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw.slice(raw.indexOf('{')));

  const outDir = path.join(process.cwd(), 'public/data/patches/2.1.1');
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Perks
  const perksMap = {};
  for (const [pId, p] of Object.entries(data.perks || {})) {
    const enName = p.name && (p.name.en || p.name);
    const id = slugify(enName || `perk_${pId}`);
    let desc = (p.effect && (p.effect.en || p.effect)) || '';
    if (p.values) {
      const vals = {};
      p.values.forEach(v => { vals[v.name] = v.value; });
      desc = interpolate(desc.replace(/\{(\w+)\}/g, '{{$1}}'), vals);
    }
    perksMap[id] = {
      id,
      name: enName,
      type: p.type || 'General',
      description: desc,
      icon: `/assets/icons/perks/${String(enName).replace(/\s+/g, '')}.png`,
      tiers: {
        1: desc,
        2: desc,
        3: desc,
        4: desc,
        5: desc,
        6: desc
      }
    };
  }

  // 2. Weapons
  const weaponsList = [];
  for (const [wId, w] of Object.entries(data.weapons || {})) {
    const enName = w.name && (w.name.en || w.name);
    const type = (w.type || 'sword').toLowerCase();
    const specialDesc = (w.special && w.special.description && (w.special.description.en || w.special.description)) || '';
    const activeDesc = (w.active && w.active.description && (w.active.description.en || w.active.description)) || '';

    weaponsList.push({
      id: slugify(enName || `weapon_${wId}`),
      name: enName,
      type,
      typeName: type.charAt(0).toUpperCase() + type.slice(1),
      behemoth: 'Awakened',
      icon: w.icon || '',
      description: specialDesc,
      damageType: 'Cutting',
      element: (w.element || 'neutral').charAt(0).toUpperCase() + (w.element || 'neutral').slice(1),
      basePower: 100,
      maxPower: 140,
      cellSockets: ['prismatic', 'prismatic'],
      perks: [],
      uniqueEffect: activeDesc || specialDesc,
      isLegendary: !!w.active
    });
  }

  // 3. Armours
  const armoursList = [];
  for (const [aId, a] of Object.entries(data.armours || {})) {
    const enName = a.name && (a.name.en || a.name);
    const slot = (a.type || a.slot || 'head').toLowerCase();
    armoursList.push({
      id: slugify(enName || `armour_${aId}`),
      name: enName,
      slot: slot.includes('head') ? 'head' : slot.includes('torso') || slot.includes('chest') ? 'torso' : slot.includes('arm') ? 'arms' : 'legs',
      slotName: slot.charAt(0).toUpperCase() + slot.slice(1),
      behemoth: 'Awakened',
      icon: a.icon || '',
      description: '',
      strength: a.element || null,
      weakness: null,
      baseResistance: 30,
      maxResistance: 40,
      cellSocket: 'prismatic',
      perks: []
    });
  }

  // 4. Lantern Cores
  const lanternsList = [];
  for (const [cId, core] of Object.entries(data.lanternCores || {})) {
    const enName = core.name && (core.name.en || core.name);
    let activeDesc = core.active && core.active.description && (core.active.description.en || core.active.description);
    if (activeDesc && core.active.values) {
      const vals = {};
      core.active.values.forEach(v => { vals[v.name] = v.value; });
      activeDesc = interpolate(activeDesc.replace(/\{(\w+)\}/g, '{{$1}}'), vals);
    }

    let passiveDesc = core.passive && core.passive.description && (core.passive.description.en || core.passive.description);
    if (passiveDesc && core.passive.values) {
      const vals = {};
      core.passive.values.forEach(v => { vals[v.name] = v.value; });
      passiveDesc = interpolate(passiveDesc.replace(/\{(\w+)\}/g, '{{$1}}'), vals);
    }

    lanternsList.push({
      id: slugify(enName || `core_${cId}`),
      name: enName,
      icon: core.icon || '',
      description: passiveDesc || '',
      cellSocket: 'prismatic',
      holdAbility: activeDesc || '',
      instantAbility: passiveDesc || ''
    });
  }

  fs.writeFileSync(path.join(outDir, 'perks.json'), JSON.stringify(perksMap, null, 2));
  fs.writeFileSync(path.join(outDir, 'cells.json'), JSON.stringify([], null, 2));
  fs.writeFileSync(path.join(outDir, 'armour.json'), JSON.stringify(armoursList, null, 2));
  fs.writeFileSync(path.join(outDir, 'weapons.json'), JSON.stringify(weaponsList, null, 2));
  fs.writeFileSync(path.join(outDir, 'lanterns.json'), JSON.stringify(lanternsList, null, 2));
  fs.writeFileSync(path.join(outDir, 'omnicells.json'), JSON.stringify([], null, 2));
  fs.writeFileSync(path.join(outDir, 'repeaterParts.json'), JSON.stringify({ barrels: [], chambers: [], grips: [], prisms: [], mods: [] }, null, 2));
  fs.writeFileSync(path.join(outDir, 'weaponParts.json'), JSON.stringify({}, null, 2));

  console.log(`[Patch 2.1.1] Compiled:
  - Perks: ${Object.keys(perksMap).length}
  - Weapons: ${weaponsList.length}
  - Armours: ${armoursList.length}
  - Lantern Cores: ${lanternsList.length}`);
}

// --------------------------------------------------------------------------
// MANIFEST (Supporting 1.4.4, 1.6.2, 1.12.0, 1.14.7, 2.1.1)
// --------------------------------------------------------------------------
function writeManifest() {
  const manifest = {
    default: "1.14.7",
    versions: [
      {
        id: "1.4.4",
        name: "Patch 1.4.4 (Classic / Pre-Reforged)",
        releaseDate: "2020-11-05",
        description: "The legacy pre-Reforged era featuring +15 gear upgrading, Mastery progression, original cell categories (Power, Technique, Defence, Mobility, Utility), and no Power Surging or Omnicells.",
        hasOmnicells: false,
        hasCellSockets: true,
        hasPowerSurge: false,
        era: "Classic"
      },
      {
        id: "1.6.2",
        name: "Patch 1.6.2 (Early Reforged)",
        releaseDate: "2021-05-20",
        description: "Early Reforged era with original cell socket types (Power, Technique, Defence, Mobility, Utility), Aetherheart Power Surging, and no Omnicells.",
        hasOmnicells: false,
        hasCellSockets: true,
        hasPowerSurge: true,
        era: "Reforged"
      },
      {
        id: "1.12.0",
        name: "Patch 1.12.0 (Reforged Mid-Era)",
        releaseDate: "2022-11-17",
        description: "Mid-Reforged update introducing the revised cell socket categories (Brutality, Finesse, Fortitude, Alacrity, Insight) and Omnicells.",
        hasOmnicells: true,
        hasCellSockets: true,
        hasPowerSurge: true,
        era: "Reforged"
      },
      {
        id: "1.14.7",
        name: "Patch 1.14.7 (Reforged Final)",
        releaseDate: "2023-11-30",
        description: "The peak Reforged meta with full Behemoth rosters (Frostwülf, Phaelanx, Fenroar), all 6 Omnicells, and expanded cell perks.",
        hasOmnicells: true,
        hasCellSockets: true,
        hasPowerSurge: true,
        era: "Reforged"
      },
      {
        id: "2.1.1",
        name: "Patch 2.1.1 (Awakening)",
        releaseDate: "2025-02-25",
        description: "The Awakening overhaul featuring Weapon Talents, Lantern Cores, and revised equipment progression.",
        hasOmnicells: false,
        hasCellSockets: false,
        hasPowerSurge: false,
        era: "Awakening"
      }
    ]
  };

  const manifestPath = path.join(process.cwd(), 'public/data/manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("Wrote manifest.json for 1.4.4, 1.6.2, 1.12.0, 1.14.7, 2.1.1");
}

// Compile all 5 versions requested
compileYamlPatch('1.4.4', path.join(process.cwd(), 'data-sources/patch-1.6.2/data'));
compileYamlPatch('1.6.2', path.join(process.cwd(), 'data-sources/patch-1.6.2/data'));
compileYamlPatch('1.12.0', path.join(process.cwd(), 'data-sources/patch-1.12.0/data'));
compileYamlPatch('1.14.7', path.join(process.cwd(), 'data-sources/reforged/data'));
compileAwakening();
writeManifest();
