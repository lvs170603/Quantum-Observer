
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart"
import type { DailyJobSummary } from "@/lib/types"
import { format } from "date-fns"

interface DailySummaryChartProps {
  data: DailyJobSummary;
}

export function DailySummaryChart({ data }: DailySummaryChartProps) {
  const chartData = data.completedByBackend;
  const chartConfig = Object.fromEntries(
    chartData.map(item => [item.name, { label: item.name, color: item.fill }])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Summary</CardTitle>
        <CardDescription>
          {data.totalCompleted} jobs completed on {format(new Date(data.date), "PPP")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[250px] w-full"
        >
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{left: -20, right: 20, bottom: 40}}>
              <XAxis 
                dataKey="name" 
                type="category" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="name" />}
              />
              <Bar dataKey="value" radius={5}>
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
