import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AuthField, AuthMessage, AuthShell, authHead } from "@/components/auth/AuthShell";
import { passwordSchema } from "@/lib/auth-validation";

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () => authHead("Choose a new password", "Set a new password for your INDUKA account."),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    const recovery = window.location.hash.includes("type=recovery");
    void supabase.auth.getSession().then(({ data: s }) => setReady(Boolean(s.session) || recovery || null));
    const timer = setTimeout(() => setReady((r) => r ?? false), 2500);
    return () => {
      data.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);
  return (
    <AuthShell eyebrow="Account" title="Choose a new password">
      {ready === false ? (
        <AuthMessage tone="error">
          This reset link is invalid or has expired.{" "}
          <Link to="/forgot-password" className="underline">Request a new one</Link>.
        </AuthMessage>
      ) : ready === null ? (
        <p role="status">Checking your reset link…</p>
      ) : (
        <form
          noValidate
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            const parsed = passwordSchema.safeParse(new FormData(event.currentTarget).get("password"));
            if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid password.");
            setBusy(true);
            const { error: err } = await supabase.auth.updateUser({ password: parsed.data });
            setBusy(false);
            if (err) return setError("We couldn't update your password. Please request a new link.");
            void navigate({ to: "/account", replace: true });
          }}
        >
          <AuthField id="password" label="New password (8+ characters)" type="password" autoComplete="new-password" maxLength={72} error={error} />
          <Button variant="lux" type="submit" className="h-13 w-full" disabled={busy}>
            {busy ? "Saving…" : "Save new password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
