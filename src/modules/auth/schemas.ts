import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  username: z
    .string()
    .min(3)
    .max(63)
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Username must be alphanumeric and contain only lowercase letters, numbers, and hyphens."
    )
    .refine(
      (val) => !val.includes("--"),
      "Username cannot contain double hyphens."
    )
    .transform((val) => val.toLowerCase()),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginSchema = z.infer<typeof loginSchema>;
