(() => {
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".reading-progress");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#site-nav");

  const closeMenu = () => {
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation");
    navigation?.classList.remove("is-open");
  };

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation?.classList.toggle("is-open", !isOpen);
  });

  navigation?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const updateScrollState = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
    progress?.style.setProperty("transform", `scaleX(${Math.min(1, Math.max(0, scrollProgress))})`);
  };

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", updateScrollState);

  const analyticsPreview = document.querySelector(".analytics-preview");
  if (analyticsPreview) {
    const fitAnalyticsPreview = () => {
      const contentHeight = analyticsPreview.contentDocument?.documentElement.scrollHeight;
      if (contentHeight) analyticsPreview.style.height = `${contentHeight}px`;
    };

    analyticsPreview.addEventListener("load", fitAnalyticsPreview);
    window.addEventListener("resize", fitAnalyticsPreview);
  }

  const certificateLibrary = document.querySelector(".certificate-library");
  if (certificateLibrary) {
    const openCertificateTarget = (target) => {
      if (!target || !certificateLibrary.contains(target)) return;
      certificateLibrary.open = true;
      window.requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start"
        });
      });
    };

    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!target || !certificateLibrary.contains(target)) return;
      event.preventDefault();
      window.history.pushState(null, "", link.hash);
      openCertificateTarget(target);
    });

    if (window.location.hash) {
      openCertificateTarget(document.getElementById(decodeURIComponent(window.location.hash.slice(1))));
    }

    let libraryWasVisible = false;
    if ("IntersectionObserver" in window) {
      const libraryObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          libraryWasVisible = true;
        } else if (libraryWasVisible && certificateLibrary.open) {
          certificateLibrary.open = false;
          libraryWasVisible = false;
        }
      });
      libraryObserver.observe(certificateLibrary);
    }
  }

  const sectionLinks = navigation?.querySelectorAll('a[href^="#"]') ?? [];
  if ("IntersectionObserver" in window && sectionLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${entry.target.id}`) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });

    document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));
  }

  const projects = document.querySelectorAll(".project-card");

  projects.forEach((project, index) => {
    project.style.setProperty("--reveal-delay", `${index * 90}ms`);
  });

  document.querySelectorAll(".skill-card").forEach((card, index) => {
    card.style.setProperty("--reveal-delay", `${index * 90}ms`);
  });

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const revealItems = document.querySelectorAll(".reveal");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
})();
