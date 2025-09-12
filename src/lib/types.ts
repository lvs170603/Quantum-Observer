
export type JobStatus = "COMPLETED" | "RUNNING" | "QUEUED" | "ERROR" | "CANCELLED" | "UNKNOWN";

export interface Job {
  id: string;
  status: JobStatus;
  backend: string;
  submitted: string; // Was 'creation_date' from backend
  elapsed_time: number;
  user: string;
  qpu_seconds: number;
  logs: string;
  results: Record<string, any>;
  status_history: { status: JobStatus; timestamp: string }[];
  circuit_image_url?: string; // This remains a frontend-only concept from mock data
}

export interface Backend {
  name: string;
  status: "active" | "inactive" | "maintenance";
  qubit_count: number;
  queue_depth: number;
  error_rate: number; // This remains a frontend-only concept from mock data
}

export interface Metrics {
  total_jobs: number;
  live_jobs: number;
  avg_wait_time: number; // in seconds
  success_rate: number; // as a percentage
  open_sessions: number;
}

export interface ChartData {
  time: string;
  COMPLETED: number;
  RUNNING: number;
  QUEUED: number;
  ERROR: number;
}

export interface Anomaly {
  jobId: string;
  anomalyDescription: string;
  severity: "low" | "medium" | "high";
}

export interface DailyJobSummary {
  date: string;
  totalCompleted: number;
  completedByBackend: { name: string; value: number; fill: string; }[];
}
