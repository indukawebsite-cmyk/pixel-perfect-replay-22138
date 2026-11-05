# Pixel Perfect Replay

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pixel-perfect-replay-22138.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/47236580-2f20-45f5-990a-9e71ecc07da4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## HOUSE OF INDUKA — Netlify SSR preparation

**Configuration only; not deployed or approved for launch.** The current Lovable/Cloudflare build remains `bun run build`. Its Vite wrapper and `src/server.ts` custom SSR error handler are unchanged.

### Verified installed versions and output mismatch

- Vite: `8.1.5`.
- Nitro: `3.0.260603-beta`.
- Lovable Vite/TanStack wrapper: `2.26.5`.
- React: `19`.

The wrapper pins `dist/client` and `dist/server` only inside Lovable builds. Outside Lovable it uses `cloudflare-module` as a fallback, allowing platform detection or `NITRO_PRESET` to select another preset. The installed Nitro **`netlify`** preset publishes public assets to `dist/` and generates an SSR function separately. Thus `dist/client` is not the final publish path for this Netlify preset. Without Netlify selection, the ordinary Cloudflare fallback instead uses `.output/`; that is also not Netlify functions output.

This diagnosis is based on the installed wrapper and Nitro source, not an unavailable Netlify build log. Changing the publish path alone does not make a static deployment support SSR.

### Exact Netlify settings

| Setting | Value |
| --- | --- |
| Base directory | `.` (repository root) |
| Build command | `bun run build:netlify` |
| Expanded command | `NITRO_PRESET=netlify vite build` |
| Publish directory | `dist` |
| SSR preset | `netlify` (Node-based functions, not `netlify-static` or `netlify-edge`) |
| Build Node version | `22` |
| Bun version | `1.4.4` |

`netlify.toml` supplies these settings. Use the existing `bun.lock` for reproducible dependency installation; the build needs development dependencies, including Nitro, Vite and the wrapper. Do not copy Lovable sandbox environment variables (`LOVABLE_SANDBOX`, `DEV_SERVER__PROJECT_PATH`, `LOVABLE_NITRO_PRESET`) into Netlify: they can pin the Lovable-only output and ignore the Netlify selector.

The installed preset's expected output at the current root base URL is:

```text
dist/                                        public assets
.netlify/functions-internal/server/main.mjs   bundled SSR handler
.netlify/functions-internal/server/server.mjs Netlify function entry
```

Nitro generates the function with `path: "/*"`, `preferStatic: true`, static-path exclusions and `nodeBundler: "none"`. Let Netlify discover its internal functions output. Do not publish the server bundle, set a user-functions directory to `dist/server`, disable Nitro, add duplicate framework plugins, or add a static `index.html` catch-all.

No Vite configuration change is needed: the existing wrapper supports `NITRO_PRESET=netlify` outside Lovable, while Lovable retains its own target and output. The script changes only the process used for an explicitly requested Netlify build.

### Existing asset delivery

Four official logos and the gifting packaging photograph reference `/__l5e/assets-v1/...`, which is served by Lovable, not by Nitro's Netlify preset. The narrowly scoped `netlify.toml` proxy rule forwards only that prefix to the existing published Lovable host, preserving the original bytes and asset pointers. No images are replaced or removed, and no product storage permissions change.

Before configuration edits on 2026-11-05, all five target URLs were retrieved without credentials: each returned HTTP 200, the expected image MIME type and the exact byte count recorded in its asset pointer, and passed image decoding. This verifies the upstream targets, **not yet Netlify's deployed proxy behavior**. Keep the original Lovable host and assets available; this is an external availability dependency. Verify the proxy again in any later approved Netlify deployment.

### Environment configuration — names only

Lovable's secure secrets do **not** automatically transfer to Netlify. Do not commit credentials, put them in `netlify.toml`, copy private values into `VITE_` variables, or expose the full server environment to the browser.

| Scope | Existing names |
| --- | --- |
| Public build configuration | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Server Functions runtime | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Razorpay Functions runtime | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| Shiprocket Functions runtime | `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_PICKUP_LOCATION`, `SHIPROCKET_PARCEL_LENGTH_CM`, `SHIPROCKET_PARCEL_BREADTH_CM`, `SHIPROCKET_PARCEL_HEIGHT_CM`, `SHIPROCKET_PARCEL_WEIGHT_KG` |

Only the public backend URL and publishable key belong in browser build configuration. Private credentials must be available in the appropriate Netlify Functions deploy context, not merely during build. Keep the existing Razorpay Test Mode settings; do not supply Live Mode keys or trigger shipping operations during deployment validation.

### Blocker: external privileged backend access

**A complete standalone Netlify deployment is blocked by secure privileged access to the existing Lovable Cloud backend.** Checkout, order administration, private image signing and webhook processing use the generated server-only privileged client. Lovable Cloud does not expose its managed service-role key for export to another host. The variable name above documents the existing dependency; it is not a request for an unavailable credential.

Do not fabricate a key, request private credentials in chat, edit generated clients, weaken RLS or replace privileged operations with public browser writes. An authorized external-access arrangement, authenticated bridge or separately approved backend/self-hosting approach must be resolved before these features can be validated on Netlify. No such architecture change is included in this preparation. A successful asset/SSR build alone would not clear this blocker.

### Later origin and webhook setup — separate approval required

- Allow the exact future Netlify origin for email verification and password recovery while retaining current Lovable origins. No auth settings are changed now.
- Sessions are origin-scoped; customers sign in on the new origin. Do not copy session tokens across hosts.
- Retain `/api/public/webhooks/razorpay` and its raw-body signature validation. Do not change the existing stable Lovable test webhook now. Registering a new target requires separate approval after deployment.
- Do not change DNS, payment modes, product visibility, fulfilment settings or database records as part of preparation.

### Validation and deployment gate

Before describing Netlify as working, an approved external build must demonstrate the output files above and that the generated handler includes the preserved custom SSR entry. A build launched inside Lovable is pinned to its existing target and cannot validate Netlify artifacts.

Then verify SSR HTML, static and proxied assets, deep links, same-origin server functions, signed-in customer/admin access, signed-out restrictions, private image access and invalid webhook signature rejection in the target runtime. Do not create orders, initiate payments, book shipments or schedule pickups for these checks. Authenticated privileged checks remain blocked by the external-access issue.

The preparation report distinguishes unit/configuration checks from an actual Netlify production build or hosted execution. **Do not deploy or publish until separately approved.**
