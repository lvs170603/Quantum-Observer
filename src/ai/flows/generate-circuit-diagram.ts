'use server';
/**
 * @fileOverview Genkit flow for generating quantum circuit diagrams.
 *
 * Features:
 * - Structured output: image URL + status + metadata
 * - Error handling with safe fallback
 * - Extensible schema for future features (e.g., base64 images, prompt logs)
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/* ---------- Schemas ---------- */

// Input: description of the quantum circuit
const GenerateCircuitDiagramInputSchema = z.object({
  prompt: z.string().describe('A text description of the quantum circuit to generate.'),
});

// Output: URL + metadata
const GenerateCircuitDiagramOutputSchema = z.object({
  url: z.string().url().describe('URL of the generated circuit diagram image.'),
  status: z.enum(['SUCCESS', 'FALLBACK']).default('SUCCESS'),
  usedPrompt: z.string().describe('The full system-enhanced prompt used for generation.'),
});

export type GenerateCircuitDiagramInput = z.infer<typeof GenerateCircuitDiagramInputSchema>;
export type GenerateCircuitDiagramOutput = z.infer<typeof GenerateCircuitDiagramOutputSchema>;

/* ---------- Flow ---------- */

const generateCircuitDiagramFlow = ai.defineFlow(
  {
    name: 'generateCircuitDiagramFlow',
    inputSchema: GenerateCircuitDiagramInputSchema,
    outputSchema: GenerateCircuitDiagramOutputSchema,
  },
  async ({ prompt }) => {
    // Build full generation prompt
    const fullPrompt = `
Generate a clean, schematic-like image of a quantum circuit diagram.
Requirements:
- Simple and easy to read
- Wide (banner-style, 16:9 aspect ratio)
- Use conventional quantum gate symbols (H, X, CX, etc.)
- No extra artistic elements, just a clear diagram

User description: ${prompt}
`;

    try {
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: fullPrompt,
        config: { aspectRatio: '16:9' },
      });

      if (!media || !media.url) {
        throw new Error('Image generation failed to return a valid URL.');
      }

      return {
        url: media.url,
        status: 'SUCCESS',
        usedPrompt: fullPrompt,
      };
    } catch (error) {
      console.error('Error generating circuit diagram:', error);

      return {
        url: 'https://picsum.photos/800/200', // fallback placeholder
        status: 'FALLBACK',
        usedPrompt: fullPrompt,
      };
    }
  }
);

/* ---------- Public API ---------- */

export async function generateCircuitDiagram(
  input: GenerateCircuitDiagramInput
): Promise<GenerateCircuitDiagramOutput> {
  return generateCircuitDiagramFlow(input);
}
