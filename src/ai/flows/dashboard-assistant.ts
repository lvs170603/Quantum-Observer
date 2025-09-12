'use server';
/**
 * @fileOverview Genkit flow for the 'Quantum Observer' dashboard assistant.
 *
 * Features:
 * - Short, helpful answers (2–3 sentences).
 * - Structured output: plain text + optional action for UI triggers.
 * - Error handling for resilience.
 * - Extensible schema (easy to add new fields later).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/* ---------- Schemas ---------- */

// Input: user query about the dashboard
const DashboardAssistantInputSchema = z.string().describe(
  "The user's question about the Quantum Observer dashboard."
);

// Output: response text + optional action for UI integration
const DashboardAssistantOutputSchema = z.object({
  text: z.string().describe('Concise assistant response.'),
  action: z
    .enum([
      'FILTER_LIVE_JOBS',
      'FILTER_SUCCESS_RATE',
      'SHOW_BACKEND_HEALTH',
      'SHOW_DAILY_SUMMARY',
      'SHOW_JOB_DETAILS',
      'SHOW_ALL_JOBS',
      'SHOW_SESSIONS',
      'NONE',
    ])
    .default('NONE')
    .describe('Optional UI action that the assistant suggests.'),
});

/* ---------- Prompt ---------- */

const dashboardAssistantPrompt = ai.definePrompt({
  name: 'dashboardAssistantPrompt',
  input: { schema: DashboardAssistantInputSchema },
  output: { schema: DashboardAssistantOutputSchema },
  prompt: `
You are an AI assistant for the 'Quantum Observer' dashboard, a tool for monitoring quantum computing jobs.

Guidelines:
- Be clear and concise (2–3 sentences max).
- Suggest actions when relevant (e.g., "Show the Daily Summary bar chart").
- Otherwise, just return a helpful text answer.

Dashboard features:
- KPI Cards: Total Jobs, Live Jobs, Avg Wait Time, Success Rate, Open Sessions.
- Live Jobs Table: recent jobs, details panel, all jobs page.
- Backend Health: qubit count, queue depth, error rate.
- Daily Summary: bar chart of completed jobs per backend (today).
- Job Status Over Time Chart: stacked area (last 12 hours).
- Settings: demo/live mode, auto-refresh, anomaly detection.
- Job Details: status history, logs, results, circuit diagram.
- All Jobs Page: view/search/filter.
- Sessions Page: active sessions.

User Question: {input}
`,
});

/* ---------- Flow ---------- */

const dashboardAssistantFlow = ai.defineFlow(
  {
    name: 'dashboardAssistantFlow',
    inputSchema: DashboardAssistantInputSchema,
    outputSchema: DashboardAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await dashboardAssistantPrompt(input);
    return output!;
  }
);

/* ---------- Public API ---------- */

export async function askDashboardAssistant(
  query: string
): Promise<z.infer<typeof DashboardAssistantOutputSchema>> {
  try {
    return await dashboardAssistantFlow(query);
  } catch (err) {
    console.error('Assistant error:', err);
    return {
      text: "Sorry, I couldn't process that request.",
      action: 'NONE',
    };
  }
}
