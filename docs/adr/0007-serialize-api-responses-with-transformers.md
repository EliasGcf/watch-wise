# Serialize API responses with transformers

Watch Wise API controllers will return model data through Adonis transformers using `serialize(Transformer.transform(...))` instead of assembling response objects inline in controllers. Transformers define the response contract for models such as movies and series, while controllers handle authentication, querying, and response composition. This keeps API response shape changes local to transformer modules and prevents duplicate serialization logic across routes.
