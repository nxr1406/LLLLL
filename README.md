# ॐ Sanatan Edition — Landing Page

**Create • Edit • Inspire**

A single-page landing site for Sanatan Edition, a creative Hindu editing community. Built as a static HTML/Tailwind frontend, designed to be paired with a C# backend.

---

## 📁 Project Structure

```
sanatan-edition/
├── index.html         # Main landing page — all markup, styling & JS in one file
├── assets/            # Add your images here (not included)
│   ├── owner.jpg
│   ├── anu.jpg
│   ├── tanni.jpg
│   └── editor03.jpg
├── README.md
└── LICENSE.txt
```

## 🧱 Tech Stack

| Layer              | Technology |
|---------------------|-----------|
| Markup              | HTML5 |
| Styling             | Tailwind CSS (CDN / JIT — no build step) |
| Fonts               | Google Fonts — Playfair Display & Poppins |
| Scripting           | Vanilla JavaScript (mobile menu, scroll-reveal) |
| Video embeds        | TikTok `embed.js` |
| Backend (planned)   | C# / ASP.NET Core |

No npm, no bundler, no build step — `index.html` runs as-is in any browser.

## 🔌 Backend Integration Notes (C#)

The frontend is currently 100% static — it runs with no backend at all. When you wire up the ASP.NET Core / C# side, these are the natural integration points:

- **Static hosting** — serve `index.html` and `assets/` from `wwwroot/` in an ASP.NET Core project.
- **Contact / Join form** — the "Join On Messenger" buttons currently link straight to a Messenger URL. If you want an on-site form instead, add a controller/API endpoint (e.g. `POST /api/contact`) and swap the relevant `<a>` for a `<form>`.
- **Dynamic team & portfolio data** — team members (`#about` section) and Featured Edits (`#portfolio` section) are hardcoded in HTML right now. To make these editable from an admin panel later, expose them via a small API (e.g. `GET /api/team`, `GET /api/edits`) and render with `fetch()` instead of static markup.
- **Membership / roles** — if gated content is added later, ASP.NET Core Identity fits naturally alongside the existing Messenger-based community flow.

None of this is required to launch — the page works fully static today.

## 🚀 Running Locally

Just open `index.html` in a browser. For local dev with live reload, any static server works, e.g.:

```bash
npx serve .
```

## 🎨 Customization

- **Colors** — edit the `tailwind.config` block near the top of `index.html` (`gold`, `ink`, `cream`, `sindoor` tokens).
- **Fonts** — swap the Google Fonts `<link>` and the `fontFamily` block in the same config.
- **Copy/content** — all text lives directly in `index.html`, organized by section comments (`<!-- ================= HERO ================= -->` etc).

## ✅ Before Selling / Going Live

- [ ] Add real team photos to `assets/` (`owner.jpg`, `anu.jpg`, `tanni.jpg`, `editor03.jpg`)
- [ ] Replace the placeholder `data-video-id` on each Featured Edits card with the real TikTok video ID
- [ ] Decide whether Tutorials / Gallery get dedicated sections (nav currently points both to Portfolio)
- [ ] Fill in the bracketed fields in `LICENSE.txt`

## 🌐 Browser Support

Latest Chrome, Edge, Firefox, Safari (desktop & mobile). No IE11 support.

## 📄 License

Commercial — see [`LICENSE.txt`](./LICENSE.txt). All rights reserved unless a license has been purchased.

## 🙏 Credits

- Design & development: [Your Name / Studio]
- Community: Sanatan Edition
- Fonts: Playfair Display & Poppins (Google Fonts, SIL Open Font License)
- Framework: Tailwind CSS (MIT License)
