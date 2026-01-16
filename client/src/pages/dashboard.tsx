import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { RadarCard } from "@/components/radar-card";
import { FilterControls } from "@/components/filter-controls";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, AlertCircle, BarChart3 } from "lucide-react";
import type { RadarEntry, Nation } from "@shared/schema";

function generateAvailableMonths(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    months.push(`${year}-${month}`);
  }
  return months;
}

function RadarCardSkeleton() {
  return (
    <div className="rounded-md border bg-card p-4 space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ nation }: { nation: Nation }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <BarChart3 className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        데이터가 없습니다
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        선택한 조건에 맞는 {nation === "domestic" ? "국산차" : "수입차"} 급상승
        모델이 없습니다. 필터 조건을 조정해 보세요.
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        데이터를 불러올 수 없습니다
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        네트워크 연결을 확인하고 다시 시도해 주세요.
      </p>
      <Button variant="outline" onClick={onRetry} data-testid="button-retry">
        <RefreshCw className="w-4 h-4 mr-2" />
        다시 시도
      </Button>
    </div>
  );
}

export default function Dashboard() {
  const availableMonths = useMemo(() => generateAvailableMonths(), []);
  const [month, setMonth] = useState(availableMonths[1] || availableMonths[0]);
  const [nation, setNation] = useState<Nation>("domestic");
  const [minSales, setMinSales] = useState(300);
  const [excludeNewEntries, setExcludeNewEntries] = useState(false);

  const queryParams = new URLSearchParams({
    month,
    nation,
    minSales: String(minSales),
    excludeNewEntries: String(excludeNewEntries),
    limit: "20",
  });

  const {
    data: entries = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<RadarEntry[]>({
    queryKey: ["/api/radar", month, nation, minSales, excludeNewEntries],
    queryFn: async () => {
      const res = await fetch(`/api/radar?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch radar data");
      return res.json();
    },
  });

  const stats = useMemo(() => {
    if (!entries.length) return null;
    const totalSales = entries.reduce((sum, e) => sum + e.sales, 0);
    const avgGrowth =
      entries.reduce((sum, e) => sum + e.momPct, 0) / entries.length;
    const topGainer = entries[0];
    return { totalSales, avgGrowth, topGainer };
  }, [entries]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  자동차 판매 급상승 레이더
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  다나와 데이터 기반 실시간 분석
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                data-testid="button-refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
                />
                새로고침
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <FilterControls
            month={month}
            availableMonths={availableMonths}
            nation={nation}
            minSales={minSales}
            excludeNewEntries={excludeNewEntries}
            onMonthChange={setMonth}
            onNationChange={setNation}
            onMinSalesChange={setMinSales}
            onExcludeNewEntriesChange={setExcludeNewEntries}
          />
        </div>

        {stats && !isLoading && !isError && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-md border p-4">
              <p className="text-xs text-muted-foreground mb-1">총 판매량</p>
              <p className="text-xl font-bold text-foreground">
                {stats.totalSales.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  대
                </span>
              </p>
            </div>
            <div className="bg-card rounded-md border p-4">
              <p className="text-xs text-muted-foreground mb-1">평균 성장률</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                +{(stats.avgGrowth * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-card rounded-md border p-4 col-span-2">
              <p className="text-xs text-muted-foreground mb-1">
                Top 급상승 모델
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="shrink-0">
                  1위
                </Badge>
                <p className="font-semibold text-foreground truncate">
                  {stats.topGainer.modelName}
                </p>
                <span className="text-sm text-emerald-600 dark:text-emerald-400 shrink-0">
                  +{stats.topGainer.momAbs.toLocaleString()}대
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Top 20 급상승 모델
          </h2>
          <Badge variant="outline" className="text-xs">
            {nation === "domestic" ? "국산차" : "수입차"}
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RadarCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : entries.length === 0 ? (
          <EmptyState nation={nation} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry, index) => (
              <RadarCard key={entry.id} entry={entry} rank={index + 1} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4">
          <p className="text-xs text-muted-foreground text-center">
            본 서비스는 다나와 자동차 판매 데이터를 기반으로 파생 지표를
            제공합니다. 원문 데이터는{" "}
            <a
              href="https://auto.danawa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
              data-testid="link-danawa-source"
            >
              다나와 자동차
            </a>
            에서 확인하세요.
          </p>
        </div>
      </footer>
    </div>
  );
}
