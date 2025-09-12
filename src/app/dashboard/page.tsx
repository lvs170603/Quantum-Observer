
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Job, Backend, Metrics, ChartData, JobStatus, DailyJobSummary } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { StatusChart } from "@/components/dashboard/status-chart";
import { JobsTable } from "@/components/dashboard/jobs-table";
import { BackendsGrid } from "@/components/dashboard/backends-grid";
import { DailySummaryChart } from "@/components/dashboard/daily-summary-chart";
import { JobDetailsDrawer } from "@/components/dashboard/job-details-drawer";
import { AnomalyDialog } from "@/components/dashboard/anomaly-dialog";
import { ProfileSheet } from "@/components/dashboard/profile-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { AssistantChat } from "@/components/dashboard/assistant-chat";
import { GanttChart } from "@/components/dashboard/gantt-chart";

type ChartView = "all" | "live_jobs" | "success_rate";

const JOBS_PER_PAGE = 10;

export default function DashboardPage() {
  const [isDemo, setIsDemo] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [backends, setBackends] = useState<Backend[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [dailySummary, setDailySummary] = useState<DailyJobSummary | null>(null);
  const [source, setSource] = useState<string>("mock");
  
  const [chartView, setChartView] = useState<ChartView>("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAnomalyDialogOpen, setIsAnomalyDialogOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [backendFilter, setBackendFilter] = useState<string>("all");

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (isFetching && lastUpdated) return; // Prevent refetch if already fetching, unless it's the initial load
    setIsFetching(true);
    const url = `/api/mock?demo=${isDemo}`;
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
      setSource(data.source);
      setLastUpdated(new Date());

      if (data.note) {
        toast({
            variant: "destructive",
            title: "API Connection Failed",
            description: data.note,
        });
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch data from the server.",
      });
    } finally {
      setIsFetching(false);
    }
  }, [isDemo, toast, isFetching, lastUpdated]);

  useEffect(() => {
    // Initial fetch, ignoring the isFetching check
    (async () => {
        setIsFetching(true);
        const url = `/api/mock?demo=${isDemo}`;
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
        setSource(data.source);
        setLastUpdated(new Date());

        if (data.note) {
            toast({
                variant: "destructive",
                title: "API Connection Failed",
                description: data.note,
            });
        }

        } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch data from the server.",
        });
        } finally {
        setIsFetching(false);
        }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, toast]);


  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, backendFilter]);

  const filteredJobs = useMemo(() => {
    let filtered = jobs;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }
    if (backendFilter !== 'all') {
      filtered = filtered.filter(job => job.backend === backendFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [jobs, searchQuery, statusFilter, backendFilter]);


  const totalPages = Math.ceil((filteredJobs.length || 0) / JOBS_PER_PAGE);

  const handleKpiCardClick = (kpiKey: string) => {
    if (kpiKey === "live_jobs" || kpiKey === "success_rate") {
      setChartView(kpiKey as ChartView);
    } else {
      setChartView("all");
    }
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const paginatedJobs = useMemo(() => {
    return filteredJobs.slice(
      (currentPage - 1) * JOBS_PER_PAGE,
      currentPage * JOBS_PER_PAGE
    );
  }, [filteredJobs, currentPage]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader
        isDemo={isDemo}
        onToggleDemo={() => {
            setIsDemo(!isDemo);
            setCurrentPage(1);
        }}
        autoRefresh={autoRefresh}
        onToggleRefresh={setAutoRefresh}
        lastUpdated={lastUpdated}
        onAnalyze={() => setIsAnomalyDialogOpen(true)}
        isFetching={isFetching}
        onRefresh={fetchData}
        onOpenProfile={() => setIsProfileSheetOpen(true)}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        {metrics ? (
            <KpiCards
                {...metrics}
                onCardClick={handleKpiCardClick}
                activeView={chartView}
            />
        ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[126px]" />)}
            </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {paginatedJobs.length > 0 || isFetching ? (
                <JobsTable
                    jobs={paginatedJobs}
                    onJobSelect={handleJobSelect}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onNextPage={handleNextPage}
                    onPrevPage={handlePrevPage}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    backendFilter={backendFilter}
                    onBackendFilterChange={setBackendFilter}
                    allBackends={backends.map(b => b.name)}
                    isFetching={isFetching}
                />
            ) : (
                <Skeleton className="h-[500px]" />
            )}
          </div>
          <div className="flex flex-col gap-4">
             {backends.length > 0 ? (
                <BackendsGrid backends={backends} />
            ) : (
                <Skeleton className="h-[250px]" />
            )}
             {dailySummary ? (
                <DailySummaryChart data={dailySummary} />
            ) : (
                 <Skeleton className="h-[350px]" />
            )}
          </div>
        </div>

        {chartData.length > 0 ? (
            <StatusChart data={chartData} view={chartView} />
        ) : (
            <Skeleton className="h-[450px]" />
        )}
        
        {jobs.length > 0 ? (
          <GanttChart jobs={jobs} />
        ) : (
          <Skeleton className="h-[450px]" />
        )}

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
      <AssistantChat />
    </div>
  );
}
