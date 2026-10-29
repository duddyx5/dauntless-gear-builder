import React, { useState } from 'react';
import { PatchVersionInfo } from '../types/builder';
import { ThemeMode } from '../utils/theme';
import {
  Share2,
  Bookmark,
  RotateCcw,
  Zap,
  ChevronDown,
  Layers,
  Sparkles,
  Terminal,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  Check,
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

  return (
    <>
      <header className="sticky top-0 z-40 bg-dauntless-bg/95 backdrop-blur border-b border-dauntless-border px-3 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Brand + Version Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm sm:text-lg tracking-wider text-white uppercase truncate">
                  Dauntless Gear Builder
                </span>
              </div>

              {/* Version Selector Button (Opens Settings / Patch selector) */}
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-400 hover:text-cyan-300 transition-colors group text-left"
                title="Change Game Patch in Settings"
              >
                <Layers className="h-3 w-3 text-cyan-400 shrink-0" />
                <span className="font-medium truncate max-w-[130px] sm:max-w-[200px]">
                  {currentVersion?.name || currentVersionId}
                </span>
                <ChevronDown className="h-3 w-3 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Desktop Action Buttons (Visible md and above) */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            {/* Power Surge Toggle */}
            <button
              type="button"
              onClick={onTogglePowerSurge}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                powerSurged
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                  : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:border-gray-600'
              }`}
              title="Toggle Power Surged (+3 perks & max gear level)"
            >
              <Zap className={`h-3.5 w-3.5 ${powerSurged ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
              <span>Surged</span>
            </button>

            {/* Presets / Community Builds */}
            <button
              type="button"
              onClick={onOpenPresets}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 border border-gray-700 transition-colors"
              title="Community Presets & Saved Builds"
            >
              <Bookmark className="h-3.5 w-3.5 text-cyan-400" />
              <span>Builds</span>
            </button>

            {/* Launcher Commands */}
            <button
              type="button"
              onClick={onOpenLauncherModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10 transition-all active:scale-95"
              title="Copy Dauntless Forever Launcher Commands"
            >
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              <span>Launcher</span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={onShare}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all active:scale-95"
              title="Share Build URL"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1 p-1.5 px-2 rounded-lg text-xs font-medium bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 border border-gray-700 hover:border-gray-600 transition-colors"
              title="Site Settings & Game Patch"
            >
              <Settings className="h-3.5 w-3.5 text-gray-400 group-hover:text-cyan-300" />
              <span className="hidden lg:inline">Settings</span>
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/30"
              title="Clear Build"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Action Controls (Mobile & Small Tablets < md) */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {/* Quick Surged Toggle */}
            <button
              type="button"
              onClick={onTogglePowerSurge}
              className={`p-2 rounded-xl text-xs font-semibold transition-all border ${
                powerSurged
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                  : 'bg-gray-800/80 text-gray-400 border-gray-700'
              }`}
              title="Toggle Power Surged"
            >
              <Zap className={`h-4 w-4 ${powerSurged ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
            </button>

            {/* Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-gray-800/90 text-gray-200 hover:text-white border border-gray-700 hover:border-gray-600 transition-colors shadow-sm"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer / Slide-in Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs bg-dauntless-card border-l border-dauntless-border h-full flex flex-col shadow-2xl z-10 animate-slide-left overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-dauntless-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-display font-bold text-base text-white tracking-wide uppercase">
                  Menu
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                aria-label="Close Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 space-y-4 flex-1">
              {/* Active Patch Box */}
              <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/60 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                    Game Version
                  </span>
                  <span className="font-semibold text-xs text-white truncate block">
                    {currentVersion?.name || currentVersionId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Action Links */}
              <div className="space-y-1.5">
                {/* Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left bg-gray-800/30 hover:bg-gray-800/70 border border-gray-700/40 text-gray-200 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block text-white">Settings</span>
                    <span className="text-[11px] text-gray-400 block">Appearance & game version</span>
                  </div>
                </button>

                {/* Presets & Community Builds */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenPresets();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left bg-gray-800/30 hover:bg-gray-800/70 border border-gray-700/40 text-gray-200 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Bookmark className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block text-white">Builds & Presets</span>
                    <span className="text-[11px] text-gray-400 block">Community & saved builds</span>
                  </div>
                </button>

                {/* Dauntless Forever Launcher */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLauncherModal();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left bg-gray-800/30 hover:bg-gray-800/70 border border-gray-700/40 text-gray-200 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block text-white">Launcher Commands</span>
                    <span className="text-[11px] text-gray-400 block">Dauntless Forever item codes</span>
                  </div>
                </button>

                {/* Share Build */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onShare();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left bg-gradient-to-r from-cyan-900/40 to-blue-900/40 hover:from-cyan-900/60 hover:to-blue-900/60 border border-cyan-500/30 text-white transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block text-white">Share Build URL</span>
                    <span className="text-[11px] text-cyan-300/80 block">Copy shareable link</span>
                  </div>
                </button>

                {/* Power Surge Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    onTogglePowerSurge();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left bg-gray-800/30 hover:bg-gray-800/70 border border-gray-700/40 text-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm block text-white">Power Surged</span>
                      <span className="text-[11px] text-gray-400 block">Max Tier 6 perks</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      powerSurged ? 'bg-amber-500 text-black' : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {powerSurged ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* Reset Build */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onReset();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-300 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block text-red-200">Reset Build</span>
                    <span className="text-[11px] text-red-400/80 block">Clear equipped gear</span>
                  </div>
                </button>
              </div>

              {/* Theme Quick Switcher in Mobile Drawer */}
              <div className="pt-2 border-t border-dauntless-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Appearance Theme
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onThemeChange('dark')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
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
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
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
            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-gray-900/60 border-t border-dauntless-border text-center shrink-0">
              <span className="text-[11px] text-gray-500">
                Dauntless Gear Builder
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
