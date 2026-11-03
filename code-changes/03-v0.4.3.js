/* MDSSPL code modification file 3. Version 0.4.3, 2026-11-03.
   SHA-256 of the block: a7f9c895aac5fc00a9746f36e7f4cc4e20ef8ec040c511edbb3e62651b9fbbbf
   CONFIDENTIAL. (c) MDSSPL. All rights reserved. */
/* ===== MDSSPL change 2026-11-03 v0.4.3: blank page fix - terms acceptance and sign-in accounts used the same storage key (mdsAcc) ===== */
function ACCMIG(){try{var r=JSON.parse(localStorage.getItem('mdsAcc')||'null');if(r&&typeof r=='object'&&(r.tc||r.tm||r.lm)){if(!localStorage.getItem('mdsTerms'))localStorage.setItem('mdsTerms',JSON.stringify({tc:r.tc,tm:r.tm,lm:r.lm,who:r.who,at:r.at,ua:r.ua}));['tc','tm','lm','who','at','ua'].forEach(function(k){delete r[k]});if(!Array.isArray(r.users))r.users=[];if(!Array.isArray(r.reqs))r.reqs=[];if(!Array.isArray(r.log))r.log=[];if(!r.n)r.n=1;localStorage.setItem('mdsAcc',JSON.stringify(r))}}catch(e){}}
ACCMIG();ACCD=null;
ACCK=function(){try{return JSON.parse(localStorage.getItem('mdsTerms'))||{}}catch(e){return {}}};
ACCSV=function(o){try{localStorage.setItem('mdsTerms',JSON.stringify(o))}catch(e){}};
var ACCL0x=ACCL;ACCL=function(){var a=ACCL0x();if(!a||typeof a!='object'){a=ACCD={users:[],reqs:[],log:[],n:1}}if(!Array.isArray(a.users))a.users=[];if(!Array.isArray(a.reqs))a.reqs=[];if(!Array.isArray(a.log))a.log=[];if(!a.n)a.n=1;return a};
/* ===== end of change ===== */
