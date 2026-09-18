import {cases} from './workshop.js';
import {userAccount,userMoments} from './perspectives.js';

// Authored workshop instructions. These describe checks, never live tenant state.
const s=(action,why,look)=>({action,why,look});
const guides={
 jordan:[
  [[1,2,9],[
   s('In entra.microsoft.com, confirm the workforce directory in the account menu. Open Entra ID → Users → All users; search for vale. Open each matching Jordan record in a separate tab.','Jordan is one person, but the lab has multiple identity records. Choosing the wrong record can make a successful change appear to fail.','Compare the display name, user principal name, object ID, user type and account status. Do not identify the account by display name alone.'),
   s('Open Properties for the intended workforce record. Compare its job information, employee identifier, manager and hire date with the contractor record and its contract-end source.','The authoritative source and effective dates decide when employment changes. An email alias does not prove two records are the same identity.','The reference handover is 20–21 September 2026. Record the current values; if a date is absent in this blade, show the prepared source record instead.'),
   s('Open Groups and Applications on each record. Describe what Jordan can use before the handover and which assignments need continuity.','A conversion must preserve the right work context while retiring obsolete access.','A visible before-state of identities and access, with an agreed target employee identity.')
  ]],
  [[7,9,33],[
   s('Open ID Governance → Lifecycle workflows → Workflows. Select HL Employee pre-hire. Inspect its execution conditions, scope, trigger attribute and offset.','Jordan must enter the workflow at the right time and satisfy its scope.','Compare the actual scope and trigger with Jordan’s verified attributes; do not infer inclusion from the workflow name.'),
   s('Open the workflow task list, then its history. Find Jordan by the confirmed identity and open the relevant run and task results.','Configuration describes intent; task history shows whether preparation happened.','Note execution time, user, task status and any failure. If no run exists, explain that the prepared configuration is the demo result.'),
   s('Open the prepared conversion case in the identity-agent application. Review the old and new identities, overlap, licenses, ownership and prerequisites. Stop at the proposal unless an execution demo has been prepared.','Jordan needs a coordinated handover; a generated proposal does not establish identity continuity.','Separate the proposed changes, the person authorized to approve them, and the execution/audit evidence required afterward.')
  ]],
  [[14,15,17,28],[
   s('Open Entra ID → Enterprise applications → All applications. Find Harborline Opera PMS. Inspect Properties, Users and groups, and its configured single sign-on method.','Jordan works across two properties, so both app assignment and property context matter.','Confirm the target application and Jordan’s actual assignment. Inspect app-role definitions on the corresponding app registration if needed.'),
   s('In the application’s single sign-on configuration, inspect Attributes & Claims where available. Follow the configured claims mapping and custom claims provider to the source of property and role values.','The application should receive the correct business context without an unmanageable collection of groups.','Distinguish configured claims from an issued token. Inspect a token only in a prepared diagnostic app; do not paste live tokens into the workshop.'),
   s('Open ID Governance → Entitlement management → Access packages. Compare the Harbor View and Bayside Guest Services Lead packages: resource roles, request policies, approvers, expiry and assignments.','Property access and privileged Admin access require deliberate scope and approval.','Show the two actual packages and their policy differences. A package’s existence is separate from Jordan having an assignment.')
  ]],
  [[18,7],[
   s('Open Jordan’s verified user record → Authentication methods. Review registered methods, then open Authentication methods → Policies to check his eligible methods.','A first sign-in needs a usable bootstrap and a method Jordan can keep using.','Confirm the intended account and an available method before switching to the user profile.'),
   s('Use Jordan’s separate browser profile inside the VM. Open myaccess.microsoft.com and inspect his active assignments and available packages. Open a relevant package to show its request requirements.','Jordan should understand what he can request and whether approval is needed.','If demonstrating a real request, explain that submission starts the configured approval process; show the resulting request status.'),
   s('Open mysignins.microsoft.com/security-info, then myapplications.microsoft.com. Show a registered method or deliberately enroll a supported one; launch the assigned application.','The end of the story is Jordan getting into the application with the intended access.','A working sign-in and actual application permissions. Enrollment requires the prepared authenticator/device, not just a policy toggle.')
  ]]
 ],
 sofia:[
  [[3,7],[
   s('In Entra ID → Users → All users, search Sofia Alvarez and confirm sofia.alvarez@arrow-creations.us. Open Properties and inspect her hire date, manager, department and account state.','Sofia’s first day begins with a reliable source record.','Compare the source’s 15 September 2026 hire date with current attributes; identify who owns any missing data.'),
   s('Open ID Governance → Lifecycle workflows → HL Employee pre-hire. Compare execution conditions with Sofia’s attributes and inspect each configured task.','The pre-hire process should prepare the identity before Sofia reaches the property.','Explain what each configured task actually prepares, without adding tasks that are not present.'),
   s('Open workflow history and locate Sofia’s execution. Inspect the user result and individual task results, then return to her record to verify the resulting assignments.','Sofia benefits only when the preparation succeeds.','A timestamped run and the resulting state, or an explicit explanation of why this is a configuration walkthrough.')
  ]],
  [[20,21,23],[
   s('In intune.microsoft.com, open Devices → All devices and search HL-FRONT-01. Match the record to the prepared hl-frontline-01 VM. Inspect its enrollment, primary user, last check-in and compliance.','The named frontline device is part of Sofia’s working experience.','Verify the actual device, not a similarly named record; a stale compliance result is not proof of its current condition.'),
   s('Inspect HL-Devices-Frontline membership and the device’s assigned configuration, compliance and Windows update policies. Open relevant status details.','Policy targeting determines what Sofia’s device receives.','Show assignments alongside per-device results, including pending or failed settings.'),
   s('On the prepared device, show Windows Settings → Accounts → Access work or school and the managed desktop. Open a prepared application.','The client sees how management reaches the device Sofia uses.','This proves the current managed device. A full Autopilot first-boot demonstration requires a separate eligible device and reset plan.')
  ]],
  [[7,18,23],[
   s('Open Sofia’s Entra user record → Groups and Applications. Note direct assignments and relevant group memberships.','Her housekeeping role should determine useful access.','Record the actual assigned applications rather than assuming the job title grants them.'),
   s('Open Entitlement management → Access packages and compare the built Guest Services Lead packages with the housekeeping experience you propose.','The existing package pattern can inform a new role without implying that it is already deployed.','Label housekeeping as proposed unless the current tenant contains that package and policy.'),
   s('Switch to Sofia’s browser profile, open My Apps, check the account menu, then launch one visible assigned tile. Open My Access to compare available requests.','Sofia’s test is whether she can start her job without a support ticket.','The actual tile and application result; no tile may indicate assignment or application visibility needs investigation.')
  ]],
  [[18],[
   s('In Authentication methods → Policies, inspect Temporary Access Pass and the chosen strong method. Compare include/exclude scope with Sofia’s groups.','Bootstrap access and the long-term method both need to be enabled for the correct person.','Confirm policy eligibility and a compatible authenticator/device before beginning registration.'),
   s('In Sofia’s user record → Authentication methods, inspect existing methods. For a prepared enrollment demo, an authorized operator can create a Temporary Access Pass with an appropriate lifetime and use policy. Deliver it privately.','A TAP is a temporary bootstrap credential, not a permanent shared demo password.','Its validity and allowed use must cover the registration session. The actual TAP must never be placed on this public page.'),
   s('In Sofia’s separate session, sign in with the prepared method and open Security info → Add sign-in method. Complete only the method supported by the device, then verify it appears in Security info.','The user should finish with a method she can use again.','Show the registered method and an intentional follow-up sign-in. Explain that SMS being enabled means the tenant is not wholly passwordless.')
  ]]
 ],
 nadia:[
  [[4,22],[
   s('In Intune, find Windows enrollment and the remote Autopilot deployment profile. Inspect its deployment mode, join type and out-of-box settings.','Nadia receives her device at home without an onsite technician.','The settings should match the intended remote experience; the lab source marks this scenario as needing a device.'),
   s('Inspect the profile assignment to HL-Autopilot-RemoteCC, its membership rule or members, and the matching Enrollment Status Page assignment.','A correct profile helps only when the intended device receives it.','Verify a prepared device is registered and targeted; show which required apps can block setup.'),
   s('With an eligible prepared device, walk through internet connection, Nadia’s sign-in and enrollment status. Otherwise show the configuration and describe these user steps.','The outcome is an internet-only path into work.','Do not reset the working presentation VM. An already-managed desktop is not proof of a fresh Autopilot deployment.')
  ]],
  [[12,18],[
   s('In Entra Authentication methods → Policies, open the configured external authentication method/provider. Inspect its enabled state and targeted groups.','Nadia should use the approved external authenticator in the intended sign-in flow.','Confirm the current provider configuration and HL-AuthMethod-ExternalProvider targeting.'),
   s('Open Nadia’s user record → Groups. Confirm her membership and inspect the relevant Conditional Access scope in Protection → Conditional Access.','Provider registration, user eligibility and a requirement for authentication are separate checks.','Document include/exclude matches and policy state; do not assume every sign-in triggers the external method.'),
   s('In Nadia’s fresh browser session, open My Apps and follow the actual authentication prompt. Then inspect her sign-in log event → Authentication details and Conditional Access.','The prompt and event connect policy to Nadia’s experience.','Show the method and result actually recorded. If the external method is not offered, investigate targeting rather than presenting it as successful.')
  ]],
  [[27,31],[
   s('Open Nadia’s user record and prepared contract source. Compare her current assignments, sponsor/owner and contract-end value.','A remote contractor needs clear responsibility and a time boundary.','The scenario references 31 December 2026; verify the actual value and where it is maintained.'),
   s('Open the relevant access package → Policies. Inspect who can request it, required approval, assignment duration/expiry and review settings. Open Assignments to find Nadia.','A time-bound policy must apply to the actual assignment to control her access.','Compare assignment expiry with the contract date. A default duration alone does not prove they agree.'),
   s('Switch to Nadia’s profile → My Access. Open her package/assignment details and show any displayed expiry or request status, then launch an assigned app from My Apps.','Nadia should see both what she can use and how long access lasts.','Show real assigned access. If no package applies, explain the missing control rather than inventing an assignment.')
  ]],
  [[27,31],[
   s('Reopen Nadia’s contract-end source and current assignments. Record the end date and time zone used by the control.','The end of the engagement must be interpreted consistently.','A future end date is a planned boundary, not evidence that access has already expired.'),
   s('Inspect the applicable expiry workflow’s scope, schedule and tasks. Open the related access review to show its reviewers, recurrence and result-application settings.','Expiry and review require both a decision and a mechanism that applies it.','Identify which control removes which entitlement and who handles exceptions.'),
   s('Describe the post-expiry checks: workflow history, assignment removal, a fresh sign-in result and application access. Use a separately staged test if a live outcome is required.','The client needs evidence that the date caused the intended access change.','Keep Nadia’s future scenario intact; identify every outcome that has not yet been tested.')
  ]]
 ],
 sam:[
  [[8,19,30],[
   s('In Entra ID → Domain names, compare the managed domain with fed.arrow-creations.us. Show the configured federation information available in the lab.','Sam’s identity provider can differ from the application’s token issuer.','Identify the federated domain and HarborPass relationship; a domain label alone is not proof of a successful sign-in.'),
   s('In Sam’s separate browser profile, open My Apps and enter sam.fed@fed.arrow-creations.us. Follow the redirect to HarborPass using the privately held federated-account credential.','This is Sam arriving for his 22:00 shift; his federated account drives the redirect.','Confirm the destination and account. sam.okoro@arrow-creations.us is a different workforce identity.'),
   s('After authentication, launch a prepared assigned app. In the admin profile, find the matching sign-in event and inspect its result.','The handoff must finish with usable application access.','If HarborPass cold-starts or fails, show federation configuration and label the end-to-end sign-in as unverified.')
  ]],
  [[24,30],[
   s('Open Protection → Conditional Access → Policies and locate HL-CA04. Inspect user/group targeting, target resources, exclusions and device conditions.','The shared-device policy should affect the intended kiosk sessions.','Check whether Sam and the prepared device are actually in scope.'),
   s('Open the policy’s Session controls and inspect sign-in frequency and any other configured controls. Show its current policy state.','Prompt frequency affects a long shift, but the enforcement state determines actual behavior.','The reference describes a 12-hour frequency and report-only mode; verify both before describing them.'),
   s('Open Sam’s sign-in event → Report-only and Conditional Access details. Compare the recorded evaluation with his observed application prompts.','This connects the proposed experience to evidence without claiming an unmeasured improvement.','Report-only does not enforce HL-CA04. The agent’s eight-to-one prompt reduction is a simulation.')
  ]],
  [[13],[
   s('In the admin profile, inspect AU-Riverside membership and Riley Support’s eligible Authentication Administrator assignment in Privileged Identity Management.','The operator’s recovery authority should have a clear boundary.','Confirm the target Sam identity is within the administrative unit and the assignment has the intended scope.'),
   s('Explain the operator’s identity-verification and role-activation procedure. In a prepared operator session, inspect activation requirements such as justification, approval and duration.','A lost authenticator must not allow an unverified caller to take over an account.','Use the actual configured operator procedure; browsing this guide does not activate or authorize a role.'),
   s('If an intentional recovery demo is prepared, use the approved operator session and method. Otherwise inspect Sam’s Authentication methods without resetting anything. After recovery, show Sam’s new sign-in and the operator audit event.','The story ends with restored access and an accountable action.','Identify who acted, on which identity, at what time, and the observed recovery result.')
  ]],
  [[24,25,26],[
   s('Use the prepared hl-kiosk-01 device, not the frontline desktop simply because it is already open. In Intune inspect its shared-PC/session configuration and assignment status.','Sam’s 06:00 handover is a property of the actual kiosk setup.','Confirm Windows identity, application identity and device identity separately.'),
   s('Inside the kiosk session, sign out of the application and end the Windows session as required by its prepared mode. Start the next demo user session.','The next colleague must not inherit Sam’s application access.','Check account menus and access to the previous app session; do not infer cleanup from a closed browser window.'),
   s('For a separately prepared offline demonstration, compare a returning cached user with a first-time cloud user and show recovery after connectivity returns.','Offline behavior is different from normal online authentication.','Do not disconnect the active remote gateway. If no isolated kiosk test is ready, describe the steps and mark the result untested.')
  ]]
 ],
 tom:[
  [[5,6,27],[
   s('Open Entra ID → Users → All users → Tom Reilly. Confirm tom.reilly@arrow-creations.us and inspect account status and the prepared contract-end source.','Tom’s HVAC engagement has ended; the question is whether access ended with it.','Compare the reference 31 July date with current values. Show current enabled/disabled state without editing it.'),
   s('Open Groups and Applications. Inspect remaining memberships and assignments. Open Sign-in logs with a relevant date range and application filter.','An enabled flag, a remaining assignment and actual use are different kinds of evidence.','Record the precise event date and result. No event in the selected log window does not prove no historical activity.'),
   s('If a prepared authorized persona test is available, attempt a fresh My Apps sign-in as Tom and show its real result. Compare that with the administrator findings.','The client sees the practical impact of the remaining access.','Do not assume every app is accessible just because the account is enabled; do not disable Tom while simply presenting this starting state.')
  ]],
  [[5,6,31],[
   s('Open Lifecycle workflows → HL Vendor contract expiry. Compare its scope and trigger attributes with Tom’s actual record.','A configured workflow can miss a person when scope or source data is wrong.','Show the exact match or mismatch; a past contract date does not itself execute a workflow.'),
   s('Open its history, locate Tom and inspect per-task status and timestamps. If no run exists, identify that gap explicitly.','The failure might be eligibility, scheduling, execution or downstream removal.','Do not choose a cause without evidence; distinguish a missing run from a failed task.'),
   s('Open ID Governance → Access reviews. Inspect the prepared reviews, their resource scope, reviewers, status and application of results.','A review only changes access if it reaches a decision and the result is applied.','The reference reviews were staged and had not run. Show their present state and remaining action owner.')
  ]],
  [[34],[
   s('Open the prepared review-agent case for Tom. Read the cited identity, end date, assignments and activity evidence before its recommendation.','An actionable review starts with evidence tied to the correct person.','Check freshness, source and scope; separate scenario narrative from actual retrieved records.'),
   s('Walk through each proposed change, affected entitlement, approver and execution owner. Explain the effect on Tom’s next sign-in and existing app sessions.','The reviewer needs to understand the consequences before approving cleanup.','A proposed disable or removal remains a proposal until the relevant control executes.'),
   s('If a cleanup was intentionally approved and run, show the execution result and audit trail, refresh Tom’s record, and use a fresh persona session to verify access. Otherwise finish at the decision point.','The outcome needs both administrative evidence and a user-side result.','Keep the before-state, decision and after-state separate; record failures and remaining downstream access.')
  ]]
 ],
 kwame:[
  [[27,33],[
   s('Open Kwame Mensah in All users and verify kwame.mensah@arrow-creations.us. Compare his departure source with the account status.','Kwame provides a second leaver case to contrast with Tom.','The reference departure is 10 September and the script describes a disabled account; verify current values.'),
   s('Open Tom’s record in another administrator tab. Compare both end dates and current enabled flags using the same fields.','The same business event can produce different outcomes when controls or scope differ.','Explain only the differences supported by the two records; do not treat either snapshot as a live fact.'),
   s('In a prepared fresh user profile, attempt Kwame’s sign-in only with the privately held lab credential. Record the actual result and corresponding sign-in event.','A fresh sign-in tests the user-facing departure boundary.','A disabled user may be unable to sign in by design; do not re-enable the account to make the demonstration succeed.')
  ]],
  [[27,31,33],[
   s('Open the applicable leaver workflow → History. Find Kwame’s run and inspect each configured task’s result and time.','Disabling, revoking and removing access are separate outcomes.','Use actual task results; do not assume the workflow name implies all three actions occurred.'),
   s('On Kwame’s user record, inspect Groups and Applications. Compare expected removals with current assignments and any relevant downstream provisioning records.','A disabled identity can still have stale entitlements or a separate application account.','List access that remains and whether a downstream app confirms removal.'),
   s('Inspect directory audit and sign-in records for the relevant disable/revocation actions. In the prepared application, distinguish a fresh sign-in from an existing session.','Existing sessions and application behavior need their own verification.','Do not claim that the account-disabled flag proves every application session has ended.')
  ]],
  [[34],[
   s('Build the story in timestamp order: departure source, workflow run, directory changes, application records and observed user result. Show each supporting screen.','The next team should be able to reconstruct what happened.','Normalize time zones and identify any missing link in the chain.'),
   s('Inspect the prepared scenario’s claim of post-termination activity against sign-in and application logs. Check identity, event time, result and application.','A scenario claim becomes a finding only when records support it.','If the event cannot be found or is outside retention, state that limit rather than implying it occurred.'),
   s('Return to Tom’s evidence and compare the two outcomes. Ask who owns source data, workflow failures and downstream exceptions in the client’s environment.','The workshop should end with an operational owner and acceptance criteria.','Agree how the client will prove the account, sessions and entitlements are closed, and who handles anything still open.')
  ]]
 ]
};

export function buildDemoGuide(p,index,isUser){
 const m=p.moments[index], [ids,admin]=guides[p.id][index], account=userAccount(p), u=userMoments[p.id][index];
 return {name:p.name,time:m.time,title:m.title,why:m.body,perspective:isUser?'User view':'Admin view',job:p.job,story:p.intro,
  account,domain:account.split('@')[1],cases:ids.map(id=>cases.find(c=>c.id===id)).filter(Boolean),caution:p.caution,question:p.question,evidence:m.evidence,
  admin, user:[
   s(`Inside the VM, open ${p.name}’s separate browser profile or a new InPrivate window. Open myapplications.microsoft.com and check the account menu. Use ${account} when asked to sign in.`,`${p.name}’s experience must be shown with the persona identity, separate from the administrator and Windows desktop logins.`,`Use the existing private credential and configured MFA method. For Sam’s federation story, follow HarborPass; do not substitute his workforce account. For leaver stories, denial may be the correct result.`),
   ...u.slice(1).map((action,i)=>s(action,i===0?m.body:`Connect this action to ${p.name}’s job as ${p.job.toLowerCase()} and the current moment: ${m.short}.`,i===0?'Pause on the account menu and relevant application, request or method screen. Explain the result actually shown.':m.evidence)),
   s('Return to the administrator profile and locate the corresponding record, request, assignment or sign-in event. Match the identity and time with what the audience just saw.','The user experience and the underlying control should tell the same story.',m.evidence)
  ],userTitle:u[0]};
}
