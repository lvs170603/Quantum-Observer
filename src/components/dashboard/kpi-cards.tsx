"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Clock, CheckCircle, Users } from "lucide-react";
import type { Metrics } from "@/lib/types";
import { cn } from "@/lib/utils";


interface KpiCardsProps {
  metrics: Metrics;
  onCardClick: (kpiKey: string) => void;
  activeView: string;
}

const kpiData = [
  {
    title: "Live Jobs",
    key: "live_jobs",
    icon: Activity,
    description: "Jobs currently running or queued",
    format: (value: number) => value.toString(),
    clickable: true,
  },
  {
    title: "Avg Wait Time",
    key: "avg_wait_time",
    icon: Clock,
    description: "Average time jobs spend in queue",
    format: (value: number) => `${Math.round(value / 60)}m ${Math.round(value % 60)}s`,
    clickable: false,
  },
  {
    title: "Success Rate",
    key: "success_rate",
    icon: CheckCircle,
    description: "Percentage of jobs completed successfully",
    format: (value: number) => `${value.toFixed(1)}%`,
    clickable: true,
  },
  {
    title: "Open Sessions",
    key: "open_sessions",
    icon: Users,
    description: "Active user sessions",
    format: (value: number) => value.toString(),
    clickable: false,
  },
];

export function KpiCards({ metrics, onCardClick, activeView }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
      {kpiData.map((kpi) => {
        const Icon = kpi.icon;
        const value = metrics[kpi.key as keyof Metrics];
        const isActive = activeView === kpi.key;

        const cardContent = (
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
        );

        return (
          <Card 
            key={kpi.title} 
            className={cn(
              "transition-colors", 
              kpi.clickable && "hover:bg-muted",
              isActive && "bg-primary/10 border-primary"
            )}
          >
            {kpi.clickable ? (
              <button
                onClick={() => onCardClick(kpi.key)}
                className="w-full text-left p-0 focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                aria-pressed={isActive}
              >
                {cardContent}
                 <CardContent>
                    <div className="text-2xl font-bold">{kpi.format(value)}</div>
                    <p className="text-xs text-muted-foreground">{kpi.description}</p>
                </CardContent>
              </button>
            ) : (
              <>
                {cardContent}
                 <CardContent>
                    <div className="text-2xl font-bold">{kpi.format(value)}</div>
                    <p className="text-xs text-muted-foreground">{kpi.description}</p>
                </CardContent>
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}
