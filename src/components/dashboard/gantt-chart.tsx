
"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Job, GanttChartData } from "@/lib/types";
import { parseISO, differenceInSeconds } from "date-fns";

interface GanttChartProps {
  jobs: Job[];
}

const chartConfig = {
  queueDuration: { label: "Queue Time", color: "hsl(var(--chart-4))" },
  runDuration: { label: "Run Time", color: "hsl(var(--chart-2))" },
};

function processGanttData(jobs: Job[]): GanttChartData[] {
  const sortedJobs = [...jobs]
    .filter(
      (job) =>
        job.status_history.length > 0 &&
        (job.status === "RUNNING" || job.status === "COMPLETED")
    )
    .sort(
      (a, b) =>
        parseISO(a.status_history[0].timestamp).getTime() -
        parseISO(b.status_history[0].timestamp).getTime()
    );

  const now = new Date();

  return sortedJobs.slice(0, 15).map((job) => {
    const created = parseISO(job.status_history[0].timestamp);
    const runningEntry = job.status_history.find((s) => s.status === "RUNNING");
    const started = runningEntry ? parseISO(runningEntry.timestamp) : now;
    
    const endEntry = job.status_history.find(s => s.status === "COMPLETED" || s.status === "ERROR" || s.status === "CANCELLED");
    const ended = endEntry ? parseISO(endEntry.timestamp) : now;

    const queueDuration = differenceInSeconds(started, created);
    const runDuration = (job.status === "RUNNING" || job.status === "COMPLETED") ? differenceInSeconds(ended, started) : 0;
    
    return {
      jobId: job.id.substring(0, 12),
      backend: job.backend,
      queueDuration: Math.max(0, queueDuration),
      runDuration: Math.max(0, runDuration),
    };
  });
}

export function GanttChart({ jobs }: GanttChartProps) {
  const ganttData = useMemo(() => processGanttData(jobs), [jobs]);

  if (!ganttData || ganttData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Scheduling Gantt Chart</CardTitle>
        <CardDescription>
          Timeline of recent jobs showing queue and execution duration (in
          seconds).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[400px] w-full"
        >
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={ganttData}
              stackOffset="expand"
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            >
              <XAxis 
                type="number" 
                label={{ value: 'Time (seconds)', position: 'insideBottom', dy: 20, fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="jobId"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar
                dataKey="queueDuration"
                stackId="a"
                fill="hsl(var(--chart-4))"
                radius={[4, 0, 0, 4]}
              />
              <Bar
                dataKey="runDuration"
                stackId="a"
                fill="hsl(var(--chart-2))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
