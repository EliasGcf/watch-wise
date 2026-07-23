# Serve JSON library data from API controllers

Watch Wise will put JSON endpoints consumed by the front-end client under `app/controllers/api`, while `app/controllers/web` remains responsible for Inertia page rendering, redirects, and session flash flows. API routes such as library movie and series listings should live under `/api` and use the generated `controllers.api.*` registry. This keeps web controllers focused on browser navigation and avoids mixing JSON read endpoints with web interaction concerns.
