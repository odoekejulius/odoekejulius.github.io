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

## Search engine indexing

The portfolio's canonical URL, sitemap, robots file, social preview metadata, and structured person profile are configured for `https://odoekejulius.github.io/`. If the published site moves to another domain, update these absolute URLs in `index.html`, `robots.txt`, and `sitemap.xml`.

After publishing, verify the site in [Google Search Console](https://search.google.com/search-console/) and submit `https://odoekejulius.github.io/sitemap.xml`. You can also add the site to [Bing Webmaster Tools](https://www.bing.com/webmasters/) and submit the same sitemap. Search engines decide when to crawl, index, and rank a site; these steps make it discoverable but cannot guarantee a result for every search or an immediate ranking.

## Contact behavior

GitHub Pages only serves static files, so it cannot process server-side contact forms. The contact links open the visitor’s email app or WhatsApp directly; no message is sent through this website.

## Update the site

There is no private admin dashboard on GitHub Pages: it cannot run PHP, a database, or a secure server-side login. To edit the published content, open `index.html` in the GitHub repository, select the pencil icon, make the changes, and commit them. GitHub Pages will publish the update after its deployment finishes.

The layout and appearance are in `assets/css/style.css`; navigation and animations are in `assets/js/main.js`. To replace an image, upload the new file under `assets/images/` and update its relative path in `index.html`.

## CV and public documents

The CV and Google Data Analytics certificate PDFs and the Web Development and NYSC certificate scans are grouped under `assets/documents/`. The CV preview is always shown in the `#documents` section; the three certificates are grouped in a collapsible library that closes again after it scrolls out of view. On phones, PDF embeds are replaced with links that open the PDF directly in the browser's built-in viewer; certificate images open at full size when tapped.

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
    │   ├── google-data-analytics-professional-certificate.pdf
    │   ├── julius-odoeke-cv.pdf
    │   ├── nysc-certificate-of-national-service.jpg
    │   └── web-development-certificate.jpg
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
