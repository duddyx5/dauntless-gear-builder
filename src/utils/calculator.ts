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
import {
  importFromDauntlessBuilder,
  exportToDauntlessBuilder,
  isDauntlessBuilderUrl,
} from './dauntlessBuilderImport';

export const EXOTIC_WEAPON_IDS = new Set<string>([
  'the_hunger',
  'the_godhand',
  'molten_edict',
  'the_twin_suns',
  'silver_sword',
  'the_golden_claws',
]);

export const createEmptyBuild = (version: string = '1.14.7'): BuildState => {
  const defaultLvl = version === '1.4.4' ? 15 : 20;
  return {
    version,
    weapon: null,
    bondedWeapon: null,
    secondaryWeapon: null,
    weaponSpecial: null,
    weaponMod: null,
    gearLevels: {
      weapon: defaultLvl,
      secondaryWeapon: defaultLvl,
      head: defaultLvl,
      torso: defaultLvl,
      arms: defaultLvl,
      legs: defaultLvl,
    },
    weaponTalents: [0, 0, 0, 0, 0, 0, 0],
    secondaryWeaponTalents: [0, 0, 0, 0, 0, 0, 0],
    weaponCells: [null, null],
    repeaterBarrel: null,
    repeaterChamber: null,
    repeaterGrip: null,
    repeaterPrism: null,
    repeaterMod: null,
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
  };
};

export const DEFAULT_BUILD: BuildState = {
  version: '1.14.7',
  weapon: 'inferno_s_razor',
  bondedWeapon: null,
  secondaryWeapon: null,
  weaponSpecial: 'valiant_overdrive',
  weaponMod: 'dynamic_bladecore',
  repeaterBarrel: null,
  repeaterChamber: null,
  repeaterGrip: null,
  repeaterPrism: null,
  repeaterMod: null,
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
    name: '1.4.4 Classic Low-Life Meta (Sword)',
    description: 'Pre-Reforged +15 legacy meta build: Discipline, Iceborne, Rage, Wild Frenzy, Overpower, and Conduit at max +15 upgrade.',
    version: '1.4.4',
    era: 'Classic (Pre-Reforged)',
    tags: ['Sword', 'Blaze', 'Low-Life', 'Classic'],
    build: {
      version: '1.4.4',
      weapon: 'the_cauterizer',
      bondedWeapon: 'inferno_s_razor',
      gearLevels: { weapon: 15, head: 15, torso: 15, arms: 15, legs: 15 },
      weaponCells: ['wild_frenzy_cell:+3', 'conduit_cell:+3'],
      head: 'dark_watch',
      headCell: 'overpower_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'iceborne_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'discipline_cell:+3',
      legs: 'boreal_march',
      legsCell: 'wild_frenzy_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: false,
    }
  },
  {
    name: '1.4.4 Turmoil Frost Stagger (Axe)',
    description: 'Massive single-hit charging strikes with Turmoil of Boreus, Overpower +6, Rage +6, Iceborne +6, and Wild Frenzy.',
    version: '1.4.4',
    era: 'Classic (Pre-Reforged)',
    tags: ['Axe', 'Frost', 'Stagger', 'Classic'],
    build: {
      version: '1.4.4',
      weapon: 'turmoil_of_boreus',
      gearLevels: { weapon: 15, head: 15, torso: 15, arms: 15, legs: 15 },
      weaponCells: ['overpower_cell:+3', 'conduit_cell:+3'],
      head: 'dark_watch',
      headCell: 'overpower_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'iceborne_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'discipline_cell:+3',
      legs: 'boreal_march',
      legsCell: 'wild_frenzy_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: false,
    }
  },
  {
    name: '1.4.4 Skullforge Stagger Slam (Hammer)',
    description: 'Classic stamina shield build with The Skullforge, Magma Quake / Inferno\'s Burden, Overpower +6, Knockout King +6, and Molten.',
    version: '1.4.4',
    era: 'Classic (Pre-Reforged)',
    tags: ['Hammer', 'Blaze', 'Stagger', 'Classic'],
    build: {
      version: '1.4.4',
      weapon: 'magma_quake',
      bondedWeapon: 'inferno_s_burden',
      gearLevels: { weapon: 15, head: 15, torso: 15, arms: 15, legs: 15 },
      weaponCells: ['overpower_cell:+3', 'knockout_king_cell:+3'],
      head: 'the_skullforge',
      headCell: 'iceborne_cell:+3',
      torso: 'hellplate_cuirass',
      torsoCell: 'molten_cell:+3',
      arms: 'torgadoro_s_brawn',
      armsCell: 'knockout_king_cell:+3',
      legs: 'boreal_march',
      legsCell: 'iceborne_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: false,
    }
  },
  {
    name: '1.4.4 Scorching Serrated Whirl (Chain Blades)',
    description: 'High-speed attack flurry with Scorching Agonies / Inferno\'s Fangs, Rage +6, Wild Frenzy +6, and Overpower +6.',
    version: '1.4.4',
    era: 'Classic (Pre-Reforged)',
    tags: ['Chain Blades', 'Blaze', 'Speed', 'Classic'],
    build: {
      version: '1.4.4',
      weapon: 'scorching_agonies',
      bondedWeapon: 'inferno_s_fangs',
      gearLevels: { weapon: 15, head: 15, torso: 15, arms: 15, legs: 15 },
      weaponCells: ['wild_frenzy_cell:+3', 'conduit_cell:+3'],
      head: 'dark_watch',
      headCell: 'overpower_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'iceborne_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'discipline_cell:+3',
      legs: 'boreal_march',
      legsCell: 'wild_frenzy_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: false,
    }
  },
  {
    name: '1.4.4 Pyroclastic Piercing Wound (War Pike)',
    description: 'Classic high wound damage build with Pyroclastic Envoy / Inferno\'s Arrow, Overpower +6, Rage +6, and Iceborne +6.',
    version: '1.4.4',
    era: 'Classic (Pre-Reforged)',
    tags: ['War Pike', 'Blaze', 'Wound', 'Classic'],
    build: {
      version: '1.4.4',
      weapon: 'pyroclastic_envoy',
      bondedWeapon: 'inferno_s_arrow',
      gearLevels: { weapon: 15, head: 15, torso: 15, arms: 15, legs: 15 },
      weaponCells: ['wild_frenzy_cell:+3', 'conduit_cell:+3'],
      head: 'dark_watch',
      headCell: 'overpower_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'iceborne_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'discipline_cell:+3',
      legs: 'boreal_march',
      legsCell: 'wild_frenzy_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: false,
    }
  },
  {
    name: '1.4.4 Tectonic Mantra Blitz (Aether Strikers)',
    description: 'Blistering attack speed combo striker build with Tectonic Faults / Inferno\'s Flames, Overpower +6, Rage +6, and Wild Frenzy +6.',
    version: '1.4.4',
    era: 'Classic (Pre-Reforged)',
    tags: ['Aether Strikers', 'Blaze', 'DPS Meta', 'Classic'],
    build: {
      version: '1.4.4',
      weapon: 'tectonic_faults',
      bondedWeapon: 'inferno_s_flames',
      gearLevels: { weapon: 15, head: 15, torso: 15, arms: 15, legs: 15 },
      weaponCells: ['wild_frenzy_cell:+3', 'conduit_cell:+3'],
      head: 'dark_watch',
      headCell: 'overpower_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'iceborne_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'discipline_cell:+3',
      legs: 'boreal_march',
      legsCell: 'wild_frenzy_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: false,
    }
  },
  {
    name: '1.4.4 Ostian Modular Sharpshooter (Repeaters)',
    description: 'Classic Ostian Modular Repeater setup with Standard Barrel, Marksman Chamber, Captain\'s Grip, and Lucky Magazine.',
    version: '1.4.4',
    era: 'Classic (Pre-Reforged)',
    tags: ['Repeaters', 'Neutral', 'Ranged', 'Classic'],
    build: {
      version: '1.4.4',
      weapon: 'repeater',
      repeaterBarrel: 'standard_barrel',
      repeaterChamber: 'marksman_chamber',
      repeaterGrip: 'captain_s_grip',
      repeaterPrism: 'eclipse_prism',
      repeaterMod: 'lucky_magazine',
      gearLevels: { weapon: 15, head: 15, torso: 15, arms: 15, legs: 15 },
      weaponCells: ['wild_frenzy_cell:+3', 'conduit_cell:+3'],
      head: 'dark_watch',
      headCell: 'overpower_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'iceborne_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'discipline_cell:+3',
      legs: 'boreal_march',
      legsCell: 'wild_frenzy_cell:+3',
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
    name: '1.6.2 Early Reforged Low-Life Meta (Sword)',
    description: 'Power Surged low-life build combining Discipline, Iceborne, Rage & Wild Frenzy for constant 50% HP high DPS.',
    version: '1.6.2',
    era: 'Early Reforged',
    tags: ['Sword', 'Blaze', 'Low-Life', 'Crit'],
    build: {
      version: '1.6.2',
      weapon: 'the_cauterizer',
      bondedWeapon: 'inferno_s_razor',
      weaponCells: ['wild_frenzy_cell:+3', 'conduit_cell:+3'],
      head: 'dark_watch',
      headCell: 'overpower_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'iceborne_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'discipline_cell:+3',
      legs: 'boreal_march',
      legsCell: 'wild_frenzy_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: true,
    }
  },
  {
    name: '1.6.2 Turmoil Frost Stagger (Axe)',
    description: 'Early Reforged Frost Axe: massive charged attacks with Permanent Frost / Turmoil of Boreus, Overpower +6, and Iceborne.',
    version: '1.6.2',
    era: 'Early Reforged',
    tags: ['Axe', 'Frost', 'Stagger', 'Sustain'],
    build: {
      version: '1.6.2',
      weapon: 'permanent_frost',
      bondedWeapon: 'turmoil_of_boreus',
      weaponCells: ['wild_frenzy_cell:+3', 'conduit_cell:+3'],
      head: 'dark_watch',
      headCell: 'overpower_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'iceborne_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'discipline_cell:+3',
      legs: 'boreal_march',
      legsCell: 'wild_frenzy_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: true,
    }
  },
  {
    name: '1.6.2 Hellion Skullforge Stagger (Hammer)',
    description: 'High-impact stagger hammer build with Skullforge stamina shield, Magma Quake / Inferno\'s Burden, and Overpower +6.',
    version: '1.6.2',
    era: 'Early Reforged',
    tags: ['Hammer', 'Blaze', 'Stagger', 'Shields'],
    build: {
      version: '1.6.2',
      weapon: 'magma_quake',
      bondedWeapon: 'inferno_s_burden',
      weaponCells: ['overpower_cell:+3', 'knockout_king_cell:+3'],
      head: 'the_skullforge',
      headCell: 'iceborne_cell:+3',
      torso: 'hellplate_cuirass',
      torsoCell: 'molten_cell:+3',
      arms: 'torgadoro_s_brawn',
      armsCell: 'knockout_king_cell:+3',
      legs: 'boreal_march',
      legsCell: 'iceborne_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: true,
    }
  },
  {
    name: '1.6.2 Scorching Agonies Reaper (Chain Blades)',
    description: 'Fast-hitting low-life chain blades with Scorching Agonies / Inferno\'s Fangs, Overpower +6, and Wild Frenzy +6.',
    version: '1.6.2',
    era: 'Early Reforged',
    tags: ['Chain Blades', 'Blaze', 'Speed', 'Low-Life'],
    build: {
      version: '1.6.2',
      weapon: 'scorching_agonies',
      bondedWeapon: 'inferno_s_fangs',
      weaponCells: ['wild_frenzy_cell:+3', 'conduit_cell:+3'],
      head: 'dark_watch',
      headCell: 'overpower_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'iceborne_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'discipline_cell:+3',
      legs: 'boreal_march',
      legsCell: 'wild_frenzy_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: true,
    }
  },
  {
    name: '1.6.2 Pyroclastic Wound Thrust (War Pike)',
    description: 'Wounding low-life war pike build utilizing Pyroclastic Envoy / Inferno\'s Arrow, Overpower +6, and Wild Frenzy +6.',
    version: '1.6.2',
    era: 'Early Reforged',
    tags: ['War Pike', 'Blaze', 'Wound', 'Low-Life'],
    build: {
      version: '1.6.2',
      weapon: 'pyroclastic_envoy',
      bondedWeapon: 'inferno_s_arrow',
      weaponCells: ['wild_frenzy_cell:+3', 'conduit_cell:+3'],
      head: 'dark_watch',
      headCell: 'overpower_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'iceborne_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'discipline_cell:+3',
      legs: 'boreal_march',
      legsCell: 'wild_frenzy_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: true,
    }
  },
  {
    name: '1.6.2 Tectonic Mantra Blitz (Aether Strikers)',
    description: 'Early Reforged mantra rush striker build with Overpower +6, Rage +6, Wild Frenzy +6, and Conduit +6.',
    version: '1.6.2',
    era: 'Early Reforged',
    tags: ['Aether Strikers', 'Blaze', 'DPS Meta', 'Stagger'],
    build: {
      version: '1.6.2',
      weapon: 'tectonic_faults',
      bondedWeapon: 'inferno_s_flames',
      weaponCells: ['wild_frenzy_cell:+3', 'conduit_cell:+3'],
      head: 'dark_watch',
      headCell: 'overpower_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'iceborne_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'discipline_cell:+3',
      legs: 'boreal_march',
      legsCell: 'wild_frenzy_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'conduit_cell:+3',
      omnicell: null,
      powerSurged: true,
    }
  },
  {
    name: '1.6.2 Ostian High-Power Marksman (Repeaters)',
    description: 'Early Reforged Ostian Modular Repeaters with Standard Barrel, Marksman Chamber, Captain\'s Grip, and Overpower +6.',
    version: '1.6.2',
    era: 'Early Reforged',
    tags: ['Repeaters', 'Neutral', 'Ranged', 'Low-Life'],
    build: {
      version: '1.6.2',
      weapon: 'repeater',
      repeaterBarrel: 'standard_barrel',
      repeaterChamber: 'marksman_chamber',
      repeaterGrip: 'captain_s_grip',
      repeaterPrism: 'eclipse_prism',
      repeaterMod: 'lucky_magazine',
      weaponCells: ['wild_frenzy_cell:+3', 'conduit_cell:+3'],
      head: 'dark_watch',
      headCell: 'overpower_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'iceborne_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'discipline_cell:+3',
      legs: 'boreal_march',
      legsCell: 'wild_frenzy_cell:+3',
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
    name: '1.12.0 Inferno Overpower Meta (Sword)',
    description: 'Mid-Reforged peak DPS build: +6 Overpower, +6 Predator, +6 Cunning, +6 Pulse, +6 Catalyst, and Discipline omnicell.',
    version: '1.12.0',
    era: 'Reforged Mid-Era',
    tags: ['Sword', 'Blaze', 'DPS Meta', 'Stagger'],
    build: {
      version: '1.12.0',
      weapon: 'the_cauterizer',
      bondedWeapon: 'inferno_s_razor',
      weaponCells: ['catalyst_cell:+3', 'pulse_cell:+3'],
      head: 'timeweave_helm',
      headCell: 'predator_cell:+3',
      torso: 'thrax_s_shadow',
      torsoCell: 'pulse_cell:+3',
      arms: 'timeweave_gauntlets',
      armsCell: 'cunning_cell:+3',
      legs: 'chronotreads',
      legsCell: 'pulse_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'catalyst_cell:+3',
      omnicell: 'discipline',
      powerSurged: true,
    }
  },
  {
    name: '1.12.0 Bastion Shield Tank (Axe)',
    description: 'Enormous shield stack build with Turmoil of Boreus, Bastion omnicell, Tough +6, Tenacious +6, Overpower +6, and Skarn defiance.',
    version: '1.12.0',
    era: 'Reforged Mid-Era',
    tags: ['Axe', 'Frost', 'Shields', 'Tank'],
    build: {
      version: '1.12.0',
      weapon: 'permanent_frost',
      bondedWeapon: 'turmoil_of_boreus',
      weaponCells: ['overpower_cell:+3', 'rage_cell:+3'],
      head: 'sight_of_stone',
      headCell: 'tough_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'tenacious_cell:+3',
      arms: 'timeweave_gauntlets',
      armsCell: 'cunning_cell:+3',
      legs: 'boreal_march',
      legsCell: 'cunning_cell:+3',
      lantern: 'skarn_s_defiance',
      lanternCell: 'catalyst_cell:+3',
      omnicell: 'bastion',
      powerSurged: true,
    }
  },
  {
    name: '1.12.0 Hellion Stagger Slam (Hammer)',
    description: 'Heavy blunt stagger build with Magma Quake / Inferno\'s Burden, Overpower +6, Knockout King +6, and Discipline parry.',
    version: '1.12.0',
    era: 'Reforged Mid-Era',
    tags: ['Hammer', 'Blaze', 'Stagger', 'Overpower'],
    build: {
      version: '1.12.0',
      weapon: 'magma_quake',
      bondedWeapon: 'inferno_s_burden',
      weaponCells: ['catalyst_cell:+3', 'pulse_cell:+3'],
      head: 'timeweave_helm',
      headCell: 'predator_cell:+3',
      torso: 'thrax_s_shadow',
      torsoCell: 'pulse_cell:+3',
      arms: 'timeweave_gauntlets',
      armsCell: 'cunning_cell:+3',
      legs: 'chronotreads',
      legsCell: 'pulse_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'catalyst_cell:+3',
      omnicell: 'discipline',
      powerSurged: true,
    }
  },
  {
    name: '1.12.0 Revenant Hyper-Crit (Chain Blades)',
    description: 'Aggressive Umbral burst build: Void orbs, high crit scaling with Pulse, Predator, Cunning, and Timeweave synergy.',
    version: '1.12.0',
    era: 'Reforged Mid-Era',
    tags: ['Chain Blades', 'Umbral', 'Crit', 'Burst'],
    build: {
      version: '1.12.0',
      weapon: 'night_terrors',
      bondedWeapon: 'stalker_s_trap',
      weaponCells: ['predator_cell:+3', 'cunning_cell:+3'],
      head: 'dark_watch',
      headCell: 'pulse_cell:+3',
      torso: 'timeweave_robes',
      torsoCell: 'pulse_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'catalyst_cell:+3',
      legs: 'thrax_s_guile',
      legsCell: 'catalyst_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'overpower_cell:+3',
      omnicell: 'revenant',
      powerSurged: true,
    }
  },
  {
    name: '1.12.0 Tempest Shock War Pike',
    description: 'High-speed wound damage build combining Tempest speed bonuses, Savagery, Relentless, and Sahvyt pulse crits.',
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
  {
    name: '1.12.0 Titan Clap Rush (Aether Strikers)',
    description: 'Blistering mantra combo strikers with Tectonic Faults / Inferno\'s Flames, Overpower +6, and Predator +6.',
    version: '1.12.0',
    era: 'Reforged Mid-Era',
    tags: ['Aether Strikers', 'Blaze', 'DPS Meta', 'Stagger'],
    build: {
      version: '1.12.0',
      weapon: 'tectonic_faults',
      bondedWeapon: 'inferno_s_flames',
      weaponCells: ['catalyst_cell:+3', 'pulse_cell:+3'],
      head: 'timeweave_helm',
      headCell: 'predator_cell:+3',
      torso: 'thrax_s_shadow',
      torsoCell: 'pulse_cell:+3',
      arms: 'timeweave_gauntlets',
      armsCell: 'cunning_cell:+3',
      legs: 'chronotreads',
      legsCell: 'pulse_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'catalyst_cell:+3',
      omnicell: 'discipline',
      powerSurged: true,
    }
  },
  {
    name: '1.12.0 Volcanic Marksman (Repeaters)',
    description: 'High-crit sustained fire build: Volcanic Eruptions bonded with Inferno\'s Roar, Marksman Chamber, and Captain\'s Grip.',
    version: '1.12.0',
    era: 'Reforged Mid-Era',
    tags: ['Repeaters', 'Blaze', 'Ranged', 'Crit'],
    build: {
      version: '1.12.0',
      weapon: 'volcanic_eruptions',
      bondedWeapon: 'inferno_s_roar',
      weaponCells: ['catalyst_cell:+3', 'pulse_cell:+3'],
      repeaterChamber: 'marksman_chamber',
      repeaterGrip: 'captain_s_grip',
      repeaterMod: 'lucky_magazine',
      head: 'timeweave_helm',
      headCell: 'predator_cell:+3',
      torso: 'thrax_s_shadow',
      torsoCell: 'pulse_cell:+3',
      arms: 'timeweave_gauntlets',
      armsCell: 'cunning_cell:+3',
      legs: 'chronotreads',
      legsCell: 'pulse_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'catalyst_cell:+3',
      omnicell: 'discipline',
      powerSurged: true,
    }
  },

  // ---------------------------------------------------------
  // PATCH 1.14.7 (Reforged Final)
  // ---------------------------------------------------------
  {
    name: '1.14.7 Inferno Overpower Meta (Sword)',
    description: 'Top-tier stagger DPS build: +6 Overpower, +6 Predator, +6 Cunning, +6 Pulse, +6 Catalyst, and Discipline omnicell parry.',
    version: '1.14.7',
    era: 'Reforged Final',
    tags: ['Sword', 'Blaze', 'DPS Meta', 'Stagger'],
    build: {
      version: '1.14.7',
      weapon: 'the_cauterizer',
      bondedWeapon: 'inferno_s_razor',
      weaponCells: ['catalyst_cell:+3', 'pulse_cell:+3'],
      head: 'timeweave_helm',
      headCell: 'predator_cell:+3',
      torso: 'thrax_s_shadow',
      torsoCell: 'pulse_cell:+3',
      arms: 'timeweave_gauntlets',
      armsCell: 'cunning_cell:+3',
      legs: 'chronotreads',
      legsCell: 'pulse_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'catalyst_cell:+3',
      omnicell: 'discipline',
      powerSurged: true,
    }
  },
  {
    name: '1.14.7 Iceborne Immortal (Axe)',
    description: 'High-sustain lifesteal build using Turmoil of Boreus, Iceborne omnicell, Tough +6, Tenacious +6, Overpower +6, and Rage +6.',
    version: '1.14.7',
    era: 'Reforged Final',
    tags: ['Axe', 'Frost', 'Sustain', 'Escalation'],
    build: {
      version: '1.14.7',
      weapon: 'permanent_frost',
      bondedWeapon: 'turmoil_of_boreus',
      weaponCells: ['overpower_cell:+3', 'rage_cell:+3'],
      head: 'sight_of_stone',
      headCell: 'tough_cell:+3',
      torso: 'boreal_resolve',
      torsoCell: 'tenacious_cell:+3',
      arms: 'timeweave_gauntlets',
      armsCell: 'cunning_cell:+3',
      legs: 'boreal_march',
      legsCell: 'cunning_cell:+3',
      lantern: 'skarn_s_defiance',
      lanternCell: 'catalyst_cell:+3',
      omnicell: 'iceborne',
      powerSurged: true,
    }
  },
  {
    name: '1.14.7 Hellion Stagger Slam (Hammer)',
    description: 'Crushing blunt stagger build with Skullforge stamina shield, Magma Quake / Inferno\'s Burden, Overpower +6, and Knockout King +6.',
    version: '1.14.7',
    era: 'Reforged Final',
    tags: ['Hammer', 'Blaze', 'Stagger', 'Overpower'],
    build: {
      version: '1.14.7',
      weapon: 'magma_quake',
      bondedWeapon: 'inferno_s_burden',
      weaponCells: ['catalyst_cell:+3', 'pulse_cell:+3'],
      head: 'timeweave_helm',
      headCell: 'predator_cell:+3',
      torso: 'thrax_s_shadow',
      torsoCell: 'pulse_cell:+3',
      arms: 'timeweave_gauntlets',
      armsCell: 'cunning_cell:+3',
      legs: 'chronotreads',
      legsCell: 'pulse_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'catalyst_cell:+3',
      omnicell: 'discipline',
      powerSurged: true,
    }
  },
  {
    name: '1.14.7 Revenant Hyper-Crit (Chain Blades)',
    description: 'Aggressive Umbral burst build: Void orbs, high crit scaling with Pulse, Predator, Cunning, and Timeweave synergy.',
    version: '1.14.7',
    era: 'Reforged Final',
    tags: ['Chain Blades', 'Umbral', 'Crit', 'Burst'],
    build: {
      version: '1.14.7',
      weapon: 'night_terrors',
      bondedWeapon: 'stalker_s_trap',
      weaponCells: ['predator_cell:+3', 'cunning_cell:+3'],
      head: 'dark_watch',
      headCell: 'pulse_cell:+3',
      torso: 'timeweave_robes',
      torsoCell: 'pulse_cell:+3',
      arms: 'malkarion_s_grasp',
      armsCell: 'catalyst_cell:+3',
      legs: 'thrax_s_guile',
      legsCell: 'catalyst_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'overpower_cell:+3',
      omnicell: 'revenant',
      powerSurged: true,
    }
  },
  {
    name: '1.14.7 Tempest Shock Spear (War Pike)',
    description: 'High-speed wound damage build combining Tempest velocity bonuses, Savagery +6, Relentless +6, and Sahvyt pulse crits.',
    version: '1.14.7',
    era: 'Reforged Final',
    tags: ['War Pike', 'Shock', 'Wound', 'Speed'],
    build: {
      version: '1.14.7',
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
  {
    name: '1.14.7 Titan Clap Rush (Aether Strikers)',
    description: 'Blistering blunt combo build: Overpower +6, Predator +6, Cunning +6, and Molten drops for maximum attack speed mantra cycles.',
    version: '1.14.7',
    era: 'Reforged Final',
    tags: ['Aether Strikers', 'Blaze', 'DPS Meta', 'Stagger'],
    build: {
      version: '1.14.7',
      weapon: 'tectonic_faults',
      bondedWeapon: 'inferno_s_flames',
      weaponCells: ['catalyst_cell:+3', 'pulse_cell:+3'],
      head: 'timeweave_helm',
      headCell: 'predator_cell:+3',
      torso: 'thrax_s_shadow',
      torsoCell: 'pulse_cell:+3',
      arms: 'timeweave_gauntlets',
      armsCell: 'cunning_cell:+3',
      legs: 'chronotreads',
      legsCell: 'pulse_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'catalyst_cell:+3',
      omnicell: 'discipline',
      powerSurged: true,
    }
  },
  {
    name: '1.14.7 Volcanic Marksman (Repeaters)',
    description: 'High-crit sustained fire build: Volcanic Eruptions bonded with Inferno\'s Roar, Marksman Chamber, Captain\'s Grip, and Overpower +6.',
    version: '1.14.7',
    era: 'Reforged Final',
    tags: ['Repeaters', 'Blaze', 'Ranged', 'Crit'],
    build: {
      version: '1.14.7',
      weapon: 'volcanic_eruptions',
      bondedWeapon: 'inferno_s_roar',
      weaponCells: ['catalyst_cell:+3', 'pulse_cell:+3'],
      repeaterChamber: 'marksman_chamber',
      repeaterGrip: 'captain_s_grip',
      repeaterMod: 'lucky_magazine',
      head: 'timeweave_helm',
      headCell: 'predator_cell:+3',
      torso: 'thrax_s_shadow',
      torsoCell: 'pulse_cell:+3',
      arms: 'timeweave_gauntlets',
      armsCell: 'cunning_cell:+3',
      legs: 'chronotreads',
      legsCell: 'pulse_cell:+3',
      lantern: 'drask_s_eye',
      lanternCell: 'catalyst_cell:+3',
      omnicell: 'discipline',
      powerSurged: true,
    }
  },

  // ---------------------------------------------------------
  // PATCH 1.14.7 (Official Community Meta Builds)
  // Sourced from dauntless-builder-reforged & Reforged Meta Sheet
  // ---------------------------------------------------------
  {
    name: "1.14.7 Meta: The Hunger Exotic (Sword)",
    description: "Reforged meta sheet build for The Hunger: Discipline, Predator, Cunning, Overpower, Pulse, and relentless lifesteal in Feast mode.",
    version: "1.14.7",
    era: "Reforged Meta",
    tags: ["Sword", "Umbral", "Exotic", "Discipline", "Meta"],
    build: {
      version: "1.14.7",
      weapon: "the_hunger",
      bondedWeapon: null,
      weaponCells: ["overpower_cell:+3", "overpower_cell:+3"],
      head: "dark_watch",
      headCell: "berserker_cell:+3",
      torso: "skraevwing_jacket",
      torsoCell: "adrenaline_cell:+3",
      arms: "malkarion_s_grasp",
      armsCell: "cunning_cell:+3",
      legs: "bladed_boots",
      legsCell: "predator_cell:+3",
      lantern: "skarn_s_defiance",
      lanternCell: "reuse_cell:+3",
      omnicell: "discipline",
      powerSurged: true,
    }
  },
  {
    name: "1.14.7 Meta: The Godhand Radiant Beam (War Pike)",
    description: "Reforged meta sheet build for The Godhand: continuous laser beam channeling with Savagery, Relentless, Predator, and Cunning.",
    version: "1.14.7",
    era: "Reforged Meta",
    tags: ["WarPike", "Radiant", "Exotic", "Discipline", "Meta"],
    build: {
      version: "1.14.7",
      weapon: "the_godhand",
      bondedWeapon: null,
      weaponCells: ["berserker_cell:+3", "recycle_cell:+3"],
      head: "dark_watch",
      headCell: "berserker_cell:+3",
      torso: "quillspike_jacket",
      torsoCell: "cunning_cell:+3",
      arms: "malkarion_s_grasp",
      armsCell: "predator_cell:+3",
      legs: "bladed_boots",
      legsCell: "recycle_cell:+3",
      lantern: "skarn_s_defiance",
      lanternCell: "reuse_cell:+3",
      omnicell: "discipline",
      powerSurged: true,
    }
  },
  {
    name: "1.14.7 Meta: Frostwülf Shield Nova (Aether Strikers)",
    description: "Top-tier Revenant meta build combining Ice Breakers and Frostwülf tacklers with Galvanized +6, Cunning +6, Predator +6, and Overpower +6.",
    version: "1.14.7",
    era: "Reforged Meta",
    tags: ["AetherStrikers", "Frost", "Revenant", "Shields", "Meta"],
    build: {
      version: "1.14.7",
      weapon: "ice_breakers",
      bondedWeapon: "frostw_lf_s_tacklers",
      weaponCells: ["overpower_cell:+3", "predator_cell:+3"],
      head: "dark_watch",
      headCell: "overpower_cell:+3",
      torso: "skraevwing_jacket",
      torsoCell: "adrenaline_cell:+3",
      arms: "malkarion_s_grasp",
      armsCell: "cunning_cell:+3",
      legs: "bladed_boots",
      legsCell: "galvanized_cell:+3",
      lantern: "skarn_s_defiance",
      lanternCell: "reuse_cell:+3",
      omnicell: "revenant",
      powerSurged: true,
    }
  },
  {
    name: "1.14.7 Meta: Thrax Void Dancer (Chain Blades)",
    description: "Thrax legendary chain blades bonded with Riftstalker for max void orb generation, critical scaling, and Revenant burst.",
    version: "1.14.7",
    era: "Reforged Meta",
    tags: ["ChainBlades", "Umbral", "Revenant", "Crit", "Meta"],
    build: {
      version: "1.14.7",
      weapon: "fractured_realities",
      bondedWeapon: "stalker_s_scorn",
      weaponCells: ["cunning_cell:+3", "overpower_cell:+3"],
      head: "dark_watch",
      headCell: "overpower_cell:+3",
      torso: "skraevwing_jacket",
      torsoCell: "adrenaline_cell:+3",
      arms: "fiery_gauntlets",
      armsCell: "predator_cell:+3",
      legs: "bladed_boots",
      legsCell: "predator_cell:+3",
      lantern: "skarn_s_defiance",
      lanternCell: "reuse_cell:+3",
      omnicell: "revenant",
      powerSurged: true,
    }
  },
  {
    name: "1.14.7 Meta: Frostwülf Colossus (Axe)",
    description: "High-shield Bastion axe meta utilizing Frostwülf bond and Skarn lantern for explosive Bastion slam damage.",
    version: "1.14.7",
    era: "Reforged Meta",
    tags: ["Axe", "Frost", "Bastion", "Shields", "Meta"],
    build: {
      version: "1.14.7",
      weapon: "permanent_frost",
      bondedWeapon: "frostw_lf_s_chomp",
      weaponCells: ["recycle_cell:+3", "tenacious_cell:+3"],
      head: "dark_watch",
      headCell: "overpower_cell:+3",
      torso: "light_s_virtue",
      torsoCell: "reuse_cell:+3",
      arms: "torgadoro_s_brawn",
      armsCell: "berserker_cell:+3",
      legs: "bladed_boots",
      legsCell: "galvanized_cell:+3",
      lantern: "skarn_s_defiance",
      lanternCell: "reuse_cell:+3",
      omnicell: "bastion",
      powerSurged: true,
    }
  },
  {
    name: "1.14.7 Meta: Frostwülf Crater Slam (Hammer)",
    description: "Heavy hammer stagger build with Frostwülf shield shielding, Bastion slam explosions, and Overpower multipliers.",
    version: "1.14.7",
    era: "Reforged Meta",
    tags: ["Hammer", "Frost", "Bastion", "Stagger", "Meta"],
    build: {
      version: "1.14.7",
      weapon: "bomb_cyclone",
      bondedWeapon: "frostw_lf_s_slam",
      weaponCells: ["overpower_cell:+3", "recycle_cell:+3"],
      head: "dark_watch",
      headCell: "berserker_cell:+3",
      torso: "light_s_virtue",
      torsoCell: "reuse_cell:+3",
      arms: "torgadoro_s_brawn",
      armsCell: "berserker_cell:+3",
      legs: "bladed_boots",
      legsCell: "galvanized_cell:+3",
      lantern: "skarn_s_defiance",
      lanternCell: "reuse_cell:+3",
      omnicell: "bastion",
      powerSurged: true,
    }
  },
  {
    name: "1.14.7 Meta: Sahvyt Shock Blitz (Sword)",
    description: "Malkarion sword bonded with Sahvyt: blazing attack speed, 4-stack Discipline parries, and constant critical strikes.",
    version: "1.14.7",
    era: "Reforged Meta",
    tags: ["Sword", "Shock", "Discipline", "Speed", "Meta"],
    build: {
      version: "1.14.7",
      weapon: "cyclonic_fury",
      bondedWeapon: "sahvyt_s_cutlass",
      weaponCells: ["overpower_cell:+3", "overpower_cell:+3"],
      head: "dark_watch",
      headCell: "berserker_cell:+3",
      torso: "skraevwing_jacket",
      torsoCell: "adrenaline_cell:+3",
      arms: "malkarion_s_grasp",
      armsCell: "cunning_cell:+3",
      legs: "bladed_boots",
      legsCell: "predator_cell:+3",
      lantern: "skarn_s_defiance",
      lanternCell: "reuse_cell:+3",
      omnicell: "discipline",
      powerSurged: true,
    }
  },
  {
    name: "1.14.7 Meta: Sahvyt Tempest Lightning (War Pike)",
    description: "Speed-scaling Tempest meta build turning high movement velocity into massive lightning strike damage.",
    version: "1.14.7",
    era: "Reforged Meta",
    tags: ["WarPike", "Shock", "Tempest", "Speed", "Meta"],
    build: {
      version: "1.14.7",
      weapon: "the_conductor",
      bondedWeapon: "sahvyt_s_javelin",
      weaponCells: ["impulse_cell:+3", "pulse_cell:+3"],
      head: "spellbound_hood",
      headCell: "fleet_footed_cell:+3",
      torso: "mantle_of_thorns",
      torsoCell: "molten_cell:+3",
      arms: "malkarion_s_grasp",
      armsCell: "impulse_cell:+3",
      legs: "phaelanx_s_heatsinks",
      legsCell: "invigorated_cell:+3",
      lantern: "shrike_s_zeal",
      lanternCell: "molten_cell:+3",
      omnicell: "tempest",
      powerSurged: true,
    }
  },
  {
    name: "1.14.7 Meta: Volcanic Overpower Burst (Repeaters)",
    description: "Torgadoro legendary repeaters bonded to Hellion with Revenant void tendrils, Overpower, and Predator.",
    version: "1.14.7",
    era: "Reforged Meta",
    tags: ["Repeaters", "Blaze", "Revenant", "Burst", "Meta"],
    build: {
      version: "1.14.7",
      weapon: "volcanic_eruptions",
      bondedWeapon: "inferno_s_roar",
      weaponCells: ["recycle_cell:+3", "recycle_cell:+3"],
      repeaterChamber: "marksman_chamber",
      repeaterGrip: "captain_s_grip",
      repeaterMod: "precision_sights",
      head: "dark_watch",
      headCell: "berserker_cell:+3",
      torso: "thrax_s_shadow",
      torsoCell: "predator_cell:+3",
      arms: "malkarion_s_grasp",
      armsCell: "pulse_cell:+3",
      legs: "bladed_boots",
      legsCell: "pulse_cell:+3",
      lantern: "skarn_s_defiance",
      lanternCell: "reuse_cell:+3",
      omnicell: "revenant",
      powerSurged: true,
    }
  },
  {
    name: "1.14.7 Meta: Catalyst Trials Speedrunner (Aether Strikers)",
    description: "Competitive Dauntless Trials meta build combining Catalyst tonic acceleration with Revenant burst.",
    version: "1.14.7",
    era: "Reforged Meta",
    tags: ["AetherStrikers", "Frost", "Catalyst", "Trials", "Meta"],
    build: {
      version: "1.14.7",
      weapon: "ice_breakers",
      bondedWeapon: "frostw_lf_s_tacklers",
      weaponCells: ["galvanized_cell:+3", "overpower_cell:+3"],
      head: "dark_watch",
      headCell: "berserker_cell:+3",
      torso: "skraevwing_jacket",
      torsoCell: "adrenaline_cell:+3",
      arms: "malkarion_s_grasp",
      armsCell: "cunning_cell:+3",
      legs: "stride_of_thorns",
      legsCell: "catalyst_cell:+3",
      lantern: "skarn_s_defiance",
      lanternCell: "catalyst_cell:+3",
      omnicell: "revenant",
      powerSurged: true,
    }
  },

  // ---------------------------------------------------------
  // PATCH 2.1.1 (Awakening)
  // ---------------------------------------------------------
  {
    name: '2.1.1 Silver Sword Bastion Nova (Sword)',
    description: 'Awakening frost meta: legendary Silver Sword with Ardent Cyclone and Bastion Shield Nova ground slam.',
    version: '2.1.1',
    era: 'Awakening',
    tags: ['Sword', 'Frost', 'Awakening', 'Bastion'],
    build: {
      version: '2.1.1',
      weapon: 'the_silver_sword',
      secondaryWeapon: 'bane_balm',
      gearLevels: { weapon: 20, secondaryWeapon: 20, head: 20, torso: 20, arms: 20, legs: 20 },
      weaponTalents: [0, 1, 0, 1, 0],
      secondaryWeaponTalents: [1, 0, 1, 0, 1],
      weaponCells: [],
      head: null,
      headCell: null,
      torso: null,
      torsoCell: null,
      arms: null,
      armsCell: null,
      legs: null,
      legsCell: null,
      lanternCell: null,
      omnicell: null,
      powerSurged: false,
      lantern: 'bastion',
    }
  },
  {
    name: '2.1.1 Mountain Cleave Firestorm (Axe)',
    description: 'Awakening blaze axe meta: massive charging strikes, stagger multipliers, and Discipline Core burst.',
    version: '2.1.1',
    era: 'Awakening',
    tags: ['Axe', 'Blaze', 'Awakening', 'Discipline'],
    build: {
      version: '2.1.1',
      weapon: 'fury_of_the_mountain',
      secondaryWeapon: 'the_silver_sword',
      gearLevels: { weapon: 20, secondaryWeapon: 20, head: 20, torso: 20, arms: 20, legs: 20 },
      weaponTalents: [1, 0, 1, 0, 1],
      secondaryWeaponTalents: [1, 2, 3, 4, 5],
      weaponCells: [],
      head: null,
      headCell: null,
      torso: null,
      torsoCell: null,
      arms: null,
      armsCell: null,
      legs: null,
      legsCell: null,
      lanternCell: null,
      omnicell: null,
      powerSurged: false,

      lantern: 'discipline',
    }
  },
  {
    name: '2.1.1 Skies of Ostia Aether Slam (Hammer)',
    description: 'Awakening blunt impact meta: heavy aether slam detonations with Shock elemental overload.',
    version: '2.1.1',
    era: 'Awakening',
    tags: ['Hammer', 'Shock', 'Awakening', 'Stagger'],
    build: {
      version: '2.1.1',
      weapon: 'skies_of_ostia',
      secondaryWeapon: 'fury_of_the_mountain',
      gearLevels: { weapon: 20, secondaryWeapon: 20, head: 20, torso: 20, arms: 20, legs: 20 },
      weaponTalents: [0, 0, 1, 1, 0],
      secondaryWeaponTalents: [1, 2, 3, 4, 5],
      weaponCells: [],
      head: null,
      headCell: null,
      torso: null,
      torsoCell: null,
      arms: null,
      armsCell: null,
      legs: null,
      legsCell: null,
      lanternCell: null,
      omnicell: null,
      powerSurged: false,

      lantern: 'discipline',
    }
  },
  {
    name: '2.1.1 Netherlights Shadow Dance (Chain Blades)',
    description: 'Awakening Umbral chain blades: rapid gap-closing aerial strikes paired with Iceborne sustain.',
    version: '2.1.1',
    era: 'Awakening',
    tags: ['Chain Blades', 'Umbral', 'Awakening', 'Iceborne'],
    build: {
      version: '2.1.1',
      weapon: 'netherlights',
      secondaryWeapon: 'alluring_moons',
      gearLevels: { weapon: 20, secondaryWeapon: 20, head: 20, torso: 20, arms: 20, legs: 20 },
      weaponTalents: [1, 1, 0, 0, 1],
      secondaryWeaponTalents: [1, 2, 3, 4, 5],
      weaponCells: [],
      head: null,
      headCell: null,
      torso: null,
      torsoCell: null,
      arms: null,
      armsCell: null,
      legs: null,
      legsCell: null,
      lanternCell: null,
      omnicell: null,
      powerSurged: false,

      lantern: 'iceborne',
    }
  },
  {
    name: '2.1.1 The Living Branch Terra Piercer (War Pike)',
    description: 'Awakening Terra war pike: relentless thrusts, wounding pressure, and Tempest velocity momentum.',
    version: '2.1.1',
    era: 'Awakening',
    tags: ['War Pike', 'Terra', 'Awakening', 'Tempest'],
    build: {
      version: '2.1.1',
      weapon: 'the_living_branch',
      secondaryWeapon: 'thundersoul',
      gearLevels: { weapon: 20, secondaryWeapon: 20, head: 20, torso: 20, arms: 20, legs: 20 },
      weaponTalents: [0, 1, 1, 0, 1],
      secondaryWeaponTalents: [1, 2, 3, 4, 5],
      weaponCells: [],
      head: null,
      headCell: null,
      torso: null,
      torsoCell: null,
      arms: null,
      armsCell: null,
      legs: null,
      legsCell: null,
      lanternCell: null,
      omnicell: null,
      powerSurged: false,

      lantern: 'tempest',
    }
  },
  {
    name: '2.1.1 Golden Claws Radiant Surge (Aether Strikers)',
    description: 'Awakening Radiant strikers: high-tempo mantra cycle flurries backed by Discipline critical scaling.',
    version: '2.1.1',
    era: 'Awakening',
    tags: ['Aether Strikers', 'Radiant', 'Awakening', 'Discipline'],
    build: {
      version: '2.1.1',
      weapon: 'the_golden_claws',
      secondaryWeapon: 'molten_edict',
      gearLevels: { weapon: 20, secondaryWeapon: 20, head: 20, torso: 20, arms: 20, legs: 20 },
      weaponTalents: [1, 0, 0, 1, 1],
      secondaryWeaponTalents: [1, 2, 3, 4, 5],
      weaponCells: [],
      head: null,
      headCell: null,
      torso: null,
      torsoCell: null,
      arms: null,
      armsCell: null,
      legs: null,
      legsCell: null,
      lanternCell: null,
      omnicell: null,
      powerSurged: false,

      lantern: 'discipline',
    }
  },
  {
    name: '2.1.1 Twin Suns Critical Salvo (Repeaters)',
    description: 'Awakening dual repeaters: mag-dump crit burst, explosive mag bombs, and Tempest movement agility.',
    version: '2.1.1',
    era: 'Awakening',
    tags: ['Repeaters', 'Shock', 'Awakening', 'Crit'],
    build: {
      version: '2.1.1',
      weapon: 'twin_suns',
      secondaryWeapon: 'alluring_moons',
      gearLevels: { weapon: 20, secondaryWeapon: 20, head: 20, torso: 20, arms: 20, legs: 20 },
      weaponTalents: [0, 1, 0, 1, 1],
      secondaryWeaponTalents: [1, 2, 3, 4, 5],
      weaponCells: [],
      head: null,
      headCell: null,
      torso: null,
      torsoCell: null,
      arms: null,
      armsCell: null,
      legs: null,
      legsCell: null,
      lanternCell: null,
      omnicell: null,
      powerSurged: false,

      lantern: 'tempest',
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

export function getClassicPerkValue(level: number, maxVal = 3): number {
  if (level >= 10) return Math.min(3, maxVal);
  if (level >= 6) return Math.min(2, maxVal);
  return Math.min(1, maxVal);
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
    const isModularRepeater = (isClassic || data.version === '1.6.2') && (weapon.type === 'repeater' || weapon.typeName?.toLowerCase().includes('repeater'));
    const equippedBarrel = isModularRepeater && build.repeaterBarrel && data.repeaterParts?.barrels
      ? data.repeaterParts.barrels.find(b => b.id === build.repeaterBarrel)
      : null;

    if (equippedBarrel) {
      element = equippedBarrel.element || 'Neutral';
      if (isClassic) {
        const lvl = Math.max(0, Math.min(15, build.gearLevels?.weapon ?? 15));
        const bp = equippedBarrel.basePower ?? 100;
        const mp = equippedBarrel.maxPower ?? 550;
        totalPower = bp + Math.round((mp - bp) * (lvl / 15));
      } else {
        totalPower = isSurged ? (equippedBarrel.maxPower ?? 120) : (equippedBarrel.basePower ?? 40);
      }
    } else if (isClassic) {
      const lvl = Math.max(0, Math.min(15, build.gearLevels?.weapon ?? 15));
      const power = weapon.basePower + Math.round((weapon.maxPower - weapon.basePower) * (lvl / 15));
      totalPower = power;
      element = weapon.element;
    } else if (isAwakening) {
      const lvl = Math.max(build.gearLevels?.weapon ?? 20, build.secondaryWeapon ? (build.gearLevels?.secondaryWeapon ?? 20) : 0);
      const power = weapon.basePower + Math.round((weapon.maxPower - weapon.basePower) * ((lvl - 1) / 19));
      totalPower = power;
      element = weapon.element;
    } else {
      totalPower += isSurged ? weapon.maxPower : weapon.basePower;
      element = weapon.element;
    }

    if (weapon.perks) {
      weapon.perks.forEach(p => {
        const val = isClassic
          ? getClassicPerkValue(build.gearLevels?.weapon ?? 15, p.value)
          : (isAwakening ? p.value : (isSurged ? p.value : (p.baseValue ?? p.value)));
        addPerkPoint(p.id, p.name, val, weapon.name, 'Primary Weapon');
      });
    }

    // Modular Repeater Prism Perks (if any)
    if (isModularRepeater && build.repeaterPrism && data.repeaterParts?.prisms) {
      const equippedPrism = data.repeaterParts.prisms.find(p => p.id === build.repeaterPrism);
      if (equippedPrism && equippedPrism.perks) {
        equippedPrism.perks.forEach(p => {
          const val = isClassic
            ? getClassicPerkValue(build.gearLevels?.weapon ?? 15, p.value)
            : (isSurged ? p.value : (p.baseValue ?? p.value));
          addPerkPoint(p.id, p.name, val, equippedPrism.name, 'Repeater Prism');
        });
      }
    }

    // Legendary Weapon Bonding (Available in all versions except Awakening 2.1.1)
    if (!isAwakening && weapon.isLegendary && build.bondedWeapon) {
      const bondedWeapon = data.weapons.find(w => w.id === build.bondedWeapon);
      if (bondedWeapon && bondedWeapon.perks) {
        bondedWeapon.perks.forEach(p => {
          const val = isClassic
            ? getClassicPerkValue(build.gearLevels?.weapon ?? 15, p.value)
            : (isSurged ? p.value : (p.baseValue ?? p.value));
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
      if (isClassic) {
        const lvl = Math.max(0, Math.min(15, build.gearLevels?.[s] ?? 15));
        const res = armour.baseResistance + (armour.maxResistance - armour.baseResistance) * (lvl / 15);
        totalResistance += res;
      } else if (isAwakening) {
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
          const val = isClassic
            ? getClassicPerkValue(build.gearLevels?.[s] ?? 15, p.value)
            : (isAwakening ? p.value : (isSurged ? p.value : (p.baseValue ?? p.value)));
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
    // 1. For non-Awakening builds, attempt ultra-short Sqids encoding (compatible with dauntless-builder-reforged ~60 chars)
    if (build.version !== '2.1.1') {
      const shortCode = exportToDauntlessBuilder(build);
      if (shortCode && shortCode.length >= 20) {
        return shortCode;
      }
    }

    // 2. Fallback to compact JSON Base64 (for Awakening 2.1.1 dual weapons/talents or unmapped entries)
    const compact: Record<string, any> = {
      v: build.version || '1.14.7',
    };
    if (build.weapon) compact.w = build.weapon;
    const wc = (build.weaponCells || []).filter(Boolean);
    if (wc.length > 0) compact.wc = wc;
    if (build.head) compact.h = build.head;
    if (build.headCell) compact.hc = build.headCell;
    if (build.torso) compact.t = build.torso;
    if (build.torsoCell) compact.tc = build.torsoCell;
    if (build.arms) compact.a = build.arms;
    if (build.armsCell) compact.ac = build.armsCell;
    if (build.legs) compact.l = build.legs;
    if (build.legsCell) compact.lc = build.legsCell;
    if (build.lantern) compact.lt = build.lantern;
    if (build.lanternCell) compact.ltc = build.lanternCell;
    if (build.omnicell) compact.o = build.omnicell;
    if (build.powerSurged) compact.ps = 1;

    if (build.bondedWeapon) compact.bw = build.bondedWeapon;
    if (build.secondaryWeapon) compact.w2 = build.secondaryWeapon;
    if (build.gearLevels && Object.keys(build.gearLevels).length > 0) compact.gl = build.gearLevels;
    if (build.weaponTalents && build.weaponTalents.some(t => t > 0)) compact.wt = build.weaponTalents;
    if (build.secondaryWeaponTalents && build.secondaryWeaponTalents.some(t => t > 0)) compact.w2t = build.secondaryWeaponTalents;
    if (build.torsoCell2) compact.tc2 = build.torsoCell2;
    if (build.legsCell2) compact.lc2 = build.legsCell2;
    if (build.weaponSpecial) compact.wsp = build.weaponSpecial;
    if (build.weaponMod) compact.wm = build.weaponMod;
    if (build.repeaterBarrel) compact.rb = build.repeaterBarrel;
    if (build.repeaterChamber) compact.rc = build.repeaterChamber;
    if (build.repeaterGrip) compact.rg = build.repeaterGrip;
    if (build.repeaterPrism) compact.rp = build.repeaterPrism;
    if (build.repeaterMod) compact.rm = build.repeaterMod;

    const json = JSON.stringify(compact);
    // URL-safe Base64: avoids %2B, %2F and %3D bloat
    return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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
    let code = params.get('b') || clean;
    if (!code) return null;

    // Check if it's an ultra-short Sqids build ID (from Dauntless Builder Reforged or our short encoder)
    if (isDauntlessBuilderUrl(code) || isDauntlessBuilderUrl(hashStr)) {
      const dbBuild = importFromDauntlessBuilder(code) || importFromDauntlessBuilder(hashStr);
      if (dbBuild) return dbBuild;
    }

    // Decode URL component and normalize URL-safe Base64 back to standard Base64
    code = decodeURIComponent(code).replace(/-/g, '+').replace(/_/g, '/');
    while (code.length % 4 !== 0) {
      code += '=';
    }

    const json = atob(code);
    const compact = JSON.parse(json);

    const ver = compact.v || '1.14.7';
    const isClassic = ver === '1.4.4';
    const defaultLevel = isClassic ? 15 : 20;
    const maxLevel = isClassic ? 15 : 20;
    let gearLevels: Record<string, number> = {};
    if (compact.gl && typeof compact.gl === 'object') {
      ['weapon', 'secondaryWeapon', 'head', 'torso', 'arms', 'legs'].forEach(k => {
        const val = compact.gl[k];
        gearLevels[k] = val !== undefined ? Math.min(val, maxLevel) : defaultLevel;
      });
    } else {
      gearLevels = {
        weapon: defaultLevel,
        secondaryWeapon: defaultLevel,
        head: defaultLevel,
        torso: defaultLevel,
        arms: defaultLevel,
        legs: defaultLevel,
      };
    }

    return {
      version: ver,
      weapon: compact.w || null,
      bondedWeapon: compact.bw || null,
      secondaryWeapon: compact.w2 || null,
      weaponSpecial: compact.wsp || null,
      weaponMod: compact.wm || null,
      weaponTalents: compact.wt || [0, 0, 0, 0, 0],
      secondaryWeaponTalents: compact.w2t || [0, 0, 0, 0, 0],
      gearLevels,
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
      repeaterBarrel: compact.rb || null,
      repeaterChamber: compact.rc || null,
      repeaterGrip: compact.rg || null,
      repeaterPrism: compact.rp || null,
      repeaterMod: compact.rm || null,
      powerSurged: compact.ps !== 0,
    };
  } catch (err) {
    try {
      const dbBuild = importFromDauntlessBuilder(hashStr);
      if (dbBuild) return dbBuild;
    } catch {
      // fallback failed
    }
    console.warn('Could not decode build string:', err);
    return null;
  }
}
