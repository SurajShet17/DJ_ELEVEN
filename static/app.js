const menuBtn = document.getElementById("menuBtn");
const menuOverlay = document.getElementById("menuOverlay");
const menuClose = document.getElementById("menuClose");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let lastFocusedEl = null;

function openMenu(){
  lastFocusedEl = document.activeElement;

  menuOverlay?.classList.add("open");
  menuOverlay?.setAttribute("aria-hidden", "false");
  menuBtn?.setAttribute("aria-expanded", "true");

  document.body.style.overflow = "hidden";

  const firstItem = menuOverlay?.querySelector(".menu-item");
  firstItem?.focus({ preventScroll: true });
}

function closeMenu(){
  menuOverlay?.classList.remove("open");
  menuOverlay?.setAttribute("aria-hidden", "true");
  menuBtn?.setAttribute("aria-expanded", "false");

  document.body.style.overflow = "";

  if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
    lastFocusedEl.focus({ preventScroll: true });
  }
}

menuBtn?.addEventListener("click", openMenu);
menuClose?.addEventListener("click", closeMenu);

menuOverlay?.addEventListener("mousedown", (e) => {
  if (e.target === menuOverlay) closeMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// Active menu item
document.querySelectorAll(".menu-item").forEach((a) => {
  try {
    const url = new URL(a.href);
    if (url.pathname === window.location.pathname && url.origin === window.location.origin) {
      a.classList.add("is-active");
    }
  } catch {
    // Ignore external or malformed links
  }

  a.addEventListener("click", () => closeMenu());
});

// Smooth scroll
document.querySelectorAll(".js-scroll").forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href") || "";

    if (!href.startsWith("#") || href.length <= 1) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    closeMenu();

    target.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });

    history.pushState(null, "", href);
  });
});

// Scroll progress
(() => {
  const progress = document.getElementById("scrollProgress");
  if (!progress) return;

  let ticking = false;

  function update(){
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const value = max > 0 ? doc.scrollTop / max : 0;

    progress.style.transform = `scaleX(${value})`;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
})();

// Seamless marquee: clone items accessibly
document.querySelectorAll(".marquee").forEach((marquee) => {
  const track = marquee.querySelector(".marquee-track");
  if (!track) return;

  if (!track.dataset.duplicated) {
    const items = Array.from(track.children);

    items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");

      clone.querySelectorAll("a, button").forEach((focusable) => {
        focusable.setAttribute("tabindex", "-1");
      });

      track.appendChild(clone);
    });

    track.dataset.duplicated = "true";
  }

  const speed = Number(marquee.getAttribute("data-speed")) || 35;
  track.style.setProperty("--duration", `${speed}s`);
});

// Scroll reveal
const revealEls = document.querySelectorAll(".js-reveal");

if (prefersReducedMotion.matches) {
  revealEls.forEach((el) => el.classList.add("is-in"));
} else if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-in"));
}

// Hero background crossfade slideshow
(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  let images = [];

  try {
    images = JSON.parse(hero.getAttribute("data-hero-images") || "[]");
  } catch {
    images = [];
  }

  if (!images.length) return;

  const interval = Number(hero.getAttribute("data-hero-interval")) || 4500;

  const layerA = hero.querySelector(".hero-bg-a");
  const layerB = hero.querySelector(".hero-bg-b");
  if (!layerA || !layerB) return;

  let idx = 0;
  let showingA = true;
  let timer = null;

  // Preload hero images
  images.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  layerA.style.backgroundImage = `url('${images[0]}')`;
  layerA.classList.add("kenburns");

  if (images[1]) {
    layerB.style.backgroundImage = `url('${images[1]}')`;
  }

  function swap() {
    const nextIdx = (idx + 1) % images.length;
    const nextUrl = images[nextIdx];

    const incoming = showingA ? layerB : layerA;
    const outgoing = showingA ? layerA : layerB;

    incoming.style.backgroundImage = `url('${nextUrl}')`;

    incoming.classList.remove("kenburns");
    void incoming.offsetWidth;
    incoming.classList.add("kenburns");

    incoming.classList.add("fade-in");
    outgoing.classList.add("fade-out");

    incoming.style.opacity = "1";
    outgoing.style.opacity = "0";

    window.setTimeout(() => {
      incoming.classList.remove("fade-in");
      outgoing.classList.remove("fade-out");
    }, 1000);

    idx = nextIdx;
    showingA = !showingA;
  }

  function start(){
    if (images.length <= 1 || prefersReducedMotion.matches) return;
    stop();
    timer = window.setInterval(swap, interval);
  }

  function stop(){
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  start();
})();