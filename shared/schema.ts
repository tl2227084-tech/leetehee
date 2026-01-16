import { z } from "zod";

export const nationSchema = z.enum(["domestic", "export"]);
export type Nation = z.infer<typeof nationSchema>;

export const radarEntrySchema = z.object({
  id: z.string(),
  modelName: z.string(),
  manufacturer: z.string(),
  sales: z.number(),
  prevSales: z.number(),
  momAbs: z.number(),
  momPct: z.number(),
  rank: z.number(),
  prevRank: z.number(),
  rankChange: z.number(),
  score: z.number(),
  nation: nationSchema,
  month: z.string(),
  sourceUrl: z.string(),
});

export type RadarEntry = z.infer<typeof radarEntrySchema>;

export const insertRadarEntrySchema = radarEntrySchema.omit({ id: true, score: true });
export type InsertRadarEntry = z.infer<typeof insertRadarEntrySchema>;

export const radarFilterSchema = z.object({
  month: z.string().optional(),
  nation: nationSchema.optional(),
  minSales: z.number().optional(),
  excludeNewEntries: z.boolean().optional(),
  limit: z.number().optional(),
});

export type RadarFilter = z.infer<typeof radarFilterSchema>;
