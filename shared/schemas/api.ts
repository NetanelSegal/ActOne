import { z } from "zod";

export const signupBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createScriptBodySchema = z.object({
  title: z.string().min(1),
  content: z.string(),
});

export const updateScriptBodySchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
});

export type SignupBody = z.infer<typeof signupBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type CreateScriptBody = z.infer<typeof createScriptBodySchema>;
export type UpdateScriptBody = z.infer<typeof updateScriptBodySchema>;
