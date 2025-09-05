
import { NextResponse } from 'next/server';
import type { Job, Backend, Metrics, ChartData, JobStatus } from "@/lib/types";
import { subMinutes, subHours, formatISO, parseISO } from "date-fns";
import { generateCircuitDiagram } from '@/ai/flows/generate-circuit-diagram';

// This function generates dynamic mock data, simulating a real API response.
async function generateMockData() {
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

  // Optimization: Generate a smaller number of circuit images and reuse them to prevent timeouts.
  const circuitImagePromises = Array.from({ length: 10 }, (_, i) => {
    const qubitCount = Math.floor(Math.random() * 5) + 2; // 2 to 6 qubits
    const gateCount = Math.floor(Math.random() * 8) + 3; // 3 to 10 gates
    return generateCircuitDiagram({ prompt: `A ${qubitCount}-qubit quantum circuit diagram with ${gateCount} gates, clean and simple.` });
  });

  const circuitImages = await Promise.all(circuitImagePromises);

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
      circuit_image_url: circuitImages[i % circuitImages.length], // Reuse generated images
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
    circuit_image_url: circuitImages[0], // Reuse one of the generated images
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

async function getRealData(apiKey: string) {
    const API_BASE_URL = "https://api.quantum-computing.ibm.com/v2";
    const headers = { Authorization: `Bearer ${apiKey}` };

    // Fetch backends and jobs in parallel
    const [backendsResponse, jobsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/backends`, { headers }),
        fetch(`${API_BASE_URL}/jobs?limit=50&descending=true`, { headers })
    ]);

    if (!backendsResponse.ok) throw new Error(`Failed to fetch backends: ${backendsResponse.statusText}`);
    if (!jobsResponse.ok) throw new Error(`Failed to fetch jobs: ${jobsResponse.statusText}`);

    const apiBackends = await backendsResponse.json();
    const apiJobs = await jobsResponse.json();
    const now = new Date();

    // Transform backends
    const backends: Backend[] = apiBackends.map((b: any) => ({
        name: b.name,
        status: b.status.toLowerCase() as "active" | "inactive" | "maintenance",
        qubit_count: b.qubit_count,
        queue_depth: b.queue_length,
        error_rate: b.error_rate || 0.0, // Default to 0 if not provided
    }));

    // Transform jobs
    const jobs: Job[] = apiJobs.map((j: any) => {
        const submitted = parseISO(j.creation_date);
        const startTime = j.time_per_step?.running ? parseISO(j.time_per_step.running) : submitted;
        const endTime = j.time_per_step?.finished ? parseISO(j.time_per_step.finished) : now;

        const status_history = [
          { status: 'QUEUED' as JobStatus, timestamp: formatISO(submitted) }
        ];

        if(j.time_per_step?.running) status_history.push({status: 'RUNNING' as JobStatus, timestamp: formatISO(startTime)});

        if(j.status !== 'RUNNING' && j.status !== 'QUEUED') {
            status_history.push({ status: j.status.toUpperCase() as JobStatus, timestamp: formatISO(endTime) });
        }
        
        return {
            id: j.id,
            status: j.status.toUpperCase() as JobStatus,
            backend: j.backend,
            submitted: j.creation_date,
            elapsed_time: (endTime.getTime() - startTime.getTime()) / 1000,
            user: j.hub_info?.user || 'Unknown',
            qpu_seconds: j.usage?.qpu_seconds || 0,
            logs: j.error?.message || `Job status: ${j.status}`,
            results: j.result || {},
            status_history,
            circuit_image_url: "https://picsum.photos/800/200", // Placeholder, as live API doesn't provide this.
        };
    });

    // Generate metrics and chart data from the live job data
    const liveJobs = jobs.filter(j => j.status === 'RUNNING' || j.status === 'QUEUED').length;
    const successfulJobs = jobs.filter(j => j.status === 'COMPLETED').length;
    const totalCompletedOrError = successfulJobs + jobs.filter(j => j.status === 'ERROR').length;

    const avgWaitTime = jobs.reduce((acc, j) => {
        const runningEntry = j.status_history.find(s => s.status === 'RUNNING');
        if (runningEntry) {
            return acc + (new Date(runningEntry.timestamp).getTime() - new Date(j.submitted).getTime());
        }
        return acc;
    }, 0) / (1000 * jobs.length || 1);

    const metrics: Metrics = {
        live_jobs: liveJobs,
        avg_wait_time: avgWaitTime,
        success_rate: totalCompletedOrError > 0 ? (successfulJobs / totalCompletedOrError) * 100 : 100,
        open_sessions: 1, // This is a mock value as the API doesn't provide it
    };

    const chartData: ChartData[] = Array.from({ length: 12 }, (_, i) => {
        const time = subHours(now, 11 - i);
        const timePlusHour = subHours(now, 10-i);
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
    
    return { jobs, backends, metrics, chartData };
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const isDemo = searchParams.get('demo') === 'true'
  const apiKey = process.env.QISKIT_API_KEY;

  if (!isDemo && apiKey) {
    try {
      console.log("Fetching real data from Qiskit API...");
      const realData = await getRealData(apiKey);
      return NextResponse.json(realData);
    } catch (error) {
       console.error("Error fetching from Qiskit API:", error);
       // If the API call fails, we fall back to mock data.
       const mockData = await generateMockData();
       return NextResponse.json(mockData);
    }
  }
  
  // Default to mock data if in demo mode or no API key is provided
  const data = await generateMockData();
  return NextResponse.json(data);
}

    