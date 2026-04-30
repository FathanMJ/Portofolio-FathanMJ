const heroItems = document.querySelectorAll(".anim-item");
const revealSections = document.querySelectorAll(".reveal");
const skillBars = document.querySelectorAll(".bar div");
const preloader = document.getElementById("preloader");
const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");
const themeToggle = document.getElementById("theme-toggle");
const starToggle = document.getElementById("star-toggle");
const contactForm = document.getElementById("contact-form");
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
const toolsAccordions = document.querySelectorAll(".tools-accordion");
const certCards = document.querySelectorAll(".cert-card");
const certModal = document.getElementById("cert-modal");
const certModalImage = document.getElementById("cert-modal-image");
const certModalTitle = document.getElementById("cert-modal-title");
const certBackBtn = document.getElementById("cert-back-btn");
const formHint = document.getElementById("form-hint");

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

if (starToggle) {
  const STAR_KEY = "cvStarLayer";
  const applyStarLayer = (front) => {
    document.body.classList.toggle("star-front", front);
    starToggle.textContent = front ? "Rasi: Depan" : "Rasi: Belakang";
    starToggle.setAttribute("aria-pressed", String(front));
  };

  const saved = localStorage.getItem(STAR_KEY);
  applyStarLayer(saved === "front");

  starToggle.addEventListener("click", () => {
    const willFront = !document.body.classList.contains("star-front");
    applyStarLayer(willFront);
    localStorage.setItem(STAR_KEY, willFront ? "front" : "back");
  });
}

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
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value?.trim() || "";
    const fromEmail = document.getElementById("fromEmail")?.value?.trim() || "";
    const message = document.getElementById("message")?.value?.trim() || "";
    const submitButton = contactForm.querySelector('button[type="submit"]');

    if (!name || !fromEmail || !message) return;

    if (submitButton) submitButton.disabled = true;
    if (formHint) {
      formHint.textContent = "Mengirim pesan...";
      formHint.classList.remove("success", "error");
    }

    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to send");

      if (formHint) {
        formHint.textContent = "Pesan berhasil dikirim. Terima kasih!";
        formHint.classList.add("success");
      }
      contactForm.reset();
    } catch (error) {
      const to = "fathanmutohirul@gmail.com";
      const subject = `CV Contact — ${name || "Visitor"}`;
      const body = `Nama: ${name}\nEmail: ${fromEmail}\n\nPesan:\n${message}\n`;
      const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;

      if (formHint) {
        formHint.textContent = "Gagal kirim otomatis, saya buka email app sebagai cadangan.";
        formHint.classList.add("error");
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

if (certModal && certModalImage && certModalTitle && certBackBtn && certCards.length) {
  const certModalContent = certModal.querySelector(".cert-modal-content");
  let isClosingCertModal = false;

  const closeCertModal = () => {
    if (isClosingCertModal || !certModal.classList.contains("open")) return;
    isClosingCertModal = true;

    if (certModalContent) {
      anime({
        targets: certModalContent,
        scale: [1, 0.95],
        opacity: [1, 0],
        duration: 180,
        easing: "easeInQuad",
      });
    }
    anime({
      targets: certModalImage,
      scale: [1, 0.98],
      opacity: [1, 0.1],
      duration: 170,
      easing: "easeInQuad",
    });

    setTimeout(() => {
      isClosingCertModal = false;
      if (certModalContent) {
        certModalContent.style.transform = "";
        certModalContent.style.opacity = "";
      }
      certModalImage.style.transform = "";
      certModalImage.style.opacity = "";
      certModal.classList.remove("open");
      certModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }, 190);
  };

  const openCertModal = (img, title) => {
    if (!img) return;
    certModalImage.src = img;
    certModalTitle.textContent = title || "Sertifikat";
    certModal.classList.add("open");
    certModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (certModalContent) {
      anime({
        targets: certModalContent,
        scale: [0.92, 1],
        opacity: [0, 1],
        duration: 260,
        easing: "easeOutCubic",
      });
    }
    anime({
      targets: certModalImage,
      scale: [0.96, 1],
      opacity: [0.4, 1],
      duration: 320,
      delay: 40,
      easing: "easeOutExpo",
    });
  };

  certCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      const img = card.getAttribute("data-cert-image") || card.getAttribute("href");
      const title = card.getAttribute("data-cert-title") || "Sertifikat";
      openCertModal(img, title);
    });
  });

  certBackBtn.addEventListener("click", closeCertModal);
  certModal.querySelectorAll("[data-close-cert]").forEach((el) => {
    el.addEventListener("click", closeCertModal);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCertModal();
  });
}
