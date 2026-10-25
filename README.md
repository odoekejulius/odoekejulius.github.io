# Julius Odo-Eke — Portfolio

A responsive, static portfolio site built with HTML, CSS, and vanilla JavaScript. It has no PHP, database, build step, custom domain, API keys, or third-party runtime dependencies.

## Run locally

Open `index.html` directly in a browser. No local server or build step is required.

## Publish with GitHub Pages

1. Create a GitHub repository and upload the contents of this folder to the repository root.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/(root)` folder, then save.
5. Wait for the Pages deployment to finish. GitHub will show the live URL in the Pages settings.

The site uses relative asset paths and works both at a repository URL such as `https://username.github.io/repository/` and at a user or organization URL. A custom domain and `CNAME` file are optional and are not needed.

## Contact behavior

GitHub Pages only serves static files, so it cannot process server-side contact forms. The contact links open the visitor’s email app or WhatsApp directly; no message is sent through this website.

## Update the site

There is no private admin dashboard on GitHub Pages: it cannot run PHP, a database, or a secure server-side login. To edit the published content, open `index.html` in the GitHub repository, select the pencil icon, make the changes, and commit them. GitHub Pages will publish the update after its deployment finishes.

The layout and appearance are in `assets/css/style.css`; navigation, project filtering, and animations are in `assets/js/main.js`. To replace an image, upload the new file under `assets/images/` and update its relative path in `index.html`.

## CV and public documents

The CV is previewed in the page from `assets/documents/julius-odoeke-cv.pdf`. To add another public PDF:

1. Upload it to `assets/documents/`.
2. Add a document card in the `#documents` section of `index.html`, linking to a unique preview anchor.
3. Add a matching viewer with an `<iframe>` whose `src` points to the PDF, plus a direct-link fallback for browsers that do not display embedded PDFs.
4. Test the preview and fallback link locally, then commit and let GitHub Pages deploy the change.

GitHub Pages serves these files publicly. Hiding the PDF viewer toolbar does **not** prevent a visitor from opening, saving, or copying the file. Review any personal or contact information in a document before publishing it.

## Project structure

```text
.
├── index.html
├── README.md
└── assets/
    ├── favicon.svg
    ├── css/
    │   └── style.css
    ├── documents/
    │   └── julius-odoeke-cv.pdf
    ├── images/
    │   ├── julius-odoeke.jpeg
    │   └── renacido/
    │       ├── renacido-admin-dashboard.png
    │       ├── renacido-admin-sign-in.png
    │       ├── renacido-customer-sign-in.png
    │       ├── renacido-storefront-footer.png
    │       └── renacido-storefront-home.png
    └── js/
        └── main.js
```
