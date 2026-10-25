(() => {
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

  const filterButtons = document.querySelectorAll(".filter-button");
  const projects = document.querySelectorAll(".project-card");
  const emptyState = document.querySelector(".empty-filter");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      let visibleCount = 0;

      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      projects.forEach((project) => {
        const visible = filter === "all" || project.dataset.category === filter;
        project.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      if (emptyState) emptyState.hidden = visibleCount > 0;
    });
  });

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
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
