# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server at http://localhost:3000.
- `npm run build` — production build.
- `npm start` — serve the production build.
- `npm run lint` — run `next lint` (ESLint via `next/core-web-vitals`).
- `npm run analyze` — build with the bundle analyzer (`ANALYZE=true`).

There is no test runner configured in this repo.

The email-to-PDF feature needs `NODEMAILER_EMAIL` and `NODEMAILER_PW` in `.env.local`.

## Formatting conventions

`.editorconfig` mandates 4-space indentation, LF line endings, and a final newline.
Some newer files use 2-space indentation (e.g. `lib/variables.ts`, `contexts/Providers.tsx`) — match the style of the file you are editing rather than reformatting.

## Architecture

Single-page invoice generator built on Next.js 15 App Router, TypeScript, React Hook Form + Zod, Tailwind, and shadcn/ui. There is no database — invoices live in the browser (`localStorage`) and are turned into PDFs server-side via Puppeteer.

### Single source of truth: the form

The entire app is one big React Hook Form instance. `contexts/Providers.tsx` creates the form with `useForm({ resolver: zodResolver(InvoiceSchema), defaultValues: FORM_DEFAULT_VALUES })` and wraps everything in `FormProvider`. Every component reads and writes invoice state through `useFormContext<InvoiceType>()` — there is no separate state store for invoice data.

`InvoiceSchema` in `lib/schemas.ts` is the authoritative shape. `types.ts` derives all form types from it via `z.infer` (`InvoiceType`, `ItemType`, `FormType`, `NameType`). When changing invoice fields, edit the Zod schema first; the types and validation follow from it.

Provider nesting (outer → inner): `ThemeProvider` → `TranslationProvider` → `FormProvider` → `InvoiceContextProvider` → `ChargesContextProvider`.

### Draft persistence

`Providers.tsx` hydrates the form once on mount from `localStorage` key `invoify:invoiceDraft` (reviving `invoiceDate`/`dueDate` back into `Date` objects). `InvoiceContext` subscribes to `form.watch` and writes the full form state back to that key on every change. Separately, explicitly "saved" invoices are stored as a list under the `savedInvoices` key.

### InvoiceContext — the action layer

`contexts/InvoiceContext.tsx` holds all invoice actions and the generated-PDF blob state: `generatePdf`, `downloadPdf`, `printPdf`, `previewPdfInTab`, `saveInvoice`, `deleteInvoice`, `sendPdfToMail`, `exportInvoiceAs`, `importInvoice`, `newInvoice`. UI components call these; they in turn POST the form values to the API routes.

### Client → API → service pattern

API routes under `app/api/invoice/*/route.ts` are thin: each just delegates to a service in `services/invoice/server/`. The real work lives in the services.

- `generate` → `generatePdfService.ts` — renders the chosen React template to static HTML with `ReactDOMServer`, launches Puppeteer, injects the Tailwind CDN stylesheet, and returns a PDF blob. In production it uses `puppeteer-core` + `@sparticuz/chromium`; in dev it uses full `puppeteer`. These packages are marked `serverExternalPackages` in `next.config.js`. The `generate` route sets `runtime = "nodejs"` and `maxDuration = 60`.
- `export` → `exportInvoiceService.ts` — serializes the invoice to JSON / CSV / XML / XLSX (see `ExportTypes` in `types.ts`).
- `send` → `sendPdfToEmailService.ts` — emails the PDF via Nodemailer.

### PDF templates

Invoice templates are `InvoiceTemplate1.tsx`, `InvoiceTemplate2.tsx`, etc. in `app/components/templates/invoice-pdf/`. Selection is by number: `details.pdfTemplate` (an integer). `DynamicInvoiceTemplate.tsx` (live preview, client) and `getInvoiceTemplate()` in `lib/helpers.ts` (PDF generation, server) both resolve the component by interpolating the id into the name `InvoiceTemplate${id}`. To add a template, create `InvoiceTemplate{N}.tsx` and wire it into `getInvoiceTemplate` — the naming convention is load-bearing.

### i18n

Uses `next-intl` with locale-prefixed routing. Routes live under `app/[locale]/`, `middleware.ts` handles locale detection (matcher excludes `/api`, `_next`, and files with a dot). The locale list is `LOCALES` in `lib/variables.ts` and must stay in sync with the JSON message files in `i18n/locales/`. `i18n/routing.ts` derives the routing config from `LOCALES`, so adding a language means adding to `LOCALES` and adding the matching `i18n/locales/<code>.json`.

### Key files

- `lib/variables.ts` — central constants: API endpoint paths, `LOCALES`, `FORM_DEFAULT_VALUES`, `FORM_FILL_VALUES` (dev autofill), signature colors/fonts, localStorage keys, the Tailwind CDN URL used by the PDF renderer.
- `lib/helpers.ts` — number/price formatting, `formatPriceToString` (number-to-words), `flattenObject` (used for XLSX export), `getInvoiceTemplate`.
- `lib/schemas.ts` — Zod schemas; edit here to change invoice fields.
- The `@/*` path alias maps to the repo root (`tsconfig.json`).
