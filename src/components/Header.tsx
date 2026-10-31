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
  Youtube,
  Github,
  Coffee,
} from 'lucide-react';

const XIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={`fill-current ${className}`} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
  const isClassic = currentVersion?.era === 'Classic' || currentVersionId === '1.4.4';
  const isAwakening = currentVersion?.era === 'Awakening' || currentVersionId === '2.1.1';
  const hasPowerSurge = currentVersion?.hasPowerSurge !== false && !isClassic && !isAwakening;

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          {/* Brand Logo & Title */}
          <a href="#" className="brand min-w-0 shrink" aria-label="Dauntless Gear Builder home">
            <span className="brand-mark shrink-0">
              <img
                src={resolveAssetUrl('/assets/logo.png')}
                alt="Logo"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </span>
            <span className="brand-copy min-w-0">
              <strong className="truncate block">Dauntless</strong>
              <small className="hidden sm:block">Gear Builder</small>
            </span>
          </a>

          {/* Desktop Patch Switcher Dropdown */}
          <div className="patch-switcher hidden lg:flex items-center gap-2">
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
                  <option value="1.6.2">1.6.2 · Reforged</option>
                  <option value="1.4.4">1.4.4 · Classic</option>
                  <option value="2.1.1">2.1.1 · Awakening</option>
                </>
              )}
            </select>
          </div>

          {/* Desktop Actions (Large screens >= lg) */}
          <nav className="desktop-actions hidden lg:flex" aria-label="Builder actions">
            {/* Surged Toggle / Classic +15 / Awakening Levels */}
            {hasPowerSurge ? (
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
            ) : isClassic ? (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-950/40 text-amber-300 border border-amber-500/30"
                title="Classic Patch 1.4.4 uses legacy +15 gear upgrades (550 power / 550 res)"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>+15 Stats</span>
              </div>
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

            {/* Social / Creator Links & Support (Wide Desktop) */}
            <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-[#21333d]">
              <a
                href="https://buymeacoffee.com/duddyx5"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-[11px] transition-colors"
                title="Support duddyx5 on Buy Me a Coffee"
              >
                <Coffee className="h-3.5 w-3.5 text-amber-400" />
                <span>Support</span>
              </a>

              <a
                href="https://www.youtube.com/@duddyx5"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-button hover:text-red-400 flex items-center justify-center text-gray-400"
                title="YouTube @duddyx5"
                aria-label="YouTube channel"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/duddyx5"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-button hover:text-white flex items-center justify-center text-gray-400"
                title="X @duddyx5"
                aria-label="X profile"
              >
                <XIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://github.com/duddyx5/dauntless-gear-builder"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-button hover:text-cyan-300 flex items-center justify-center text-gray-400"
                title="GitHub Repository"
                aria-label="GitHub repository"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </nav>

          {/* Mobile & Small Screen Actions (< lg viewports) */}
          <div className="flex lg:hidden items-center gap-2 shrink-0 ml-auto">
            {/* Persistent Share Button */}
            <button
              type="button"
              onClick={onShare}
              className="primary-button flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 cursor-pointer"
              title="Share Build URL"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>

            {/* Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 rounded-lg bg-[#101c22] hover:bg-[#1a2d36] border border-[#21333d] hover:border-[#3e6977] text-gray-200 hover:text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-sm"
              aria-label="Open builder menu"
              title="Open Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="modal-layer lg:hidden !p-0 !place-items-stretch !justify-end animate-fade-in" role="presentation" onClick={() => setIsMobileMenuOpen(false)}>
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
              {/* Power Surge Toggle / Classic Legacy / Awakening Levels */}
              {hasPowerSurge ? (
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
              ) : isClassic ? (
                <div className="py-2.5 px-2 border-b border-[#1d3039] text-xs text-amber-300 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Classic Legacy +15 Upgrades Active</span>
                </div>
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

            {/* Creator & Support Links */}
            <div className="pt-4 mt-3 border-t border-dauntless-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                Created by duddyx5
              </span>

              {/* Featured Buy Me a Coffee Support Button */}
              <a
                href="https://buymeacoffee.com/duddyx5"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 mb-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm"
                title="Support duddyx5 on Buy Me a Coffee"
              >
                <Coffee className="h-4 w-4 text-amber-400" />
                <span>Support Me (Buy Me a Coffee)</span>
              </a>

              <div className="grid grid-cols-3 gap-2">
                <a
                  href="https://www.youtube.com/@duddyx5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#101c22] hover:bg-[#1a2d36] border border-[#21333d] hover:border-red-500/50 text-gray-300 hover:text-red-400 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors"
                  title="YouTube @duddyx5"
                >
                  <Youtube className="h-4 w-4 text-red-400" />
                  <span>YouTube</span>
                </a>

                <a
                  href="https://x.com/duddyx5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#101c22] hover:bg-[#1a2d36] border border-[#21333d] hover:border-gray-500 text-gray-300 hover:text-white flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors"
                  title="X @duddyx5"
                >
                  <XIcon className="h-4 w-4 text-white" />
                  <span>X</span>
                </a>

                <a
                  href="https://github.com/duddyx5/dauntless-gear-builder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#101c22] hover:bg-[#1a2d36] border border-[#21333d] hover:border-cyan-500/50 text-gray-300 hover:text-cyan-300 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors"
                  title="GitHub Repository"
                >
                  <Github className="h-4 w-4 text-cyan-400" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
