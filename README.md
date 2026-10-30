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

GitHub Pages only serves static files, so it cannot process server-side contact forms. The contact links open the visitor’s email app or WhatsApp directly; the contact composer validates the visitor’s name, email, topic, and message, then prepares a clearly formatted email in their mail app. It does not send or store the message. Connecting a hosted form provider such as Formspree or Web3Forms requires a public form endpoint and sends visitor-submitted details to that provider.

The freelance timeline starts in 2019 to match the CV. The two CV download links are intentional: one is in the introduction and one is in the contact section.

## Manage portfolio content

The site includes a GitHub-backed Sveltia CMS dashboard at `https://odoekejulius.github.io/admin/`. It does not need a PHP server, database, or secret stored in the website. The dashboard accepts GitHub access-token sign-in only. Do not use the GitHub OAuth sign-in button: GitHub Pages does not provide the separate OAuth service that button requires. Click **Sign In Using Access Token** and enter a GitHub fine-grained personal access token that has access only to the `odoekejulius/odoekejulius.github.io` repository and **Contents: Read and write** permission. The token stays in your browser's local storage; never paste it into a website file or commit it. Sign out on shared devices.

Use the dashboard to update the homepage portrait under **Site settings → Profile**, or add website projects, data analytics projects, and YouTube videos (or small uploaded videos). For the portrait, upload or choose an image and update its description for screen readers. For an analytics project, enter its title and upload one ZIP package of public-safe project files. The project card stays compact; opening it shows a file list with in-page previews for HTML dashboards, CSV tables, Excel worksheets, PDF reports, Word/PowerPoint report text, images, and source/code files. Upload size is limited to 15 MB, with limits on extracted and individual file sizes in the browser preview. This makes analysis materials viewable in the site without asking you to upload screenshots and write project details one file at a time; it does not generate analysis from raw data. **The ZIP itself is public and can be accessed directly**, even though the portfolio does not show a download link. Include only material you intend to publish. Do not include private person-level records, identity, employment, student/client records, credentials, or confidential data. Aggregate CSVs, sanitized public datasets, and source code can be included if they contain no private information. The CMS commits content and uploads to this repository; GitHub Pages publishes them after deployment finishes.

All uploaded files and documents are public and can be copied by visitors, even when the page does not display a download link. Keep raw student-level datasets, identity, employment, client, and other private records outside the public repository. Upload only reviewed, privacy-safe previews and images. Keep video uploads small; use a YouTube link for larger videos. CMS uploads are stored under `assets/uploads/`, and content records are in `content/`. New changes are committed directly to the `main` branch and go live after deployment.

The layout and appearance are in `assets/css/style.css`; navigation, animations, content rendering, and PDF rendering are in `assets/js/main.js`. The self-hosted Mozilla PDF.js 4.10.38 renderer and its Apache 2.0 license are in `assets/js/vendor/`.

## CV and public documents

The CV and Google Data Analytics certificate PDFs and the Web Development and NYSC certificate scans are grouped under `assets/documents/`. The `#documents` section renders PDF pages in responsive canvases on desktop and mobile; the CV preview has its own scroll area so visitors can read all pages without scrolling the whole site. PDF.js loading and page rendering have timeouts; if a browser cannot finish rendering, the native PDF viewer opens inside the same scroll area without an extra error message. The direct PDF link remains available below. The three certificates are grouped in a collapsible library that closes again after it scrolls out of view. Certificate images open at full size when tapped.

GitHub Pages serves files publicly. Hiding the PDF viewer toolbar does **not** prevent a visitor from opening, saving, or copying a public file. Review personal information before publishing documents. Private documents or guaranteed download protection require access-controlled server-side hosting; static GitHub Pages cannot provide that.

## Add images and other file types

Portfolio media is uploaded through the admin dashboard and stored in `assets/uploads/`. The CMS can add screenshots to website project cards, ZIP packages of public-safe analysis materials to analytics projects, and YouTube links or small video files to the Videos & Media section. Visitors can access every published file, even when the page does not provide a download link. For large videos, embed YouTube rather than uploading the video to the GitHub repository. The built-in CV and certificate previews are unchanged.

The World Cup project lists its report, workbook, and all six CSV files in the expandable **Project files and data** section. To add another Office file, copy one of its entries in `index.html`, update the filename, title, file link, and iframe title, and keep the `data-office-preview` and `data-office-frame` attributes. The site script builds the Microsoft preview URL from the associated file link. Add a PowerPoint file the same way when one is available. Remember that every deployed asset is public and may be copied by visitors.

## Add portfolio work

Add new website and analytics entries from the admin dashboard instead of editing the page markup. Analytics ZIP packages can include reviewed aggregate CSV/Excel outputs, reports, visual assets, self-contained dashboards, and source code. Never publish personal or confidential records. The World Cup and Student Dropout Risk dashboards and project notes live under their respective folders in `assets/data-analytics/`. Their private source datasets stay outside the public web root.

## Project structure

```text
.
├── index.html
├── terms.html
├── robots.txt
├── sitemap.xml
├── README.md
├── 404.html
├── .nojekyll
├── admin/
│   ├── index.html
│   └── config.yml
├── content/
│   ├── website-projects.json
│   ├── analytics-projects.json
│   └── media.json
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
    │   ├── og-cover.png
    │   └── renacido/
    │       ├── renacido-admin-dashboard.png
    │       ├── renacido-admin-sign-in.png
    │       ├── renacido-customer-sign-in.png
    │       ├── renacido-storefront-footer.png
    │       └── renacido-storefront-home.png
    ├── uploads/              # Media uploaded through the CMS
    └── js/
        ├── main.js
        └── vendor/
            ├── LICENSE.jszip
            ├── LICENSE.pdfjs
            ├── jszip.min.js
            ├── pdf.min.mjs
            └── pdf.worker.min.mjs
```

## Recent design updates

Ambient aurora and dot-grid background, a highlights band with count-up numbers, a Download CV button, Renacido highlights, in-development cards for C.Zara Enterprise and Nethub, larger small text, left-aligned reading blocks, compressed images, a 1200x630 social preview (`assets/images/og-cover.png`), `404.html`, and `.nojekyll`. The site includes a light/dark toggle whose preference is remembered in the browser, an email composer with validation and topic selection, and embedded analytics dashboards. The CMS project package preview uses the vendored JSZip 3.10.1 library under its included MIT license. Bump asset cache versions when referenced files change. Shared color values live in the stylesheet’s root custom properties so future visual changes can use the palette instead of repeating literals throughout component rules.
