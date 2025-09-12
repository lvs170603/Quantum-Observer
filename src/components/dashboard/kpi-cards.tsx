
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Clock, CheckCircle, Users, Layers } from "lucide-react";
import type { Metrics } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";


interface KpiCardsProps extends Metrics {
  onCardClick: (kpiKey: string) => void;
  activeView: string;
}

const kpiConfig = [
   {
    title: "Total Jobs",
    key: "total_jobs" as const,
    icon: Layers,
    description: "Total jobs processed in the period",
    format: (value: number) => value.toString(),
    clickable: false,
  },
  {
    title: "Live Jobs",
    key: "live_jobs" as const,
    icon: Activity,
    description: "Jobs currently running or queued",
    format: (value: number) => value.toString(),
    clickable: true,
  },
  {
    title: "Avg Wait Time",
    key: "avg_wait_time" as const,
    icon: Clock,
    description: "Average time jobs spend in queue",
    format: (value: number) => `${Math.round(value / 60)}m ${Math.round(value % 60)}s`,
    clickable: false,
  },
  {
    title: "Success Rate",
    key: "success_rate" as const,
    icon: CheckCircle,
    description: "Percentage of jobs completed successfully",
    format: (value: number) => `${value.toFixed(1)}%`,
    clickable: true,
  },
  {
    title: "Open Sessions",
    key: "open_sessions" as const,
    icon: Users,
    description: "Active user sessions",
    format: (value: number) => value.toString(),
    clickable: true,
  },
];

export function KpiCards({ onCardClick, activeView, ...metrics }: KpiCardsProps) {
  const router = useRouter();

  const handleCardClick = (kpiKey: string) => {
    if (kpiKey === 'open_sessions') {
      router.push('/dashboard/sessions');
    } else {
      onCardClick(kpiKey);
    }
  };

  const kpiItems = kpiConfig.filter(kpi => metrics[kpi.key] !== undefined);


  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-${kpiItems.length}`}>
      {kpiItems.map((kpi) => {
        const Icon = kpi.icon;
        const value = metrics[kpi.key];
        const isActive = activeView === kpi.key;

        const cardInnerContent = (
          <>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{kpi.format(value)}</div>
                <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </>
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
                onClick={() => handleCardClick(kpi.key)}
                className="w-full text-left p-0 focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                aria-pressed={isActive && kpi.key !== 'open_sessions'}
              >
                {cardInnerContent}
              </button>
            ) : (
              <div className="p-0">{cardInnerContent}</div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
