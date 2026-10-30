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

  const analyticsPreviews = document.querySelectorAll(".analytics-preview");
  if (analyticsPreviews.length) {
    const fitObservers = new Map();
    const fitTimeouts = new Map();
    const syncPreviewTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      document.querySelectorAll("[data-sync-theme]").forEach((preview) => {
        const target = preview.contentDocument?.documentElement;
        if (!target) return;
        if (theme) target.setAttribute("data-theme", theme);
        else target.removeAttribute("data-theme");
      });
      analyticsPreviews.forEach(scheduleAnalyticsFit);
    };

    const fitAnalyticsPreview = (preview) => {
      const content = preview.contentDocument?.body;
      if (!content) return;
      const contentHeight = content.scrollHeight;
      if (contentHeight) preview.style.height = `${contentHeight}px`;
    };

    const scheduleAnalyticsFit = (preview) => {
      window.clearTimeout(fitTimeouts.get(preview));
      const timeout = window.setTimeout(() => {
        fitTimeouts.delete(preview);
        fitAnalyticsPreview(preview);
      }, 100);
      fitTimeouts.set(preview, timeout);
    };

    window.addEventListener("resize", () => analyticsPreviews.forEach(scheduleAnalyticsFit), { passive: true });
    document.querySelectorAll("[data-sync-theme]").forEach((preview) => {
      preview.addEventListener("load", syncPreviewTheme);
    });
    analyticsPreviews.forEach((preview) => {
      preview.addEventListener("load", () => {
        syncPreviewTheme();
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => fitAnalyticsPreview(preview)));
        const frameWindow = preview.contentWindow;
        const frameBody = preview.contentDocument?.body;
        fitObservers.get(preview)?.disconnect();
        if (frameWindow && frameBody && "ResizeObserver" in frameWindow) {
          const observer = new frameWindow.ResizeObserver(() => scheduleAnalyticsFit(preview));
          fitObservers.set(preview, observer);
          observer.observe(frameBody);
        }
        frameWindow?.addEventListener("resize", () => scheduleAnalyticsFit(preview), { passive: true });
      });
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

  const updateProjectCountStats = () => {
    const projectCounts = {
      "website-projects": document.querySelectorAll("#website-projects .project-featured").length
        + document.querySelectorAll('[data-cms-projects="web"] > .cms-project-card').length,
      "analytics-projects": document.querySelectorAll("#analytics-projects > .container > .analytics-project-card").length
        + document.querySelectorAll('[data-cms-projects="analytics"] > .cms-project-card').length
    };

    Object.entries(projectCounts).forEach(([source, count]) => {
      const counter = document.querySelector(`[data-count-source="${source}"]`);
      if (!counter) return;
      counter.dataset.count = String(count);
      counter.textContent = count.toLocaleString("en-US");
    });
  };

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
    status.textContent = "Open to explore the project files.";
    const fileList = document.createElement("div");
    fileList.className = "cms-package-file-list";
    const filePreview = document.createElement("div");
    filePreview.className = "cms-package-file-preview";
    preview.append(summary, status, fileList, filePreview);

    let loading = false;
    let activeObjectUrl = "";
    preview.addEventListener("toggle", async () => {
      if (!preview.open || loading || fileList.childElementCount) return;
      loading = true;
      status.textContent = "Loading project preview…";
      try {
        if (!window.JSZip) throw new Error("The project ZIP reader did not load.");
        const response = await fetch(url);
        if (!response.ok) throw new Error(`The project package could not be loaded (HTTP ${response.status}).`);
        const archiveBlob = await response.blob();
        const maxArchiveSize = 15 * 1024 * 1024;
        if (archiveBlob.size > maxArchiveSize) throw new Error("Project packages must be smaller than 15 MB.");

        const archive = await window.JSZip.loadAsync(archiveBlob);
        const files = [];
        archive.forEach((path, file) => {
          const baseName = path.split("/").pop();
          if (!file.dir && !path.startsWith("__MACOSX/") && baseName !== ".DS_Store" && !baseName.startsWith("._")) {
            files.push({ path, file });
          }
        });
        const supportedExtensions = new Set([
          "csv", "docx", "html", "ipynb", "js", "jsx", "json", "md", "pdf", "pptx",
          "py", "r", "sql", "txt", "ts", "tsx", "xlsx", "xlsm", "png", "jpg", "jpeg", "webp"
        ]);
        if (!files.length || files.length > 50) throw new Error("A project package must contain between 1 and 50 files.");
        let totalUncompressedSize = 0;
        files.forEach(({ path, file }) => {
          const size = file._data?.uncompressedSize;
          if (!Number.isSafeInteger(size) || size > 10 * 1024 * 1024) {
            throw new Error(`${path} is too large to preview (10 MB per file maximum).`);
          }
          totalUncompressedSize += size;
          const extension = path.split(".").pop().toLowerCase();
          if (!supportedExtensions.has(extension)) throw new Error(`${path} has an unsupported file type.`);
          if (path.split("/").some((part) => part === "..")) throw new Error("The package contains an invalid file path.");
        });
        if (totalUncompressedSize > 40 * 1024 * 1024) throw new Error("The uncompressed project package is too large to preview.");

        const renderButton = (fileInfo) => {
          const button = document.createElement("button");
          button.className = "cms-package-file";
          button.type = "button";
          button.dataset.packagePath = fileInfo.path;
          button.textContent = `${fileInfo.path} · ${formatFileSize(fileInfo.file._data.uncompressedSize)}`;
          button.addEventListener("click", async () => {
            filePreview.replaceChildren();
            fileList.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
            status.hidden = false;
            status.textContent = `Opening ${fileInfo.path}…`;
            try {
              if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
              activeObjectUrl = "";
              const extension = fileInfo.path.split(".").pop().toLowerCase();
              if (extension === "html") {
                filePreview.append(await createHtmlPackagePreview(fileInfo, title));
              } else if (extension === "csv") {
                filePreview.append(await createCsvPackagePreview(fileInfo));
              } else if (extension === "xlsx" || extension === "xlsm") {
                filePreview.append(await createWorkbookPackagePreview(fileInfo));
              } else if (extension === "pdf") {
                const blob = await fileInfo.file.async("blob");
                activeObjectUrl = URL.createObjectURL(blob);
                const frame = document.createElement("iframe");
                frame.className = "cms-package-document";
                frame.title = `${title} — ${fileInfo.path}`;
                frame.src = activeObjectUrl;
                filePreview.append(frame);
              } else if (["png", "jpg", "jpeg", "webp"].includes(extension)) {
                const blob = await fileInfo.file.async("blob");
                activeObjectUrl = URL.createObjectURL(blob);
                const image = document.createElement("img");
                image.className = "cms-package-image";
                image.src = activeObjectUrl;
                image.alt = fileInfo.path;
                filePreview.append(image);
              } else if (extension === "docx") {
                filePreview.append(await createDocxPackagePreview(fileInfo));
              } else if (extension === "pptx") {
                filePreview.append(await createPptxPackagePreview(fileInfo));
              } else {
                filePreview.append(await createTextPackagePreview(fileInfo));
              }
              status.hidden = true;
              status.textContent = "";
            } catch (error) {
              console.error(`Unable to preview ${fileInfo.path} in analytics package "${title}".`, error);
              status.textContent = error instanceof Error ? error.message : `Unable to preview ${fileInfo.path}.`;
            }
          });
          fileList.append(button);
        };
        files.sort((left, right) => left.path.localeCompare(right.path));
        files.forEach(renderButton);
        status.textContent = "Choose a project file to preview it here.";
        const preferred = files.find(({ path }) => path.split("/").pop().toLowerCase() === "index.html")
          || files.find(({ path }) => ["csv", "xlsx", "xlsm", "pdf", "docx", "pptx"].includes(path.split(".").pop().toLowerCase()))
          || files[0];
        fileList.querySelector(`[data-package-path="${CSS.escape(preferred.path)}"]`)?.click();
      } catch (error) {
        console.error(`Unable to preview analytics package for "${title}".`, error);
        status.textContent = error instanceof Error ? error.message : "The project package could not be previewed.";
      } finally {
        loading = false;
      }
    });

    parent.append(preview);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const createDataTable = (headers, rows, label) => {
    const wrapper = document.createElement("div");
    wrapper.className = "cms-package-table-wrap";
    const table = document.createElement("table");
    table.className = "cms-package-table";
    table.setAttribute("aria-label", label);
    if (headers.length) {
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      headers.forEach((value) => {
        const cell = document.createElement("th");
        cell.scope = "col";
        cell.textContent = value;
        headerRow.append(cell);
      });
      thead.append(headerRow);
      table.append(thead);
    }
    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      headers.forEach((_, index) => {
        const cell = document.createElement("td");
        cell.textContent = row[index] ?? "";
        tr.append(cell);
      });
      tbody.append(tr);
    });
    table.append(tbody);
    wrapper.append(table);
    return wrapper;
  };

  const parseCsvRows = (text) => {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (character === '"') {
        if (quoted && text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (character === "," && !quoted) {
        row.push(cell);
        cell = "";
      } else if ((character === "\n" || character === "\r") && !quoted) {
        if (character === "\r" && text[index + 1] === "\n") index += 1;
        row.push(cell);
        if (row.some((value) => value !== "")) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += character;
      }
    }
    if (cell || row.length) {
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
    }
    return rows;
  };

  const createCsvPackagePreview = async ({ path, file }) => {
    if (file._data.uncompressedSize > 5 * 1024 * 1024) throw new Error("CSV previews are limited to 5 MB.");
    const rows = parseCsvRows(await file.async("string"));
    if (!rows.length) throw new Error("This CSV file has no rows to preview.");
    const headers = rows[0].slice(0, 30);
    const wrapper = document.createElement("div");
    wrapper.append(createDataTable(headers, rows.slice(1, 201).map((row) => row.slice(0, 30)), path));
    if (rows.length > 201) {
      const note = document.createElement("p");
      note.className = "cms-package-note";
      note.textContent = `Showing the first 200 of ${rows.length - 1} data rows.`;
      wrapper.append(note);
    }
    return wrapper;
  };

  const createTextPackagePreview = async ({ path, file }) => {
    if (file._data.uncompressedSize > 1024 * 1024) throw new Error("Text/code previews are limited to 1 MB.");
    const pre = document.createElement("pre");
    pre.className = "cms-package-code";
    pre.textContent = await file.async("string");
    return pre;
  };

  const createHtmlPackagePreview = async ({ path, file }, title) => {
    if (file._data.uncompressedSize > 2 * 1024 * 1024) throw new Error(`${path} is too large to preview (2 MB maximum).`);
    const markup = await file.async("string");
    const parsed = new DOMParser().parseFromString(markup, "text/html");
    if (!/<html(?:\s|>)/i.test(markup)) throw new Error(`${path} must be a complete HTML document.`);
    const externalResources = parsed.querySelector(
      'base, script[src], link[href], img[src], iframe[src], audio[src], video[src], source[src], form, object, embed, meta[http-equiv="refresh" i]'
    );
    const unsafeResources = Array.from(parsed.querySelectorAll("*")).some((element) =>
      Array.from(element.attributes).some(({ name, value }) => (
        ["src", "href", "data", "action", "formaction", "poster", "srcset", "xlink:href"].includes(name.toLowerCase())
        && value.trim()
        && !value.trim().startsWith("#")
        && !/^data:/i.test(value.trim())
      ))
    );
    const styles = [
      ...Array.from(parsed.querySelectorAll("style"), (element) => element.textContent || ""),
      ...Array.from(parsed.querySelectorAll("[style]"), (element) => element.getAttribute("style") || "")
    ].join("\n");
    if (externalResources || unsafeResources || /@import\b|url\(\s*(['"]?)(?!(?:data:|#))/i.test(styles)) {
      throw new Error(`${path} must be self-contained and cannot load external or separate files.`);
    }
    const policy = document.createElement("meta");
    policy.httpEquiv = "Content-Security-Policy";
    policy.content = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' data:; img-src data:; font-src data:; connect-src 'none'; media-src data:; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
    parsed.head.prepend(policy);
    const frame = document.createElement("iframe");
    frame.className = "cms-package-html";
    frame.title = `${title} — ${path}`;
    frame.loading = "lazy";
    frame.sandbox = "allow-scripts";
    frame.referrerPolicy = "no-referrer";
    frame.srcdoc = `<!doctype html>${parsed.documentElement.outerHTML}`;
    return frame;
  };

  const createWorkbookPackagePreview = async ({ path, file }) => {
    if (!window.JSZip) throw new Error("The project ZIP reader did not load.");
    const workbook = await window.JSZip.loadAsync(await file.async("uint8array"));
    const workbookFile = workbook.file("xl/workbook.xml");
    const relationsFile = workbook.file("xl/_rels/workbook.xml.rels");
    if (!workbookFile || !relationsFile) throw new Error(`${path} is not a supported Excel workbook.`);
    const parseXml = async (archiveFile) => new DOMParser().parseFromString(await archiveFile.async("string"), "application/xml");
    const workbookXml = await parseXml(workbookFile);
    const relationsXml = await parseXml(relationsFile);
    const elements = (xml, name) => Array.from(xml.getElementsByTagName("*")).filter((element) => element.localName === name);
    const relationships = new Map(elements(relationsXml, "Relationship").map((item) => [item.getAttribute("Id"), item.getAttribute("Target")]));
    const sheets = elements(workbookXml, "sheet").map((sheet) => ({
      name: sheet.getAttribute("name"),
      path: `xl/${(relationships.get(sheet.getAttribute("r:id")) || "").replace(/^\/?xl\//, "")}`
    })).filter((sheet) => sheet.name && workbook.file(sheet.path));
    if (!sheets.length) throw new Error(`${path} does not contain a readable worksheet.`);

    let sharedStrings = [];
    const sharedStringsFile = workbook.file("xl/sharedStrings.xml");
    if (sharedStringsFile) {
      const sharedXml = await parseXml(sharedStringsFile);
      sharedStrings = elements(sharedXml, "si").map((item) => elements(item, "t").map((text) => text.textContent).join(""));
    }
    const container = document.createElement("div");
    const select = document.createElement("select");
    select.className = "cms-package-sheet-select";
    select.setAttribute("aria-label", `Choose a worksheet in ${path}`);
    sheets.forEach(({ name }, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = name;
      select.append(option);
    });
    const sheetContent = document.createElement("div");
    container.append(select, sheetContent);
    const renderSheet = async (sheetIndex) => {
      const xml = await parseXml(workbook.file(sheets[sheetIndex].path));
      const xmlRows = elements(xml, "row").slice(0, 201);
      const grid = [];
      let maxColumn = 0;
      xmlRows.forEach((rowElement, rowIndex) => {
        const row = [];
        elements(rowElement, "c").forEach((cell) => {
          const reference = cell.getAttribute("r");
          const letters = reference.match(/[A-Z]+/i)?.[0] || "A";
          const column = Array.from(letters.toUpperCase()).reduce((value, char) => value * 26 + char.charCodeAt(0) - 64, 0) - 1;
          if (column >= 30) return;
          maxColumn = Math.max(maxColumn, column + 1);
          const value = elements(cell, "v")[0]?.textContent || "";
          const inlineText = elements(cell, "t").map((text) => text.textContent).join("");
          const type = cell.getAttribute("t");
          row[column] = type === "s" ? sharedStrings[Number(value)] || "" : type === "inlineStr" ? inlineText : value;
        });
        grid[rowIndex] = row;
      });
      const rows = grid.map((row) => Array.from({ length: maxColumn }, (_, index) => row[index] || ""));
      const headers = rows.shift() || [];
      sheetContent.replaceChildren(createDataTable(headers, rows, `${path} — ${sheets[sheetIndex].name}`));
      if (xmlRows.length > 200) {
        const note = document.createElement("p");
        note.className = "cms-package-note";
        note.textContent = "Showing the first 200 worksheet rows.";
        sheetContent.append(note);
      }
    };
    select.addEventListener("change", () => renderSheet(Number(select.value)));
    await renderSheet(0);
    return container;
  };

  const createDocxPackagePreview = async ({ path, file }) => {
    if (!window.JSZip) throw new Error("The project ZIP reader did not load.");
    const documentArchive = await window.JSZip.loadAsync(await file.async("uint8array"));
    const documentXml = documentArchive.file("word/document.xml");
    if (!documentXml) throw new Error(`${path} is not a supported Word document.`);
    const xml = new DOMParser().parseFromString(await documentXml.async("string"), "application/xml");
    const paragraphs = Array.from(xml.getElementsByTagName("*"))
      .filter((element) => element.localName === "p")
      .map((paragraph) => Array.from(paragraph.getElementsByTagName("*"))
        .filter((element) => element.localName === "t")
        .map((text) => text.textContent)
        .join(""))
      .filter(Boolean);
    const article = document.createElement("article");
    article.className = "cms-package-docx";
    paragraphs.forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      article.append(paragraph);
    });
    if (!paragraphs.length) throw new Error(`${path} does not contain readable text.`);
    return article;
  };

  const createPptxPackagePreview = async ({ path, file }) => {
    if (!window.JSZip) throw new Error("The project ZIP reader did not load.");
    const presentation = await window.JSZip.loadAsync(await file.async("uint8array"));
    const slides = Object.keys(presentation.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((left, right) => Number(left.match(/\d+/)[0]) - Number(right.match(/\d+/)[0]));
    if (!slides.length) throw new Error(`${path} does not contain readable slides.`);
    const article = document.createElement("article");
    article.className = "cms-package-docx";
    for (const [index, slidePath] of slides.entries()) {
      const slide = new DOMParser().parseFromString(await presentation.file(slidePath).async("string"), "application/xml");
      const text = Array.from(slide.getElementsByTagName("*"))
        .filter((element) => element.localName === "t")
        .map((element) => element.textContent)
        .join(" ");
      if (!text.trim()) continue;
      const section = document.createElement("section");
      const heading = document.createElement("h4");
      heading.textContent = `Slide ${index + 1}`;
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      section.append(heading, paragraph);
      article.append(section);
    }
    if (!article.childElementCount) throw new Error(`${path} does not contain readable slide text.`);
    return article;
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
      if (type === "project") updateProjectCountStats();
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
    const nameField = form.elements.namedItem("name");
    const emailField = form.elements.namedItem("email");
    const topicField = form.elements.namedItem("topic");
    const messageField = form.elements.namedItem("message");
    const messageCount = form.querySelector("#message-count");
    const status = form.querySelector(".form-status");

    if (nameField && emailField && messageField && messageCount && status) {
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
        const topic = topicField && typeof topicField.value === "string" ? topicField.value.trim() || "Something else" : "Something else";
        const message = messageField.value.trim();
        const subject = `${topic} enquiry — ${name}`;
        const body = `Hello Julius,\n\n${message}\n\n---\nName: ${name}\nEmail: ${email}\nTopic: ${topic}`;
        const mailto = `mailto:odoekejulius@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        status.textContent = "Your email app should open with your message ready. If it doesn’t, email Julius directly at odoekejulius@gmail.com.";
        window.location.assign(mailto);
      });
    } else {
      console.error("Contact form is missing required fields or status elements.");
    }
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
