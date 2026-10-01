# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Two groups, about equal: people who met the maker at a Northern NJ farmers market and want a custom piece or a repeat, and gift shoppers who find her online (Instagram, word of mouth, search) and have never seen the work in person.

## Product Purpose
Portfolio and request intake for Mulvey's Woodworking, a one-person, small-batch woodworking shop run by Tyler's mom out of her basement workshop. Visitors browse past work by category, see several photos, a short description and a starting price for each piece, and send a build request with a needed-by date. Success: a clear, complete request lands in hi@mulveyswoodworking.com.

## Positioning
Everything is built to order by one person. Nothing is bought on the site; a request becomes an order only after she emails back and both sides agree on details, price and timing.

## Operating Context
- Sells in person at farmers markets across Northern NJ on weekends.
- Requests arrive by email (Web3Forms, fallback mailto) to hi@mulveyswoodworking.com.
- Static Next.js export deployed to GitHub Pages at mulveyswoodworking.com.
- Catalog edited by hand in lib/catalog.ts.

## Capabilities and Constraints
- No checkout, no payment, no cart. Request form only; must say plainly it is a request, not an order.
- Required: name, email, piece, date needed by.
- Starting prices in the catalog are placeholders until she confirms them.
- Must not show licensed characters or third-party logos as items for sale.

## Brand Commitments
- Name: Mulvey's Woodworking (banner: Mulvey's Woodworking Creations). Tagline: "Heirloom Toys for Modern Times."
- Voice: first person, the maker speaking ("I"). Warm, plain, a little playful.
- Mascot: a tabby cat in ear defenders at a workbench, pen-and-ink with soft color. The animated cat-working.gif must stay on the site (the maker loves it).
- Logo: round badge with the cat, "Handmade in Small Batches", "Crafted by Hand". Keep.
- Instagram: @mulveys_woodworkingcreations. Keep the link.

## Evidence on Hand
- ~150 real photos of her work (public/photos, mapped in lib/photos.json).
- Old-site assets on gh-pages: images/cat-working.gif, images/logo.png, images/cat-mascot.png.
- No testimonials, reviews, customer counts, or confirmed prices. Do not invent them.

## Product Principles
- The work is the proof. Photos lead; copy stays short.
- A person, not a store. Every surface should feel like one maker talking to you.
- Requests over transactions. Make asking easy and set honest expectations.
