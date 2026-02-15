# Active Context: Next.js Landing Page - АвтоВыкуп40

## Current State

**Project Status**: ✅ Landing page complete with full functionality

A selling landing page for car, motorcycle and special equipment buyout services in Kaluga, Tula, Obninsk and surrounding areas up to 200km.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Landing page with all required sections
- [x] SEO optimization (metadata, keywords for Kaluga region)
- [x] Modern animations using Framer Motion
- [x] Contact form with validation
- [x] Black-red gradient color scheme
- [x] Lucide icons installed and integrated
- [x] **Form sends to Telegram @krisdev13** - Form now opens Telegram with pre-filled message
- [x] **Logo updated to АвтоВыкуп40** - Added "40" to logo
- [x] **Added photos to services** - Cars, motorcycles, special equipment images
- [x] **Added avatars to reviews** - Client photos in reviews section
- [x] **Added cities display** - Shows Kaluga, Tula, Obninsk, +200km
- [x] **Updated Telegram contact** - Now links to @krisdev13
- [x] **Added calculator section** - Multi-parameter car price calculator with photo upload
- [x] **AI damage assessment** - Calculator now includes AI-powered damage detection simulation
- [x] **Rossko API integration** - Calculator fetches real auto parts prices from Rossko (Kaluga)
- [x] **Fixed damage selection** - User now manually selects damaged parts via checkboxes instead of random AI generation
- [x] **Rewrote Python parts-pricing to TypeScript** - Created full TypeScript implementation integrated into Next.js
- [x] **Integrated ABCP API** - Real parts pricing from ABCP (abcp84097.public.api.abcp.ru)
- [x] **Fixed repair cost calculation** - Now varies by car brand using brand multipliers
- [x] **Added fallback estimated prices** - When APIs unavailable, shows estimated prices with brand multipliers
- [x] **Created comprehensive test suite** - 56 tests covering all calculator functions (Jest)
- [x] **Verified calculator button** - Button works correctly with proper validation
- [x] **Added real AI image analysis** - TensorFlow.js COCO-SSD model for detecting vehicles in uploaded photos
- [x] **AI auto-detects damages** - AI analyzes uploaded images and automatically identifies damaged car parts
- [x] **Rewrote AI damage detector with proper computer vision** - Now uses COCO-SSD to detect car first, determines viewing angle (front/side/rear), analyzes only visible car parts
- [x] **Fixed incorrect damage detection** - AI no longer detects damage in parts not visible in photo (e.g. rear glass when showing front view)
- [x] **Updated AI damage detector tests** - 55 tests covering new computer vision architecture, all passing

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Landing page with all sections | ✅ Complete |
| `src/app/layout.tsx` | Root layout with SEO metadata | ✅ Complete |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `src/app/api/parts/price/route.ts` | API for part prices | ✅ Complete |
| `src/app/api/parts/repair/route.ts` | API for repair estimates | ✅ Complete |
| `src/lib/parts-pricing/types.ts` | TypeScript types | ✅ Complete |
| `src/lib/parts-pricing/aggregator.ts` | Price aggregation service | ✅ Complete |
| `src/lib/ai-damage-detector.ts` | TensorFlow.js AI damage detection | ✅ New |
| `__tests__/calculator.test.ts` | Calculator unit tests | ✅ Complete |
| `__tests__/calculator-button.test.ts` | Button functionality tests | ✅ Complete |
| `docs/calculator-testing.md` | Testing documentation | ✅ Complete |
| `docs/calculator-check-report.md` | Check report | ✅ Complete |
| `jest.config.js` | Jest configuration | ✅ Complete |
| `next.config.ts` | Image domains config | ✅ Updated |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Landing Page Sections

1. **Hero Section** - Main offer with "Выкупаем авто за 15 минут"
2. **Services** - Auto, motorcycle, special equipment buyout
3. **Calculator** - Multi-parameter price calculator with photo upload
4. **Advantages** - Fast evaluation, honest prices, free evacuation, 24/7
5. **Reviews** - 4 client testimonials
6. **Contact Form** - Lead capture with validation
7. **Contacts** - Telegram, WhatsApp, Phone links

## SEO Keywords Used

- Выкуп авто Калуга
- Выкуп автомобилей Тула
- Автовыкуп Обнинск
- Срочный выкуп авто
- Выкуп битых авто
- Выкуп мотоциклов
- Выкуп спецтехники

## Technology Stack

- Next.js 16
- React 19
- TypeScript 5.9
- Tailwind CSS 4
- Framer Motion (animations)
- Lucide React (icons)
- Bun (package manager)

## Design

- Black-red gradient color scheme
- Glassmorphism effects
- Grid pattern overlay
- Neon glow effects (red)
- Custom scrollbar with gradient

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2024-02-13 | Created АвтоВыкуп landing page with SEO, animations, all sections |
| 2026-02-13 | Updated to black-red gradient, replaced icons with Lucide |
| 2026-02-13 | Added car price calculator with photo upload |
| 2026-02-14 | Integrated Rossko API for real auto parts pricing |
| 2026-02-14 | Fixed damage selection - user selects damaged parts manually via checkboxes |
| 2026-02-15 | Fixed repair cost - now varies by car brand (added brand multipliers to price aggregator) |
| 2026-02-15 | Added fallback estimated prices when APIs unavailable |
| 2026-02-15 | Created comprehensive test suite - 56 tests, all passing |
| 2026-02-15 | Rewrote AI damage detector with proper computer vision using COCO-SSD |
