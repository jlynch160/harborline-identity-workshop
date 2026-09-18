import {remoteConfig} from './remote-config.js';

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
      <div class="remote-heading"><span class="eyebrow">Real Entra · remote desktop</span><h2 id="remote-title">Your Entra workspace</h2></div>
      <div class="remote-controls">
        <button class="outline" type="button" data-remote="expand">Full screen</button>
        <button class="quiet" type="button" data-remote="disconnect" disabled>Disconnect</button>
        <button class="primary" type="button" data-remote="close">Back to the story</button>
      </div>
    </header>
    <div class="remote-context"><span id="remote-context-label"></span><span class="remote-status" id="remote-status" role="status">Connection not configured</span></div>
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
    <footer class="remote-footer"><span id="remote-help">Sign in to the remote desktop, then open Microsoft Entra in its browser.</span><button class="quiet" type="button" data-remote="help">Session help</button></footer>
    <div class="remote-help" id="remote-help-panel" hidden>
      <h3>Using your Entra workspace</h3>
      <p>Sign in to the protected gateway and your Windows demo desktop. Open Edge on that desktop and sign in to Entra normally.</p>
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
  const expandButton = root.querySelector('[data-remote="expand"]');
  const disconnectButton = root.querySelector('[data-remote="disconnect"]');
  const connectButton = root.querySelector('[data-remote="connect"]');
  try { gateway = validateGateway(remoteConfig.gatewayUrl); }
  catch { status.textContent = 'Gateway configuration needs attention'; }
  if (gateway) {
    status.textContent = 'Not connected';
    root.querySelector('#remote-welcome-title').textContent = 'Open your real Entra workspace.';
    root.querySelector('#remote-welcome-copy').textContent = 'Sign in to your protected demo desktop. Your mouse and keyboard will control its browser directly from here.';
    connectButton.disabled = false;
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
  }
  function connect() {
    if (!gateway || frame) return;
    frame = document.createElement('iframe');
    frame.id = 'entra-session-frame';
    frame.title = 'Protected Harborline remote desktop running Microsoft Entra';
    frame.referrerPolicy = 'no-referrer';
    frame.setAttribute('allow', 'fullscreen');
    frame.setAttribute('allowfullscreen', '');
    // Only the specifically configured, authenticated gateway is loaded here.
    // No Entra page, authentication token or remote password is proxied by this site.
    frame.src = gateway;
    status.textContent = 'Opening protected gateway…';
    welcome.hidden = true;
    disconnectButton.disabled = false;
    frame.addEventListener('load', () => {
      clearTimeout(loadTimer);
      status.textContent = 'Gateway page opened · complete sign-in inside';
    });
    frame.addEventListener('error', () => {
      clearTimeout(loadTimer);
      status.textContent = 'Gateway could not load · see Session help';
    });
    root.querySelector('#remote-display').append(frame);
    loadTimer = setTimeout(() => { status.textContent = 'Still waiting for the gateway · see Session help'; }, 20000);
  }
  function disconnect() {
    clearTimeout(loadTimer);
    frame?.remove();
    frame = null;
    welcome.hidden = false;
    disconnectButton.disabled = true;
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
    root.querySelector('[data-remote="close"]').focus();
  }
  root.addEventListener('click', e => {
    const action = e.target.closest('[data-remote]')?.dataset.remote;
    if (action === 'expand') void expand();
    if (action === 'close') void close();
    if (action === 'connect') connect();
    if (action === 'disconnect') disconnect();
    if (action === 'help') help.hidden = !help.hidden;
  });
  document.addEventListener('fullscreenchange', syncFullscreen);
  document.addEventListener('keydown', e => {
    if (!active) return;
    if (e.key === 'Escape' && !fullscreenActive()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (!help.hidden) help.hidden = true;
      else if (root.classList.contains('remote-maximized')) {root.classList.remove('remote-maximized');syncFullscreen();}
      else void close();
    }
    if (e.key === 'Tab') {
      const controls = [...root.querySelectorAll('button:not(:disabled),iframe')].filter(el => el.getClientRects().length);
      if (controls.length && e.shiftKey && document.activeElement === controls[0]) {e.preventDefault();controls.at(-1).focus();}
      else if (controls.length && !e.shiftKey && document.activeElement === controls.at(-1)) {e.preventDefault();controls[0].focus();}
    }
  }, true);
  return {open, isOpen: () => active, configured: () => Boolean(gateway), setContext(name, moment) {
    root.querySelector('#remote-context-label').textContent = `${name} · ${moment}`;
  }};
}
