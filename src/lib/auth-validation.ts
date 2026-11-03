import { z } from "zod";

export const emailSchema = z.string().trim().max(255).email("Enter a valid email address.");
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.");
export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(100, "Name is too long.")
    .regex(/^[^<>\x00-\x1F]+$/, "Name contains unsupported characters."),
  email: emailSchema,
  password: passwordSchema,
});
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(72),
});
export const profileSchema = z.object({
  full_name: signUpSchema.shape.fullName,
  phone: z
    .string()
    .trim()
    .regex(/^([6-9]\d{9})?$/, "Enter a 10-digit Indian mobile number."),
});

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Only allow same-origin relative paths as post-login destinations. */
export function safeRedirect(value: unknown): string {
  return typeof value === "string" && /^\/(?!\/)[\w\-/?=&.%]*$/.test(value) ? value : "/account";
}
