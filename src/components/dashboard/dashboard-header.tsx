"use client"

import { BrainCircuit, RefreshCw, SlidersHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ThemeToggle } from "@/components/dashboard/theme-toggle"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

type DashboardHeaderProps = {
  isDemo: boolean;
  onToggleDemo: (checked: boolean) => void;
  autoRefresh: boolean;
  onToggleRefresh: (checked: boolean) => void;
  lastUpdated: Date | null;
  onAnalyze: () => void;
  backendNames: string[];
  isFetching: boolean;
};

export function DashboardHeader({
  isDemo,
  onToggleDemo,
  autoRefresh,
  onToggleRefresh,
  lastUpdated,
  onAnalyze,
  backendNames,
  isFetching
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold md:text-xl">Quantum Observer</h1>
      </div>
      <div className="flex w-full items-center justify-end gap-4">
        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2">
            <Label htmlFor="demo-mode" className="text-sm font-medium">
              Demo
            </Label>
            <Switch id="demo-mode" checked={isDemo} onCheckedChange={onToggleDemo} />
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-sm font-medium">
              Auto-refresh
            </Label>
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={onToggleRefresh} />
          </div>
          <div className="text-sm text-muted-foreground">
            {lastUpdated && `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`}
          </div>
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${isFetching ? 'animate-spin' : ''}`} />
        </div>
        
        <div className="hidden items-center gap-2 md:flex">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by backend..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Backends</SelectItem>
              {backendNames.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="RUNNING">Running</SelectItem>
                <SelectItem value="QUEUED">Queued</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={onAnalyze}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            Analyze Anomalies
          </Button>
        </div>

        <div className="md:hidden">
            <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
            </Button>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
