import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BuildState } from '../types/builder';
import { PRESET_BUILDS } from '../utils/calculator';
import {
  CommunityBuild,
  getCommunityBuilds,
  submitCommunityBuild,
  toggleUpvote,
  hasVoted,
  deleteCommunityBuild,
  isBuildOwnedByThisDevice,
} from '../utils/communityStore';
import {
  Bookmark,
  Save,
  Trash2,
  X,
  Sparkles,
  FolderDown,
  Filter,
  Users,
  Plus,
  ArrowLeft,
  Tag,
  User,
  FileText,
  Send,
  Trophy,
  Clock,
  ChevronUp,
  Loader2,
  Search,
} from 'lucide-react';

interface SavedBuildEntry {
  id: string;
  name: string;
  createdAt: string;
  build: BuildState;
}

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBuild: BuildState;
  onLoadBuild: (build: BuildState) => void;
}

type TabType = 'presets' | 'userBuilds' | 'saved';

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  currentBuild,
  onLoadBuild,
}) => {
  const [savedBuilds, setSavedBuilds] = useState<SavedBuildEntry[]>([]);
  const [newBuildName, setNewBuildName] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('presets');
  const [filterByCurrentVersion, setFilterByCurrentVersion] = useState<boolean>(true);

  // Community / User builds state
  const [communityBuilds, setCommunityBuilds] = useState<CommunityBuild[]>([]);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [userBuildsFilter, setUserBuildsFilter] = useState<'all' | 'patch' | 'my'>('all');
  const [userBuildsSearch, setUserBuildsSearch] = useState('');
  const [isLoadingBuilds, setIsLoadingBuilds] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);

  // Submit form state
  const [submitName, setSubmitName] = useState('');
  const [submitAuthor, setSubmitAuthor] = useState('');
  const [submitDescription, setSubmitDescription] = useState('');
  const [submitTags, setSubmitTags] = useState('');

  // Load saved builds from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dauntless_builder_saved_builds');
      if (stored) {
        setSavedBuilds(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read saved builds from localStorage', e);
    }
  }, []);

  // Load community builds from Supabase when modal opens or sort changes
  const refreshCommunityBuilds = useCallback(async () => {
    setIsLoadingBuilds(true);
    try {
      // Fetch all builds for the selected sorting so client-side section & search filters are instant
      const builds = await getCommunityBuilds(undefined, sortBy);
      setCommunityBuilds(builds);

      // Check voted status for each build
      const vMap: Record<string, boolean> = {};
      await Promise.all(
        builds.map(async (b) => {
          vMap[b.id] = await hasVoted(b.id);
        })
      );
      setVotedMap(vMap);
    } catch (err) {
      console.error('Error loading community builds:', err);
    } finally {
      setIsLoadingBuilds(false);
    }
  }, [sortBy]);

  useEffect(() => {
    if (isOpen && activeTab === 'userBuilds') {
      refreshCommunityBuilds();
    }
  }, [isOpen, activeTab, refreshCommunityBuilds]);

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newBuildName.trim() || `Build (${new Date().toLocaleDateString()})`;
    const newEntry: SavedBuildEntry = {
      id: `build_${Date.now()}`,
      name,
      createdAt: new Date().toLocaleDateString(),
      build: { ...currentBuild },
    };

    const updated = [newEntry, ...savedBuilds];
    setSavedBuilds(updated);
    try {
      localStorage.setItem('dauntless_builder_saved_builds', JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not save build to localStorage', err);
    }
    setNewBuildName('');
    setActiveTab('saved');
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedBuilds.filter(b => b.id !== id);
    setSavedBuilds(updated);
    try {
      localStorage.setItem('dauntless_builder_saved_builds', JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not update localStorage', err);
    }
  };

  const handleUpvote = async (buildId: string) => {
    if (votingId) return; // prevent double-clicks
    setVotingId(buildId);
    try {
      const result = await toggleUpvote(buildId);
      setVotedMap(prev => ({ ...prev, [buildId]: result.voted }));
      setCommunityBuilds(prev =>
        prev.map(b => (b.id === buildId ? { ...b, upvotes: result.newCount } : b))
      );
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setVotingId(null);
    }
  };

  const handleSubmitBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = submitName.trim();
    if (!name) return;

    setIsSubmitting(true);
    try {
      const tags = submitTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await submitCommunityBuild({
        name,
        author: submitAuthor.trim() || 'Anonymous Slayer',
        description: submitDescription.trim(),
        tags,
        build: { ...currentBuild },
      });

      // Reset form
      setSubmitName('');
      setSubmitAuthor('');
      setSubmitDescription('');
      setSubmitTags('');
      setShowSubmitForm(false);
      await refreshCommunityBuilds();
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCommunityBuild = async (buildId: string) => {
    await deleteCommunityBuild(buildId);
    await refreshCommunityBuilds();
  };

  // Filter user builds based on section ('all' | 'patch' | 'my') and search query (gear, cell, name, etc.)
  const filteredCommunityBuilds = useMemo(() => {
    return communityBuilds.filter(cb => {
      // 1. Section filter
      if (userBuildsFilter === 'patch' && cb.version !== currentBuild.version) {
        return false;
      }
      if (userBuildsFilter === 'my' && !isBuildOwnedByThisDevice(cb)) {
        return false;
      }

      // 2. Search query filter
      if (!userBuildsSearch.trim()) return true;
      const q = userBuildsSearch.toLowerCase().trim();

      // Check name, author, description, tags, version
      if (cb.name.toLowerCase().includes(q)) return true;
      if (cb.author.toLowerCase().includes(q)) return true;
      if (cb.description && cb.description.toLowerCase().includes(q)) return true;
      if (cb.tags && cb.tags.some(t => t.toLowerCase().includes(q))) return true;
      if (cb.version.toLowerCase().includes(q)) return true;

      const b = cb.build;
      if (!b) return false;

      // Check gear (weapon, armor, omnicell, lantern, etc.)
      const gearItems = [
        b.weapon,
        b.secondaryWeapon,
        b.head,
        b.torso,
        b.arms,
        b.legs,
        b.omnicell,
        b.lantern,
      ];
      if (gearItems.some(item => item && item.toLowerCase().replace(/_/g, ' ').includes(q))) {
        return true;
      }

      // Check cells / perks equipped
      const cellItems = [
        ...(b.weaponCells || []),
        b.headCell,
        b.torsoCell,
        b.torsoCell2,
        b.armsCell,
        b.legsCell,
        b.legsCell2,
        b.lanternCell,
      ];
      if (cellItems.some(cell => cell && cell.toLowerCase().replace(/_/g, ' ').includes(q))) {
        return true;
      }

      return false;
    });
  }, [communityBuilds, userBuildsFilter, userBuildsSearch, currentBuild.version]);

  // Filter community presets based on the selected patch version
  const displayedPresets = useMemo(() => {
    if (filterByCurrentVersion) {
      return PRESET_BUILDS.filter(p => p.version === currentBuild.version);
    }
    return PRESET_BUILDS;
  }, [filterByCurrentVersion, currentBuild.version]);

  // Filter saved builds based on the selected patch version
  const displayedSavedBuilds = useMemo(() => {
    if (filterByCurrentVersion) {
      return savedBuilds.filter(b => b.build.version === currentBuild.version);
    }
    return savedBuilds;
  }, [filterByCurrentVersion, savedBuilds, currentBuild.version]);

  if (!isOpen) return null;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-dauntless-card border border-dauntless-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-dauntless-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-base text-white">Builds & Community</h3>
              <p className="text-xs text-gray-400">Current Patch: <span className="text-cyan-300 font-semibold">{currentBuild.version}</span></p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Buttons — 3 tabs */}
        <div className="flex border-b border-dauntless-border bg-gray-900/60 p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'presets'
                ? 'bg-cyan-500 text-black font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Presets ({displayedPresets.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('userBuilds')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'userBuilds'
                ? 'bg-cyan-500 text-black font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>User Builds</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'saved'
                ? 'bg-cyan-500 text-black font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FolderDown className="h-3.5 w-3.5" />
            <span>My Saved ({displayedSavedBuilds.length})</span>
          </button>
        </div>

        {/* Version Filter Bar (for Presets & Saved tabs) */}
        {activeTab !== 'userBuilds' && (
          <div className="px-4 py-2 bg-gray-900/80 border-b border-dauntless-border flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-cyan-400" />
              <span>Patch {currentBuild.version} Only:</span>
            </span>
            <button
              type="button"
              onClick={() => setFilterByCurrentVersion(!filterByCurrentVersion)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterByCurrentVersion
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {filterByCurrentVersion ? `Locked to ${currentBuild.version}` : 'Show All Versions'}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">

          {/* ========== TAB: Community Presets ========== */}
          {activeTab === 'presets' && (
            <div className="space-y-2.5">
              {displayedPresets.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs space-y-2">
                  <p>No community presets registered specifically for Patch {currentBuild.version}.</p>
                  <button
                    type="button"
                    onClick={() => setFilterByCurrentVersion(false)}
                    className="text-cyan-400 hover:underline"
                  >
                    View builds from all versions
                  </button>
                </div>
              ) : (
                displayedPresets.map((preset, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-gray-800 bg-gray-800/40 hover:border-cyan-500/50 hover:bg-gray-800/80 transition-all flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-white">{preset.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 shrink-0">
                          Patch {preset.version}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        {preset.description}
                      </p>
                      {preset.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {preset.tags.map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onLoadBuild(preset.build);
                        onClose();
                      }}
                      className="w-full mt-1 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 transition-colors"
                    >
                      Equip Build
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ========== TAB: User Builds (Community Submitted — Supabase) ========== */}
          {activeTab === 'userBuilds' && (
            <div className="space-y-3">
              {/* Submit / Sort controls */}
              {!showSubmitForm && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSubmitForm(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl transition-all active:scale-95 shadow-md shadow-cyan-500/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Share Current Build</span>
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1 bg-gray-800/80 rounded-lg border border-gray-700 p-0.5">
                      <button
                        type="button"
                        onClick={() => setSortBy('votes')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                          sortBy === 'votes' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <Trophy className="h-3 w-3" /> Top
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortBy('recent')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                          sortBy === 'recent' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <Clock className="h-3 w-3" /> New
                      </button>
                    </div>
                  </div>

                  {/* Section Filters & Search Bar */}
                  <div className="space-y-2 pt-1 border-t border-gray-800">
                    {/* Section pills: All, Patch, My Builds */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      <button
                        type="button"
                        onClick={() => setUserBuildsFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                          userBuildsFilter === 'all'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-750'
                        }`}
                      >
                        All Builds
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserBuildsFilter('patch')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                          userBuildsFilter === 'patch'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-750'
                        }`}
                      >
                        Patch {currentBuild.version}
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserBuildsFilter('my')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                          userBuildsFilter === 'my'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-750'
                        }`}
                      >
                        My Builds
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                      <input
                        type="text"
                        value={userBuildsSearch}
                        onChange={e => setUserBuildsSearch(e.target.value)}
                        placeholder="Search by name, cell (e.g. Overpower), or gear..."
                        className="w-full pl-8 pr-8 py-1.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                      {userBuildsSearch && (
                        <button
                          type="button"
                          onClick={() => setUserBuildsSearch('')}
                          className="absolute right-2.5 top-2 text-gray-400 hover:text-white p-0.5"
                          title="Clear search"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Build Form */}
              {showSubmitForm && (
                <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Send className="h-4 w-4 text-cyan-400" />
                      Share Build with Community
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowSubmitForm(false)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Your current build (Patch {currentBuild.version}) will be shared. Other users can upvote it!
                  </p>
                  <form onSubmit={handleSubmitBuild} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <input
                        type="text"
                        value={submitName}
                        onChange={e => setSubmitName(e.target.value)}
                        placeholder="Build name (required)"
                        required
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <input
                        type="text"
                        value={submitAuthor}
                        onChange={e => setSubmitAuthor(e.target.value)}
                        placeholder="Your name (optional)"
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-3.5 w-3.5 text-gray-500 shrink-0 mt-2.5" />
                      <textarea
                        value={submitDescription}
                        onChange={e => setSubmitDescription(e.target.value)}
                        placeholder="Short description of why this build works..."
                        rows={2}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <input
                        type="text"
                        value={submitTags}
                        onChange={e => setSubmitTags(e.target.value)}
                        placeholder="Tags (comma separated: Sword, DPS, Blaze)"
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        {isSubmitting ? 'Submitting...' : 'Submit Build'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSubmitForm(false)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Loading State */}
              {isLoadingBuilds && (
                <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                  <span className="text-xs">Loading user builds...</span>
                </div>
              )}

              {/* Empty State */}
              {!isLoadingBuilds && filteredCommunityBuilds.length === 0 && (
                <div className="text-center py-10 text-gray-500 text-xs space-y-3">
                  <Users className="h-8 w-8 mx-auto text-gray-600" />
                  {userBuildsSearch ? (
                    <p>No builds match "{userBuildsSearch}".</p>
                  ) : userBuildsFilter === 'my' ? (
                    <p>You haven't shared any builds on this device yet.</p>
                  ) : userBuildsFilter === 'patch' ? (
                    <p>No user builds shared yet for Patch {currentBuild.version}.</p>
                  ) : (
                    <p>No user builds shared yet. Be the first to share one!</p>
                  )}
                  {userBuildsSearch && (
                    <button
                      type="button"
                      onClick={() => setUserBuildsSearch('')}
                      className="text-cyan-400 hover:underline"
                    >
                      Clear search filter
                    </button>
                  )}
                </div>
              )}

              {/* User Builds List */}
              {!isLoadingBuilds && filteredCommunityBuilds.map((cb) => (
                <div
                  key={cb.id}
                  className="p-3.5 rounded-xl border border-gray-800 bg-gray-800/40 hover:border-gray-700 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Upvote Column */}
                    <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpvote(cb.id)}
                        disabled={votingId === cb.id}
                        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all ${
                          votedMap[cb.id]
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-gray-800/80 text-gray-500 border border-gray-700 hover:text-cyan-300 hover:border-cyan-500/30'
                        } ${votingId === cb.id ? 'opacity-50' : ''}`}
                        title={votedMap[cb.id] ? 'Remove upvote' : 'Upvote this build'}
                      >
                        {votingId === cb.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronUp className={`h-4 w-4 ${votedMap[cb.id] ? 'text-cyan-400' : ''}`} />
                        )}
                        <span className="text-xs font-bold tabular-nums">{cb.upvotes}</span>
                      </button>
                    </div>

                    {/* Build Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-white truncate">{cb.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 shrink-0">
                          Patch {cb.version}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {cb.author}
                        </span>
                        <span>•</span>
                        <span>{formatDate(cb.createdAt)}</span>
                      </div>
                      {cb.description && (
                        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
                          {cb.description}
                        </p>
                      )}
                      {cb.tags && cb.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cb.tags.map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onLoadBuild(cb.build);
                            onClose();
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 transition-colors"
                        >
                          Equip Build
                        </button>

                        {/* Only allow deletion by the device / PC that created the build */}
                        {isBuildOwnedByThisDevice(cb) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete your build "${cb.name}"? This cannot be undone.`)) {
                                handleDeleteCommunityBuild(cb.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/30"
                            title="Delete your build"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========== TAB: My Saved Builds ========== */}
          {activeTab === 'saved' && (
            <div className="space-y-3">
              {/* Save Form */}
              <form onSubmit={handleSaveCurrent} className="flex gap-2">
                <input
                  type="text"
                  value={newBuildName}
                  onChange={e => setNewBuildName(e.target.value)}
                  placeholder="Give build a name..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs rounded-xl transition-colors shrink-0"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save</span>
                </button>
              </form>

              {/* Saved list */}
              {displayedSavedBuilds.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  {filterByCurrentVersion
                    ? `No saved builds found for Patch ${currentBuild.version}. Save your current build above!`
                    : 'No saved builds yet.'}
                </div>
              ) : (
                displayedSavedBuilds.map(b => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-gray-800 bg-gray-800/40 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-white truncate">{b.name}</h4>
                      <span className="text-[10px] text-gray-500">
                        Saved: {b.createdAt} • Patch {b.build.version}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadBuild(b.build);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSaved(b.id)}
                        className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
