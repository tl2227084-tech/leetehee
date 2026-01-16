import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Plane } from "lucide-react";
import type { Nation } from "@shared/schema";

interface FilterControlsProps {
  month: string;
  availableMonths: string[];
  nation: Nation;
  minSales: number;
  excludeNewEntries: boolean;
  onMonthChange: (month: string) => void;
  onNationChange: (nation: Nation) => void;
  onMinSalesChange: (minSales: number) => void;
  onExcludeNewEntriesChange: (exclude: boolean) => void;
}

export function FilterControls({
  month,
  availableMonths,
  nation,
  minSales,
  excludeNewEntries,
  onMonthChange,
  onNationChange,
  onMinSalesChange,
  onExcludeNewEntriesChange,
}: FilterControlsProps) {
  const formatMonth = (monthStr: string) => {
    const [year, monthNum] = monthStr.split("-");
    return `${year}년 ${parseInt(monthNum)}월`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="space-y-2 flex-1 max-w-xs">
          <Label htmlFor="month-select" className="text-sm font-medium">
            기준 월
          </Label>
          <Select value={month} onValueChange={onMonthChange}>
            <SelectTrigger id="month-select" data-testid="select-month">
              <SelectValue placeholder="월 선택" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((m) => (
                <SelectItem key={m} value={m} data-testid={`option-month-${m}`}>
                  {formatMonth(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs
          value={nation}
          onValueChange={(v) => onNationChange(v as Nation)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger
              value="domestic"
              className="gap-2"
              data-testid="tab-domestic"
            >
              <Car className="w-4 h-4" />
              국산차
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="gap-2"
              data-testid="tab-export"
            >
              <Plane className="w-4 h-4" />
              수입차
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 sm:items-end">
        <div className="space-y-3 flex-1 max-w-sm">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">최소 판매량</Label>
            <span className="text-sm text-muted-foreground font-mono">
              {minSales.toLocaleString()}대 이상
            </span>
          </div>
          <Slider
            value={[minSales]}
            onValueChange={([v]) => onMinSalesChange(v)}
            min={0}
            max={1000}
            step={50}
            className="w-full"
            data-testid="slider-min-sales"
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="exclude-new"
            checked={excludeNewEntries}
            onCheckedChange={onExcludeNewEntriesChange}
            data-testid="switch-exclude-new"
          />
          <Label
            htmlFor="exclude-new"
            className="text-sm font-medium cursor-pointer"
          >
            신규 진입 제외
          </Label>
        </div>
      </div>
    </div>
  );
}
