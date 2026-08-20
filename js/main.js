/* ==========================================================================
   main.js — bootstrap: loader, theme, cursor, mouse glow, contact form,
   copy-email, then hands off to the other modules.
   ========================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Theme ---------------- */
  function initTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById("themeToggle");
    const stored = localStorage.getItem("pk-theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    root.setAttribute("data-theme", stored || (prefersLight ? "light" : "dark"));

    if (!toggle) return;
    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("pk-theme", next);
    });
  }

  /* ---------------- Loader ---------------- */
  function initLoader(onDone) {
    const loader = document.getElementById("loader");
    const fill = document.getElementById("loaderFill");
    const pct = document.getElementById("loaderPct");
    const label = document.getElementById("loaderLabel");
    if (!loader || !fill || !pct) {
      onDone();
      return;
    }

    let value = 0;
    const timer = window.setInterval(() => {
      value = Math.min(100, value + Math.random() * 18 + 8);
      fill.style.width = value + "%";
      pct.textContent = Math.round(value) + "%";
      if (value >= 100) {
        window.clearInterval(timer);
        if (label) label.textContent = "WELCOME";
        window.setTimeout(() => {
          loader.classList.add("is-done");
          onDone();
        }, 420);
      }
    }, reduceMotion ? 40 : 130);
  }

  /* ---------------- Custom cursor ---------------- */
  function initCursor() {
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (!dot || !ring || isTouch || reduceMotion) return;

    document.body.classList.add("has-cursor");
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { x: pos.x, y: pos.y };

    window.addEventListener(
      "pointermove",
      (event) => {
        pos.x = event.clientX;
        pos.y = event.clientY;
        dot.style.transform =
          "translate(-50%, -50%) translate(" + pos.x + "px," + pos.y + "px)";
      },
      { passive: true }
    );

    function loop() {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      ring.style.transform =
        "translate(-50%, -50%) translate(" + ringPos.x.toFixed(1) + "px," +
        ringPos.y.toFixed(1) + "px)";
      window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);

    const hoverables = "a, button, .project, .filter, input, textarea, .orbit__node";
    document.addEventListener("pointerover", (event) => {
      if (event.target.closest(hoverables)) ring.classList.add("is-hover");
    });
    document.addEventListener("pointerout", (event) => {
      if (event.target.closest(hoverables)) ring.classList.remove("is-hover");
    });
  }

  /* ---------------- Mouse-following background glow ---------------- */
  function initGlow() {
    const glow = document.getElementById("bgGlow");
    if (!glow || reduceMotion) return;
    let ticking = false;
    window.addEventListener(
      "pointermove",
      (event) => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          glow.style.setProperty("--mx", event.clientX + "px");
          glow.style.setProperty("--my", event.clientY + "px");
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------------- Contact form ---------------- */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const status = document.getElementById("formStatus");
    const message = document.getElementById("cf-message");
    const counter = document.getElementById("msgCount");

    if (message && counter) {
      message.addEventListener("input", () => {
        counter.textContent = String(message.value.length);
      });
    }

    function setError(input, text) {
      const field = input.closest(".field");
      const slot = form.querySelector('[data-error-for="' + input.id + '"]');
      if (field) field.classList.toggle("has-error", Boolean(text));
      if (slot) slot.textContent = text || "";
      return !text;
    }

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

    function validate() {
      const name = form.elements.name;
      const email = form.elements.email;
      const subject = form.elements.subject;
      const body = form.elements.message;

      let ok = true;
      ok = setError(name, name.value.trim().length < 2 ? "Please enter your name (2+ characters)." : "") && ok;
      ok = setError(email, !EMAIL_RE.test(email.value.trim()) ? "Please enter a valid email address." : "") && ok;
      ok = setError(subject, subject.value.trim().length < 3 ? "Please add a short subject." : "") && ok;
      ok = setError(
        body,
        body.value.trim().length < 10
          ? "Message must be at least 10 characters."
          : body.value.length > 1000
            ? "Message must be under 1000 characters."
            : ""
      ) && ok;
      return ok;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validate()) {
        if (status) status.textContent = "Please fix the highlighted fields.";
        return;
      }

      const to = "your.email@example.com";
      const subject = encodeURIComponent(form.elements.subject.value.trim());
      const body = encodeURIComponent(
        form.elements.message.value.trim() +
          "\n\n— " +
          form.elements.name.value.trim() +
          " (" +
          form.elements.email.value.trim() +
          ")"
      );
      window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;

      if (status) {
        status.textContent = "Opening your email client… no backend is connected to this form.";
      }
      form.reset();
      if (counter) counter.textContent = "0";
    });
  }

  /* ---------------- Copy email ---------------- */
  function initCopyEmail() {
    const button = document.getElementById("copyEmail");
    if (!button) return;
    button.addEventListener("click", async () => {
      const email = button.dataset.email || "";
      const original = button.textContent;
      try {
        await navigator.clipboard.writeText(email);
        button.textContent = "Copied";
      } catch (error) {
        button.textContent = "Copy failed";
      }
      window.setTimeout(() => {
        button.textContent = original;
      }, 1600);
    });
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    initTheme();
    initCursor();
    initGlow();
    initContactForm();
    initCopyEmail();

    if (window.Navigation) window.Navigation.init();
    if (window.Projects) window.Projects.init();

    if (window.Particles) {
      window.Particles.initBackground(document.getElementById("bgCanvas"));
      window.Particles.initCore(document.getElementById("coreCanvas"));
    }

    initLoader(() => {
      if (window.Animations) window.Animations.init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
