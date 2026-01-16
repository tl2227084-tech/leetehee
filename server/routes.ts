import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { radarFilterSchema, nationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/radar", async (req, res) => {
    try {
      const month = typeof req.query.month === "string" ? req.query.month : undefined;
      const nationRaw = typeof req.query.nation === "string" ? req.query.nation : "domestic";
      const minSalesRaw = typeof req.query.minSales === "string" ? parseInt(req.query.minSales, 10) : 0;
      const excludeNewEntriesRaw = req.query.excludeNewEntries === "true";
      const limitRaw = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 20;

      const nation = nationSchema.safeParse(nationRaw);
      if (!nation.success) {
        return res.status(400).json({ error: "Invalid nation parameter" });
      }

      const filter = {
        month,
        nation: nation.data,
        minSales: isNaN(minSalesRaw) ? 0 : minSalesRaw,
        excludeNewEntries: excludeNewEntriesRaw,
        limit: isNaN(limitRaw) ? 20 : limitRaw,
      };

      const entries = await storage.getRadarEntries(filter);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching radar entries:", error);
      res.status(500).json({ error: "Failed to fetch radar entries" });
    }
  });

  app.get("/api/radar/months", async (req, res) => {
    try {
      const months = await storage.getAvailableMonths();
      res.json(months);
    } catch (error) {
      console.error("Error fetching available months:", error);
      res.status(500).json({ error: "Failed to fetch available months" });
    }
  });

  return httpServer;
}
