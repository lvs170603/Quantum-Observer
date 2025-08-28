import { NextResponse } from 'next/server';
import type { Job, Backend, Metrics, ChartData, JobStatus } from "@/lib/types";
import { subMinutes, subHours, formatISO } from "date-fns";

// This function generates dynamic mock data, simulating a real API response.
function generateMockData() {
  const now = new Date();

  const mockBackends: Backend[] = [
    { name: "ibm_brisbane", status: "active", qubit_count: 127, queue_depth: Math.floor(Math.random() * 10), error_rate: 0.012 },
    { name: "ibm_kyoto", status: "active", qubit_count: 127, queue_depth: Math.floor(Math.random() * 10), error_rate: 0.015 },
    { name: "ibm_osaka", status: "active", qubit_count: 127, queue_depth: Math.floor(Math.random() * 10), error_rate: 0.011 },
    { name: "ibmq_kolkata", status: Math.random() > 0.8 ? "maintenance" : "active", qubit_count: 27, queue_depth: 0, error_rate: 0.025 },
    { name: "ibmq_mumbai", status: "active", qubit_count: 27, queue_depth: Math.floor(Math.random() * 5), error_rate: 0.021 },
    { name: "ibmq_auckland", status: Math.random() > 0.9 ? "inactive" : "active", qubit_count: 27, queue_depth: 0, error_rate: 0.033 },
  ];

  const jobStatuses: JobStatus[] = ["COMPLETED", "RUNNING", "QUEUED", "ERROR", "CANCELLED"];
  const users = ["Alice", "Bob", "Charlie", "David", "Eve"];

  const mockJobs: Job[] = Array.from({ length: 50 }, (_, i) => {
    const status = jobStatuses[Math.floor(Math.random() * jobStatuses.length)];
    const backend = mockBackends[Math.floor(Math.random() * mockBackends.length)].name;
    const submittedTime = subMinutes(now, Math.floor(Math.random() * 240));
    const queueDuration = Math.floor(Math.random() * 10);
    const runDuration = Math.floor(Math.random() * 5);
    const startTime = subMinutes(submittedTime, -queueDuration); 
    const endTime = status === 'COMPLETED' || status === 'ERROR' ? subMinutes(startTime, -runDuration) : now;
    
    const status_history = [
      { status: 'QUEUED' as JobStatus, timestamp: formatISO(submittedTime) },
    ];

    if (now > startTime) {
      status_history.push({ status: 'RUNNING' as JobStatus, timestamp: formatISO(startTime) });
    }
    
    if(status === 'COMPLETED' || status === 'ERROR' || status === 'CANCELLED') {
      if (now > endTime) {
        status_history.push({ status, timestamp: formatISO(endTime) })
      }
    }

    return {
      id: `c${Math.random().toString(36).substr(2, 9)}q${i}`,
      status,
      backend,
      submitted: formatISO(submittedTime),
      elapsed_time: status === 'RUNNING' ? (now.getTime() - startTime.getTime()) / 1000 : (endTime.getTime() - startTime.getTime()) / 1000,
      user: users[i % users.length],
      qpu_seconds: status === 'COMPLETED' ? Math.random() * 10 : 0,
      logs: status === 'ERROR' ? `Error: Qubit calibration failed. Details: ...\n[some other log line]` : `Job execution successful.\nFinal measurement data collected.`,
      results: status === 'COMPLETED' ? { "001": 102, "110": 34, "101": 410 } : {},
      status_history,
    };
  });

  // One job with an anomalously long queue time
  mockJobs.push({
    id: `c_anomaly_long_queue`,
    status: 'COMPLETED',
    backend: 'ibm_brisbane',
    submitted: formatISO(subMinutes(now, 120)),
    elapsed_time: 120, // 2 mins execution
    user: 'Faythe',
    qpu_seconds: 18.5,
    logs: 'Job execution successful.',
    results: { "000": 512, "111": 488 },
    status_history: [
      { status: 'QUEUED', timestamp: formatISO(subMinutes(now, 120)) },
      { status: 'RUNNING', timestamp: formatISO(subMinutes(now, 5)) }, // 115 minute queue time
      { status: 'COMPLETED', timestamp: formatISO(subMinutes(now, 3)) },
    ],
  });

  const liveJobs = mockJobs.filter(j => j.status === 'RUNNING' || j.status === 'QUEUED').length;
  const successfulJobs = mockJobs.filter(j => j.status === 'COMPLETED').length;
  const totalCompletedOrError = successfulJobs + mockJobs.filter(j => j.status === 'ERROR').length;
  const avgWaitTime = mockJobs.reduce((acc, j) => {
    const runningEntry = j.status_history.find(s => s.status === 'RUNNING');
    if (runningEntry) {
      return acc + (new Date(runningEntry.timestamp).getTime() - new Date(j.submitted).getTime());
    }
    return acc;
  }, 0) / (1000 * mockJobs.length);

  const mockMetrics: Metrics = {
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
  
  return {
    jobs: mockJobs,
    backends: mockBackends,
    metrics: mockMetrics,
    chartData: mockChartData,
  };
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const isDemo = searchParams.get('demo') === 'true'

  // In a real app, you would add your Qiskit API fetching logic here.
  // For now, we'll use the dynamic mock data generation.
  // If it's a 'live' call (isDemo is false), you could introduce
  // slight random delays or variations to simulate network latency.
  if (!isDemo) {
    await new Promise(res => setTimeout(res, Math.random() * 500 + 100));
  }
  
  const data = generateMockData();
  
  return NextResponse.json(data);
}
