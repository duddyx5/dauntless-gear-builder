# Dauntless Gear Builder

A modern, refined, and version-aware build planner for **Dauntless**, supporting historical and modern patch eras:
- **Patch 1.6.2 (Classic Escalation)**: Classic cell socket categories (*Power, Technique, Defence, Mobility, Utility*) with no Omnicells.
- **Patch 1.12.0 (Reforged Mid-Era)**: Introduction of modernized cell sockets (*Brutality, Finesse, Fortitude, Alacrity, Insight*) and Omnicells (*Discipline, Bastion, Iceborne, Tempest, Revenant*).
- **Patch 1.14.7 (Reforged Final)**: Peak Reforged meta with full Behemoth equipment rosters, expanded cells (*Pulse, Reuse, Recycle, Reduce*), and Artificer.
- **Patch 2.1.1 (Awakening)**: Post-Awakening overhaul featuring Weapon Talents and Lantern Cores.

---

## 🌟 Key Features

### 1. ⏱️ 4-Patch Version-Aware Game Data
- Select between **1.6.2**, **1.12.0**, **1.14.7**, and **2.1.1** from the persistent patch selector.
- Instantly updates item stats, available cell sockets, perk values, and unique effects matching that exact era.
- Community presets are automatically filtered to show builds engineered specifically for the active version.
- Directory schema:
  ```
  public/
  └── data/
      ├── manifest.json            # Manifest for 1.6.2, 1.12.0, 1.14.7, 2.1.1
      └── patches/
          ├── 1.6.2/               # Classic Escalation Meta
          ├── 1.12.0/              # Reforged Mid-Era Meta
          ├── 1.14.7/              # Reforged Final Meta
          └── 2.1.1/               # Awakening Meta
  ```

### 2. 📱 Responsive Experience (Phones, Tablets & Desktops)
- **Smartphone & Small Screens**:
  - Smooth bottom-sheet equipment and cell selector with touch-friendly tap targets, element tabs, and live search.
  - Sticky bottom summary bar showing live Power, Resistance, and active perk badges at a glance, with tap-to-expand details.
- **Tablets & Desktop Screens**:
  - Dual-column widescreen layout with zero UI element sacrifices.
  - Left column: Equipment slots with cell socket indicators and unique effects.
  - Right column: Persistent Live Build Overview & Perks Inspector with 1..6 tier progress bars, overcap warnings, and source breakdowns.

### 3. 👥 Version-Filtered Community Builds & Local Storage
- **Preset Meta Builds**: View and equip community builds for the active version (e.g. Classic Low-Life Crit Sword for 1.6.2, Bastion Shield Tank for 1.12.0, Inferno Overpower Meta for 1.14.7, and Silver Sword Bastion Nova for 2.1.1).
- **Local Storage**: Save, rename, and load your own builds locally.
- **Compact Build Sharing**: 1-click share URL generates compact hashes preserving gear selections and patch version.

### 4. ⚡ Power Surge & Calculation Engine
- One-tap **Surge Toggle** in the header to switch between base stats and maximum Power Surged stats (+3 perks, 120 Power, 30+ Res).
- Real-time perk point aggregation, tier capping at +6, and elemental resistance calculations.

---

## 🚀 Getting Started

### Development
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
npm run build
npm run preview
```

### Compiling or Updating Patch Data
```bash
npm run build:data
```
