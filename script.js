/* ForJeevana ULTIMATE - cinematic (no scrolling)
   Password: linewithoutahook
   Time Capsule: time-capsule.html (opens 24 July 2026)
*/

const MAIN_PASSWORD = "linewithoutahook";

const scenes = Array.from(document.querySelectorAll(".scene"));
let idx = 0;
let isAnimating = false;

const lock = document.getElementById("lock");
const pass = document.getElementById("pass");
const unlockBtn = document.getElementById("unlockBtn");
const lockHint = document.getElementById("lockHint");

const m1 = document.getElementById("m1");
const m2 = document.getElementById("m2");
const m3 = document.getElementById("m3");

const bg = document.getElementById("bg");
const fx = document.getElementById("fx");
const bctx = bg.getContext("2d", { alpha: true });
const fctx = fx.getContext("2d", { alpha: true });

const wipe = document.getElementById("wipe");
const wipePath = document.getElementById("wipePath");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const reply = document.getElementById("reply");
const afterYes = document.getElementById("afterYes");
const surpriseBtn = document.getElementById("surpriseBtn");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");

const flower = document.getElementById("flower");
let flowerTaps = 0;
let lastTap = 0;

function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }
function rand(a,b){ return a + Math.random()*(b-a); }

/* ---------- Canvas sizing ---------- */
function resize(){
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  [bg, fx].forEach(c => {
    c.width = Math.floor(window.innerWidth * dpr);
    c.height = Math.floor(window.innerHeight * dpr);
    c.style.width = window.innerWidth + "px";
    c.style.height = window.innerHeight + "px";
  });
  bctx.setTransform(dpr,0,0,dpr,0,0);
  fctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener("resize", resize, { passive:true });
resize();

/* ---------- Music switching (3 phases) ---------- */
function stopAllMusic(){
  [m1,m2,m3].forEach(a => { try{ a.pause(); }catch{} });
}
function fadeIn(audio, vol=0.45){
  audio.volume = 0;
  audio.play().catch(()=>{});
  gsap.to(audio, { volume: vol, duration: 1.8, ease: "power2.out" });
}
function fadeTo(audioFrom, audioTo){
  if(audioFrom && !audioFrom.paused){
    gsap.to(audioFrom, { volume: 0, duration: 1.0, ease: "power2.out", onComplete: ()=>audioFrom.pause() });
  }
  fadeIn(audioTo);
}
function syncMusicForScene(i){
  // Scenes 0-3 => music1; scenes 4+ => music2 (no music3)
  if(i <= 3){
    if(m1.paused) fadeTo(m2.paused ? (m3.paused? null : m3) : m2, m1);
    if(!m2.paused) gsap.to(m2,{volume:0,duration:.8,onComplete:()=>m2.pause()});
    if(!m3.paused) gsap.to(m3,{volume:0,duration:.8,onComplete:()=>m3.pause()});
  }else{
    if(m2.paused) fadeTo(m1.paused ? (m3.paused? null : m3) : m1, m2);
    if(!m1.paused) gsap.to(m1,{volume:0,duration:.8,onComplete:()=>m1.pause()});
    if(!m3.paused) gsap.to(m3,{volume:0,duration:.8,onComplete:()=>m3.pause()});
  }
}


/* ---------- Wipe (heart-ish path tween) ---------- */
const HEARTS = [
 "M500,860 C380,760 200,640 200,450 C200,310 310,240 390,240 C450,240 485,275 500,305 C515,275 550,240 610,240 C690,240 800,310 800,450 C800,640 620,760 500,860 Z",
 "M500,875 C370,770 210,660 210,465 C210,315 320,245 405,245 C465,245 492,285 500,315 C508,285 535,245 595,245 C680,245 790,315 790,465 C790,660 630,770 500,875 Z",
 "M500,850 C390,770 230,655 230,470 C230,335 330,260 405,260 C465,260 492,290 500,330 C508,290 535,260 595,260 C670,260 770,335 770,470 C770,655 610,770 500,850 Z",
 "M500,870 C385,770 220,650 220,455 C220,320 330,250 405,250 C468,250 495,286 500,320 C505,286 532,250 595,250 C670,250 780,320 780,455 C780,650 615,770 500,870 Z",
 "M500,860 C380,765 205,650 205,455 C205,320 315,250 400,250 C462,250 490,285 500,320 C510,285 538,250 600,250 C685,250 795,320 795,455 C795,650 620,765 500,860 Z",
 "M500,865 C375,770 210,645 210,450 C210,318 320,245 398,245 C460,245 492,282 500,318 C508,282 540,245 602,245 C680,245 790,318 790,450 C790,645 625,770 500,865 Z",
 "M500,855 C382,770 230,660 230,465 C230,330 335,255 410,255 C470,255 495,292 500,328 C505,292 530,255 590,255 C665,255 770,330 770,465 C770,660 618,770 500,855 Z",
 "M500,875 C365,770 200,655 200,460 C200,320 315,240 400,240 C470,240 495,282 500,320 C505,282 530,240 600,240 C685,240 800,320 800,460 C800,655 635,770 500,875 Z"
];
function heartWipe(to){
  wipePath.setAttribute("d", HEARTS[idx % HEARTS.length]);
  gsap.set(wipe, { opacity: 1 });
  const tl = gsap.timeline();
  tl.fromTo(wipePath, { scale: 0.12, transformOrigin:"50% 50%" }, { scale: 2.9, duration: 0.55, ease: "power3.in" })
    .to(wipePath, { attr: { d: HEARTS[to % HEARTS.length] }, duration: 0.55, ease: "power2.inOut" }, 0.15)
    .to(wipePath, { scale: 0.01, duration: 0.65, ease: "power3.out" }, 0.75)
    .to(wipe, { opacity: 0, duration: 0.25, ease: "power1.out" }, 1.25);
  return tl;
}

/* ---------- Background system ---------- */
const heartImgs = ["images/heart1.png","images/heart2.png","images/heart3.png"].map(src => { const im=new Image(); im.src=src; return im; });

let bgMode = "sunset";
let dots = [];
let stars = [];
let nameTargets = null; // for scene 7

function setMode(mode){
  bgMode = mode;
  dots = [];
  stars = [];
  nameTargets = null;

  const w = window.innerWidth, h = window.innerHeight;
  const n = Math.floor(clamp(w/10, 70, 130));

  // drifting elements (petals at sunset, hearts at night)
  for(let i=0;i<n;i++){
    dots.push({
      x: rand(0,w), y: rand(0,h),
      vx: rand(-0.25,0.25), vy: rand(0.12,0.6),
      s: rand(10,26),
      r: rand(0,Math.PI*2), vr: rand(-0.015,0.015),
      o: rand(0.18,0.68),
      k: Math.floor(rand(0,3)),
      t: Math.random()*1000
    });
  }
  // stars
  const sCount = Math.floor(clamp(w/8, 120, 240));
  for(let i=0;i<sCount;i++){
    stars.push({
      x: rand(0,w), y: rand(0,h),
      vx: rand(-0.03,0.03), vy: rand(-0.01,0.02),
      o: rand(0.15,0.9),
      s: rand(0.7,2.0),
      tw: rand(0.002,0.01),
      ph: rand(0,1000)
    });
  }
}

function drawGradient(mode){
  const w=window.innerWidth, h=window.innerHeight;
  let g;
  if(mode==="sunset" || mode==="sunset2"){
    g = bctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, "#ffb36b");
    g.addColorStop(0.45, "#ff5f9a");
    g.addColorStop(1, "#1b0a2a");
  }else if(mode==="dusk"){
    g = bctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, "#ff7b8a");
    g.addColorStop(0.40, "#4a1b52");
    g.addColorStop(1, "#07040b");
  }else if(mode==="nightMoon" || mode==="softNight"){
    g = bctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, "#111a44");
    g.addColorStop(0.55, "#0b0a1c");
    g.addColorStop(1, "#07040b");
  }else if(mode==="stars" || mode==="nameStars"){
    g = bctx.createRadialGradient(w*0.5, h*0.25, 10, w*0.5, h*0.35, h*0.95);
    g.addColorStop(0, "#1d2a6a");
    g.addColorStop(0.55, "#0b0a1c");
    g.addColorStop(1, "#07040b");
  }else if(mode==="aurora"){
    g = bctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, "#162a5b");
    g.addColorStop(0.40, "#0b0a1c");
    g.addColorStop(1, "#07040b");
  }else{
    g = bctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, "#1d2a6a");
    g.addColorStop(1, "#07040b");
  }
  bctx.fillStyle = g;
  bctx.fillRect(0,0,w,h);

  // vignette
  const vg = bctx.createRadialGradient(w/2,h/2,10,w/2,h/2,Math.max(w,h)*0.75);
  vg.addColorStop(0,"rgba(0,0,0,0)");
  vg.addColorStop(1,"rgba(0,0,0,.45)");
  bctx.fillStyle = vg;
  bctx.fillRect(0,0,w,h);
}

function drawSunMoon(mode, t){
  const w=window.innerWidth, h=window.innerHeight;
  if(mode==="sunset" || mode==="sunset2" || mode==="dusk"){
    const x = w*0.18;
    const y = h*(0.22 + 0.02*Math.sin(t*0.001));
    const r = Math.min(w,h)*0.09;
    const g = bctx.createRadialGradient(x,y,1,x,y,r*1.6);
    g.addColorStop(0,"rgba(255,255,255,.85)");
    g.addColorStop(0.35,"rgba(255,235,190,.55)");
    g.addColorStop(1,"rgba(255,140,120,0)");
    bctx.fillStyle=g;
    bctx.beginPath(); bctx.arc(x,y,r*1.3,0,Math.PI*2); bctx.fill();
  }else{
    const x = w*0.78;
    const y = h*(0.18 + 0.02*Math.sin(t*0.0012));
    const r = Math.min(w,h)*0.07;
    const g = bctx.createRadialGradient(x,y,1,x,y,r*1.8);
    g.addColorStop(0,"rgba(255,255,255,.78)");
    g.addColorStop(0.45,"rgba(220,230,255,.25)");
    g.addColorStop(1,"rgba(255,255,255,0)");
    bctx.fillStyle=g;
    bctx.beginPath(); bctx.arc(x,y,r*1.5,0,Math.PI*2); bctx.fill();
  }
}

function drawAurora(t){
  const w=window.innerWidth, h=window.innerHeight;
  const baseY = h*0.22;
  const bandH = h*0.55;

  bctx.save();
  bctx.globalAlpha = 0.65;
  for(let i=0;i<3;i++){
    const phase = t*0.0004 + i*1.7;
    const y = baseY + i*28;
    const grad = bctx.createLinearGradient(0,y,w,y+bandH);
    grad.addColorStop(0, "rgba(130,255,220,0)");
    grad.addColorStop(0.25, "rgba(130,255,220,0.18)");
    grad.addColorStop(0.55, "rgba(255,120,210,0.12)");
    grad.addColorStop(1, "rgba(180,120,255,0)");
    bctx.fillStyle = grad;

    bctx.beginPath();
    bctx.moveTo(0,y);
    const steps = 6;
    for(let s=0;s<=steps;s++){
      const px = (w/steps)*s;
      const py = y + Math.sin(phase + s*0.8)*55 + Math.sin(phase*1.3 + s*1.1)*18;
      bctx.lineTo(px, py);
    }
    bctx.lineTo(w, y+bandH);
    bctx.lineTo(0, y+bandH);
    bctx.closePath();
    bctx.fill();
  }
  bctx.restore();
}

function drawStars(t){
  const w=window.innerWidth, h=window.innerHeight;
  for(const s of stars){
    s.ph += 1;
    s.x += s.vx;
    s.y += s.vy;
    if(s.x < -10) s.x = w+10;
    if(s.x > w+10) s.x = -10;
    if(s.y < -10) s.y = h+10;
    if(s.y > h+10) s.y = -10;

    const tw = 0.55 + 0.45*Math.sin(s.ph*s.tw);
    const r = s.s*tw;
    bctx.fillStyle = `rgba(255,255,255,${s.o*tw})`;
    bctx.beginPath();
    bctx.arc(s.x, s.y, r, 0, Math.PI*2);
    bctx.fill();
  }
}

function drawHeartsOrPetals(t){
  const w=window.innerWidth, h=window.innerHeight;
  for(const p of dots){
    p.t += 1;
    p.x += p.vx + Math.sin((p.t + p.y)*0.002)*0.14;
    p.y += p.vy;
    p.r += p.vr;
    if(p.y > h+60){ p.y = -60; p.x = rand(0,w); }
    if(p.x < -80) p.x = w+80;
    if(p.x > w+80) p.x = -80;

    if(bgMode==="sunset" || bgMode==="sunset2" || bgMode==="dusk"){
      bctx.save();
      bctx.translate(p.x, p.y);
      bctx.rotate(p.r);
      bctx.globalAlpha = p.o*0.65;
      bctx.fillStyle = "rgba(255,235,245,0.65)";
      bctx.beginPath();
      bctx.moveTo(0, -p.s*0.55);
      bctx.quadraticCurveTo(p.s*0.55, -p.s*0.10, 0, p.s*0.70);
      bctx.quadraticCurveTo(-p.s*0.55, -p.s*0.10, 0, -p.s*0.55);
      bctx.fill();
      bctx.restore();
    }else{
      const im = heartImgs[p.k % heartImgs.length];
      if(im.complete){
        bctx.save();
        bctx.translate(p.x, p.y);
        bctx.rotate(p.r);
        bctx.globalAlpha = p.o;
        const size = p.s*1.2;
        bctx.drawImage(im, -size/2, -size/2, size, size);
        bctx.restore();
      }
    }
  }
}

function buildNameTargets(){
  const w=window.innerWidth, h=window.innerHeight;
  const off = document.createElement("canvas");
  off.width = Math.floor(w);
  off.height = Math.floor(h);
  const octx = off.getContext("2d");
  octx.clearRect(0,0,w,h);
  const fontSize = Math.floor(clamp(w*0.12, 48, 110));
  octx.font = `600 ${fontSize}px Fraunces, serif`;
  octx.textAlign = "center";
  octx.textBaseline = "middle";
  octx.fillStyle = "#ffffff";
  octx.fillText("JEEVANA", w/2, h*0.40);

  const data = octx.getImageData(0,0,w,h).data;
  const pts = [];
  const step = Math.floor(clamp(w/140, 5, 8));
  for(let y=0;y<h;y+=step){
    for(let x=0;x<w;x+=step){
      const a = data[(y*w + x)*4 + 3];
      if(a > 20) pts.push({x,y});
    }
  }
  const usable = Math.min(stars.length, pts.length);
  nameTargets = [];
  for(let i=0;i<usable;i++){
    const p = pts[Math.floor((i/usable)*pts.length)];
    nameTargets.push(p);
  }
}

function pullStarsIntoName(){
  if(!nameTargets) buildNameTargets();
  const usable = Math.min(stars.length, nameTargets.length);
  for(let i=0;i<usable;i++){
    const s = stars[i];
    const t = nameTargets[i];
    s.x += (t.x - s.x) * 0.035;
    s.y += (t.y - s.y) * 0.035;
    s.o = clamp(s.o + 0.01, 0.25, 0.95);
  }
}

/* FX: fireworks & confetti hearts */
let bursts = [];
let confetti = [];
function spawnFirework(){
  const w=window.innerWidth, h=window.innerHeight;
  const cx = rand(w*0.2, w*0.8);
  const cy = rand(h*0.12, h*0.45);
  const count = Math.floor(rand(38, 58));
  const hue = rand(300, 360);
  for(let i=0;i<count;i++){
    const a = (Math.PI*2)*(i/count) + rand(-0.1,0.1);
    const sp = rand(1.6, 4.2);
    bursts.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: rand(50, 90), hue });
  }
}
function spawnConfettiHearts(){
  const w=window.innerWidth, h=window.innerHeight;
  for(let i=0;i<42;i++){
    confetti.push({ x: rand(0,w), y: rand(-h*0.2, 0), vx: rand(-0.4,0.4), vy: rand(0.8,1.8),
      r: rand(0,Math.PI*2), vr: rand(-0.08,0.08), s: rand(10,24), o: rand(0.45,0.9), k: Math.floor(rand(0,3)) });
  }
}
function drawFx(){
  const w=window.innerWidth, h=window.innerHeight;
  fctx.clearRect(0,0,w,h);

  fctx.save();
  fctx.globalCompositeOperation = "lighter";
  for(let i=bursts.length-1;i>=0;i--){
    const p = bursts[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.life -= 1;
    const alpha = clamp(p.life/90, 0, 1);
    fctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${alpha})`;
    fctx.beginPath(); fctx.arc(p.x, p.y, 2.0, 0, Math.PI*2); fctx.fill();
    if(p.life <= 0) bursts.splice(i,1);
  }
  fctx.restore();

  for(let i=confetti.length-1;i>=0;i--){
    const c = confetti[i];
    c.x += c.vx + Math.sin((c.y*0.01))*0.12;
    c.y += c.vy; c.r += c.vr; c.vy += 0.002; c.o *= 0.997;

    const im = heartImgs[c.k % heartImgs.length];
    if(im.complete){
      fctx.save();
      fctx.translate(c.x, c.y);
      fctx.rotate(c.r);
      fctx.globalAlpha = c.o;
      fctx.drawImage(im, -c.s/2, -c.s/2, c.s, c.s);
      fctx.restore();
    }
    if(c.y > h + 80 || c.o < 0.08) confetti.splice(i,1);
  }
}

/* Text entrance animation */
function splitWords(el){
  const text = el.textContent;
  el.textContent = "";
  const words = text.trim().split(" ");
  words.forEach((w,i)=>{
    const span=document.createElement("span");
    span.className="w";
    span.textContent = w + (i<words.length-1 ? " " : "");
    el.appendChild(span);
  });
  return el.querySelectorAll(".w");
}
function animateIn(scene){
  const content = scene.querySelector(".content");
  const tl = gsap.timeline();
  tl.fromTo(content, { y: 18, opacity: 0, scale: 0.988 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" });

  const candidates = scene.querySelectorAll(".heroLine,.para,.finalAsk,.tamil,.afterTamil,.lyric");
  candidates.forEach((node, i)=>{
    const words = splitWords(node);
    tl.fromTo(words, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.02 }, 0.12 + i*0.04);
  });

  const mem = scene.querySelector(".memory");
  if(mem){
    tl.fromTo(mem, { y: 24, opacity: 0, scale: 0.97 }, { y:0, opacity:1, scale:1, duration:0.85, ease:"power3.out" }, 0.18);
  }
  return tl;
}
function animateOut(scene){
  const content = scene.querySelector(".content");
  return gsap.to(content, { y: -10, opacity: 0, duration: 0.35, ease: "power2.in" });
}

/* Scene changes */
function setActive(n){
  scenes.forEach(s=>s.classList.remove("isActive"));
  scenes[n].classList.add("isActive");
}
function applyBgForScene(n){
  const mode = scenes[n].getAttribute("data-bg") || "stars";
  setMode(mode);
  if(mode==="nameStars"){ buildNameTargets(); }
}
function go(to){
  if(isAnimating) return;
  to = Math.max(0, Math.min(scenes.length-1, to));
  if(to === idx) return;

  isAnimating = true;
  const from = scenes[idx];
  const toScene = scenes[to];

  applyBgForScene(to);

  const wipeTl = heartWipe(to);
  const tl = gsap.timeline({
    onComplete: ()=>{
      setActive(to);
      animateIn(toScene);
      idx = to;
      isAnimating = false;
      syncMusicForScene(idx);
    }
  });
  tl.add(animateOut(from), 0.0);
  tl.add(wipeTl, 0.0);
  tl.call(()=>{
    from.classList.remove("isActive");
    toScene.classList.add("isActive");
  }, [], 0.45);
}

function next(){ if(idx < scenes.length-1) go(idx+1); }
function prev(){ go(idx-1); }

/* Keyboard + swipe */
document.addEventListener("keydown", (e)=>{
  if(lock.style.display !== "none") return;
  if(e.code === "Space"){ e.preventDefault(); next(); }
  if(e.code === "ArrowUp") { e.preventDefault(); next(); }
  if(e.code === "ArrowDown") { e.preventDefault(); prev(); }
}, { passive:false });

let startY=0, startX=0, touching=false;
document.addEventListener("touchstart",(e)=>{
  if(lock.style.display !== "none") return;
  const t=e.touches[0];
  startY=t.clientY; startX=t.clientX; touching=true;
},{passive:true});

document.addEventListener("touchmove",(e)=>{
  if(lock.style.display !== "none") return;
  if(!touching) return;
  e.preventDefault();
},{passive:false});

document.addEventListener("touchend",(e)=>{
  if(lock.style.display !== "none") return;
  if(!touching) return;
  touching=false;
  const t=e.changedTouches[0];
  const dy=startY - t.clientY;
  const dx=startX - t.clientX;
  if(Math.abs(dy) > 44 && Math.abs(dy) > Math.abs(dx)){
    if(dy > 0) next(); else prev();
  }
},{passive:true});

/* Lock */
function unlock(){
  const v=(pass.value||"").trim();
  if(v !== MAIN_PASSWORD){
    lockHint.textContent = "Wrong secret 😅 (Hint: our song)";
    gsap.fromTo(lockHint, { x:-6 }, { x:0, duration:0.28, ease:"power2.out" });
    return;
  }
  gsap.to(lock, { opacity:0, duration:0.45, ease:"power2.out", onComplete:()=>{ lock.style.display="none"; } });
  stopAllMusic();
  fadeIn(m1, 0.45);
  applyBgForScene(0);
  animateIn(scenes[0]);
  syncMusicForScene(0);
}
unlockBtn.addEventListener("click", unlock);
pass.addEventListener("keydown",(e)=>{ if(e.key==="Enter") unlock(); });

/* Easter egg: tap flower 5 times quickly -> shows 'jeebattu' */
flower?.addEventListener("click", ()=>{
  const now = Date.now();
  if(now - lastTap > 1200) flowerTaps = 0;
  lastTap = now;
  flowerTaps += 1;
  if(flowerTaps >= 5){
    flowerTaps = 0;
    reply.textContent = "🌸 Jeebattu.";
    gsap.fromTo(reply, { opacity:0, y:8 }, { opacity:1, y:0, duration:0.5, ease:"power3.out" });
  }
});

/* Final buttons */
function showAfterYes(){ afterYes.classList.add("show"); }

yesBtn?.addEventListener("click", ()=>{
  reply.textContent = "💖 You just made me the happiest person.";
  gsap.fromTo(reply, { opacity:0, y:8 }, { opacity:1, y:0, duration:0.55, ease:"power3.out" });

  showAfterYes();
  spawnConfettiHearts();
  spawnFirework();
  setTimeout(spawnFirework, 420);
  setTimeout(spawnFirework, 820);
});

noBtn?.addEventListener("click", ()=>{
  reply.textContent = "🥺 Of course. Take your time, my love. I’m not going anywhere — I’ll still be right here, choosing you.";
  gsap.fromTo(reply, { opacity:0, y:8 }, { opacity:1, y:0, duration:0.55, ease:"power3.out" });
});

/* Modal */
function openModal(){
  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
  gsap.fromTo(".modalCard", { y: 18, opacity: 0, scale: 0.98 }, { y:0, opacity:1, scale:1, duration:0.5, ease:"power3.out" });
}
function close(){
  gsap.to(".modalCard", { y: 18, opacity: 0, scale: 0.98, duration:0.35, ease:"power2.in", onComplete: ()=>{
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden","true");
  }});
}
surpriseBtn?.addEventListener("click", openModal);
closeModal?.addEventListener("click", close);
modal?.addEventListener("click", (e)=>{ if(e.target.classList.contains("modalBackdrop")) close(); });

/* Render loop */
let t0 = performance.now();
function frame(t){
  t0 = t;

  bctx.clearRect(0,0,window.innerWidth,window.innerHeight);
  drawGradient(bgMode);
  drawSunMoon(bgMode, t);
  if(bgMode==="aurora") drawAurora(t);
  if(bgMode!=="sunset" && bgMode!=="sunset2" && bgMode!=="dusk") drawStars(t);
  drawHeartsOrPetals(t);
  if(bgMode==="nameStars"){ pullStarsIntoName(); }

  drawFx();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
