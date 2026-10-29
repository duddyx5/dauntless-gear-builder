export interface PatchManifest {
  default: string;
  versions: PatchVersionInfo[];
}

export interface PatchVersionInfo {
  id: string;
  name: string;
  releaseDate: string;
  description: string;
  hasOmnicells: boolean;
  hasCellSockets: boolean;
  era?: string;
  isAwakening?: boolean;
}

export interface PerkTierData {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  tiers: Record<string, string>;
}

export interface CellVariant {
  name: string;
  level: number;
  rarity: 'uncommon' | 'rare' | 'epic' | string;
  perkId: string;
  perkName: string;
  perkValue: number;
}

export interface CellItem {
  id: string;
  name: string;
  slot: string; // brutality, finesse, fortitude, alacrity, insight, etc.
  slotName: string;
  icon: string;
  variants: CellVariant[];
}

export interface ItemPerkRef {
  id: string;
  name: string;
  value: number;
  baseValue?: number;
}

export interface WeaponTalentOption {
  index: number;
  text: string;
  type: string;
  stat?: string;
}

export interface WeaponTalentTier {
  tier: number;
  name: string;
  options: WeaponTalentOption[];
}

export interface WeaponItem {
  id: string;
  name: string;
  type: string; // sword, axe, hammer, chainblades, warpike, strikers, repeaters
  typeName: string;
  behemoth: string;
  icon: string;
  description: string;
  damageType: string;
  element: string; // Blaze, Frost, Shock, Terra, Radiant, Umbral, Neutral
  basePower: number;
  maxPower: number;
  cellSockets: string[]; // ['brutality', 'brutality']
  perks: ItemPerkRef[];
  uniqueEffect: string | null;
  isLegendary?: boolean;
  talents?: WeaponTalentTier[];
  specialName?: string;
  specialDesc?: string;
  activeName?: string;
  activeDesc?: string;
  passiveName?: string;
  passiveDesc?: string;
}

export interface ArmourItem {
  id: string;
  name: string;
  slot: 'head' | 'torso' | 'arms' | 'legs';
  slotName: string;
  behemoth: string;
  icon: string;
  description: string;
  strength: string | null;
  weakness: string | null;
  baseResistance: number;
  maxResistance: number;
  cellSocket: string;
  perks: ItemPerkRef[];
}

export interface LanternItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  cellSocket: string;
  holdAbility: string;
  instantAbility: string;
}

export interface OmnicellItem {
  id: string;
  name: string;
  icon: string;
  abilityIcon: string;
  passive: string;
  active: string;
  cooldown: number;
}

export interface PatchData {
  version: string;
  perks: Record<string, PerkTierData>;
  cells: CellItem[];
  armour: ArmourItem[];
  weapons: WeaponItem[];
  lanterns: LanternItem[];
  omnicells: OmnicellItem[];
}

export interface BuildState {
  version: string;
  weapon: string | null;
  secondaryWeapon?: string | null;
  weaponTalents?: number[];
  secondaryWeaponTalents?: number[];
  gearLevels?: Record<string, number>;
  weaponCells: (string | null)[];
  head: string | null;
  headCell: string | null;
  torso: string | null;
  torsoCell: string | null;
  arms: string | null;
  armsCell: string | null;
  legs: string | null;
  legsCell: string | null;
  lantern: string | null;
  lanternCell: string | null;
  omnicell: string | null;
  powerSurged: boolean;
}

export interface PerkSource {
  sourceName: string;
  slot: string;
  value: number;
}

export interface CalculatedPerk {
  perkId: string;
  name: string;
  totalValue: number;
  cappedValue: number;
  isOvercapped: boolean;
  type: string;
  icon: string;
  description: string;
  currentTierDescription: string;
  tiers: Record<string, string>;
  sources: PerkSource[];
}

export interface BuildStats {
  totalPower: number;
  totalResistance: number;
  element: string;
  weaknesses: string[];
  strengths: string[];
  perks: CalculatedPerk[];
}
