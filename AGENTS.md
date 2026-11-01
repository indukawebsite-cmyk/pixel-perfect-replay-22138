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
