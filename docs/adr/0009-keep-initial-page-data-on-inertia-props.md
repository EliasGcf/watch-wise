# Keep initial page data on Inertia props

Watch Wise will keep initial Home and page data on Inertia props from `app/controllers/web`, while generated-client API interactions use TanStack Query with Tuyau against `app/controllers/api` routes. This preserves the web/API split from [ADR 0006](0006-serve-json-library-data-from-api-controllers.md): web controllers own page rendering, redirects, and session flows; API controllers own JSON endpoints for client-side interactions after the page has loaded.

Generated-client API responses still follow the transformer response contract from [ADR 0007](0007-serialize-api-responses-with-transformers.md). Page props should carry the initial render payload only, and interactive reads or mutations for this slice should go through Tuyau/TanStack Query instead of expanding Inertia props into a general API layer.
