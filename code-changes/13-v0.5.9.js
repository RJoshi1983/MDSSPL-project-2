/* MDSSPL code modification file 13. Version 0.5.9, 2026-11-03. Back end: app/api/pay/create/route.ts.
   SHA-256 of the block: bae07880b1a382e74f062f6421d63ab5187da5e30560ac99bdc02d0843790d6a
   CONFIDENTIAL. (c) MDSSPL. All rights reserved. */
/* ===== MDSSPL change 2026-11-03 v0.5.9: the project number (UIN) linked to payments, invoices, commissions, exports, assignments and data records ===== */
(function(){
var byNo=function(no){return ORD.list.filter(function(o){return o.no==no})[0]||null};
window.UINOF=function(no){var o=byNo(no);return o&&o.pid||''};
/* the latest project of the signed-in or registering client that includes a service */
window.PIDFOR=function(svc){var em=String((typeof RG!='undefined'&&RG.em)||'').toLowerCase(),L=ORD.list.filter(function(o){return o.pid&&o.items.some(function(i){return i.svc==svc})&&(!em||String(ORC(o).em||'').toLowerCase()==em)});return L.length?L[L.length-1].pid:''};
/* link stored records: payments, projects (assignments), referral commissions */
window.UINLINK=function(){var ch=false;ORD.list.forEach(function(o){if(!o.pid)return;if(o.pay&&o.pay.uin!=o.pid){o.pay.uin=o.pid;ch=true}if(o.inv&&o.inv.uin!=o.pid){o.inv.uin=o.pid;ch=true}if(o.prj){var p=PJR.projects.filter(function(x){return x.id==o.prj})[0];if(p){p.uins=p.uins||[];if(p.uins.indexOf(o.pid)<0){p.uins.push(o.pid);p.uin=p.uins[0];ch=true}}}});if(ch){saveO();try{savePJ()}catch(e){}}try{var D=RFXD(),c2=false;D.acc.forEach(function(a){var u=UINOF(a.ord);if(u&&a.uin!=u){a.uin=u;c2=true}});if(c2)RFXSAVE()}catch(e){}};
var PIDFILL0=PIDFILL;PIDFILL=function(){PIDFILL0.apply(this,arguments);UINLINK()};
/* payments: the UPI note and the Razorpay note carry the project number */
var PAYOPT0u=PAYOPT;PAYOPT=function(o){var h=PAYOPT0u.apply(this,arguments);if(o&&o.pid){h=h.split('tn='+encodeURIComponent(o.no)).join('tn='+encodeURIComponent(o.pid));h=h.replace('Quote <b>'+esc(o.no)+'</b> as the reference or remark.','Quote <b>'+esc(o.no)+'</b> (project <b translate="no">'+esc(o.pid)+'</b>) as the reference or remark.')}return h};
var RZPME0u=RZPME;RZPME=function(o){var h=RZPME0u.apply(this,arguments);return o&&o.pid?h.replace('<b translate="no">'+esc(o.no)+'</b> in the note','<b translate="no">'+esc(o.pid)+'</b> in the note'):h};
/* online card and UPI payments: the project number goes to the payment provider as a note */
var F0=window.fetch;window.fetch=function(u,opt){try{if(typeof u=='string'&&u.indexOf('/api/pay/create')>-1&&opt&&opt.body){var b=JSON.parse(opt.body);if(b.orderNo&&!b.uin){b.uin=UINOF(b.orderNo);opt=Object.assign({},opt,{body:JSON.stringify(b)})}}}catch(e){}return F0.apply(this,[u,opt])};
var paysub0u=paysub;paysub=function(id){var r=paysub0u.apply(this,arguments);try{UINLINK()}catch(e){}return r};
/* exports (CSV): every order number is followed by its project number */
var NOR=/MDS-ORD-\d{4}-\d{4}/g;
var gcsv0u=gcsvdl;gcsvdl=function(rows,fn){try{rows=rows.map(function(r){return (r||[]).map(function(c){return typeof c=='string'?c.replace(NOR,function(n){var u=UINOF(n);return u?n+' / '+u:n}):c})})}catch(e){}return gcsv0u.call(this,rows,fn)};
/* assignments: show the project number of the project being staffed */
var ASGV0u=ASGV;ASGV=function(){var h=ASGV0u.apply(this,arguments),p=null;try{p=ASGP()}catch(e){}if(p&&p.uins&&p.uins.length)h=h.replace('</h3>','</h3><p><b>Project number:</b> <span translate="no">'+p.uins.map(esc).join(', ')+'</span></p>');return h};
/* page: project numbers next to projects in every project list */
var PIDDOM0u=PIDDOM;PIDDOM=function(){PIDDOM0u.apply(this,arguments);var m=document.getElementById('m');if(!m)return;[].slice.call(m.querySelectorAll('option')).forEach(function(op){var p=PJR.projects.filter(function(x){return x.id==op.value})[0];if(p&&p.uin&&op.textContent.indexOf(p.uin)<0)op.textContent+=' · '+p.uin})};
try{UINLINK()}catch(e){}
})();
/* ===== end of change ===== */
