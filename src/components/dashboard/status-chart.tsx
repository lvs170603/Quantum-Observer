"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { ChartData } from "@/lib/types"
import { useMemo } from "react"

type ChartView = "all" | "live_jobs" | "success_rate";

interface StatusChartProps {
  data: ChartData[]
  view: ChartView
}

const chartConfig = {
  COMPLETED: { label: "Completed", color: "hsl(var(--chart-1))" },
  RUNNING: { label: "Running", color: "hsl(var(--chart-2))" },
  QUEUED: { label: "Queued", color: "hsl(var(--chart-4))" },
  ERROR: { label: "Error", color: "hsl(var(--destructive))" },
}

const viewConfig = {
  all: {
    title: "Job Status Over Time",
    description: "A stacked area chart showing the distribution of all job statuses over the last 12 hours.",
    keys: ["COMPLETED", "RUNNING", "QUEUED", "ERROR"] as const,
  },
  live_jobs: {
    title: "Live Jobs (Running & Queued) Over Time",
    description: "A view focusing on jobs that are currently active in the system, either running or waiting in the queue.",
    keys: ["RUNNING", "QUEUED"] as const,
  },
  success_rate: {
    title: "Finished Jobs (Completed & Error) Over Time",
    description: "A view comparing successfully completed jobs against those that ended in an error.",
    keys: ["COMPLETED", "ERROR"] as const,
  }
}

export function StatusChart({ data, view }: StatusChartProps) {
  const currentView = viewConfig[view];
  const activeChartConfig = useMemo(() => {
    return Object.fromEntries(
        Object.entries(chartConfig).filter(([key]) => currentView.keys.includes(key as any))
    )
  }, [currentView]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentView.title}</CardTitle>
        <CardDescription>
          {currentView.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={activeChartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                label={{ value: 'Time', position: 'insideBottom', dy: 20, fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Number of Jobs', angle: -90, position: 'insideLeft', dx: -10, fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltipContent indicator="dot" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <defs>
                {Object.keys(activeChartConfig).map((key) => (
                   <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              {currentView.keys.map((key) => (
                <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={`var(--color-${key})`} fill={`url(#color${key})`} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
