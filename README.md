# Julius Odo-Eke — Portfolio

A responsive, static portfolio site built with HTML, CSS, and vanilla JavaScript. It has no PHP, database, build step, custom domain, or API keys. The PDF renderer is hosted locally with the site, so previews do not depend on a third-party runtime service.

## Run locally

Open `index.html` directly in a browser to view the site. The canvas-based PDF previews require HTTP or HTTPS; use XAMPP or another local web server to test them. Direct-file mode retains the browser's native PDF viewer and original-PDF links as fallbacks.

## Multiple visitors and scrolling

The site is static and stateless: visitors, tabs, and browsers do not share page state or interfere with one another. GitHub Pages serves the same read-only files to multiple visitors at once; concurrency and availability are handled by the hosting provider. A copy opened from `file://` or `localhost` is only reachable on that device unless a web server is deliberately configured for network access. In-page scrolling is smooth, while the operating system's reduced-motion preference is respected.

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

The layout and appearance are in `assets/css/style.css`; navigation, animations, and PDF rendering are in `assets/js/main.js`. The self-hosted Mozilla PDF.js 4.10.38 renderer and its Apache 2.0 license are in `assets/js/vendor/`. To replace an image, upload the new file under `assets/images/` and update its relative path in `index.html`.

## CV and public documents

The CV and Google Data Analytics certificate PDFs and the Web Development and NYSC certificate scans are grouped under `assets/documents/`. The `#documents` section renders PDF pages in responsive canvases on desktop and mobile; original PDF links and native browser viewers remain available as fallbacks. The three certificates are grouped in a collapsible library that closes again after it scrolls out of view. Certificate images open at full size when tapped.

GitHub Pages serves files publicly. Hiding the PDF viewer toolbar does **not** prevent a visitor from opening, saving, or copying a public file. Review personal information before publishing documents. Private documents or guaranteed download protection require access-controlled server-side hosting; static GitHub Pages cannot provide that.

## Add images and other file types

This site has no visitor upload form. To publish a file, add it to the site yourself and link to it from `index.html`. Standard browser image formats such as JPG/JPEG, PNG, GIF, WebP, and SVG can be shown with an `<img>` element; PDFs use the site's responsive PDF preview. Word (`.doc`/`.docx`), Excel (`.xls`/`.xlsx`), and PowerPoint (`.ppt`/`.pptx`) files can be offered with a Microsoft Office for the web preview and a direct file link. The preview is loaded only after a visitor opens it and requires the file to be publicly available over HTTPS. Microsoft handles that preview, so it may be unavailable in some browsers or networks; keep the direct link as a fallback. CSV and other browser-readable text files can be linked directly. Other formats can still be published as downloadable files, but an in-browser preview depends on the visitor's browser or a compatible viewer.

The World Cup project lists its report, workbook, and all six CSV files in the expandable **Project files and data** section. To add another Office file, copy one of its entries in `index.html`, update the filename, title, file link, and iframe title, and keep the `data-office-preview` and `data-office-frame` attributes. The site script builds the Microsoft preview URL from the associated file link. Add a PowerPoint file the same way when one is available. Remember that every deployed asset is public and may be copied by visitors.

## Add portfolio work

Website projects and data analytics projects are separate sections in `index.html` so each collection can grow independently. Add a website card inside `#website-projects`. Add analytics write-ups and dashboard previews inside `#analytics-projects`; put supporting static previews in `assets/data-analytics/`. Keep preview pages self-contained and test them at phone and desktop sizes before publishing. Do not link raw files as download buttons if the intent is to invite visitors to preview the work; public files can still be retrieved from their URLs.

The World Cup project dashboard is a self-contained interactive preview at `assets/data-analytics/world-cup-2026/dashboard-preview.html`; its project notes are at `assets/data-analytics/world-cup-2026/analysis-report-preview.html`. The source files remain grouped under the same folder.

## Project structure

```text
.
├── index.html
├── terms.html
├── robots.txt
├── sitemap.xml
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
        ├── main.js
        └── vendor/
            ├── LICENSE.pdfjs
            ├── pdf.min.mjs
            └── pdf.worker.min.mjs
```
