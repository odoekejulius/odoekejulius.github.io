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

The layout and appearance are in `assets/css/style.css`; navigation and animations are in `assets/js/main.js`. To replace an image, upload the new file under `assets/images/` and update its relative path in `index.html`.

## CV and public documents

The CV is previewed inline from `assets/documents/julius-odoeke-cv.pdf`. The Google Data Analytics, Web Development, and NYSC certificates are listed in the site, but their scanned files are not currently in the project. Add each certificate PDF or image under `assets/documents/`, then replace its pending entry in the `#documents` section with a preview card and viewer.

GitHub Pages serves files publicly. Hiding the PDF viewer toolbar does **not** prevent a visitor from opening, saving, or copying a public file. Review personal information before publishing documents. Private documents or guaranteed download protection require access-controlled server-side hosting; static GitHub Pages cannot provide that.

## Add portfolio work

Website projects and data analytics projects are separate sections in `index.html` so each collection can grow independently. Add a website card inside `#website-projects`. Add analytics write-ups and dashboard previews inside `#analytics-projects`; put supporting static previews in `assets/data-analytics/`. Keep preview pages self-contained and test them at phone and desktop sizes before publishing. Do not link raw files as download buttons if the intent is to invite visitors to preview the work; public files can still be retrieved from their URLs.

The World Cup project dashboard is a self-contained interactive preview at `assets/data-analytics/world-cup-2026/dashboard-preview.html`; its project notes are at `assets/data-analytics/world-cup-2026/analysis-report-preview.html`. The source files remain grouped under the same folder.

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
    ├── data-analytics/
    │   └── world-cup-2026/
    │       ├── dashboard-preview.html
    │       ├── analysis-report-preview.html
    │       ├── confederation_summary.csv
    │       ├── data_cleaning_log.csv
    │       ├── dim_team_summary.csv
    │       ├── fact_team_match.csv
    │       ├── group_standings.csv
    │       ├── matches_clean.csv
    │       ├── analysis-report.docx
    │       ├── dashboard-source.jsx
    │       └── tableau-data.xlsx
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
