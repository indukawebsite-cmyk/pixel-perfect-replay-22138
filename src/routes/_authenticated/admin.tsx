import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Boxes, Gem, LayoutDashboard, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/layout/PageIntro";
import { supabase } from "@/integrations/supabase/client";
import { authHead } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/_authenticated/admin")({
  staticData: { sitemap: false },
  head: () => authHead("Admin", "INDUKA store administration."),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Gem, exact: false },
  { to: "/admin/collections", label: "Collections", icon: Boxes, exact: false },
  { to: "/admin/orders", label: "Orders", icon: Receipt, exact: false },
] as const;

function AdminLayout() {
  const { user } = Route.useRouteContext();
  // UI gate only — the database refuses every admin read/write for non-admins regardless.
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
    <div className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-[1400px] md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-midnight text-ivory md:min-h-[calc(100svh-8rem)] md:border-b-0">
          <div className="hidden px-6 pb-4 pt-8 md:block">
            <p className="eyebrow text-[0.6rem] text-soft-gold">House of Induka</p>
            <p className="mt-2 font-display text-2xl">Admin</p>
          </div>
          <nav aria-label="Admin" className="flex gap-1 overflow-x-auto p-2 md:flex-col md:p-3">
            {NAV.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                className="flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm text-ivory/75 transition hover:bg-ivory/10 hover:text-ivory data-[status=active]:bg-ivory/10 data-[status=active]:text-champagne"
              >
                <Icon className="h-4 w-4" strokeWidth={1.25} />
                {label}
              </Link>
            ))}
          </nav>
          <p className="hidden px-6 py-6 text-xs leading-relaxed text-ivory/60 md:block">Signed in as {user.email}</p>
        </aside>
        <div className="min-w-0 px-4 py-8 md:px-10 md:py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
