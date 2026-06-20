/* ========================================
   CRAV BURGERS — script.js (v2)
   Exact recreation of cravburgers.shop
   ======================================== */
"use strict";

/* ==========================================
   LOADER
   ========================================== */
(function() {
  const loader    = document.getElementById("loader");
  const bar       = document.getElementById("loaderBar");
  if (!loader) return;

  document.body.style.overflow = "hidden";

  let progress = 0;
  const TOTAL = 2800; // ms total
  const TICK  = 40;
  const steps = TOTAL / TICK;
  let step    = 0;

  const t = setInterval(() => {
    step++;
    const ratio = step / steps;
    progress = Math.min(100, Math.round(100 * (1 - Math.pow(1 - ratio, 2))));
    bar.style.width = progress + "%";
    bar.closest("[role=progressbar]").setAttribute("aria-valuenow", progress);

    if (step >= steps) {
      clearInterval(t);
      setTimeout(done, 350);
    }
  }, TICK);

  function done() {
    loader.classList.add("done");
    document.body.style.overflow = "";
    setTimeout(() => {
      loader.style.display = "none";
      initScrollReveal();
    }, 700);
  }
})();

/* ==========================================
   VEGETABLE TRAIL CURSOR + STRING
   ========================================== */
(function() {
  // Order: chili (front/mouse) → onion → tomato → lettuce (back)
  const VEGGIES = ['🌶️', '🧅', '🍅', '🥬'];

  // Inject CSS
  const s = document.createElement('style');
  s.textContent = `
    * { cursor: none !important; }
    #vt-canvas {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999998;
    }
    .vt-node {
      position: fixed;
      top: 0; left: 0;
      pointer-events: none;
      z-index: 999999;
      font-size: 22px;
      line-height: 1;
      user-select: none;
      will-change: transform;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: white;
      box-shadow: 0 3px 12px rgba(0,0,0,0.2);
    }
  `;
  document.head.appendChild(s);

  // Full-screen canvas for the connecting string
  const canvas = document.createElement('canvas');
  canvas.id = 'vt-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Build 4 icon nodes
  const nodes = VEGGIES.map(icon => {
    const el = document.createElement('span');
    el.className = 'vt-node';
    el.textContent = icon;
    document.body.appendChild(el);
    return { el, x: -300, y: -300 };
  });

  let mx = -300, my = -300;
  const LERP = [0.15, 0.15, 0.15, 0.15];

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function tick() {
    // Move nodes
    nodes[0].x += (mx - nodes[0].x) * LERP[0];
    nodes[0].y += (my - nodes[0].y) * LERP[0];
    for (let i = 1; i < nodes.length; i++) {
      nodes[i].x += (nodes[i-1].x - nodes[i].x) * LERP[i];
      nodes[i].y += (nodes[i-1].y - nodes[i].y) * LERP[i];
    }

    // Position icon elements
    nodes.forEach(n => {
      n.el.style.transform = `translate(${n.x}px, ${n.y}px) translate(-50%, -50%)`;
    });

    // Draw white string on canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
      // Smooth bezier curve between consecutive nodes
      const mx2 = (nodes[i-1].x + nodes[i].x) / 2;
      const my2 = (nodes[i-1].y + nodes[i].y) / 2;
      ctx.quadraticCurveTo(nodes[i-1].x, nodes[i-1].y, mx2, my2);
    }
    // End at last node
    ctx.lineTo(nodes[nodes.length-1].x, nodes[nodes.length-1].y);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();

    requestAnimationFrame(tick);
  })();
})();


/* ==========================================
   NAVBAR – scroll + dropdown toggle
   ========================================== */
(function() {
  const nav    = document.getElementById("navbar");
  const toggle = document.getElementById("navToggle");
  const drop   = document.getElementById("navDropdown");
  if (!nav || !toggle || !drop) return;

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });

  toggle.addEventListener("click", () => {
    const open = drop.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", e => {
    if (!toggle.contains(e.target) && !drop.contains(e.target)) {
      drop.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  drop.querySelectorAll(".drop-link").forEach(a => {
    a.addEventListener("click", () => {
      drop.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

/* ==========================================
   SCROLL REVEAL
   ========================================== */
function initScrollReveal() {
  // Observe typical scroll-reveal targets, plus the about heading and body
  const els = document.querySelectorAll(".sr, .menu-card, .about-big-heading, .about-body-text, .mega-footer");
  
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      
      if (el.classList.contains("about-big-heading")) {
        // Stagger the 4 words (juicy cheesy fully Loaded) dynamically when scrolled to
        const pops = el.querySelectorAll(".pop");
        pops.forEach((p, i) => {
          setTimeout(() => p.classList.add("in"), i * 140 + 80);
        });
      } else if (el.classList.contains("about-body-text")) {
        // Delay body text fade-in slightly to follow the heading popping
        setTimeout(() => el.classList.add("in"), 450);
      } else {
        // Standard fade/slide reveal
        const delay = parseInt(getComputedStyle(el).getPropertyValue("--delay")) || 0;
        setTimeout(() => el.classList.add("in"), delay);
      }
      obs.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  els.forEach(el => obs.observe(el));
}

/* ==========================================
   GALLERY PHOTO 3D TILT
   ========================================== */
document.querySelectorAll(".about-photo").forEach(photo => {
  const base = photo.classList.contains("rotate-neg5") ? -5
             : photo.classList.contains("rotate-8")    ?  8 : 5;

  photo.addEventListener("mousemove", e => {
    const r = photo.getBoundingClientRect();
    const rx = ((e.clientY - r.top  - r.height/2) / (r.height/2)) * -5;
    const ry = ((e.clientX - r.left - r.width/2)  / (r.width/2))  *  5;
    photo.style.transform = `rotate(${base}deg) perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.05)`;
  });
  photo.addEventListener("mouseleave", () => {
    photo.style.transform = `rotate(${base}deg)`;
  });
});

/* ==========================================
   MENU CARD ADD BUTTON – ripple + check
   ========================================== */
document.querySelectorAll(".mc-add-top").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    const orig = btn.textContent;
    btn.textContent = "✓";
    btn.style.background = "var(--green)";

    // Ripple
    const r = document.createElement("span");
    Object.assign(r.style, {
      position:"absolute", inset:"0", borderRadius:"50%",
      background:"rgba(255,255,255,.4)",
      transform:"scale(0)", animation:"btnRipple .45s ease-out forwards"
    });
    btn.appendChild(r);

    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = "";
      r.remove();
    }, 1200);
  });
});

// Ripple keyframe
const ks = document.createElement("style");
ks.textContent = "@keyframes btnRipple { to { transform:scale(2.8); opacity:0; } }";
document.head.appendChild(ks);

/* ==========================================
   STICKER PLACEMENT ON SCROLL EFFECT
   ========================================== */
function initStickerPlacement(selector) {
  const wrapper = document.querySelector(selector);
  if (!wrapper) return;
  const img = wrapper.querySelector('img');
  if (!img) return;

  // Make sure wrapper doesn't clip the shadow
  wrapper.style.overflow = 'visible';

  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  wrapper.appendChild(canvas);

  // Hide original image; it acts as responsive container sizing and source of pixel data
  img.style.visibility = 'hidden';

  const ctx = canvas.getContext('2d');
  let lastPeel = -1;

  function drawSticker(peel) {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    if (w === 0 || h === 0) return;

    // Use device pixel ratio for sharp rendering on retina/high-res displays
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    if (peel <= 0.01) {
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();
      return;
    }

    // Crease edge limits along top/left boundaries (max 88% peel to prevent complete detach)
    const px = peel * w * 0.88;
    const py = peel * h * 0.88;

    // Reflection geometry
    const D = px * px + py * py;
    if (D <= 0) {
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();
      return;
    }

    // Affine matrix terms for reflection across diagonal crease line (py * x + px * y - px * py = 0)
    const m11 = (px * px - py * py) / D;
    const m12 = (-2 * px * py) / D;
    const m21 = (-2 * px * py) / D;
    const m22 = (py * py - px * px) / D;
    const dx = (2 * px * py * py) / D;
    const dy = (2 * px * px * py) / D;

    const xr = dx;
    const yr = dy;

    // Create an offscreen canvas containing ONLY the pre-reflected, pre-clipped folded corner of the image
    const offscreen = document.createElement('canvas');
    offscreen.width = w * dpr;
    offscreen.height = h * dpr;
    const octx = offscreen.getContext('2d');
    octx.scale(dpr, dpr);

    octx.save();
    octx.beginPath();
    octx.moveTo(px, 0);
    octx.lineTo(0, py);
    octx.lineTo(xr, yr);
    octx.closePath();
    octx.clip();

    octx.transform(m11, m12, m21, m22, dx, dy);
    octx.drawImage(img, 0, 0, w, h);
    octx.restore();

    // --- STEP 1: Draw the flat, unpeeled part of the sticker ---
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.lineTo(0, py);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, w, h);

    // Draw the crease fold line and subtle highlight inside the unpeeled clip
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(0, py);
    ctx.strokeStyle = `rgba(0, 0, 0, ${0.10 + peel * 0.10})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(0, py);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.restore();

    // --- STEP 2: Draw the soft shadow cast by the folded flap ---
    ctx.save();
    // Reset transform to physical pixels so we draw the shadow pixel-perfect without edge artifacts
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const shadowScale = peel * 12;
    const shadowOffsetX = shadowScale * 0.35;
    const shadowOffsetY = shadowScale * 0.7;

    const physW = w * dpr;
    const physH = h * dpr;
    const physOffsetX = shadowOffsetX * dpr;
    const physOffsetY = shadowOffsetY * dpr;
    const physBlur = peel * 14 * dpr;

    // Off-screen canvas shadow trick: translate offscreen by -2000px, project shadow down by +2000px
    ctx.translate(0, -2000 * dpr);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.20)';
    ctx.shadowBlur = physBlur;
    ctx.shadowOffsetX = physOffsetX;
    ctx.shadowOffsetY = physOffsetY + 2000 * dpr;

    // Draw the offscreen canvas (which ONLY contains the sticker shape)
    ctx.drawImage(offscreen, 0, 0, physW, physH);
    ctx.restore();

    // --- STEP 3: Draw the folded sticker flap and its 3D shading ---
    ctx.save();
    // Reset transform to physical pixels to draw the offscreen corner cleanly
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(offscreen, 0, 0, w * dpr, h * dpr);

    // Apply the gradient ONLY on top of the non-transparent pixels
    ctx.globalCompositeOperation = 'source-atop';

    const physXR = xr * dpr;
    const physYR = yr * dpr;
    const physPX = px * dpr;
    const physPY = py * dpr;

    const grad = ctx.createLinearGradient(physXR / 2, physYR / 2, physXR, physYR);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.48)');
    grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.16)');
    grad.addColorStop(0.75, 'rgba(0, 0, 0, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.38)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(physPX, 0);
    ctx.lineTo(0, physPY);
    ctx.lineTo(physXR, physYR);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.restore();
  }

  function update() {
    const rect = wrapper.getBoundingClientRect();
    const vh = window.innerHeight;

    // Place effect triggers: fully curled at bottom (90% vh), fully flat at middle (48% vh)
    const startPeel = vh * 0.90;
    const endPeel = vh * 0.48;

    const progress = (startPeel - rect.top) / (startPeel - endPeel);
    const peel = Math.max(0, Math.min(1, 1 - progress));

    if (Math.abs(peel - lastPeel) < 0.002) return;
    lastPeel = peel;

    if (peel <= 0) {
      wrapper.style.animation = '';
      wrapper.style.transform = '';
      drawSticker(0);
      return;
    }

    // Freeze floating animation during placement; apply lift and tilt that flattens out
    wrapper.style.animation = 'none';
    wrapper.style.transform = `translateY(${-peel * 24}px) rotate(${-peel * 4}deg)`;

    drawSticker(peel);
  }

  if (img.complete) {
    update();
  } else {
    img.addEventListener('load', () => update());
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

// Initialize all three stickers
initStickerPlacement('.sticker-burgerselfie');
initStickerPlacement('.sticker-fries');
initStickerPlacement('.sticker-fc-burgerboy');
