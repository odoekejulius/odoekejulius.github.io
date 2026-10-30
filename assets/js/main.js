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
    let fitObserver;
    let fitTimeout;
    const syncPreviewTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      document.querySelectorAll("[data-sync-theme]").forEach((preview) => {
        const target = preview.contentDocument?.documentElement;
        if (!target) return;
        if (theme) target.setAttribute("data-theme", theme);
        else target.removeAttribute("data-theme");
      });
      scheduleAnalyticsFit();
    };

    const fitAnalyticsPreview = () => {
      const content = analyticsPreview.contentDocument?.body;
      if (!content) return;
      const contentHeight = content.scrollHeight;
      if (contentHeight) analyticsPreview.style.height = `${contentHeight}px`;
    };

    const scheduleAnalyticsFit = () => {
      window.clearTimeout(fitTimeout);
      fitTimeout = window.setTimeout(() => window.requestAnimationFrame(fitAnalyticsPreview), 100);
    };

    window.addEventListener("resize", scheduleAnalyticsFit, { passive: true });
    document.querySelectorAll("[data-sync-theme]").forEach((preview) => {
      preview.addEventListener("load", syncPreviewTheme);
    });
    analyticsPreview.addEventListener("load", () => {
      syncPreviewTheme();
      window.requestAnimationFrame(() => window.requestAnimationFrame(fitAnalyticsPreview));
      const frameWindow = analyticsPreview.contentWindow;
      const frameBody = analyticsPreview.contentDocument?.body;
      if (fitObserver) fitObserver.disconnect();
      if (frameWindow && frameBody && "ResizeObserver" in frameWindow) {
        fitObserver = new frameWindow.ResizeObserver(scheduleAnalyticsFit);
        fitObserver.observe(frameBody);
      }
      frameWindow?.addEventListener("resize", scheduleAnalyticsFit, { passive: true });
    });
    window.syncPreviewTheme = syncPreviewTheme;
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

    const withTimeout = (promise, description, onTimeout) => new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        try {
          onTimeout?.();
        } catch (error) {
          reject(error);
          return;
        }
        reject(new Error(`${description} timed out.`));
      }, 15000);

      Promise.resolve(promise).then(
        (value) => {
          window.clearTimeout(timeout);
          resolve(value);
        },
        (error) => {
          window.clearTimeout(timeout);
          reject(error);
        }
      );
    });

    const renderPdfPreview = async (preview) => {
      const viewer = preview.closest(".document-viewer");
      const width = Math.floor(preview.clientWidth);
      if (!viewer || width < 20 || preview.dataset.state === "loading" || preview.dataset.state === "error") return;
      if (preview.dataset.state === "rendered" && Math.abs(width - Number(preview.dataset.renderedWidth)) < 80) return;

      preview.dataset.state = "loading";
      preview.setAttribute("aria-busy", "true");
      try {
        const pdfjs = await withTimeout(loadPdfjs(), "PDF preview library loading");
        const loadingTask = pdfjs.getDocument(new URL(preview.dataset.pdfSource, document.baseURI).href);
        const pdf = await withTimeout(loadingTask.promise, "PDF document loading", () => loadingTask.destroy());
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
          const renderTask = page.render({ canvasContext: context, viewport });
          await withTimeout(renderTask.promise, `PDF page ${pageNumber} rendering`, () => renderTask.cancel());
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
        preview.setAttribute("aria-busy", "false");
        const fallbackFrame = viewer.querySelector(".pdf-native-frame");
        if (fallbackFrame) {
          preview.replaceChildren(fallbackFrame);
          preview.dataset.state = "fallback";
        } else {
          preview.dataset.state = preview.querySelector("canvas") ? "rendered" : "error";
        }
        viewer.classList.add("pdfjs-error");
        viewer.classList.remove("pdfjs-ready");
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

  const cmsCollections = [
    { path: "content/website-projects.json", selector: '[data-cms-projects="web"]', type: "project", category: "Web development" },
    { path: "content/analytics-projects.json", selector: '[data-cms-projects="analytics"]', type: "project", category: "Data analytics" },
    { path: "content/media.json", selector: "[data-cms-media]", type: "media" }
  ];

  const loadSiteSettings = async () => {
    const portrait = document.querySelector(".portrait-frame img");
    if (!portrait) return;
    try {
      const response = await fetch("content/site-settings.json", { cache: "no-cache" });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}.`);
      const settings = await response.json();
      if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
        throw new Error("Site settings must contain a JSON object.");
      }
      const imageUrl = safePublicUrl(settings.portrait_image);
      if (imageUrl) portrait.src = imageUrl;
      if (typeof settings.portrait_alt === "string" && settings.portrait_alt.trim()) {
        portrait.alt = settings.portrait_alt.trim();
      }
      if (imageUrl) {
        const personSchema = document.querySelector('script[type="application/ld+json"]');
        if (personSchema) {
          const schema = JSON.parse(personSchema.textContent);
          schema.image = imageUrl;
          personSchema.textContent = JSON.stringify(schema);
        }
      }
    } catch (error) {
      console.error("Unable to load site settings from content/site-settings.json.", error);
    }
  };

  const safePublicUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value.trim(), document.baseURI);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch {
      return "";
    }
  };

  const textItems = (value) => Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    : [];

  const createProjectImage = (source, alt) => {
    const imageUrl = safePublicUrl(source);
    if (!imageUrl) return null;
    const link = document.createElement("a");
    link.className = "project-image";
    link.href = imageUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = alt;
    image.loading = "lazy";
    image.decoding = "async";
    link.append(image);
    const indicator = document.createElement("span");
    indicator.className = "image-link";
    indicator.setAttribute("aria-hidden", "true");
    indicator.textContent = "↗";
    link.append(indicator);
    return link;
  };

  const addTextList = (parent, values, className) => {
    const items = textItems(values);
    if (!items.length) return;
    const list = document.createElement("ul");
    list.className = className;
    items.forEach((value) => {
      const item = document.createElement("li");
      item.textContent = value;
      list.append(item);
    });
    parent.append(list);
  };

  const addProjectLink = (parent, label, value) => {
    const href = safePublicUrl(value);
    if (!href) return;
    const link = document.createElement("a");
    link.className = "text-link";
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append(document.createTextNode(label));
    const indicator = document.createElement("span");
    indicator.setAttribute("aria-hidden", "true");
    indicator.textContent = " ↗";
    link.append(indicator);
    parent.append(link);
  };

  const addAnalyticsPackagePreview = (parent, packageUrl, title) => {
    const url = safePublicUrl(packageUrl);
    if (!url) return;

    const preview = document.createElement("details");
    preview.className = "cms-project-preview";
    const summary = document.createElement("summary");
    summary.textContent = "Explore this analysis";
    const status = document.createElement("p");
    status.className = "cms-package-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.textContent = "Open to view the interactive dashboard.";
    const dashboard = document.createElement("iframe");
    dashboard.title = `${title} interactive dashboard`;
    dashboard.loading = "lazy";
    dashboard.sandbox = "allow-scripts";
    dashboard.referrerPolicy = "no-referrer";
    preview.append(summary, status, dashboard);

    let loading = false;
    preview.addEventListener("toggle", async () => {
      if (!preview.open || loading || dashboard.srcdoc) return;
      loading = true;
      status.textContent = "Loading project preview…";
      try {
        if (!window.JSZip) throw new Error("The project ZIP reader did not load.");
        const response = await fetch(url);
        if (!response.ok) throw new Error(`The project package could not be loaded (HTTP ${response.status}).`);
        const archiveBlob = await response.blob();
        const maxArchiveSize = 5 * 1024 * 1024;
        if (archiveBlob.size > maxArchiveSize) throw new Error("Project packages must be smaller than 5 MB.");

        const archive = await window.JSZip.loadAsync(archiveBlob);
        const files = [];
        archive.forEach((path, file) => {
          if (!file.dir) files.push({ path, file });
        });
        const allowedPaths = new Set(["index.html", "report.html"]);
        if (!files.some(({ path }) => path === "index.html")
          || files.some(({ path }) => !allowedPaths.has(path))
          || files.length > 2) {
          throw new Error("This package must contain only index.html and optional report.html at its root.");
        }

        const pageMarkup = new Map();
        for (const { path, file } of files) {
          const uncompressedSize = file._data?.uncompressedSize;
          if (!Number.isSafeInteger(uncompressedSize) || uncompressedSize > 2 * 1024 * 1024) {
            throw new Error(`${path} is too large to preview.`);
          }
          const markup = await file.async("string");
          const parsed = new DOMParser().parseFromString(markup, "text/html");
          if (!/<html(?:\s|>)/i.test(markup)) {
            throw new Error(`${path} must be a complete HTML document.`);
          }
          const externalResources = parsed.querySelector(
            "base, script[src], link[href], img[src], iframe[src], audio[src], video[src], source[src]"
          );
          const styles = [
            ...Array.from(parsed.querySelectorAll("style"), (element) => element.textContent || ""),
            ...Array.from(parsed.querySelectorAll("[style]"), (element) => element.getAttribute("style") || "")
          ].join("\n");
          if (externalResources || /@import\b|url\(\s*(['"]?)(?!(?:data:|#))/i.test(styles)) {
            throw new Error(`${path} must be self-contained and cannot load external or separate files.`);
          }
          pageMarkup.set(path, markup);
        }

        dashboard.srcdoc = pageMarkup.get("index.html");
        status.textContent = "";
        status.hidden = true;

        const reportMarkup = pageMarkup.get("report.html");
        if (reportMarkup) {
          const reportDetails = document.createElement("details");
          reportDetails.className = "cms-package-report";
          const reportSummary = document.createElement("summary");
          reportSummary.textContent = "Read the analysis report";
          const reportFrame = document.createElement("iframe");
          reportFrame.title = `${title} analysis report`;
          reportFrame.loading = "lazy";
          reportFrame.sandbox = "allow-scripts";
          reportFrame.referrerPolicy = "no-referrer";
          reportFrame.srcdoc = reportMarkup;
          reportDetails.append(reportSummary, reportFrame);
          preview.append(reportDetails);
        }
      } catch (error) {
        console.error(`Unable to preview analytics package for "${title}".`, error);
        status.textContent = error instanceof Error ? error.message : "The project package could not be previewed.";
      } finally {
        loading = false;
      }
    });

    parent.append(preview);
  };

  const createProjectCard = (entry, category) => {
    const card = document.createElement("article");
    card.className = "project-card cms-project-card";
    const title = typeof entry.title === "string" && entry.title.trim() ? entry.title.trim() : "Untitled project";
    const image = createProjectImage(entry.image, typeof entry.image_alt === "string" ? entry.image_alt : `Screenshot for ${title}`);
    if (image) card.append(image);

    const content = document.createElement("div");
    content.className = "project-content";
    const meta = document.createElement("div");
    meta.className = "project-meta";
    const categoryLabel = document.createElement("span");
    categoryLabel.textContent = category;
    const yearLabel = document.createElement("span");
    yearLabel.textContent = typeof entry.year === "string" ? entry.year : "";
    meta.append(categoryLabel, yearLabel);
    content.append(meta);

    const heading = document.createElement("h3");
    heading.textContent = title;
    content.append(heading);
    if (typeof entry.description === "string" && entry.description.trim()) {
      const description = document.createElement("p");
      description.className = "cms-writeup";
      description.textContent = entry.description.trim();
      content.append(description);
    }

    addTextList(content, entry.highlights, "highlights");
    const tags = textItems(entry.tags);
    if (tags.length) {
      const tagList = document.createElement("div");
      tagList.className = "tag-list";
      tags.forEach((tag) => {
        const label = document.createElement("span");
        label.textContent = tag;
        tagList.append(label);
      });
      content.append(tagList);
    }

    if (Array.isArray(entry.screenshots)) {
      const screenshots = entry.screenshots.filter((item) => item && typeof item === "object");
      if (screenshots.length) {
        const gallery = document.createElement("div");
        gallery.className = "project-gallery";
        gallery.setAttribute("aria-label", `${title} screenshots`);
        screenshots.forEach((screenshot) => {
          const screenshotLink = createProjectImage(screenshot.image, screenshot.caption || `Screenshot for ${title}`);
          if (!screenshotLink) return;
          screenshotLink.className = "";
          const imageElement = screenshotLink.querySelector("img");
          if (imageElement) imageElement.alt = screenshot.caption || `Screenshot for ${title}`;
          screenshotLink.querySelector(".image-link")?.remove();
          const caption = document.createElement("span");
          caption.textContent = typeof screenshot.caption === "string" ? screenshot.caption : "";
          screenshotLink.append(caption);
          gallery.append(screenshotLink);
        });
        if (gallery.childElementCount) content.append(gallery);
      }
    }

    if (category === "Data analytics") {
      addAnalyticsPackagePreview(content, entry.project_package_url, title);
    } else {
      const previewUrl = safePublicUrl(entry.project_preview_url);
      if (previewUrl) {
        const preview = document.createElement("details");
        preview.className = "cms-project-preview";
        const summary = document.createElement("summary");
        summary.textContent = "Explore interactive project";
        const frame = document.createElement("iframe");
        frame.src = previewUrl;
        frame.title = `${title} interactive project preview`;
        frame.loading = "lazy";
        frame.referrerPolicy = "no-referrer";
        preview.append(summary, frame);
        content.append(preview);
      }
    }

    const projectUrl = safePublicUrl(entry.live_url);
    if (projectUrl && !/\.zip(?:$|[?#])/i.test(projectUrl)) addProjectLink(content, "View project", projectUrl);
    card.append(content);
    return card;
  };

  const getYouTubeId = (value) => {
    const href = safePublicUrl(value);
    if (!href) return "";
    try {
      const url = new URL(href);
      const host = url.hostname.replace(/^www\./, "");
      let videoId = "";
      if (host === "youtu.be") videoId = url.pathname.slice(1).split("/")[0];
      else if (host === "youtube.com" || host === "m.youtube.com") {
        if (url.pathname === "/watch") videoId = url.searchParams.get("v") || "";
        else videoId = url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] || "";
      }
      return /^[\w-]{11}$/.test(videoId) ? videoId : "";
    } catch {
      return "";
    }
  };

  const createMediaCard = (entry) => {
    const card = document.createElement("article");
    card.className = "project-card cms-media-card";
    const title = typeof entry.title === "string" && entry.title.trim() ? entry.title.trim() : "Video";
    const videoId = getYouTubeId(entry.youtube_url);
    const videoFile = safePublicUrl(entry.video_file);
    const coverImage = safePublicUrl(entry.cover_image);
    const media = document.createElement("div");
    media.className = "cms-media-player";

    if (videoId) {
      const frame = document.createElement("iframe");
      frame.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
      frame.title = title;
      frame.loading = "lazy";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      frame.allowFullscreen = true;
      media.append(frame);
    } else if (videoFile) {
      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;
      if (coverImage) video.poster = coverImage;
      const source = document.createElement("source");
      source.src = videoFile;
      source.type = /\.webm(?:$|[?#])/i.test(videoFile) ? "video/webm" : /\.ogg(?:$|[?#])/i.test(videoFile) ? "video/ogg" : "video/mp4";
      video.append(source);
      media.append(video);
    }

    if (media.childElementCount) card.append(media);
    const content = document.createElement("div");
    content.className = "project-content";
    const heading = document.createElement("h3");
    heading.textContent = title;
    content.append(heading);
    if (typeof entry.description === "string" && entry.description.trim()) {
      const description = document.createElement("p");
      description.className = "cms-writeup";
      description.textContent = entry.description.trim();
      content.append(description);
    }
    if (!videoId && videoFile) addProjectLink(content, "Open video", videoFile);
    card.append(content);
    return card;
  };

  const loadCmsCollection = async ({ path, selector, type, category }) => {
    const target = document.querySelector(selector);
    if (!target) return;
    try {
      const response = await fetch(path, { cache: "no-cache" });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}.`);
      const entries = await response.json();
      if (!Array.isArray(entries)) throw new Error("The collection must contain a JSON array.");
      entries.forEach((entry) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) return;
        const card = type === "project"
          ? createProjectCard(entry, category)
          : createMediaCard(entry);
        target.append(card);
      });
      const cards = Array.from(target.children);
      const visibleLimit = 3;
      cards.forEach((card, index) => {
        card.hidden = index >= visibleLimit;
      });
      if (cards.length > visibleLimit) {
        const itemLabel = type === "media" ? "media items" : "projects";
        const toggle = document.createElement("button");
        toggle.className = "collection-toggle";
        toggle.type = "button";
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = `Show all ${cards.length} ${itemLabel}`;
        toggle.addEventListener("click", () => {
          const expanded = toggle.getAttribute("aria-expanded") !== "true";
          toggle.setAttribute("aria-expanded", String(expanded));
          cards.forEach((card, index) => {
            card.hidden = !expanded && index >= visibleLimit;
          });
          toggle.textContent = expanded ? "Show fewer" : `Show all ${cards.length} ${itemLabel}`;
        });
        target.after(toggle);
      }
      if (type === "media" && target.childElementCount) {
        document.querySelector("[data-cms-media-section]")?.removeAttribute("hidden");
        document.querySelectorAll("[data-cms-media-link]").forEach((link) => link.removeAttribute("hidden"));
      }
    } catch (error) {
      console.error(`Unable to load portfolio content from ${path}.`, error);
    }
  };

  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    loadSiteSettings();
    cmsCollections.forEach(loadCmsCollection);
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
    }, { threshold: 0 });

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
    const nameField = form.elements.name;
    const emailField = form.elements.email;
    const topicField = form.elements.topic;
    const messageField = form.elements.message;
    const messageCount = form.querySelector("#message-count");
    const status = form.querySelector(".form-status");
    const fieldErrors = new Map([
      [nameField, form.querySelector("#name-error")],
      [emailField, form.querySelector("#email-error")],
      [messageField, form.querySelector("#message-error")],
    ]);

    const getFieldError = (field) => {
      const value = field.value.trim();
      if (!value) return "This field is required.";
      if (field.validity.typeMismatch) return "Enter a valid email address.";
      if (field.minLength > 0 && value.length < field.minLength) return `Please enter at least ${field.minLength} characters.`;
      if (field.maxLength > 0 && field.value.length > field.maxLength) return `Please keep this to ${field.maxLength} characters or fewer.`;
      return "";
    };

    const updateMessageCount = () => {
      messageCount.textContent = `${messageField.value.length.toLocaleString("en-US")} / 4,000`;
    };

    updateMessageCount();
    const updateField = (field) => {
      const error = getFieldError(field);
      const errorElement = fieldErrors.get(field);
      const invalid = field.dataset.touched === "true" && Boolean(error);
      field.setAttribute("aria-invalid", String(invalid));
      if (errorElement) errorElement.textContent = invalid ? error : "";
      return !error;
    };

    [nameField, emailField, messageField].forEach((field) => {
      field.addEventListener("input", () => {
        if (field.dataset.touched === "true") updateField(field);
        if (field === messageField) updateMessageCount();
      });
      field.addEventListener("blur", () => {
        field.dataset.touched = "true";
        updateField(field);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = [nameField, emailField, messageField];
      const invalidFields = fields.filter((field) => {
        field.dataset.touched = "true";
        return !updateField(field);
      });
      if (invalidFields.length) {
        status.textContent = "A few details need your attention. Please check the highlighted fields.";
        invalidFields[0].focus();
        return;
      }

      const name = nameField.value.trim();
      const email = emailField.value.trim();
      const topic = topicField.value;
      const message = messageField.value.trim();
      const subject = `${topic} enquiry — ${name}`;
      const body = `Hello Julius,\n\n${message}\n\n---\nName: ${name}\nEmail: ${email}\nTopic: ${topic}`;
      const mailto = `mailto:odoekejulius@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Your email app should open with your message ready. If it doesn’t, email Julius directly at odoekejulius@gmail.com.";
      window.location.assign(mailto);
    });
  }

  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    const root = document.documentElement;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const syncTheme = () => {
      const isLight = root.getAttribute("data-theme") === "light";
      themeToggle.setAttribute("aria-pressed", String(isLight));
      themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
      if (themeMeta) themeMeta.content = getComputedStyle(root).getPropertyValue("--bg").trim();
      window.syncPreviewTheme?.();
    };

    syncTheme();
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (error) {
        console.warn("Unable to save the selected color theme.", error);
      }
      syncTheme();
    });
  }
})();
