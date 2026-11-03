/* MDSSPL code modification file 5. Version 0.5.1, 2026-11-03.
   SHA-256 of the block: 356001b83ae5b3976c98ad8a67380701e359f5ff32d45f564c433cac4916d1f2
   CONFIDENTIAL. (c) MDSSPL. All rights reserved. */
/* ===== MDSSPL change 2026-11-03 v0.5.1: keep the original ESRS and HSE services (their data formats unchanged) in place of the new duplicates, and add the missing modules to them ===== */
(function(){
var N=function(v){return parseFloat(v)||0},ST=['Not started','In progress','Done'],TM=function(d,st){if(st=='Done')return 'Done';if(!d)return '-';var n=TXDAYS(d);return n<0?'Overdue':n+' days'},
ESRS=['ESRS 2 General','E1 Climate change','E2 Pollution','E3 Water and marine resources','E4 Biodiversity and ecosystems','E5 Resource use and circular economy','S1 Own workforce','S2 Workers in the value chain','S3 Affected communities','S4 Consumers and end-users','G1 Business conduct'];
/* added modules for ESRS: the CSRD items it did not have */
PGE.esrsx={n:'CSRD additional modules',tabs:[['dash','Dashboard'],['tp','Transition plan'],['vc','Value chain data'],['tag','Digital tagging readiness']],def:{},setl:{},ents:{
 tp:{t:'Transition plan',f:[['el','Element','s',['GHG reduction targets','Decarbonisation levers','CapEx and OpEx plan','Locked-in emissions','Paris (1.5°C) alignment','Role of the board','Progress against the plan']],['txt','Disclosure','t'],['own','Owner','t'],['st','Status','s',ST]]},
 vc:{t:'Value chain data',f:[['tier','Part of the value chain','s',['Upstream','Own operations','Downstream']],['who','Partner or supplier','t'],['top','Topic','s',ESRS],['req','Asked on','d','','blank'],['rec','Received','b'],['est','Estimated (not actual)','b']]},
 tag:{t:'Digital tagging readiness',f:[['it','Item','s',['ESRS XBRL taxonomy chosen','Data points mapped to tags','iXBRL / ESEF report format','Review by the auditor','Filing route agreed']],['note','Note','t'],['due','Due','d','','blank'],['st','Status','s',ST]],c:[['Timing',function(r){return TM(r.due,r.st)}]]}},
 kpi:function(D){var tp=D.rows.tp,vc=D.rows.vc,tg=D.rows.tag,pc=function(a){return a.length?PTR(a.filter(function(x){return x.st=='Done'}).length/a.length*100,1):'-'};return {cards:[['Transition plan elements done',pc(tp),'%'],['Value chain requests answered',vc.length?PTR(vc.filter(function(x){return x.rec}).length/vc.length*100,1):'-','%'],['Estimated value chain data',vc.filter(function(x){return x.est}).length,''],['Tagging items done',pc(tg),'%']],charts:[['Value chain data by topic',PTBY(vc,function(x){return x.top})]]}}};
/* added modules for HSE: ISO 45001 clause check and TRIFR per million hours */
PGE.hsex={n:'Health & Safety Performance additions',tabs:[['dash','Dashboard'],['iso','ISO 45001 check']],def:{},setl:{},ents:{
 iso:{t:'ISO 45001 check',f:[['cl','Clause','s',['4 Context','5 Leadership and worker participation','6 Planning','7 Support','8 Operation','9 Performance evaluation','10 Improvement']],['rq','Requirement','t'],['st','Status','s',['Not started','Partly met','Met']],['ev','Evidence','t']]}},
 kpi:function(D){var k={};try{k=HK(HFY())}catch(e){}var h=N(k.h),I=D.rows.iso;return {cards:[['LTIFR',k.ltifr===null||k.ltifr===undefined?'-':k.ltifr,'per million hours'],['TRIFR',h?PTR(N(k.rec)*1e6/h,2):'-','per million hours'],['TRIR',k.trir===null||k.trir===undefined?'-':k.trir,'per 200,000 hours'],['ISO 45001 requirements met',I.filter(function(x){return x.st=='Met'}).length+' of '+I.length,'']],charts:[['ISO 45001 requirements by status',PTBY(I,function(x){return x.st})]]}}};
['esrsx','hsex'].forEach(function(id){PU[id]={tab:'dash',msg:''};DLB[id]=function(){return PTREPT(id)}});
/* move anything already typed into the duplicates */
try{var T=PTD(),mv=function(a,b,ks){if(!T[a])return;var d=PD(b);ks.forEach(function(k){var r=(T[a].rows||{})[k]||[];if(r.length&&!d.rows[k].length){d.rows[k]=r.map(function(x){return Object.assign({},x,{id:'r'+(d.n++)})})}})};mv('csrd','esrsx',['tp','vc','tag']);mv('hsp','hsex',['iso']);PTSAVE()}catch(e){}
/* remove the duplicates from the service list */
['csrd','hsp'].forEach(function(id){for(var i=S.length-1;i>=0;i--)if(S[i].id==id)S.splice(i,1);var j=PORTS.indexOf(id);if(j>-1)PORTS.splice(j,1);SVGRP.forEach(function(g){g[3]=g[3].filter(function(x){return x!=id})});try{CART=CART.filter(function(x){return x!=id})}catch(e){}});
/* the originals take the places in the new groups */
var mvg=function(id,to,first){SVGRP.forEach(function(g){if(g[0]!=to)g[3]=g[3].filter(function(x){return x!=id})});var g=SVGRP.filter(function(q){return q[0]==to})[0];if(g&&g[3].indexOf(id)<0){if(first!==undefined)g[3].splice(first,0,id);else g[3].push(id)}};
mvg('esrs','reg',1);mvg('hse','soc');
var es=S.filter(function(x){return x.id=='esrs'})[0];if(es){es.n='EU CSRD / ESRS Reporting';es.m+=' Also includes the CSRD transition plan disclosures, value chain data collection and digital tagging (XBRL) readiness.'}
var hs=S.filter(function(x){return x.id=='hse'})[0];if(hs){hs.n='Health & Safety Performance (HSE Management)';hs.m+=' Also includes LTIFR and TRIFR per million hours and an ISO 45001 clause-by-clause compliance check.'}
var PG0x=PG;PG=function(s){var h=PG0x.apply(this,arguments);if(s&&(s.id=='esrs'||s.id=='hse'))h+='<div class="card" style="border-top:3px solid var(--ac,#1a56db)"><h3 style="margin:0">'+(s.id=='esrs'?'Added CSRD modules':'Added performance modules')+'</h3><p class="mut" style="margin:4px 0 0">'+(s.id=='esrs'?'Transition plan, value chain data and digital tagging readiness. Your ESRS data above is unchanged.':'TRIFR per million hours and the ISO 45001 check. Your HSE data above is unchanged.')+'</p></div>'+PTV(s.id=='esrs'?'esrsx':'hsex');return h};
})();
/* ===== end of change ===== */
