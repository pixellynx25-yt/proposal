// ============================
// Time Capsule (Advanced)
// Countdown + Stars + Music
// Opens on: 23 July 2026
// Password2: itsbeenayear
// Video path: videos/future.mp4
// ============================

const TARGET = new Date(2026, 6, 23, 0, 0, 0); // 23 July 2026 (month is 0-based)
const PASSWORD2 = "itsbeenayear";

// Elements
const mo = document.getElementById("mo");
const da = document.getElementById("da");
const ho = document.getElementById("ho");
const mi = document.getElementById("mi");
const se = document.getElementById("se");

const card = document.getElementById("card");
const lockedMsg = document.getElementById("lockedMsg");
const unlockArea = document.getElementById("unlockArea");
const pass2 = document.getElementById("pass2");
const btn2 = document.getElementById("btn2");
const hint2 = document.getElementById("hint2");

const cinema = document.getElementById("cinema");
const closeCinema = document.getElementById("closeCinema");
const vid = document.getElementById("vid");
const vidHint = document.getElementById("vidHint");

const tcMusic = document.getElementById("tcMusic");
const soundBtn = document.getElementById("soundBtn");

// ----------------------------
// Music (mobile-safe)
// ----------------------------
let soundOn = false;

function updateSoundUI(){
  soundBtn.textContent = soundOn ? "🔊 Sound" : "🔇 Sound";
}

async function tryPlayMusic(){
  try{
    tcMusic.volume = 0.55;
    await tcMusic.play();
    soundOn = true;
  }catch{
    soundOn = false;
  }
  updateSoundUI();
}

window.addEventListener("load", () => {
  tryPlayMusic();
}, { once:true });

soundBtn.addEventListener("click", async () => {
  if(!soundOn){
    try{
      await tcMusic.play();
      soundOn = true;
    }catch{ /* ignore */ }
  }else{
    tcMusic.pause();
    soundOn = false;
  }
  updateSoundUI();
});

// ----------------------------
// Starfield (cinematic, twinkle)
// ----------------------------
const bg = document.getElementById("bg");
const ctx = bg.getContext("2d", { alpha:true });

let stars = [];
let boost = 0; // used for "cinema reveal" glow

function resize(){
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  bg.width = Math.floor(window.innerWidth * dpr);
  bg.height = Math.floor(window.innerHeight * dpr);
  bg.style.width = window.innerWidth + "px";
  bg.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr,0,0,dpr,0,0);

  initStars();
}
window.addEventListener("resize", resize, { passive:true });

function initStars(){
  const w = window.innerWidth;
  const h = window.innerHeight;
  const count = Math.floor(Math.max(180, w / 4.8));
  stars = new Array(count).fill(0).map(() => ({
    x: Math.random()*w,
    y: Math.random()*h,
    r: Math.random()*1.7 + 0.35,
    a: Math.random()*0.7 + 0.18,
    tw: Math.random()*0.012 + 0.002,
    ph: Math.random()*1000,
    sp: Math.random()*0.22 + 0.03,
    dx: (Math.random()*0.08 - 0.04)
  }));
}

resize();

function paint(){
  const w = window.innerWidth;
  const h = window.innerHeight;

  ctx.clearRect(0,0,w,h);

  // deep sky gradient
  const g = ctx.createRadialGradient(w*0.5, h*0.18, 10, w*0.5, h*0.38, h*1.05);
  g.addColorStop(0, "#1d2a6a");
  g.addColorStop(0.45, "#0b0a1c");
  g.addColorStop(1, "#07040b");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  // subtle moon glow
  const mx = w*0.82, my = h*0.18;
  const rr = Math.min(w,h) * 0.06;
  const mg = ctx.createRadialGradient(mx,my,1,mx,my,rr*2.0);
  mg.addColorStop(0, `rgba(255,255,255,${0.62 + boost*0.12})`);
  mg.addColorStop(0.45, `rgba(210,225,255,${0.16 + boost*0.08})`);
  mg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(mx,my,rr*1.5,0,Math.PI*2);
  ctx.fill();

  // stars
  for(const s of stars){
    s.ph += 1;
    s.y += s.sp;
    s.x += s.dx;

    if(s.y > h + 10) s.y = -10;
    if(s.x > w + 10) s.x = -10;
    if(s.x < -10) s.x = w + 10;

    const tw = 0.55 + 0.45*Math.sin(s.ph*s.tw);
    const alpha = Math.min(1, s.a * tw + boost*0.08);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r*tw*(1 + boost*0.06), 0, Math.PI*2);
    ctx.fill();
  }

  // ease boost back down
  boost *= 0.985;

  requestAnimationFrame(paint);
}
requestAnimationFrame(paint);

// ----------------------------
// Month-aware countdown
// ----------------------------
function addMonths(date, months){
  const d = new Date(date.getTime());
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  // handle month rollover (e.g. Jan 31)
  while(d.getMonth() !== ((targetMonth % 12) + 12) % 12){
    d.setDate(d.getDate() - 1);
  }
  return d;
}

function diffWithMonths(now, target){
  if(now >= target){
    return { months:0, days:0, hours:0, minutes:0, seconds:0, done:true };
  }

  let months = (target.getFullYear()-now.getFullYear())*12 + (target.getMonth()-now.getMonth());
  let anchor = addMonths(now, months);

  if(anchor > target){
    months -= 1;
    anchor = addMonths(now, months);
  }

  let ms = target - anchor;
  const day = 24*60*60*1000;
  const hour = 60*60*1000;
  const min = 60*1000;

  const days = Math.floor(ms/day); ms -= days*day;
  const hours = Math.floor(ms/hour); ms -= hours*hour;
  const minutes = Math.floor(ms/min); ms -= minutes*min;
  const seconds = Math.floor(ms/1000);

  return { months, days, hours, minutes, seconds, done:false };
}

function tick(){
  const now = new Date();
  const d = diffWithMonths(now, TARGET);

  mo.textContent = String(d.months).padStart(2,"0");
  da.textContent = String(d.days).padStart(2,"0");
  ho.textContent = String(d.hours).padStart(2,"0");
  mi.textContent = String(d.minutes).padStart(2,"0");
  se.textContent = String(d.seconds).padStart(2,"0");

  if(d.done){
    lockedMsg.style.display = "none";
    unlockArea.hidden = false;
  }else{
    unlockArea.hidden = true;
  }

  setTimeout(tick, 250);
}
tick();

// ----------------------------
// Cinema mode
// ----------------------------
function openCinema(){
  cinema.hidden = false;
  cinema.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    cinema.classList.add("show");
  });

  // star glow "reaction"
  boost = 1;

  // attempt to play video
  vid.play().catch(() => {
    vidHint.textContent = "Video not found yet. Later add videos/future.mp4 and upload to GitHub again.";
  });
}

function closeCinemaMode(){
  cinema.classList.remove("show");
  cinema.setAttribute("aria-hidden", "true");
  setTimeout(() => {
    cinema.hidden = true;
    try{ vid.pause(); }catch{}
  }, 520);
}

// Unlock flow
function unlockVideo(){
  const v = (pass2.value || "").trim();
  if(v !== PASSWORD2){
    hint2.textContent = "Wrong secret 😅";
    hint2.style.opacity = 0.9;
    boost = 0.3;
    return;
  }

  // fade card out then show cinema
  card.classList.add("hide");
  setTimeout(() => {
    card.style.display = "none";
    openCinema();
  }, 520);

  // soft music fade down (optional but nice)
  try{
    const start = tcMusic.volume ?? 0.55;
    const t0 = performance.now();
    const dur = 600;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      tcMusic.volume = start * (1 - p*0.55);
      if(p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }catch{}
}

btn2.addEventListener("click", unlockVideo);
pass2.addEventListener("keydown", (e) => {
  if(e.key === "Enter") unlockVideo();
});

closeCinema.addEventListener("click", closeCinemaMode);
cinema.addEventListener("click", (e) => {
  if(e.target === cinema) closeCinemaMode();
});
