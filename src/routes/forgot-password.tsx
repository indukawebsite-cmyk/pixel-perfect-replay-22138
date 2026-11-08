import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AuthField, AuthMessage, AuthShell, authHead } from "@/components/auth/AuthShell";
import { emailSchema } from "@/lib/auth-validation";

export const Route = createFileRoute("/forgot-password")({
  staticData: { sitemap: false },
  head: () => authHead("Reset password", "Request a password reset link for your INDUKA account."),
  component: ForgotPage,
});

function ForgotPage() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <AuthShell
      eyebrow="Account"
      title="Reset your password"
      footer={<Link to="/auth" className="underline underline-offset-4 text-foreground">Back to sign in</Link>}
    >
      {sent ? (
        <AuthMessage tone="info">
          If an account exists for that email, a reset link is on its way.
        </AuthMessage>
      ) : (
        <form
          noValidate
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            const parsed = emailSchema.safeParse(new FormData(event.currentTarget).get("email"));
            if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid email.");
            setError("");
            setBusy(true);
            await supabase.auth.resetPasswordForEmail(parsed.data, {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            setBusy(false);
            setSent(true);
          }}
        >
          <AuthField id="email" label="Email" type="email" autoComplete="email" maxLength={255} error={error} />
          <Button variant="lux" type="submit" className="h-13 w-full" disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
