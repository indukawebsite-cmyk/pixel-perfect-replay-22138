import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AuthField, AuthMessage, AuthShell, authHead } from "@/components/auth/AuthShell";
import { fieldErrors, signUpSchema } from "@/lib/auth-validation";

export const Route = createFileRoute("/signup")({
  head: () => authHead("Create account", "Create your House of Induka account."),
  component: SignUpPage,
});

function SignUpPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <AuthShell
      eyebrow="Account"
      title="Create your account"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/auth" className="underline underline-offset-4 text-foreground">
            Sign in
          </Link>
        </>
      }
    >
      {message?.tone === "info" ? (
        <AuthMessage tone="info">{message.text}</AuthMessage>
      ) : (
        <form
          noValidate
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const parsed = signUpSchema.safeParse({
              fullName: form.get("fullName"),
              email: form.get("email"),
              password: form.get("password"),
            });
            setMessage(null);
            if (!parsed.success) return setErrors(fieldErrors(parsed.error));
            setErrors({});
            setBusy(true);
            const { error } = await supabase.auth.signUp({
              email: parsed.data.email,
              password: parsed.data.password,
              options: {
                emailRedirectTo: window.location.origin,
                data: { full_name: parsed.data.fullName },
              },
            });
            setBusy(false);
            if (error)
              return setMessage({
                tone: "error",
                text: /weak|pwned|leaked/i.test(error.message)
                  ? "This password is too common. Please choose a stronger one."
                  : "We couldn't create your account. Please check your details and try again.",
              });
            setMessage({
              tone: "info",
              text: "Check your email to confirm your account, then sign in.",
            });
          }}
        >
          {message && <AuthMessage tone="error">{message.text}</AuthMessage>}
          <AuthField id="fullName" label="Full name" autoComplete="name" maxLength={100} error={errors.fullName} />
          <AuthField id="email" label="Email" type="email" autoComplete="email" maxLength={255} error={errors.email} />
          <AuthField id="password" label="Password (8+ characters)" type="password" autoComplete="new-password" maxLength={72} error={errors.password} />
          <Button variant="lux" type="submit" className="h-13 w-full" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
            <ArrowRight />
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
