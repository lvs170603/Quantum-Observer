
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Job, Backend, Metrics, ChartData, JobStatus } from "@/lib/types";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { BackendsGrid } from "@/components/dashboard/backends-grid";
import { JobsTable } from "@/components/dashboard/jobs-table";
import { StatusChart } from "@/components/dashboard/status-chart";
import { JobDetailsDrawer } from "@/components/dashboard/job-details-drawer";
import { AnomalyDialog } from "@/components/dashboard/anomaly-dialog";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REFRESH_INTERVAL = 15000; // 15 seconds
type ChartView = "all" | "live_jobs" | "success_rate";

export default function Home() {
  const [isDemo, setIsDemo] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [backends, setBackends] = useState<Backend[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAnomalyDialogOpen, setIsAnomalyDialogOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [backendFilter, setBackendFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [chartView, setChartView] = useState<ChartView>("all");


  const { toast } = useToast();

  const fetchDemoData = async () => {
    try {
      const fallbackResponse = await fetch("/api/mock?demo=true");
      if (!fallbackResponse.ok) {
         throw new Error('Failed to fetch even the demo data.');
      }
      const fallbackData = await fallbackResponse.json();
      setJobs(fallbackData.jobs);
      setBackends(fallbackData.backends);
      setMetrics(fallbackData.metrics);
      setChartData(fallbackData.chartData);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Fatal: Could not load any data.", e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load any data. Please check your connection or contact support.",
      });
    }
  }

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    
    if (isDemo) {
      await fetchDemoData();
      setIsFetching(false);
      return;
    }

    const url = "/api/mock";
    console.log(`Fetching data from ${url}...`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      setJobs(data.jobs);
      setBackends(data.backends);
      setMetrics(data.metrics);
      setChartData(data.chartData);
      setLastUpdated(new Date());

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch dashboard data. Using local demo data as fallback.",
      });
      setIsDemo(true); // Fallback to demo mode
      await fetchDemoData(); // Load demo data
    } finally {
      setIsFetching(false);
    }
  }, [isDemo, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let newFilteredJobs = jobs;
    if (backendFilter !== 'all') {
      newFilteredJobs = newFilteredJobs.filter(job => job.backend === backendFilter);
    }
    if (statusFilter !== 'all') {
      newFilteredJobs = newFilteredJobs.filter(job => job.status === statusFilter);
    }
    setFilteredJobs(newFilteredJobs);
  }, [jobs, backendFilter, statusFilter]);

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
  
  const handleKpiCardClick = (kpiKey: string) => {
    if (kpiKey === 'live_jobs' || kpiKey === 'success_rate') {
      setChartView(prev => (prev === kpiKey ? 'all' : kpiKey as ChartView));
    }
  };

  const backendNames = useMemo(() => backends.map(b => b.name), [backends]);
  
  const FilterControls = () => (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
       <div className="grid gap-2">
         <Label>Filter by backend</Label>
        <Select value={backendFilter} onValueChange={setBackendFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by backend..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Backends</SelectItem>
            {backendNames.map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label>Filter by status</Label>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
          <SelectTrigger className="w-full md:w-[150px]">
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
      </div>

       <div className="flex flex-col gap-2 pt-0 md:pt-5">
         <Button variant="outline" onClick={onResetFilters} className="w-full md:w-auto">
            Reset
          </Button>
       </div>
    </div>
  );

  const onResetFilters = () => {
    setBackendFilter("all");
    setStatusFilter("all");
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader
        isDemo={isDemo}
        onToggleDemo={handleToggleDemo}
        autoRefresh={autoRefresh}
        onToggleRefresh={handleToggleRefresh}
        lastUpdated={lastUpdated}
        onAnalyze={() => setIsAnomalyDialogOpen(true)}
        onOpenFilters={() => setIsFilterSheetOpen(true)}
        isFetching={isFetching}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {metrics && <KpiCards metrics={metrics} onCardClick={handleKpiCardClick} activeView={chartView} />}
        </div>
        
        <div className="hidden md:flex md:items-center md:justify-between">
           <FilterControls />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <JobsTable jobs={filteredJobs} onJobSelect={handleJobSelect} />
          </div>
          <div className="lg:col-span-2">
            <BackendsGrid backends={backends} />
          </div>
        </div>
        <StatusChart data={chartData} view={chartView} />
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

      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] rounded-t-lg">
           <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <FilterControls />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
