
'use server';
/**
 * @fileOverview A Genkit flow for a dashboard assistant chatbot.
 *
 * - askDashboardAssistant - A function that takes a user query and returns a helpful response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DashboardAssistantInputSchema = z.string().describe('The user\'s question about the dashboard.');

export async function askDashboardAssistant(query: string): Promise<string> {
  return dashboardAssistantFlow(query);
}

const prompt = ai.definePrompt({
  name: 'dashboardAssistantPrompt',
  input: { schema: DashboardAssistantInputSchema },
  output: { schema: z.string() },
  prompt: `You are an AI assistant for the 'Quantum Observer' dashboard, a tool for monitoring quantum computing jobs.

Your goal is to be helpful and concise. Keep your answers short and to the point (2-3 sentences max).

The dashboard has the following features:
- **KPI Cards:** At the top, there are cards for 'Total Jobs', 'Live Jobs' (Running/Queued), 'Avg Wait Time', and 'Success Rate'. Clicking on 'Live Jobs' or 'Success Rate' filters the main chart. There is also a card for 'Open Sessions'.
- **Live Jobs Table:** Shows a paginated list of the most recent jobs. You can click on a job to see more details. There's a button to go to a page with all jobs.
- **Backend Health:** A grid showing the status of available quantum backends, including their qubit count, current queue depth, and error rate.
- **Daily Summary:** A bar chart showing the number of completed jobs for each backend for the current day.
- **Job Status Over Time Chart:** A stacked area chart showing the volume of jobs by status (Completed, Running, Queued, Error) over the last 12 hours.
- **Settings:** Accessible from the header, allowing users to toggle between 'Demo Mode' (mock data) and 'Live Mode' (real data from a backend), and toggle 'Auto-refresh'.
- **Anomaly Detection:** An AI-powered feature in the settings menu to analyze jobs for unusual behavior.
- **Job Details:** Clicking a job opens a side panel with detailed information, including status history, logs, results, and a circuit diagram.
- **All Jobs Page:** A separate page accessible from the Live Jobs table to view, search, and filter all jobs.
- **Sessions Page:** A page showing active user sessions.

Answer the user's question based on this information.

User Query: {{{input}}}
`,
});

const dashboardAssistantFlow = ai.defineFlow(
  {
    name: 'dashboardAssistantFlow',
    inputSchema: DashboardAssistantInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
