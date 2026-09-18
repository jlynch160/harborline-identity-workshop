import {remoteConfig} from './remote-config.js';
import {people} from './data.js';

export function validateGateway(value) {
  if (!value) return null;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search) {
    throw new Error('The remote gateway must use HTTPS without credentials or query parameters.');
  }
  if (['entra.microsoft.com', 'login.microsoftonline.com', 'portal.azure.com'].includes(url.hostname)) {
    throw new Error('Use the authenticated remote desktop gateway, not a Microsoft portal iframe.');
  }
  return url.href;
}

export function createRemoteSession() {
  // This element stays outside the application's replaceable story markup.
  // Expanding, closing and navigating stories must never recreate its iframe.
  const root = document.createElement('section');
  root.id = 'remote-workspace';
  root.className = 'remote-workspace';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'remote-title');
  root.innerHTML = `
    <header class="remote-toolbar">
      <div class="remote-heading"><img src="./assets/majorkey-logo.svg" alt="MajorKey" width="120" height="24"><div><span class="eyebrow">IDENTITY IN ACTION · GUIDED LAB</span><h2 id="remote-title">Your Entra workspace</h2></div></div>
      <div class="remote-controls">
        <button class="outline remote-guide-toggle" type="button" data-remote="guide" aria-expanded="true" aria-controls="remote-guide">Hide guide</button>
        <button class="outline" type="button" data-remote="focus" disabled>Focus desktop</button>
        <button class="outline" type="button" data-remote="expand">Full screen</button>
        <button class="quiet" type="button" data-remote="disconnect" disabled>Disconnect</button>
        <button class="primary" type="button" data-remote="close">Back to the story</button>
      </div>
    </header>
    <div class="remote-context"><span id="remote-context-label"></span><span class="remote-status" id="remote-status" role="status">Connection not configured</span></div>
    <div class="remote-stage">
    <div class="remote-display" id="remote-display">
      <div class="remote-welcome" id="remote-welcome">
        <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="7" width="36" height="26" rx="3"/><path d="M24 33v9m-9 0h18m-11-24 7 4-7 4z"/></svg>
        <div class="eyebrow">Your tenant. Your browser. In the workshop.</div>
        <h3 id="remote-welcome-title">The Entra connection is being prepared.</h3>
        <p id="remote-welcome-copy">The fullscreen stage is ready. A protected gateway must be connected to your demo VM before the real portal can appear here.</p>
        <button class="primary" type="button" data-remote="connect" disabled>Open protected session</button>
        <p class="remote-fineprint">The workshop’s public link never grants access to the remote desktop.</p>
      </div>
    </div>
    <footer class="remote-footer"><span id="remote-help">Sign in to the remote desktop, then open Microsoft Entra in its browser.</span><div class="remote-footer-actions"><a class="quiet" id="remote-direct" target="_blank" rel="noopener noreferrer" hidden>Open in separate tab ↗</a><button class="quiet" type="button" data-remote="help">Session help</button></div></footer>
    <aside class="remote-guide" id="remote-guide" aria-labelledby="remote-guide-title">
      <header class="remote-guide-header"><div><span class="eyebrow">YOUR DEMO COMPANION</span><h3 id="remote-guide-title">Steps &amp; why</h3></div><button class="quiet" type="button" data-remote="guide-close" aria-label="Close steps and why">✕</button></header>
      <div class="lab-tabs" role="tablist" aria-label="Lab companion"><button role="tab" id="lab-tab-guide" data-lab-tab="guide" aria-selected="true" aria-controls="lab-panel-guide">Guide</button><button role="tab" id="lab-tab-vm" data-lab-tab="vm" aria-selected="false" aria-controls="lab-panel-vm" tabindex="-1">VM</button><button role="tab" id="lab-tab-info" data-lab-tab="info" aria-selected="false" aria-controls="lab-panel-info" tabindex="-1">Lab info</button></div>
      <div class="lab-picker"><label for="lab-moment">Day in the life</label><select id="lab-moment"></select></div>
      <div class="remote-guide-content" id="remote-guide-content"></div>
      <div class="remote-guide-foot"><div class="lab-progress-label"><span>Steps checked · this moment</span><strong id="lab-progress-count">0 / 7</strong></div><progress id="lab-progress" value="0" max="7" aria-label="Manually checked steps"></progress><div class="lab-pagination"><button type="button" data-remote="lab-prev">← Previous</button><span id="lab-page"></span><button type="button" data-remote="lab-next">Next →</button></div><small>Progress reflects your checklist, not tenant verification.</small></div>
    </aside>
    </div>
    <div class="remote-help" id="remote-help-panel" hidden>
      <h3>Using your Entra workspace</h3>
      <p>Sign in to the protected gateway and your Windows demo desktop. Open Edge on that desktop and sign in to Entra normally.</p>
      <p><strong>Keyboard not responding?</strong> Select <strong>Focus desktop</strong>, then click the text field inside Windows. You can also use <strong>Open in separate tab</strong> to use the gateway directly. The same gateway sign-in is required.</p>
      <p><strong>Full screen</strong> expands this same session. Use the browser’s Escape key to leave fullscreen, then <strong>Back to the story</strong> to resume the workshop.</p>
      <p><strong>Back to the story</strong> hides the desktop without ending the connection. <strong>Disconnect</strong> closes this view; it does not sign you out of Windows or Microsoft. Sign out inside the desktop when the demonstration is over.</p>
      <p>If the screen remains blank, the gateway may be unavailable or may not allow this workshop to frame it. A loaded page alone does not confirm an RDP connection.</p>
      <button class="outline" type="button" data-remote="help">Close help</button>
    </div>`;
  document.body.append(root);
  let frame = null;
  let previousFocus = null;
  let active = false;
  let loadTimer = null;
  let gateway = null;
  const app = document.getElementById('app');
  const status = root.querySelector('#remote-status');
  const welcome = root.querySelector('#remote-welcome');
  const help = root.querySelector('#remote-help-panel');
  // Keep the footer outside the split stage, without touching the desktop node.
  root.querySelector('.remote-stage').after(root.querySelector('.remote-footer'));
  const guide = root.querySelector('#remote-guide');
  const guideButton = root.querySelector('[data-remote="guide"]');
  const labMoments = people.flatMap((p,personIndex)=>p.moments.map((m,momentIndex)=>({name:p.name,title:m.short,personIndex,momentIndex})));
  const checkedSteps = new Map();
  let guideKey = '', labIndex = 0, labTab = 'guide';
  const momentSelect = root.querySelector('#lab-moment');
  labMoments.forEach((m,i)=>{const option=document.createElement('option');option.value=i;option.textContent=`${m.name} · ${m.title}`;momentSelect.append(option);});
  function navigateLab(index) {
    const m=labMoments[index]; if(!m)return;
    document.dispatchEvent(new CustomEvent('workshop-lab-navigate',{detail:m}));
  }
  function selectLabTab(tab) {
    labTab=tab;
    root.querySelectorAll('[data-lab-tab]').forEach(button=>{const selected=button.dataset.labTab===tab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
    root.querySelectorAll('[data-lab-panel]').forEach(panel=>{panel.hidden=panel.dataset.labPanel!==tab;});
  }
  function updateProgress() {
    const boxes=[...guide.querySelectorAll('[data-lab-step]')],done=boxes.filter(box=>box.checked).length;
    root.querySelector('#lab-progress-count').textContent=`${done} / ${boxes.length}`;
    const progress=root.querySelector('#lab-progress');progress.max=boxes.length||1;progress.value=done;
  }
  root.addEventListener('change',e=>{
    if(e.target===momentSelect)navigateLab(Number(momentSelect.value));
    if(e.target.matches('[data-lab-step]')){const set=checkedSteps.get(guideKey)||new Set();e.target.checked?set.add(e.target.dataset.labStep):set.delete(e.target.dataset.labStep);checkedSteps.set(guideKey,set);updateProgress();}
  });
  root.querySelector('.lab-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const ids=['guide','vm','info'];let i=ids.indexOf(labTab);i=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;selectLabTab(ids[i]);root.querySelector(`[data-lab-tab="${ids[i]}"]`).focus();});
  function toggleGuide(show) {
    guide.hidden = !show;
    guideButton.setAttribute('aria-expanded', String(show));
    guideButton.textContent = show ? 'Hide guide' : 'Show guide';
    if (show) { help.hidden = true; guide.querySelector('button').focus(); }
    else if (frame) focusDesktop();
    else guideButton.focus();
  }
  const expandButton = root.querySelector('[data-remote="expand"]');
  const disconnectButton = root.querySelector('[data-remote="disconnect"]');
  const connectButton = root.querySelector('[data-remote="connect"]');
  const focusButton = root.querySelector('[data-remote="focus"]');
  const directLink = root.querySelector('#remote-direct');
  try { gateway = validateGateway(remoteConfig.gatewayUrl); }
  catch { status.textContent = 'Gateway configuration needs attention'; }
  if (gateway) {
    status.textContent = 'Not connected';
    root.querySelector('#remote-welcome-title').textContent = 'Open your real Entra workspace.';
    root.querySelector('#remote-welcome-copy').textContent = 'Sign in to your protected demo desktop. Your mouse and keyboard will control its browser directly from here.';
    connectButton.disabled = false;
    directLink.href = gateway;
    directLink.hidden = false;
  }
  // Guacamole documents that clicking a cross-origin frame may not restore its
  // keyboard focus. Recover at workspace transitions, with a manual fallback.
  // https://guacamole.apache.org/faq/#i-want-to-put-guacamole-in-an-iframe-but-keyboard-doesnt-work-correctly
  function focusDesktop() {
    if (!active || !frame || !help.hidden) return;
    frame.focus({preventScroll: true});
  }
  function refocusWhenUnclaimed() {
    const focused = document.activeElement;
    if (!focused || focused === document.body || focused === root) focusDesktop();
  }
  const fullscreenActive = () => document.fullscreenElement === root;
  function syncFullscreen() {
    expandButton.textContent = fullscreenActive() || root.classList.contains('remote-maximized') ? 'Exit full screen' : 'Full screen';
    expandButton.setAttribute('aria-pressed', String(fullscreenActive() || root.classList.contains('remote-maximized')));
  }
  async function expand() {
    if (fullscreenActive()) await document.exitFullscreen();
    else if (root.classList.contains('remote-maximized')) root.classList.remove('remote-maximized');
    else {
      try {
        if (!root.requestFullscreen || !document.fullscreenEnabled) throw new Error('Fullscreen unavailable');
        await root.requestFullscreen();
      } catch {
        root.classList.add('remote-maximized');
        root.querySelector('#remote-help').textContent = 'Expanded to the browser window. Use Exit full screen to restore the stage.';
      }
    }
    syncFullscreen();
    requestAnimationFrame(focusDesktop);
  }
  function connect() {
    if (!gateway || frame) return;
    frame = document.createElement('iframe');
    frame.id = 'entra-session-frame';
    frame.title = 'Protected Harborline remote desktop running Microsoft Entra';
    frame.tabIndex = 0;
    frame.referrerPolicy = 'no-referrer';
    frame.setAttribute('allow', 'fullscreen');
    frame.setAttribute('allowfullscreen', '');
    // Only the specifically configured, authenticated gateway is loaded here.
    // No Entra page, authentication token or remote password is proxied by this site.
    frame.src = gateway;
    status.textContent = 'Opening protected gateway…';
    welcome.hidden = true;
    disconnectButton.disabled = false;
    focusButton.disabled = false;
    frame.addEventListener('load', () => {
      clearTimeout(loadTimer);
      status.textContent = 'Gateway page opened · complete sign-in inside';
      requestAnimationFrame(focusDesktop);
    });
    frame.addEventListener('error', () => {
      clearTimeout(loadTimer);
      status.textContent = 'Gateway could not load · see Session help';
    });
    root.querySelector('#remote-display').append(frame);
    focusDesktop();
    loadTimer = setTimeout(() => { status.textContent = 'Still waiting for the gateway · see Session help'; }, 20000);
  }
  function disconnect() {
    clearTimeout(loadTimer);
    frame?.remove();
    frame = null;
    welcome.hidden = false;
    disconnectButton.disabled = true;
    focusButton.disabled = true;
    status.textContent = gateway ? 'View disconnected · desktop sign-in may remain active' : 'Connection not configured';
  }
  async function close() {
    if (fullscreenActive()) await document.exitFullscreen().catch(() => {});
    root.classList.remove('remote-maximized');
    syncFullscreen();
    root.hidden = true;
    active = false;
    app.inert = false;
    document.body.classList.remove('remote-open');
    if (previousFocus?.isConnected) previousFocus.focus();
    else document.querySelector('[data-action="remote"]')?.focus();
  }
  function open() {
    previousFocus = document.activeElement;
    active = true;
    root.hidden = false;
    app.inert = true;
    document.body.classList.add('remote-open');
    if (frame && help.hidden) focusDesktop();
    else root.querySelector('[data-remote="close"]').focus();
  }
  root.addEventListener('click', e => {
    const labTarget=e.target.closest('[data-lab-tab]');if(labTarget)selectLabTab(labTarget.dataset.labTab);
    const action = e.target.closest('[data-remote]')?.dataset.remote;
    if(action==='lab-prev')navigateLab(labIndex-1);
    if(action==='lab-next')navigateLab(labIndex+1);
    if (action === 'expand') void expand();
    if (action === 'close') void close();
    if (action === 'connect') connect();
    if (action === 'disconnect') disconnect();
    if (action === 'focus') {help.hidden = true;focusDesktop();}
    if (action === 'guide') toggleGuide(guide.hidden);
    if (action === 'guide-close') toggleGuide(false);
    if (action === 'help') {
      help.hidden = !help.hidden;
      if (help.hidden) focusDesktop();
      else help.querySelector('button').focus();
    }
  });
  document.addEventListener('fullscreenchange', () => {syncFullscreen();requestAnimationFrame(focusDesktop);});
  document.addEventListener('click', refocusWhenUnclaimed);
  window.addEventListener('focus', refocusWhenUnclaimed);
  document.addEventListener('keydown', e => {
    if (!active) return;
    refocusWhenUnclaimed();
    if (e.key === 'Escape' && !fullscreenActive()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (!help.hidden) {help.hidden = true;focusDesktop();}
      else if (!guide.hidden) toggleGuide(false);
      else if (root.classList.contains('remote-maximized')) {root.classList.remove('remote-maximized');syncFullscreen();}
      else void close();
    }
    if (e.key === 'Tab') {
      const controls = [...root.querySelectorAll('button:not(:disabled),a[href],iframe,summary,input,select')].filter(el => el.tabIndex!==-1 && el.getClientRects().length);
      if (controls.length && e.shiftKey && document.activeElement === controls[0]) {e.preventDefault();controls.at(-1).focus();}
      else if (controls.length && !e.shiftKey && document.activeElement === controls.at(-1)) {e.preventDefault();controls[0].focus();}
    }
  }, true);
  const escapeGuide = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const guideSteps = steps => `<ol>${steps.map(step => `<li><p class="guide-do">${escapeGuide(step.action)}</p><div class="guide-step-detail"><strong>Why</strong><p>${escapeGuide(step.why)}</p><strong>Look for / explain</strong><p>${escapeGuide(step.look)}</p></div></li>`).join('')}</ol>`;
  return {open, isOpen: () => active, configured: () => Boolean(gateway), setGuide(g) {
    guideKey=`${g.name}:${g.time}:${g.title}`;
    labIndex=labMoments.findIndex(m=>m.name===g.name && people[m.personIndex].moments[m.momentIndex].title===g.title);
    momentSelect.value=String(labIndex);
    root.querySelector('#lab-page').textContent=`${labIndex+1} / ${labMoments.length}`;
    root.querySelector('[data-remote="lab-prev"]').disabled=labIndex===0;
    root.querySelector('[data-remote="lab-next"]').disabled=labIndex===labMoments.length-1;
    root.querySelector('#remote-title').textContent=`${g.name} · ${labMoments[labIndex]?.title||g.title}`;
    root.querySelector('#remote-guide-content').innerHTML = `
      <div class="guide-moment"><span class="guide-perspective">${escapeGuide(g.perspective)}</span><p class="guide-person">${escapeGuide(g.time)} · ${escapeGuide(g.name)} · ${escapeGuide(g.job)}</p><h4>${escapeGuide(g.title)}</h4></div>
      <section class="guide-why"><h4>A day in ${escapeGuide(g.name.split(' ')[0])}’s life</h4><p>${escapeGuide(g.story)}</p><p>${escapeGuide(g.why)}</p></section>
      <details class="guide-section"><summary>Use cases in this moment <span>${g.cases.length}</span></summary><ul class="guide-case-list">${g.cases.map(c=>`<li><strong>UC ${c.id} · ${escapeGuide(c.title)}</strong><p>${escapeGuide(c.description)}</p></li>`).join('')}</ul></details>
      <details class="guide-section"><summary>Sign-in &amp; preparation</summary><div class="guide-login"><h4>1 · Protected gateway</h4><p>Use your existing Apache Guacamole username, password and authenticator code. This opens the connection chooser; it is separate from Windows and Microsoft sign-in.</p><h4>2 · Windows demo desktop</h4><dl><dt>VM</dt><dd>hl-frontline-01</dd><dt>Username</dt><dd>hladmin</dd><dt>Domain / computer</dt><dd>HL-FRONT-01</dd><dt>Windows sign-in</dt><dd>HL-FRONT-01\\hladmin</dd><dt>Password</dt><dd>Use the existing private VM credential. It is not stored on this public page.</dd></dl><p>For separate Username / Password / Domain fields, enter hladmin and HL-FRONT-01 in their respective fields. This local Windows account opens the desktop; it does not sign you into Entra. Sam’s kiosk walkthrough needs the separately prepared kiosk.</p><h4>3 · ${escapeGuide(g.name)}’s Microsoft session</h4><dl><dt>Username</dt><dd>${escapeGuide(g.account)}</dd><dt>Account domain</dt><dd>${escapeGuide(g.domain)}</dd><dt>Password / MFA</dt><dd>Use this persona’s existing private credential and configured authentication method. A Temporary Access Pass is used only when prepared for that registration scenario.</dd></dl><p>Inside the VM, use a separate browser profile or InPrivate window for this persona. Open myapplications.microsoft.com. Microsoft sign-in normally takes the complete username; do not enter the Windows computer name as its domain.</p><h4>4 · Administrator session</h4><p>Use your prepared Harborline administrator browser profile at entra.microsoft.com. Confirm its signed-in account, directory and required role. The persona account does not automatically have administrator permissions.</p><p class="guide-password-note">Passwords belong in your private presenter credential sheet or vault. A hidden field on a public website would still expose them.</p></div></details>
      <details class="guide-section guide-actions" ${g.perspective==='Admin view'?'open':''}><summary>Admin walkthrough <span>${g.admin.length} steps</span></summary>${guideSteps(g.admin)}</details>
      <details class="guide-section guide-actions" ${g.perspective==='User view'?'open':''}><summary>${escapeGuide(g.name.split(' ')[0])}’s experience <span>${g.user.length} steps</span></summary><p class="guide-user-title">${escapeGuide(g.userTitle)}</p>${guideSteps(g.user)}</details>
      <section class="guide-proof"><h4>What to verify</h4><p>${escapeGuide(g.evidence)}</p></section>
      <details class="guide-section"><summary>Presenter notes &amp; fallback</summary><p>${escapeGuide(g.caution)}</p><p>If a screen, assignment or device is unavailable, show the prepared configuration and identify the missing live proof. Menu names can vary; use the portal search to find the named service.</p><h4>Ask the room</h4><p>${escapeGuide(g.question)}</p></details>
      <details class="guide-section"><summary>Microsoft reference guides</summary><div class="guide-references"><a href="https://learn.microsoft.com/en-us/entra/id-governance/what-are-lifecycle-workflows" target="_blank" rel="noopener noreferrer">Lifecycle workflows ↗</a><a href="https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-request-access" target="_blank" rel="noopener noreferrer">Request an access package ↗</a><a href="https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-temporary-access-pass" target="_blank" rel="noopener noreferrer">Temporary Access Pass ↗</a><a href="https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-sign-in-log-activity-details" target="_blank" rel="noopener noreferrer">Read sign-in evidence ↗</a><a href="https://learn.microsoft.com/en-us/autopilot/profiles" target="_blank" rel="noopener noreferrer">Autopilot profiles ↗</a></div></details>`;
    const content=root.querySelector('#remote-guide-content');
    const children=[...content.children],panels={};
    for(const id of ['guide','vm','info']){const panel=document.createElement('div');panel.id=`lab-panel-${id}`;panel.dataset.labPanel=id;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',`lab-tab-${id}`);panel.tabIndex=0;panels[id]=panel;content.append(panel);}
    children.forEach(child=>{const title=child.querySelector('summary')?.textContent||'';const target=title==='Sign-in & preparation'?'vm':title.startsWith('Use cases')||title.startsWith('Presenter notes')||title.startsWith('Microsoft reference')?'info':'guide';panels[target].append(child);if(child.tagName==='DETAILS'&&target!=='guide')child.open=true;});
    panels.vm.insertAdjacentHTML('afterbegin','<div class="lab-panel-intro"><h4>Your lab environment</h4><p>The live desktop stays open as you read. Use Focus desktop to return keyboard input to Windows.</p></div>');
    panels.info.insertAdjacentHTML('afterbegin','<div class="lab-panel-intro"><h4>Lab information</h4><p>Six people · 22 moments · 8-hour workshop</p></div>');
    guide.querySelectorAll('.guide-actions li').forEach((item,i)=>{const box=document.createElement('input');box.type='checkbox';box.dataset.labStep=String(i);box.checked=checkedSteps.get(guideKey)?.has(String(i))||false;box.setAttribute('aria-label',`Mark step complete: ${item.querySelector('.guide-do').textContent}`);item.prepend(box);});
    selectLabTab(labTab);updateProgress();content.scrollTop=0;
  }, setContext(name, moment, perspective = 'Admin view', account = 'Harborline administrator') {
    root.querySelector('#remote-context-label').textContent = `${perspective} · ${name} · ${moment}`;
    root.querySelector('#remote-help').textContent = `Use the ${perspective === 'User view' ? 'separate persona' : 'administrator'} browser profile: ${account}. This view does not change the signed-in account.`;
  }};
}
