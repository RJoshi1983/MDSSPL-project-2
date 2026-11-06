/* MDSSPL code modification file 18. Version 0.6.4, 2026-11-06. Front end only.
   SHA-256 of the block: 746bbaddffaa08526ac86bb92ff2596c6f291c3c7aeaa8ee15527c1af37f158f
   CONFIDENTIAL. (c) MDSSPL. All rights reserved. */
/* ===== MDSSPL change 2026-11-06 v0.6.4: colours for the sidebar (professional) layout: side menu, home page group tiles, Services page group headers and every service icon ===== */
(function(){
var GC={'Carbon and climate':['#059669','#10b981'],'Energy, water and waste':['#0284c7','#38bdf8'],'Sustainability reporting':['#4f46e5','#818cf8'],'Certification and ratings':['#a16207','#facc15'],'Finance and accounts':['#1d4ed8','#60a5fa'],'People and training':['#e11d48','#fb7185'],'Sales and marketing':['#db2777','#f9a8d4'],'Technology, security and legal':['#0e7490','#67e8f9'],'Regulatory & Compliance':['#c2410c','#fb923c'],'Supply Chain & Scope 3':['#0369a1','#0ea5e9'],'Social & Governance':['#a21caf','#e879f9'],'Biodiversity & Land':['#4d7c0f','#a3e635'],'Analytical Tools':['#475569','#94a3b8']};
window.GRPCOL=function(n){return GC[String(n||'').trim()]||null};
var css='.navbtn.on{background:linear-gradient(135deg,var(--pc),var(--pc2))!important;color:#fff!important;border-color:transparent!important;box-shadow:0 4px 12px color-mix(in srgb,var(--pc) 30%,transparent)}.navbtn{border-radius:10px}'
+'.gtile.gx{border-radius:14px;border-top:4px solid var(--gc);background:linear-gradient(180deg,color-mix(in srgb,var(--gc) 10%,var(--card)),var(--card) 75%);transition:transform .12s,box-shadow .12s}.gtile.gx:hover{transform:translateY(-2px);box-shadow:0 8px 20px color-mix(in srgb,var(--gc) 22%,transparent)}'
+'.gtile.gx b{background:linear-gradient(135deg,var(--gc),var(--gc2))!important;color:#fff!important;border-color:transparent!important}'
+'details.svg.gx>summary{background:linear-gradient(90deg,color-mix(in srgb,var(--gc) 20%,var(--card)),var(--card) 80%)!important;color:var(--fg)!important;border:1px solid color-mix(in srgb,var(--gc) 45%,var(--bd))!important;border-left:6px solid var(--gc)!important;border-radius:10px}'
+'details.svg.gx>summary .count{background:var(--gc)!important;color:#fff!important}details.svg.gx{border-top:0}'
+'details.svg.gx label.c{border-radius:8px;padding:3px 6px}details.svg.gx label.c:hover{background:color-mix(in srgb,var(--gc) 10%,transparent)}';
var st=document.createElement('style');st.id='v064css';st.textContent=css;document.head.appendChild(st);
var dk=function(){var t=document.documentElement.getAttribute('data-theme');return t=='dark'||(t!='light'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)};
var PAINT2=function(){var m=document.getElementById('m');if(!m)return;var D=dk();
 m.querySelectorAll('.gtile').forEach(function(t){var sp=t.querySelector('span'),c=sp&&GC[sp.textContent.trim()];if(!c)return;t.classList.add('gx');t.style.setProperty('--gc',D?c[1]:c[0]);t.style.setProperty('--gc2',c[1]);var r=t.querySelector('svg.svsym rect');if(r)r.setAttribute('fill',c[0])});
 m.querySelectorAll('details.svg').forEach(function(d){var b=d.querySelector('summary b'),c=b&&GC[b.textContent.trim()];if(!c)return;d.classList.add('gx');d.style.setProperty('--gc',D?c[1]:c[0]);d.style.setProperty('--gc2',c[1])});
 m.querySelectorAll('[onchange^="svtick("],[onclick^="go(\'"]').forEach(function(el){var a=el.getAttribute('onchange')||el.getAttribute('onclick')||'',id=(a.match(/^(?:svtick|go)\('([a-z0-9]+)'/)||[])[1],c=id&&window.SVCCOL&&SVCCOL(id);if(!c)return;var row=el.closest('label,li,button')||el;var r=row.querySelector('svg.svsym rect');if(r)r.setAttribute('fill',c[0])})};
var R0d=R;R=function(){var r=R0d.apply(this,arguments);try{PAINT2()}catch(e){}return r};
})();
/* ===== end of change ===== */
