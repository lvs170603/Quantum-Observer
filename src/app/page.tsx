"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Job, Backend, Metrics, ChartData } from "@/lib/types";
import { mockJobs, mockBackends, mockMetrics, mockChartData } from "@/data/mock-data";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { BackendsGrid } from "@/components/dashboard/backends-grid";
import { JobsTable } from "@/components/dashboard/jobs-table";
import { StatusChart } from "@/components/dashboard/status-chart";
import { JobDetailsDrawer } from "@/components/dashboard/job-details-drawer";
import { AnomalyDialog } from "@/components/dashboard/anomaly-dialog";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useToast } from "@/hooks/use-toast";

const REFRESH_INTERVAL = 15000; // 15 seconds

export default function Home() {
  const [isDemo, setIsDemo] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [backends, setBackends] = useState<Backend[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAnomalyDialogOpen, setIsAnomalyDialogOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    console.log(isDemo ? "Fetching demo data..." : "Fetching live data...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (isDemo) {
        setJobs(mockJobs);
        setBackends(mockBackends);
        setMetrics(mockMetrics);
        setChartData(mockChartData);
      } else {
        // In a real app, you'd fetch from your API proxy here
        // e.g., const jobs = await fetch('/api/jobs').then(res => res.json());
        // For now, we'll just show a toast and use mock data as placeholder
        toast({
          title: "Live Mode",
          description: "Live data fetching is not implemented. Using demo data.",
        });
        setJobs(mockJobs);
        setBackends(mockBackends);
        setMetrics(mockMetrics);
        setChartData(mockChartData);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch dashboard data.",
      });
    } finally {
      setIsFetching(false);
    }
  }, [isDemo, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      const intervalId = setInterval(fetchData, REFRESH_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [autoRefresh, fetchData]);

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  const handleToggleDemo = (checked: boolean) => {
    setIsDemo(checked);
  };
  
  const handleToggleRefresh = (checked: boolean) => {
    setAutoRefresh(checked);
  }

  const backendNames = useMemo(() => mockBackends.map(b => b.name), []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader
        isDemo={isDemo}
        onToggleDemo={handleToggleDemo}
        autoRefresh={autoRefresh}
        onToggleRefresh={handleToggleRefresh}
        lastUpdated={lastUpdated}
        onAnalyze={() => setIsAnomalyDialogOpen(true)}
        backendNames={backendNames}
        isFetching={isFetching}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {metrics && <KpiCards metrics={metrics} />}
        <div className="grid gap-4 md:gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <JobsTable jobs={jobs} onJobSelect={handleJobSelect} />
          </div>
          <div className="lg:col-span-2">
            <BackendsGrid backends={backends} />
          </div>
        </div>
        <StatusChart data={chartData} />
      </main>

      <JobDetailsDrawer
        job={selectedJob}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
      
      <AnomalyDialog
        jobs={jobs}
        isOpen={isAnomalyDialogOpen}
        onOpenChange={setIsAnomalyDialogOpen}
      />
    </div>
  );
}
