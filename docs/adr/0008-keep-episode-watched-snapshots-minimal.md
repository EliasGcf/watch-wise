# Keep episode watched snapshots minimal

Watch Wise will keep episode Watched Mark snapshots intentionally minimal for now: provider identity, episode coordinates, watchedAt, and runtime are enough for the current product needs. We will not persist extra episode display fields such as name, release date, summary, or special status until a real use case needs historical episode rendering independent of the catalog provider.

Catalog episode `releasedAt` and `duration` are treated as guaranteed by the generated provider SDK contract. Reviewers should not flag missing/null handling for these fields unless the SDK types or provider seam change.

Development-only setup changes, such as seeders and reset scripts, may accompany feature work when they support local verification, even when they are not explicit acceptance criteria.
