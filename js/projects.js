/* ==========================================================================
   projects.js — project data, card rendering, filtering and modal.
   Exposes window.Projects = { init }
   ========================================================================== */
(function () {
  "use strict";

  /**
   * Project data. Keep content factual — unknown values use clear placeholders.
   * tags drive the filter buttons (all | ai | web | python | other).
   */
  const PROJECTS = [
    {
      id: "jarvis",
      title: "Jarvis AI Operating System",
      tags: ["ai", "python"],
      short:
        "A modular personal AI agent ecosystem combining voice interaction, local AI, automation, research, coding assistance and memory.",
      description:
        "A modular personal AI agent ecosystem designed to combine voice interaction, local AI, automation, research, coding assistance, memory, and intelligent task execution.",
      tech: ["Python", "AI", "LLM", "Speech Recognition", "TTS", "Automation"],
      features: [
        "Voice interaction (speech recognition + TTS)",
        "Local AI model support",
        "Automation and task execution",
        "Research assistance",
        "Coding assistance",
        "Persistent memory layer",
      ],
      challenges:
        "Coordinating multiple subsystems (voice, models, automation, memory) without the assistant becoming slow or fragile, and keeping responses usable in real time.",
      solutions:
        "A modular architecture where each capability is an independent module behind a common interface, so subsystems can be swapped, disabled or run locally.",
      image: "assets/images/project-1.jpg",
      repo: "https://github.com/Poornapawan541",
      demo: "",
    },
    {
      id: "skillswap",
      title: "SkillSwap",
      tags: ["ai", "web"],
      short:
        "An AI-powered skill exchange platform connecting learners and mentors through intelligent compatibility-based recommendations.",
      description:
        "An AI-powered skill exchange platform connecting learners and mentors through intelligent compatibility-based recommendations.",
      tech: ["AI", "Web", "Recommendations", "[Add stack details]"],
      features: [
        "Mentor discovery",
        "Learner profiles",
        "Skill management",
        "AI recommendations",
        "Session scheduling",
        "Ratings",
        "Achievement tracking",
      ],
      challenges:
        "Matching people usefully when profiles are sparse, and keeping recommendations explainable rather than arbitrary.",
      solutions:
        "Compatibility scoring over skill overlap and learning goals, combined with profile completeness signals to rank mentor suggestions.",
      image: "assets/images/project-2.jpg",
      repo: "https://github.com/Poornapawan541",
      demo: "https://skill-swap09.vercel.app/",
    },
    {
      id: "gym-management-system",

title: "Gym Management System",

tags: ["web", "management"],

short:
"A modern gym management system designed to streamline member management, workout tracking, attendance, and gym operations.",

description:
"A comprehensive gym management system that helps gym owners and trainers efficiently manage members, memberships, attendance, workout plans, and fitness progress through a centralized platform.",

tech: ["Web", "Database", "Authentication", "[Add stack details]"],

features: [
  "Member registration and profiles",
  "Membership management",
  "Attendance tracking",
  "Workout plan management",
  "Trainer management",
  "Payment and subscription tracking",
  "Progress tracking",
  "Dashboard and reports",
],

challenges:
"Managing member information, attendance, memberships, and fitness progress efficiently while keeping the system simple and easy to use.",

solutions:
"A centralized management platform with structured member records, automated attendance and membership tracking, workout planning, and dashboard-based insights for efficient gym operations.",

image: "assets/images/project-3.jpg",

repo: "https://github.com/Poornapawan541",

demo: "https://golden-gym-mern.ai.studio/",
    },
  ];

  /** Build a project card element (no innerHTML with dynamic strings). */
  function buildCard(project) {
    const card = document.createElement("article");
    card.className = "project card glass reveal";
    card.dataset.tags = project.tags.join(" ");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Open details for " + project.title);

    const media = document.createElement("div");
    media.className = "project__media";
    const img = document.createElement("img");
    img.src = project.image;
    img.alt = project.title + " preview";
    img.loading = "lazy";
    img.decoding = "async";
    // Elegant CSS placeholder if the image file is not present yet.
    img.addEventListener("error", () => {
      img.remove();
      const ph = document.createElement("span");
      ph.className = "project__ph";
      ph.textContent = project.title.slice(0, 2).toUpperCase();
      ph.setAttribute("aria-hidden", "true");
      media.appendChild(ph);
    });
    media.appendChild(img);

    const body = document.createElement("div");
    body.className = "project__body";

    const title = document.createElement("h3");
    title.className = "card__title";
    title.textContent = project.title;

    const desc = document.createElement("p");
    desc.textContent = project.short;

    const chips = document.createElement("ul");
    chips.className = "chips";
    project.tech.slice(0, 4).forEach((tech) => {
      const li = document.createElement("li");
      li.textContent = tech;
      chips.appendChild(li);
    });

    const actions = document.createElement("div");
    actions.className = "project__actions";

    const details = document.createElement("button");
    details.type = "button";
    details.className = "btn btn--primary btn--sm";
    details.textContent = "Details";

    actions.appendChild(details);

    if (project.repo) {
      const repo = document.createElement("a");
      repo.className = "btn btn--line btn--sm";
      repo.href = project.repo;
      repo.target = "_blank";
      repo.rel = "noopener noreferrer";
      repo.textContent = "GitHub";
      repo.addEventListener("click", (e) => e.stopPropagation());
      actions.appendChild(repo);
    }

    if (project.demo) {
      const demo = document.createElement("a");
      demo.className = "btn btn--line btn--sm";
      demo.href = project.demo;
      demo.target = "_blank";
      demo.rel = "noopener noreferrer";
      demo.textContent = "Live Demo";
      demo.addEventListener("click", (e) => e.stopPropagation());
      actions.appendChild(demo);
    }

    body.append(title, desc, chips, actions);
    card.append(media, body);

    card.addEventListener("click", () => openModal(project));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(project);
      }
    });

    return card;
  }

  /* ---------------- Modal ---------------- */
  const modalState = { lastFocused: null };

  function fillList(list, items) {
    list.textContent = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }

  function openModal(project) {
    const modal = document.getElementById("modal");
    if (!modal) return;

    modalState.lastFocused = document.activeElement;

    const media = document.getElementById("modalMedia");
    media.textContent = "";
    const img = document.createElement("img");
    img.src = project.image;
    img.alt = project.title + " preview";
    img.loading = "lazy";
    img.addEventListener("error", () => {
      img.remove();
      const ph = document.createElement("span");
      ph.className = "project__ph";
      ph.textContent = project.title.slice(0, 2).toUpperCase();
      media.appendChild(ph);
    });
    media.appendChild(img);

    document.getElementById("modalTitle").textContent = project.title;
    document.getElementById("modalDesc").textContent = project.description;
    fillList(document.getElementById("modalFeatures"), project.features);
    fillList(document.getElementById("modalTech"), project.tech);
    document.getElementById("modalChallenges").textContent = project.challenges;
    document.getElementById("modalSolutions").textContent = project.solutions;

    const repo = document.getElementById("modalRepo");
    const demo = document.getElementById("modalDemo");
    repo.href = project.repo || "#";
    repo.hidden = !project.repo;
    demo.href = project.demo || "#";
    demo.hidden = !project.demo;

    modal.hidden = false;
    document.body.classList.add("no-scroll");
    // Next frame so the transition runs from its initial state.
    window.requestAnimationFrame(() => modal.classList.add("is-open"));
    document.getElementById("modalClose").focus();
  }

  function closeModal() {
    const modal = document.getElementById("modal");
    if (!modal || modal.hidden) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    window.setTimeout(() => {
      modal.hidden = true;
    }, 300);
    if (modalState.lastFocused && modalState.lastFocused.focus) {
      modalState.lastFocused.focus();
    }
  }

  /* ---------------- Filtering ---------------- */
  function initFilters(grid) {
    const filters = Array.from(document.querySelectorAll(".filter"));
    filters.forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.dataset.filter;
        filters.forEach((b) => {
          const active = b === button;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-selected", String(active));
        });
        Array.from(grid.children).forEach((card) => {
          const tags = (card.dataset.tags || "").split(" ");
          const show = value === "all" || tags.indexOf(value) !== -1;
          card.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  function init() {
    const grid = document.getElementById("projectGrid");
    if (!grid) return;
    PROJECTS.forEach((project) => grid.appendChild(buildCard(project)));
    initFilters(grid);

    const modal = document.getElementById("modal");
    if (modal) {
      modal.addEventListener("click", (event) => {
        if (event.target.hasAttribute("data-close")) closeModal();
      });
      document.getElementById("modalClose").addEventListener("click", closeModal);
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeModal();
      });
    }
  }

  window.Projects = { init };
})();
