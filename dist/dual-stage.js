// A second authenticated gateway frame, targeting a different desktop.
// Layout changes only hide panels; they never recreate a connected frame.
export function installDualStage(root,config,validateGateway,onUserFocus){
 const display=root.querySelector('#remote-display');
 const admin=document.createElement('section');admin.id='stage-admin';admin.className='stage-pane';admin.setAttribute('aria-label','Administrator desktop');
 display.before(admin);
 admin.innerHTML='<header class="pane-toolbar"><div><strong>Administrator</strong><small>Frontline demo VM · use the administrator browser profile</small></div><button type="button" data-remote="focus">Focus admin</button></header>';
 admin.append(display);
 const user=document.createElement('section');user.id='stage-user';user.className='stage-pane';user.setAttribute('aria-label','User desktop');
 user.innerHTML=`<header class="pane-toolbar"><div><strong id="stage-user-name">User experience</strong><small>Kiosk demo VM · separate Windows desktop</small></div><button type="button" data-dual="focus" disabled>Focus user</button></header><div class="user-display"><div class="user-welcome"><span class="stage-tag">INDEPENDENT LIVE SESSION</span><h3>The other side of the story.</h3><p>Open the kiosk desktop and sign in with the persona’s Microsoft account in its browser.</p><button class="primary" type="button" data-dual="connect">Open user session</button><p class="session-note">Use the existing protected gateway sign-in. Windows credentials are requested inside the gateway.</p></div></div><footer class="pane-footer"><span id="user-session-status" role="status">Not connected</span><button type="button" data-dual="disconnect" disabled>Disconnect user</button><a id="user-session-direct" target="_blank" rel="noopener noreferrer">Separate tab ↗</a></footer>`;
 admin.after(user);
 const toolbar=document.createElement('div');toolbar.className='stage-layout-bar';
 toolbar.innerHTML='<div class="stage-view-buttons" role="group" aria-label="Demo layout"><button type="button" data-stage-view="admin" aria-pressed="false">Admin</button><button type="button" data-stage-view="both" aria-pressed="true">Both</button><button type="button" data-stage-view="user" aria-pressed="false">User</button></div><span>Two desktops · separate sign-ins</span><label class="stage-ratio">Panel balance <input type="range" min="35" max="70" value="60" aria-label="Administrator panel width"></label>';
 root.querySelector('.remote-context').after(toolbar);
 const steps=document.createElement('ol');steps.className='stage-milestones';steps.setAttribute('aria-label','Demonstration steps');toolbar.after(steps);
 let frame=null,timer=null,layout='both',url=null;
 const status=user.querySelector('#user-session-status'),welcome=user.querySelector('.user-welcome'),focus=user.querySelector('[data-dual="focus"]'),disconnect=user.querySelector('[data-dual="disconnect"]');
 try{url=validateGateway(config.userGatewayUrl);}catch{}
 const direct=user.querySelector('#user-session-direct');if(url)direct.href=url;else{direct.hidden=true;user.querySelector('[data-dual="connect"]').disabled=true;status.textContent='User connection needs configuration';}
 function focusUser(){if(!frame)return;onUserFocus();frame.focus({preventScroll:true});}
 function setLayout(value){layout=value;root.dataset.stageView=value;admin.hidden=value==='user';user.hidden=value==='admin';toolbar.querySelectorAll('[data-stage-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stageView===value)));if(value==='user')focusUser();}
 function connect(){if(frame||!url)return;frame=document.createElement('iframe');frame.id='user-session-frame';frame.title='Protected independent kiosk desktop for the demo persona';frame.tabIndex=0;frame.addEventListener('focus',onUserFocus);frame.referrerPolicy='no-referrer';frame.setAttribute('allow','fullscreen');frame.setAttribute('allowfullscreen','');frame.src=url;welcome.hidden=true;focus.disabled=false;disconnect.disabled=false;status.textContent='Opening protected gateway…';frame.addEventListener('load',()=>{clearTimeout(timer);status.textContent='Gateway page opened · sign in inside';if(layout!=='admin')focusUser();});frame.addEventListener('error',()=>{clearTimeout(timer);status.textContent='Gateway unavailable · try separate tab';});user.querySelector('.user-display').append(frame);timer=setTimeout(()=>status.textContent='Still waiting · try separate tab',20000);focusUser();}
 function stop(){clearTimeout(timer);frame?.remove();frame=null;welcome.hidden=false;focus.disabled=true;disconnect.disabled=true;status.textContent='View disconnected · Windows session may remain signed in';}
 toolbar.addEventListener('click',event=>{const b=event.target.closest('[data-stage-view]');if(b)setLayout(b.dataset.stageView);});
 toolbar.querySelector('input').addEventListener('input',event=>root.style.setProperty('--admin-share',event.target.value+'%'));
 user.addEventListener('click',event=>{const a=event.target.closest('[data-dual]')?.dataset.dual;if(a==='connect')connect();if(a==='disconnect')stop();if(a==='focus')focusUser();});
 setLayout('both');
 return {focus:focusUser,isFocused:()=>Boolean(frame&&document.activeElement===frame),visible:()=>layout!=='admin',setGuide(g){user.querySelector('#stage-user-name').textContent=g.name+' · user experience';steps.replaceChildren(...g.highlights.map((text,index)=>{const li=document.createElement('li'),n=document.createElement('span'),label=document.createElement('strong');n.textContent=String(index+1);label.textContent=text;li.append(n,label);return li;}));}};
}
