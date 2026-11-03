import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/layout/PageIntro";
import { supabase } from "@/integrations/supabase/client";
import { authHead } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => authHead("Admin", "INDUKA store administration."),
  component: AdminPage,
});

function AdminPage() {
  const { user } = Route.useRouteContext();
  // UI hint only — every admin read/write is enforced by database access rules.
  const role = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      return Boolean(data);
    },
  });
  if (role.isLoading) return <p role="status" className="container-lux py-16">Checking access…</p>;
  if (!role.data)
    return (
      <>
        <PageIntro eyebrow="Admin" title="Access" accent="restricted.">
          This area is for store administrators only.
        </PageIntro>
        <section className="container-lux flex justify-center py-12">
          <Button asChild variant="lux"><Link to="/account">Back to your account</Link></Button>
        </section>
      </>
    );
  return (
    <PageIntro eyebrow="Admin" title="Store" accent="admin.">
      Admin access confirmed. Product, order and customer tools arrive in the admin phase.
    </PageIntro>
  );
}
