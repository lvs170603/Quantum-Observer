
"use client"

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Job, GanttChartDataPoint } from "@/lib/types";
import { parseISO, differenceInSeconds } from "date-fns";

interface GanttChartProps {
  jobs: Job[];
}

const processGanttData = (jobs: Job[]): GanttChartDataPoint[] => {
  const now = new Date();
  const sortedJobs = [...jobs]
    .sort((a, b) => parseISO(a.submitted).getTime() - parseISO(b.submitted).getTime())
    .slice(-10); // Limit to latest 10 jobs for clarity

  const data: GanttChartDataPoint[] = [];

  const overallStartTime = sortedJobs.length > 0 ? parseISO(sortedJobs[0].submitted).getTime() : now.getTime();

  for (const [index, job] of sortedJobs.entries()) {
    const jobName = `Job ${job.id.slice(0, 5)}...`;
    const dataPoint: GanttChartDataPoint = { name: jobName, queued: 0, running: 0, completed: 0 };
    
    let lastTimestamp = parseISO(job.submitted);

    for (const history of job.status_history) {
      const currentTimestamp = parseISO(history.timestamp);
      const duration = differenceInSeconds(currentTimestamp, lastTimestamp);

      if (lastTimestamp >= parseISO(job.submitted)) {
         if (history.status === 'RUNNING') {
          dataPoint.queued = differenceInSeconds(lastTimestamp, parseISO(job.submitted));
        } else if (history.status === 'COMPLETED' || history.status === 'ERROR' || history.status === 'CANCELLED') {
          dataPoint.running = duration;
        }
      }

      lastTimestamp = currentTimestamp;
    }

    // For jobs still running or queued
    if (job.status === 'RUNNING') {
        const runningEntry = job.status_history.find(s => s.status === 'RUNNING');
        if (runningEntry) {
            dataPoint.running = differenceInSeconds(now, parseISO(runningEntry.timestamp));
        }
    } else if (job.status === 'QUEUED') {
        dataPoint.queued = differenceInSeconds(now, parseISO(job.submitted));
    }


    data.push(dataPoint);
  }

  return data;
};


const chartConfig = {
  queued: { label: "Queued", color: "hsl(var(--chart-4))" },
  running: { label: "Running", color: "hsl(var(--chart-2))" },
};


export function GanttChart({ jobs }: GanttChartProps) {
  const ganttData = useMemo(() => processGanttData(jobs), [jobs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Scheduling Gantt Chart</CardTitle>
        <CardDescription>Timeline of recent job states (in seconds).</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer>
                <BarChart data={ganttData} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" label={{ value: 'Time in Seconds', position: 'insideBottom', dy: 20, fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip 
                        cursor={{fill: 'hsl(var(--muted) / 0.5)'}} 
                        content={<ChartTooltipContent indicator="dot" />} 
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="queued" stackId="a" fill={chartConfig.queued.color} radius={[5, 0, 0, 5]} />
                    <Bar dataKey="running" stackId="a" fill={chartConfig.running.color} radius={[0, 5, 5, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
