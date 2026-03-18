const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function setCurrentYear() {
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());
}

function setupMobileNav() {
  const toggle = $(".nav__toggle");
  const links = $("#nav-links");
  if (!toggle || !links) return;

  const close = () => {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Close on link click (mobile).
  $$("a[data-nav]", links).forEach((a) => a.addEventListener("click", close));

  // Close when clicking outside.
  document.addEventListener("click", (e) => {
    if (!links.classList.contains("is-open")) return;
    const t = e.target;
    if (!(t instanceof Node)) return;
    if (toggle.contains(t) || links.contains(t)) return;
    close();
  });

  // Close on Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function setupActiveSectionSpy() {
  const navLinks = $$('a[data-nav][href^="#"]');
  const map = new Map();
  navLinks.forEach((a) => {
    const id = a.getAttribute("href");
    if (!id) return;
    const el = $(id);
    if (el) map.set(el, a);
  });

  const setCurrent = (activeEl) => {
    navLinks.forEach((a) => a.removeAttribute("aria-current"));
    const a = map.get(activeEl);
    if (a) a.setAttribute("aria-current", "page");
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
      if (visible?.target) setCurrent(visible.target);
    },
    {
      root: null,
      threshold: [0.15, 0.25, 0.35, 0.5, 0.65],
      rootMargin: "-20% 0px -65% 0px",
    },
  );

  map.forEach((_a, section) => observer.observe(section));
}

function setupRevealAnimations() {
  const items = $$(".reveal");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        observer.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
  );

  items.forEach((el) => observer.observe(el));
}

function setupProjectFilter() {
  const grid = $("#projectGrid");
  if (!grid) return;

  const buttons = $$("[data-filter]");
  const cards = $$("[data-tags]", grid);

  const setActive = (btn) => {
    buttons.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
  };

  const apply = (value) => {
    cards.forEach((card) => {
      const tags = (card.getAttribute("data-tags") || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const show = value === "all" ? true : tags.includes(value);
      card.style.display = show ? "" : "none";
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = (btn.getAttribute("data-filter") || "all").toLowerCase();
      setActive(btn);
      apply(value);
    });
  });
}

function setupThemeToggle() {
  const btn = $("#themeToggle");
  if (!btn) return;
  const icon = $(".icon-btn__icon", btn);

  const current = () => document.documentElement.dataset.theme || "dark";
  const set = (t) => {
    document.documentElement.dataset.theme = t;
    localStorage.setItem("theme", t);
    if (icon) icon.textContent = t === "dark" ? "☾" : "☀";
    btn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
  };

  // Default if none saved: dark.
  if (!document.documentElement.dataset.theme) set("dark");
  else set(current());

  btn.addEventListener("click", () => {
    set(current() === "dark" ? "light" : "dark");
  });
}

async function setupResumeLink() {
  const a = $("#resumeDownload");
  if (!a) return;

  try {
    const res = await fetch(a.getAttribute("href") || "", { method: "HEAD" });
    if (!res.ok) {
      a.setAttribute("aria-disabled", "true");
      a.textContent = "Add assets/resume.pdf";
    }
  } catch {
    a.setAttribute("aria-disabled", "true");
    a.textContent = "Add assets/resume.pdf";
  }
}

function setupContactForm() {
  const form = $("#contactForm");
  const note = $("#formNote");
  if (!form || !note) return;

  const setNote = (msg, ok = false) => {
    note.textContent = msg;
    note.style.color = ok ? "var(--ok)" : "var(--muted)";
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const subjectInput = String(fd.get("subject") || "").trim();
    const message = String(fd.get("message") || "").trim();

    if (!name || !email || !subjectInput || !message) {
      setNote("Please fill in all fields.");
      return;
    }

    // For static sites, we can open mail with prefilled content.
    const subject = encodeURIComponent(subjectInput);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const to = "youremail@example.com";
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

    setNote("Opening your email app…", true);
    form.reset();
  });
}

setCurrentYear();
setupMobileNav();
setupActiveSectionSpy();
setupRevealAnimations();
setupProjectFilter();
setupThemeToggle();
setupResumeLink();
setupContactForm();

