# HOUSE OF INDUKA — Netlify SSR deployment proposal

## Review findings

The installed and locked versions are **Vite 8.1.5**, **Nitro 3.0.260603-beta**, **React 19**, and **@lovable.dev/vite-tanstack-config 2.26.5**. No dependency upgrade or replacement framework is proposed.

### Why `dist/client` is not the correct Netlify publish directory

The current Vite config retains `tanstackStart.server.entry: "server"` and otherwise delegates deployment to the Lovable wrapper.

- Inside Lovable, the wrapper explicitly pins the Cloudflare preset and its output to `dist/server` and `dist/client`.
- Outside Lovable, it supplies `cloudflare-module` only as a fallback. Nitro can auto-detect Netlify or honor `NITRO_PRESET`.
- The **installed Nitro Netlify preset writes final public assets to `dist/`**, not `dist/client/`. Its server function output is separate, under `.netlify/functions-internal/server/`.
- If platform detection is absent, the ordinary Cloudflare fallback uses `.output/` rather than Lovable's sandbox-specific layout. That also is not a Netlify functions deployment.

Therefore, `dist/client` is a Lovable output-layout assumption, not the installed Netlify preset's publish directory. Changing that directory alone would not ensure SSR: Netlify also needs the correct generated server function.

**Evidence:** wrapper `dist/index.js` lines 1180–1215; wrapper `dist/index.d.ts` lines 44–77; Nitro `dist/_presets.mjs` lines 1163–1206. There is no checked-in `netlify.toml` and no Netlify build log available here. This identifies the source-level output mismatch, not confirmation that an unseen Netlify build completed successfully.

## Proposed changes after approval

### 1. Add an explicit Netlify build command

Add this script to `package.json`, preserving all existing scripts:

```json
"build:netlify": "NITRO_PRESET=netlify vite build"
```

The installed wrapper already supports this selector outside Lovable. **No Vite config change is required**: retain the wrapper, all included plugins, and `tanstackStart.server.entry: "server"` exactly as they are. Ordinary Lovable builds continue using their existing target and pinned output.

Do not set `LOVABLE_NITRO_PRESET=netlify`; it is not a supported Lovable preset. Do not copy `LOVABLE_SANDBOX` or `DEV_SERVER__PROJECT_PATH` into Netlify; those activate the wrapper's Lovable-only override and ignore `NITRO_PRESET`.

### 2. Add Netlify configuration

Proposed `netlify.toml`:

```toml
[build]
  base = "."
  command = "bun run build:netlify"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
  BUN_VERSION = "1.4.4"
```

Use the repository's existing `bun.lock` for reproducible installs; verify Netlify installs development dependencies, including Vite, Nitro and the wrapper. Do not add a static-site adapter, disable Nitro, replace the router, or add a catch-all rewrite to `index.html`.

For this Nitro version, use **`netlify`**, not `netlify-static` or `netlify-edge`. The Node-based SSR preset generates:

- Public assets: `dist/` at the current root base URL.
- Server bundle: `.netlify/functions-internal/server/main.mjs`.
- Netlify function entry: `.netlify/functions-internal/server/server.mjs`.
- Function configuration: catch-all `path: "/*"`, `preferStatic: true`, `nodeBundler: "none"` and static-path exclusions.

Let Nitro generate its routing/header artifacts and let Netlify discover the internal function output. Do not set a separate user-functions directory to `dist/server` or publish the server bundle as public files.

### 3. Make existing hosted assets portable without changing their appearance

Four official logo pointers and the gifting packaging photo currently use relative `/__l5e/assets-v1/...` URLs. That delivery path belongs to Lovable and is not provided by a Netlify SSR preset.

Prepare a Netlify-only delivery rule for that exact asset prefix to the existing published Lovable asset host, subject to verifying unauthenticated access and byte/content-type correctness. Keep the existing files, image contents, logo component, layout and typography unchanged. If that host cannot serve them reliably, stop and propose bundling the exact original asset bytes instead; never regenerate or substitute images.

Product gallery images remain in private storage and continue using the existing authorized server-side signing function.

### 4. Document environment and callback requirements

Add an INDUKA deployment section to the README and record the dual-target deployment rule in AGENTS.md. No credential values go into either file or `netlify.toml`.

| Scope | Existing variable names |
|---|---|
| Public build configuration | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Server functions only | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Razorpay server functions only | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| Shiprocket server functions only | `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_PICKUP_LOCATION`, `SHIPROCKET_PARCEL_LENGTH_CM`, `SHIPROCKET_PARCEL_BREADTH_CM`, `SHIPROCKET_PARCEL_HEIGHT_CM`, `SHIPROCKET_PARCEL_WEIGHT_KG` |

Only the existing public URL and publishable key may use `VITE_`. Private credentials must be available in Netlify's **Functions runtime**, not just its build environment. Do not export all environment variables into the client bundle. Lovable's saved secrets do not automatically transfer to Netlify.

**Important external-backend blocker:** the existing checkout, private-image signing, order administration and webhook processing require privileged backend access. Lovable Cloud does not expose its managed service-role key for copying to another host. Do not ask for that unavailable key, fabricate a replacement, or weaken RLS to bypass it. Netlify configuration can be prepared, but a complete standalone Netlify deployment cannot be called functional until an authorized external server-access arrangement is established. A separately approved self-hosting/backend arrangement or authenticated bridge may be needed; neither is included in this configuration-only task.

Before a later deployment, approve the exact Netlify origin for signup verification and password recovery while retaining existing Lovable URLs. Sessions are origin-scoped; customers should sign in on the new origin, not have tokens copied between hosts. After a separate approved deployment, Razorpay Test Mode can target `/api/public/webhooks/razorpay` on that origin. Do not change the current stable Lovable test webhook now.

## Exact Netlify settings

| Setting | Value |
|---|---|
| Base directory | `.` — repository root |
| Build command | `bun run build:netlify` |
| Expanded command | `NITRO_PRESET=netlify vite build` |
| Publish directory | `dist` |
| SSR preset | `netlify` |
| SSR functions | Automatically generated under `.netlify/functions-internal` |
| Build Node version | `22` |
| Bun version | `1.4.4`, matching the current environment |

## Preservation and validation

- Preserve `src/server.ts` byte-for-byte, including lazy handler import, error capture and catastrophic-response normalization.
- Preserve bearer-token authentication, CSRF middleware, admin role checks, private storage authorization and all API/server-function boundaries.
- No schema, RLS, product, stock, order, payment or shipping logic changes. Preserve catalogue inactivity and the existing test-visibility configuration.
- Do not invoke Razorpay order/payment operations or Shiprocket booking, dispatch or pickup endpoints. Keep existing Test Mode credentials; no Live Mode transition.
- After approval, run existing relevant tests and check preview diagnostics. Validate the Netlify-generated artifact layout and SSR entry through the approved build-validation workflow; a directory existing is not sufficient proof.
- Before claiming deployment readiness, verify rendered SSR HTML, assets, deep-link routing, server functions, signed-in account/admin access, signed-out denial, private images and invalid webhook-signature rejection in the target runtime, without creating orders or shipments. Authenticated and integration checks remain blocked until external privileged access is resolved.
- A hosted Netlify end-to-end test requires separate deployment approval. Nothing is deployed or published by approving configuration preparation.

## Approval requested

Approve the configuration and documentation preparation above. The secure external-backend access issue will remain explicitly reported as a blocker, not concealed by a successful static build.