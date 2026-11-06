# Changelog

All notable changes to the **Dauntless Gear Builder** will be documented in this file.

The project adheres to [Semantic Versioning](https://semver.org/) with pre-release tags indicating active beta testing (`v0.x.x-beta`).

---

## [0.9.6-beta] - 2026-11-07 *(Public Testing)*

### Added
- **Ostian Modular Repeaters (Patch 1.4.4 Classic & Patch 1.6.2 Early Reforged)**:
  - Full modular customization for the base "Repeater" frame across 5 interchangeable component slots: **Barrel**, **Chamber**, **Grip**, **Prism**, and **Mod**.
  - **Barrels (12 options)**: Determine element (Neutral, Blaze, Frost, Shock, Terra, Radiant, Umbral) and scale power up to 550 (Classic) or 120 (Power Surged). Includes Legendary Barrels (*Volcanic*, *Dynamic*, *Animus*, *Eldritch*).
  - **Prisms (10 options)**: Imbue repeaters with inherent passive effects (*Searing*, *Eclipse*, *Stoneheart*, *Snowdrift*, *Brilliant*, *Glacial*, *Ferocious*, *Firestorm*, *Frostbite*, *Primal*).
  - **Chambers & Grips**: Full active shot selection (*Full-Bore*, *Salvo*, *Marksman*) and utility abilities (*Captain's Grip*, *Saboteur's Grip*).
  - **Weapon Modifications (8 options)**: *Lucky Magazine*, *Tactician's Magazine*, *Lightweight Frame*, *Extraction Catalyst*, etc.
- **Repeater Attachments (Patch 1.12.0 & 1.14.7 Reforged Final)**:
  - Reflects the post-1.7.3 Behemoth-crafted repeater era with customizable **Chamber**, **Grip**, and **Mod** attachments on every crafted weapon.
- **Loadout Fingerprinting & Deduplication**:
  - Modular repeater components are included in URL hash serialization (`encodeBuildToHash` / `decodeBuildFromHash`) and the canonical build deduplication fingerprint.

---

## [0.9.5-beta] - 2026-11-05 *(Public Testing)*

### Added
- **Canonical Loadout Deduplication**: Implemented order-independent fingerprinting (`getLoadoutFingerprint`). Prevents duplicate loadouts from cluttering the database.
- **Automatic Original Upvoting**: Submitting an existing loadout automatically casts an upvote for the original author's build, links it to the user's saved library, and displays an informative notification banner.
- **Rate Limiting**: Added client-side sliding-window rate limiting (max 5 submissions per 5 minutes per device) to protect the free-tier Supabase database.
- **Progressive Web App (PWA)**: Full W3C Web App Manifest (`manifest.webmanifest`) and offline service worker with Workbox caching.
- **PWA App Icons**: Generated 192x192, 512x512, maskable squircle (`maskable-icon-512x512.png`), and 180x180 iOS Apple Touch Icon.
- **Offline Data Caching**: `NetworkFirst` caching for all `/data/` patch files and `StaleWhileRevalidate` caching for all perk and equipment icons.
- **Dev Mode Service Worker**: Configured `devOptions.enabled` for local PWA testing.

### Fixed
- **Gear Asset Resolution**: Corrected icon file path mismatches in 1.4.4, 1.6.2, and 1.12.0 (`GenericLantern.png` → `RecruitsLantern.png`, `Repeater.png` → `RecruitsRepeaters.png`, and `ScreamsOfTheShrike.png` → `ScreamOfTheShrike.png`). All 5 patches now have 0 missing icons.
- **Patch Transition Sanitization**: Automatically sanitized `bondedWeapon` when switching between patches to prevent orphaned or incompatible bond data.

---

## [0.9.0-beta] - 2026-11-02

### Added
- **Patch 1.4.4 (Classic / Pre-Reforged)**: Full pre-Reforged legacy era support featuring +0 to +15 gear progression, mastery milestones, and no Omnicells.
- **Dynamic Level Scaling**: Equipment power scales from 100 to 550, armor resistance scales from 25 to 137.5 per piece (100–550 total), and innate perks scale dynamically across classic tiers (+1 at 0–5, +2 at 6–9, +3 at 10–15).
- **Classic Cell Sockets**: Implemented self-contained vector SVGs for original cell socket categories (*Power, Technique, Defence, Mobility, Utility*).

### Fixed
- **Neutral Equipment Filtering**: Neutral armor sets with null elemental strength/weakness properly match the 'Neutral' filter.
- **Repeaters Filtering**: Resolved an issue where Repeaters were excluded during type and element searches due to singular/plural string matching.
- **Level Clamping**: Ensured 1.4.4 gear levels clamp between 0–15 rather than inheriting Awakening's 1–20 bounds, and cleaned up the stepper label UI.

---

## [0.8.0-beta] - 2026-10-31

### Added
- **Legendary Weapon Bonding**: Integrated prismatic bonding for legendary weapons across all patches except 2.1.1 (Awakening). Bonded weapon innate perks and unique effects reflect in build statistics.

### Fixed
- **Template Placeholder Interpolation**: Resolved raw placeholder strings (e.g. `+{{percentPartDamage}}%`) by enhancing `scripts/compile-data.js` to recursively interpolate effect descriptions, array values, and tier-level mappings.
- **Patch 1.6.2 Power Surge**: Corrected perk value toggling when switching Power Surge on/off in Patch 1.6.2.
- **Cell Picker Flickering**: Prevented infinite image error retry loops when loading classic cell icons in 1.6.2.

---

## [0.7.0-beta] - 2026-10-30

### Added
- **Community Builds Browsing Categories**: Added **Top 20** (most upvoted), **New 20** (latest submissions), **All Builds** (all submissions matching active filters), and **My Builds** (device-owned builds).
- **Patch Version Lock for Builds**: Quick-toggle button to filter community builds by the active patch or view all eras.
- **Light Mode Palette Overhaul**: Completely reworked light mode using Material Design 3 guidelines with high-contrast surfaces, readable text, and subdued borders.
- **Creator Support Links**: Added Buy Me a Coffee, YouTube, X, and GitHub repository links in the header and mobile drawer.

### Fixed
- **Awakening Lantern Cores**: Separated Lantern Core descriptions from active ability tooltips to prevent duplicate text rendering.
- **Build Reset**: Ensured the reset button clears all equipped items, cells, and bonded weapons across all slots.

---

## [0.6.0-beta] - 2026-10-29

### Added
- **Multi-Patch Architecture**: Added engine support for Reforged Mid (1.12.0), Reforged Final (1.14.7), and Awakening (2.1.1).
- **Awakening Dual Weapons & Talents**: Support for primary and secondary weapon equipping with interactive 5-tier talent trees.
- **Dauntless Forever Commands**: Command generator modal for self-hosted community game servers.
- **First-Time Slayer Onboarding Tour**: Welcome modal introducing the patch switcher and equipment forge.
- **Hash-Based Sharing**: URL fragment encoding and decoding for sharing builds via compact links.
- **Responsive Layout**: Dual-column desktop view with persistent live statistics sidebar and mobile slide-out drawer.
