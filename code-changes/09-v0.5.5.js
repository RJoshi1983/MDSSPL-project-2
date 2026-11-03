/* MDSSPL code modification file 9. Version 0.5.5, 2026-11-03.
   SHA-256 of the block: 8867cd457b2f3f5fe20779863f3abc08cfcc4ff0eddda72a6319c3b4ea88526d
   CONFIDENTIAL. (c) MDSSPL. All rights reserved. */
/* ===== MDSSPL change 2026-11-03 v0.5.5: licence public key built into the page (front end) and the server (back end); licence checking on ===== */
(function(){
MDS_PUB='{"crv":"P-256","ext":true,"key_ops":["verify"],"kty":"EC","x":"iwAToS9hEzerHwuX2PFMmyoCIfcuA83SFJIPnXUqBAA","y":"MTETQT36-Z3NZyZ4WF-WDTo5ToUpxpE98X3qn8h-4KE"}';
/* the built-in key wins over a key saved on one device, so an old or exposed key saved earlier is no longer trusted */
PUBJ=function(){return (MDS_PUB||SET.pub||'').trim()};
var STKEY0b=STKEY;STKEY=function(){var h=STKEY0b.apply(this,arguments),old=SET.pub&&SET.pub.trim()!=MDS_PUB;return '<div class="card" style="border:2px solid #15803d"><p style="margin:0"><b style="color:#15803d">✓ Licence checking is on.</b> The MDSSPL public key is built into the website and the server (fingerprint <span translate="no">'+esc(JSON.parse(MDS_PUB).x.slice(0,12))+'…</span>). Sign codes with the matching private key file (Documents → MDSSPL-keys) loaded below. The server can also check any code at /api/licence/verify.</p>'+(old?'<p class="warn">A different public key is saved on this device; it is ignored. <button onclick="delete SET.pub;saveSET();R()">Remove it</button></p>':'')+'</div>'+h};
})();
/* ===== end of change ===== */
