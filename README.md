# MWW

Website for a small-batch maker selling heirloom toys and custom decor.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com)
- Fonts: Cormorant Garamond (display) + Montserrat (body) via `next/font/google`

## Getting started

```
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  layout.tsx       # Root layout — fonts, metadata
  page.tsx         # Home page
  globals.css      # Brand tokens, global styles, custom utilities

components/
  Hero.tsx         # Landing hero section

public/            # Static assets (images, icons)
```

## Deployment

Push to `main` — GitHub Actions builds the site and deploys to `gh-pages` automatically.
Live at [mulveyswoodworking.com](https://mulveyswoodworking.com).
