/**
 * Zod schemas for the pipeline's JSON exports (src/data/*.json).
 * Deliberately tolerant where the pipeline is inconsistent —
 * free_link / read_url / model / sources_count come and go — but strict on
 * the invariants the site depends on: every pick must carry a primary link
 * (source_url or link), and channels/stats must have the fields the pages
 * render. A malformed export fails `npm run test:unit` and the build.
 */
import { z } from 'zod';

/* ── picks.json ────────────────────────────────────────────────────────── */

export const surfaceSchema = z.object({
  url: z.string(),
  name: z.string(),
  points: z.number().nullable().optional(),
  comments: z.number().nullable().optional(),
});

export const pickSchema = z
  .object({
    id: z.number(),
    title: z.string().min(1),
    relevance: z.number(),
    score: z.number(),
    why: z.string(),
    notes: z.array(z.string()),
    summary: z.string(),
    channels: z.array(z.string()),
    novelty: z.string().optional(),
    audience: z.string().optional(),
    link: z.string().optional(),
    source_url: z.string().optional(),
    read_url: z.string().nullable().optional(),
    read_kind: z.string().nullable().optional(),
    free_link: z.string().nullable().optional(),
    paywalled: z.boolean(),
    surfaces: z.array(surfaceSchema),
    sources_count: z.number().optional(),
    first_seen: z.string().optional(),
    curated_at: z.string().optional(),
    model: z.string().nullable().optional(),
  })
  .refine((p) => Boolean(p.source_url || p.link), {
    message: 'pick must have source_url or link',
  });

export const picksSchema = z.array(pickSchema);
export type Pick = z.infer<typeof pickSchema>;

/* ── channels.json ─────────────────────────────────────────────────────── */

export const channelSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  blurb: z.string(),
});

export const channelsSchema = z.array(channelSchema);
export type Channel = z.infer<typeof channelSchema>;

/* ── stats.json ────────────────────────────────────────────────────────── */

export const statsSchema = z.object({
  generated_at: z.string(),
  site_name: z.string().optional(),
  sources: z.object({
    total: z.number(),
    enabled: z.number().optional(),
    verified: z.number(),
    by_category: z.record(z.string(), z.number()),
    by_tier: z.record(z.string(), z.number()),
  }),
  pipeline: z.object({
    items_total: z.number(),
    clusters_total: z.number(),
    curations_done: z.number(),
    items_7d: z.number().optional(),
    curated_7d: z.number().optional(),
    avg_relevance_7d: z.number().optional(),
  }),
  digests: z.object({
    total: z.number(),
    by_kind: z.record(z.string(), z.number()),
    latest: z
      .object({
        kind: z.string(),
        period: z.string(),
        title: z.string(),
        date: z.string(),
      })
      .nullable()
      .optional(),
  }),
  channels: z.array(
    z.object({
      slug: z.string(),
      picks_current: z.number(),
    })
  ),
  top_surfaces_7d: z.array(
    z.object({
      name: z.string(),
      clusters: z.number(),
    })
  ),
  models: z.record(z.string(), z.string()),
});

export type Stats = z.infer<typeof statsSchema>;

/* ── parse helpers ─────────────────────────────────────────────────────── */

export function parsePicks(data: unknown): Pick[] {
  return picksSchema.parse(data);
}

export function parseChannels(data: unknown): Channel[] {
  return channelsSchema.parse(data);
}

export function parseStats(data: unknown): Stats {
  return statsSchema.parse(data);
}
