(() => {
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav-drawer]");
  if (toggle && nav) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => {
      const open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll('a[href^="#"]').forEach((link) =>
      link.addEventListener("click", () => {
        body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener(
      "pointerdown",
      (e) => {
        if (!body.classList.contains("nav-open")) return;
        const target = /** @type {Node} */ (e.target);
        if (nav.contains(target) || toggle.contains(target)) return;
        body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      },
      true
    );
  }

  /** FAQ accordion — single pane open */
  document.querySelectorAll("[data-acc-item]").forEach((item, _, list) => {
    const trig = item.querySelector("[data-acc-trigger]");
    if (!trig) return;

    const expand = !!item.classList.contains("is-open");
    trig.setAttribute("aria-expanded", expand ? "true" : "false");

    trig.addEventListener("click", () => {
      const wasOpen = item.classList.contains("is-open");
      list.forEach((i) => {
        i.classList.remove("is-open");
        const t = i.querySelector("[data-acc-trigger]");
        t?.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("is-open");
        trig.setAttribute("aria-expanded", "true");
      }
    });
  });

  const revealEls = document.querySelectorAll("[data-reveal]");
  if (!reduceMotion && revealEls.length) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -52px", threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  const header = document.querySelector(".site-header");
  const orbitDock = document.querySelector("[data-orbit-dock]");
  const orbitLinks = orbitDock ? orbitDock.querySelectorAll("[data-orbit-link]") : [];
  const orbitSectionIds = ["hero", "paths", "courses", "gate", "practice", "reviews", "faq", "contact"];
  const orbitSections = orbitSectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  const gridLines = document.querySelector(".page-home .hero-grid-lines");

  function setOrbitActive(id) {
    if (!orbitDock || orbitLinks.length === 0) return;
    orbitLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const match = href === `#${id}`;
      link.classList.toggle("orbit-dock__link--active", match);
      if (match) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function hashSectionId() {
    const raw = (location.hash || "").replace(/^#/, "");
    return orbitSectionIds.includes(raw) ? raw : null;
  }

  function pickOrbitSection() {
    const vh = window.innerHeight || 1;
    const focusY = vh * 0.38;
    const hashId = hashSectionId();
    if (hashId) {
      const el = document.getElementById(hashId);
      if (el) {
        const r = el.getBoundingClientRect();
        const overlap = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        if (overlap > vh * 0.18) return hashId;
      }
    }
    let best = orbitSections[0]?.id ?? "hero";
    let bestDist = Infinity;
    orbitSections.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < 72 || r.top > vh) return;
      const mid = (r.top + r.bottom) / 2;
      const dist = Math.abs(mid - focusY);
      if (dist < bestDist) {
        bestDist = dist;
        best = sec.id;
      }
    });
    return best;
  }

  let scrollRafQueued = false;
  function flushScrollEffects() {
    scrollRafQueued = false;

    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("site-header--scrolled", y > 48);

    if (!reduceMotion && gridLines) {
      const hero = document.getElementById("hero");
      const vh = window.innerHeight || 1;
      if (hero) {
        const r = hero.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const t =
            Math.min(Math.max((vh * 0.52 - Math.max(r.top, 0)) / Math.max(r.height, vh), 0), 1) -
            0.5;
          const shiftPx = t * 32;
          gridLines.style.transform = `translate3d(0, ${shiftPx}px, 0)`;
        } else {
          gridLines.style.transform = "";
        }
      }
    }

    if (orbitDock && orbitLinks.length && orbitSections.length === orbitSectionIds.length) {
      setOrbitActive(pickOrbitSection());
    }
  }

  function onScrollThrottle() {
    if (!scrollRafQueued) {
      scrollRafQueued = true;
      requestAnimationFrame(flushScrollEffects);
    }
  }

  window.addEventListener("scroll", onScrollThrottle, { passive: true });
  window.addEventListener("resize", flushScrollEffects, { passive: true });
  window.addEventListener("hashchange", flushScrollEffects, { passive: true });

  if (orbitDock && orbitLinks.length && orbitSections.length === orbitSectionIds.length) {
    orbitLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const href = link.getAttribute("href") || "";
        const id = href.replace(/^#/, "");
        if (!id) return;
        requestAnimationFrame(() => setOrbitActive(id));
      });
    });
    requestAnimationFrame(() => {
      flushScrollEffects();
      requestAnimationFrame(flushScrollEffects);
    });
    window.addEventListener("load", flushScrollEffects, { passive: true });
  }

  flushScrollEffects();
})();
