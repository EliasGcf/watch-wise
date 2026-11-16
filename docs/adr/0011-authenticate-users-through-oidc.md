# Authenticate users through OIDC while keeping local login

Watch Wise signs users in through any OpenID Connect provider using the Authorization Code flow with PKCE, and keeps local email/password login as a fallback. The provider is configured in the app settings, not through environment variables, so a single row in `oidc_settings` holds the issuer URL, client ID and encrypted client secret.

`openid-client` performs discovery and validates the authorization response, signature, issuer, audience, expiry and nonce. The app stores the identity pair `(oidc_provider, oidc_subject)` on the user, using the issuer hostname as the provider, and only falls back to email for the first link. Tests replace the `OidcService` binding instead of calling the provider.
