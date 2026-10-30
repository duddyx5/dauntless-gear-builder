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
  threshold?: number;
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
  threshold?: number;
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
  cellSockets?: string[];
  perks: ItemPerkRef[];
  stats?: {
    min_level: number;
    perks: Record<string, number>;
  }[];
}

export interface LanternItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  cellSocket?: string | null;
  holdAbility?: string;
  instantAbility?: string;
  activeName?: string;
  activeDesc?: string;
  secondaryEffect?: string;
  cooldown?: number;
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
  torsoCell2?: string | null;
  arms: string | null;
  armsCell: string | null;
  legs: string | null;
  legsCell: string | null;
  legsCell2?: string | null;
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
  threshold?: number;
  isActive?: boolean;
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
  elementalResistances?: { element: string; value: number }[];
  talentStats?: Record<string, number>;
}
