document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const enablePointerFX = !reducedMotion && finePointer;

// Back-to-top control
const backToTop = document.querySelector("[data-back-to-top]");
if (backToTop) {
  backToTop.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
}

// Mobile menu
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("open");
    });
  });
}

// Reveal choreography
const revealItems = document.querySelectorAll("[data-reveal]");
if (!reducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -5% 0px" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Output tabs
const tabs = Array.from(document.querySelectorAll(".tab"));
const panels = Array.from(document.querySelectorAll(".tab-panel"));

const activateTab = (tab) => {
  const controls = tab.getAttribute("aria-controls");

  tabs.forEach((item) => {
    const isActive = item === tab;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-selected", String(isActive));
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === controls);
  });
};

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab));

  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    const nextIndex =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : (index - 1 + tabs.length) % tabs.length;

    tabs[nextIndex].focus();
    activateTab(tabs[nextIndex]);
  });
});

// Hero terminal typing
const typeLine = document.querySelector(".type-line");
if (typeLine) {
  const text = typeLine.getAttribute("data-type") || "";

  if (reducedMotion) {
    typeLine.textContent = text;
  } else {
    let idx = 0;
    const tick = () => {
      typeLine.textContent = text.slice(0, idx);
      idx += 1;
      if (idx <= text.length) {
        setTimeout(tick, idx < 10 ? 50 : 34);
      }
    };
    setTimeout(tick, 320);
  }
}

// Organic pointer field on ambient blobs + hero stage
if (enablePointerFX) {
  const blobs = document.querySelectorAll(".ambient-blob");
  const stage = document.querySelector(".hero-stage");

  window.addEventListener("pointermove", (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;

    blobs.forEach((blob, i) => {
      const speed = (i + 1) * 24;
      blob.style.transform = `translate3d(${x * speed}px, ${y * speed}px, 0)`;
    });

    if (stage) {
      stage.style.transform = `perspective(1200px) rotateX(${y * -3.2}deg) rotateY(${x * 5.4}deg)`;
    }
  });
}

// Capability composition organic motion field
const capabilityComposition = document.querySelector(".capability-composition");
if (capabilityComposition) {
  const organicCards = Array.from(capabilityComposition.querySelectorAll(".organic-card"));
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let inView = true;

  const setFromEvent = (event) => {
    const rect = capabilityComposition.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    targetX = Math.max(-0.5, Math.min(0.5, x));
    targetY = Math.max(-0.5, Math.min(0.5, y));
  };

  capabilityComposition.addEventListener("pointermove", setFromEvent);
  capabilityComposition.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });

  if (enablePointerFX) {
    if ("IntersectionObserver" in window) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            inView = entry.isIntersecting;
          });
        },
        { threshold: 0.16 },
      );
      sectionObserver.observe(capabilityComposition);
    }

    const animateField = (timestamp) => {
      const breatheX = Math.sin(timestamp * 0.00042) * 0.038;
      const breatheY = Math.cos(timestamp * 0.00037) * 0.03;
      const targetBlendX = targetX + breatheX;
      const targetBlendY = targetY + breatheY;

      currentX += (targetBlendX - currentX) * 0.055;
      currentY += (targetBlendY - currentY) * 0.055;

      capabilityComposition.style.setProperty("--glow-x", `${50 + currentX * 72}%`);
      capabilityComposition.style.setProperty("--glow-y", `${48 + currentY * 72}%`);

      organicCards.forEach((card, index) => {
        const drift = Number(card.getAttribute("data-drift") || 1);
        const phase = Math.sin(timestamp * 0.0009 + index * 0.88);
        card.style.setProperty("--drift-x", `${currentX * 18 * drift}px`);
        card.style.setProperty("--drift-y", `${currentY * 12 * drift + phase * 1.25}px`);
      });

      if (inView || Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
        window.requestAnimationFrame(animateField);
      } else {
        window.setTimeout(() => window.requestAnimationFrame(animateField), 320);
      }
    };

    window.requestAnimationFrame(animateField);
  } else {
    capabilityComposition.style.setProperty("--glow-x", "50%");
    capabilityComposition.style.setProperty("--glow-y", "48%");
  }
}

// Magnetic CTA interactions
if (enablePointerFX) {
  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate3d(${x * 0.08}px, ${y * 0.08}px, 0)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "translate3d(0, 0, 0)";
    });
  });
}
