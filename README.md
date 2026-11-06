# Dauntless Gear Builder

[![Version](https://img.shields.io/badge/version-v0.9.6--beta-cyan.svg)](CHANGELOG.md)
[![Status](https://img.shields.io/badge/status-public--testing-amber.svg)](CHANGELOG.md)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-installable_%26_offline-emerald.svg)](public/manifest.webmanifest)

A modern, responsive, and version-aware loadout workshop for **Dauntless**, spanning 5 distinct game eras from pre-Reforged classic to Awakening.

> [!NOTE]
> **Project Status: Public Beta Testing (`v0.9.6-beta`)**
> 
> *Dauntless Gear Builder* is currently in active public beta testing. Equipment datasets, perk curves, and community sharing systems are continuously calibrated and verified against historical archives and live server data. See [CHANGELOG.md](CHANGELOG.md) for full development history.

---

## 🌟 Key Features

### 1. ⏱️ 5 Historical & Modern Patch Eras
Switch seamlessly between 5 game eras from the persistent top navigation:
- **Patch 1.4.4 (Classic / Pre-Reforged - Nov 2020)**:
  Legacy +0 to +15 gear upgrades (100–550 weapon power, 25–137.5 resistance per piece). Original cell categories (*Power, Technique, Defence, Mobility, Utility*), mastery milestones, legendary weapon bonding, fully modular Ostian Repeaters, and no Omnicells.
- **Patch 1.6.2 (Early Reforged - May 2021)**:
  Early Reforged era with original cell socket types, Aetherheart Power Surging, legendary weapon bonding, fully modular Ostian Repeaters, and no Omnicells.
- **Patch 1.12.0 (Reforged Mid-Era - Nov 2022)**:
  Mid-Reforged overhaul introducing modern cell categories (*Brutality, Finesse, Fortitude, Alacrity, Insight*), all 6 Omnicells, legendary weapon bonding, and Behemoth repeaters with customizable Chamber/Grip/Mod attachments.
- **Patch 1.14.7 (Reforged Final - Nov 2023)**:
  Peak Reforged meta with full Behemoth rosters (Frostwülf, Phaelanx, Fenroar, Alyra, Chronovore), expanded cell perks, complete Escalation gear, and customizable repeater attachments.
- **Patch 2.1.1 (Awakening - Feb 2025)**:
  Awakening meta overhaul featuring Dual Weapons (Primary + Secondary), interactive 5-tier Weapon Talent trees, Lantern Cores with distinct passives and abilities, and individual gear levels 1–20.

### 2. 🔫 Era-Accurate Ostian Repeaters Modularity
- **Pre-1.7.3 Modular Era (Patches 1.4.4 & 1.6.2)**:
  - Customizes a universal Ostian Repeaters frame across **5 modular slots**: **Barrel**, **Chamber**, **Grip**, **Prism**, and **Mod**.
  - **12 Barrels**: Sets elemental damage (Neutral, Blaze, Frost, Shock, Terra, Radiant, Umbral) and base/surged power. Includes Legendary Barrels (*Volcanic*, *Dynamic*, *Animus*, *Eldritch*).
  - **10 Prisms**: Grants inherent Behemoth unique effects and perks (*Searing*, *Eclipse*, *Stoneheart*, *Snowdrift*, *Brilliant*, etc.).
  - **Chambers, Grips & Mods**: Fine-tune special shots, utility deployables, and magazine modifications.
- **Post-1.7.3 Reforged Era (Patches 1.12.0 & 1.14.7)**:
  - Each Behemoth features its own crafted repeater pair with inherent element and perks, accompanied by customizable **Chamber**, **Grip**, and **Mod** attachments.

```
public/
└── data/
    ├── manifest.json            # Version index (1.4.4, 1.6.2, 1.12.0, 1.14.7, 2.1.1)
    └── patches/
        ├── 1.4.4/               # Classic Pre-Reforged (+15 Upgrades)
        ├── 1.6.2/               # Early Reforged (Aetherhearts, Classic Sockets)
        ├── 1.12.0/              # Mid Reforged (Omnicells, Modern Sockets)
        ├── 1.14.7/              # Peak Reforged Meta (Full Roster)
        └── 2.1.1/               # Awakening Meta (Talents & Dual Weapons)
```

### 2. 📱 Progressive Web App (PWA) & Full Offline Support
- **Installable Native App**: Install to desktop (macOS / Windows / Linux dock) or mobile home screens (iOS Safari & Android Chrome) without browser toolbars.
- **Service Worker & Workbox**: Automatic offline caching of application bundles, icons, and all `/data/` patch files via `NetworkFirst` and `StaleWhileRevalidate` caching strategies.
- **Responsive Layout**:
  - **Mobile**: Touch-optimized bottom sheets, search filters, and an expandable summary drawer.
  - **Desktop / Tablet**: Widescreen dual-column interface with live stats sidebar, perk breakdown, and overcap warnings.

### 3. 👥 Community Builds with Deduplication & Auto-Upvoting
- **Curated & Community Loadouts**: Browse curated presets or player-submitted builds across **Top 20** (most upvoted), **New 20** (most recent), **All Builds**, and **My Builds** (device-owned).
- **Canonical Loadout Deduplication**:
  - When submitting a build, an order-independent fingerprint is generated (`getLoadoutFingerprint`).
  - If an identical equipment and cell configuration already exists, the database prevents duplicate entries and **automatically awards your upvote to the original author's build**.
- **Compact Build Sharing**: Instant 1-click shareable URLs encoded with a compact hash containing all equipment, cells, and patch parameters.

### 4. ⚔️ Calculation Engine & Legendary Bonding
- **Legendary Weapon Bonding**: Bond same-element weapons to Malkarion, Torgadoro, Thrax, Agarus, Urska, or Chronovore weapons to inherit innate perks and unique effects (available on patches 1.4.4 through 1.14.7).
- **Perk Point Aggregation**: Live calculation of total perk points, tier threshold validation (+6 cap for Reforged/Classic, activation thresholds for Awakening), and element resistance balances.
- **Dauntless Forever Commands**: Built-in generator to export equipment giving commands for self-hosted community servers.

### 5. 🎨 Dual Themes (Dark & Light)
- **Dark Mode**: Cyberpunk slate and aether blue palette (`#081217` background).
- **Light Mode**: High-readability Material Design 3 palette with clear text contrast and surface elevation.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/)

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/duddyx5/dauntless-gear-builder.git
cd dauntless-gear-builder

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
# Build production bundles, generate service worker and PWA manifest
npm run build

# Preview production build locally
npm run preview
```

### Re-compiling Patch Data
```bash
npm run build:data
```

---

## 🤝 Contributing

Contributions, bug reports, and dataset suggestions are welcome! Please open an issue or pull request on [GitHub](https://github.com/duddyx5/dauntless-gear-builder).

---

## 📜 License & Acknowledgements

- **License**: Free and open-source software under the **[GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE)**.
- **Acknowledgements**: Inspired by and built upon historical dataset schemas from [dauntless-builder](https://github.com/atomicptr/dauntless-builder) by atomicptr and community contributors.
- **Legal Disclaimer**: *Dauntless* and all associated logos, icons, gear names, and behemoth artwork are registered trademarks and intellectual property of **Phoenix Labs**. This is an unofficial, community-created fan project and is not affiliated with or endorsed by Phoenix Labs.
