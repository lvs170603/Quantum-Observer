
'use server';
/**
 * @fileOverview Analyzes job data to detect anomalies in queueing and execution behavior.
 *
 * - analyzeJobAnomalies - A function that analyzes job data and flags anomalies.
 * - AnalyzeJobAnomaliesInput - The input type for the analyzeJobAnomalies function.
 * - AnalyzeJobAnomaliesOutput - The return type for the analyzeJobAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeJobAnomaliesInputSchema = z.object({
  jobData: z.string().describe('JSON string containing an array of job objects, each with properties like status, backend, submitted time, elapsed time, etc.'),
});
export type AnalyzeJobAnomaliesInput = z.infer<typeof AnalyzeJobAnomaliesInputSchema>;

const AnalyzeJobAnomaliesOutputSchema = z.object({
  anomalies: z.array(
    z.object({
      jobId: z.string().describe('The ID of the job with anomalous behavior.'),
      anomalyDescription: z.string().describe('A detailed, easy-to-understand explanation of the anomaly, suitable for both students and researchers. It should explain what the anomaly is, why it is a concern, and what it might indicate.'),
      severity: z.enum(['low', 'medium', 'high']).describe('The severity of the anomaly.'),
    })
  ).describe('An array of anomalies detected in the job data.'),
  summary: z.string().describe('A summary of the analysis, including the total number of anomalies found and a brief overview of the system\'s health.'),
});
export type AnalyzeJobAnomaliesOutput = z.infer<typeof AnalyzeJobAnomaliesOutputSchema>;

export async function analyzeJobAnomalies(input: AnalyzeJobAnomaliesInput): Promise<AnalyzeJobAnomaliesOutput> {
  return analyzeJobAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeJobAnomaliesPrompt',
  input: {schema: AnalyzeJobAnomaliesInputSchema},
  output: {schema: AnalyzeJobAnomaliesOutputSchema},
  prompt: `You are an expert AI system administrator for a quantum computing platform. Your task is to analyze job data to detect and explain anomalies in a way that is clear for both students and expert researchers.

Analyze the provided job data for anomalies like:
- Unusually long queue times.
- Unexpected or frequent failures.
- Significant deviations from typical execution times.
- Inconsistencies in job status history (e.g., negative queue times).

Prioritize identifying anomalies that indicate system performance issues or potential hardware failures.

For each anomaly, provide a detailed but easy-to-understand 'anomalyDescription'. Explain what the anomaly is, why it's a concern, and what it could indicate about the system or the job itself.

The job data is provided as a JSON string: {{{jobData}}}

Present your findings as a JSON object with an 'anomalies' array and a 'summary'. The summary should give a high-level overview of the system's health based on the findings.

Example of a good anomaly description:
"This job spent an unusually long time in the queue (5 hours) compared to other jobs on the 'ibm_brisbane' backend. This could indicate high demand for this specific quantum computer, or it might signal a potential issue with the job scheduler that is preventing jobs from starting promptly."
`,
});

const analyzeJobAnomaliesFlow = ai.defineFlow(
  {
    name: 'analyzeJobAnomaliesFlow',
    inputSchema: AnalyzeJobAnomaliesInputSchema,
    outputSchema: AnalyzeJobAnomaliesOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      console.error('Error analyzing job anomalies:', error);
      throw error;
    }
  }
);
