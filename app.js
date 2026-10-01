const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const menuPanel = document.querySelector('.menu-panel');
const menuClose = document.querySelector('.menu-close');
document.documentElement.classList.add('js-enabled');
function closeMenu(){
  if (menuPanel?.open) menuPanel.close();
  document.body.classList.remove('menu-is-open');
  menu?.setAttribute('aria-expanded','false');
  menu?.setAttribute('aria-label','Menüyü aç');
}
menu?.addEventListener('click',()=>{
  if (!menuPanel) return;
  if (menuPanel.open) return closeMenu();
  menuPanel.showModal();
  document.body.classList.add('menu-is-open');
  menu.setAttribute('aria-expanded','true');
  menu.setAttribute('aria-label','Menüyü kapat');
});
menuClose?.addEventListener('click',closeMenu);
menuPanel?.addEventListener('close',closeMenu);
menuPanel?.addEventListener('cancel',()=>{
  document.body.classList.remove('menu-is-open');
  menu?.setAttribute('aria-expanded','false');
  menu?.setAttribute('aria-label','Menüyü aç');
});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
menuPanel?.addEventListener('click',event=>{
  if (event.target !== menuPanel) return;
  const bounds = menuPanel.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu();
});

const filters = [...document.querySelectorAll('[data-filter]')];
const search = document.querySelector('#faq-search');
const questions = [...document.querySelectorAll('[data-category]')];
let category='all';
const normalize=s=>s.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
function updateQuestions(){
  if(!document.querySelector('.faq-count'))return;
  const term=normalize(search?.value.trim()||'');
  let shown=0;
  questions.forEach(q=>{
    const match=(category==='all'||q.dataset.category===category)&&normalize(q.textContent).includes(term);
    q.hidden=!match;
    if(match)shown++;
  });
  document.querySelector('.faq-count').textContent=`${shown} soru`;
  const empty=document.querySelector('.empty');
  if(empty)empty.hidden=shown!==0;
}
filters.forEach(button=>button.addEventListener('click',()=>{
  category=button.dataset.filter;
  if(search)search.value='';
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  updateQuestions();
}));
search?.addEventListener('input',updateQuestions);
if(location.hash.startsWith('#soru-')){
  const q=document.getElementById(location.hash.slice(1));
  if(q)q.open=true;
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('.header');
const progress = document.querySelector('.reading-progress');
let scrollPending = false;
function updateScroll() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = `${total > 0 ? Math.min(100, window.scrollY / total * 100) : 0}%`;
  header?.classList.toggle('scrolled', window.scrollY > 20);
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) {
    scrollPending = true;
    window.requestAnimationFrame(updateScroll);
  }
}, {passive: true});
window.addEventListener('resize', updateScroll);
updateScroll();

// Content stays visible if JavaScript or IntersectionObserver is unavailable.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.08});
  document.querySelectorAll('.section-heading, .area, .approach-copy, .act-explorer, .step, .about-copy, .faq-layout, .contact-statement').forEach((element, i) => {
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.classList.add('reveal-ready');
    element.style.transitionDelay = `${element.matches('.area, .step') ? (i % 3) * 65 : 0}ms`;
    observer.observe(element);
  });
}

const actProcesses = [
  ['Şimdiki anla temas', 'Dikkati, şu anda olan bitene yeniden yöneltmek.'],
  ['Kabul', 'Zorlayıcı iç yaşantılara yer açabilmek.'],
  ['Bilişsel ayrışma', 'Düşünceleri mutlak gerçeklerden ayırt etmek.'],
  ['Bağlamsal benlik', 'Kendinizi tek bir düşünce veya etiketle sınırlamamak.'],
  ['Değerler', 'Nasıl yaşamak istediğinizi belirginleştirmek.'],
  ['Kararlı eylem', 'Önem verdiğiniz yönde somut adımlar atmak.']
];
const actPanel = document.querySelector('#act-panel');
const actTabs = [...document.querySelectorAll('.orbit-node')];
function selectProcess(index, focus = false) {
  if (!actPanel || !actProcesses[index]) return;
  actTabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
  });
  actPanel.setAttribute('aria-labelledby', `act-tab-${index}`);
  actPanel.querySelector('h3').textContent = actProcesses[index][0];
  actPanel.querySelector('p').textContent = actProcesses[index][1];
  actPanel.querySelector('.act-detail-num').textContent = `0${index + 1} / 06`;
  if (!reducedMotion.matches) {
    actPanel.classList.remove('changing');
    window.requestAnimationFrame(() => actPanel.classList.add('changing'));
  }
  if (focus) actTabs[index].focus();
  document.dispatchEvent(new CustomEvent('act-process-change'));
}
document.querySelectorAll('[data-act]').forEach(button => {
  button.addEventListener('click', () => selectProcess(Number(button.dataset.act)));
});
actTabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
  let next;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % actTabs.length;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + actTabs.length - 1) % actTabs.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = actTabs.length - 1;
  if (next !== undefined) {
    event.preventDefault();
    selectProcess(next, true);
  }
}));

window.addEventListener('hashchange', () => {
  const question = document.getElementById(location.hash.slice(1));
  if (question?.matches('details')) question.open = true;
});

// Project a sphere's meridians and parallels in 3D. Stop rendering off screen.
const globeCanvas = document.querySelector('.orbit-globe');
const globeContainer = document.querySelector('.orbit');
const globeMotion = document.querySelector('.globe-motion');
if (globeCanvas && globeContainer) {
  const context = globeCanvas.getContext('2d');
  if (context) {
    const curves = [];
    const samples = 80;
    for (let latitude = -75; latitude <= 75; latitude += 15) {
      const phi = latitude * Math.PI / 180;
      curves.push(Array.from({length: samples + 1}, (_, i) => {
        const theta = i / samples * Math.PI * 2;
        return [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)];
      }));
    }
    for (let meridian = 0; meridian < 12; meridian++) {
      const theta = meridian / 12 * Math.PI;
      curves.push(Array.from({length: samples + 1}, (_, i) => {
        const phi = i / samples * Math.PI * 2;
        return [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)];
      }));
    }
    let width = 0;
    let height = 0;
    let rotation = 0.55;
    let frame = 0;
    let lastTime = 0;
    let visible = !('IntersectionObserver' in window);
    let paused = false;
    const pointer = {x: 0, y: 0, targetX: 0, targetY: 0};

    function project(point, radius) {
      const yaw = rotation + pointer.x * 0.32;
      const pitch = 0.32 + pointer.y * 0.25;
      const x = point[0] * Math.cos(yaw) + point[2] * Math.sin(yaw);
      const z = -point[0] * Math.sin(yaw) + point[2] * Math.cos(yaw);
      const y = point[1] * Math.cos(pitch) - z * Math.sin(pitch);
      const depth = point[1] * Math.sin(pitch) + z * Math.cos(pitch);
      const tilt = -0.18;
      return [width / 2 + (x * Math.cos(tilt) - y * Math.sin(tilt)) * radius,
        height / 2 + (x * Math.sin(tilt) + y * Math.cos(tilt)) * radius, depth];
    }

    function drawGlobe() {
      if (!width || !height) return;
      const radius = Math.min(width, height) * 0.358;
      context.clearRect(0, 0, width, height);
      const glow = context.createRadialGradient(width / 2, height / 2, radius * 0.15, width / 2, height / 2, radius * 1.25);
      glow.addColorStop(0, 'rgba(174, 196, 124, .065)');
      glow.addColorStop(1, 'rgba(174, 196, 124, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      const projected = curves.map(curve => curve.map(point => project(point, radius)));
      for (const front of [false, true]) {
        context.beginPath();
        projected.forEach(curve => {
          let previous;
          curve.forEach(point => {
            if (previous && (point[2] + previous[2] >= 0) === front) {
              context.moveTo(previous[0], previous[1]);
              context.lineTo(point[0], point[1]);
            }
            previous = point;
          });
        });
        context.lineWidth = front ? 0.85 : 0.65;
        context.strokeStyle = front ? 'rgba(208, 224, 173, .48)' : 'rgba(170, 195, 132, .13)';
        context.stroke();
      }
      context.beginPath();
      context.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(208, 224, 173, .29)';
      context.lineWidth = 0.7;
      context.stroke();
      const selected = actTabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
      for (let i = 0; i < 6; i++) {
        const phi = (i % 3 - 1) * 0.62;
        const theta = i * Math.PI / 3;
        const point = project([Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)], radius);
        context.beginPath();
        context.arc(point[0], point[1], i === selected ? 3 : 1.65, 0, Math.PI * 2);
        context.fillStyle = point[2] > 0 ? '#e0eacb' : '#8ba674';
        context.shadowColor = '#cde0a5';
        context.shadowBlur = i === selected && point[2] > 0 ? 12 : 0;
        context.fill();
        context.shadowBlur = 0;
      }
    }

    function shouldAnimate() {
      return visible && !paused && !reducedMotion.matches && !document.hidden;
    }
    function animate(time) {
      frame = 0;
      if (!shouldAnimate()) return;
      const elapsed = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      rotation += elapsed * 0.29;
      pointer.x += (pointer.targetX - pointer.x) * 0.045;
      pointer.y += (pointer.targetY - pointer.y) * 0.045;
      drawGlobe();
      frame = window.requestAnimationFrame(animate);
    }
    function syncGlobe() {
      window.cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      drawGlobe();
      if (shouldAnimate()) frame = window.requestAnimationFrame(animate);
    }
    function resizeGlobe() {
      const bounds = globeContainer.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const density = Math.min(window.devicePixelRatio || 1, 2);
      globeCanvas.width = Math.round(width * density);
      globeCanvas.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
      syncGlobe();
    }
    resizeGlobe();
    globeContainer.classList.add('globe-ready');
    if ('ResizeObserver' in window) new ResizeObserver(resizeGlobe).observe(globeContainer);
    else window.addEventListener('resize', resizeGlobe);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        syncGlobe();
      }, {threshold: 0.05}).observe(globeContainer);
    }
    globeContainer.addEventListener('pointermove', event => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;
      const bounds = globeContainer.getBoundingClientRect();
      pointer.targetX = (event.clientX - bounds.left) / bounds.width * 2 - 1;
      pointer.targetY = (event.clientY - bounds.top) / bounds.height * 2 - 1;
    });
    globeContainer.addEventListener('pointerleave', () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    });
    globeMotion?.addEventListener('click', () => {
      paused = !paused;
      globeMotion.setAttribute('aria-pressed', String(paused));
      globeMotion.setAttribute('aria-label', paused ? 'Küre hareketini başlat' : 'Küre hareketini duraklat');
      globeMotion.querySelector('span:last-child').textContent = paused ? 'Hareketi başlat' : 'Hareketi duraklat';
      syncGlobe();
    });
    reducedMotion.addEventListener('change', syncGlobe);
    document.addEventListener('visibilitychange', syncGlobe);
    document.addEventListener('act-process-change', drawGlobe);
  } else if (globeMotion) {
    globeMotion.hidden = true;
  }
}

// A gentle pointer trail and small depth changes, for a mouse or trackpad only.
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
if (finePointer.matches && !reducedMotion.matches) {
  const follower = document.createElement('div');
  follower.className = 'cursor-follower';
  follower.setAttribute('aria-hidden', 'true');
  document.body.append(follower);
  document.documentElement.classList.add('pointer-effects');
  const heroStage = document.querySelector('.hero-stage');
  const position = {x: -100, y: -100, targetX: -100, targetY: -100};
  let pointerFrame = 0;

  function followPointer() {
    pointerFrame = 0;
    if (reducedMotion.matches || !finePointer.matches || document.hidden) return;
    position.x += (position.targetX - position.x) * 0.18;
    position.y += (position.targetY - position.y) * 0.18;
    follower.style.transform = `translate3d(${position.x}px,${position.y}px,0) translate(-50%,-50%)`;
    if (Math.abs(position.targetX - position.x) + Math.abs(position.targetY - position.y) > 0.08) {
      pointerFrame = window.requestAnimationFrame(followPointer);
    }
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || reducedMotion.matches || !finePointer.matches) return;
    position.targetX = event.clientX;
    position.targetY = event.clientY;
    if (!follower.classList.contains('visible')) {
      position.x = position.targetX;
      position.y = position.targetY;
      follower.classList.add('visible');
    }
    follower.classList.toggle('over-link', Boolean(event.target.closest('a, button, summary')));
    if (!pointerFrame) pointerFrame = window.requestAnimationFrame(followPointer);
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', () => follower.classList.remove('visible'));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      follower.classList.remove('visible');
    }
  });
  function updatePointerPreference() {
    const enabled = finePointer.matches && !reducedMotion.matches;
    document.documentElement.classList.toggle('pointer-effects', enabled);
    if (!enabled) {
      window.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      follower.classList.remove('visible');
    }
  }
  finePointer.addEventListener('change', updatePointerPreference);
  reducedMotion.addEventListener('change', updatePointerPreference);

  document.querySelectorAll('.hero-actions .btn, .header-appointment, .portrait-link, .contact-action-icon').forEach(target => {
    target.classList.add('magnetic-target');
    target.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || reducedMotion.matches || !finePointer.matches) return;
      const bounds = target.getBoundingClientRect();
      const x = Math.max(-6, Math.min(6, (event.clientX - bounds.left - bounds.width / 2) * 0.12));
      const y = Math.max(-5, Math.min(5, (event.clientY - bounds.top - bounds.height / 2) * 0.15));
      target.style.setProperty('--magnetic-x', `${x}px`);
      target.style.setProperty('--magnetic-y', `${y}px`);
    });
    target.addEventListener('pointerleave', () => {
      target.style.setProperty('--magnetic-x', '0px');
      target.style.setProperty('--magnetic-y', '0px');
    });
  });
  heroStage?.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || reducedMotion.matches || !finePointer.matches) return;
    const bounds = heroStage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroStage.style.setProperty('--scene-x', `${x * 14}px`);
    heroStage.style.setProperty('--scene-y', `${y * 11}px`);
    heroStage.style.setProperty('--thread-x', `${x * -20}px`);
    heroStage.style.setProperty('--thread-y', `${y * -16}px`);
    heroStage.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
    heroStage.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
  });
  heroStage?.addEventListener('pointerleave', () => {
    ['--scene-x', '--scene-y', '--thread-x', '--thread-y'].forEach(name => heroStage.style.setProperty(name, '0px'));
  });
}
