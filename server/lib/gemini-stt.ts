/**
 * Speech-to-text using the free Gemini model (audio input).
 * Receives an audio buffer and returns the transcript.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const MODEL = process.env.GEMINI_STT_MODEL ?? 'gemini-2.0-flash';

export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY);
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string = 'audio/webm',
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) is not set',
    );
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL });

  const audioPart = {
    inlineData: {
      data: audioBuffer.toString('base64'),
      mimeType,
    },
  };

  try {
    const result = await model.generateContent([
      'Transcribe this audio to plain text. Preserve the language (Hebrew or English). Output only the transcribed text, no punctuation or commentary.',
      audioPart,
    ]);

    const response = result.response;
    const text = response.text();
    return text?.trim() ?? '';
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Gemini STT failed: ${message}`);
  }
}
