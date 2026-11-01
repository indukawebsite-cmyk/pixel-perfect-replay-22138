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
- Demo bag state lives in a root-level visit-scoped CartProvider so client navigation preserves quantities without implying a real order or payment.
- Homepage sample rows keep null real prices; a separate typed demo catalogue in catalog.ts uses explicit demoPrice and demo merchandising fields for shopping tests without altering homepage content.
- Shop and collection grids share ProductExplorer and URL-validated filter/sort/load-more state so navigation and browser history retain the selection.
- Customer-care and policy routes reuse InformationPage; missing approved policies remain explicit placeholders rather than invented business terms.
