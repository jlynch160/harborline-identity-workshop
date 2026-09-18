// Demonstration instructions, not claims about current tenant outcomes.
export const userMoments = {
  jordan: [
    ['Start with Jordan’s current experience.', 'Confirm the signed-in identity in My Apps before comparing it with the records in Admin view.', 'Show the applications currently available; keep the contractor and employee accounts distinct.'],
    ['Follow the change into the working day.', 'After an intentionally staged conversion, sign in with the intended employee account.', 'Compare the available applications with the starting state. Without a completed conversion, narrate this as the intended experience.'],
    ['Request the access Jordan needs.', 'In My Access, inspect the packages actually available to Jordan and their approval requirements.', 'Open the assigned Opera PMS tile in My Apps and demonstrate the available role, if the app is ready.'],
    ['Show the first employee sign-in.', 'Show Jordan’s My Access assignments, then open Security info to inspect or intentionally register a supported method.', 'Return to My Apps and launch an assigned application.']
  ],
  sofia: [
    ['Show what is ready before Sofia arrives.', 'Sign in as Sofia only when the prepared account and bootstrap method are ready.', 'Inspect My Apps for actual assigned tiles; explain that the background workflow is shown in Admin view.'],
    ['Start at Sofia’s device.', 'Use the prepared frontline VM to show Windows sign-in and the managed desktop.', 'Open the browser and an assigned application. A full Autopilot first-boot demonstration needs an eligible prepared device.'],
    ['Give Sofia a useful first screen.', 'Open My Apps as Sofia and show the actual application tiles.', 'Inspect My Access for available packages. Describe housekeeping access as a proposed pattern unless it exists in the tenant.'],
    ['Register a method Sofia can use.', 'Use the prepared Temporary Access Pass only during an intentional registration demonstration.', 'Open Security info and demonstrate a supported method on a compatible device.']
  ],
  nadia: [
    ['Begin on Nadia’s remote device.', 'Demonstrate first boot only on an eligible prepared device; otherwise explain the user steps.', 'On the prepared desktop, sign in as Nadia and inspect her available applications.'],
    ['Show Nadia’s actual authentication prompt.', 'Start a fresh persona browser session and open My Apps.', 'Follow the external authentication prompt if it is offered; show the actual result without assuming the policy applied.'],
    ['Make access and its limits visible.', 'Open My Access as Nadia and inspect available requests and current assignments.', 'Show any displayed expiry date and launch an assigned application from My Apps.'],
    ['Explain what happens when the contract ends.', 'Inspect Nadia’s current My Access assignments and any displayed end date.', 'Only demonstrate denial after an intentionally staged expiry; the future date alone does not prove access has ended.']
  ],
  sam: [
    ['Clock in as Sam.', 'Use sam.fed@fed.arrow-creations.us in a separate browser profile and open My Apps.', 'Follow the redirect to HarborPass and the return to the application.'],
    ['Follow a working session through the shift.', 'On the prepared kiosk, show Sam’s current application session and any actual prompts.', 'Compare with Admin view’s report-only results; the policy does not enforce the narrated reduction in prompts.'],
    ['Walk through the recovery experience.', 'Describe the approved support handoff before intentionally changing any authentication method.', 'After an authorized recovery demonstration, show the resulting sign-in or Security info page.'],
    ['Hand the kiosk to the next person.', 'Sign out of the application and Windows as required by the prepared kiosk mode.', 'Verify that the next session does not expose Sam’s applications or data; show the device directly.']
  ],
  tom: [
    ['Inspect the access that remains.', 'If this is an authorized lab sign-in, open My Apps as Tom and observe the actual result.', 'Do not assume an enabled account grants access to every application; compare with Admin view.'],
    ['Connect a missed control to its impact.', 'Show Tom’s actual remaining tiles or My Access assignments if sign-in is allowed.', 'Pair that result with workflow and review history in Admin view.'],
    ['Separate a recommendation from an outcome.', 'Before an approved cleanup, record the current user experience.', 'After an intentionally executed cleanup, use a fresh sign-in to verify the result; do not present the proposal as completed.']
  ],
  kwame: [
    ['Observe the departure boundary.', 'In an authorized lab test, use a fresh persona session to attempt sign-in.', 'Show the actual denial or access result and compare it with the current account state.'],
    ['Verify the application boundary too.', 'Distinguish a new sign-in from an existing application session.', 'Demonstrate the actual prepared application behavior and correlate it with revocation evidence in Admin view.'],
    ['Close with what the person can actually do.', 'Summarize the observed sign-in and application results.', 'Use Admin view to tie each result to its timestamp and evidence; leave untested outcomes clearly identified.']
  ]
};
export const userLinks = [['My Apps','myapps'],['My Access','access'],['Security info','security'],['My sign-ins','signin']];
export const userAccount = p => p.id === 'sam' ? 'sam.fed@fed.arrow-creations.us' : p.account;
