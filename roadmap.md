# Refinement pass
# Netlify SSR deployment preparation
- [x] Inspect the current build configuration, installed versions and SSR entry.
- [ ] Confirm Nitro's Netlify preset, output paths and integration portability requirements.
- [ ] Present proposed configuration and exact Netlify settings for approval; do not deploy.

- [x] Refine product cards, product navigation and session wishlist.
- [x] Refine collection contrast, navigation and functional catalogue search.
- [x] Refine homepage, newsletter feedback and social placeholders.
- [x] Organise footer and add honest customer-care/policy pages.
- [x] Verify desktop, tablet, mobile and interactions; report pending content.

Remaining content: official catalogue/photos/prices, approved policies, contact/social details. Sign-in, purchasing and newsletter delivery intentionally deferred; no services connected.

# Shopping and collections
- [x] Central typed demo catalogue, filter/sort/search and pagination logic.
- [x] Reusable shop/collection explorer with desktop filters and mobile drawer.
- [x] Six collection heroes, breadcrumbs and demo grids.
- [x] Demo cards, detail navigation and visit-scoped cart with quantity controls.
- [x] Verify filters, sorting, wishlist, cart navigation and responsive layouts.

Shopping placeholders: illustrative INR prices and demo merchandising labels; official catalogue, specifications and secondary product photos awaiting supply. Demo bag is visit-only; real checkout and integrations remain disabled.

# Product detail experience
- [x] Reusable gallery, product information, variants, quantity and accordions.
- [x] Existing bag/wishlist integration, related and visit-only recently viewed products.
- [x] Verify routing, gallery/zoom, variants, quantities and mobile layouts.

Product-detail limitations: galleries currently use one sample photo plus its explicitly labelled crop; ring options are demo-only, not real variants. Verified specifications, real variants/photos/prices and approved shipping/return policies await supply. PIN checks validate format only; no checkout, payments or services connected.

# Demo cart and checkout
- [x] Full cart page with shared quantities, variants, removal and summary.
- [x] Demo coupon validation, illustrative shipping and validated customer/address fields.
- [x] Local demo confirmation snapshot without retaining customer information.
- [x] Verify full desktop/mobile flow and existing shopping routes.

Verified: 52 tests pass; desktop/mobile checkout to confirmation, coupon checks, quantities/removal, same-tab bag refresh, empty states and confirmation refresh. No runtime errors or submission requests. Existing homepage, shop, collection and product routes remain working.

Limitations: bag survives refresh in this tab when session storage is available; customer details and demo confirmations are not persisted. DEMO code applies no discount; ₹150 shipping is an illustrative assumption, not approved pricing. Taxes, live shipping, payments and actual orders remain disabled.