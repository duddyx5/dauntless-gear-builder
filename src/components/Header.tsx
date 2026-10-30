import React, { useState } from 'react';
import { PatchVersionInfo } from '../types/builder';
import { ThemeMode, resolveAssetUrl } from '../utils/theme';
import {
  Share2,
  Bookmark,
  RotateCcw,
  Zap,
  Sparkles,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  Check,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  versions: PatchVersionInfo[];
  currentVersionId: string;
  onVersionChange: (versionId: string) => void;
  powerSurged: boolean;
  onTogglePowerSurge: () => void;
  onShare: () => void;
  onOpenPresets: () => void;
  onOpenLauncherModal: () => void;
  onOpenSettings: () => void;
  onReset: () => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  versions,
  currentVersionId,
  onVersionChange,
  powerSurged,
  onTogglePowerSurge,
  onShare,
  onOpenPresets,
  onOpenLauncherModal,
  onOpenSettings,
  onReset,
  currentTheme,
  onThemeChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentVersion = versions.find(v => v.id === currentVersionId) || versions[0];
  const isAwakening = currentVersion?.era === 'Awakening' || currentVersionId === '2.1.1';

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          {/* Brand Logo & Title */}
          <a href="#" className="brand" aria-label="Dauntless Gear Builder home">
            <span className="brand-mark">
              <img
                src={resolveAssetUrl('/assets/logo.png')}
                alt="Logo"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </span>
            <span className="brand-copy">
              <strong>Dauntless</strong>
              <small>Gear Builder</small>
            </span>
          </a>

          {/* Desktop Patch Switcher Dropdown */}
          <div className="patch-switcher hidden md:flex items-center gap-2">
            <span>Patch</span>
            <select
              value={currentVersionId}
              onChange={(e) => onVersionChange(e.target.value)}
              aria-label="Game patch switcher"
            >
              {versions.length > 0 ? (
                versions.map((ver) => (
                  <option key={ver.id} value={ver.id}>
                    {ver.id} · {ver.era}
                  </option>
                ))
              ) : (
                <>
                  <option value="1.14.7">1.14.7 · Reforged</option>
                  <option value="1.12.0">1.12.0 · Reforged</option>
                  <option value="1.6.2">1.6.2 · Classic</option>
                  <option value="2.1.1">2.1.1 · Awakening</option>
                </>
              )}
            </select>
          </div>

          {/* Desktop Actions */}
          <nav className="desktop-actions hidden md:flex" aria-label="Builder actions">
            {/* Surged Toggle (Reforged / Classic only) */}
            {!isAwakening ? (
              <button
                type="button"
                onClick={onTogglePowerSurge}
                className={`surge-toggle ${powerSurged ? 'active' : ''}`}
                title="Toggle Power Surged (Tier 6 perks & max stats)"
              >
                <Zap className={`h-3.5 w-3.5 ${powerSurged ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
                <span>Surged</span>
                <span className="toggle-dot" />
              </button>
            ) : (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-950/40 text-cyan-300 border border-cyan-500/30"
                title="Awakening uses individual gear levels 1-20"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Gear Levels</span>
              </div>
            )}

            {/* Builds & Presets */}
            <button
              type="button"
              onClick={onOpenPresets}
              className="quiet-button"
              title="Community Presets & Saved Builds"
            >
              <Bookmark className="h-3.5 w-3.5 text-cyan-400" />
              <span>Builds</span>
            </button>

            {/* Primary Share Button */}
            <button
              type="button"
              onClick={onShare}
              className="primary-button"
              title="Share Build URL"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share build</span>
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="icon-button"
              title="Settings & Appearance"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4 text-gray-400 hover:text-cyan-300" />
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={onReset}
              className="icon-button hover:text-red-400"
              title="Reset Build"
              aria-label="Reset build"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </nav>

          {/* Mobile Actions (< md viewports) */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            {/* Persistent Share Button */}
            <button
              type="button"
              onClick={onShare}
              className="primary-button flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              title="Share Build URL"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>

            {/* Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="mobile-menu-button flex items-center justify-center"
              aria-label="Open builder menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="modal-layer md:hidden !p-0 !place-items-stretch !justify-end animate-fade-in" role="presentation" onClick={() => setIsMobileMenuOpen(false)}>
          <aside
            className="w-[min(330px,88vw)] h-full border-l border-dauntless-border p-5 bg-[#0b171d] shadow-2xl flex flex-col animate-slide-left z-50 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Head */}
            <div className="flex items-center justify-between pb-4 border-b border-dauntless-border">
              <div className="flex items-center gap-2.5">
                <span className="brand-mark !w-8 !h-8">
                  <img
                    src={resolveAssetUrl('/assets/logo.png')}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </span>
                <strong className="font-display font-bold text-base uppercase text-white tracking-wide">
                  Builder Menu
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="icon-button text-gray-400 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Game Patch Select */}
            <div className="menu-patch my-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
                Game Patch
              </span>
              <select
                value={currentVersionId}
                onChange={(e) => {
                  onVersionChange(e.target.value);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full"
              >
                {versions.map((ver) => (
                  <option key={ver.id} value={ver.id}>
                    {ver.name || `${ver.id} · ${ver.era}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Menu Actions */}
            <div className="space-y-1 flex-1">
              {/* Power Surge Toggle (Reforged/Classic) */}
              {!isAwakening ? (
                <button
                  type="button"
                  onClick={onTogglePowerSurge}
                  className={`w-full min-h-[46px] border-b border-[#1d3039] bg-transparent flex items-center justify-between px-1 text-xs font-bold transition-colors ${
                    powerSurged ? 'text-amber-300' : 'text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className={`h-4 w-4 ${powerSurged ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
                    <span>Power Surge</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${powerSurged ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-gray-800 text-gray-500'}`}>
                    {powerSurged ? 'On' : 'Off'}
                  </span>
                </button>
              ) : (
                <div className="py-2.5 px-2 border-b border-[#1d3039] text-xs text-cyan-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Awakening Gear Levels Active (1-20)</span>
                </div>
              )}

              {/* Builds & Presets */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenPresets();
                }}
                className="w-full min-h-[46px] border-b border-[#1d3039] bg-transparent flex items-center justify-between px-1 text-xs font-bold text-gray-300 hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="h-4 w-4 text-cyan-400" />
                  <span>Builds & Presets</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 -rotate-90" />
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onShare();
                }}
                className="w-full min-h-[46px] border-b border-[#1d3039] bg-transparent flex items-center justify-between px-1 text-xs font-bold text-gray-300 hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Share2 className="h-4 w-4 text-cyan-400" />
                  <span>Share Build</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 -rotate-90" />
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full min-h-[46px] border-b border-[#1d3039] bg-transparent flex items-center justify-between px-1 text-xs font-bold text-gray-300 hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-gray-400" />
                  <span>Site Settings</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 -rotate-90" />
              </button>

              {/* Reset Build */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onReset();
                }}
                className="w-full min-h-[46px] border-b border-[#1d3039] bg-transparent flex items-center gap-2.5 px-1 text-xs font-bold text-red-400 hover:text-red-300"
              >
                <RotateCcw className="h-4 w-4 text-red-400" />
                <span>Reset Build</span>
              </button>
            </div>

            {/* Theme switcher */}
            <div className="pt-4 border-t border-dauntless-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                Theme
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onThemeChange('dark')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-bold ${
                    currentTheme === 'dark'
                      ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-300'
                      : 'bg-gray-800/40 border-gray-700/60 text-gray-400'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark</span>
                  {currentTheme === 'dark' && <Check className="h-3 w-3 ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => onThemeChange('light')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-bold ${
                    currentTheme === 'light'
                      ? 'bg-amber-500/20 border-amber-500/80 text-amber-300'
                      : 'bg-gray-800/40 border-gray-700/60 text-gray-400'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light</span>
                  {currentTheme === 'light' && <Check className="h-3 w-3 ml-0.5" />}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
