import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, ExternalLink, Award } from "lucide-react";
import type { RadarEntry } from "@shared/schema";

interface RadarCardProps {
  entry: RadarEntry;
  rank: number;
}

export function RadarCard({ entry, rank }: RadarCardProps) {
  const isPositiveChange = entry.momAbs > 0;
  const isNegativeChange = entry.momAbs < 0;
  const isNewEntry = entry.prevSales === 0;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(num);
  };

  const formatPercent = (num: number) => {
    if (num > 500) return "+500%+";
    const sign = num >= 0 ? "+" : "";
    return `${sign}${num.toFixed(1)}%`;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-amber-500 text-white dark:bg-amber-600";
    if (rank === 2) return "bg-slate-400 text-white dark:bg-slate-500";
    if (rank === 3) return "bg-amber-700 text-white dark:bg-amber-800";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card
      className="hover-elevate transition-all duration-200"
      data-testid={`card-radar-${entry.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-md text-sm font-bold shrink-0 ${getRankBadgeColor(rank)}`}
            >
              {rank <= 3 ? <Award className="w-4 h-4" /> : rank}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground truncate">
                  {entry.modelName}
                </h3>
                {isNewEntry && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    신규
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {entry.manufacturer}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="shrink-0"
            data-testid={`button-source-${entry.id}`}
          >
            <a
              href={entry.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="다나와 원문 보기"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">판매량</p>
            <p className="text-lg font-bold text-foreground">
              {formatNumber(entry.sales)}
              <span className="text-xs font-normal text-muted-foreground ml-1">대</span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">전월대비</p>
            <div className="flex items-center gap-1">
              {isPositiveChange ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : isNegativeChange ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
              <span
                className={`text-sm font-semibold ${
                  isPositiveChange
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isNegativeChange
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                }`}
              >
                {isPositiveChange ? "+" : ""}
                {formatNumber(entry.momAbs)}
              </span>
            </div>
            <p
              className={`text-xs ${
                isPositiveChange
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isNegativeChange
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
              }`}
            >
              {formatPercent(entry.momPct * 100)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">랭크 변화</p>
            <div className="flex items-center gap-1">
              {entry.rankChange > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    +{entry.rankChange}
                  </span>
                </>
              ) : entry.rankChange < 0 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {entry.rankChange}
                  </span>
                </>
              ) : (
                <>
                  <Minus className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground">-</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isNewEntry ? "신규 진입" : `${entry.prevRank}위 → ${entry.rank}위`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
