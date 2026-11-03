import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AuthField, AuthMessage, AuthShell, authHead } from "@/components/auth/AuthShell";
import { fieldErrors, safeRedirect, signInSchema } from "@/lib/auth-validation";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
  head: () => authHead("Sign in", "Sign in to your House of Induka account."),
  component: SignInPage,
});

function SignInPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <AuthShell
      eyebrow="Account"
      title="Welcome back"
      footer={
        <>
          New to INDUKA?{" "}
          <Link to="/signup" className="underline underline-offset-4 text-foreground">
            Create an account
          </Link>
        </>
      }
    >
      <form
        noValidate
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const parsed = signInSchema.safeParse({
            email: form.get("email"),
            password: form.get("password"),
          });
          setMessage("");
          if (!parsed.success) return setErrors(fieldErrors(parsed.error));
          setErrors({});
          setBusy(true);
          const { error } = await supabase.auth.signInWithPassword(parsed.data);
          setBusy(false);
          if (error)
            return setMessage(
              /confirm/i.test(error.message)
                ? "Please confirm your email address using the link we sent, then sign in."
                : "Email or password is incorrect.",
            );
          const target = safeRedirect(redirect ? new URL(redirect, window.location.origin).pathname : undefined);
          void navigate({ to: target, replace: true });
        }}
      >
        {message && <AuthMessage tone="error">{message}</AuthMessage>}
        <AuthField id="email" label="Email" type="email" autoComplete="email" maxLength={255} error={errors["email"]} />
        <AuthField id="password" label="Password" type="password" autoComplete="current-password" maxLength={72} error={errors["password"]} />
        <div className="text-right text-sm">
          <Link to="/forgot-password" className="underline underline-offset-4">
            Forgot password?
          </Link>
        </div>
        <Button variant="lux" type="submit" className="h-13 w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
          <ArrowRight />
        </Button>
      </form>
    </AuthShell>
  );
}
