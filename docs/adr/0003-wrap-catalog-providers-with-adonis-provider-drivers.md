# Wrap catalog providers with Adonis provider drivers

Catalog search integrations will be exposed through an Adonis service provider, manager, and driver structure. TMDB is the production driver and tests use a fake driver selected through configuration, so authenticated Catalog behavior can be tested without calling external services and without replacing controller internals.
