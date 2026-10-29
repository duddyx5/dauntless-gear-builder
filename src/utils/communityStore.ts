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

// ---------- Public API ----------

/**
 * Fetch community builds, optionally filtered by patch version.
 * Sorted by upvotes descending by default.
 */
export async function getCommunityBuilds(
  version?: string,
  sortBy: 'votes' | 'recent' = 'votes'
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

  const { data, error } = await query.limit(100);

  if (error) {
    console.error('Error fetching community builds:', error);
    return [];
  }

  return (data || []).map(rowToCommunityBuild);
}

/**
 * Submit a new community build.
 */
export async function submitCommunityBuild(entry: {
  name: string;
  author: string;
  description: string;
  tags: string[];
  build: BuildState;
}): Promise<CommunityBuild | null> {
  const { data, error } = await supabase
    .from('builds')
    .insert([
      {
        version: entry.build.version,
        name: entry.name,
        author: entry.author || 'Anonymous Slayer',
        description: entry.description,
        tags: entry.tags,
        build_state: entry.build,
        upvotes: 0,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error submitting build:', error);
    return null;
  }

  return rowToCommunityBuild(data);
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
 * Delete a community build by ID.
 */
export async function deleteCommunityBuild(buildId: string): Promise<void> {
  const { error } = await supabase.from('builds').delete().eq('id', buildId);
  if (error) {
    console.error('Error deleting build:', error);
  }
}
