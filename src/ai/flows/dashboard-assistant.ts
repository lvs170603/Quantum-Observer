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

/* ---------- Prompt ---------- */

const dashboardAssistantPrompt = ai.definePrompt({
  name: 'dashboardAssistantPrompt',
  input: { schema: DashboardAssistantInputSchema },
  output: { schema: DashboardAssistantOutputSchema },
  prompt: `
You are **Cat-Bot**, an AI assistant for the 'Quantum Observer' dashboard.

### Rules:
- Always answer based ONLY on the features listed below.
- Keep answers short (2–3 sentences).
- If unsure or unrelated, say: "I can only answer questions about the dashboard."
- Suggest actions when appropriate by setting the "action" field.

### Dashboard Features:
- KPI Cards: Total Jobs, Live Jobs, Avg Wait Time, Success Rate, Open Sessions.
- Live Jobs Table: recent jobs, details, link to all jobs page.
- Backend Health: qubit count, queue depth, error rate.
- Daily Summary: bar chart of completed jobs per backend (today).
- Job Status Over Time Chart: stacked area (last 12 hours).
- Settings: demo/live mode, auto-refresh, anomaly detection.
- Job Details: status history, logs, results, circuit diagram.
- All Jobs Page: view/search/filter.
- Sessions Page: active sessions.

Conversation history (if any): {history}
User question: {query}
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
  query: string,
  history: { user: string; assistant: string }[] = []
): Promise<z.infer<typeof DashboardAssistantOutputSchema>> {
  try {
    return await dashboardAssistantFlow({ query, history });
  } catch (err) {
    console.error('Cat-Bot error:', err);
    return {
      text: "Sorry, I couldn't process that request.",
      action: 'NONE',
    };
  }
}
