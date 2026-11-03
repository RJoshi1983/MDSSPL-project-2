/* MDSSPL code modification file 12. Version 0.5.8, 2026-11-03.
   SHA-256 of the block: 4344adfa08858054e6f4b1662a4656941630bed8a7416a8adbb385d357883c5b
   CONFIDENTIAL. (c) MDSSPL. All rights reserved. */
/* ===== MDSSPL change 2026-11-03 v0.5.8: client numbers and project numbers (client code from e-mail, service groups, kind of work, date, running number) ===== */
(function(){
/* group letters (Option B) */
window.PIDG={env:'C',res:'E',sus:'S',reg:'R',scm:'U',soc:'G',hse:'H',bio:'B',ana:'Y',cert:'Q',fin:'F',ppl:'P',gtm:'M',tech:'T'};
var AL='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
var fnv=function(s,seed){var h=seed>>>0;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h>>>0};
/* client code: 6 characters worked out from the registered e-mail; the same on every device */
window.CLID=function(em){em=String(em||'').trim().toLowerCase();if(!em)return '';var a=fnv(em,2166136261),b=fnv(em.split('').reverse().join(''),3735928559),n=(a^(b<<7))>>>0,o='';for(var i=0;i<5;i++){o+=AL[n%32];n=Math.floor(n/32)}o+=AL[(b>>>3)%32];return o};
window.CLNO=function(em){var c=CLID(em);return c?'MDS-'+c:''};
var grpOf=function(id){var g=SVGRP.filter(function(x){return x[3].indexOf(id)>-1})[0];return g?g[0]:''};
window.PIDSVC=function(items){var L={};(items||[]).forEach(function(i){var l=PIDG[grpOf(i.svc)]||'X';L[l]=1});return Object.keys(L).sort().join('')+(items||[]).length};
window.PIDKIND=function(items){var k={};(items||[]).forEach(function(i){if(i.role=='ver')k.V=1;else if(i.role=='adv')k.A=1});return Object.keys(k).sort().join('')};
var ddmmyyyy=function(iso){var d=iso?new Date(iso):new Date();return ('0'+d.getDate()).slice(-2)+('0'+(d.getMonth()+1)).slice(-2)+d.getFullYear()};
window.PIDMAKE=function(o){var C=ORC(o),cl=CLID(C.em),dt=ddmmyyyy(o.created),kd=PIDKIND(o.items),stem='MDS-'+cl+'-'+PIDSVC(o.items)+(kd?'-'+kd:'')+'-'+dt,same=ORD.list.filter(function(x){return x!==o&&x.pid&&x.pid.indexOf('MDS-'+cl+'-')==0&&x.pid.slice(-11,-3)==dt}).length;return stem+'-'+('0'+(same+1)).slice(-2)};
window.PIDFILL=function(){var ch=false;try{PJR.clients.forEach(function(c){if(c.em&&!c.cid){c.cid=CLNO(c.em);ch=true}});if(ch)savePJ()}catch(e){}var cho=false;ORD.list.slice().sort(function(a,b){return String(a.created).localeCompare(String(b.created))}).forEach(function(o){if(!o.pid&&ORC(o).em){o.pid=PIDMAKE(o);cho=true}});if(cho)saveO()};
var ordnew0p=ordnew;ordnew=function(){var r=ordnew0p.apply(this,arguments);try{PIDFILL()}catch(e){}return r};
/* invoices and receipts carry the project number next to the order number */
var INVPDF0p=INVPDF;INVPDF=function(o,kind){if(!o||!o.pid)return INVPDF0p.apply(this,arguments);var n=o.no;o.no=n+' | Project '+o.pid;try{return INVPDF0p.apply(this,arguments)}finally{o.no=n}};
/* show the project number wherever an order number is shown, and the client number on My orders */
var NORE=/MDS-ORD-\d{4}-\d{4}/;
window.PIDDOM=function(){var m=document.getElementById('m');if(!m||!ORD||!ORD.list.length)return;var map={};ORD.list.forEach(function(o){if(o.pid)map[o.no]=o.pid});var w=document.createTreeWalker(m,NodeFilter.SHOW_TEXT,null),L=[],t;while((t=w.nextNode())){if(NORE.test(t.nodeValue)&&!(t.parentNode&&t.parentNode.closest&&t.parentNode.closest('textarea,input,select,option,.pidx,script,style')))L.push(t)}L.forEach(function(t){var x=t.nodeValue.match(NORE)[0],pid=map[x],nx=t.parentNode&&t.parentNode.querySelector&&t.parentNode.querySelector('.pidx');if(!pid||nx)return;var sp=document.createElement('span');sp.className='pidx mut';sp.setAttribute('translate','no');sp.style.cssText='font-size:12px;margin-left:6px;white-space:nowrap';sp.textContent='Project '+pid;t.parentNode.insertBefore(sp,t.nextSibling)});
 if(cur=='od'&&!document.getElementById('cidbox')){var em=(typeof RG!='undefined'&&RG.em)||'';if(!em){var o=ORD.list[ORD.list.length-1];if(o)em=ORC(o).em}if(em){var c=document.createElement('div');c.className='card';c.id='cidbox';c.innerHTML='<p style="margin:0">Your client number: <b translate="no">'+esc(CLNO(em))+'</b> <span class="mut" style="font-size:12px">· Each project number shows the client number, the service groups and number of services, the kind of work (V verification, A advisory), the date and a running number.</span></p>';var f=m.querySelector('.card');if(f&&f.nextSibling)m.insertBefore(c,f.nextSibling);else m.appendChild(c)}}};
var Rp=R;R=function(){var r=Rp.apply(this,arguments);try{PIDDOM()}catch(e){}return r};
/* staff: how the numbers are made */
window.PIDHELP=function(){return '<div class="card"><h4>Client and project numbers</h4><p class="mut">Client number <b>MDS-XXXXXX</b>: worked out from the registered e-mail, the same on every device. Project number <b>MDS-client-groups+count-kind-DDMMYYYY-running</b>, for example <span translate="no">MDS-7KQ2MA-CS2-V-03112026-01</span>.</p><p class="mut" style="font-size:12px">Group letters: '+Object.keys(PIDG).map(function(k){return PIDG[k]+' '+(SECSHORT[k]||k)}).join(' · ')+'. Kind: V verification, A advisory, none for consultancy.</p></div>'};
var STV0pid=STV;STV=function(){var h=STV0pid.apply(this,arguments);if(STAFF&&ST.tab=='ord')h+=PIDHELP();return h};
try{PIDFILL()}catch(e){}
})();
/* ===== end of change ===== */
