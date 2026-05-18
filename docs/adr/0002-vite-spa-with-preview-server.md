# Vite SPA With Preview Server

VO Pads uses Vite for the browser app and a tiny Node server for production serving and shared-Project link previews.

Next.js previously handled routing, metadata generation, font loading, and production serving. The app is browser-local: Projects, Pads, Media Sources, and Media are created and persisted in the browser, while the server-side behavior is limited to link-preview metadata for URLs such as `/player?p=...&d=...`.

We considered keeping Next.js, adopting a fuller React framework, or making VO Pads a purely static SPA. Vite plus React Router better matches the app shape, keeps the runtime simple, and avoids carrying a full server framework for three routes. A purely static SPA was rejected because shared Project URLs still need dynamic Open Graph/Twitter metadata before the browser app loads.

The preview server must stay intentionally thin. It may parse URL-encoded Project exports to produce metadata, serve static files, and fall back to generic VO Pads metadata when parsing fails. It must not become a persistence backend for Projects or Media.
