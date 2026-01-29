import { z } from "zod";

export const startSessionPayloadSchema = z.object({
  type: z.literal("start_session"),
  scriptId: z.number().int().positive(),
  sceneIndex: z.number().int().min(0).optional(),
});

export const audioChunkPayloadSchema = z.object({
  type: z.literal("audio"),
  payload: z.string(), // base64 audio chunk
});

export const verificationResultSchema = z.object({
  type: z.literal("verification_result"),
  passed: z.boolean(),
  score: z.number().min(0).max(1).optional(),
  targetLine: z.string().optional(),
  transcript: z.string().optional(),
  diff: z.array(z.object({ op: z.enum(["add", "remove", "replace"]), value: z.string() })).optional(),
});

export const ttsAudioSchema = z.object({
  type: z.literal("tts_audio"),
  payload: z.string(), // base64 audio
  lineIndex: z.number().optional(),
});

export const errorMessageSchema = z.object({
  type: z.literal("error"),
  message: z.string(),
});

export const linePromptSchema = z.object({
  type: z.literal("line_prompt"),
  payload: z.string(), // base64 audio of current user line
});

export type StartSessionPayload = z.infer<typeof startSessionPayloadSchema>;
export type AudioChunkPayload = z.infer<typeof audioChunkPayloadSchema>;
export type VerificationResult = z.infer<typeof verificationResultSchema>;
export type TtsAudio = z.infer<typeof ttsAudioSchema>;
export type WsErrorMessage = z.infer<typeof errorMessageSchema>;
export type LinePrompt = z.infer<typeof linePromptSchema>;
