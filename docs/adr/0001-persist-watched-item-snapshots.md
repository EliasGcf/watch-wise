# Persist watched item snapshots

Watch Wise will store user-owned tracking data and provider identifiers for library titles, with title identity based on the catalog provider and that provider's title ID. It will persist immutable essential snapshots for watched items when a user marks them as watched, while untracked future or unwatched episode data remains provider-sourced. This avoids depending on TMDB for historical metrics such as watched time, without eagerly copying every future episode, guessing cross-provider matches, or treating provider data as fully owned internal catalog data.
