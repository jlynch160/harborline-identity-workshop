# Harborline: a day in the life

A static, persona-led MajorKey workshop adapted from the supplied Harborline reference hub.

## Content model

- `dist/data.js`: six personas, 22 moments, setup steps, evidence requirements and tenant links.
- `dist/workshop.js`: all 34 reference use cases and a proposed 09:00–17:00 agenda.
- `dist/app.js`: audience presentation, source-linked case library and separate presenter notes.
- `dist/styles.css`: responsive presentation theme with reduced-motion and print styles.

Source: https://claude.ai/artifact/LmPw3Q9fiHv1YaRb83t2RL, accessed 17 September 2026.

The public site contains no credentials, tenant API connection, telemetry or AI model integration. Tenant and agent shortcuts open existing applications. Source-reported states are dated and clearly separated from current live evidence. Only Jordan, Sam and Tom have prepared agent links, as documented in the source presenter script.

The Entra workspace connects to the protected Azure remote-desktop gateway with fullscreen controls. HTTPS, the gateway login screen, private RDP connectivity, and the Azure-verified desktop certificate pin have been checked. Presenter authenticator enrollment and Windows/Entra sign-in are required; a signed-in end-to-end rehearsal remains outstanding. Public workshop access never grants desktop access. Returning to a story retains the frame; Disconnect removes the frame but does not sign out Windows or Entra. See `infra/remote-gateway/DEPLOYMENT.md` for infrastructure and rehearsal details.

The presenter view (`?view=presenter`) follows the audience view using same-origin BroadcastChannel on the same device. Keep it off the shared screen. Present mode hides navigation and supports left/right arrow navigation. Escape exits that mode.

## Validation and rehearsal

Run `npm run check` for JavaScript syntax. Serve the `dist` directory over HTTP. Rehearse all external links with the correct tenant session before the client workshop. Source details conflict in places; the caution notes preserve those distinctions. No current tenant state has been independently verified by this site.

Deployment uses Sites. The workshop is public at the user's request; the gateway requires separate authentication.
