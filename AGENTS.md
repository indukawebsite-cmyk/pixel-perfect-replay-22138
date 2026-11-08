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

- Products load in the browser through CatalogProvider (catalog-source.ts → live-catalog.ts store) using the visitor's own session, because RLS hides inactive products from everyone but admins and SSR has no session; catalog.ts keeps only static brand structure (categories, collections, campaign images).
- Official logo variants are served only via `src/components/brand/Logo.tsx` (CDN asset pointers) so the brand mark is never re-drawn.
- Wishlist state is shared in a visit-scoped React provider, without persistent storage or backend services, so sample browsing never implies an account or saved subscription.
- Demo bag state lives in the root CartProvider with schema-validated sessionStorage hydration after mount, preserving demo items across navigation/refresh in the same tab without storing customer details.
- Shop and collection grids share ProductExplorer and URL-validated filter/sort/load-more state so navigation and browser history retain the selection.
- Customer-care and policy routes reuse InformationPage; missing approved policies remain explicit placeholders rather than invented business terms.
- Product details compose reusable gallery/information/selectors/accordions from the central typed catalogue; specifications render only behind a verified marker to prevent unsupported claims.
- Demo bag line identity includes an optional variant ID and quantities use shared validation, preserving the existing cart provider across all shopping surfaces.
- Recently viewed products use a root visit-scoped provider without browser storage; image magnification uses react-zoom-pan-pinch in an accessible gallery dialog.
- Cart, checkout and confirmation reuse CartLines, OrderSummary and shared cart operations; demo totals/coupons/customer validation live in demo-checkout.ts with Zod and no server or service calls.
- Demo confirmations use a root memory-only provider with item/total snapshots; customer details are validated again at confirmation creation but never retained, transmitted or placed in URLs/storage.
- Production schema: catalogue tables are public-read only when active; orders/items/payments/shipments are read-only to their owning customer and written only by server code (service role), so totals and payment states can't be forged from the browser.
- Auth: customer rows are created by a database trigger on sign-up (customers may only edit name/phone); admin is granted only by inserting into user_roles from the backend, never from the app, so no browser path can escalate privileges.
- Product photos live in the private 'product-images' storage bucket (workspace blocks public buckets); product_images.image_url stores the bucket path (SKU/NN.jpg, display_order 0 = primary), so the storefront must request signed/authenticated URLs. Storage reads are limited to admins or photos of active products (folder = SKU).
- Customer-facing shopping is split into Shop Men / Shop Women via products.gender (men|women|unisex, NULL = unconfirmed and listed in neither); old collections stay in the DB/admin only and /collections/* redirects to /shop, so the storefront never infers gender or shows retired collection names.
- The sitemap derives static public URLs from required route-level staticData.sitemap decisions; private subtrees, redirects and noindex pages stay excluded, and lastmod is omitted without authoritative page timestamps.
