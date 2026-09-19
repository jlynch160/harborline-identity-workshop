# Harborline: a day in the life

A static, persona-led MajorKey workshop adapted from the supplied Harborline reference hub.

## Content model

- `dist/data.js`: six personas, 22 moments, setup steps, evidence requirements and tenant links.
- `dist/workshop.js`: all 34 reference use cases and a proposed 09:00–17:00 agenda.
- `dist/app.js`: audience presentation, source-linked case library and separate presenter notes.
- `dist/styles.css`: responsive presentation theme with reduced-motion and print styles.

Source: https://claude.ai/artifact/LmPw3Q9fiHv1YaRb83t2RL, accessed 17 September 2026.

The public site contains no credentials, tenant API connection, telemetry or AI model integration. Every persona's AI view can launch the protected Identity Agents application with a use-case prompt. That private application uses Azure OpenAI and reads the connected tenant through read-only Microsoft Graph tools. Proposed changes are applied, verified and reversed by an authorized human in the Microsoft control; the public workshop never writes to the tenant. Source-reported states remain clearly separated from current live evidence.

The reversible rehearsal uses a dedicated non-production identity and unassigned `ZZ-DEMO-AI-Replay` security group. Each run captures the starting state, previews one bounded membership change, verifies the directory audit event, performs the inverse action and verifies restoration. Account disablement, credential reset and Conditional Access enforcement are intentionally excluded from this replay path.

The Entra workspace connects to the protected Azure remote-desktop gateway with fullscreen controls. HTTPS, the gateway login screen, private RDP connectivity, and the Azure-verified desktop certificate pin have been checked. Presenter authenticator enrollment and Windows/Entra sign-in are required; a signed-in end-to-end rehearsal remains outstanding. Public workshop access never grants desktop access. Returning to a story retains the frame; Disconnect removes the frame but does not sign out Windows or Entra. See `infra/remote-gateway/DEPLOYMENT.md` for infrastructure and rehearsal details.

The presenter view (`?view=presenter`) follows the audience view using same-origin BroadcastChannel on the same device. Keep it off the shared screen. Present mode hides navigation and supports left/right arrow navigation. Escape exits that mode.

## Validation and rehearsal

Run `npm run check` for JavaScript syntax. Serve the `dist` directory over HTTP. Rehearse all external links with the correct tenant session before the client workshop. Source details conflict in places; the caution notes preserve those distinctions. No current tenant state has been independently verified by this site.

Deployment uses Sites. The workshop is public at the user's request; the gateway requires separate authentication.


## Azure hosting and GitHub

- Repository: https://github.com/sagitta414/harborline-identity-workshop (public).
- Azure site: https://kind-beach-0ba2dc30f.6.azurestaticapps.net (public).
- Azure resource: `harborline-identity-workshop`, Free SKU, resource group `RG-HARBORLINE-LAB`.
- Pushing `main` runs `.github/workflows/azure-site.yml`: validate and deploy only `dist/`.
- The deployment credential is held in the GitHub Actions secret `AZURE_STATIC_WEB_APPS_API_TOKEN`; never commit its value.
- Gateway framing permits this exact Azure origin and the existing Sites origin. Windows and gateway sign-in remain required.
- `.private/` is excluded from source control and deployment. The existing Sites publication remains available separately.
