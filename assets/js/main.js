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

  document.querySelectorAll("[data-office-preview]").forEach((preview) => {
    preview.addEventListener("toggle", () => {
      if (!preview.open) return;
      const fileLink = preview.parentElement.querySelector(".project-file-link");
      const frame = preview.querySelector("[data-office-frame]");
      if (!fileLink || !frame || frame.src) return;

      const fileUrl = new URL(fileLink.href, document.baseURI).href;
      const status = preview.querySelector("[data-office-status]");
      if (window.location.protocol !== "https:" || new URL(fileUrl).protocol !== "https:") {
        frame.hidden = true;
        if (status) status.textContent = "Preview is available after this site and file are published over HTTPS. ";
        return;
      }

      frame.hidden = false;
      frame.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
      if (status) status.textContent = "Preview provided by Microsoft Office for the web. ";
    });
  });

  const analyticsPreview = document.querySelector(".analytics-preview");
  if (analyticsPreview) {
    const fitAnalyticsPreview = () => {
      const contentHeight = analyticsPreview.contentDocument?.documentElement.scrollHeight;
      if (contentHeight) analyticsPreview.style.height = `${contentHeight}px`;
    };

    analyticsPreview.addEventListener("load", fitAnalyticsPreview);
    window.addEventListener("resize", fitAnalyticsPreview);
  }

  const pdfPreviews = document.querySelectorAll("[data-pdf-preview]");
  if (pdfPreviews.length && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
    const libraryUrl = new URL("assets/js/vendor/pdf.min.mjs", document.baseURI).href;
    const workerUrl = new URL("assets/js/vendor/pdf.worker.min.mjs", document.baseURI).href;
    let pdfjsPromise;

    const loadPdfjs = () => {
      if (!pdfjsPromise) {
        pdfjsPromise = import(libraryUrl).then((pdfjs) => {
          pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
          return pdfjs;
        });
      }
      return pdfjsPromise;
    };

    const renderPdfPreview = async (preview) => {
      const viewer = preview.closest(".document-viewer");
      const width = Math.floor(preview.clientWidth);
      if (!viewer || width < 20 || preview.dataset.state === "loading") return;
      if (preview.dataset.state === "rendered" && Math.abs(width - Number(preview.dataset.renderedWidth)) < 80) return;

      preview.dataset.state = "loading";
      preview.setAttribute("aria-busy", "true");
      try {
        const pdfjs = await loadPdfjs();
        const pdf = await pdfjs.getDocument(new URL(preview.dataset.pdfSource, document.baseURI).href).promise;
        const pages = document.createElement("div");
        pages.className = "pdf-preview-pages";
        const outputScale = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = (width / baseViewport.width) * outputScale;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d", { alpha: false });
          if (!context) throw new Error("Canvas rendering is unavailable in this browser.");

          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          canvas.setAttribute("role", "img");
          canvas.setAttribute("aria-label", `Page ${pageNumber} of ${pdf.numPages}`);
          const pageContainer = document.createElement("div");
          pageContainer.className = "pdf-preview-page";
          pageContainer.append(canvas);
          pages.append(pageContainer);
          await page.render({ canvasContext: context, viewport }).promise;
        }

        const status = preview.querySelector(".pdf-preview-status");
        status?.remove();
        preview.replaceChildren(pages);
        preview.dataset.state = "rendered";
        preview.dataset.renderedWidth = String(width);
        preview.setAttribute("aria-busy", "false");
        viewer.classList.remove("pdfjs-error");
        viewer.classList.add("pdfjs-ready");
        viewer.querySelector(".pdf-native-frame")?.remove();
        if (Math.abs(preview.clientWidth - width) >= 80) {
          preview.dataset.state = "idle";
          window.setTimeout(() => renderPdfPreview(preview), 0);
        }
      } catch (error) {
        console.error(`Unable to render PDF preview: ${preview.dataset.pdfSource}`, error);
        preview.dataset.state = "error";
        preview.setAttribute("aria-busy", "false");
        const status = preview.querySelector(".pdf-preview-status") ?? document.createElement("p");
        status.className = "pdf-preview-status";
        status.setAttribute("role", "status");
        status.textContent = "The inline preview is unavailable. Use the PDF link below to open the original document.";
        if (!status.parentElement) preview.prepend(status);
        viewer.classList.add("pdfjs-error");
      }
    };

    pdfPreviews.forEach((preview) => {
      let isVisible = false;
      let started = false;
      let resizeTimeout;
      const startRendering = () => {
        isVisible = true;
        if (started) return;
        started = true;
        renderPdfPreview(preview);
      };
      const scheduleRender = () => {
        if (!isVisible) return;
        window.clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => renderPdfPreview(preview), 150);
      };

      if ("ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(scheduleRender);
        resizeObserver.observe(preview);
      }
      window.addEventListener("resize", scheduleRender, { passive: true });

      const certificateLibrary = preview.closest(".certificate-library");
      if (certificateLibrary) {
        certificateLibrary.addEventListener("toggle", () => {
          if (certificateLibrary.open) startRendering();
        });
        if (certificateLibrary.open) startRendering();
      } else {
        const checkVisibility = () => {
          const bounds = preview.getBoundingClientRect();
          if (bounds.top < window.innerHeight + 300 && bounds.bottom > -300) {
            startRendering();
            window.removeEventListener("scroll", checkVisibility);
          }
        };
        window.addEventListener("scroll", checkVisibility, { passive: true });
        checkVisibility();
      }
    });
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
          const wasAbove = entry.boundingClientRect.bottom < 0;
          const heightBefore = certificateLibrary.offsetHeight;
          certificateLibrary.open = false;
          if (wasAbove) window.scrollBy({ top: certificateLibrary.offsetHeight - heightBefore, behavior: "instant" });
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

  // Count-up numbers
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 1400);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!reduceMotion && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries, o) => entries.forEach((e) => {
      if (e.isIntersecting) { runCounter(e.target); o.unobserve(e.target); }
    }), { threshold: 0.6 });
    counters.forEach((el) => counterObserver.observe(el));
  }

  // Pointer spotlight on cards (mouse and trackpad only)
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".project-card, .skill-card, .education-card, .mini-project, .stat").forEach((card) => {
      card.classList.add("has-spot");
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }, { passive: true });
    });
  }

  // Contact form: composes an email in the visitor's mail app (no server needed)
  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = form.querySelector(".form-status");
      const fields = ["name", "email", "message"].map((n) => form.elements[n]);
      let valid = true;
      fields.forEach((f) => {
        const ok = f.value.trim() && f.checkValidity();
        f.setAttribute("aria-invalid", String(!ok));
        if (!ok) valid = false;
      });
      if (!valid) { status.textContent = "Please complete your name, a valid email, and a message."; return; }
      const [name, email, message] = fields.map((f) => f.value.trim());
      const body = `${message}\n\n— ${name} (${email})`;
      window.location.href = `mailto:odoekejulius@gmail.com?subject=${encodeURIComponent("Message from " + name)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Your email app should open with the message ready to send.";
    });
  }
})();
