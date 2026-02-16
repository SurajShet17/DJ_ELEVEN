const menuBtn = document.getElementById("menuBtn");
const menuOverlay = document.getElementById("menuOverlay");
const menuClose = document.getElementById("menuClose");

function openMenu(){
  menuOverlay.classList.add("open");
  menuOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // lock scroll
}

function closeMenu(){
  menuOverlay.classList.remove("open");
  menuOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = ""; // unlock scroll
}


menuBtn?.addEventListener("click", openMenu);
menuClose?.addEventListener("click", closeMenu);
// click outside (only if you click the dark background, not inside)
menuOverlay?.addEventListener("mousedown", (e) => {
  if (e.target === menuOverlay) closeMenu();
});
// ESC closes
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
// Optional: close menu after clicking a menu item
document.querySelectorAll(".menu-item").forEach((a) => {
  a.addEventListener("click", () => closeMenu());
});

// Smooth scroll
document.querySelectorAll(".js-scroll").forEach(a => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href") || "";
    if (href.startsWith("#")) {
      e.preventDefault();
      closeMenu();
      document.querySelector(href)?.scrollIntoView({behavior:"smooth"});
    }
  });
});

// Seamless marquee: duplicate items so animation can translate -50% cleanly.
document.querySelectorAll(".marquee").forEach((marquee) => {
  const track = marquee.querySelector(".marquee-track");
  if (!track) return;

  // Duplicate only once, and only if not already duplicated
  if (!track.dataset.duplicated) {
    track.innerHTML += track.innerHTML;
    track.dataset.duplicated = "true";
  }

  // Set animation duration via data-speed (seconds)
  const speed = Number(marquee.getAttribute("data-speed")) || 35;
  track.style.setProperty("--duration", `${speed}s`);
});


// Hero background crossfade slideshow (two-layer blend)
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

  // init
  layerA.style.backgroundImage = `url('${images[0]}')`;
  layerA.classList.add("kenburns");
  if (images[1]) layerB.style.backgroundImage = `url('${images[1]}')`;

  function swap() {
    const nextIdx = (idx + 1) % images.length;
    const nextUrl = images[nextIdx];

    const incoming = showingA ? layerB : layerA;
    const outgoing = showingA ? layerA : layerB;

    // Prepare incoming
    incoming.style.backgroundImage = `url('${nextUrl}')`;
    incoming.classList.remove("kenburns"); // reset animation
    void incoming.offsetWidth; // reflow to restart CSS animation
    incoming.classList.add("kenburns");

    // Fade
    incoming.classList.add("fade-in");
    outgoing.classList.add("fade-out");

    incoming.style.opacity = "1";
    outgoing.style.opacity = "0";

    // Cleanup transition classes (keeps it stable)
    setTimeout(() => {
      incoming.classList.remove("fade-in");
      outgoing.classList.remove("fade-out");
    }, 1000);

    idx = nextIdx;
    showingA = !showingA;
  }

  // If only 1 image, do nothing beyond Ken Burns
  if (images.length === 1) return;

  setInterval(swap, interval);
})();

