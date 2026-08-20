/* ==========================================================================
   animations.js — scroll reveals, counters, rotating type effect, orbit nodes,
   card tilt, magnetic buttons, scroll progress.
   Exposes window.Animations = { init }
   ========================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Scroll reveal ---------------- */
  function initReveal() {
    const items = Array.from(document.querySelectorAll(".reveal, .timeline__item"));
    if (!items.length) return;

    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const siblings = Array.from(el.parentElement ? el.parentElement.children : []);
          const index = Math.min(siblings.indexOf(el), 6);
          el.style.transitionDelay = index * 70 + "ms";
          el.classList.add("is-visible");
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ---------------- Number counters ---------------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    if (Number.isNaN(target)) return;
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) window.requestAnimationFrame(frame);
    }

    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    window.requestAnimationFrame(frame);
  }

  function initCounters() {
    const nums = Array.from(document.querySelectorAll("[data-count]"));
    if (!nums.length) return;
    if (!("IntersectionObserver" in window)) {
      nums.forEach(animateCount);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach((el) => observer.observe(el));
  }

  /* ---------------- Rotating typing effect ---------------- */
  function initTyping() {
    const target = document.getElementById("typeTarget");
    if (!target) return;
    const words = [
      "AI Engineer",
      "Prompt Engineer",
      "Software Developer",
      "Creative Technologist",
    ];

    if (reduceMotion) {
      target.textContent = words[0];
      return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const word = words[wordIndex];
      charIndex += deleting ? -1 : 1;
      target.textContent = word.slice(0, charIndex);

      let delay = deleting ? 45 : 85;
      if (!deleting && charIndex === word.length) {
        deleting = true;
        delay = 1600;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 320;
      }
      window.setTimeout(tick, delay);
    }

    window.setTimeout(tick, 600);
  }

  /* ---------------- Tech stack orbit ---------------- */
  const TECHNOLOGIES = [
    { name: "Python", desc: "Primary language for AI, automation and scripting.", cat: "Language" },
    { name: "JavaScript", desc: "Interactive interfaces and browser-native experiences.", cat: "Language" },
    { name: "HTML / CSS", desc: "Semantic structure and modern responsive styling.", cat: "Web" },
    { name: "SQL", desc: "Relational data modelling and queries.", cat: "Data" },
    { name: "LLMs", desc: "Working with large language models and APIs.", cat: "AI" },
    { name: "Prompt Engineering", desc: "Structured prompting and AI workflow design.", cat: "AI" },
    { name: "AI Agents", desc: "Tool-using autonomous agent architectures.", cat: "AI" },
    { name: "Ollama", desc: "Running and testing local models.", cat: "Tooling" },
    { name: "Git / GitHub", desc: "Version control and collaboration.", cat: "Tooling" },
    { name: "Automation", desc: "Scripted workflows and productivity systems.", cat: "Concept" },
  ];

  function initOrbit() {
    const orbit = document.getElementById("orbit");
    const readout = document.getElementById("orbitReadout");
    if (!orbit || !readout) return;

    const nodes = TECHNOLOGIES.map((tech, index) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "orbit__node";
      el.textContent = tech.name;
      el.setAttribute("aria-label", tech.name + " — " + tech.cat);

      const describe = () => {
        readout.textContent = tech.name + " — " + tech.cat + ". " + tech.desc;
      };
      el.addEventListener("pointerenter", describe);
      el.addEventListener("focus", describe);
      orbit.appendChild(el);

      return {
        el,
        angle: (index / TECHNOLOGIES.length) * Math.PI * 2,
        radius: index % 2 === 0 ? 0.4 : 0.31,
        phase: index * 0.7,
      };
    });

    let rafId = null;
    let t = 0;

    function place() {
      const size = orbit.clientWidth;
      nodes.forEach((node) => {
        const wobble = Math.sin(t + node.phase) * 0.015;
        const r = size * (node.radius + wobble);
        const x = Math.cos(node.angle + t * 0.05) * r;
        const y = Math.sin(node.angle + t * 0.05) * r;
        node.el.style.transform = "translate(-50%, -50%) translate(" + x + "px," + y + "px)";
      });
    }

    function loop() {
      t += 0.01;
      place();
      rafId = window.requestAnimationFrame(loop);
    }

    place();
    if (!reduceMotion && "IntersectionObserver" in window) {
      // Only animate while the section is on screen.
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !rafId) {
            rafId = window.requestAnimationFrame(loop);
          } else if (!entry.isIntersecting && rafId) {
            window.cancelAnimationFrame(rafId);
            rafId = null;
          }
        });
      });
      observer.observe(orbit);
    }
    window.addEventListener("resize", place, { passive: true });
  }

  /* ---------------- Card tilt ---------------- */
  function initTilt() {
    if (reduceMotion || window.matchMedia("(hover: none)").matches) return;
    const cards = Array.from(document.querySelectorAll(".tilt"));

    cards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(700px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" +
          (px * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  function initMagnetic() {
    if (reduceMotion || window.matchMedia("(hover: none)").matches) return;
    const targets = Array.from(document.querySelectorAll(".magnetic"));

    targets.forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const rect = el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        el.style.transform =
          "translate(" + (dx * 0.14).toFixed(2) + "px," + (dy * 0.22).toFixed(2) + "px)";
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------------- Scroll progress + parallax + to-top ---------------- */
  function initScrollEffects() {
    const bar = document.getElementById("scrollProgress");
    const toTop = document.getElementById("toTop");
    const heroVisual = document.querySelector(".hero__visual");
    let ticking = false;

    function update() {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = height > 0 ? Math.min(scrollTop / height, 1) : 0;
      if (bar) bar.style.width = (ratio * 100).toFixed(2) + "%";
      if (toTop) toTop.classList.toggle("is-visible", scrollTop > 600);
      if (heroVisual && !reduceMotion && scrollTop < window.innerHeight) {
        heroVisual.style.transform = "translateY(" + (scrollTop * 0.06).toFixed(1) + "px)";
      }
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();

    if (toTop) {
      toTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
  }

  function init() {
    initReveal();
    initCounters();
    initTyping();
    initOrbit();
    initTilt();
    initMagnetic();
    initScrollEffects();
  }

  window.Animations = { init };
})();
