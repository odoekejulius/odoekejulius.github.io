(() => {
  const loadPortfolio = async () => {
    try {
      const route = encodeURIComponent(window.location.pathname);
      const response = await fetch(`/?route=${route}`, {
        credentials: "same-origin",
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`Homepage request failed with status ${response.status}.`);
      }

      const markup = await response.text();
      document.open();
      document.write(markup);
      document.close();
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
