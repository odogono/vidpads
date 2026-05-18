# Canonical Project Media Workflow

VO Pads keeps project lifecycle and media-source behavior in one canonical workflow module because opening, importing, saving, routing, thumbnail hydration, metadata persistence, and pad media operations all need to stay consistent in a browser-local app. We considered splitting this into separate project-library and pad-media modules, but for now a single Project + Media Source workflow gives better locality and prevents UI hooks from reimplementing persistence, cache invalidation, and source repair rules.
