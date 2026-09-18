import {readFile,writeFile} from 'node:fs/promises';
const path=new URL('../dist/app.js',import.meta.url);
let app=await readFile(path,'utf8');
if(!app.includes("from './remote-session.js'")){
app="import {createRemoteSession} from './remote-session.js';\n"+app;
app=app.replace("const app=document.getElementById('app');", "const app=document.getElementById('app');\nconst remote=createRemoteSession();");
const start=app.indexOf("if(state.tab==='live')return");
const end=app.indexOf("if(state.tab==='evidence')",start);
if(start<0||end<0)throw new Error('Live section not found');
app=app.slice(0,start)+`if(state.tab==='live')return \`<div class="two-col"><div class="remote-launch-card"><div class="eyebrow">Real Microsoft Entra</div><h3>The portal, inside your workshop.</h3><p>Use the browser on your protected demo desktop. Click, navigate and expand the same session to full screen when you need room.</p><button class="primary" data-action="remote">Open Entra workspace \${icon('screen')}</button><small>\${remote.configured()?'Presenter sign-in required.':'Gateway setup pending · fullscreen stage available.'}</small></div><div><div class="eyebrow">\${escape(p.name)} · this moment</div><div class="note" style="margin-top:12px"><strong>\${escape(p.account)}</strong><br>\${escape(m.setup[0])}</div><div class="launch-list">\${m.links.map(l=>link(...l)).join('')}</div><p class="source-caption">Portal shortcuts open on this computer. Inside the remote desktop, navigate with its own browser.</p><button class="outline" data-action="tab" data-value="evidence">What should I verify? \${icon('arrow')}</button></div></div>\`;\n`+app.slice(end);
app=app.replace('<button class="outline" data-action="present">','<button class="outline" data-action="remote">${icon(\'screen\')} Entra workspace</button><button class="outline" data-action="present">');
app=app.replace('aria-labelledby="modal-title"></dialog>`;}','aria-labelledby="modal-title"></dialog>`;remote.setContext(p.name,m.short); }');
app=app.replace("if(a==='ready')openReady();", "if(a==='ready')openReady();if(a==='remote')remote.open();");
app=app.replace("if(state.present&&!document.querySelector", "if(!remote.isOpen()&&state.present&&!document.querySelector");
await writeFile(path,app);
}
const htmlPath=new URL('../dist/index.html',import.meta.url);
let html=await readFile(htmlPath,'utf8');
if(!html.includes('remote-session.css'))html=html.replace('</head>','<link rel="stylesheet" href="./remote-session.css"></head>');
await writeFile(htmlPath,html);
