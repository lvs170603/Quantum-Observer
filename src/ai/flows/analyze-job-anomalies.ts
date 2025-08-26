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
      anomalyDescription: z.string().describe('A description of the anomaly detected.'),
      severity: z.enum(['low', 'medium', 'high']).describe('The severity of the anomaly.'),
    })
  ).describe('An array of anomalies detected in the job data.'),
  summary: z.string().describe('A summary of the analysis, including the total number of anomalies found.'),
});
export type AnalyzeJobAnomaliesOutput = z.infer<typeof AnalyzeJobAnomaliesOutputSchema>;

export async function analyzeJobAnomalies(input: AnalyzeJobAnomaliesInput): Promise<AnalyzeJobAnomaliesOutput> {
  return analyzeJobAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeJobAnomaliesPrompt',
  input: {schema: AnalyzeJobAnomaliesInputSchema},
  output: {schema: AnalyzeJobAnomaliesOutputSchema},
  prompt: `You are an AI system administrator analyzing quantum computing job data to detect anomalies.

  Analyze the provided job data for anomalies in queueing and execution behavior.  Anomalies include jobs with unusually long queue times, unexpected failures,
  or significant deviations from typical execution times for similar jobs and backends.

  Prioritize identifying anomalies that may indicate system performance issues or potential hardware failures.

  The job data is provided as a JSON string: {{{jobData}}}

  Present your findings as a JSON object with an 'anomalies' array and a 'summary' field. Each anomaly should include the job ID,
a description of the anomaly, and a severity level ('low', 'medium', or 'high').  The summary should include the total number of anomalies found.

  Example:
  {
    "anomalies": [
      {
        "jobId": "job123",
        "anomalyDescription": "Job had unusually long queue time compared to other jobs on the same backend.",
        "severity": "medium"
      }
    ],
    "summary": "Found 1 anomaly in the provided job data."
  }`,
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
