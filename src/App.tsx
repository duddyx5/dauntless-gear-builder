import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  PatchManifest,
  PatchData,
  BuildState,
  WeaponItem,
  ArmourItem,
  CellItem,
  LanternItem,
  OmnicellItem,
  PerkTierData,
} from './types/builder';
import {
  DEFAULT_BUILD,
  createEmptyBuild,
  calculateBuildStats,
  encodeBuildToHash,
  decodeBuildFromHash,
  parseCellSpec,
  EXOTIC_WEAPON_IDS,
} from './utils/calculator';
import { resolveAssetUrl, initTheme, setTheme, ThemeMode } from './utils/theme';
import { Header } from './components/Header';
import { EquipmentGrid } from './components/EquipmentGrid';
import { SlotPickerSheet, PickerSlotType } from './components/SlotPickerSheet';
import { BuildSummaryDrawer } from './components/BuildSummaryDrawer';
import { DesktopStatsSidebar } from './components/DesktopStatsSidebar';
import { PresetsModal } from './components/PresetsModal';
import { DauntlessForeverModal } from './components/DauntlessForeverModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ShareModal } from './components/ShareModal';
import { Toast } from './components/Toast';
import { Loader2, AlertCircle, Youtube, Github, Coffee, Heart, Sparkles } from 'lucide-react';

const XIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={`fill-current ${className}`} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const App: React.FC = () => {
  const [manifest, setManifest] = useState<PatchManifest | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const decoded = decodeBuildFromHash(window.location.hash);
      if (decoded?.version) return decoded.version;
    }
    return '1.14.7';
  });
  const [patchData, setPatchData] = useState<PatchData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [build, setBuild] = useState<BuildState>(() => {
    // Check initial URL hash
    if (typeof window !== 'undefined' && window.location.hash) {
      const decoded = decodeBuildFromHash(window.location.hash);
      if (decoded) {
        return {
          ...createEmptyBuild(decoded.version || '1.14.7'),
          ...decoded,
        };
      }
    }
    return DEFAULT_BUILD;
  });

  const lastSharedHashRef = useRef<string>('');

  const [activePicker, setActivePicker] = useState<{
    slot: PickerSlotType | null;
    socket?: string | null;
  }>({ slot: null });

  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isLauncherModalOpen, setIsLauncherModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => initTheme());
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('dauntless_gear_builder_onboarded');
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setCurrentTheme(newTheme);
    setTheme(newTheme);
    showToast(`Theme switched to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('dauntless_gear_builder_onboarded', 'true');
    setIsOnboardingOpen(false);
    showToast('Welcome Slayer! Start forging your build.');
  };

  // Listen for manual URL hash changes (e.g. pasting #b=<code> or #b.<code> into address bar)
  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash;
      if (!h || h === lastSharedHashRef.current) return;
      const decoded = decodeBuildFromHash(h);
      if (decoded) {
        const targetVer = decoded.version || '1.14.7';
        setBuild({
          ...createEmptyBuild(targetVer),
          ...decoded,
        });
        setCurrentVersionId(targetVer);
        showToast(`Loaded build from URL (Patch ${targetVer})`);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [showToast]);

  // 1. Fetch manifest.json
  useEffect(() => {
    fetch(resolveAssetUrl('data/manifest.json'))
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load manifest (${res.status})`);
        return res.json();
      })
      .then((data: PatchManifest) => {
        setManifest(data);
        // If build was loaded from URL with specific version, use it
        if (build.version && data.versions.some(v => v.id === build.version)) {
          setCurrentVersionId(build.version);
        } else {
          setCurrentVersionId(data.default || '1.14.7');
        }
      })
      .catch(err => {
        console.error('Error loading manifest:', err);
        setLoadError('Failed to load version manifest.');
        setIsLoading(false);
      });
  }, []);

  // 2. Fetch patch data whenever currentVersionId changes
  useEffect(() => {
    if (!currentVersionId) return;
    setIsLoading(true);
    setLoadError(null);

    const basePath = resolveAssetUrl(`data/patches/${currentVersionId}`);
    Promise.all([
      fetch(`${basePath}/weapons.json`).then(r => r.json()),
      fetch(`${basePath}/armour.json`).then(r => r.json()),
      fetch(`${basePath}/cells.json`).then(r => r.json()),
      fetch(`${basePath}/perks.json`).then(r => r.json()),
      fetch(`${basePath}/lanterns.json`).then(r => r.json()),
      fetch(`${basePath}/omnicells.json`).then(r => r.json()),
      fetch(`${basePath}/repeaterParts.json`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${basePath}/weaponParts.json`).then(r => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([weapons, armour, cells, perks, lanterns, omnicells, repeaterParts, weaponParts]) => {
        const loaded: PatchData = {
          version: currentVersionId,
          weapons: weapons as WeaponItem[],
          armour: armour as ArmourItem[],
          cells: cells as CellItem[],
          perks: perks as Record<string, PerkTierData>,
          lanterns: lanterns as LanternItem[],
          omnicells: omnicells as OmnicellItem[],
          repeaterParts: repeaterParts || undefined,
          weaponParts: weaponParts || undefined,
        };
        setPatchData(loaded);
        setIsLoading(false);

        // Sanitize build to make sure equipped items exist in this patch
        setBuild(prev => {
          const weaponObj = prev.weapon ? loaded.weapons.find(w => w.id === prev.weapon) : undefined;
          const weaponExists = Boolean(weaponObj);
          const isExoticWep = Boolean(weaponObj && (weaponObj.isExotic || EXOTIC_WEAPON_IDS.has(weaponObj.id)));
          const restrictSpecials = Boolean(weaponObj && (weaponObj.restrictSpecials || isExoticWep));
          const isTwinSuns = weaponObj?.id === 'the_twin_suns';
          const isRepeaterWep = weaponObj?.type === 'repeater';

          const bondedObj = prev.bondedWeapon ? loaded.weapons.find(w => w.id === prev.bondedWeapon) : undefined;
          const bondedWeaponExists = Boolean(
            bondedObj &&
            weaponObj?.isLegendary &&
            !bondedObj.isLegendary &&
            !bondedObj.isExotic &&
            !EXOTIC_WEAPON_IDS.has(bondedObj.id)
          );
          const secWeaponExists = prev.secondaryWeapon ? loaded.weapons.some(w => w.id === prev.secondaryWeapon) : false;
          const headExists = prev.head ? loaded.armour.some(a => a.id === prev.head && a.slot === 'head') : false;
          const torsoExists = prev.torso ? loaded.armour.some(a => a.id === prev.torso && a.slot === 'torso') : false;
          const armsExists = prev.arms ? loaded.armour.some(a => a.id === prev.arms && a.slot === 'arms') : false;
          const legsExists = prev.legs ? loaded.armour.some(a => a.id === prev.legs && a.slot === 'legs') : false;
          const lanternExists = prev.lantern ? loaded.lanterns.some(l => l.id === prev.lantern) : false;
          const omnicellExists = prev.omnicell ? loaded.omnicells.some(o => o.id === prev.omnicell) : false;

          const normType = weaponObj ? weaponObj.type.toLowerCase().replace(/\s+/g, '') : '';
          const partsForType = normType && loaded.weaponParts ? loaded.weaponParts[normType] : undefined;
          const specialExists = !isRepeaterWep && !restrictSpecials && prev.weaponSpecial
            ? Boolean(partsForType?.specials?.some(s => s.id === prev.weaponSpecial))
            : false;
          const weaponModExists = !isRepeaterWep && prev.weaponMod
            ? Boolean(partsForType?.mods?.some(m => m.id === prev.weaponMod))
            : false;

          const barrelExists = isRepeaterWep && !isTwinSuns && prev.repeaterBarrel && loaded.repeaterParts?.barrels?.some(b => b.id === prev.repeaterBarrel);
          const chamberExists = isRepeaterWep && !isTwinSuns && prev.repeaterChamber && loaded.repeaterParts?.chambers?.some(c => c.id === prev.repeaterChamber);
          const gripExists = isRepeaterWep && !isTwinSuns && prev.repeaterGrip && loaded.repeaterParts?.grips?.some(g => g.id === prev.repeaterGrip);
          const prismExists = isRepeaterWep && !isTwinSuns && prev.repeaterPrism && loaded.repeaterParts?.prisms?.some(p => p.id === prev.repeaterPrism);
          const modExists = isRepeaterWep && prev.repeaterMod && loaded.repeaterParts?.mods?.some(m => m.id === prev.repeaterMod);

          const isClassic = currentVersionId === '1.4.4';
          const maxLevel = isClassic ? 15 : 20;
          const defaultLevel = isClassic ? 15 : 20;
          const updatedLevels: Record<string, number> = {};
          ['weapon', 'secondaryWeapon', 'head', 'torso', 'arms', 'legs'].forEach(k => {
            const current = prev.gearLevels?.[k];
            updatedLevels[k] = current !== undefined ? Math.min(current, maxLevel) : defaultLevel;
          });

          return {
            ...prev,
            version: currentVersionId,
            weapon: weaponExists ? prev.weapon : null,
            bondedWeapon: currentVersionId === '2.1.1' ? null : (bondedWeaponExists ? prev.bondedWeapon : null),
            secondaryWeapon: currentVersionId === '2.1.1' ? (secWeaponExists ? prev.secondaryWeapon : null) : null,
            weaponSpecial: restrictSpecials ? null : (prev.weaponSpecial === undefined ? undefined : (specialExists ? prev.weaponSpecial : null)),
            weaponMod: prev.weaponMod === undefined ? undefined : (weaponModExists ? prev.weaponMod : null),
            repeaterBarrel: barrelExists ? prev.repeaterBarrel : null,
            repeaterChamber: chamberExists ? prev.repeaterChamber : null,
            repeaterGrip: gripExists ? prev.repeaterGrip : null,
            repeaterPrism: prismExists ? prev.repeaterPrism : null,
            repeaterMod: modExists ? prev.repeaterMod : null,
            gearLevels: updatedLevels,
            head: headExists ? prev.head : null,
            torso: torsoExists ? prev.torso : null,
            arms: armsExists ? prev.arms : null,
            legs: legsExists ? prev.legs : null,
            lantern: lanternExists ? prev.lantern : null,
            omnicell: currentVersionId === '2.1.1' ? null : (omnicellExists ? prev.omnicell : null),
          };
        });
      })
      .catch(err => {
        console.error('Error loading patch data:', err);
        setLoadError(`Failed to load game data for Patch ${currentVersionId}`);
        setIsLoading(false);
      });
  }, [currentVersionId]);

  // Current version metadata
  const currentPatchInfo = useMemo(() => {
    return manifest?.versions.find(v => v.id === currentVersionId);
  }, [manifest, currentVersionId]);

  // Recalculate build stats
  const buildStats = useMemo(() => {
    if (!patchData) {
      return {
        totalPower: 0,
        totalResistance: 0,
        element: 'Neutral',
        strengths: [],
        weaknesses: [],
        perks: [],
      };
    }
    return calculateBuildStats(build, patchData);
  }, [build, patchData]);

  // Equipped weapon element for summary
  const currentWeapon = useMemo(() => {
    return patchData?.weapons.find(w => w.id === build.weapon);
  }, [patchData, build.weapon]);

  const isAwakening = currentVersionId === '2.1.1' || currentPatchInfo?.era === 'Awakening';

  const equippedCount = useMemo(() => {
    let count = 0;
    if (build.weapon) count++;
    if (isAwakening) {
      if (build.secondaryWeapon) count++;
    } else {
      if (currentPatchInfo?.hasOmnicells !== false && build.omnicell) count++;
    }
    if (build.head) count++;
    if (build.torso) count++;
    if (build.arms) count++;
    if (build.legs) count++;
    if (build.lantern) count++;
    return count;
  }, [build, isAwakening, currentPatchInfo]);

  const totalSlotsCount = isAwakening ? 7 : (currentPatchInfo?.hasOmnicells !== false ? 7 : 6);

  // Helper functions for socket matching
  const normalizeSocket = (socket?: string | null): string => {
    if (!socket) return '';
    const s = socket.toLowerCase().trim();
    if (s === 'defense') return 'defence';
    return s;
  };

  const isCellCompatibleWithSocket = (
    cellSpec: string | null | undefined,
    socket: string | null | undefined,
    cellsList?: CellItem[]
  ): boolean => {
    if (!cellSpec || !socket) return false;
    const sock = normalizeSocket(socket);
    if (sock === 'prismatic') return true;
    if (!cellsList) return true;
    const parsed = parseCellSpec(cellSpec, cellsList);
    if (!parsed || !parsed.cell) return false;
    const cellSlot = normalizeSocket(parsed.cell.slot);
    return cellSlot === sock;
  };

  // Handler for slot selection
  const handleSlotSelect = (id: string | null) => {
    const slot = activePicker.slot;
    if (!slot) return;

    setBuild(prev => {
      const next = { ...prev };
      if (slot === 'weapon') {
        const prevWeapon = patchData?.weapons.find(w => w.id === prev.weapon);
        const newWeapon = id ? patchData?.weapons.find(w => w.id === id) : null;
        const newCells = [...(prev.weaponCells || [null, null])];

        if (!id || !newWeapon) {
          next.weaponCells = [null, null];
          next.weaponSpecial = null;
          next.weaponMod = null;
        } else {
          // Smart cell socket shifting (atomicptr switchAroundWeaponCellsIfNecessary logic)
          const s0 = newWeapon.cellSockets?.[0];
          const s1 = newWeapon.cellSockets?.[1];
          let c0 = newCells[0];
          let c1 = newCells[1];

          if (c0 && !isCellCompatibleWithSocket(c0, s0, patchData?.cells)) {
            if (isCellCompatibleWithSocket(c0, s1, patchData?.cells)) {
              if (!c1 || !isCellCompatibleWithSocket(c1, s1, patchData?.cells)) {
                const temp = c1;
                c1 = c0;
                c0 = temp && isCellCompatibleWithSocket(temp, s0, patchData?.cells) ? temp : null;
              }
            } else {
              c0 = null;
            }
          }

          if (c1 && !isCellCompatibleWithSocket(c1, s1, patchData?.cells)) {
            if (isCellCompatibleWithSocket(c1, s0, patchData?.cells)) {
              if (!c0 || !isCellCompatibleWithSocket(c0, s0, patchData?.cells)) {
                const temp = c0;
                c0 = c1;
                c1 = temp && isCellCompatibleWithSocket(temp, s1, patchData?.cells) ? temp : null;
              }
            } else {
              c1 = null;
            }
          }
          next.weaponCells = [c0, c1];

          // Validate weapon specials, mods, and repeater components for the new weapon
          const isExoticWep = Boolean(newWeapon.isExotic || EXOTIC_WEAPON_IDS.has(newWeapon.id));
          const restrictSpecials = Boolean(newWeapon.restrictSpecials || isExoticWep);
          const normType = newWeapon.type.toLowerCase().replace(/\s+/g, '');

          if (normType === 'repeater') {
            next.weaponSpecial = null;
            next.weaponMod = null;
            if (newWeapon.id === 'the_twin_suns' || isExoticWep) {
              next.repeaterBarrel = null;
              next.repeaterChamber = null;
              next.repeaterGrip = null;
              next.repeaterPrism = null;
            }
            const repModValid = prev.repeaterMod && patchData?.repeaterParts?.mods?.some(m => m.id === prev.repeaterMod);
            if (!repModValid) {
              next.repeaterMod = patchData?.repeaterParts?.mods?.[0]?.id || null;
            }
          } else {
            next.repeaterBarrel = null;
            next.repeaterChamber = null;
            next.repeaterGrip = null;
            next.repeaterPrism = null;
            next.repeaterMod = null;

            const partsForType = patchData?.weaponParts?.[normType];
            if (partsForType) {
              if (restrictSpecials) {
                next.weaponSpecial = null;
              } else {
                const specialValid = partsForType.specials?.some(s => s.id === prev.weaponSpecial);
                if (!specialValid) {
                  const recommended = partsForType.specials?.find(s => s.tags?.includes('Recommended')) || partsForType.specials?.[0];
                  next.weaponSpecial = recommended?.id || null;
                }
              }
              const modValid = partsForType.mods?.some(m => m.id === prev.weaponMod);
              if (!modValid) {
                const recommended = partsForType.mods?.find(m => m.tags?.includes('Recommended')) || partsForType.mods?.[0];
                next.weaponMod = recommended?.id || null;
              }
            } else {
              next.weaponSpecial = null;
              next.weaponMod = null;
            }
          }
        }
        next.weapon = id;
        next.weaponTalents = [0, 0, 0, 0, 0];
        next.weaponTalentsMask = undefined;
        if (!newWeapon?.isLegendary || !prev.bondedWeapon) {
          next.bondedWeapon = null;
        } else {
          const bonded = patchData?.weapons.find(w => w.id === prev.bondedWeapon);
          if (
            !bonded ||
            bonded.isLegendary ||
            bonded.isExotic ||
            EXOTIC_WEAPON_IDS.has(bonded.id) ||
            bonded.type.toLowerCase() !== newWeapon.type.toLowerCase() ||
            bonded.element.toLowerCase() !== (newWeapon.bondElement || newWeapon.element).toLowerCase()
          ) {
            next.bondedWeapon = null;
          }
        }
      } else if (slot === 'bondedWeapon') {
        next.bondedWeapon = id;
      } else if (slot === 'secondaryWeapon') {
        next.secondaryWeapon = id;
        next.secondaryWeaponTalents = [0, 0, 0, 0, 0];
        next.secondaryWeaponTalentsMask = undefined;
      } else if (slot === 'weaponCell_0') {
        const cells = [...prev.weaponCells];
        cells[0] = id;
        next.weaponCells = cells;
      } else if (slot === 'weaponCell_1') {
        const cells = [...prev.weaponCells];
        cells[1] = id;
        next.weaponCells = cells;
      } else if (slot === 'head') {
        const prevHead = patchData?.armour.find(a => a.id === prev.head);
        const newHead = id ? patchData?.armour.find(a => a.id === id) : null;
        if (
          !id ||
          (prevHead && newHead && normalizeSocket(prevHead.cellSocket) !== normalizeSocket(newHead.cellSocket)) ||
          !isCellCompatibleWithSocket(next.headCell, newHead?.cellSocket, patchData?.cells)
        ) {
          next.headCell = null;
        }
        next.head = id;
      } else if (slot === 'headCell') {
        next.headCell = id;
      } else if (slot === 'torso') {
        const prevTorso = patchData?.armour.find(a => a.id === prev.torso);
        const newTorso = id ? patchData?.armour.find(a => a.id === id) : null;
        if (
          !id ||
          (prevTorso && newTorso && normalizeSocket(prevTorso.cellSocket) !== normalizeSocket(newTorso.cellSocket)) ||
          !isCellCompatibleWithSocket(next.torsoCell, newTorso?.cellSocket, patchData?.cells)
        ) {
          next.torsoCell = null;
          next.torsoCell2 = null;
        }
        next.torso = id;
      } else if (slot === 'torsoCell') {
        next.torsoCell = id;
      } else if (slot === 'torsoCell2') {
        next.torsoCell2 = id;
      } else if (slot === 'arms') {
        const prevArms = patchData?.armour.find(a => a.id === prev.arms);
        const newArms = id ? patchData?.armour.find(a => a.id === id) : null;
        if (
          !id ||
          (prevArms && newArms && normalizeSocket(prevArms.cellSocket) !== normalizeSocket(newArms.cellSocket)) ||
          !isCellCompatibleWithSocket(next.armsCell, newArms?.cellSocket, patchData?.cells)
        ) {
          next.armsCell = null;
        }
        next.arms = id;
      } else if (slot === 'armsCell') {
        next.armsCell = id;
      } else if (slot === 'legs') {
        const prevLegs = patchData?.armour.find(a => a.id === prev.legs);
        const newLegs = id ? patchData?.armour.find(a => a.id === id) : null;
        if (
          !id ||
          (prevLegs && newLegs && normalizeSocket(prevLegs.cellSocket) !== normalizeSocket(newLegs.cellSocket)) ||
          !isCellCompatibleWithSocket(next.legsCell, newLegs?.cellSocket, patchData?.cells)
        ) {
          next.legsCell = null;
          next.legsCell2 = null;
        }
        next.legs = id;
      } else if (slot === 'legsCell') {
        next.legsCell = id;
      } else if (slot === 'legsCell2') {
        next.legsCell2 = id;
      } else if (slot === 'lantern') {
        const prevLantern = patchData?.lanterns.find(l => l.id === prev.lantern);
        const newLantern = id ? patchData?.lanterns.find(l => l.id === id) : null;
        if (
          !id ||
          (prevLantern && newLantern && normalizeSocket(prevLantern.cellSocket) !== normalizeSocket(newLantern.cellSocket)) ||
          !isCellCompatibleWithSocket(next.lanternCell, newLantern?.cellSocket, patchData?.cells)
        ) {
          next.lanternCell = null;
        }
        next.lantern = id;
      } else if (slot === 'lanternCell') {
        next.lanternCell = id;
      } else if (slot === 'omnicell') {
        next.omnicell = id;
      } else if (slot === 'weaponSpecial') {
        next.weaponSpecial = id;
      } else if (slot === 'weaponMod') {
        next.weaponMod = id;
      } else if (slot === 'repeaterBarrel') {
        next.repeaterBarrel = id;
      } else if (slot === 'repeaterChamber') {
        next.repeaterChamber = id;
      } else if (slot === 'repeaterGrip') {
        next.repeaterGrip = id;
      } else if (slot === 'repeaterPrism') {
        next.repeaterPrism = id;
      } else if (slot === 'repeaterMod') {
        next.repeaterMod = id;
      }
      return next;
    });
  };

  // Currently selected item id for the active picker sheet
  const currentSelectedId = useMemo(() => {
    const slot = activePicker.slot;
    if (!slot) return null;
    if (slot === 'weapon') return build.weapon;
    if (slot === 'bondedWeapon') return build.bondedWeapon || null;
    if (slot === 'secondaryWeapon') return build.secondaryWeapon || null;
    if (slot === 'weaponCell_0') return build.weaponCells[0] || null;
    if (slot === 'weaponCell_1') return build.weaponCells[1] || null;
    if (slot === 'head') return build.head;
    if (slot === 'headCell') return build.headCell;
    if (slot === 'torso') return build.torso;
    if (slot === 'torsoCell') return build.torsoCell;
    if (slot === 'torsoCell2') return build.torsoCell2 || null;
    if (slot === 'arms') return build.arms;
    if (slot === 'armsCell') return build.armsCell;
    if (slot === 'legs') return build.legs;
    if (slot === 'legsCell') return build.legsCell;
    if (slot === 'legsCell2') return build.legsCell2 || null;
    if (slot === 'lantern') return build.lantern;
    if (slot === 'lanternCell') return build.lanternCell;
    if (slot === 'omnicell') return build.omnicell;
    if (slot === 'weaponSpecial') return build.weaponSpecial || null;
    if (slot === 'weaponMod') return build.weaponMod || null;
    if (slot === 'repeaterBarrel') return build.repeaterBarrel || null;
    if (slot === 'repeaterChamber') return build.repeaterChamber || null;
    if (slot === 'repeaterGrip') return build.repeaterGrip || null;
    if (slot === 'repeaterPrism') return build.repeaterPrism || null;
    if (slot === 'repeaterMod') return build.repeaterMod || null;
    return null;
  }, [activePicker.slot, build]);

  const handleGearLevelChange = useCallback((slotKey: string, level: number) => {
    const isClassic = currentVersionId === '1.4.4';
    const minLevel = isClassic ? 0 : 1;
    const maxLevel = isClassic ? 15 : 20;
    const defaultLevel = isClassic ? 15 : 20;
    setBuild(prev => ({
      ...prev,
      gearLevels: {
        ...(prev.gearLevels || { weapon: defaultLevel, secondaryWeapon: defaultLevel, head: defaultLevel, torso: defaultLevel, arms: defaultLevel, legs: defaultLevel }),
        [slotKey]: Math.max(minLevel, Math.min(maxLevel, level)),
      }
    }));
  }, [currentVersionId]);

  const handleWeaponTalentChange = useCallback((slotKey: 'weapon' | 'secondaryWeapon', tierIndex: number, optionIndex: number) => {
    setBuild(prev => {
      const key = slotKey === 'weapon' ? 'weaponTalents' : 'secondaryWeaponTalents';
      const maskKey = slotKey === 'weapon' ? 'weaponTalentsMask' : 'secondaryWeaponTalentsMask';
      const current = [...(prev[key] || [0, 0, 0, 0, 0])];
      current[tierIndex] = optionIndex;
      return { ...prev, [key]: current, [maskKey]: undefined };
    });
  }, []);

  // Share handler: sync address bar hash and open multi-platform Share & Export modal
  const handleShare = () => {
    const code = encodeBuildToHash(build);
    if (code) {
      lastSharedHashRef.current = `#b=${code}`;
      window.history.replaceState(null, '', `${window.location.pathname}#b=${code}`);
    }
    setIsShareModalOpen(true);
  };

  // Reset handler: clear all items and cells from all slots
  const handleReset = () => {
    if (window.confirm('Reset build and clear all equipped items and cells?')) {
      setBuild(createEmptyBuild(currentVersionId));
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
      showToast('Build reset: all slots and cells cleared.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dauntless-bg text-gray-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Toast message={toastMessage} />

      {/* Top Navbar */}
      <Header
        versions={manifest?.versions || []}
        currentVersionId={currentVersionId}
        onVersionChange={(newVer) => {
          setCurrentVersionId(newVer);
          showToast(`Switched to ${manifest?.versions.find(v => v.id === newVer)?.name || newVer}`);
        }}
        powerSurged={build.powerSurged}
        onTogglePowerSurge={() => {
          setBuild(prev => ({ ...prev, powerSurged: !prev.powerSurged }));
          showToast(build.powerSurged ? 'Power Surge disabled (base values)' : 'Power Surge enabled (max tier stats)');
        }}
        onShare={handleShare}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenLauncherModal={() => setIsLauncherModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReset={handleReset}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />

      {/* Main Container: Single-column on mobile, Dual-column with full live sidebar on desktop & tablet */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-6 py-6 pb-28 lg:pb-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-cyan-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm font-medium text-gray-400">
              Loading specs for {currentPatchInfo?.name || currentVersionId}...
            </span>
          </div>
        ) : loadError ? (
          <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/40 text-center my-8 max-w-md mx-auto space-y-3">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
            <p className="text-sm text-red-200 font-medium">{loadError}</p>
            <button
              type="button"
              onClick={() => setCurrentVersionId('1.14.7')}
              className="px-4 py-2 bg-red-500 hover:bg-red-400 text-black font-semibold text-xs rounded-xl"
            >
              Reset to 1.14.7
            </button>
          </div>
        ) : patchData ? (
          <div>
            {/* Page Intro Banner */}
            <div className="page-intro">
              <div>
                <p className="kicker">Loadout workshop</p>
                <h1>Forge your perfect build</h1>
                <p className="lead">Select equipment, tune cells, and see every stat update instantly.</p>
              </div>
              <div className="completion hidden sm:block">
                <span><b>{equippedCount}</b> / {totalSlotsCount} equipped</span>
                <div><i style={{ width: `${(equippedCount / totalSlotsCount) * 100}%` }} /></div>
              </div>
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-7 items-start">
              {/* Left / Center Column: Equipment Slots */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-3">
                <div className="flex items-center justify-between px-1 mb-1">
                  <h2 className="font-display font-bold text-sm uppercase tracking-wider text-gray-300">
                    Equipment
                  </h2>
                  <span className="text-[11px] text-gray-400">Tap a slot to swap gear</span>
                </div>
                <EquipmentGrid
                  build={build}
                  patchData={patchData}
                  patchInfo={currentPatchInfo}
                  powerSurged={build.powerSurged}
                  onOpenPicker={(slot, socket) => {
                    setActivePicker({ slot, socket });
                  }}
                  onUnbondWeapon={() => {
                    setBuild(prev => ({ ...prev, bondedWeapon: null }));
                  }}
                  onGearLevelChange={handleGearLevelChange}
                  onWeaponTalentChange={handleWeaponTalentChange}
                />
              </div>

              {/* Right Column: Desktop Live Stats & Perks Sidebar */}
              <div className="hidden lg:block lg:col-span-5 xl:col-span-5">
                <DesktopStatsSidebar
                  stats={buildStats}
                  weaponElement={currentWeapon?.element || 'Neutral'}
                  currentVersionId={currentVersionId}
                  onOpenLauncherModal={() => setIsLauncherModalOpen(true)}
                />
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Page Footer with Social, Community Credits, & Phoenix Labs Disclaimer */}
      <footer className="border-t border-[#1d313a] bg-[#071015]/95 pt-8 pb-28 lg:pb-8 px-4 sm:px-6 mt-12">
        <div className="max-w-[1400px] mx-auto space-y-6 text-xs text-gray-400">
          {/* Top Row: Brand & Creator Social Links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#101c22] border border-[#21333d] flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img
                  src={resolveAssetUrl('/assets/logo.png')}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-gray-200 block text-sm">
                  Dauntless Gear Builder
                </span>
                <span className="text-[11px] text-gray-400">
                  Created with passion by <strong className="text-cyan-400 font-semibold">duddyx5</strong> for the Slayer community
                </span>
              </div>
            </div>

            {/* Social Links & Support */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href="https://buymeacoffee.com/duddyx5"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 transition-colors font-bold text-xs shadow-sm"
                title="Support duddyx5 on Buy Me a Coffee"
              >
                <Coffee className="h-4 w-4 text-amber-400" />
                <span>Support Me</span>
              </a>

              <a
                href="https://www.youtube.com/@duddyx5"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101c22] hover:bg-[#15252e] border border-[#21333d] hover:border-red-500/50 text-gray-300 hover:text-red-400 transition-colors font-semibold text-xs"
                title="YouTube @duddyx5"
              >
                <Youtube className="h-4 w-4 text-red-400" />
                <span>YouTube</span>
              </a>

              <a
                href="https://x.com/duddyx5"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101c22] hover:bg-[#15252e] border border-[#21333d] hover:border-gray-500 text-gray-300 hover:text-white transition-colors font-semibold text-xs"
                title="X @duddyx5"
              >
                <XIcon className="h-3.5 w-3.5" />
                <span>X</span>
              </a>

              <a
                href="https://github.com/duddyx5/dauntless-gear-builder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101c22] hover:bg-[#15252e] border border-[#21333d] hover:border-cyan-500/50 text-gray-300 hover:text-cyan-300 transition-colors font-semibold text-xs"
                title="GitHub Repository"
              >
                <Github className="h-4 w-4 text-cyan-400" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Middle Row: Community Credits */}
          <div className="pt-4 border-t border-[#162730] grid grid-cols-1 md:grid-cols-2 gap-4 text-[11.5px] leading-relaxed">
            <div className="p-3.5 rounded-xl bg-[#0c181f]/80 border border-[#1b2e38]">
              <span className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1 text-xs">
                <Heart className="h-3.5 w-3.5 text-pink-400" />
                Dauntless Forever Project
              </span>
              <p className="text-gray-400">
                Special thanks to the <strong className="text-gray-200">Dauntless Forever</strong> preservation creators and team for keeping historical versions of Dauntless playable and preserved, including build code compatibility with <strong className="text-gray-200">builder.dauntlessforever.com</strong> and local launcher script integration.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c181f]/80 border border-[#1b2e38]">
              <span className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Original Dauntless Builder
              </span>
              <p className="text-gray-400">
                Heartfelt recognition to <strong className="text-gray-200">atomicptr</strong> and the community contributors of the original <strong className="text-gray-200">dauntless-builder.com</strong> for pioneering the build-sharing architecture and community meta sheets.
              </p>
            </div>
          </div>

          {/* Bottom Row: Phoenix Labs Legal Disclaimer */}
          <div className="pt-3 border-t border-[#162730] text-[11px] text-gray-500 text-center leading-normal">
            <p>
              Dauntless is a registered trademark of <strong className="text-gray-400 font-semibold">Phoenix Labs</strong>. All game content, artwork, item names, Behemoth lore, and icons are the intellectual property of Phoenix Labs.
            </p>
            <p className="mt-1 text-gray-600">
              This website is an unofficial, non-profit community fan project created for Slayer theorycrafting and game preservation. It is not affiliated with, endorsed by, or sponsored by Phoenix Labs.
            </p>
          </div>
        </div>
      </footer>

      {/* Sticky Collapsible Build Summary Drawer (Active on mobile/tablet viewports, automatically hidden on desktop) */}
      {patchData && (
        <BuildSummaryDrawer
          stats={buildStats}
          weaponElement={currentWeapon?.element || 'Neutral'}
          currentVersionId={currentVersionId}
          onOpenLauncherModal={() => setIsLauncherModalOpen(true)}
        />
      )}

      {/* Bottom Sheet Item/Cell Selector Modal */}
      {patchData && activePicker.slot && (
        <SlotPickerSheet
          isOpen={true}
          onClose={() => setActivePicker({ slot: null })}
          slotType={activePicker.slot}
          patchData={patchData}
          currentSelectedId={currentSelectedId}
          onSelect={handleSlotSelect}
          allowedSocket={activePicker.socket}
          powerSurged={build.powerSurged}
          equippedWeapon={currentWeapon}
        />
      )}

      {/* Share & Multi-Builder Export Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        build={build}
        onVersionChange={(newVer) => {
          setCurrentVersionId(newVer);
          showToast(`Switched to Patch ${newVer}`);
        }}
        onShowToast={showToast}
      />

      {/* Presets / Saved Builds Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        currentBuild={build}
        onLoadBuild={(loaded) => {
          setBuild(loaded);
          if (loaded.version && loaded.version !== currentVersionId) {
            setCurrentVersionId(loaded.version);
          }
          showToast('Loaded build!');
        }}
        onShowToast={showToast}
      />

      {/* Dauntless Forever Launcher Commands Generator Modal */}
      {patchData && (
        <DauntlessForeverModal
          isOpen={isLauncherModalOpen}
          onClose={() => setIsLauncherModalOpen(false)}
          build={build}
          patchData={patchData}
          onShowToast={showToast}
        />
      )}

      {/* Site & Game Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        versions={manifest?.versions || []}
        currentVersionId={currentVersionId}
        onVersionChange={(newVer) => {
          setCurrentVersionId(newVer);
          showToast(`Switched to ${manifest?.versions.find(v => v.id === newVer)?.name || newVer}`);
        }}
        powerSurged={build.powerSurged}
        onTogglePowerSurge={() => {
          setBuild(prev => ({ ...prev, powerSurged: !prev.powerSurged }));
          showToast(build.powerSurged ? 'Power Surge disabled' : 'Power Surge enabled');
        }}
        onOpenLauncherModal={() => setIsLauncherModalOpen(true)}
        onReplayOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* First-Time User Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        versions={manifest?.versions || []}
        currentVersionId={currentVersionId}
        onVersionChange={(newVer) => setCurrentVersionId(newVer)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};
export default App;
