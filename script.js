const heroItems = document.querySelectorAll(".anim-item");
const revealSections = document.querySelectorAll(".reveal");
const skillBars = document.querySelectorAll(".bar div");
const preloader = document.getElementById("preloader");
const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");
const themeToggle = document.getElementById("theme-toggle");
const contactForm = document.getElementById("contact-form");
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
const toolsAccordions = document.querySelectorAll(".tools-accordion");

anime({
  targets: ".loader-ring",
  rotate: 360,
  duration: 900,
  easing: "linear",
  loop: true,
});

window.addEventListener("load", () => {
  setTimeout(() => {
    preloader.classList.add("hidden");
  }, 800);
});

if (window.matchMedia("(hover: hover)").matches) {
  window.addEventListener("mousemove", (event) => {
    anime({
      targets: cursorDot,
      left: event.clientX,
      top: event.clientY,
      duration: 100,
      easing: "linear",
    });

    anime({
      targets: cursorOutline,
      left: event.clientX,
      top: event.clientY,
      duration: 300,
      easing: "easeOutQuad",
    });
  });
}

themeToggle.addEventListener("click", () => {
  const body = document.body;
  const isDark = body.classList.contains("theme-dark");
  body.classList.toggle("theme-dark", !isDark);
  body.classList.toggle("theme-light", isDark);
  themeToggle.textContent = isDark ? "☀️" : "🌙";
});

if (navToggle && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const willOpen = !navLinks.classList.contains("open");
    navLinks.classList.toggle("open", willOpen);
    navToggle.setAttribute("aria-expanded", String(willOpen));
  });

  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

if (toolsAccordions.length) {
  const setPanelState = (accordion, panel, open) => {
    accordion.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("open", open);
    panel.style.maxHeight = open ? `${panel.scrollHeight}px` : "0px";
  };

  toolsAccordions.forEach((accordion) => {
    const id = accordion.getAttribute("aria-controls");
    const panel = id ? document.getElementById(id) : null;
    if (!panel) return;

    setPanelState(accordion, panel, false);

    accordion.addEventListener("click", () => {
      const isOpen = accordion.getAttribute("aria-expanded") === "true";
      setPanelState(accordion, panel, !isOpen);
    });
  });

  window.addEventListener("resize", () => {
    toolsAccordions.forEach((accordion) => {
      const id = accordion.getAttribute("aria-controls");
      const panel = id ? document.getElementById(id) : null;
      if (!panel) return;
      const isOpen = accordion.getAttribute("aria-expanded") === "true";
      if (isOpen) panel.style.maxHeight = `${panel.scrollHeight}px`;
    });
  });
}

anime
  .timeline({
    easing: "easeOutQuart",
    duration: 1000,
  })
  .add({
    targets: ".top-nav",
    translateY: [-60, 0],
    opacity: [0, 1],
    scale: [0.98, 1],
  })
  .add(
    {
      targets: heroItems,
      opacity: [0, 1],
      translateY: [50, 0],
      delay: anime.stagger(140),
    },
    "-=500"
  );

anime({
  targets: [".bg-glow-1", ".bg-glow-2"],
  translateX: () => anime.random(-30, 30),
  translateY: () => anime.random(-20, 20),
  duration: 4200,
  direction: "alternate",
  loop: true,
  easing: "easeInOutSine",
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      anime({
        targets: entry.target,
        opacity: [0, 1],
        translateY: [45, 0],
        scale: [0.98, 1],
        duration: 1100,
        easing: "easeOutExpo",
      });

      if (entry.target.id === "keahlian") {
        skillBars.forEach((bar, index) => {
          anime({
            targets: bar,
            width: `${bar.dataset.level}%`,
            delay: 200 + index * 120,
            duration: 1200,
            easing: "easeOutQuart",
          });
        });
      }

      if (entry.target.id === "proyek") {
        anime({
          targets: ".project-card",
          opacity: [0, 1],
          translateY: [18, 0],
          scale: [0.98, 1],
          delay: anime.stagger(160),
          duration: 900,
          easing: "easeOutExpo",
        });
      }

      if (entry.target.id === "tools") {
        anime({
          targets: ".tech-card",
          opacity: [0, 1],
          translateY: [28, 0],
          scale: [0.95, 1],
          delay: anime.stagger(100),
          duration: 850,
          easing: "easeOutExpo",
        });
      }

      if (entry.target.id === "sertifikat") {
        anime({
          targets: ".cert-card",
          opacity: [0, 1],
          translateY: [18, 0],
          scale: [0.98, 1],
          delay: anime.stagger(140),
          duration: 900,
          easing: "easeOutExpo",
        });
      }

      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.25 }
);

revealSections.forEach((section) => observer.observe(section));

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value?.trim() || "";
    const fromEmail = document.getElementById("fromEmail")?.value?.trim() || "";
    const message = document.getElementById("message")?.value?.trim() || "";

    const to = "fathanmutohirul@gmail.com";
    const subject = `CV Contact — ${name || "Visitor"}`;
    const body = `Nama: ${name}\nEmail: ${fromEmail}\n\nPesan:\n${message}\n`;

    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  });
}
