import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  calculateBuildStats,
  encodeBuildToHash,
  decodeBuildFromHash,
} from './utils/calculator';
import { resolveAssetUrl } from './utils/theme';
import { Header } from './components/Header';
import { EquipmentGrid } from './components/EquipmentGrid';
import { SlotPickerSheet, PickerSlotType } from './components/SlotPickerSheet';
import { BuildSummaryDrawer } from './components/BuildSummaryDrawer';
import { DesktopStatsSidebar } from './components/DesktopStatsSidebar';
import { PresetsModal } from './components/PresetsModal';
import { Toast } from './components/Toast';
import { Loader2, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [manifest, setManifest] = useState<PatchManifest | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<string>('1.14.7');
  const [patchData, setPatchData] = useState<PatchData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [build, setBuild] = useState<BuildState>(() => {
    // Check initial URL hash
    if (typeof window !== 'undefined' && window.location.hash) {
      const decoded = decodeBuildFromHash(window.location.hash);
      if (decoded) {
        return {
          ...DEFAULT_BUILD,
          ...decoded,
        };
      }
    }
    return DEFAULT_BUILD;
  });

  const [activePicker, setActivePicker] = useState<{
    slot: PickerSlotType | null;
    socket?: string | null;
  }>({ slot: null });

  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

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
    ])
      .then(([weapons, armour, cells, perks, lanterns, omnicells]) => {
        const loaded: PatchData = {
          version: currentVersionId,
          weapons: weapons as WeaponItem[],
          armour: armour as ArmourItem[],
          cells: cells as CellItem[],
          perks: perks as Record<string, PerkTierData>,
          lanterns: lanterns as LanternItem[],
          omnicells: omnicells as OmnicellItem[],
        };
        setPatchData(loaded);
        setIsLoading(false);

        // Sanitize build to make sure equipped items exist in this patch
        setBuild(prev => {
          const weaponExists = loaded.weapons.some(w => w.id === prev.weapon);
          const headExists = loaded.armour.some(a => a.id === prev.head && a.slot === 'head');
          const torsoExists = loaded.armour.some(a => a.id === prev.torso && a.slot === 'torso');
          const armsExists = loaded.armour.some(a => a.id === prev.arms && a.slot === 'arms');
          const legsExists = loaded.armour.some(a => a.id === prev.legs && a.slot === 'legs');
          const lanternExists = loaded.lanterns.some(l => l.id === prev.lantern);
          const omnicellExists = loaded.omnicells.some(o => o.id === prev.omnicell);

          return {
            ...prev,
            version: currentVersionId,
            weapon: weaponExists ? prev.weapon : loaded.weapons[0]?.id || null,
            head: headExists ? prev.head : loaded.armour.find(a => a.slot === 'head')?.id || null,
            torso: torsoExists ? prev.torso : loaded.armour.find(a => a.slot === 'torso')?.id || null,
            arms: armsExists ? prev.arms : loaded.armour.find(a => a.slot === 'arms')?.id || null,
            legs: legsExists ? prev.legs : loaded.armour.find(a => a.slot === 'legs')?.id || null,
            lantern: lanternExists ? prev.lantern : loaded.lanterns[0]?.id || null,
            omnicell: omnicellExists ? prev.omnicell : (loaded.omnicells.length > 0 ? loaded.omnicells[0]?.id : null),
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

  // Handler for slot selection
  const handleSlotSelect = (id: string | null) => {
    const slot = activePicker.slot;
    if (!slot) return;

    setBuild(prev => {
      const next = { ...prev };
      if (slot === 'weapon') {
        next.weapon = id;
      } else if (slot === 'weaponCell_0') {
        const cells = [...prev.weaponCells];
        cells[0] = id;
        next.weaponCells = cells;
      } else if (slot === 'weaponCell_1') {
        const cells = [...prev.weaponCells];
        cells[1] = id;
        next.weaponCells = cells;
      } else if (slot === 'head') {
        next.head = id;
      } else if (slot === 'headCell') {
        next.headCell = id;
      } else if (slot === 'torso') {
        next.torso = id;
      } else if (slot === 'torsoCell') {
        next.torsoCell = id;
      } else if (slot === 'arms') {
        next.arms = id;
      } else if (slot === 'armsCell') {
        next.armsCell = id;
      } else if (slot === 'legs') {
        next.legs = id;
      } else if (slot === 'legsCell') {
        next.legsCell = id;
      } else if (slot === 'lantern') {
        next.lantern = id;
      } else if (slot === 'lanternCell') {
        next.lanternCell = id;
      } else if (slot === 'omnicell') {
        next.omnicell = id;
      }
      return next;
    });
  };

  // Currently selected item id for the active picker sheet
  const currentSelectedId = useMemo(() => {
    const slot = activePicker.slot;
    if (!slot) return null;
    if (slot === 'weapon') return build.weapon;
    if (slot === 'weaponCell_0') return build.weaponCells[0] || null;
    if (slot === 'weaponCell_1') return build.weaponCells[1] || null;
    if (slot === 'head') return build.head;
    if (slot === 'headCell') return build.headCell;
    if (slot === 'torso') return build.torso;
    if (slot === 'torsoCell') return build.torsoCell;
    if (slot === 'arms') return build.arms;
    if (slot === 'armsCell') return build.armsCell;
    if (slot === 'legs') return build.legs;
    if (slot === 'legsCell') return build.legsCell;
    if (slot === 'lantern') return build.lantern;
    if (slot === 'lanternCell') return build.lanternCell;
    if (slot === 'omnicell') return build.omnicell;
    return null;
  }, [activePicker.slot, build]);

  // Share handler
  const handleShare = () => {
    const code = encodeBuildToHash(build);
    const url = `${window.location.origin}${window.location.pathname}#b=${code}`;
    window.location.hash = `b=${code}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => showToast('Build link copied to clipboard!'))
        .catch(() => showToast('Build updated in address bar.'));
    } else {
      showToast('Build URL updated in address bar.');
    }
  };

  // Reset handler
  const handleReset = () => {
    if (window.confirm('Reset all equipped gear and cells to default?')) {
      setBuild(DEFAULT_BUILD);
      showToast('Build reset to default.');
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
        onReset={handleReset}
      />

      {/* Main Container: Single-column on mobile, Dual-column with full live sidebar on desktop & tablet */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 pb-28 lg:pb-8">
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
          <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start">
            {/* Left / Center Column: Equipment Slots */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-3">
              <EquipmentGrid
                build={build}
                patchData={patchData}
                patchInfo={currentPatchInfo}
                powerSurged={build.powerSurged}
                onOpenPicker={(slot, socket) => {
                  setActivePicker({ slot, socket });
                }}
              />
            </div>

            {/* Right Column: Desktop Live Stats & Perks Sidebar (Visible on desktop & large tablets, zero UI sacrifices!) */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-5">
              <DesktopStatsSidebar
                stats={buildStats}
                weaponElement={currentWeapon?.element || 'Neutral'}
              />
            </div>
          </div>
        ) : null}
      </main>

      {/* Sticky Collapsible Build Summary Drawer (Active on mobile/tablet viewports, automatically hidden on desktop) */}
      {patchData && (
        <BuildSummaryDrawer
          stats={buildStats}
          weaponElement={currentWeapon?.element || 'Neutral'}
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
        />
      )}

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
      />
    </div>
  );
};
export default App;
