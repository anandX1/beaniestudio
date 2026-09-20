// Exported UI markup for studio.mjs — own module so the page can evolve
// without touching server logic. ONE <script> block (the boot self-check
// parses it with new Function, so: no top-level await, no backticks, no ${,
// backslashes doubled inside client strings/regexes).
export const UI = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Content Studio — Beanie Studio</title>
<style>
:root{--bg:#0b0d10;--panel:#12151a;--panel2:#171b21;--line:#242a33;--line2:#2f3742;--txt:#e9ecf2;--dim:#8b95a5;--dim2:#5c6674;--amber:#ffb547;--amber2:#ffcf85;--green:#4ade80;--red:#f87171;--blue:#7dd3fc}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;background:radial-gradient(1200px 500px at 70% -10%, #161b22 0%, var(--bg) 55%);color:var(--txt);font:14px/1.55 'Segoe UI',system-ui,sans-serif;display:flex;flex-direction:column}
::selection{background:rgba(255,181,71,.25)}
::-webkit-scrollbar{width:10px;height:10px}::-webkit-scrollbar-thumb{background:#2a313c;border-radius:8px;border:2px solid var(--bg)}::-webkit-scrollbar-track{background:transparent}
button{background:var(--amber);color:#141005;border:0;border-radius:9px;padding:9px 14px;font-weight:700;cursor:pointer;font-size:13px;transition:filter .12s, transform .05s}
button:hover{filter:brightness(1.08)}button:active{transform:translateY(1px)}
button.sec{background:var(--panel2);color:var(--amber2);border:1px solid var(--line2)}
button.sec:hover{border-color:var(--amber)}
button.ghost{background:transparent;color:var(--dim);border:1px solid var(--line)}
button.ghost:hover{color:var(--txt);border-color:var(--line2)}
button:disabled{opacity:.45;cursor:wait;filter:none}
input,select,textarea{width:100%;background:#0d1014;color:var(--txt);border:1px solid var(--line);border-radius:9px;padding:9px 10px;font:inherit;margin:5px 0 12px;transition:border-color .12s, box-shadow .12s}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--amber);box-shadow:0 0 0 3px rgba(255,181,71,.12)}
input::placeholder,textarea::placeholder{color:var(--dim2)}
label{font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;font-weight:600}
hr{border:0;border-top:1px solid var(--line);margin:14px 0}
/* ---- topbar ---- */
#top{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:18px;padding:0 18px;height:52px;background:rgba(11,13,16,.85);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
#logo{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.06em;font-size:13px;white-space:nowrap}
#logo .cube{width:22px;height:22px;border-radius:6px;background:linear-gradient(135deg,var(--amber),#ff8a3d);display:grid;place-items:center;color:#141005;font-size:12px;font-weight:900}
#logo small{color:var(--dim2);font-weight:600;letter-spacing:.14em}
nav{display:flex;gap:4px;flex:1;overflow-x:auto;scrollbar-width:none}
nav::-webkit-scrollbar{display:none}
nav button{background:transparent;color:var(--dim);border:0;border-radius:8px;padding:7px 13px;font-weight:600;font-size:13px;white-space:nowrap;position:relative}
nav button:hover{color:var(--txt);background:var(--panel2)}
nav button.on{color:var(--amber);background:rgba(255,181,71,.08)}
nav button .n{font-size:10px;background:var(--line2);color:var(--txt);border-radius:99px;padding:0 6px;margin-left:6px;vertical-align:1px}
#topright{display:flex;align-items:center;gap:10px;white-space:nowrap}
#savedat{font-size:11px;color:var(--dim2);max-width:220px;overflow:hidden;text-overflow:ellipsis}
/* ---- layout ---- */
main{flex:1;width:100%;max-width:1560px;margin:0 auto;padding:16px 18px 64px;display:none}
main.on{display:block}
.grid3{display:grid;grid-template-columns:280px minmax(0,1fr) 300px;gap:16px;align-items:start}
.grid2{display:grid;grid-template-columns:280px minmax(0,1fr);gap:16px;align-items:start}
@media(max-width:1180px){.grid3{grid-template-columns:260px minmax(0,1fr)}.rail-r{display:none}}
@media(max-width:860px){.grid3,.grid2{grid-template-columns:1fr}}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px}
.card h2{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);margin:0 0 12px;display:flex;align-items:center;gap:8px}
.card h2 .spacer{flex:1}
.rail-sticky{position:sticky;top:66px;display:flex;flex-direction:column;gap:16px}
/* ---- chips ---- */
.chip{display:inline-flex;align-items:center;gap:6px;margin:3px;padding:4px 10px;border:1px solid var(--line2);border-radius:99px;font-size:12px;cursor:pointer;user-select:none;background:var(--panel2);transition:border-color .1s}
.chip:hover{border-color:var(--amber)}
.chip.on{background:var(--amber);color:#141005;border-color:var(--amber);font-weight:700}
.chip .x{opacity:.6;font-weight:900}
.chip .x:hover{opacity:1;color:var(--red)}
/* ---- editor ---- */
#wbar{height:4px;border-radius:4px;background:var(--line);overflow:hidden;margin:-6px 0 6px}
#wbarfill{height:100%;width:0%;background:var(--red);transition:width .25s, background .25s}
#md{min-height:46vh;font:13px/1.7 ui-monospace,Consolas,'Cascadia Mono',monospace;resize:vertical}
.btnrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
#pubbar{position:sticky;bottom:12px;display:flex;gap:10px;align-items:center;background:linear-gradient(0deg,var(--panel) 80%,transparent);padding:12px 0 4px;margin-top:10px}
#pubbar .grow{flex:1}
#publish{font-size:14px;padding:11px 22px;box-shadow:0 6px 20px rgba(255,181,71,.15)}
#imgs{display:flex;flex-direction:column;gap:6px}
#imgs .imf{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--dim);background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:6px 10px}
#imgs img{width:52px;height:36px;object-fit:cover;border-radius:6px;border:1px solid var(--line2)}
/* ---- seo rail ---- */
#scorewrap{display:flex;align-items:center;gap:14px;margin-bottom:10px}
#score{font-size:38px;font-weight:800;min-width:74px;text-align:center}
#scorebar{flex:1;height:6px;border-radius:6px;background:var(--line);overflow:hidden}
#scorefill{height:100%;width:0%;transition:width .3s, background .3s}
.check{display:flex;gap:8px;padding:3px 0;font-size:12.5px;align-items:baseline}
.check b{font-size:13px}.ok b{color:var(--green)}.bad b{color:var(--red)}
.check .d{color:var(--dim2);font-size:11px}
/* ---- lists / rows ---- */
.rowitem{padding:8px 10px;border:1px solid transparent;border-bottom:1px solid var(--line);font-size:13px;border-radius:9px;cursor:default;transition:background .1s}
.rowitem:hover{background:var(--panel2);border-color:var(--line)}
.rowitem.click{cursor:pointer}
.rowitem .d{color:var(--dim);font-size:11px;margin-top:2px;display:flex;gap:8px;align-items:center}
.badge{font-size:10px;color:var(--amber);border:1px solid var(--amber);border-radius:5px;padding:0 5px;font-weight:700}
.badge.gray{color:var(--dim);border-color:var(--line2)}
/* ---- queue cards ---- */
#qgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.qcard{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px;transition:border-color .12s}
.qcard:hover{border-color:var(--line2)}
.qcard .t{font-weight:700;font-size:14px;line-height:1.35}
.qcard .m{color:var(--dim);font-size:11.5px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.qcard .acts{display:flex;gap:8px;margin-top:4px}
.empty{color:var(--dim);font-size:13px;border:1px dashed var(--line2);border-radius:12px;padding:22px;text-align:center}
/* ---- rank table ---- */
.rtab{width:100%;border-collapse:collapse;font-size:13px}
.rtab td{padding:5px 6px;border-bottom:1px solid var(--line)}
.rtab td.p{width:48px;font-weight:800}
.rtab td.s{width:70px}
.rtab td.dl{width:86px;text-align:right}
.pos1{color:var(--green)}.pos10{color:var(--amber2)}.posfar{color:var(--dim)}
.spark{stroke:var(--blue);fill:none;stroke-width:1.5}
.sparkfill{fill:rgba(125,211,252,.12);stroke:none}
/* ---- toasts ---- */
#toasts{position:fixed;top:62px;right:16px;z-index:100;display:flex;flex-direction:column;gap:8px;max-width:380px}
.toast{background:var(--panel2);border:1px solid var(--line2);border-left:3px solid var(--amber);border-radius:10px;padding:10px 14px;font-size:13px;box-shadow:0 8px 30px rgba(0,0,0,.45);animation:tin .18s ease-out}
.toast.err{border-left-color:var(--red)}
.toast.ok{border-left-color:var(--green)}
@keyframes tin{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}
/* ---- log drawer ---- */
#logbar{position:fixed;left:0;right:0;bottom:0;z-index:60;background:rgba(13,16,20,.92);backdrop-filter:blur(8px);border-top:1px solid var(--line);font:11.5px/1.5 ui-monospace,monospace;color:var(--dim)}
#logbar .in{max-width:1560px;margin:0 auto;padding:6px 18px;display:flex;gap:10px;align-items:center;cursor:pointer}
#logbar .last{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
#logbar .cnt{color:var(--dim2)}
#logdrawer{display:none;max-height:34vh;overflow:auto;padding:4px 18px 12px;white-space:pre-wrap}
#logdrawer.open{display:block}
kbd{background:var(--panel2);border:1px solid var(--line2);border-bottom-width:2px;border-radius:5px;padding:0 5px;font-size:10.5px;font-family:ui-monospace,monospace;color:var(--dim)}
.hint{color:var(--dim2);font-size:11.5px;margin-top:6px}
a{color:var(--amber)}
.searchbox{position:relative}
.searchbox input{margin:4px 0 8px;padding-left:28px}
.searchbox:before{content:'⌕';position:absolute;left:9px;top:7px;color:var(--dim2);font-size:14px}
.ideat{font-size:11px;color:var(--dim2);text-transform:uppercase;letter-spacing:.08em;margin:10px 0 4px;font-weight:700}
</style></head><body>

<header id="top">
  <div id="logo"><span class="cube">B</span>CONTENT STUDIO <small>BEANIE STUDIO</small></div>
  <nav id="tabs">
    <button data-tab="compose" class="on">✍️ Compose</button>
    <button data-tab="queue">📥 Queue <span class="n" id="nqueue">0</span></button>
    <button data-tab="rank">📈 Rankings</button>
    <button data-tab="traffic">🚀 Traffic</button>
    <button data-tab="posts">🗂 Posts <span class="n" id="nposts">0</span></button>
  </nav>
  <div id="topright">
    <span id="savedat"></span>
    <button class="ghost" id="discard" style="display:none;padding:6px 10px;font-size:12px">discard draft</button>
    <button class="sec" id="deploy" style="padding:7px 12px;font-size:12px">Deploy site</button>
  </div>
</header>

<!-- ============ COMPOSE ============ -->
<main id="tab-compose" class="on">
  <div class="grid3">
    <div class="rail-sticky">
      <div class="card">
        <h2>Ideas <span class="spacer"></span><span id="ideacount" style="color:var(--dim2);letter-spacing:0;text-transform:none"></span></h2>
        <div class="searchbox"><input id="ideasearch" placeholder="Filter 100 ideas…"></div>
        <div id="ideaposts" style="max-height:44vh;overflow:auto"></div>
        <div class="hint">Live from BLOG-100.md — click one to fill track, angle and title.</div>
      </div>
      <div class="card">
        <h2>Keywords <span class="spacer"></span><button class="ghost" id="reharvest" style="padding:3px 9px;font-size:11px">↻ harvest</button></h2>
        <div class="searchbox"><input id="kwsearch" placeholder="Filter queries…"></div>
        <div id="kwlist" style="max-height:26vh;overflow:auto"></div>
        <hr>
        <label>Selected — click ✕ to remove</label>
        <div id="chosen" style="min-height:30px;margin-top:6px"></div>
      </div>
    </div>

    <div class="card">
      <h2>Compose</h2>
      <div style="display:flex;gap:10px">
        <div style="flex:1"><label>Topic track</label>
          <select id="track"><option value="game">Game — STATIC itself</option><option value="indie">Indie dev — lessons &amp; process</option><option value="technical">Roblox technical — how it's built</option></select>
        </div>
        <div style="max-width:150px"><label>Tag</label>
          <select id="tag"><option>design</option><option>production</option><option>systems</option></select>
        </div>
      </div>
      <label>Post angle — what's the story?</label>
      <input id="angle" placeholder="e.g. how the Hunter's hearing actually works">
      <div style="display:flex;gap:10px">
        <div style="flex:1"><label>Title</label><input id="title" placeholder="Auto-filled by Groq or an idea"></div>
        <div style="flex:1"><label>Meta description</label><input id="desc" maxlength="170" placeholder="50–160 chars, one keyword"></div>
      </div>
      <label>Markdown — put [photo] on its own line wherever an image should sit</label>
      <textarea id="md" placeholder="Draft it with Groq (Ctrl+D), load a queued post, or just write…&#10;&#10;Each [photo] line becomes an image slot — attached images fill the slots in order."></textarea>
      <div id="wbar"><div id="wbarfill"></div></div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <button class="sec" id="addphoto" style="padding:4px 10px;font-size:11px">＋ [photo] at cursor</button>
        <span id="wordcount" style="font-size:11.5px;color:var(--dim)">0 words · target 1,000</span>
        <span class="spacer" style="flex:1"></span>
        <span class="hint" style="margin:0"><kbd>Ctrl</kbd>+<kbd>D</kbd> draft · <kbd>Ctrl</kbd>+<kbd>Enter</kbd> publish</span>
      </div>
      <div class="btnrow">
        <button id="draft">✨ Draft with Groq</button>
        <button class="sec" id="humanize">🧽 Humanize pass</button>
        <button class="sec" id="adapt">📣 Adapt for socials</button>
        <label class="sec" style="border:1px solid var(--line2);border-radius:9px;padding:9px 14px;cursor:pointer;font-size:13px;font-weight:700;color:var(--amber2)">🖼 Attach images<input type="file" id="imgfile" accept="image/*" multiple style="display:none"></label>
      </div>
      <div id="share" style="margin-top:10px"></div>
      <div id="imgs" style="margin-top:8px"></div>
      <div id="pubbar">
        <label style="text-transform:none;letter-spacing:0;display:flex;align-items:center;gap:7px;font-size:12.5px"><input type="checkbox" id="asDraft" style="width:auto;margin:0">save as hidden draft</label>
        <span class="grow"></span>
        <button id="publish">Publish to blog →</button>
      </div>
    </div>

    <div class="rail-sticky rail-r">
      <div class="card">
        <h2>SEO lint</h2>
        <div id="scorewrap"><div id="score">–</div><div id="scorebar"><div id="scorefill"></div></div></div>
        <div id="checks"></div>
      </div>
      <div class="card">
        <h2>Traffic <span class="spacer"></span><button class="ghost" id="statrefresh" style="padding:3px 9px;font-size:11px">↻</button></h2>
        <div id="stats" style="font-size:12.5px;color:var(--dim)">loading…</div>
      </div>
    </div>
  </div>
</main>

<!-- ============ QUEUE ============ -->
<main id="tab-queue">
  <div class="card">
    <h2>Publishing queue <span class="spacer"></span><span class="hint" id="qmeta" style="margin:0"></span></h2>
    <div id="qgrid"></div>
    <div class="hint">Pre-written posts (905–1,000+ words, keyword-mapped, 2 photo slots each). Load one → personalize the intro → add images → publish. Publishing auto-removes it from the queue.</div>
  </div>
</main>

<!-- ============ RANKINGS ============ -->
<main id="tab-rank">
  <div class="card">
    <h2>Rank tracker <span class="spacer"></span>
      <button class="sec" id="rankrun" style="padding:6px 12px;font-size:12px">▶ Track rankings now</button>
      <button class="ghost" id="rankrefresh" style="padding:6px 10px;font-size:12px">↻</button>
    </h2>
    <div id="rankmeta" class="hint" style="margin:0 0 10px"></div>
    <div id="rankpanel" style="color:var(--dim);font-size:13px">loading…</div>
    <div class="hint">Real Bing + DuckDuckGo SERP positions via OpenSERP (local Chrome). ~5 min per full run; green = top 3, amber = top 10, sparkline = last runs (up = better). Google positions live in Search Console — Google blocks anonymous scraping.</div>
  </div>
</main>

<!-- ============ TRAFFIC ============ -->
<main id="tab-traffic">
  <div class="grid2">
    <div></div>
    <div class="card">
      <h2>Traffic <span class="spacer"></span><button class="ghost" id="statrefresh2" style="padding:3px 9px;font-size:11px">↻</button></h2>
      <div id="stats2" style="font-size:12.5px;color:var(--dim)">loading…</div>
      <hr>
      <h2>Trending queries</h2>
      <div id="kwtop" style="font-size:12.5px"></div>
    </div>
  </div>
</main>

<!-- ============ POSTS ============ -->
<main id="tab-posts">
  <div class="card">
    <h2>Blog posts <span class="spacer"></span><span class="hint" id="pmeta" style="margin:0"></span></h2>
    <div id="posts"></div>
  </div>
</main>

<div id="toasts"></div>
<div id="logbar"><div class="in" id="logtoggle"><span class="cnt" id="logcount">0</span><span class="last" id="loglast">ready — click for activity log</span><span>▲</span></div><div id="logdrawer">ready.</div></div>

<script>
// ================= utilities =================
var chosen = [];
var images = [];
var IDEAS = null;
var ideaDone = 0, ideaTotal = 0;
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function toast(msg,kind,ms){var t=document.createElement('div');t.className='toast'+(kind?' '+kind:'');t.innerHTML=msg;$('toasts').appendChild(t);setTimeout(function(){t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(function(){t.remove()},320)},ms||4200)}
var logN=0;
function log(m){var l=$('logdrawer');l.textContent+=m;l.scrollTop=l.scrollHeight;logN++;$('logcount').textContent=logN;var lines=(l.textContent||'').trim().split('\\n');$('loglast').textContent=lines[lines.length-1]||''}
async function api(path,body){var r=await fetch(path,body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{});var d=await r.json().catch(function(){return{error:'bad response'}});if(!r.ok)throw new Error(d.error||r.status);return d}
function trk(){return $('track').value}

// ================= tabs =================
function showTab(name){
  document.querySelectorAll('main').forEach(function(m){m.classList.toggle('on',m.id==='tab-'+name)});
  document.querySelectorAll('#tabs button').forEach(function(b){b.classList.toggle('on',b.dataset.tab===name)});
  try{localStorage.setItem('studio.tab',name)}catch(e){}
}
document.querySelectorAll('#tabs button').forEach(function(b){b.onclick=function(){showTab(b.dataset.tab)}});
try{var t0=localStorage.getItem('studio.tab');if(t0&&document.getElementById('tab-'+t0))showTab(t0)}catch(e){}

// ================= keywords =================
var allKws=[];
function renderChosen(){
  var el=$('chosen');el.innerHTML='';
  if(!chosen.length){el.innerHTML='<span style="color:var(--dim2);font-size:12px">none yet — click queries on the left</span>';return}
  chosen.forEach(function(k,i){
    var c=document.createElement('span');c.className='chip on';
    c.innerHTML='<span>'+esc(k)+'</span><span class="x" title="remove">✕</span>';
    c.querySelector('.x').onclick=function(ev){ev.stopPropagation();chosen.splice(i,1);renderChosen();renderKws(allKws);lint();queueSave()};
    el.appendChild(c);
  });
}
function renderKws(list){
  var el=$('kwlist');el.innerHTML='';
  if(!list.length){el.innerHTML='<div class="empty" style="padding:12px">no matching queries</div>';return}
  list.forEach(function(k){
    var s=document.createElement('span');s.className='chip'+(chosen.indexOf(k)>=0?' on':'');s.textContent=k;
    s.onclick=function(){
      if(chosen.indexOf(k)<0){chosen.push(k);s.classList.add('on');renderChosen();lint();queueSave()}
      else{chosen.splice(chosen.indexOf(k),1);s.classList.remove('on');renderChosen();lint();queueSave()}
    };
    el.appendChild(s);
  });
}
async function loadKeywords(){
  try{
    var d=await api('/api/keywords?track='+trk());
    allKws=d.keywords||[];
    applyKwFilter();
  }catch(e){log('keywords: '+e.message+'\\n')}
}
function applyKwFilter(){var q=($('kwsearch').value||'').toLowerCase();renderKws(allKws.filter(function(k){return !q||k.indexOf(q)>=0}))}
$('kwsearch').oninput=applyKwFilter;
$('reharvest').onclick=function(){var b=this;b.disabled=true;b.textContent='harvesting…';api('/api/harvest?track='+trk(),{}).then(function(d){allKws=d.keywords||[];applyKwFilter();toast('harvested '+allKws.length+' fresh queries','ok')}).catch(function(e){toast('harvest failed: '+e.message,'err')}).finally(function(){b.disabled=false;b.textContent='↻ harvest'})};

// ================= idea bank (searchable) =================
async function loadIdeas(){
  try{
    var d=await api('/api/ideas');IDEAS=d;
    ideaDone=d.done;ideaTotal=d.total;
    $('ideacount').textContent=d.done+'/'+d.total+' published';
    renderIdeas('');
  }catch(e){$('ideaposts').innerHTML='<div class="empty" style="padding:12px">'+esc(e.message)+'</div>'}
}
function renderIdeas(q){
  var el=$('ideaposts');el.innerHTML='';
  if(!IDEAS)return;
  q=(q||'').toLowerCase();
  IDEAS.tiers.forEach(function(t){
    var hits=t.ideas.filter(function(i){return !q||i.title.indexOf(q)>=0||i.note.toLowerCase().indexOf(q)>=0||String(i.n)===q});
    if(!hits.length)return;
    var h=document.createElement('div');h.className='ideat';h.textContent='TIER '+t.tier+' · '+t.label.split('·')[0].trim();el.appendChild(h);
    hits.forEach(function(i){
      var e=document.createElement('div');e.className='rowitem click';
      if(i.done){e.style.opacity='.45';e.innerHTML='<div>✓ #'+i.n+' '+esc(i.title)+'</div>';}
      else e.innerHTML='<div>#'+i.n+' '+esc(i.title)+'</div><div class="d">'+esc(i.note.slice(0,70))+(i.note.length>70?'…':'')+'</div>';
      e.title=i.done?'already published':'load idea #'+i.n;
      e.onclick=function(){
        if(i.done)return;
        $('track').value=i.track;loadKeywords();
        $('angle').value=i.title+' — '+i.note;
        if(!$('title').value){
          var t=i.title.replace(/\\b\\w/g,function(c){return c.toUpperCase()});
          if(t.length>46)t=t.slice(0,46).replace(/\\s\\S*$/,'');
          $('title').value=t;
        }
        queueSave();showTab('compose');
        toast('idea #'+i.n+' loaded — angle + track set','ok');
        log('idea #'+i.n+' loaded\\\\n');
      };
      el.appendChild(e);
    });
  });
  if(!el.children.length)el.innerHTML='<div class="empty" style="padding:12px">nothing matches "'+esc(q)+'"</div>';
}
$('ideasearch').oninput=function(){renderIdeas(this.value)};

// ================= posts =================
async function loadPosts(){
  try{
    var d=await api('/api/posts');var el=$('posts');el.innerHTML='';
    $('nposts').textContent=d.posts.length;
    $('pmeta').textContent=d.posts.length+' posts · '+d.posts.filter(function(p){return p.draft}).length+' hidden drafts';
    d.posts.forEach(function(p){
      var e=document.createElement('div');e.className='rowitem';
      e.innerHTML='<div>'+esc(p.title)+(p.draft?' <span class="badge">draft</span>':'')+'</div><div class="d">'+esc(p.pubDate||'')+' · '+esc(p.file)+'</div>';
      el.appendChild(e);
    });
    if(!d.posts.length)el.innerHTML='<div class="empty">no posts yet — publish your first from Compose</div>';
  }catch(e){}
}

// ================= queue =================
async function loadQueue(){
  try{
    var d=await api('/api/queue');var el=$('qgrid');el.innerHTML='';
    $('nqueue').textContent=d.queue.length;
    $('qmeta').textContent=d.queue.length+' ready · ~'+d.queue.length+' days of runway at 1/day';
    if(!d.queue.length){el.innerHTML='<div class="empty">queue empty — write new posts or refill from BLOG-100 ideas</div>';return}
    d.queue.forEach(function(q){
      var c=document.createElement('div');c.className='qcard';
      c.innerHTML='<div class="t">'+esc(q.title)+'</div><div class="m"><span class="badge gray">'+q.words.toLocaleString()+' words</span>'+(q.idea?'<span class="badge">idea #'+q.idea+'</span>':'')+'</div>';
      var acts=document.createElement('div');acts.className='acts';
      var load=document.createElement('button');load.textContent='Load into editor';
      var del=document.createElement('button');del.className='ghost';del.textContent='✕';
      del.title='remove from queue';
      load.onclick=function(){
        if(!window.confirm('Load "'+q.title+'" into the editor? Unsaved edits in the editor are replaced.'))return;
        api('/api/queue/load',{id:q.id}).then(function(p){
          chosen=(p.keywords||[]).slice(0,6);images=[];
          $('title').value=p.title||'';$('desc').value=p.description||'';$('md').value=p.markdown||'';
          $('tag').value=['design','production','systems'].indexOf(p.tag)>=0?p.tag:'design';
          $('angle').value='';
          renderChosen();renderImgs();lint();countWords();queueSave();showTab('compose');
          toast('loaded — personalize the intro, add images, publish','ok',6000);
          log('queued post loaded: '+q.title+'\\n');
        }).catch(function(err){toast('queue load failed: '+err.message,'err')});
      };
      del.onclick=function(){
        if(!window.confirm('Remove "'+q.title+'" from the queue? The draft file is deleted.'))return;
        api('/api/queue/drop',{id:q.id}).then(function(){loadQueue();toast('removed from queue')}).catch(function(e){toast(e.message,'err')});
      };
      acts.appendChild(load);acts.appendChild(del);c.appendChild(acts);el.appendChild(c);
    });
  }catch(e){$('qgrid').innerHTML='<div class="empty">'+esc(e.message)+'</div>'}
}

// ================= SEO lint =================
var lintTimer=null;
function lint(){
  clearTimeout(lintTimer);
  lintTimer=setTimeout(function(){
    fetch('/api/seo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:$('title').value,description:$('desc').value,markdown:$('md').value,keywords:chosen})})
    .then(function(r){return r.json()}).then(function(d){
      $('score').textContent=d.score;
      var col=d.score>=80?'var(--green)':d.score>=55?'var(--amber)':'var(--red)';
      $('score').style.color=col;$('scorefill').style.width=d.score+'%';$('scorefill').style.background=col;
      var el=$('checks');el.innerHTML='';
      d.checks.forEach(function(c){
        var e=document.createElement('div');e.className='check '+(c.ok?'ok':'bad');
        e.innerHTML='<b>'+(c.ok?'✓':'✗')+'</b><span>'+esc(c.label)+(c.detail?' <span class="d">'+esc(c.detail)+'</span>':'')+'</span>';
        el.appendChild(e);
      });
    });
  },250);
}

// ================= word count + photo =================
function countWords(){
  var t=$('md').value.replace(/\\[\\s*photo\\s*\\]/gi,' ').replace(/[#*\\x60>\\-\\[\\]()!]/g,' ').replace(/\\s+/g,' ').trim();
  var w=t?t.split(/\\s+/).filter(Boolean).length:0;
  $('wordcount').textContent=w.toLocaleString()+' words · target 1,000'+(w>=900?' ✓':'');
  var pct=Math.min(100,Math.round(w/1000*100));
  $('wbarfill').style.width=pct+'%';
  var col=w>=900?'var(--green)':w>=600?'var(--amber)':'var(--red)';
  $('wbarfill').style.background=col;
  $('wordcount').style.color=w>=900?'var(--green)':w>=600?'var(--amber)':'var(--dim)';
}
$('addphoto').onclick=function(){
  var ta=$('md');var pos=ta.selectionStart!=null?ta.selectionStart:ta.value.length;
  var before=ta.value.slice(0,pos),after=ta.value.slice(pos);
  var pad=(before&&!/\\n\\s*$/.test(before)?'\\n\\n':'')+'[photo]\\n\\n';
  ta.value=before+pad+after;ta.focus();ta.selectionStart=ta.selectionEnd=pos+pad.length;
  lint();countWords();queueSave();
};

// ================= groq actions =================
$('draft').onclick=function(){
  var b=this;
  if(!$('angle').value){toast('Add an angle first — what is this post about?','err');$('angle').focus();return}
  b.disabled=true;b.innerHTML='✍ writing…';log('\\ngroq is writing…\\n');
  api('/api/draft',{angle:$('angle').value,keywords:chosen,track:trk()}).then(function(d){
    $('title').value=d.title;$('desc').value=d.description;$('md').value=d.markdown;
    lint();countWords();queueSave();toast('draft ready — read it, then make it yours','ok');
    log('draft ready — edit freely.\\n');
  }).catch(function(e){toast('draft failed: '+e.message,'err');log('draft: '+e.message+'\\n')})
  .finally(function(){b.disabled=false;b.innerHTML='✨ Draft with Groq'});
};
$('humanize').onclick=function(){
  var b=this;
  if(!$('md').value){toast('nothing to humanize','err');return}
  b.disabled=true;b.textContent='polishing…';log('\\nhumanize pass…\\n');
  api('/api/humanize',{markdown:$('md').value}).then(function(d){
    $('md').value=d.markdown;lint();countWords();queueSave();toast('humanized — length preserved','ok');
  }).catch(function(e){toast('humanize failed: '+e.message,'err')})
  .finally(function(){b.disabled=false;b.textContent='🧽 Humanize pass'});
};

// ================= images =================
function compressImg(f,done){
  var finish=function(data,name,origKB){done({name:name,data:data,orig:origKB})};
  var origKB=Math.round(f.size/1024);
  if(f.type==='image/gif'||f.size<150*1024){var r0=new FileReader();r0.onload=function(){finish(String(r0.result),f.name,origKB)};r0.readAsDataURL(f);return}
  var rd=new FileReader();
  rd.onload=function(){
    var im=new Image();
    im.onload=function(){
      var MAX=1600,sc=Math.min(1,MAX/Math.max(im.width,im.height));
      var c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);
      c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      var data=c.toDataURL('image/webp',0.82),name=f.name.replace(/\\.\\w+$/,'')+'.webp';
      if(data.indexOf('data:image/webp')!==0){data=c.toDataURL('image/jpeg',0.85);name=f.name.replace(/\\.\\w+$/,'')+'.jpg'}
      finish(data,name,origKB);
    };
    im.onerror=function(){var r1=new FileReader();r1.onload=function(){finish(String(r1.result),f.name,origKB)};r1.readAsDataURL(f)};
    im.src=String(rd.result);
  };
  rd.readAsDataURL(f);
}
function renderImgs(){
  var el=$('imgs');el.innerHTML='';
  if(!images.length){el.innerHTML='<span style="font-size:12px;color:var(--dim2)">no images attached — posts with a real image get more clicks everywhere</span>';return}
  images.forEach(function(img,i){
    var kb=Math.round(img.data.length/1365);
    var e=document.createElement('div');e.className='imf';
    var th=document.createElement('img');th.src=img.data;
    var t=document.createElement('span');t.style.flex='1';
    t.textContent=img.name+' — '+(img.orig&&img.orig>kb?img.orig+' KB → '+kb+' KB':kb+' KB');
    var x=document.createElement('button');x.className='ghost';x.textContent='✕ remove';x.style.padding='2px 8px';x.style.fontSize='11px';
    x.onclick=function(){images.splice(i,1);renderImgs()};
    e.appendChild(th);e.appendChild(t);e.appendChild(x);el.appendChild(e);
  });
}
$('imgfile').onchange=function(){var fs=[].slice.call(this.files);this.value='';fs.forEach(function(f){compressImg(f,function(out){images.push(out);renderImgs()})})};

// ================= adapt (socials) =================
$('adapt').onclick=function(){
  var b=this;
  if(!$('md').value){toast('write or draft the post first','err');return}
  b.disabled=true;b.textContent='adapting…';
  api('/api/adapt',{title:$('title').value,markdown:$('md').value}).then(function(d){
    var el=$('share');el.innerHTML='';
    Object.keys(d.variants).forEach(function(p){
      var v=d.variants[p];
      var box=document.createElement('div');box.style.cssText='border:1px solid var(--line);border-radius:10px;padding:8px;margin-top:6px;font-size:12px';
      box.innerHTML='<b style="color:var(--amber)">'+esc(p.toUpperCase())+'</b> <span style="color:var(--dim)">'+esc(v.note)+'</span>';
      var pre=document.createElement('div');pre.style.cssText='margin:6px 0;white-space:pre-wrap;background:#0d0f12;border-radius:8px;padding:8px';pre.textContent=v.text||'';
      var row=document.createElement('div');row.style.cssText='display:flex;gap:6px';
      var cp=document.createElement('button');cp.className='sec';cp.style.padding='4px 10px';cp.style.fontSize='11px';cp.textContent='Copy';
      cp.onclick=function(){navigator.clipboard.writeText(v.text||'').then(function(){cp.textContent='Copied ✓';toast('copied to clipboard','ok',1500)})};
      row.appendChild(cp);
      if(v.intent){var op=document.createElement('button');op.className='ghost';op.style.padding='4px 10px';op.style.fontSize='11px';op.textContent='Open '+p;op.onclick=function(){window.open(v.intent,'_blank')}};row.appendChild(op);
      box.appendChild(pre);box.appendChild(row);el.appendChild(box);
    });
  }).catch(function(e){toast('adapt failed: '+e.message,'err')})
  .finally(function(){b.disabled=false;b.textContent='📣 Adapt for socials'});
};

// ================= publish + deploy =================
$('publish').onclick=function(){
  var b=this;var asDraft=document.getElementById('asDraft').checked;
  b.disabled=true;b.textContent=asDraft?'saving draft…':'publishing…';log('\\npublishing…\\n');
  api('/api/publish',{title:$('title').value,description:$('desc').value,tag:$('tag').value,markdown:$('md').value,keywords:chosen,images:images,draft:asDraft})
  .then(function(d){
    log('\\n✓ '+(d.draft?'saved as draft post (not on site yet)':'LIVE: '+d.url)+'\\n');
    toast(d.draft?'draft saved — flip draft:false when ready':'<b>Live!</b> <a href="'+d.url+'" target="_blank">'+d.url+'</a>','ok',8000);
    try{localStorage.removeItem(ASKEY)}catch(e){}
    $('savedat').textContent='';$('discard').style.display='none';
    images=[];chosen=[];$('title').value='';$('desc').value='';$('md').value='';$('angle').value='';
    renderImgs();renderChosen();lint();countWords();loadPosts();loadQueue();
    showTab('posts');
  })
  .catch(function(e){toast('publish failed: '+e.message,'err',8000);log('publish: '+e.message+'\\n')})
  .finally(function(){b.disabled=false;b.textContent='Publish to blog →'});
};
$('deploy').onclick=function(){
  var b=this;b.disabled=true;b.textContent='deploying…';log(' deploying: build, push, ping ');
  api('/api/deploy',{}).then(function(d){log(' deploy finished, exit '+d.code+' ');toast(d.code===0?'site deployed ✓':'deploy exited '+d.code,d.code===0?'ok':'err')})
  .catch(function(e){toast('deploy: '+e.message,'err')})
  .finally(function(){b.disabled=false;b.textContent='Deploy site'});
};

// ================= autosave =================
var ASKEY='studio.autosave.v1';
function snapshot(){return {t:$('title').value,d:$('desc').value,m:$('md').value,a:$('angle').value,tag:$('tag').value,ad:$('asDraft').checked,tr:$('track').value,kw:chosen,imgs:images,at:Date.now()}}
function restore(s){$('title').value=s.t||'';$('desc').value=s.d||'';$('md').value=s.m||'';$('angle').value=s.a||'';if(s.tag)$('tag').value=s.tag;$('asDraft').checked=!!s.ad;if(s.tr)$('track').value=s.tr;chosen=Array.isArray(s.kw)?s.kw:[];images=Array.isArray(s.imgs)?s.imgs:[]}
var saveTimer=null;
function queueSave(){
  if(saveTimer)return;
  saveTimer=setTimeout(function(){
    saveTimer=null;
    try{
      var s=snapshot();
      if(s.t||s.m||s.a){localStorage.setItem(ASKEY,JSON.stringify(s));var d=new Date();$('savedat').textContent='saved '+d.toLocaleTimeString();$('discard').style.display=''}
    }catch(e){}
  },800);
}
try{
  var s0=JSON.parse(localStorage.getItem(ASKEY)||'null');
  if(s0&&(s0.t||s0.m||s0.a)){restore(s0);var age=Math.round((Date.now()-s0.at)/60000);$('savedat').textContent='restored ('+(age<1?'just now':age+' min ago')+')';$('discard').style.display='';toast('restored your unsaved draft from last session','ok');log('\\nrestored your unsaved draft from last session.\\n')}
}catch(e){}
$('discard').onclick=function(){
  if(!window.confirm('Discard the current draft? This cannot be undone.'))return;
  try{localStorage.removeItem(ASKEY)}catch(e){}
  images=[];chosen=[];$('title').value='';$('desc').value='';$('md').value='';$('angle').value='';
  $('savedat').textContent='';$('discard').style.display='none';
  renderImgs();renderChosen();lint();countWords();toast('draft discarded');
};
window.addEventListener('beforeunload',function(e){
  var s=null;try{s=JSON.parse(localStorage.getItem(ASKEY)||'null')}catch(err){}
  var cur=snapshot();
  if(cur.t||cur.m||cur.a){e.preventDefault();e.returnValue=''}
});

// ================= inputs =================
$('title').oninput=$('desc').oninput=$('md').oninput=function(){lint();countWords();queueSave()};
$('angle').oninput=queueSave;
$('tag').onchange=$('asDraft').onchange=queueSave;
$('track').onchange=function(){loadKeywords();queueSave()};

// ================= traffic / stats =================
function renderStats(target,data){
  var el=$(target);
  if(!data.configured){
    el.innerHTML='<div style="border:1px solid var(--line);border-radius:10px;padding:12px">'+
    '<b style="color:var(--txt)">Connect Cloudflare Web Analytics (2 min):</b>'+
    '<ol style="margin:8px 0 8px 18px;padding:0;color:var(--dim)">'+
    '<li>dash → My Profile → API Tokens → Create → <i>Web Analytics Reports: Read</i></li>'+
    '<li>add to <code>site/.env</code>:<br><code style="color:var(--amber)">CF_API_TOKEN=…</code><br><code style="color:var(--amber)">CF_SITE_TAG=…</code></li>'+
    '<li>hit ↻ above</li></ol>'+
    '<a href="https://dash.cloudflare.com/?to=/:account/web-analytics" target="_blank">Open Cloudflare analytics ↗</a></div>';
    return;
  }
  el.innerHTML=data.ok?'<b style="color:var(--green)">✓ connected</b> — per-path pageviews flowing.<br><a href="https://dash.cloudflare.com/?to=/:account/web-analytics" target="_blank">Open full analytics ↗</a>':'token issue — check CF_API_TOKEN / CF_SITE_TAG in site/.env';
}
async function loadStats(){
  try{var d=await api('/api/stats');renderStats('stats',d);renderStats('stats2',d)}
  catch(e){$('stats').textContent='stats: '+e.message;$('stats2').textContent=''}
}
async function loadKwTop(){
  try{
    var d=await api('/api/keywords');
    var ks=(d.keywords||[]).slice(0,10);
    var el=$('kwtop');
    el.innerHTML='<div style="line-height:2.2">'+ks.map(function(k){return '<span class="chip" style="cursor:default">'+esc(k)+'</span>'}).join(' ')+'</div><div class="hint">real Google searches people type — refreshed by the harvest button</div>';
  }catch(e){}
}
$('statrefresh').onclick=loadStats;
$('statrefresh2').onclick=loadStats;

// ================= rank tracker =================
function spark(hist){
  var pts=hist.filter(function(h){return h.rank}).map(function(h){return h.rank});
  if(pts.length<2)return '';
  var W=60,H=18,min=Math.min.apply(null,pts),max=Math.max.apply(null,pts);
  var xy=pts.map(function(r,i){
    var x=i/(pts.length-1)*W;
    var y=max===min?H/2:H-((max-r)/(max-min))*(H-4)-2;
    return x.toFixed(1)+','+y.toFixed(1);
  });
  return '<svg width="'+W+'" height="'+H+'" style="display:block"><polyline class="sparkfill" points="'+xy.join(' ')+' '+W+','+H+' 0,'+H+'"/><polyline class="spark" points="'+xy.join(' ')+'"/></svg>';
}
var rankBusy=false;
async function loadRank(){
  try{
    var d=await api('/api/rank');var el=$('rankpanel');var runs=d.runs||[];
    if(!runs.length){el.innerHTML='<div class="empty">no runs yet — hit “Track rankings now” (~5 min, renders real Bing/DDG pages in a hidden Chrome)</div>';$('rankmeta').textContent='';return}
    var last=runs[runs.length-1];var prev=runs.length>1?runs[runs.length-2]:null;
    $('rankmeta').textContent='last run '+new Date(last.date).toLocaleString()+' · '+runs.length+' runs in history';
    var html='';
    Object.keys(last.engineResults).forEach(function(e){
      var prevMap={};
      if(prev&&prev.engineResults&&prev.engineResults[e])prev.engineResults[e].forEach(function(r){prevMap[r.keyword]=r.rank});
      var hist={};
      runs.forEach(function(r){if(r.engineResults&&r.engineResults[e])r.engineResults[e].forEach(function(row){(hist[row.keyword]=hist[row.keyword]||[]).push(row)})});
      html+='<div style="margin:10px 0 6px"><b style="color:var(--txt);text-transform:uppercase;letter-spacing:.08em;font-size:11.5px">'+esc(e)+'</b></div>';
      html+='<table class="rtab">';
      last.engineResults[e].forEach(function(r){
        var cls=r.rank?(r.rank<=3?'pos1':r.rank<=10?'pos10':'posfar'):'posfar';
        var pos=r.rank?('<span class="'+cls+'">#'+r.rank+'</span>'):'<span class="posfar">—</span>';
        var delta='';
        if(r.error)delta='<span style="color:var(--red)">'+esc(r.error)+'</span>';
        else{
          var was=prevMap[r.keyword];
          if(was&&r.rank)delta=r.rank<was?'<span class="pos1">▲'+(was-r.rank)+'</span>':r.rank>was?'<span style="color:var(--red)">▼'+(r.rank-was)+'</span>':'<span style="opacity:.45">=</span>';
          else if(!was&&r.rank)delta='<span class="pos1">★ new</span>';
          else if(was&&!r.rank)delta='<span style="color:var(--red)">dropped</span>';
        }
        html+='<tr><td class="p">'+pos+'</td><td>'+esc(r.keyword)+'</td><td class="s">'+spark(hist[r.keyword]||[])+'</td><td class="dl">'+delta+'</td></tr>';
      });
      html+='</table>';
    });
    el.innerHTML=html;
  }catch(e){$('rankpanel').textContent='rank: '+e.message}
}
$('rankrefresh').onclick=loadRank;
$('rankrun').onclick=function(){
  var b=this;if(rankBusy)return;rankBusy=true;b.disabled=true;b.textContent='starting…';
  api('/api/rank/run',{}).then(function(d){
    if(d.error){toast(d.error,'err');rankBusy=false;b.disabled=false;b.textContent='▶ Track rankings now';return}
    toast('rank tracking started — ~5 min. Panel fills when done.','ok',6000);
    log(' rank tracking started\\n');b.textContent='running…';
    var polls=0;
    var poll=setInterval(function(){
      polls++;loadRank();
      if(polls>12){clearInterval(poll);rankBusy=false;b.disabled=false;b.textContent='▶ Track rankings now'}
    },30000);
    setTimeout(function(){clearInterval(poll);rankBusy=false;b.disabled=false;b.textContent='▶ Track rankings now';loadRank()},330000);
  }).catch(function(e){toast('rank run: '+e.message,'err');rankBusy=false;b.disabled=false;b.textContent='▶ Track rankings now'});
};

// ================= log drawer + shortcuts =================
$('logtoggle').onclick=function(){$('logdrawer').classList.toggle('open')};
document.addEventListener('keydown',function(e){
  if(e.ctrlKey&&!e.shiftKey&&(e.key==='d'||e.key==='D')){e.preventDefault();$('draft').click()}
  else if(e.ctrlKey&&e.key==='Enter'){e.preventDefault();$('publish').click()}
  else if(e.altKey&&e.key>='1'&&e.key<='5'){e.preventDefault();showTab(['compose','queue','rank','traffic','posts'][Number(e.key)-1])}
});

// ================= init =================
loadKeywords();loadIdeas();loadQueue();loadStats();loadKwTop();loadPosts();loadRank();
renderImgs();renderChosen();countWords();lint();
</script></body></html>`;
