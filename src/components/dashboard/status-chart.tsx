"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { ChartData } from "@/lib/types"

interface StatusChartProps {
  data: ChartData[]
}

const chartConfig = {
  COMPLETED: { label: "Completed", color: "hsl(var(--chart-1))" },
  RUNNING: { label: "Running", color: "hsl(var(--chart-2))" },
  QUEUED: { label: "Queued", color: "hsl(var(--chart-4))" },
  ERROR: { label: "Error", color: "hsl(var(--destructive))" },
}

export function StatusChart({ data }: StatusChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Status Over Time</CardTitle>
        <CardDescription>
          This stacked area chart shows the distribution of job statuses (Completed, Running, Queued, Error) over the last 12 hours. Each colored area represents the volume of jobs in that particular state at a given time, allowing for quick identification of trends and potential bottlenecks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
                <linearGradient id="colorCOMPLETED" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-COMPLETED)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-COMPLETED)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorRUNNING" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-RUNNING)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-RUNNING)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorQUEUED" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-QUEUED)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-QUEUED)" stopOpacity={0.1} />
                </linearGradient>
                 <linearGradient id="colorERROR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-ERROR)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-ERROR)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="COMPLETED" stackId="1" stroke="var(--color-COMPLETED)" fill="url(#colorCOMPLETED)" />
              <Area type="monotone" dataKey="RUNNING" stackId="1" stroke="var(--color-RUNNING)" fill="url(#colorRUNNING)" />
              <Area type="monotone" dataKey="QUEUED" stackId="1" stroke="var(--color-QUEUED)" fill="url(#colorQUEUED)" />
              <Area type="monotone" dataKey="ERROR" stackId="1" stroke="var(--color-ERROR)" fill="url(#colorERROR)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
