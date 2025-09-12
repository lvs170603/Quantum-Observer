
import { NextResponse } from 'next/server';
import type { Job, Backend, Metrics, ChartData, JobStatus, DailyJobSummary } from "@/lib/types";
import { subMinutes, subHours, formatISO, parseISO, isToday, startOfDay } from "date-fns";
import { generateCircuitDiagram } from '@/ai/flows/generate-circuit-diagram';

// ✅ Simple in-memory cache for mock data (optional)
let mockCache: { data: any; timestamp: number } | null = null;

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

// ✅ Generate mock data (cached for 1 minute to improve performance)
async function generateMockData() {
  if (mockCache && Date.now() - mockCache.timestamp < 60 * 1000) {
    return { ...mockCache.data, source: "mock (cached)" };
  }

  const now = new Date();
  const mockBackends: Backend[] = [
    { name: "ibm_brisbane", status: "active", qubit_count: 127, queue_depth: Math.floor(Math.random() * 10), error_rate: 0.012 },
    { name: "ibm_kyoto", status: "active", qubit_count: 127, queue_depth: Math.floor(Math.random() * 10), error_rate: 0.015 },
    { name: "ibm_osaka", status: "active", qubit_count: 127, queue_depth: Math.floor(Math.random() * 10), error_rate: 0.011 },
    { name: "ibmq_kolkata", status: Math.random() > 0.8 ? "inactive" : "active", qubit_count: 27, queue_depth: 0, error_rate: 0.025 },
    { name: "ibmq_mumbai", status: "active", qubit_count: 27, queue_depth: Math.floor(Math.random() * 5), error_rate: 0.021 },
    { name: "ibmq_auckland", status: Math.random() > 0.9 ? "inactive" : "active", qubit_count: 27, queue_depth: 0, error_rate: 0.033 },
  ];

  const jobStatuses: JobStatus[] = ["COMPLETED", "RUNNING", "QUEUED", "ERROR", "CANCELLED"];
  const users = ["Alice", "Bob", "Charlie", "David", "Eve"];

  // ✅ Generate circuit diagrams (limited to 10)
  const circuitImages = await Promise.all(
    Array.from({ length: 10 }, (_,i) =>
      generateCircuitDiagram({ prompt: `A simple quantum circuit diagram with random gates and seed ${i}.` })
    )
  );

  const mockJobs: Job[] = Array.from({ length: 50 }, (_, i) => {
    const status = jobStatuses[Math.floor(Math.random() * jobStatuses.length)];
    const backend = mockBackends[Math.floor(Math.random() * mockBackends.length)].name;
    const submittedTime = subMinutes(now, Math.floor(Math.random() * 240));
    const queueDuration = Math.floor(Math.random() * 10);
    const runDuration = Math.floor(Math.random() * 5);
    const startTime = subMinutes(submittedTime, -queueDuration);
    const endTime = status === 'COMPLETED' || status === 'ERROR' ? subMinutes(startTime, -runDuration) : now;

    const status_history = [{ status: 'QUEUED' as JobStatus, timestamp: formatISO(submittedTime) }];
    if (now > startTime) status_history.push({ status: 'RUNNING' as JobStatus, timestamp: formatISO(startTime) });
    if (["COMPLETED", "ERROR", "CANCELLED"].includes(status)) {
      if (now > endTime) status_history.push({ status, timestamp: formatISO(endTime) });
    }

    return {
      id: `c${Math.random().toString(36).substr(2, 9)}q${i}`,
      status,
      backend,
      submitted: formatISO(submittedTime),
      elapsed_time: (endTime.getTime() - startTime.getTime()) / 1000,
      user: users[i % users.length],
      qpu_seconds: status === 'COMPLETED' ? Math.random() * 10 : 0,
      logs: status === 'ERROR' ? `Error: Qubit calibration failed.` : `Job executed successfully.`,
      results: status === 'COMPLETED' ? { "001": 102, "110": 34, "101": 410 } : {},
      status_history,
      circuit_image_url: circuitImages[i % circuitImages.length].url,
    };
  });

  const liveJobs = mockJobs.filter(j => j.status === 'RUNNING' || j.status === 'QUEUED').length;
  const successfulJobs = mockJobs.filter(j => j.status === 'COMPLETED').length;
  const totalCompletedOrError = successfulJobs + mockJobs.filter(j => j.status === 'ERROR').length;

  const jobsWithRunning = mockJobs.filter(j => j.status_history.some(s => s.status === 'RUNNING'));
  const avgWaitTime = jobsWithRunning.reduce((acc, j) => {
    const runningEntry = j.status_history.find(s => s.status === 'RUNNING');
    if (!runningEntry) return acc;
    const submittedTime = new Date(j.submitted).getTime();
    const runningTime = new Date(runningEntry.timestamp).getTime();
    if (isNaN(submittedTime) || isNaN(runningTime)) return acc;
    return acc + (runningTime - submittedTime);
  }, 0) / (1000 * jobsWithRunning.length || 1);

  const mockMetrics: Metrics = {
    total_jobs: mockJobs.length,
    live_jobs: liveJobs,
    avg_wait_time: avgWaitTime,
    success_rate: totalCompletedOrError > 0 ? (successfulJobs / totalCompletedOrError) * 100 : 0,
    open_sessions: Math.floor(Math.random() * 5) + 1,
  };

  const mockChartData: ChartData[] = Array.from({ length: 12 }, (_, i) => {
    const time = subHours(now, 11 - i);
    return {
      time: formatISO(time).substring(11, 16),
      COMPLETED: Math.floor(Math.random() * 20 + 10),
      RUNNING: Math.floor(Math.random() * 10 + 5),
      QUEUED: Math.floor(Math.random() * 15 + 5),
      ERROR: Math.floor(Math.random() * 3),
    };
  });

  const dailySummary = calculateDailySummary(mockJobs);

  const data = { jobs: mockJobs, backends: mockBackends, metrics: mockMetrics, chartData: mockChartData, dailySummary };
  mockCache = { data, timestamp: Date.now() };

  return { ...data, source: "mock" };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isDemo = searchParams.get('demo') === 'true';

  if (!isDemo) {
    // This block should ideally not be hit if the frontend calls the right APIs directly.
    // However, we leave it as a safeguard.
    return NextResponse.json({ error: "This endpoint is for demo data only. Please call /api/jobs and /api/backends directly." }, { status: 400 });
  }

  console.warn("⚠ Using mock data (demo mode).");
  const mockData = await generateMockData();
  return NextResponse.json(mockData);
}
