
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Job, Backend, Metrics, ChartData, JobStatus, DailyJobSummary } from "@/lib/types";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { BackendsGrid } from "@/components/dashboard/backends-grid";
import { JobsTable } from "@/components/dashboard/jobs-table";
import { StatusChart } from "@/components/dashboard/status-chart";
import { JobDetailsDrawer } from "@/components/dashboard/job-details-drawer";
import { AnomalyDialog } from "@/components/dashboard/anomaly-dialog";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DailySummaryChart } from "@/components/dashboard/daily-summary-chart";
import { ProfileSheet } from "@/components/dashboard/profile-sheet";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL = 15000; // 15 seconds
type ChartView = "all" | "live_jobs" | "success_rate";
const JOBS_PER_PAGE = 10;

export default function DashboardPage() {
  const [isDemo, setIsDemo] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [backends, setBackends] = useState<Backend[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [dailySummary, setDailySummary] = useState<DailyJobSummary | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAnomalyDialogOpen, setIsAnomalyDialogOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [backendFilter, setBackendFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chartView, setChartView] = useState<ChartView>("all");
  const [currentPage, setCurrentPage] = useState(1);


  const { toast } = useToast();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    
    const url = `/api/mock?demo=${isDemo}`;
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
      setDailySummary(data.dailySummary);
      setLastUpdated(new Date());

      if (data.note) {
        toast({
          variant: "destructive",
          title: "API Connection Error",
          description: data.note,
        });
        // Fallback to demo data if the API fails
        if (!isDemo) setIsDemo(true);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: "Could not retrieve live data. Displaying local demo data as a fallback. Please check the API connection.",
      });
      // Fallback to demo data if the API fails
      if (!isDemo) setIsDemo(true);
    } finally {
      setIsFetching(false);
    }
  }, [isDemo, isFetching, toast]);

  useEffect(() => {
    fetchData();
    // We only want to run this on the initial load and when the demo mode is toggled.
    // The auto-refresh interval is handled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);
  
  useEffect(() => {
    if (autoRefresh) {
      const intervalId = setInterval(() => fetchData(), REFRESH_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [autoRefresh, fetchData]);

  useEffect(() => {
    let newFilteredJobs = jobs;
    if (backendFilter !== 'all') {
      newFilteredJobs = newFilteredJobs.filter(job => job.backend === backendFilter);
    }
    if (statusFilter !== 'all') {
      newFilteredJobs = newFilteredJobs.filter(job => job.status === statusFilter);
    }
    if (searchQuery) {
      newFilteredJobs = newFilteredJobs.filter(job => 
        job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredJobs(newFilteredJobs);
    setCurrentPage(1); // Reset to first page when filters change
  }, [jobs, backendFilter, statusFilter, searchQuery]);

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
    } else if (kpiKey === 'open_sessions') {
      router.push('/dashboard/sessions');
    }
  };
  
  const backendNames = useMemo(() => backends.map(b => b.name), [backends]);
  
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const jobsForCurrentPage = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const FilterControls = () => (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
       <div className="grid gap-2">
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Job ID or User..."
              className="w-full pl-8 md:w-[250px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
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
    setSearchQuery("");
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <DashboardHeader
        isDemo={isDemo}
        onToggleDemo={handleToggleDemo}
        autoRefresh={autoRefresh}
        onToggleRefresh={handleToggleRefresh}
        lastUpdated={lastUpdated}
        onAnalyze={() => setIsAnomalyDialogOpen(true)}
        onOpenFilters={() => setIsFilterSheetOpen(true)}
        isFetching={isFetching}
        onRefresh={fetchData}
        onOpenProfile={() => setIsProfileSheetOpen(true)}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        {metrics && <KpiCards onCardClick={handleKpiCardClick} activeView={chartView} {...metrics} />}
        
        <div className="hidden md:flex md:items-center md:justify-between">
           <FilterControls />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <JobsTable
              jobs={jobsForCurrentPage}
              onJobSelect={handleJobSelect}
              currentPage={currentPage}
              totalPages={totalPages}
              onNextPage={handleNextPage}
              onPrevPage={handlePrevPage}
            />
          </div>
          <div className="lg:col-span-2 space-y-4">
            {dailySummary && <DailySummaryChart data={dailySummary} />}
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

      <ProfileSheet
        isOpen={isProfileSheetOpen}
        onOpenChange={setIsProfileSheetOpen}
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
