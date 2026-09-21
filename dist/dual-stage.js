import {focusRemoteWindow,watchRemoteFocus} from './desktop-focus.js';
import {AGENTS} from './data.js';

// Three protected surfaces. Layout changes hide panes without recreating a connected frame.
export function installDualStage(root,config,validateGateway,onUserFocus,onAdminFocus){
 const display=root.querySelector('#remote-display');
 const admin=document.createElement('section');admin.id='stage-admin';admin.className='stage-pane';admin.setAttribute('aria-label','Administrator desktop');
 admin.innerHTML='<header class="pane-toolbar"><div><span class="pane-role">SCREEN 1 · CONTROL</span><strong>Administrator workspace</strong><small>Configure identity, policy and access in Microsoft Entra</small></div><button type="button" data-remote="focus">Present screen 1</button></header>';display.before(admin);admin.append(display);
 const user=document.createElement('section');user.id='stage-user';user.className='stage-pane';user.setAttribute('aria-label','User desktop');
 user.innerHTML=`<header class="pane-toolbar"><div><span class="pane-role">SCREEN 2 · EXPERIENCE</span><strong id="stage-user-name">User experience</strong><small id="stage-user-purpose">See the person’s sign-in and application outcome</small></div><button type="button" data-dual="user-focus" disabled>Present screen 2</button></header><div class="user-display"><div class="user-welcome"><span class="stage-tag">INDEPENDENT LIVE SESSION</span><h3>The other side of the story.</h3><p>Open the kiosk desktop and sign in with the persona’s Microsoft account in its browser.</p><button class="primary" type="button" data-dual="user-connect">Open user session</button><p class="session-note">Use the existing protected gateway sign-in. Windows credentials are requested inside the gateway.</p></div></div><footer class="pane-footer"><span id="user-session-status" role="status">Not connected</span><button type="button" data-dual="user-disconnect" disabled>Disconnect user</button><a id="user-session-direct" target="_blank" rel="noopener noreferrer">Separate tab ↗</a></footer>`;
 const ai=document.createElement('section');ai.id='stage-ai';ai.className='stage-pane';ai.setAttribute('aria-label','Identity AI copilot');
 ai.innerHTML=`<header class="pane-toolbar ai-pane-toolbar"><div><span class="pane-role">SCREEN 3 · ANALYSIS</span><strong id="stage-ai-name">AI copilot</strong><small>Read evidence, recommend, approve, verify and undo</small></div><button type="button" data-dual="ai-focus" disabled>Present screen 3</button></header><div class="ai-display"><div class="ai-welcome"><span class="stage-tag">PRIVATE TENANT AGENT</span><h3>Reason beside the control.</h3><p>Run the tenant-connected agent next to the administrator desktop, then hand the approved action to the admin side.</p><button class="primary" type="button" data-dual="ai-connect">Open live AI copilot</button><p class="session-note">The agent reads Microsoft Graph. Configuration execution remains human approved.</p></div></div><footer class="pane-footer ai-pane-footer"><span id="ai-session-status" role="status">Ready to open</span><button type="button" data-dual="ai-disconnect" disabled>Close AI</button><a id="ai-session-direct" target="_blank" rel="noopener noreferrer">Separate tab ↗</a></footer>`;
 admin.after(user);user.after(ai);

 const toolbar=document.createElement('div');toolbar.className='stage-layout-bar';
 toolbar.innerHTML='<div class="stage-view-buttons" role="group" aria-label="Demo layout"><button type="button" data-stage-view="admin" aria-pressed="false">1 · Admin</button><button type="button" data-stage-view="user" aria-pressed="false">2 · User</button><button type="button" data-stage-view="both" aria-pressed="true">1 + 2 · Side by side</button><button type="button" data-stage-view="ai" aria-pressed="false"><span aria-hidden="true">✦</span> 1 + 3 · Admin + AI</button></div><div class="stage-active-callout" aria-live="polite"><span>NOW PRESENTING</span><strong id="stage-active-title">Screen 1 · Administrator control</strong><small id="stage-active-purpose">Configure and verify the tenant</small></div><label class="stage-ratio">Panel balance <input type="range" min="35" max="70" value="56" aria-label="Administrator panel width"></label>';
 root.querySelector('.remote-context').after(toolbar);
 const steps=document.createElement('ol');steps.className='stage-milestones';steps.setAttribute('aria-label','Demonstration steps');toolbar.after(steps);

 let userFrame=null,aiFrame=null,stopUserFocus=null,stopAiFocus=null,userTimer=null,layout='both',userUrl=null,userSourceUrl=null,userSourceLabel='protected user desktop',userSourceKind='customer application',userIsLiveApp=false,userPersonName='User',agentUrl=AGENTS+'/identity',activeSide='admin';
 const panes={admin,user,ai},surfaces={admin:display,user:user.querySelector('.user-display'),ai:ai.querySelector('.ai-display')},shields={};
 const splitLayout=()=>layout==='both'||layout==='ai';
 const visible=side=>side==='admin'?layout!=='user':side==='user'?(layout==='user'||layout==='both'):layout==='ai';
 const layoutDescription=()=>layout==='ai'?'Administrator + AI · analyze, approve, apply, verify':layout==='both'?(userIsLiveApp?`Administrator + ${userSourceKind} · connected live application`:'Admin + user · separate protected desktops'):layout==='admin'?'Administrator workspace':(userIsLiveApp?userSourceKind:'User experience');

 for(const [side,pane] of Object.entries(panes)){
  const badge=document.createElement('span');badge.className='pane-state';badge.setAttribute('aria-live','polite');pane.querySelector('.pane-toolbar>div').append(badge);
  const shield=document.createElement('button');shield.type='button';shield.className='pane-shield';shield.setAttribute('aria-label',`Activate ${side==='admin'?'administrator':side==='user'?'user':'AI copilot'}`);
  shield.innerHTML=`<span class="shield-card"><span class="shield-role">${side==='admin'?'SCREEN 1 · CONTROL':side==='user'?'SCREEN 2 · EXPERIENCE':'SCREEN 3 · ANALYSIS'}</span><span class="shield-icon" aria-hidden="true">&#8599;</span><strong>Present the ${side==='admin'?'administrator':side==='user'?'person experience':'AI analysis'}</strong><small>${side==='admin'?'Configure and verify the tenant':side==='user'?'Show what the person sees and what the application allows': 'Read evidence, review the proposal, then hand approval to the administrator'}</small></span>`;
  surfaces[side].append(shield);shields[side]=shield;shield.addEventListener('click',()=>focusSide(side));
 }

 function setActive(side){
  if(!visible(side)){setLayout(side==='ai'?'ai':side);return;}
  activeSide=side;root.dataset.activeSide=side;
  for(const [key,pane] of Object.entries(panes)){
   const selected=key===side,isVisible=visible(key);pane.dataset.active=String(selected);shields[key].hidden=selected||!splitLayout()||!isVisible;
   pane.querySelector('.pane-state').textContent=!isVisible?'HIDDEN':selected?'ON AIR · ACTIVE':'DIMMED · STANDBY';
   for(const child of surfaces[key].children)if(child!==shields[key])child.inert=!selected&&splitLayout()&&isVisible;
  }
  const activeTitle=root.querySelector('#stage-active-title'),activePurpose=root.querySelector('#stage-active-purpose');
  if(side==='admin'){activeTitle.textContent='Screen 1 · Administrator control';activePurpose.textContent='Configure and verify identity, policy and access in Microsoft Entra';}
  if(side==='user'){activeTitle.textContent=`Screen 2 · ${userPersonName} experience`;activePurpose.textContent=userIsLiveApp?`Show the live ${userSourceKind} response and enforced outcome`:'Show the persona’s sign-in and desktop experience';}
  if(side==='ai'){activeTitle.textContent='Screen 3 · AI analysis';activePurpose.textContent='Read evidence, propose a bounded action, then return approval to screen 1';}
 }
 function focusSide(side){
  setActive(side);
  if(side==='admin'){onAdminFocus();if(!display.querySelector('iframe'))display.querySelector('button:not(.pane-shield)')?.focus();}
  if(side==='user'){onUserFocus();if(userFrame)focusRemoteWindow(userFrame);else user.querySelector('[data-dual="user-connect"]').focus();}
  if(side==='ai'){if(aiFrame)focusRemoteWindow(aiFrame);else ai.querySelector('[data-dual="ai-connect"]').focus();}
 }

 const userStatus=user.querySelector('#user-session-status'),userWelcome=user.querySelector('.user-welcome'),userFocus=user.querySelector('[data-dual="user-focus"]'),userDisconnect=user.querySelector('[data-dual="user-disconnect"]');
 try{userUrl=validateGateway(config.userGatewayUrl);userSourceUrl=userUrl;}catch{}
 const userDirect=user.querySelector('#user-session-direct');if(userUrl)userDirect.href=userUrl;else{userDirect.hidden=true;user.querySelector('[data-dual="user-connect"]').disabled=true;userStatus.textContent='User connection needs configuration';}
 const aiStatus=ai.querySelector('#ai-session-status'),aiWelcome=ai.querySelector('.ai-welcome'),aiConnect=ai.querySelector('[data-dual="ai-connect"]'),aiFocus=ai.querySelector('[data-dual="ai-focus"]'),aiDisconnect=ai.querySelector('[data-dual="ai-disconnect"]'),aiDirect=ai.querySelector('#ai-session-direct');aiDirect.href=agentUrl;

 function setLayout(value){
  if(!['admin','user','both','ai'].includes(value))return;
  layout=value;root.dataset.stageView=value;admin.hidden=value==='user';user.hidden=value==='admin'||value==='ai';ai.hidden=value!=='ai';
  toolbar.querySelectorAll('[data-stage-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.stageView===value)));
  toolbar.querySelector('.stage-ratio').hidden=!splitLayout();
  shields.admin.querySelector('strong').textContent=value==='ai'?'Apply in administrator':'Switch to administrator';
  shields.admin.querySelector('small').textContent=value==='ai'?'Execute and verify the approved change in Entra':'Click to bring this workspace into focus';
  if(value==='ai'){connectAi();setActive('ai');}else if(value==='both')setActive(['admin','user'].includes(activeSide)?activeSide:'admin');else setActive(value);
  root.dispatchEvent(new CustomEvent('stage-layout-change',{detail:{layout:value}}));
 }

 function connectUser(){
  if(userFrame||!userSourceUrl)return;const isLiveApp=userSourceUrl!==userUrl;if(isLiveApp)root.dispatchEvent(new CustomEvent('stage-live-app-open',{detail:{label:userSourceLabel}}));userFrame=document.createElement('iframe');userFrame.id='user-session-frame';userFrame.title=isLiveApp?`Live ${userSourceLabel}`:'Protected independent kiosk desktop for the demo persona';userFrame.tabIndex=0;stopUserFocus=watchRemoteFocus(userFrame,()=>{setActive('user');onUserFocus();});userFrame.referrerPolicy='no-referrer';userFrame.setAttribute('allow','fullscreen');userFrame.setAttribute('allowfullscreen','');userFrame.src=userSourceUrl;userWelcome.hidden=true;userFocus.disabled=false;userDisconnect.disabled=false;userStatus.textContent=isLiveApp?`Opening ${userSourceLabel}…`:'Opening protected gateway…';userFrame.addEventListener('load',()=>{clearTimeout(userTimer);userStatus.textContent=isLiveApp?`${userSourceLabel} opened · guide hidden for presentation`:'Gateway page opened · sign in inside';if(document.activeElement===userFrame&&layout!=='admin')focusSide('user');});userFrame.addEventListener('error',()=>{clearTimeout(userTimer);userStatus.textContent=isLiveApp?'Customer site unavailable · use Separate tab':'Gateway unavailable · try separate tab';});surfaces.user.append(userFrame);userTimer=setTimeout(()=>userStatus.textContent='Still waiting · try separate tab',20000);focusSide('user');
 }
 function disconnectUser(){clearTimeout(userTimer);stopUserFocus?.();stopUserFocus=null;userFrame?.remove();userFrame=null;userWelcome.hidden=false;userFocus.disabled=true;userDisconnect.disabled=true;userStatus.textContent='View disconnected · Windows session may remain signed in';}
 function connectAi(){
  if(aiFrame)return;aiFrame=document.createElement('iframe');aiFrame.id='identity-agent-frame';aiFrame.title='Private tenant-connected Identity AI agent';aiFrame.tabIndex=0;aiFrame.dataset.agentUrl=agentUrl;stopAiFocus=watchRemoteFocus(aiFrame,()=>setActive('ai'));aiFrame.referrerPolicy='no-referrer';aiFrame.setAttribute('allow','clipboard-read; clipboard-write');aiFrame.src=agentUrl;aiConnect.disabled=true;aiConnect.textContent='Opening agent…';aiFocus.disabled=false;aiDisconnect.disabled=false;aiStatus.textContent='Opening private tenant agent…';aiFrame.addEventListener('load',()=>{aiWelcome.hidden=true;aiStatus.textContent='Agent opened · sign in or run inside';});aiFrame.addEventListener('error',()=>{aiStatus.textContent='Agent unavailable · use separate tab';});surfaces.ai.append(aiFrame);
 }
 function disconnectAi(){stopAiFocus?.();stopAiFocus=null;aiFrame?.remove();aiFrame=null;aiWelcome.hidden=false;aiConnect.disabled=false;aiConnect.textContent='Open live AI copilot';aiFocus.disabled=true;aiDisconnect.disabled=true;aiStatus.textContent='AI view closed';}

 toolbar.addEventListener('click',event=>{const button=event.target.closest('[data-stage-view]');if(button)setLayout(button.dataset.stageView);});
 toolbar.querySelector('input').addEventListener('input',event=>root.style.setProperty('--admin-share',event.target.value+'%'));
 user.addEventListener('click',event=>{const action=event.target.closest('[data-dual]')?.dataset.dual;if(action==='user-connect')connectUser();if(action==='user-disconnect')disconnectUser();if(action==='user-focus')focusSide('user');});
 ai.addEventListener('click',event=>{const action=event.target.closest('[data-dual]')?.dataset.dual;if(action==='ai-connect')connectAi();if(action==='ai-disconnect')disconnectAi();if(action==='ai-focus')focusSide('ai');});
 setLayout('both');

 return {setActive,setLayout,connect:connectUser,connected:()=>Boolean(userFrame),focus:()=>focusSide(activeSide==='ai'?'ai':'user'),isFocused:()=>Boolean((userFrame&&document.activeElement===userFrame)||(aiFrame&&document.activeElement===aiFrame)),visible:()=>layout==='user'||layout==='both',setGuide(g){
  const nextUserUrl=g.liveUrl||userUrl,nextUserLabel=g.liveLabel||'protected user desktop';
  if(userFrame&&userFrame.src!==nextUserUrl)disconnectUser();
  userSourceUrl=nextUserUrl;userSourceLabel=nextUserLabel;userSourceKind=g.liveKind||'customer application';userIsLiveApp=Boolean(g.liveUrl);
  userDirect.href=userSourceUrl||'';userDirect.hidden=!userSourceUrl;
  user.querySelector('[data-dual="user-connect"]').disabled=!userSourceUrl;
  userWelcome.querySelector('.stage-tag').textContent=g.liveUrl?`LIVE ${userSourceKind.toUpperCase()}`:'INDEPENDENT LIVE SESSION';
  userWelcome.querySelector('h3').textContent=g.liveUrl?`Open ${userSourceLabel}.`:'The other side of the story.';
  userWelcome.querySelector('p').textContent=g.liveUrl?`Run the real ${userSourceKind} beside the administrator tenant view.`:'Open the kiosk desktop and sign in with the persona’s Microsoft account in its browser.';
  userWelcome.querySelector('.session-note').textContent=g.liveUrl?'External credentials stay inside the connected application.':'Use the existing protected gateway sign-in. Windows credentials are requested inside the gateway.';
  userWelcome.querySelector('[data-dual="user-connect"]').textContent=g.liveUrl?`Open ${userSourceKind}`:'Open user session';
  userDisconnect.textContent=g.liveUrl?`Close ${userSourceKind}`:'Disconnect user';
  userStatus.textContent=g.liveUrl?'Live customer site ready':'Not connected';
  userPersonName=g.name;user.querySelector('#stage-user-name').textContent=g.name+' · '+(g.liveKind||'user experience');user.querySelector('#stage-user-purpose').textContent=g.liveUrl?`Live ${g.liveKind||'application'} · show the sign-in and enforced outcome`:'Separate protected desktop · show the person’s experience';ai.querySelector('#stage-ai-name').textContent=g.name+' · AI copilot';
  setActive(activeSide);
  steps.replaceChildren(...g.highlights.map((text,index)=>{const li=document.createElement('li'),n=document.createElement('span'),label=document.createElement('strong');n.textContent=String(index+1);label.textContent=text;li.append(n,label);return li;}));
  const prompt=`${g.name}: ${g.title}. ${g.why} Read the connected tenant, cite the evidence, preview one bounded action, identify the approval owner, and provide verification and undo steps. Do not claim execution unless audit evidence confirms it.`;
  const nextUrl=`${AGENTS}/identity?case=${encodeURIComponent(prompt)}#run`;agentUrl=nextUrl;aiDirect.href=nextUrl;
  if(aiFrame&&aiFrame.dataset.agentUrl!==nextUrl){aiFrame.dataset.agentUrl=nextUrl;aiFrame.src=nextUrl;aiStatus.textContent='Loading this story in the agent…';}
 }};
}
