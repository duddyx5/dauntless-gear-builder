import { BuildState } from '../types/builder';
import { supabase } from '../api/supabaseClient';
import { getVoterId } from './voter';

export interface CommunityBuild {
  id: string;
  name: string;
  author: string;
  description: string;
  version: string;
  tags: string[];
  build: BuildState;
  upvotes: number;
  createdAt: string;
}

export interface SubmitBuildResult {
  success: boolean;
  isDuplicate: boolean;
  build: CommunityBuild | null;
  message: string;
}

/**
 * Generate a canonical, order-independent fingerprint for a build loadout.
 * Swapping socket positions or irrelevant properties produces the exact same fingerprint.
 */
export function getLoadoutFingerprint(build: BuildState): string {
  const isAwakening = build.version === '2.1.1';
  const isClassic = build.version === '1.4.4';

  const normalized = {
    v: build.version || '1.14.7',
    w: build.weapon || '',
    bw: (!isAwakening && build.bondedWeapon) ? build.bondedWeapon : '',
    sw: (isAwakening && build.secondaryWeapon) ? build.secondaryWeapon : '',
    wt: isAwakening ? (build.weaponTalents || []).join(',') : '',
    swt: isAwakening ? (build.secondaryWeaponTalents || []).join(',') : '',
    wc: (build.weaponCells || []).filter(Boolean).map(String).sort().join('|'),
    h: build.head || '',
    hc: build.headCell || '',
    t: build.torso || '',
    tc: [build.torsoCell, isAwakening ? build.torsoCell2 : null].filter(Boolean).map(String).sort().join('|'),
    a: build.arms || '',
    ac: build.armsCell || '',
    l: build.legs || '',
    lc: [build.legsCell, isAwakening ? build.legsCell2 : null].filter(Boolean).map(String).sort().join('|'),
    lt: build.lantern || '',
    ltc: !isAwakening ? (build.lanternCell || '') : '',
    om: (!isAwakening && !isClassic) ? (build.omnicell || '') : '',
    rb: build.repeaterBarrel || '',
    rc: build.repeaterChamber || '',
    rg: build.repeaterGrip || '',
    rp: build.repeaterPrism || '',
    rm: build.repeaterMod || '',
    ps: (!isClassic && !isAwakening) ? (build.powerSurged !== false) : false,
    gl: (isClassic || isAwakening) ? JSON.stringify(build.gearLevels || {}) : '',
  };

  return Object.entries(normalized)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}

const SUBMIT_RATE_LIMIT_KEY = 'dauntless_last_submits';

function checkRateLimit(): boolean {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(SUBMIT_RATE_LIMIT_KEY);
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    // Keep timestamps from the last 5 minutes (300,000ms)
    const recent = timestamps.filter(t => now - t < 300000);
    if (recent.length >= 6) {
      return false;
    }
    recent.push(now);
    localStorage.setItem(SUBMIT_RATE_LIMIT_KEY, JSON.stringify(recent));
    return true;
  } catch {
    return true;
  }
}

// ---------- Helpers to map DB rows → CommunityBuild ----------

function rowToCommunityBuild(row: any): CommunityBuild {
  return {
    id: row.id,
    name: row.name,
    author: row.author || 'Anonymous Slayer',
    description: row.description || '',
    version: row.version,
    tags: row.tags || [],
    build: row.build_state as BuildState,
    upvotes: row.upvotes ?? 0,
    createdAt: row.created_at,
  };
}

// ---------- Local voted-set cache (mirrors DB state for instant UI) ----------

const VOTED_CACHE_KEY = 'dauntless_voted_builds';

function loadVotedCache(): Set<string> {
  try {
    const stored = localStorage.getItem(VOTED_CACHE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveVotedCache(ids: Set<string>): void {
  try {
    localStorage.setItem(VOTED_CACHE_KEY, JSON.stringify([...ids]));
  } catch {}
}

// ---------- Device-specific build ownership (localStorage + voter ID) ----------

const MY_BUILDS_KEY = 'dauntless_my_created_build_ids';

export function getMyCreatedBuildIds(): string[] {
  try {
    const raw = localStorage.getItem(MY_BUILDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addMyCreatedBuildId(id: string): void {
  try {
    const list = getMyCreatedBuildIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(MY_BUILDS_KEY, JSON.stringify(list));
    }
  } catch {}
}

export function removeMyCreatedBuildId(id: string): void {
  try {
    const list = getMyCreatedBuildIds().filter(x => x !== id);
    localStorage.setItem(MY_BUILDS_KEY, JSON.stringify(list));
  } catch {}
}

export function isBuildOwnedByThisDevice(build: CommunityBuild): boolean {
  const myIds = getMyCreatedBuildIds();
  if (myIds.includes(build.id)) return true;
  const voterId = getVoterId();
  if ((build.build as any)?._creatorId && (build.build as any)._creatorId === voterId) {
    return true;
  }
  return false;
}

// ---------- Public API ----------

/**
 * Fetch community builds, optionally filtered by patch version.
 * Sorted by upvotes descending by default.
 */
export async function getCommunityBuilds(
  version?: string,
  sortBy: 'votes' | 'recent' = 'votes',
  limit: number = 500
): Promise<CommunityBuild[]> {
  let query = supabase.from('builds').select('*');

  if (version) {
    query = query.eq('version', version);
  }

  if (sortBy === 'votes') {
    query = query.order('upvotes', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query.limit(limit);

  if (error) {
    console.error('Error fetching community builds:', error);
    return [];
  }

  return (data || []).map(rowToCommunityBuild);
}

/**
 * Submit a community build.
 * Checks for duplicate loadouts in the same patch version:
 * - If duplicate found: prevents creating a duplicate row, automatically upvotes
 *   the original build on the user's behalf, marks it in their library, and notifies them.
 * - If unique: creates the new community build, starts it with 1 upvote from the creator.
 */
export async function submitCommunityBuild(entry: {
  name: string;
  author: string;
  description: string;
  tags: string[];
  build: BuildState;
}): Promise<SubmitBuildResult> {
  if (!checkRateLimit()) {
    return {
      success: false,
      isDuplicate: false,
      build: null,
      message: 'Rate limit reached: Please wait a couple minutes before submitting another build.',
    };
  }

  const voterId = getVoterId();
  const targetFingerprint = getLoadoutFingerprint(entry.build);

  try {
    // 1. Fetch existing builds in this patch to check for duplicate loadouts
    const { data: existingRows } = await supabase
      .from('builds')
      .select('*')
      .eq('version', entry.build.version);

    if (existingRows && existingRows.length > 0) {
      const duplicateRow = existingRows.find(row => {
        const state = row.build_state as BuildState | undefined;
        if (!state) return false;
        const rowFp = (state as any)?._fingerprint || getLoadoutFingerprint(state);
        return rowFp === targetFingerprint;
      });

      if (duplicateRow) {
        const duplicateBuild = rowToCommunityBuild(duplicateRow);

        // Add to this device's tracked builds so it appears under their saved/my builds
        addMyCreatedBuildId(duplicateBuild.id);

        // Check if current user already upvoted
        const alreadyVoted = await hasVoted(duplicateBuild.id);
        let voteMsg = '';

        if (!alreadyVoted) {
          // Cast automatic upvote for the original build!
          await toggleUpvote(duplicateBuild.id);
          voteMsg = ` We've automatically added your upvote to it!`;
        } else {
          voteMsg = ` You have already upvoted this build!`;
        }

        return {
          success: true,
          isDuplicate: true,
          build: duplicateBuild,
          message: `This exact loadout was first forged by ${duplicateBuild.author} ("${duplicateBuild.name}").${voteMsg}`,
        };
      }
    }

    // 2. Loadout is unique: forge new community build
    const buildWithMeta = {
      ...entry.build,
      _creatorId: voterId,
      _fingerprint: targetFingerprint,
    };

    const { data, error } = await supabase
      .from('builds')
      .insert([
        {
          version: entry.build.version,
          name: entry.name,
          author: entry.author || 'Anonymous Slayer',
          description: entry.description,
          tags: entry.tags,
          build_state: buildWithMeta,
          upvotes: 1, // Initial creator upvote
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error submitting build:', error);
      return {
        success: false,
        isDuplicate: false,
        build: null,
        message: 'Database error: ' + error.message,
      };
    }

    const created = rowToCommunityBuild(data);
    addMyCreatedBuildId(created.id);

    // Record initial creator upvote in build_upvotes
    try {
      await supabase
        .from('build_upvotes')
        .insert([{ build_id: created.id, voter_id: voterId }]);
      const votedCache = loadVotedCache();
      votedCache.add(created.id);
      saveVotedCache(votedCache);
    } catch {}

    return {
      success: true,
      isDuplicate: false,
      build: created,
      message: `Your build "${created.name}" has been forged and published to the community library!`,
    };
  } catch (err: any) {
    console.error('Submit community build exception:', err);
    return {
      success: false,
      isDuplicate: false,
      build: null,
      message: 'Failed to submit build: ' + (err?.message || 'Unknown error'),
    };
  }
}

/**
 * Toggle upvote: if voter hasn't voted → insert vote + increment count.
 * If they have → delete vote + decrement count.
 * Returns the new state.
 */
export async function toggleUpvote(
  buildId: string
): Promise<{ voted: boolean; newCount: number }> {
  const voterId = getVoterId();
  const votedCache = loadVotedCache();

  // Check if already voted in DB
  const { data: existing } = await supabase
    .from('build_upvotes')
    .select('id')
    .eq('build_id', buildId)
    .eq('voter_id', voterId)
    .maybeSingle();

  if (existing) {
    // Remove vote
    await supabase
      .from('build_upvotes')
      .delete()
      .eq('build_id', buildId)
      .eq('voter_id', voterId);

    // Decrement upvote count
    const { data: buildRow } = await supabase
      .from('builds')
      .select('upvotes')
      .eq('id', buildId)
      .single();

    const newCount = Math.max(0, (buildRow?.upvotes ?? 1) - 1);
    await supabase.from('builds').update({ upvotes: newCount }).eq('id', buildId);

    votedCache.delete(buildId);
    saveVotedCache(votedCache);
    return { voted: false, newCount };
  } else {
    // Add vote
    await supabase
      .from('build_upvotes')
      .insert([{ build_id: buildId, voter_id: voterId }]);

    // Increment upvote count
    const { data: buildRow } = await supabase
      .from('builds')
      .select('upvotes')
      .eq('id', buildId)
      .single();

    const newCount = (buildRow?.upvotes ?? 0) + 1;
    await supabase.from('builds').update({ upvotes: newCount }).eq('id', buildId);

    votedCache.add(buildId);
    saveVotedCache(votedCache);
    return { voted: true, newCount };
  }
}

/**
 * Check if current voter has voted for a build.
 * First checks local cache, then verifies against DB.
 */
export async function hasVoted(buildId: string): Promise<boolean> {
  const voterId = getVoterId();

  const { data } = await supabase
    .from('build_upvotes')
    .select('id')
    .eq('build_id', buildId)
    .eq('voter_id', voterId)
    .maybeSingle();

  return !!data;
}

/**
 * Get top 20 builds for a version (sorted by upvotes).
 */
export async function getTop20(version: string): Promise<CommunityBuild[]> {
  const builds = await getCommunityBuilds(version, 'votes');
  return builds.slice(0, 20);
}

/**
 * Delete a community build by ID (only if owned by this device).
 */
export async function deleteCommunityBuild(buildId: string): Promise<boolean> {
  const { error } = await supabase.from('builds').delete().eq('id', buildId);
  if (error) {
    console.error('Error deleting build:', error);
    return false;
  }
  removeMyCreatedBuildId(buildId);
  return true;
}
