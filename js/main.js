const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzKntL9elpI-3V8BF20POEEWa80mo9D3829tOxMbfgaupvuoQe2_cpoVoNCDAKOpRTrXw/exec';

lightbox.option({
  'resizeDuration': 300,
  'fadeDuration': 200,
  'imageFadeDuration': 200,
  'wrapAround': true,
  'positionFromTop': 80,
  'disableScrolling': true
});


/* Reveal */
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    obs.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.section, h1, h2, h3, .album .photo, .invite-message')
  .forEach(el => revealObserver.observe(el));

/* Album left-right */
(() => {
  const items = document.querySelectorAll('.album .photo');
  items.forEach((el, i) => { if (i % 2 === 0) el.classList.add('left'); });
})();

/* Hero slide */
const hero = document.getElementById('hero');
let slideOn = false;
function toggleHero(){ slideOn = !slideOn; hero.classList.toggle('slide', slideOn); }
toggleHero();
setInterval(toggleHero, 3000);

/* Countdown */
const cd = document.getElementById('countdown');
const eventDate = new Date('2025-12-27T09:00:00+07:00');

function tick(){
  const now = new Date();
  const diff = eventDate - now;
  if (diff <= 0){ cd.innerHTML = '<div class="done">Đã đến ngày cưới!</div>'; return; }
  const d = Math.floor(diff/86400000);
  const h = Math.floor((diff%86400000)/3600000);
  const m = Math.floor((diff%3600000)/60000);
  const s = Math.floor((diff%60000)/1000);
  cd.innerHTML = `
    <div class="count-item"><span class="num">${d}</span><span class="label">Ngày</span></div>
    <div class="count-item"><span class="num">${h}</span><span class="label">Giờ</span></div>
    <div class="count-item"><span class="num">${m}</span><span class="label">Phút</span></div>
    <div class="count-item"><span class="num">${s}</span><span class="label">Giây</span></div>
  `;
}
tick();
setInterval(tick, 1000);

/* Poem */
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.2 });
  const poem = document.querySelector('.wedding-poem');
  if (poem) observer.observe(poem);
});

/* Album Carousel */
$('.owl-carousel').owlCarousel({
  items: 1,
  loop: true,
  autoplay: true,
  autoplayTimeout: 2500,
  smartSpeed: 900,
  dots: true,
  autoplayHoverPause: true,
  animateOut: 'fadeOut',
  animateIn: 'fadeIn'
}).on('initialized.owl.carousel', function() {
  $('.owl-item.cloned a').removeAttr('data-lightbox');
});


/* Timeline */
const tlItems = document.querySelectorAll('.timeline-item');
const tlObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.2 });
tlItems.forEach(el => tlObserver.observe(el));

/* Copy account */
$(document).on('click', '.copy-btn', function(){
  const value = $(this).data('copy');
  navigator.clipboard.writeText(value).then(()=>{
    const btn = $(this), t = btn.text();
    btn.text('Đã sao chép'); setTimeout(()=>btn.text(t), 1200);
  });
});

/* Wishes */
const form = document.getElementById('rsvpForm');
const msgBox = document.getElementById('messages');
function escapeHtml(s){ return String(s).replace(/[&<>\"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }
function cardWish(item){
  const el = document.createElement('article');
  el.className = 'card-grid';
  el.innerHTML = `<div class="body wish-item"><b>${escapeHtml(item.name||'Ẩn danh')}</b><p>${escapeHtml(item.message||item.msg||'')}</p></div>`;
  return el;
}
async function loadWishes(){
  msgBox.innerHTML = '';
  try{
    if(!SCRIPT_URL.startsWith('http')) throw new Error('no-endpoint');
    const res = await fetch(SCRIPT_URL,{cache:'no-store'});
    const data = await res.json();
    data.slice(0,30).forEach(it=> msgBox.appendChild(cardWish(it)));
  }catch{
    const data = JSON.parse(localStorage.getItem('wish')||'[]');
    data.forEach(it=> msgBox.appendChild(cardWish(it)));
  }
}
if (form){
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const msg  = document.getElementById('message').value.trim();
    if(!msg) return;
    const payload = { name, msg };
    try{
      if(SCRIPT_URL.startsWith('http')){
        await fetch(SCRIPT_URL,{method:'POST',body:JSON.stringify(payload)});
      }else{
        const data = JSON.parse(localStorage.getItem('wish')||'[]');
        data.unshift(payload); localStorage.setItem('wish', JSON.stringify(data));
      }
    }finally{
      form.reset(); loadWishes();
    }
  });
}
loadWishes();

/* Opening */
function runOpening(){
  const opening = document.getElementById('opening');
  const left = document.getElementById('doorL');
  const right = document.getElementById('doorR');
  const title = document.getElementById('inviteTitle');
  const hearts = document.getElementById('hearts');

  if (!opening || !left || !right) return;

  // reset
  left.classList.remove('open-left');
  right.classList.remove('open-right');
  opening.classList.remove('hide');
  title.classList.add('show');

  // mở cửa
  setTimeout(() => {
    left.classList.add('open-left');
    right.classList.add('open-right');
    spawnHearts(16, 3);
  }, 500);

  // đóng overlay
  setTimeout(() => {
    opening.classList.add('hide');
    opening.setAttribute('aria-hidden', 'true');
    // dọn DOM hearts
    if (hearts) hearts.innerHTML = '';
    setTimeout(() => { if (opening && opening.parentNode) opening.parentNode.removeChild(opening); }, 800);
  }, 3200);
}

/* Hearts */
function spawnHearts(n, durationSec){
  const container = document.getElementById('hearts');
  if (!container) return;
  const vw = window.innerWidth;
  const colors = ['#ff4d6d','#f28fb2','#ffc1cc'];
  for(let i=0;i<n;i++){
    const s = document.createElement('span');
    s.textContent = '❤';
    const color = colors[Math.floor(Math.random()*colors.length)];
    const size = 14 + Math.random()*22;
    const left = Math.random()*vw;
    const delay = Math.random()*0.6;
    const dur = (durationSec||3) - 0.4 + Math.random()*0.6;
    s.style.left = `${left}px`;
    s.style.fontSize = `${size}px`;
    s.style.color = color;
    s.style.animation = `floatHeart ${dur}s ease-in ${delay}s forwards`;
    container.appendChild(s);
    setTimeout(()=> s.remove(), (dur + delay + 0.2)*1000);
  }
}

/* Music autoplay */
function initMusicAutoplay(){
  const audio = document.getElementById('bgm');
  const musicBtn = document.getElementById('musicToggle');
  if (!audio || !musicBtn) return;

  const tryPlay = () => {
    audio.play().then(()=>{
      musicBtn.classList.remove('music-off');
      musicBtn.classList.add('music-on');
    }).catch(()=>{
      const enable = () => {
        audio.play().then(()=>{
          musicBtn.classList.remove('music-off');
          musicBtn.classList.add('music-on');
        }).catch(()=>{});
        window.removeEventListener('touchstart', enable);
        window.removeEventListener('click', enable);
      };
      window.addEventListener('touchstart', enable, { once:true });
      window.addEventListener('click', enable, { once:true });
    });
  };

  setTimeout(tryPlay, 2500);
}

/* Floating buttons */
document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('bgm');
  const musicBtn = document.getElementById('musicToggle');
  const scrollBtn = document.getElementById('scrollTopBtn');

  if (musicBtn){
    musicBtn.addEventListener('click', () => {
      if (!audio) return;
      if (audio.paused){
        audio.play().catch(()=>{});
        musicBtn.classList.remove('music-off'); musicBtn.classList.add('music-on');
      }else{
        audio.pause();
        musicBtn.classList.remove('music-on'); musicBtn.classList.add('music-off');
      }
    });
  }

  if (scrollBtn){
    scrollBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
    window.addEventListener('scroll', () => {
      if (window.scrollY > 250) scrollBtn.classList.remove('hidden');
      else scrollBtn.classList.add('hidden');
    });
  }
});

/* Autoplay opening + nhạc sau khi load */
window.addEventListener('load', () => {
  runOpening();
  setTimeout(initMusicAutoplay, 800);
});


