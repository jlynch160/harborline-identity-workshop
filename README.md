# Harborline: a day in the life

A static, persona-led MajorKey workshop adapted from the supplied Harborline reference hub.

## Content model

- `dist/data.js`: six personas, 22 moments, setup steps, evidence requirements and tenant links.
- `dist/workshop.js`: all 34 reference use cases and a proposed 09:00–17:00 agenda.
- `dist/app.js`: audience presentation, source-linked case library and separate presenter notes.
- `dist/styles.css`: responsive presentation theme with reduced-motion and print styles.

Source: https://claude.ai/artifact/LmPw3Q9fiHv1YaRb83t2RL, accessed 17 September 2026.

This site contains no credentials, tenant API connection, telemetry, write operations or AI model integration. Tenant and agent links open existing applications. Source-reported states are dated and clearly separated from current live evidence. Only Jordan, Sam and Tom have prepared agent links, as documented in the source presenter script.

The presenter view (`?view=presenter`) follows the audience view using same-origin BroadcastChannel on the same device. Keep it off the shared screen. Present mode hides navigation and supports left/right arrow navigation. Escape exits that mode.

## Validation and rehearsal

Run `npm run check` for JavaScript syntax. Serve the `dist` directory over HTTP. Rehearse all external links with the correct tenant session before the client workshop. Source details conflict in places; the caution notes preserve those distinctions. No current tenant state has been independently verified by this site.

Deployment uses Sites and starts owner-private.
