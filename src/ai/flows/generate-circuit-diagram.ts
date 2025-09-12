
'use server';
/**
 * @fileOverview A Genkit flow for generating quantum circuit diagrams.
 *
 * - generateCircuitDiagram - A function that generates a circuit diagram image from a prompt.
 * - GenerateCircuitDiagramInput - The input type for the generateCircuitDiagram function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCircuitDiagramInputSchema = z.object({
  prompt: z.string().describe('A text description of the quantum circuit to generate.'),
});

export type GenerateCircuitDiagramInput = z.infer<typeof GenerateCircuitDiagramInputSchema>;

export async function generateCircuitDiagram(input: GenerateCircuitDiagramInput): Promise<string> {
  return generateCircuitDiagramFlow(input);
}

const generateCircuitDiagramFlow = ai.defineFlow(
  {
    name: 'generateCircuitDiagramFlow',
    inputSchema: GenerateCircuitDiagramInputSchema,
    outputSchema: z.string(),
  },
  async ({ prompt }) => {
    const fullPrompt = `Generate a simple, clean, and schematic-like image of a quantum circuit diagram based on the following description: ${prompt}. The diagram should be wide, like a banner.`;
    
    try {
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: fullPrompt,
        config: {
          aspectRatio: '16:9',
        },
      });

      if (!media || !media.url) {
        throw new Error('Image generation failed to return a valid URL.');
      }
      return media.url;
    } catch (error) {
      console.error('Error generating circuit diagram:', error);
      // Return a placeholder image URL on failure
      return "https://picsum.photos/800/200";
    }
  }
);
