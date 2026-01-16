import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

type Nation = "domestic" | "export";

function isValidNation(value: string): value is Nation {
  return value === "domestic" || value === "export";
}

interface RadarEntry {
  id: string;
  modelName: string;
  manufacturer: string;
  sales: number;
  prevSales: number;
  momAbs: number;
  momPct: number;
  rank: number;
  prevRank: number;
  rankChange: number;
  score: number;
  nation: "domestic" | "export";
  month: string;
  sourceUrl: string;
}

function zScore(values: number[]): number[] {
  if (values.length === 0) return [];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance) || 1;
  return values.map(v => (v - mean) / stdDev);
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getSeedData(month: string, nation: "domestic" | "export"): RadarEntry[] {
  const domesticModels = [
    { modelName: "캐스퍼", manufacturer: "현대", sales: 8532, prevSales: 5120, momAbs: 3412, momPct: 0.67, rank: 5, prevRank: 12, rankChange: 7 },
    { modelName: "아이오닉 6", manufacturer: "현대", sales: 6841, prevSales: 4200, momAbs: 2641, momPct: 0.63, rank: 8, prevRank: 15, rankChange: 7 },
    { modelName: "EV6", manufacturer: "기아", sales: 5923, prevSales: 3800, momAbs: 2123, momPct: 0.56, rank: 10, prevRank: 18, rankChange: 8 },
    { modelName: "그랜저", manufacturer: "현대", sales: 12450, prevSales: 10200, momAbs: 2250, momPct: 0.22, rank: 1, prevRank: 2, rankChange: 1 },
    { modelName: "쏘렌토", manufacturer: "기아", sales: 9876, prevSales: 7650, momAbs: 2226, momPct: 0.29, rank: 3, prevRank: 5, rankChange: 2 },
    { modelName: "투싼", manufacturer: "현대", sales: 7234, prevSales: 5100, momAbs: 2134, momPct: 0.42, rank: 6, prevRank: 10, rankChange: 4 },
    { modelName: "K8", manufacturer: "기아", sales: 6543, prevSales: 4800, momAbs: 1743, momPct: 0.36, rank: 7, prevRank: 11, rankChange: 4 },
    { modelName: "아반떼", manufacturer: "현대", sales: 11234, prevSales: 9800, momAbs: 1434, momPct: 0.15, rank: 2, prevRank: 3, rankChange: 1 },
    { modelName: "셀토스", manufacturer: "기아", sales: 8765, prevSales: 7500, momAbs: 1265, momPct: 0.17, rank: 4, prevRank: 6, rankChange: 2 },
    { modelName: "스포티지", manufacturer: "기아", sales: 5432, prevSales: 4300, momAbs: 1132, momPct: 0.26, rank: 11, prevRank: 14, rankChange: 3 },
    { modelName: "팰리세이드", manufacturer: "현대", sales: 4987, prevSales: 4100, momAbs: 887, momPct: 0.22, rank: 12, prevRank: 16, rankChange: 4 },
    { modelName: "싼타페", manufacturer: "현대", sales: 4567, prevSales: 3800, momAbs: 767, momPct: 0.20, rank: 13, prevRank: 17, rankChange: 4 },
    { modelName: "K5", manufacturer: "기아", sales: 4321, prevSales: 3600, momAbs: 721, momPct: 0.20, rank: 14, prevRank: 19, rankChange: 5 },
    { modelName: "코나", manufacturer: "현대", sales: 3987, prevSales: 3300, momAbs: 687, momPct: 0.21, rank: 15, prevRank: 20, rankChange: 5 },
    { modelName: "니로", manufacturer: "기아", sales: 3654, prevSales: 3100, momAbs: 554, momPct: 0.18, rank: 16, prevRank: 21, rankChange: 5 },
    { modelName: "레이", manufacturer: "기아", sales: 3456, prevSales: 2950, momAbs: 506, momPct: 0.17, rank: 17, prevRank: 22, rankChange: 5 },
    { modelName: "베뉴", manufacturer: "현대", sales: 3210, prevSales: 2800, momAbs: 410, momPct: 0.15, rank: 18, prevRank: 23, rankChange: 5 },
    { modelName: "아이오닉 5", manufacturer: "현대", sales: 2987, prevSales: 2600, momAbs: 387, momPct: 0.15, rank: 19, prevRank: 24, rankChange: 5 },
    { modelName: "EV9", manufacturer: "기아", sales: 2543, prevSales: 0, momAbs: 2543, momPct: 5.0, rank: 20, prevRank: 0, rankChange: 0 },
    { modelName: "G80", manufacturer: "제네시스", sales: 2345, prevSales: 1900, momAbs: 445, momPct: 0.23, rank: 21, prevRank: 25, rankChange: 4 },
  ];

  const exportModels = [
    { modelName: "Model Y", manufacturer: "테슬라", sales: 4532, prevSales: 2800, momAbs: 1732, momPct: 0.62, rank: 1, prevRank: 3, rankChange: 2 },
    { modelName: "E-클래스", manufacturer: "메르세데스-벤츠", sales: 3876, prevSales: 2500, momAbs: 1376, momPct: 0.55, rank: 2, prevRank: 5, rankChange: 3 },
    { modelName: "5시리즈", manufacturer: "BMW", sales: 3654, prevSales: 2400, momAbs: 1254, momPct: 0.52, rank: 3, prevRank: 6, rankChange: 3 },
    { modelName: "X5", manufacturer: "BMW", sales: 2987, prevSales: 2100, momAbs: 887, momPct: 0.42, rank: 4, prevRank: 8, rankChange: 4 },
    { modelName: "GLE", manufacturer: "메르세데스-벤츠", sales: 2765, prevSales: 2000, momAbs: 765, momPct: 0.38, rank: 5, prevRank: 9, rankChange: 4 },
    { modelName: "A6", manufacturer: "아우디", sales: 2543, prevSales: 1900, momAbs: 643, momPct: 0.34, rank: 6, prevRank: 10, rankChange: 4 },
    { modelName: "Model 3", manufacturer: "테슬라", sales: 2345, prevSales: 1800, momAbs: 545, momPct: 0.30, rank: 7, prevRank: 11, rankChange: 4 },
    { modelName: "Q5", manufacturer: "아우디", sales: 2123, prevSales: 1700, momAbs: 423, momPct: 0.25, rank: 8, prevRank: 12, rankChange: 4 },
    { modelName: "3시리즈", manufacturer: "BMW", sales: 1987, prevSales: 1600, momAbs: 387, momPct: 0.24, rank: 9, prevRank: 13, rankChange: 4 },
    { modelName: "C-클래스", manufacturer: "메르세데스-벤츠", sales: 1876, prevSales: 1500, momAbs: 376, momPct: 0.25, rank: 10, prevRank: 14, rankChange: 4 },
    { modelName: "X3", manufacturer: "BMW", sales: 1765, prevSales: 1450, momAbs: 315, momPct: 0.22, rank: 11, prevRank: 15, rankChange: 4 },
    { modelName: "GLC", manufacturer: "메르세데스-벤츠", sales: 1654, prevSales: 1400, momAbs: 254, momPct: 0.18, rank: 12, prevRank: 16, rankChange: 4 },
    { modelName: "레인지로버", manufacturer: "랜드로버", sales: 1543, prevSales: 1300, momAbs: 243, momPct: 0.19, rank: 13, prevRank: 17, rankChange: 4 },
    { modelName: "카이엔", manufacturer: "포르쉐", sales: 1432, prevSales: 1200, momAbs: 232, momPct: 0.19, rank: 14, prevRank: 18, rankChange: 4 },
    { modelName: "iX", manufacturer: "BMW", sales: 1321, prevSales: 0, momAbs: 1321, momPct: 5.0, rank: 15, prevRank: 0, rankChange: 0 },
    { modelName: "EQE", manufacturer: "메르세데스-벤츠", sales: 1210, prevSales: 980, momAbs: 230, momPct: 0.23, rank: 16, prevRank: 19, rankChange: 3 },
    { modelName: "A4", manufacturer: "아우디", sales: 1098, prevSales: 900, momAbs: 198, momPct: 0.22, rank: 17, prevRank: 20, rankChange: 3 },
    { modelName: "볼보 XC60", manufacturer: "볼보", sales: 987, prevSales: 820, momAbs: 167, momPct: 0.20, rank: 18, prevRank: 21, rankChange: 3 },
    { modelName: "미니 쿠퍼", manufacturer: "미니", sales: 876, prevSales: 750, momAbs: 126, momPct: 0.17, rank: 19, prevRank: 22, rankChange: 3 },
    { modelName: "파나메라", manufacturer: "포르쉐", sales: 765, prevSales: 650, momAbs: 115, momPct: 0.18, rank: 20, prevRank: 23, rankChange: 3 },
  ];

  const sourceUrl = `https://auto.danawa.com/auto/?Month=${month}-00&Nation=${nation}&Tab=Model&Work=record`;
  const models = nation === "domestic" ? domesticModels : exportModels;

  const momAbsValues = models.map(e => e.momAbs);
  const momPctValues = models.map(e => Math.min(e.momPct, 5));
  const rankChangeValues = models.map(e => e.rankChange);

  const zMomAbs = zScore(momAbsValues);
  const zMomPct = zScore(momPctValues);
  const zRankChange = zScore(rankChangeValues);

  return models.map((model, i) => {
    const score = 0.55 * zMomAbs[i] + 0.35 * zMomPct[i] + 0.10 * zRankChange[i];
    return {
      ...model,
      id: generateId(),
      score,
      nation,
      month,
      sourceUrl,
    };
  });
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const params = event.queryStringParameters || {};
  
  const month = params.month || (() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
  })();
  
  const nationRaw = params.nation || "domestic";
  const minSales = parseInt(params.minSales || "0", 10) || 0;
  const excludeNewEntries = params.excludeNewEntries === "true";
  const limit = parseInt(params.limit || "20", 10) || 20;

  if (!isValidNation(nationRaw)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid nation parameter" }),
    };
  }

  let entries = getSeedData(month, nationRaw);

  if (minSales > 0) {
    entries = entries.filter(e => e.sales >= minSales);
  }

  if (excludeNewEntries) {
    entries = entries.filter(e => e.prevSales > 0);
  }

  entries = entries
    .filter(e => e.momAbs > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(entries),
  };
};
