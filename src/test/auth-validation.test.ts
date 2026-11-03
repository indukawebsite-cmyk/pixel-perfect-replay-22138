import { describe, expect, it } from "vitest";
import { safeRedirect, signUpSchema, profileSchema } from "@/lib/auth-validation";
describe("auth validation", () => {
  it("only allows same-site redirects after sign-in", () => {
    expect(safeRedirect("/account")).toBe("/account");
    expect(safeRedirect("//evil.com")).toBe("/account");
    expect(safeRedirect("https://evil.com")).toBe("/account");
    expect(safeRedirect(undefined)).toBe("/account");
  });
  it("requires 8+ character passwords", () => {
    expect(signUpSchema.safeParse({ fullName: "Asha", email: "a@b.in", password: "short" }).success).toBe(false);
    expect(signUpSchema.safeParse({ fullName: "Asha", email: "a@b.in", password: "longenough" }).success).toBe(true);
  });
  it("accepts empty or Indian mobile numbers", () => {
    expect(profileSchema.safeParse({ full_name: "Asha", phone: "" }).success).toBe(true);
    expect(profileSchema.safeParse({ full_name: "Asha", phone: "12345" }).success).toBe(false);
  });
});
