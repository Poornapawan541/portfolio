/* ==========================================================================
   particles.js — Canvas background field + interactive hero "AI core".
   Pure Canvas 2D + requestAnimationFrame. No libraries.
   Exposes window.Particles = { initBackground, initCore }
   ========================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Resize a canvas to its CSS box using devicePixelRatio (capped for perf). */
  function fitCanvas(canvas, ctx) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  function accentColor() {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim();
    return raw || "#4fd1c5";
  }

  /* ---------------- Background particle field ---------------- */
  function initBackground(canvas) {
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext("2d");
    let size = fitCanvas(canvas, ctx);
    let particles = [];
    let rafId = null;
    const pointer = { x: -9999, y: -9999 };

    function density() {
      // Fewer particles on small screens to keep it smooth.
      const area = size.w * size.h;
      return Math.max(28, Math.min(90, Math.round(area / 22000)));
    }

    function seed() {
      particles = [];
      const count = density();
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * size.w,
          y: Math.random() * size.h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.5 + 0.5,
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, size.w, size.h);
      const color = accentColor();
      ctx.fillStyle = color;

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges instead of bouncing (calmer motion).
        if (p.x < -10) p.x = size.w + 10;
        if (p.x > size.w + 10) p.x = -10;
        if (p.y < -10) p.y = size.h + 10;
        if (p.y > size.h + 10) p.y = -10;

        // Gentle pointer attraction.
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 26000) {
          p.x += dx * 0.0015;
          p.y += dy * 0.0015;
        }

        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Link nearby particles with faint lines.
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 16000) {
            ctx.globalAlpha = 0.1 * (1 - d2 / 16000);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      rafId = window.requestAnimationFrame(step);
    }

    function onResize() {
      size = fitCanvas(canvas, ctx);
      seed();
    }

    function onPointer(event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }

    function onVisibility() {
      if (document.hidden) {
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!rafId) {
        rafId = window.requestAnimationFrame(step);
      }
    }

    seed();
    rafId = window.requestAnimationFrame(step);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
  }

  /* ---------------- Hero AI core ---------------- */
  function initCore(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let size = fitCanvas(canvas, ctx);
    let rafId = null;
    let t = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const NODE_COUNT = 46;
    let nodes = [];

    function seed() {
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i += 1) {
        nodes.push({
          angle: Math.random() * Math.PI * 2,
          radius: 0.24 + Math.random() * 0.26,
          speed: (Math.random() * 0.4 + 0.15) * (Math.random() < 0.5 ? -1 : 1),
          wob: Math.random() * Math.PI * 2,
          r: Math.random() * 1.6 + 0.7,
        });
      }
    }

    function draw() {
      const cx = size.w / 2;
      const cy = size.h / 2;
      const base = Math.min(size.w, size.h);
      const color = accentColor();

      ctx.clearRect(0, 0, size.w, size.h);

      // Smooth pointer easing (parallax offset).
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      // Core glow.
      const glow = ctx.createRadialGradient(
        cx + pointer.x * 12,
        cy + pointer.y * 12,
        0,
        cx,
        cy,
        base * 0.42
      );
      glow.addColorStop(0, color);
      glow.addColorStop(0.18, color);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, base * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Inner pulsing core.
      const pulse = 1 + Math.sin(t * 1.6) * 0.05;
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, base * 0.11 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, base * 0.05 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Orbiting nodes.
      const positions = [];
      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];
        n.angle += n.speed * 0.004;
        const wobble = Math.sin(t * 0.9 + n.wob) * 0.02;
        const rad = base * (n.radius + wobble);
        const x = cx + Math.cos(n.angle) * rad + pointer.x * (14 * n.radius);
        const y = cy + Math.sin(n.angle) * rad * 0.86 + pointer.y * (14 * n.radius);
        positions.push({ x, y, r: n.r });

        ctx.globalAlpha = 0.75;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, n.r, 0, Math.PI * 2);
        ctx.fill();

        // Spoke to core.
        ctx.globalAlpha = 0.07;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Neighbour links.
      ctx.lineWidth = 0.6;
      for (let i = 0; i < positions.length; i += 1) {
        for (let j = i + 1; j < positions.length; j += 1) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const d2 = dx * dx + dy * dy;
          const limit = base * base * 0.012;
          if (d2 < limit) {
            ctx.globalAlpha = 0.16 * (1 - d2 / limit);
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[j].x, positions[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      t += 0.016;
      if (!reduceMotion) rafId = window.requestAnimationFrame(draw);
    }

    function onPointer(event) {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    function onLeave() {
      pointer.tx = 0;
      pointer.ty = 0;
    }

    function onResize() {
      size = fitCanvas(canvas, ctx);
      if (reduceMotion) draw();
    }

    function onVisibility() {
      if (document.hidden) {
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!rafId && !reduceMotion) {
        rafId = window.requestAnimationFrame(draw);
      }
    }

    seed();
    draw();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
  }

  window.Particles = { initBackground, initCore };
})();
