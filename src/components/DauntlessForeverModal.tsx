import React, { useState, useEffect, useMemo } from 'react';
import { BuildState, PatchData } from '../types/builder';
import {
  DFItem,
  loadDFItems,
  generateDFCommands,
  DFBuildCommands,
} from '../utils/dauntlessForever';
import {
  Terminal,
  Copy,
  Check,
  X,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ListFilter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface DauntlessForeverModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: BuildState;
  patchData: PatchData;
  onShowToast: (msg: string) => void;
}

export const DauntlessForeverModal: React.FC<DauntlessForeverModalProps> = ({
  isOpen,
  onClose,
  build,
  patchData,
  onShowToast,
}) => {
  const [dfData, setDfData] = useState<{ '1.6.2': DFItem[]; '1.14.7': DFItem[] } | null>(null);
  const [targetVersion, setTargetVersion] = useState<'1.6.2' | '1.14.7'>(
    build.version === '1.6.2' ? '1.6.2' : '1.14.7'
  );
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'gear' | 'cells' | 'ids'>('script');

  // Load Dauntless Forever item catalog on mount / open
  useEffect(() => {
    if (isOpen) {
      loadDFItems().then(data => {
        setDfData(data);
      });
    }
  }, [isOpen]);

  // Sync default target version when build patch changes
  useEffect(() => {
    setTargetVersion(build.version === '1.6.2' ? '1.6.2' : '1.14.7');
  }, [build.version]);

  // Compute commands
  const commands: DFBuildCommands | null = useMemo(() => {
    if (!dfData) return null;
    return generateDFCommands(build, patchData, dfData, targetVersion);
  }, [build, patchData, dfData, targetVersion]);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      onShowToast(`Copied ${type} to clipboard!`);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-dauntless-card border border-dauntless-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-dauntless-border flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-gray-900 to-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Terminal className="h-5 w-5 text-black font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Dauntless Forever Launcher Commands</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  DF {targetVersion}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Generate ready-to-run commands to inject this build into your game
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Target Version Selector Bar */}
        <div className="px-4 py-2.5 bg-gray-900/80 border-b border-dauntless-border flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-gray-300">
            <Layers className="h-4 w-4 text-cyan-400" />
            <span>Target Game Version:</span>
          </div>

          <div className="flex items-center bg-gray-800 rounded-lg p-0.5 border border-gray-700">
            <button
              type="button"
              onClick={() => setTargetVersion('1.6.2')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                targetVersion === '1.6.2'
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              1.6.2
            </button>
            <button
              type="button"
              onClick={() => setTargetVersion('1.14.7')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                targetVersion === '1.14.7'
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              1.14.7
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Quick instructions box */}
          <div className="p-3.5 rounded-xl bg-gray-800/40 border border-gray-700/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
              <Info className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>How to give items to your Slayer:</span>
            </div>
            <ol className="text-[12px] text-gray-300 space-y-1 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                <span className="font-semibold text-white">Close the game</span> and stop servers in the Dauntless Forever Launcher.
              </li>
              <li>
                Open <span className="font-mono text-cyan-300">PowerShell</span> (Start → type <kbd className="px-1.5 py-0.5 rounded bg-gray-900 border border-gray-700 text-xs">powershell</kbd>).
              </li>
              <li>
                Click <span className="font-semibold text-cyan-400">Copy PowerShell Script</span> below and paste it into PowerShell.
              </li>
              <li>
                Start the game — your weapons, armour, lantern, and cells are ready to equip!
              </li>
            </ol>
          </div>

          {/* Quick Tabs */}
          <div className="flex border-b border-gray-800 gap-1 bg-gray-900/50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('script')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'script'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Full Script
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gear')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'gear'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Gear ({commands?.gearList.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cells')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'cells'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Cells ({commands?.cellsList.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ids')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'ids'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Raw IDs
            </button>
          </div>

          {/* Tab 1: Full PowerShell Script */}
          {activeTab === 'script' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                  Complete PowerShell script (auto-locates launcher & runs tools\items.js):
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(commands?.powershellScript || '', 'PowerShell Script')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/20"
                >
                  {copiedType === 'PowerShell Script' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedType === 'PowerShell Script' ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              <pre className="p-3 bg-gray-950 border border-gray-800 rounded-xl font-mono text-[12px] text-gray-200 overflow-x-auto max-h-56 leading-relaxed select-all">
                {commands?.powershellScript}
              </pre>
            </div>
          )}

          {/* Tab 2: Gear Command Only */}
          {activeTab === 'gear' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                  Weapons, Armour & Lanterns (<code>addgear</code>):
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(commands?.addGearCmd || '', 'Gear Command')}
                  className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 font-semibold text-xs rounded-lg transition-colors"
                >
                  {copiedType === 'Gear Command' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedType === 'Gear Command' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-3 bg-gray-950 border border-gray-800 rounded-xl font-mono text-[12px] text-gray-200 overflow-x-auto leading-relaxed select-all">
                {commands?.addGearCmd || '# No gear equipped'}
              </pre>

              {/* Resolved items list */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs text-gray-400 font-semibold">Equipped Gear Breakdown:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {commands?.gearList.map((g, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-cyan-400">{g.slotName}</span>
                        <p className="font-semibold text-white truncate">{g.itemName}</p>
                        <code className="text-[11px] text-gray-400 font-mono">{g.dfId}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(g.dfId, g.itemName)}
                        className="p-1 text-gray-500 hover:text-cyan-300"
                        title="Copy ID"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Cells Command Only */}
          {activeTab === 'cells' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                  Cells Command (<code>set</code> with quantity):
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(commands?.setCellsCmd || '', 'Cells Command')}
                  className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 font-semibold text-xs rounded-lg transition-colors"
                >
                  {copiedType === 'Cells Command' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedType === 'Cells Command' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-3 bg-gray-950 border border-gray-800 rounded-xl font-mono text-[12px] text-gray-200 overflow-x-auto leading-relaxed select-all">
                {commands?.setCellsCmd || '# No cells equipped'}
              </pre>

              {/* Resolved cells list */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs text-gray-400 font-semibold">Equipped Cells:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {commands?.cellsList.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-amber-400">Qty: {c.count}</span>
                        <p className="font-semibold text-white truncate">{c.itemName}</p>
                        <code className="text-[11px] text-gray-400 font-mono">{c.dfId}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(c.dfId, c.itemName)}
                        className="p-1 text-gray-500 hover:text-cyan-300"
                        title="Copy ID"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Raw IDs */}
          {activeTab === 'ids' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                  Raw IDs (for Launcher Inventory GUI):
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(commands?.rawIds || '', 'Item IDs')}
                  className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 font-semibold text-xs rounded-lg transition-colors"
                >
                  {copiedType === 'Item IDs' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedType === 'Item IDs' ? 'Copied' : 'Copy All IDs'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={7}
                value={commands?.rawIds || ''}
                className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl font-mono text-[12px] text-gray-200 leading-relaxed resize-none select-all"
              />
            </div>
          )}

          {/* Unresolved items notice if any */}
          {commands?.unresolved && commands.unresolved.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Note:</span> The following item(s) are unique to later updates and could not be mapped to the Dauntless Forever {targetVersion} catalog:
                <ul className="list-disc list-inside mt-1 text-[11px] text-amber-300/80">
                  {commands.unresolved.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-900 border-t border-dauntless-border flex items-center justify-between text-xs">
          <a
            href="https://items.dauntlessforever.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-400 hover:text-cyan-300 transition-colors"
          >
            <span>Browse Full DF Item Catalog</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(commands?.powershellScript || '', 'PowerShell Script')}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all shadow-md shadow-cyan-500/20"
            >
              Copy Commands
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
