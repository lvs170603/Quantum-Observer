'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-job-anomalies.ts';
import '@/ai/flows/generate-circuit-diagram.ts';
import '@/ai/flows/dashboard-assistant.ts';
