import {cases} from './workshop.js';
import {architectures,momentCases,architectureSources} from './architecture-models.js';
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const glyphs={
 person:'<circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3M3 12h3m12 0h3"/>',
 shield:'<path d="m12 3 8 4v6c0 5-8 9-8 9s-8-4-8-9V7zM8 12l3 3 5-6"/>',
 directory:'<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
 app:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8m-4-4v4M7 9h4m-4 4h10"/>',
 cloud:'<path d="M7 19h10a4 4 0 0 0 .6-7.9A6 6 0 0 0 6.2 9.4 4.8 4.8 0 0 0 7 19Z"/><path d="m9 14 2 2 4-5"/>',
 device:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 5h6M11 19h2"/>',
 key:'<circle cx="8" cy="12" r="4"/><path d="m12 12 9-9m-4 4 3 3m-6 0 3 3"/>',
 workflow:'<circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M7 5h10M6 7l5 10m7-10-5 10"/>',
 data:'<path d="M4 5h16v14H4zM8 9h8m-8 4h5"/><circle cx="17" cy="15" r="1"/>',
 network:'<circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="4" cy="19" r="2"/><circle cx="20" cy="19" r="2"/><path d="m6 7 4 3m4 0 4-3m-8 7-4 4m8-4 4 4"/>'
};
function kind(label,i){const s=label.toLowerCase();if(/device|windows|kiosk|desktop|browser|hardware/.test(s))return 'device';if(/application|portal|api|resource|session/.test(s))return 'app';if(/identity provider|federat|harborpass|domain/.test(s))return 'network';if(/authentication|passkey|credential|method|token/.test(s))return 'key';if(/workflow|review|approval|governance|pim|lifecycle/.test(s))return 'workflow';if(/directory|entra identity|tenant|account|membership/.test(s))return 'directory';if(/evidence|audit|report|log|correlation/.test(s))return 'data';if(/policy|conditional|trust|scope|assignment|authorization/.test(s))return 'shield';if(/cloud|intune|autopilot|provision/.test(s))return 'cloud';return i===0?'person':i===3?'app':'shield';}
const icon=(label,i)=>{const k=kind(label,i);return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" data-kind="${k}">${glyphs[k]}</svg>`;};
function connections(a,split){return split?`<svg class="arch-links" viewBox="0 0 1000 480" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="arrow-split" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0l10 5-10 5Z"/></marker></defs><path class="arch-link route-workforce" d="M170 240 C300 240 300 105 445 105" marker-end="url(#arrow-split)"/><path class="arch-link route-ciam" d="M170 240 C300 240 300 370 445 370" marker-end="url(#arrow-split)"/><path class="arch-link route-workforce" d="M555 105 C700 105 700 240 830 240" marker-end="url(#arrow-split)"/><path class="arch-link route-ciam" d="M555 370 C700 370 700 240 830 240" marker-end="url(#arrow-split)"/></svg><span class="arch-route-label route-label-1">WORKFORCE ROUTE</span><span class="arch-route-label route-label-2">CUSTOMER / CIAM ROUTE</span>`:`<svg class="arch-links" viewBox="0 0 1000 480" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="flow-gradient" x1="0" x2="1"><stop stop-color="#64ffd0"/><stop offset=".5" stop-color="#c3a0ff"/><stop offset="1" stop-color="#78caff"/></linearGradient><marker id="arrow-flow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0l10 5-10 5Z"/></marker></defs><path class="arch-link" d="M150 285 C235 285 245 135 340 135" marker-end="url(#arrow-flow)"/><path class="arch-link" d="M420 135 C515 135 515 350 610 350" marker-end="url(#arrow-flow)"/><path class="arch-link" d="M690 350 C785 350 790 205 855 205" marker-end="url(#arrow-flow)"/></svg>${a.flows.map((flow,i)=>`<span class="arch-flow-label arch-flow-${i}">${e(flow)}</span>`).join('')}`;}

function diagram(id,step=0){
 const c=cases.find(c=>c.id===id),a=architectures[id],n=a.nodes[step],split=[5,16].includes(id);
 return `<div class="arch-content" data-arch-id="${id}" data-arch-step="${step}">
 <header class="arch-header"><div><span class="arch-eyebrow">MAJORKEY / ARCHITECTURE STUDIO</span><h3>${e(a.headline)}</h3><p>UC ${String(id).padStart(2,'0')} · ${e(c.title)}</p></div><button type="button" class="arch-expand" data-arch="expand">Expand diagram ↗</button></header>
 <div class="arch-meta"><span class="arch-design">Reference design · verify in tenant</span><span>${e(c.category)}</span><span>${split?'Two distinct tenant boundaries':'Select a system to explore its responsibility'}</span></div>
 <div class="arch-canvas ${split?'arch-comparison':''}">
 <div class="arch-boundaries" aria-label="System boundaries">${a.zones.map((z,i)=>`<span class="arch-boundary arch-boundary-${i}"><i></i>${e(z)}</span>`).join('')}</div>
 ${split?'<p class="arch-fork">Two approved patterns — choose by population and resource<small>The routes are alternatives. No tenant-to-tenant synchronization is implied.</small></p>':''}
 <div class="arch-map">${connections(a,split)}${a.nodes.map((node,i)=>`<button class="arch-system arch-system-${i}" type="button" data-arch="node" data-step="${i}" aria-pressed="${i===step}" aria-label="Explore ${e(node[0])}"><span class="arch-orbit"><span class="arch-icon">${icon(node[0],i)}</span><i class="arch-pulse"></i></span><span class="arch-system-copy"><b>${split&&i>0&&i<3?(i===1?'WORKFORCE':'CIAM'):`0${i+1}`}</b><strong>${e(node[0])}</strong><small>${e(node[1])}</small></span></button>`).join('')}</div>
 <div class="arch-proof-line"><span aria-hidden="true">◎</span><div><b>EVIDENCE PLANE</b><p>${e(a.proof)}</p></div><span class="arch-proof-badge">Configuration → execution → outcome</span></div>
 </div>
 <section class="arch-inspector" aria-live="polite" aria-label="Selected system responsibility"><div><span class="arch-eyebrow">${split?'SYSTEM RESPONSIBILITY':`FLOW ${step+1} OF 4`} · ${e(n[0])}</span><h4>${e(n[1])}</h4><p>${e(n[2])}</p></div><div class="arch-step-controls"><button type="button" data-arch="previous" ${step===0?'disabled':''} aria-label="Previous system">←</button><span>${step+1} / 4</span><button type="button" data-arch="next" ${step===3?'disabled':''} aria-label="Next system">→</button></div></section>
 <div class="arch-outcome"><span>BUSINESS VALUE</span><strong>${e(a.outcome)}</strong></div>
 <div class="arch-briefings"><details open><summary>01 <span>Deploy it in a real company</span><b>+</b></summary><p>${e(a.decision)}</p></details><details><summary>02 <span>Make it fit the client</span><b>+</b></summary><p>${e(a.custom)}</p></details><details><summary>03 <span>Where AI helps</span><b>+</b></summary><p>${e(a.ai)}</p><small>Proposed assistance · requires connected evidence and human approval for changes.</small></details></div>
 <footer class="arch-sources"><span>Design references</span>${architectureSources.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join('')}</footer>
 </div>`;
}
export function caseArchitecture(id){return `<section class="arch-studio" aria-label="Use case ${id} architecture">${diagram(id)}</section>`;}
export function architectureView(p,m){
 const index=p.moments.indexOf(m),recommended=momentCases[p.id]?.[index]||p.cases;
 const ids=[...new Set([...recommended,...p.cases])];
 return `<section class="arch-studio" aria-label="${e(p.name)} use-case architectures"><div class="arch-picker"><div><span class="arch-eyebrow">BEHIND ${e(p.name.toUpperCase())}’S STORY</span><p>${e(m.title)}</p></div><label>Explore a use case<select data-arch="select">${ids.map(id=>`<option value="${id}">${recommended.includes(id)?'★ ':''}${String(id).padStart(2,'0')} · ${e(cases.find(c=>c.id===id).title)}</option>`).join('')}</select></label><small>★ Recommended for this moment · All 34 architectures are available in the use-case catalog.</small></div>${diagram(ids[0])}</section>`;
}
document.addEventListener('change',event=>{const select=event.target.closest('[data-arch="select"]');if(!select)return;const root=select.closest('.arch-studio');root.querySelector('.arch-content').outerHTML=diagram(Number(select.value));if(document.fullscreenElement===root)root.querySelector('.arch-expand').textContent='Exit full screen ↙';else if(root.classList.contains('arch-expanded'))root.querySelector('.arch-expand').textContent='Close expanded view ↙';});
document.addEventListener('click',async event=>{
 const button=event.target.closest('button[data-arch]');if(!button)return;
 const root=button.closest('.arch-studio'),content=root.querySelector('.arch-content');
 if(button.dataset.arch==='expand'){
  if(document.fullscreenElement===root){await document.exitFullscreen();return;}
  if(root.classList.contains('arch-expanded')){root.classList.remove('arch-expanded');button.textContent='Expand diagram ↗';return;}
  try{await root.requestFullscreen();button.textContent='Exit full screen ↙';}catch{root.classList.add('arch-expanded');button.textContent='Close expanded view ↙';}
  return;
 }
 const id=Number(content.dataset.archId),step=Number(content.dataset.archStep),action=button.dataset.arch;
 const next=action==='node'?Number(button.dataset.step):Math.max(0,Math.min(3,step+(action==='next'?1:-1)));
 // Preserve expanded briefings while narrating; only the diagram's selected system changes.
 const temp=document.createElement('div');temp.innerHTML=diagram(id,next);
 const fresh=temp.firstElementChild;
 content.querySelectorAll('.arch-system').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===next)));
 content.querySelector('.arch-inspector').replaceWith(fresh.querySelector('.arch-inspector'));
 content.dataset.archStep=String(next);
 if(action!=='node')content.querySelector(`[data-arch="node"][data-step="${next}"]`).focus({preventScroll:true});
});
document.addEventListener('fullscreenchange',()=>{document.querySelectorAll('.arch-expand').forEach(b=>{b.textContent=document.fullscreenElement===b.closest('.arch-studio')?'Exit full screen ↙':'Expand diagram ↗';});});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.arch-expanded').forEach(root=>{root.classList.remove('arch-expanded');root.querySelector('.arch-expand').textContent='Expand diagram ↗';});});
