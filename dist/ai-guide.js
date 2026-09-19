import {AGENTS,URLS} from './data.js';

const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const runState=new Map();

export const aiStories={
 jordan:{title:'Orchestrate a safer identity handover',benefit:'Connect Jordan’s three records, explain the uncertainty, and prepare a controlled conversion plan before anyone changes access.',input:'Workforce and contractor records, effective dates, application assignments, claims and workflow history.',output:'A cited handover plan with identity matches, prerequisites, access to preserve, exceptions and named approvals.',decision:'An authorized operator confirms the identity match and approves every conversion or access change.',moments:['Compare Jordan’s records and highlight uncertain matches.','Draft the handover sequence and identify unmet prerequisites.','Explain the differences between property roles and package policies.','Summarize first-sign-in readiness and missing assignments.']},
 sofia:{title:'Build a first-day readiness copilot',benefit:'Turn scattered hire, device, access and authentication signals into one readiness view before Sofia arrives.',input:'Hire attributes, pre-hire task results, device status, application assignments and authentication-method eligibility.',output:'A readiness brief grouped into ready, needs attention and not verified, with evidence and an owner for every gap.',decision:'The onboarding owner validates the brief; authorized administrators perform assignments or authentication changes.',moments:['Find missing hire attributes and failed preparation tasks.','Summarize device enrollment, policy and compliance gaps.','Suggest role-appropriate access for human review.','Explain a supported bootstrap and registration path.']},
 nadia:{title:'Guide remote onboarding from one evidence trail',benefit:'Correlate Nadia’s internet-only device setup, external authentication and time-bound access so support can diagnose the whole journey.',input:'Autopilot targeting, device readiness, external-method scope, sign-in evidence, contract dates and package policies.',output:'An ordered troubleshooting plan that separates configured controls, observed outcomes and unverified assumptions.',decision:'Support validates each diagnosis; identity owners approve access, scope and expiry changes.',moments:['Identify missing prerequisites for remote device setup.','Explain why the external authentication method may not appear.','Flag differences between contract dates and access expiry.','Prepare an end-of-contract verification checklist.']},
 sam:{title:'Explain friction across the night shift',benefit:'Correlate federation, kiosk state and Conditional Access results to show where Sam’s prompts originate and what to test next.',input:'Federation configuration, kiosk mode, Conditional Access settings, report-only results and observed sign-in events.',output:'A cited sign-in narrative, a testable policy hypothesis and a safe recovery checklist.',decision:'The policy owner approves enforcement changes; the scoped support operator performs recovery.',moments:['Explain where federation redirects Sam and where it fails.','Compare report-only policy results with actual prompts.','Prepare a scoped recovery checklist with operator verification.','List the evidence needed to prove a clean kiosk handover.']},
 tom:{title:'Turn stale access into a review decision',benefit:'Connect Tom’s ended engagement to the account, assignments and activity that may still remain, then prepare a reversible cleanup rehearsal.',input:'Contract end source, account state, assignments, activity, expiry runs and access-review status.',output:'An evidence-backed review brief with confidence limits, affected access and a proposed cleanup scope.',decision:'The reviewer decides; an authorized operator executes approved changes and verifies the result.',moments:['Compare the end date with current account and access state.','Identify possible gaps in workflow scope or execution.','Draft a cleanup recommendation with approval and verification steps.']},
 kwame:{title:'Make offboarding proof reviewable',benefit:'Assemble Kwame’s departure events into a traceable timeline and show where proof is still missing.',input:'Departure source, workflow history, directory audit events, remaining assignments and application/session evidence.',output:'A timestamped evidence timeline with confirmed outcomes, unresolved exceptions and checks still needed.',decision:'The offboarding owner validates the evidence and confirms completion; AI cannot establish removal without records.',moments:['Compare the departure signal with the current account state.','Separate account disablement from session and entitlement removal.','Assemble the evidence timeline and highlight unsupported claims.']}
};

const recipes={
 jordan:{control:'Microsoft Entra admin center · Users and groups',portal:'users',observe:'Match the workforce, guest and federated records; compare effective dates and current assignments.',change:'Preview membership in the prepared ZZ-DEMO-AI-Replay group as a stand-in for Jordan’s approved employee access.',verify:'Refresh Jordan’s memberships and open the directory audit event. Confirm actor, target, time and result.',undo:'Remove the same membership, refresh the user, and show the matching reversal event.'},
 sofia:{control:'Microsoft Entra admin center · Users and groups',portal:'users',observe:'Read Sofia’s hire attributes, workflow results, group assignments and current first-day readiness gaps.',change:'Preview membership in the prepared ZZ-DEMO-AI-Replay group as Sofia’s temporary first-day access.',verify:'Confirm the membership appears and cite the directory audit record before calling the step complete.',undo:'Remove the prepared membership and verify that Sofia is back at the rehearsed starting state.'},
 nadia:{control:'Microsoft Entra admin center · Users and groups',portal:'users',observe:'Correlate Nadia’s contract boundary, external-method scope and present access without changing policy.',change:'Preview a temporary membership in ZZ-DEMO-AI-Replay to represent approved remote-contractor access.',verify:'Confirm the assignment and audit event, then distinguish that proof from a successful device or MFA test.',undo:'Remove the temporary membership and verify Nadia’s original membership list is restored.'},
 sam:{control:'Microsoft Entra admin center · Users and groups',portal:'users',observe:'Read Sam’s group scope and sign-in evidence while keeping report-only policy results separate from enforcement.',change:'Preview a temporary ZZ-DEMO-AI-Replay membership to model a kiosk pilot ring. Do not toggle Conditional Access live.',verify:'Confirm membership and the audit record; use report-only results to discuss policy impact separately.',undo:'Remove Sam from the pilot group and show the inverse audit event. The policy remains unchanged.'},
 tom:{control:'Microsoft Entra admin center · Users and groups',portal:'users',observe:'Compare Tom’s contract end, enabled state, assignments and workflow history using current tenant evidence.',change:'Preview removal from the prepared ZZ-DEMO-AI-Replay group as a safe rehearsal of stale-access cleanup.',verify:'Confirm the membership is absent and capture the directory audit result. Do not disable the account for this rehearsal.',undo:'Add Tom back to the prepared group, refresh the user and verify the restored starting state.'},
 kwame:{control:'Microsoft Entra admin center · Users and groups',portal:'users',observe:'Assemble current state, workflow history and audit evidence into one offboarding timeline.',change:'Preview removal from ZZ-DEMO-AI-Replay to represent one bounded entitlement-removal action.',verify:'Confirm the group is absent and add the directory event to the evidence timeline.',undo:'Restore the prepared membership, verify it, and retain both audit events as proof of the rehearsal.'}
};

const steps=[
 {label:'Observe',tag:'LIVE TENANT READ',tone:'live',title:'Ground the story in current tenant evidence',body:(a,r)=>r.observe,proof:'The private Identity Agents application reads Microsoft Graph in read-only mode. Ask it to cite the user, object state and records behind every conclusion.'},
 {label:'Reason',tag:'AI EXPLANATION',tone:'ai',title:'Make the recommendation inspectable',body:a=>`${a.output} The answer must distinguish observed facts, inferences and missing information.`,proof:'Challenge the result in front of the client: “What evidence supports this, what are you unsure about, and what would change your recommendation?”'},
 {label:'Preview',tag:'NO CHANGE YET',tone:'preview',title:'Show the exact change before approval',body:(a,r)=>r.change,proof:'State the target object, action, expected effect, blast radius and inverse action. A proposal is never displayed as a completed change.'},
 {label:'Approve + apply',tag:'HUMAN CONTROL',tone:'approve',title:'Apply only through the authorized Microsoft control',body:(a,r)=>`Open ${r.control}. Confirm the prepared demo identity and group, obtain the presenter’s approval, then perform only the previewed action.`,proof:'The public workshop holds no Graph secret and cannot write to the tenant. The operator stays signed in, visible and accountable.'},
 {label:'Verify',tag:'TENANT PROOF',tone:'verify',title:'Prove the outcome in Entra',body:(a,r)=>r.verify,proof:'Refresh the resource, inspect the directory audit log and compare the observed result with the predicted result. Record any mismatch instead of hiding it.'},
 {label:'Undo + replay',tag:'REVERSIBLE DEMO',tone:'undo',title:'Return to the known starting state',body:(a,r)=>r.undo,proof:'Verify the reversal in the tenant, then reset this console. The two audit events become a useful demonstration of human authorization and traceability.'}
];

const key=(person,moment)=>`${person}:${moment}`;
const stateFor=(person,moment)=>runState.get(key(person,moment))||{step:0,visited:new Set([0])};

function agentUrl(p,m,a,index){
 const prompt=`${p.name}: ${m.title}. ${a.moments[index]} Read the connected tenant, cite evidence, identify uncertainty, and propose a reversible next action. Do not claim that a change executed.`;
 return `${AGENTS}/identity?case=${encodeURIComponent(prompt)}#run`;
}

function consoleView(person,moment,a,r){
 const s=stateFor(person,moment),current=steps[s.step];
 return `<section class="ai-run-console" data-ai-person="${person}" data-ai-moment="${moment}">
  <div class="ai-run-head"><div><span class="ai-kicker">TENANT OPERATOR · GUIDED RUN</span><h4>Observe → decide → change → prove → restore</h4></div><span class="ai-run-count">${String(s.step+1).padStart(2,'0')} / 06</span></div>
  <div class="ai-run-grid"><nav class="ai-run-rail" aria-label="AI demonstration workflow">${steps.map((x,i)=>`<button data-ai-run="select" data-ai-step="${i}" class="${i===s.step?'active':''} ${s.visited.has(i)?'visited':''}" aria-current="${i===s.step?'step':'false'}"><span>${String(i+1).padStart(2,'0')}</span><b>${escape(x.label)}</b><small>${i<s.step?'Reviewed':i===s.step?'Current':'Next'}</small></button>`).join('')}</nav>
  <article class="ai-run-detail" data-tone="${current.tone}"><div class="ai-detail-tag"><i></i>${escape(current.tag)}</div><h5>${escape(current.title)}</h5><p>${escape(current.body(a,r))}</p><div class="ai-proof"><span>WHAT TO SHOW</span><strong>${escape(current.proof)}</strong></div><div class="ai-controls"><button class="outline" data-ai-run="previous" ${s.step===0?'disabled':''}>← Previous</button><button class="primary" data-ai-run="next">${s.step===steps.length-1?'Reset and do it again':'Mark reviewed · continue →'}</button></div></article></div>
 </section>`;
}

function liveConsoleView(person,moment,a,r){
 const s=stateFor(person,moment),current=steps[s.step];
 return `<section class="live-ai-console" data-ai-person="${person}" data-ai-moment="${moment}">
  <div class="live-ai-progress"><span>${escape(current.tag)}</span><strong>${s.step+1} / ${steps.length}</strong></div>
  <nav class="live-ai-steps" aria-label="AI copilot workflow">${steps.map((x,i)=>`<button type="button" data-ai-run="select" data-ai-step="${i}" class="${i===s.step?'active':''} ${s.visited.has(i)?'visited':''}" aria-label="${escape(x.label)}" aria-current="${i===s.step?'step':'false'}">${i+1}</button>`).join('')}</nav>
  <div class="live-ai-card"><span>AI COPILOT · ${escape(current.label)}</span><h4>${escape(current.title)}</h4><p>${escape(current.body(a,r))}</p><div><b>Show the client</b>${escape(current.proof)}</div></div>
  <div class="live-ai-controls"><button type="button" data-ai-run="previous" ${s.step===0?'disabled':''}>← Previous</button><button type="button" data-ai-run="next">${s.step===steps.length-1?'Reset and replay':'Continue →'}</button></div>
 </section>`;
}

export function liveAiPanel(p,index){
 const m=p.moments[index],a=aiStories[p.id],r=recipes[p.id];
 return `<div class="live-ai-panel"><div class="live-ai-heading"><span>AI + LIVE TENANT</span><h4>${escape(p.name)} · ${escape(m.short)}</h4><p>Keep the agent, Microsoft control and client explanation together while the live desktops remain visible.</p></div>${liveConsoleView(p.id,index,a,r)}<div class="live-ai-actions"><a href="${agentUrl(p,m,a,index)}" target="_blank" rel="noopener noreferrer"><b>Run tenant analysis ↗</b><span>Private agent · live Graph read</span></a><a href="${escape(URLS[r.portal])}" target="_blank" rel="noopener noreferrer"><b>Open Microsoft control ↗</b><span>Apply, verify and undo</span></a><a href="./#${p.id}/${index+1}/ai" target="_blank" rel="noopener noreferrer"><b>Open the full AI story ↗</b><span>Prompt, controls and rehearsal setup</span></a></div><p class="live-ai-boundary">The agent reads the tenant. An authorized human applies and reverses the prepared change in Entra. Advancing this guide never changes the tenant.</p></div>`;
}

export function aiContent(p,m,index){
 const a=aiStories[p.id],r=recipes[p.id];
 return `<div class="ai-operator">
  <header class="ai-hero"><div><span class="ai-label">AI IN THE FLOW OF WORK · ${escape(p.name)}</span><h3>${escape(a.title)}</h3><p>${escape(a.benefit)}</p></div><div class="ai-capabilities"><span><i></i>Live Graph read</span><span>Azure OpenAI reasoning</span><span>Human approval</span><span>Reversible rehearsal</span></div></header>
  <section class="ai-moment-focus"><div><span>THIS MOMENT · ${escape(m.short)}</span><strong>${escape(a.moments[index])}</strong></div><p><b>Decision owner</b>${escape(a.decision)}</p></section>
  ${consoleView(p.id,index,a,r)}
  <div class="ai-launch-grid"><a class="ai-launch-card agent" href="${agentUrl(p,m,a,index)}" target="_blank" rel="noopener noreferrer"><span>01 · PRIVATE AGENT</span><strong>Run tenant-connected analysis ↗</strong><p>Use the signed-in Identity Agents app to read current Microsoft Graph evidence and generate a cited recommendation.</p></a><a class="ai-launch-card portal" href="${escape(URLS[r.portal])}" target="_blank" rel="noopener noreferrer"><span>02 · MICROSOFT CONTROL</span><strong>Open ${escape(r.control)} ↗</strong><p>Apply, verify and reverse the approved rehearsal while the client watches the tenant state change.</p></a></div>
  <details class="ai-script"><summary>Presenter script and example prompt</summary><blockquote>“For ${escape(p.name)}, focus on ${escape(m.short.toLowerCase())}. ${escape(a.moments[index])} Use current tenant evidence, cite the records, separate facts from inference, preview one bounded reversible action, and give me the exact verification and undo steps.”</blockquote><div class="ai-boundary"><b>Live boundary</b><span>The private agent reads the connected tenant. This public workshop stores no tenant credential and performs no write. Apply and undo stay behind Microsoft authorization and a visible human decision.</span></div></details>
  <div class="ai-demo-prereq"><b>One-time rehearsal setup</b><span>Prepare a non-production user and the unassigned <code>ZZ-DEMO-AI-Replay</code> security group. Capture the starting membership before the session. Never use a production entitlement, account disablement, credential reset or Conditional Access enforcement as the reversible stage demo.</span></div>
 </div>`;
}

document.addEventListener('click',event=>{
 const button=event.target.closest('[data-ai-run]');
 if(!button)return;
 const console=button.closest('.ai-run-console,.live-ai-console');
 if(!console)return;
 const person=console.dataset.aiPerson,moment=Number(console.dataset.aiMoment),a=aiStories[person],r=recipes[person];
 const current=stateFor(person,moment);
 if(button.dataset.aiRun==='select')current.step=Number(button.dataset.aiStep);
 if(button.dataset.aiRun==='previous')current.step=Math.max(0,current.step-1);
 if(button.dataset.aiRun==='next'){
  if(current.step===steps.length-1){current.step=0;current.visited=new Set([0]);}
  else current.step++;
 }
 current.visited.add(current.step);
 runState.set(key(person,moment),current);
 const view=console.classList.contains('live-ai-console')?liveConsoleView:consoleView;
 const replacement=document.createRange().createContextualFragment(view(person,moment,a,r));
 console.replaceWith(replacement);
 document.querySelector(`.ai-run-console[data-ai-person="${person}"][data-ai-moment="${moment}"] [data-ai-run="select"][data-ai-step="${current.step}"],.live-ai-console[data-ai-person="${person}"][data-ai-moment="${moment}"] [data-ai-run="select"][data-ai-step="${current.step}"]`)?.focus();
});
