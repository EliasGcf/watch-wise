# Regenerate Lucid schema before schema-backed models

When adding or changing database-backed models, Watch Wise will run the relevant Lucid migrations with `bun ace migration:run` before wiring the model class. This regenerates `database/schema.ts`, so models can follow the established pattern of extending generated schema classes, like `User` extends `UserSchema`, instead of duplicating generated column decorators by hand.
