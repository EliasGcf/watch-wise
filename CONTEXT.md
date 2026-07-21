# Watch Wise

Watch Wise lets people track the movies and series they choose to follow and watch.

## Language

**User**:
The person who owns a library and tracks watched movies and episodes.
_Avoid_: Account, profile

**Catalog**:
The searchable universe of movies and series available from a catalog provider.
_Avoid_: User catalog, personal catalog

**Catalog Provider**:
An external source that supplies searchable movie and series data. TMDB is the initial catalog provider.
_Avoid_: Internal catalog, content owner

**Library**:
The personal collection of movies and series a user has chosen to follow.
_Avoid_: Catalog

**Title**:
A movie or series identified by a catalog provider and that provider's title ID. It can appear in the catalog and be added to a user's library.
_Avoid_: Content item, media item

**Library Entry**:
A user's unique saved relationship to a title in their library and the scope for tracking that title's watched marks.
_Avoid_: Favorite, bookmark

**Tracking State**:
The derived state of a library entry based on its watched marks, such as not started, in progress, or completed.
_Avoid_: Manual status, custom status

**Materialized Progress**:
A saved projection of progress that can be recalculated from watched marks and catalog provider data.
_Avoid_: Progress source of truth, manual progress

**Watchable Item**:
A released movie or episode that can be marked as watched by a user.
_Avoid_: Watched series, watched season

**Watched Mark**:
A user's unique record within a library entry that a watchable item has been watched at least once, including when it was marked as watched and the immutable watched-item snapshot needed for history and metrics.
_Avoid_: Seen flag, completed flag

**Bulk Watch Marking**:
An action that creates missing watched marks for a group of watchable items, such as a season or series, without replacing existing watched marks.
_Avoid_: Season watched status

**Series Progress**:
The derived completion state of a series based on its watched episode marks and the regular episodes currently reported by the catalog provider. It can be unknown or partial when the episode total is not reliable.
_Avoid_: Watched series status

**Season Progress**:
The derived completion state of a season based on its watched episode marks and the regular episodes currently reported by the catalog provider. It can be unknown or partial when the episode total is not reliable.
_Avoid_: Watched season status

**Special Episode**:
An episode outside the regular season sequence that can be watched but does not contribute to the main series or season progress.
_Avoid_: Bonus content, extra episode

**Watched Time**:
The sum of known runtimes for watched movies and episodes.
_Avoid_: Estimated watch time, total time spent
