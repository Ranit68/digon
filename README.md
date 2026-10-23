# VITALIS DIAGNOSTICS

A responsive React + TypeScript demonstration website for an independent diagnostic centre in India. All catalogue entries, prices, packages, images, and service copy are sample content. No laboratory, location, phone number, accreditation, appointment backend, or secure report service is represented as real or verified.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Create a production build with `npm run build`; preview it with `npm run preview`. `npm run lint` runs Oxlint.

## Configure before launch

1. Replace the sample tests, descriptions, prices, preparation details, reporting times, package inclusions and FAQs in `src/data/catalog.ts`. Remove any offering the centre does not provide.
2. Fill in the `contact` object in `src/data/catalog.ts` with verified official contact details. WhatsApp must be an international-format number containing digits only (for example, `919876543210`). Do not use a placeholder or a personal number without permission.
3. Add verified centres to `centres` in `src/data/catalog.ts`. Directions links are only shown for entries explicitly marked `verified: true`.
4. Replace the demo stock-photo URLs in `images` with appropriately licensed, accurate photographs. The photos are lazy-loaded except for the hero.
5. Add a real canonical domain and update `public/robots.txt`, `public/sitemap.xml`, and the Open Graph metadata in `index.html`. The current `.invalid` URL is reserved and must not be deployed as a production domain.
6. Review the privacy notice and applicable Indian data-protection and healthcare requirements with qualified counsel before collecting patient information.

## Deploy

Run `npm run build` and publish the generated `dist/` directory to a static host. Configure the host to serve `index.html` for application routes such as `/tests/thyroid-profile`, and serve the files in `public/` at the site root. Set `VITE_SITE_URL` to the verified HTTPS origin at build time so route-specific canonical URLs use the production domain. If enabling the inquiry API, set `VITE_APPOINTMENT_API_URL` to its HTTPS endpoint before the build.

## Inquiry and appointment integration

The form is client-validated with React Hook Form and Zod. It rejects malformed Indian phone numbers, past dates and invalid PIN codes for home collection, and keeps values available if an API request fails.

- With no integration configured, submission only displays an explicit demo preview; it does not send or store patient data.
- Set `VITE_APPOINTMENT_API_URL` to a trusted HTTPS API endpoint to enable API submission. The API must validate inputs server-side, use rate limiting and spam protection, protect personal data, and return JSON containing `"confirmed": true` only after the inquiry has actually been accepted. The website then reports inquiry receipt, not a confirmed appointment.
- If the appointment API is not configured and a verified WhatsApp number is set in `contact.whatsappNumber`, the form opens a prefilled inquiry containing scheduling details only. The patient must press Send in WhatsApp. No sensitive medical information or test results are included.

Never expose API secrets in Vite environment variables; client-side `VITE_*` values are public. An API endpoint is not a substitute for server-side security.

## Report access

Report access intentionally remains an informational page. Do not add public lookups based on names, phone numbers or guessable report IDs. Connect a secure backend with patient authentication, authorization, expiring access, private downloads and access logging before enabling reports.

## Demo safeguards

- A request form is not an appointment booking; the centre must confirm availability and collection slots.
- Home collection, sample requirements, preparation instructions, reporting times and centre details remain unverified.
- Prices are illustrative examples.
- Medical information is educational only; it does not diagnose, recommend treatment or interpret individual results.
- Corporate services and accreditations are not claimed.

## Project structure

- `src/App.tsx` — responsive pages, catalogue filters, inquiry form, navigation and report-access placeholder
- `src/data/catalog.ts` — editable sample catalogue, packages, centres, contact details, FAQs and image URLs
- `src/services/appointment.ts` — optional API integration boundary and explicit confirmation check
- `src/App.css`, `src/index.css` — responsive visual system, reduced-motion and focus styles
- `public/` — favicon and SEO crawler files

Images are hosted by Unsplash and require network access. Replace them with locally hosted, appropriately licensed images for production.

# digon
