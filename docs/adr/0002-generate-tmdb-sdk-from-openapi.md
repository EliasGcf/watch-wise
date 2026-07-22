# Generate TMDB SDK from OpenAPI

Watch Wise will access TMDB through a generated Hey API/OpenAPI TypeScript SDK instead of hand-written HTTP request code. This keeps TMDB endpoint shapes and response types grounded in the provider contract, while still letting application code depend on the Catalog Provider seam rather than directly on TMDB request details.
