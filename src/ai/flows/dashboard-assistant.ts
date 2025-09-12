
'use server';
/**
 * @fileOverview Genkit flow for the 'Quantum Observer' dashboard assistant (cat-bot).
 *
 * Features:
 * - Clear, accurate, dashboard-specific answers (2–3 sentences).
 * - Structured output: text + optional UI action.
 * - Session memory support for follow-up questions.
 * - Error handling with safe fallbacks.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/* ---------- Schemas ---------- */

// Input: user query + optional conversation history
const DashboardAssistantInputSchema = z.object({
  query: z.string().describe("The user's question about the Quantum Observer dashboard."),
  history: z
    .array(
      z.object({
        user: z.string(),
        assistant: z.string(),
      })
    )
    .optional()
    .describe('Conversation history for context-aware responses.'),
});
export type DashboardAssistantInput = z.infer<typeof DashboardAssistantInputSchema>;

// Output: structured response
const DashboardAssistantOutputSchema = z.object({
  text: z.string().describe('Concise assistant response (2–3 sentences).'),
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
    .describe('UI action the assistant suggests, or NONE if just text.'),
});
export type DashboardAssistantOutput = z.infer<typeof DashboardAssistantOutputSchema>;


/* ---------- Prompt ---------- */

const dashboardAssistantPrompt = ai.definePrompt({
  name: 'dashboardAssistantPrompt',
  input: { schema: DashboardAssistantInputSchema },
  output: { schema: DashboardAssistantOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `
You are the **Quantum Observer AI Assistant**, an expert guide for the 'Quantum Observer' monitoring dashboard. Your goal is to help users understand and navigate the dashboard's features.

### Your Persona:
- **Expert & Helpful:** You have complete knowledge of the dashboard. Your primary purpose is to answer questions about the Quantum Observer dashboard itself, explaining its features and data.
- **Concise:** Keep your answers to 2-3 sentences.
- **Focused:** Only answer questions about the Quantum Observer dashboard. If the question is unrelated, politely state: "I can only answer questions about the dashboard's features and data."

### Core Task:
Answer user questions based on the features listed below. When a user's query directly maps to a feature, suggest a relevant 'action'.

### Dashboard Features & Associated Actions:
- **General Info:** The Quantum Observer is a real-time monitoring dashboard for quantum computing jobs and systems. It tracks job statuses, backend health, and performance metrics.
- **KPI Cards:** Shows key metrics like Total Jobs, Live Jobs, Average Wait Time, Success Rate, and Open Sessions. (Action: 'FILTER_LIVE_JOBS', 'FILTER_SUCCESS_RATE')
- **Live Jobs Table:** Displays recent jobs. Users can click on a job to see more details. (Action: 'SHOW_JOB_DETAILS')
- **All Jobs Page:** Provides a comprehensive view of all jobs with search and filter capabilities. (Action: 'SHOW_ALL_JOBS')
- **Backend Health:** Lists quantum backends with their status, qubit count, and queue depth. (Action: 'SHOW_BACKEND_HEALTH')
- **Daily Summary Chart:** A bar chart showing the number of jobs completed on each backend for the current day. (Action: 'SHOW_DAILY_SUMMARY')
- **Job Status Over Time Chart:** A historical view of job statuses over the past 12 hours.
- **Active Sessions Page:** Shows a list of active user sessions. (Action: 'SHOW_SESSIONS')
- **Anomaly Detection:** An AI-powered feature to identify unusual job patterns.

Conversation history (if any): {{{history}}}
User question: {{{query}}}
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
  input: DashboardAssistantInput
): Promise<DashboardAssistantOutput> {
  try {
    return await dashboardAssistantFlow(input);
  } catch (err) {
    console.error('AI assistant error:', err);
    return {
      text: "Sorry, I couldn't process that request at the moment.",
      action: 'NONE',
    };
  }
}
