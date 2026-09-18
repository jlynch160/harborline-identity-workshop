import {cases} from './workshop.js';
import {architectures,momentCases,architectureSources} from './architecture-models.js';
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const glyphs=[
 '<circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3M3 12h3m12 0h3"/>',
 '<path d="m12 3 8 4v6c0 5-8 9-8 9s-8-4-8-9V7zM8 12l3 3 5-6"/>',
 '<rect x="4" y="4" width="16" height="5" rx="2"/><rect x="4" y="15" width="16" height="5" rx="2"/><path d="M8 9v6m8-6v6M8 6.5h1m-1 11h1"/>',
 '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8m-4-4v4M7 9h4m-4 4h10"/>'
];
const icon=i=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${glyphs[i]}</svg>`;

function diagram(id,step=0){
 const c=cases.find(c=>c.id===id),a=architectures[id],n=a.nodes[step],split=[5,16].includes(id);
 return `<div class="arch-content" data-arch-id="${id}" data-arch-step="${step}">
 <header class="arch-header"><div><span class="arch-eyebrow">MAJORKEY / ARCHITECTURE STUDIO</span><h3>${e(a.headline)}</h3><p>UC ${String(id).padStart(2,'0')} · ${e(c.title)}</p></div><button type="button" class="arch-expand" data-arch="expand">Expand diagram ↗</button></header>
 <div class="arch-meta"><span class="arch-design">Reference design · verify in tenant</span><span>${e(c.category)}</span><span>${split?'Two distinct tenant boundaries':'Select a system to explore its responsibility'}</span></div>
 <div class="arch-canvas ${split?'arch-comparison':''}">
 <div class="arch-zones" aria-label="System boundaries">${a.zones.map((z,i)=>`<span class="arch-zone-${i}">${e(z)}</span>`).join('')}</div>
 ${split?'<p class="arch-fork">↙ Workforce collaboration &nbsp; / &nbsp; Customer application identity ↘<small>Separate routes selected by business need. No tenant-to-tenant synchronization is implied.</small></p>':''}
 <div class="arch-nodes">${a.nodes.map((node,i)=>`<div class="arch-system arch-system-${i}"><button type="button" data-arch="node" data-step="${i}" aria-pressed="${i===step}" aria-label="Explore ${e(node[0])}"><span class="arch-node-top">${icon(i)}<span>${split&&i>0&&i<3?(i===1?'WORKFORCE':'CIAM'):`0${i+1}`}</span></span><strong>${e(node[0])}</strong><small>${e(node[1])}</small><span class="arch-node-hint">${i===step?'Exploring this system':'Explore responsibility'} ↗</span></button>${i<3&&!split?`<div class="arch-edge"><span>${e(a.flows[i])}</span><b aria-hidden="true">→</b></div>`:''}</div>`).join('')}</div>
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
 content.querySelectorAll('.arch-system button').forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===next));b.querySelector('.arch-node-hint').textContent=(i===next?'Exploring this system':'Explore responsibility')+' ↗';});
 content.querySelector('.arch-inspector').replaceWith(fresh.querySelector('.arch-inspector'));
 content.dataset.archStep=String(next);
 if(action!=='node')content.querySelector(`[data-arch="node"][data-step="${next}"]`).focus({preventScroll:true});
});
document.addEventListener('fullscreenchange',()=>{document.querySelectorAll('.arch-expand').forEach(b=>{b.textContent=document.fullscreenElement===b.closest('.arch-studio')?'Exit full screen ↙':'Expand diagram ↗';});});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.arch-expanded').forEach(root=>{root.classList.remove('arch-expanded');root.querySelector('.arch-expand').textContent='Expand diagram ↗';});});
