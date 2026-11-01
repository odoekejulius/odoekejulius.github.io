(() => {
  const loadPortfolio = async () => {
    try {
      const requestedPath = window.location.pathname.replace(/\/+$/, "") || "/";
      const response = await fetch("/", {
        credentials: "same-origin",
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`Homepage request failed with status ${response.status}.`);
      }

      const markup = await response.text();
      const portfolio = new DOMParser().parseFromString(markup, "text/html");
      document.documentElement.replaceWith(portfolio.documentElement);
      window.history.replaceState(window.history.state, "", requestedPath);

      for (const inertScript of document.querySelectorAll("script")) {
        const script = document.createElement("script");
        for (const attribute of inertScript.attributes) {
          script.setAttribute(attribute.name, attribute.value);
        }

        if (script.src) {
          script.async = false;
          const loaded = new Promise((resolve, reject) => {
            script.addEventListener("load", resolve, { once: true });
            script.addEventListener("error", () => reject(new Error(`Unable to load ${script.src}.`)), { once: true });
          });
          inertScript.replaceWith(script);
          await loaded;
        } else {
          script.textContent = inertScript.textContent;
          inertScript.replaceWith(script);
        }
      }
    } catch (error) {
      console.error("Unable to load the portfolio section.", error);
      const message = document.createElement("p");
      message.textContent = "The portfolio could not be loaded. Please try again.";
      const homeLink = document.createElement("a");
      homeLink.href = "/";
      homeLink.textContent = "Return to the portfolio home page";
      document.body.replaceChildren(message, homeLink);
    }
  };

  loadPortfolio();
})();
