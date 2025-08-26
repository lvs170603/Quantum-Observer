"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Job, Backend, Metrics, ChartData, JobStatus } from "@/lib/types";
import { mockJobs, mockBackends, mockMetrics, mockChartData } from "@/data/mock-data";
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
import { Separator } from "@/components/ui/separator";

const REFRESH_INTERVAL = 15000; // 15 seconds

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

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    console.log(isDemo ? "Fetching demo data..." : "Fetching live data...");
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (isDemo) {
        setJobs(mockJobs);
        setBackends(mockBackends);
        setMetrics(mockMetrics);
        setChartData(mockChartData);
      } else {
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

  const backendNames = useMemo(() => mockBackends.map(b => b.name), []);
  
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
    <div className="flex min-h-screen w-full flex-col">
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
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {metrics && <KpiCards metrics={metrics} />}
        
        <div className="hidden md:flex md:items-center md:justify-between">
           <FilterControls />
           <Button variant="outline" onClick={onResetFilters}>
            Reset Filters
          </Button>
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="lg:col-span-1 xl:col-span-2">
            <JobsTable jobs={filteredJobs} onJobSelect={handleJobSelect} />
          </div>
          <div className="lg:col-span-1 xl:col-span-1">
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
