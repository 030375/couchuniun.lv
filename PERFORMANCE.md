# Website performance — coachunion.lv (November 2026)

## Deployment

The public pages use **Tailwind CSS v3 compiled at build time**, not the browser-time Tailwind CDN.

From the repository root:

```sh
npm install
npm run build
```

Netlify reads `netlify.toml`, runs the same command and serves `dist/`.
Build files:
- `tailwind.min.css` — minified utilities from the HTML and `app.js`.
- `img/web_img/icu-logo-transparent.webp` — locally optimized transparent ICU logo.
- `img/web_img/icu-trophy.webp` — locally optimized award image.

Neither artifact is committed: both are generated deterministically from committed source files.

## Main optimizations

- No render-time `cdn.tailwindcss.com` script on public pages other than unchanged `neurocoach.html`.
- The hero logo is preloaded and has high fetch priority, explicit dimensions, and no lazy-loading.
- Below-the-fold images use `loading="lazy"`; visible videos use poster buttons until clicked.
- Mobile hero background uses the same image at a smaller requested resolution.
- Public assets are cached by Netlify headers; the publishing directory excludes build dependencies and image backups.
- The original certificate gallery and the content of `neurocoach.html` are preserved.

## How to measure

1. Open `https://deploy-preview-1--meek-gecko-6664db.netlify.app/`.
2. Test it in `https://pagespeed.web.dev/` **Mobile**, then **Desktop**.
3. Repeat each test three times; compare typical scores and report LCP, CLS and TBT.
4. Test main-menu links at 320, 390 and 768px, click all five video posters, open certificate lightbox and submit a test enquiry.
5. After approval and deployment, repeat on `https://coachunion.lv/`.

**No PSI score was available in the development environment when these changes were made.** Do not interpret a successful build as proof of a particular Lighthouse score.

## Maintenance

When editing the HTML, the Tailwind compiler extracts used classes automatically. If a Tailwind class is constructed dynamically in JavaScript, add the literal class to `tailwind.config.cjs` safelist.

Do not directly edit generated files inside `dist/`. Edit source assets, then rebuild.
