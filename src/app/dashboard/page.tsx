
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
import { subHours, formatISO, parseISO, isToday, startOfDay } from "date-fns";

type ChartView = "all" | "live_jobs" | "success_rate";

const JOBS_PER_PAGE = 10;

function calculateDailySummary(jobs: Job[]): DailyJobSummary {
  const today = new Date();
  const todaysCompletedJobs = jobs.filter(job => 
    job.status === 'COMPLETED' && isToday(parseISO(job.submitted))
  );

  const completedByBackend = todaysCompletedJobs.reduce((acc, job) => {
    acc[job.backend] = (acc[job.backend] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(completedByBackend).map(([name, value], index) => ({
    name,
    value,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  return {
    date: formatISO(startOfDay(today)),
    totalCompleted: todaysCompletedJobs.length,
    completedByBackend: chartData,
  };
}

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

  const fetchMockData = useCallback(async () => {
    const url = `/api/mock?demo=true`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }, []);

  const fetchRealData = useCallback(async () => {
    console.log("✅ Fetching real data from Python backend...");
    const [backendsResponse, jobsResponse] = await Promise.all([
        fetch(`/api/backends`),
        fetch(`/api/jobs?limit=50`)
    ]);

    if (!backendsResponse.ok) {
        throw new Error(`Backend API Error: ${backendsResponse.status} ${backendsResponse.statusText}`);
    }
    if (!jobsResponse.ok) {
        throw new Error(`Jobs API Error: ${jobsResponse.status} ${jobsResponse.statusText}`);
    }

    const apiBackends = await backendsResponse.json();
    const apiJobs = await jobsResponse.json();
    
    const backends: Backend[] = apiBackends.map((b: any) => ({
        name: b.name,
        status: b.status.toLowerCase() as "active" | "inactive",
        qubit_count: b.qubit_count,
        queue_depth: b.queue_depth,
        error_rate: b.error_rate || 0.0,
    }));

    const jobs: Job[] = apiJobs.map((j: any) => ({
        id: j.id,
        status: j.status.toUpperCase() as JobStatus,
        backend: j.backend,
        submitted: j.submitted,
        elapsed_time: j.elapsed_time,
        user: j.user,
        qpu_seconds: j.qpu_seconds || 0,
        logs: j.logs,
        results: j.results || {},
        status_history: j.status_history,
        circuit_image_url: "https://picsum.photos/seed/circuit/800/200", // placeholder
    }));

    const liveJobs = jobs.filter(j => j.status === 'RUNNING' || j.status === 'QUEUED').length;
    const successfulJobs = jobs.filter(j => j.status === 'COMPLETED').length;
    const totalCompletedOrError = successfulJobs + jobs.filter(j => j.status === 'ERROR').length;

    const jobsWithRunning = jobs.filter(j => j.status_history.some(s => s.status === 'RUNNING'));
    const avgWaitTime = jobsWithRunning.reduce((acc, j) => {
        const runningEntry = j.status_history.find(s => s.status === 'RUNNING');
        if (!runningEntry) return acc;
        const submittedTime = new Date(j.submitted).getTime();
        const runningTime = new Date(runningEntry.timestamp).getTime();
        if (isNaN(submittedTime) || isNaN(runningTime)) return acc;
        return acc + (runningTime - submittedTime);
    }, 0) / (1000 * jobsWithRunning.length || 1);

    const metrics: Metrics = {
        total_jobs: jobs.length,
        live_jobs: liveJobs,
        avg_wait_time: avgWaitTime,
        success_rate: totalCompletedOrError > 0 ? (successfulJobs / totalCompletedOrError) * 100 : 100,
        open_sessions: 1, 
    };
    
    const now = new Date();
    const chartData: ChartData[] = Array.from({ length: 12 }, (_, i) => {
        const time = subHours(now, 11 - i);
        const timePlusHour = subHours(now, 10 - i);
        const jobsInWindow = jobs.filter(j => {
            const submittedDate = parseISO(j.submitted);
            return submittedDate >= time && submittedDate < timePlusHour;
        });

        return {
            time: formatISO(time).substring(11, 16),
            COMPLETED: jobsInWindow.filter(j => j.status === 'COMPLETED').length,
            RUNNING: jobsInWindow.filter(j => j.status === 'RUNNING').length,
            QUEUED: jobsInWindow.filter(j => j.status === 'QUEUED').length,
            ERROR: jobsInWindow.filter(j => j.status === 'ERROR').length,
        };
    });

    const dailySummary = calculateDailySummary(jobs);

    return { jobs, backends, metrics, chartData, dailySummary, source: "real" };
  }, []);

  const fetchData = useCallback(async () => {
    if (isFetching && lastUpdated) return; 
    setIsFetching(true);
    
    try {
      const data = isDemo ? await fetchMockData() : await fetchRealData();
      
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
        title: "Error Fetching Data",
        description: error instanceof Error ? error.message : "Could not fetch data from the server.",
      });
      // If real data fails, fallback to mock data to prevent a blank screen
      if (!isDemo) {
        toast({
            title: "Fallback to Demo Mode",
            description: "Could not connect to the live backend. Displaying demo data instead.",
        });
        const mockData = await fetchMockData();
        setJobs(mockData.jobs);
        setBackends(mockData.backends);
        setMetrics(mockData.metrics);
        setChartData(mockData.chartData);
        setDailySummary(mockData.dailySummary);
        setSource(mockData.source);
        setLastUpdated(new Date());
      }
    } finally {
      setIsFetching(false);
    }
  }, [isDemo, toast, isFetching, lastUpdated, fetchMockData, fetchRealData]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);


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
