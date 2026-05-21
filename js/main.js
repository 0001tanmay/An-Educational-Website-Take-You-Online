(() => {
  const body = document.body;

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

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
})();
