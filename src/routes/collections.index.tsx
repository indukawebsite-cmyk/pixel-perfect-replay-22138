import { createFileRoute, redirect } from "@tanstack/react-router";

// Former collection pages are no longer customer-facing; collection data stays in the database.
export const Route = createFileRoute("/collections/")({
  beforeLoad: () => { throw redirect({ to: "/shop", replace: true }); },
});
