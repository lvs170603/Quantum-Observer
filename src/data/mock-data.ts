import type { Job, Backend, Metrics, ChartData, JobStatus } from "@/lib/types";
import { subMinutes, subHours, formatISO } from "date-fns";

const now = new Date();

export const mockBackends: Backend[] = [
  { name: "ibm_brisbane", status: "active", qubit_count: 127, queue_depth: 3, error_rate: 0.012 },
  { name: "ibm_kyoto", status: "active", qubit_count: 127, queue_depth: 8, error_rate: 0.015 },
  { name: "ibm_osaka", status: "active", qubit_count: 127, queue_depth: 5, error_rate: 0.011 },
  { name: "ibmq_kolkata", status: "maintenance", qubit_count: 27, queue_depth: 0, error_rate: 0.025 },
  { name: "ibmq_mumbai", status: "active", qubit_count: 27, queue_depth: 1, error_rate: 0.021 },
  { name: "ibmq_auckland", status: "inactive", qubit_count: 27, queue_depth: 0, error_rate: 0.033 },
];

const jobStatuses: JobStatus[] = ["COMPLETED", "RUNNING", "QUEUED", "ERROR", "CANCELLED"];
const users = ["Alice", "Bob", "Charlie", "David", "Eve"];

export const mockJobs: Job[] = Array.from({ length: 50 }, (_, i) => {
  const status = jobStatuses[i % jobStatuses.length];
  const backend = mockBackends[i % mockBackends.length].name;
  const submittedTime = subMinutes(now, Math.floor(Math.random() * 240));
  const startTime = subMinutes(submittedTime, -Math.floor(Math.random() * 10)); // 0-10 mins queue
  const endTime = status === 'COMPLETED' || status === 'ERROR' ? subMinutes(startTime, -Math.floor(Math.random() * 5)) : now;
  
  const status_history = [
    { status: 'QUEUED' as JobStatus, timestamp: formatISO(submittedTime) },
    { status: 'RUNNING' as JobStatus, timestamp: formatISO(startTime) },
  ];
  if(status === 'COMPLETED' || status === 'ERROR' || status === 'CANCELLED') {
    status_history.push({ status, timestamp: formatISO(endTime) })
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


export const mockMetrics: Metrics = {
  live_jobs: mockJobs.filter(j => j.status === 'RUNNING' || j.status === 'QUEUED').length,
  avg_wait_time: mockJobs.reduce((acc, j) => acc + ((new Date(j.status_history.find(s => s.status === 'RUNNING')?.timestamp || 0).getTime() - new Date(j.submitted).getTime()) / 1000), 0) / mockJobs.length,
  success_rate: (mockJobs.filter(j => j.status === 'COMPLETED').length / mockJobs.length) * 100,
  open_sessions: 3,
};

export const mockChartData: ChartData[] = Array.from({ length: 12 }, (_, i) => {
  const time = subHours(now, 11 - i);
  return {
    time: formatISO(time).substring(11, 16),
    COMPLETED: Math.floor(Math.random() * 20 + 10),
    RUNNING: Math.floor(Math.random() * 10 + 5),
    QUEUED: Math.floor(Math.random() * 15 + 5),
    ERROR: Math.floor(Math.random() * 3),
  };
});
