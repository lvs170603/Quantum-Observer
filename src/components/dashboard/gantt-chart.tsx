
"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
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
import type { Job } from "@/lib/types";
import { parseISO, differenceInSeconds, addDays, format } from "date-fns";

interface GanttChartProps {
  jobs: Job[];
}

interface GanttData {
    jobId: string;
    taskName: string;
    range: [number, number];
    progress: number;
    status: string;
}

const processGanttData = (jobs: Job[]): GanttData[] => {
    const relevantJobs = jobs.filter(job => job.status !== 'QUEUED').slice(0, 7);
    if (relevantJobs.length === 0) return [];

    const projectStartDate = parseISO(relevantJobs.reduce((earliest, job) => 
        (parseISO(job.submitted) < parseISO(earliest) ? job.submitted : earliest), relevantJobs[0].submitted
    ));

    return relevantJobs.map((job, index) => {
        const startDate = parseISO(job.submitted);
        
        const runningEntry = job.status_history.find(s => s.status === 'RUNNING');
        const runningDate = runningEntry ? parseISO(runningEntry.timestamp) : new Date();

        const endEntry = job.status_history.find(s => ['COMPLETED', 'ERROR', 'CANCELLED'].includes(s.status));
        const endDate = endEntry ? parseISO(endEntry.timestamp) : addDays(runningDate, 1);
        
        const startOffset = differenceInSeconds(startDate, projectStartDate);
        const endOffset = differenceInSeconds(endDate, projectStartDate);

        let progress = 0;
        if (job.status === 'COMPLETED') {
            progress = 100;
        } else if (job.status === 'RUNNING') {
            progress = Math.floor(Math.random() * 60) + 20; // Random progress for running jobs
        }

        return {
            jobId: `Job #${String(index + 1).padStart(3, '0')}`,
            taskName: `Job #${String(index + 1).padStart(3, '0')}: ${job.backend.split('_')[1]} (${progress}% Done)`,
            range: [startOffset, endOffset],
            progress,
            status: job.status
        };
    });
};


const CustomBarShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const progressWidth = (width * payload.progress) / 100;

  return (
    <g>
      <defs>
        <linearGradient id="gradient-main" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
        </linearGradient>
         <linearGradient id="gradient-progress" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={1} />
          <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={1} />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height} rx={4} ry={4} fill="url(#gradient-main)" />
      <rect x={x} y={y} width={progressWidth} height={height} rx={4} ry={4} fill="url(#gradient-progress)" />
    </g>
  );
};

export function GanttChart({ jobs }: GanttChartProps) {
    const ganttData = useMemo(() => processGanttData(jobs), [jobs]);

    if (!ganttData || ganttData.length === 0) {
        return null;
    }

    const maxRange = Math.max(...ganttData.map(d => d.range[1]));
    const tickValues = Array.from({ length: 6 }, (_, i) => i * (maxRange / 5));

    return (
        <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-wider">QUANTUM JOB SCHEDULING & PROGRESS</CardTitle>
                <CardDescription>Timeline View | Q3 2024</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-[450px] w-full">
                    <ResponsiveContainer>
                        <BarChart
                            layout="vertical"
                            data={ganttData}
                            margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
                            barCategoryGap="30%"
                        >
                            <XAxis
                                type="number"
                                domain={[0, 'dataMax + 10']}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `JUL ${15 + Math.floor(value / (maxRange / 5))}`}
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                ticks={tickValues}
                                tickCount={6}
                                label={{ value: "Timeline", position: 'insideBottom', dy: 20, fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            />
                            <YAxis
                                type="category"
                                dataKey="jobId"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "hsl(var(--foreground))", fontSize: 14, fontWeight: 'bold' }}
                                width={100}
                            />
                             <Tooltip 
                                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                content={<ChartTooltipContent 
                                  formatter={(value, name) => (
                                      <div className="flex flex-col">
                                          <span>{ganttData.find(d => d.range === value)?.taskName}</span>
                                          <span className="text-xs text-muted-foreground">Duration: {(value[1] - value[0]).toFixed(0)}s</span>
                                      </div>
                                  )}
                                />}
                            />
                            <Bar dataKey="range" shape={<CustomBarShape />}>
                               <LabelList dataKey="taskName" position="insideLeft" offset={10} className="fill-white font-medium text-sm" />
                            </Bar>
                            {ganttData.map((d, i) => (
                                <ReferenceLine 
                                    key={i} 
                                    y={d.jobId} 
                                    stroke="hsl(var(--border))" 
                                    strokeDasharray="3 3" 
                                    strokeOpacity={0.5} 
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
