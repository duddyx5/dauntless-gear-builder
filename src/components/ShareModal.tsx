import React, { useState, useEffect, useMemo } from 'react';
import { BuildState } from '../types/builder';
import { encodeBuildToHash } from '../utils/calculator';
import { getSharePlatformLinks, SharePlatformLink } from '../utils/dauntlessBuilderImport';
import {
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  Globe,
  Sparkles,
  Flame,
  Shield,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: BuildState;
  onVersionChange: (versionId: string) => void;
  onShowToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  build,
  onVersionChange,
  onShowToast,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const ownUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const code = encodeBuildToHash(build);
    return `${window.location.origin}${window.location.pathname}#b=${code}`;
  }, [build]);

  const platforms = useMemo(
    () => getSharePlatformLinks(build, ownUrl),
    [build, ownUrl]
  );

  if (!isOpen) return null;

  const compatiblePlatforms = platforms.filter(p => p.isCompatible && p.url);
  const incompatiblePlatforms = platforms.filter(p => !p.isCompatible || !p.url);

  const handleCopy = (platform: SharePlatformLink) => {
    if (!platform.url) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(platform.url)
        .then(() => {
          setCopiedId(platform.id);
          onShowToast(`Copied ${platform.name} link!`);
          setTimeout(() => {
            setCopiedId(prev => (prev === platform.id ? null : prev));
          }, 2200);
        })
        .catch(() => {
          onShowToast('Failed to copy link to clipboard.');
        });
    }
  };

  const renderPlatformIcon = (id: SharePlatformLink['id'], active: boolean) => {
    const colorClass = active ? 'text-cyan-400' : 'text-gray-500';
    if (id === 'self') return <Globe className={`h-4 w-4 ${colorClass}`} />;
    if (id === 'reforged-db') return <Flame className={`h-4 w-4 ${active ? 'text-amber-400' : 'text-gray-500'}`} />;
    if (id === 'awakening-db') return <Sparkles className={`h-4 w-4 ${colorClass}`} />;
    return <Shield className={`h-4 w-4 ${active ? 'text-emerald-400' : 'text-gray-500'}`} />;
  };

  const renderActiveCard = (platform: SharePlatformLink) => {
    const isCopied = copiedId === platform.id;
    const isExternal = platform.id !== 'self';

    return (
      <div
        key={platform.id}
        className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
          platform.id === 'self'
            ? 'bg-[#101e25] border-cyan-500/40'
            : 'bg-[#101c22] border-[#21333d] hover:border-[#3e6977]'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-[#0a151b] border border-[#21333d] flex items-center justify-center shrink-0 mt-0.5">
              {renderPlatformIcon(platform.id, true)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-display font-bold text-sm text-white leading-tight">
                  {platform.name}
                </h4>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                  {platform.badgeLabel}
                </span>
              </div>
              <p className="text-[11px] font-mono text-gray-400 truncate mt-0.5">
                {platform.domain}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          {platform.description}
        </p>

        {/* Generated Link + Copy / Open Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            readOnly
            value={platform.url || ''}
            onFocus={(e) => e.currentTarget.select()}
            onClick={(e) => e.currentTarget.select()}
            aria-label={`${platform.name} build URL`}
            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#0a151b] border border-[#21333d] text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400 cursor-text"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleCopy(platform)}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isCopied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-sm shadow-cyan-500/20'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {isExternal && platform.url && (
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                onClick={(e) => {
                  e.stopPropagation();
                  e.currentTarget.blur();
                }}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-[#0a151b] hover:bg-[#15252e] text-gray-200 border border-[#21333d] hover:border-cyan-500/50 transition-colors"
                title={`Open build directly on ${platform.domain}`}
              >
                <span>Open</span>
                <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderInactiveCard = (platform: SharePlatformLink) => (
    <div
      key={platform.id}
      className="p-3 rounded-xl border border-[#1d313a] bg-[#0a151b] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-[#101c22] border border-[#21333d] flex items-center justify-center shrink-0 mt-0.5">
          {renderPlatformIcon(platform.id, false)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-bold text-xs text-gray-300">
              {platform.name}
            </h4>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#101c22] text-gray-400 border border-[#21333d]">
              Requires {platform.badgeLabel}
            </span>
          </div>
          <p className="text-[11px] font-mono text-gray-500 truncate mt-0.5">
            {platform.domain}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        {platform.switchPatches.map(targetVer => (
          <button
            key={targetVer}
            type="button"
            onClick={() => onVersionChange(targetVer)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#101c22] hover:bg-[#15252e] text-cyan-300 border border-[#21333d] hover:border-cyan-500/50 transition-colors cursor-pointer"
          >
            <span>Switch to {targetVer}</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="modal-layer"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="picker-sheet !max-w-xl !max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Share Build"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#1f3744] flex items-center justify-between shrink-0 bg-[#0d191f]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-lg text-white leading-tight">
                  Share &amp; Export Build
                </h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/35">
                  Patch {build.version}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Generate a direct link for the builder where you want to view or import this loadout
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close share modal"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 modal-scroll">
          {/* Active / Ready-to-share links for current patch */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Available for Patch {build.version}
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {compatiblePlatforms.length} {compatiblePlatforms.length === 1 ? 'destination' : 'destinations'} ready
              </span>
            </div>

            {compatiblePlatforms.map(renderActiveCard)}
          </div>

          {/* Other Patch External Builders */}
          {incompatiblePlatforms.length > 0 && (
            <div className="pt-2 border-t border-[#1d313a] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block px-0.5">
                Other Patch Builders
              </span>
              <div className="space-y-2">
                {incompatiblePlatforms.map(renderInactiveCard)}
              </div>
            </div>
          )}

          {/* Two-way import note */}
          <div className="p-3 rounded-xl bg-[#0a151b] border border-[#21333d] flex items-start gap-2 text-[11.5px] text-gray-400 leading-relaxed">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Two-way compatible: links from <strong className="text-gray-200">reforged.dauntless-builder.com</strong> (1.14.7),{' '}
              <strong className="text-gray-200">dauntless-builder.com</strong> (2.1.1), and{' '}
              <strong className="text-gray-200">builder.dauntlessforever.com</strong> (1.6.2 &amp; 1.14.7) can also be imported directly under <strong className="text-gray-200">Builds → Import</strong>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
