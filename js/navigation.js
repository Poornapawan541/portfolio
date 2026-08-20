/* ==========================================================================
   navigation.js — navbar state, mobile menu, active section, smooth scroll.
   Exposes window.Navigation = { init }
   ========================================================================== */
(function () {
  "use strict";

  function init() {
    const nav = document.getElementById("nav");
    const links = document.getElementById("navLinks");
    const burger = document.getElementById("burger");
    const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
    const navLinks = Array.from(document.querySelectorAll(".nav__link"));
    if (!nav || !links || !burger) return;

    /* ---- Mobile menu ---- */
    function setMenu(open) {
      links.classList.toggle("is-open", open);
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    burger.addEventListener("click", () => {
      setMenu(!links.classList.contains("is-open"));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });

    /* ---- Smooth scrolling with fixed-header offset ---- */
    anchorLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        setMenu(false);
        const top = target.getBoundingClientRect().top + window.scrollY - 68;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      });
    });

    /* ---- Navbar appearance on scroll ---- */
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        nav.classList.toggle("is-scrolled", window.scrollY > 24);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---- Active section indicator ---- */
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = "#" + entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle("is-active", link.getAttribute("href") === id);
            });
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach((section) => observer.observe(section));
    }
  }

  window.Navigation = { init };
})();
