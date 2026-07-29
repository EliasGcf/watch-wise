# Use Inertia Link for internal navigation

Watch Wise will use `Link` from `@adonisjs/inertia/react` for internal page navigation instead of plain `<a href="/app/...">` anchors. Plain anchors trigger full document loads, which remount the React/Inertia app and cause visible page flashes during navigation.

Plain anchors remain appropriate for external URLs and non-Inertia documents. Forms should keep using `Form` from `@adonisjs/inertia/react` for route-backed submissions.
