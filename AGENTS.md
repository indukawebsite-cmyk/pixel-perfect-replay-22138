<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Catalogue data lives in `src/lib/catalog.ts` as clearly marked sample data until it moves to the database; components read through it so the source can be swapped.
- Official logo variants are served only via `src/components/brand/Logo.tsx` (CDN asset pointers) so the brand mark is never re-drawn.
- Wishlist state is shared in a visit-scoped React provider, without persistent storage or backend services, so sample browsing never implies an account or saved subscription.
- Demo bag state lives in the root CartProvider with schema-validated sessionStorage hydration after mount, preserving demo items across navigation/refresh in the same tab without storing customer details.
- Homepage sample rows keep null real prices; a separate typed demo catalogue in catalog.ts uses explicit demoPrice and demo merchandising fields for shopping tests without altering homepage content.
- Shop and collection grids share ProductExplorer and URL-validated filter/sort/load-more state so navigation and browser history retain the selection.
- Customer-care and policy routes reuse InformationPage; missing approved policies remain explicit placeholders rather than invented business terms.
- Product details compose reusable gallery/information/selectors/accordions from the central typed catalogue; specifications render only behind a verified marker to prevent unsupported claims.
- Demo bag line identity includes an optional variant ID and quantities use shared validation, preserving the existing cart provider across all shopping surfaces.
- Recently viewed products use a root visit-scoped provider without browser storage; image magnification uses react-zoom-pan-pinch in an accessible gallery dialog.
- Cart, checkout and confirmation reuse CartLines, OrderSummary and shared cart operations; demo totals/coupons/customer validation live in demo-checkout.ts with Zod and no server or service calls.
- Demo confirmations use a root memory-only provider with item/total snapshots; customer details are validated again at confirmation creation but never retained, transmitted or placed in URLs/storage.
- Production schema: catalogue tables are public-read only when active; orders/items/payments/shipments are read-only to their owning customer and written only by server code (service role), so totals and payment states can't be forged from the browser. Frontend still reads the sample catalogue until data is migrated.
- Auth: customer rows are created by a database trigger on sign-up (customers may only edit name/phone); admin is granted only by inserting into user_roles from the backend, never from the app, so no browser path can escalate privileges.
