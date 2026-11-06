const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const RECORDINGS_DIR = path.resolve(__dirname, '../recordings');
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

// Helper: Setup visual title overlay and virtual mouse cursor
async function setupShowcaseHelpers(page) {
  await page.evaluate(() => {
    // 1. Virtual Mouse Cursor
    if (!document.getElementById('playwright-virtual-cursor')) {
      const cursor = document.createElement('div');
      cursor.id = 'playwright-virtual-cursor';
      cursor.style.cssText = `
        position: fixed;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: rgba(34, 211, 238, 0.75);
        border: 2px solid #ffffff;
        box-shadow: 0 0 12px rgba(34, 211, 238, 0.9), 0 2px 8px rgba(0,0,0,0.5);
        pointer-events: none;
        z-index: 99999999;
        transition: transform 0.08s ease, background 0.15s ease;
        transform: translate(-50%, -50%);
        left: -100px;
        top: -100px;
      `;
      document.body.appendChild(cursor);

      window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      }, { passive: true });

      window.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.65)';
        cursor.style.background = 'rgba(244, 63, 94, 0.9)';
      }, { passive: true });

      window.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.background = 'rgba(34, 211, 238, 0.75)';
      }, { passive: true });
    }

    // 2. Title Overlay Banner Container
    if (!document.getElementById('showcase-overlay-banner')) {
      const overlay = document.createElement('div');
      overlay.id = 'showcase-overlay-banner';
      overlay.style.cssText = `
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translate(-50%, -15px) scale(0.96);
        z-index: 9999999;
        pointer-events: none;
        background: rgba(8, 18, 23, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1.5px solid rgba(6, 182, 212, 0.75);
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.35);
        border-radius: 16px;
        padding: 12px 28px;
        min-width: 380px;
        max-width: 90vw;
        text-align: center;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      document.body.appendChild(overlay);
    }
  });
}

// Helper: Display overlay banner with smooth animation
async function showTitleOverlay(page, category, title, subtitle, durationMs = 3200) {
  console.log(`[Showcase Overlay] ${category.toUpperCase()} - ${title}`);
  await page.evaluate(({ category, title, subtitle }) => {
    const overlay = document.getElementById('showcase-overlay-banner');
    if (!overlay) return;

    overlay.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:3px;">
        <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#22d3ee; box-shadow:0 0 8px #22d3ee;"></span>
        <span style="text-transform:uppercase; font-size:10px; font-weight:800; letter-spacing:2px; color:#22d3ee; font-family:'Inter', sans-serif;">${category}</span>
      </div>
      <div style="font-size:18px; font-weight:800; color:#ffffff; font-family:'Rajdhani', 'Inter', sans-serif; text-transform:uppercase; letter-spacing:1px; line-height:1.2;">${title}</div>
      ${subtitle ? `<div style="font-size:12px; font-weight:500; color:#94a3b8; font-family:'Inter', sans-serif; margin-top:3px;">${subtitle}</div>` : ''}
    `;

    overlay.style.opacity = '1';
    overlay.style.transform = 'translate(-50%, 0) scale(1)';
  }, { category, title, subtitle });

  if (durationMs > 0) {
    await page.waitForTimeout(durationMs);
    await page.evaluate(() => {
      const overlay = document.getElementById('showcase-overlay-banner');
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transform = 'translate(-50%, -15px) scale(0.96)';
      }
    });
    await page.waitForTimeout(400);
  }
}

// Smooth cursor glide and click
async function glideAndClick(page, target, options = {}) {
  let box = null;
  if (typeof target === 'string') {
    const el = await page.waitForSelector(target, { state: 'visible', timeout: options.timeout || 5000 }).catch(() => null);
    if (el) box = await el.boundingBox();
  } else if (target && typeof target.boundingBox === 'function') {
    box = await target.boundingBox();
  } else if (target && typeof target.x === 'number') {
    box = { x: target.x, y: target.y, width: 0, height: 0 };
  }

  if (!box) {
    console.log('Element bounding box not found, skipping glideAndClick');
    return;
  }

  const targetX = box.x + box.width / 2;
  const targetY = box.y + box.height / 2;

  await page.mouse.move(targetX, targetY, { steps: options.steps || 18 });
  await page.waitForTimeout(options.hoverWait || 200);
  await page.mouse.down();
  await page.waitForTimeout(options.clickWait || 120);
  await page.mouse.up();
  await page.waitForTimeout(options.afterWait || 300);
}

// =========================================================================
// 1. DESKTOP SHOWCASE (1920x1080)
// =========================================================================
async function recordDesktopShowcase() {
  console.log('\n🎬 Starting Desktop Showcase Recording (1920x1080)...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1920, height: 1080 },
    },
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // Navigate to local app
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await setupShowcaseHelpers(page);
  await page.waitForTimeout(1000);

  // Close Onboarding modal if visible
  const onboardingCloseBtn = await page.$('button:has-text("Start Forging")');
  if (onboardingCloseBtn) {
    await onboardingCloseBtn.click();
    await page.waitForTimeout(500);
  }

  // --- INTRO OVERLAY ---
  await showTitleOverlay(
    page,
    'Dauntless Gear Builder',
    'Version-Aware Loadout Workshop (v0.9.5-beta)',
    'Real-time stats, multi-era databases, PWA offline support & community builds',
    3500
  );

  // Smooth overview mouse glide
  await page.mouse.move(960, 400, { steps: 20 });
  await page.waitForTimeout(800);

  // --- FEATURE 1: 5 HISTORICAL & MODERN PATCH ERAS ---
  await showTitleOverlay(
    page,
    'Feature 1: Multi-Era Patch Engine',
    '5 Distinct Eras from Classic 1.4.4 to Awakening',
    'Era-specific progression, cell sockets, Power Surge & Behemoth rosters',
    3500
  );

  // Open patch dropdown in header
  const patchSelect = await page.$('.patch-switcher select');
  if (patchSelect) {
    const box = await patchSelect.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 15 });
      await page.waitForTimeout(300);
    }

    // Switch to 1.4.4 Classic
    console.log('Switching to Patch 1.4.4...');
    await patchSelect.selectOption('1.4.4');
    await page.waitForTimeout(1500);

    // Show 1.4.4 +15 level steppers
    await showTitleOverlay(
      page,
      'Patch 1.4.4 (Classic / Pre-Reforged)',
      'Legacy +0 to +15 Upgrades & Classic Cell Categories',
      'Power, Technique, Defence, Mobility, Utility sockets with dynamic perk scaling',
      3200
    );

    // Step level down then up
    const minusButtons = await page.$$('button:has-text("-")');
    if (minusButtons.length > 0) {
      await glideAndClick(page, minusButtons[0], { steps: 12 });
      await page.waitForTimeout(400);
      await glideAndClick(page, minusButtons[0], { steps: 12 });
      await page.waitForTimeout(400);
    }
    const plusButtons = await page.$$('button:has-text("+")');
    if (plusButtons.length > 0) {
      await glideAndClick(page, plusButtons[0], { steps: 12 });
      await page.waitForTimeout(400);
      await glideAndClick(page, plusButtons[0], { steps: 12 });
      await page.waitForTimeout(400);
    }

    // Switch to 2.1.1 Awakening
    console.log('Switching to Patch 2.1.1 (Awakening)...');
    await patchSelect.selectOption('2.1.1');
    await page.waitForTimeout(1500);

    await showTitleOverlay(
      page,
      'Patch 2.1.1 (Awakening Meta)',
      'Dual Weapons, Talents & Lantern Cores',
      'Equip primary + secondary weapons, configure talent branches, and activate cores',
      3400
    );

    await page.mouse.move(500, 400, { steps: 18 });
    await page.waitForTimeout(800);

    // Switch back to 1.14.7 Reforged Final
    console.log('Switching to Patch 1.14.7 (Reforged Final)...');
    await patchSelect.selectOption('1.14.7');
    await page.waitForTimeout(1500);
  }

  // --- FEATURE 2: LOADOUT FORGE & CELL SYNERGIES ---
  await showTitleOverlay(
    page,
    'Feature 2: Equipment Forge & Perk Aggregator',
    'Interactive Gear Selection & Dynamic Stat Calculations',
    'Fast elemental filtering, cell socket matching, and real-time tier calculation',
    3500
  );

  // Click Weapon Slot (button.gear-main)
  const weaponButtons = await page.$$('button.gear-main');
  if (weaponButtons.length > 0) {
    await glideAndClick(page, weaponButtons[0], { steps: 16 });
    await page.waitForTimeout(800);

    // Click 'Blaze' filter in picker
    const blazeFilter = await page.$('button:has-text("Blaze"), [title="Blaze"]');
    if (blazeFilter) {
      await glideAndClick(page, blazeFilter, { steps: 12 });
      await page.waitForTimeout(600);
    }

    // Select Inferno's Razor
    const infernoRazor = await page.$('button:has-text("Inferno\'s Razor")');
    if (infernoRazor) {
      await glideAndClick(page, infernoRazor, { steps: 12 });
    } else {
      const firstItem = await page.$('.modal-layer button:has(img)');
      if (firstItem) await glideAndClick(page, firstItem, { steps: 10 });
    }
    await page.waitForTimeout(1000);
  }

  // Toggle Power Surged in header
  const surgeBtn = await page.$('.surge-toggle, button:has-text("Surged")');
  if (surgeBtn) {
    await showTitleOverlay(
      page,
      'Aetherheart Power Surging',
      'One-Tap Max Tier Stats & Perks (+3)',
      'Instantly toggle base vs max tier values across all equipped items',
      2800
    );
    await glideAndClick(page, surgeBtn, { steps: 14 });
    await page.waitForTimeout(900);
    await glideAndClick(page, surgeBtn, { steps: 14 });
    await page.waitForTimeout(900);
  }

  // Hover over live sidebar perks
  await page.mouse.move(1550, 400, { steps: 18 });
  await page.waitForTimeout(1200);

  // --- FEATURE 3: COMMUNITY BUILDS & CANONICAL DEDUPLICATION ---
  await showTitleOverlay(
    page,
    'Feature 3: Community Builds & Deduplication',
    'Top, New, All Builds & Intelligent Auto-Upvote System',
    'Prevents duplicate meta spam by awarding votes to the original author',
    3500
  );

  // Click 'Builds' button in header
  const buildsBtn = await page.$('button:has-text("Builds")');
  if (buildsBtn) {
    await glideAndClick(page, buildsBtn, { steps: 15 });
    await page.waitForTimeout(1000);

    // Switch to User Builds tab
    const userBuildsTab = await page.$('button:has-text("User Builds")');
    if (userBuildsTab) {
      await glideAndClick(page, userBuildsTab, { steps: 12 });
      await page.waitForTimeout(800);
    }

    // Browse New tab
    const newTab = await page.$('button:has-text("New")');
    if (newTab) {
      await glideAndClick(page, newTab, { steps: 12 });
      await page.waitForTimeout(800);
    }

    // Browse Top tab
    const topTab = await page.$('button:has-text("Top")');
    if (topTab) {
      await glideAndClick(page, topTab, { steps: 12 });
      await page.waitForTimeout(800);
    }

    // Test search
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.click();
      await page.keyboard.type('Axe', { delay: 90 });
      await page.waitForTimeout(900);
      await searchInput.fill('');
      await page.waitForTimeout(500);
    }

    // Demonstrate "Share Current Build" & Deduplication
    const shareBuildBtn = await page.$('button:has-text("Share Current Build")');
    if (shareBuildBtn) {
      await glideAndClick(page, shareBuildBtn, { steps: 12 });
      await page.waitForTimeout(800);

      // Fill in build form
      const nameInput = await page.$('input[placeholder*="Build Name"], input[name="name"]');
      if (nameInput) {
        await nameInput.fill('Showcase Community Meta');
      }
      const authorInput = await page.$('input[placeholder*="Slayer Name"], input[name="author"]');
      if (authorInput) {
        await authorInput.fill('Duddy');
      }

      // Click Publish
      const publishBtn = await page.$('button:has-text("Publish Build"), button[type="submit"]');
      if (publishBtn) {
        await glideAndClick(page, publishBtn, { steps: 12 });
        await page.waitForTimeout(2000);
      }
    }

    // Close Presets Modal
    const closeBtn = await page.$('.modal-layer button[title="Close"], .modal-layer button[aria-label="Close dialog"], .modal-layer button:has(svg.lucide-x)');
    if (closeBtn) {
      await glideAndClick(page, closeBtn, { steps: 10 });
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(800);
  }

  // --- FEATURE 4: DUAL THEMES (MATERIAL DESIGN 3 LIGHT & DARK) ---
  await showTitleOverlay(
    page,
    'Feature 4: Accessibility & Theming',
    'Material Design 3 Light Mode & Slate Dark Mode',
    'Engineered for maximum contrast, eye comfort, and readability',
    3400
  );

  // Open Settings
  const settingsBtn = await page.$('button[aria-label="Settings"], button[title*="Settings"]');
  if (settingsBtn) {
    await glideAndClick(page, settingsBtn, { steps: 15 });
    await page.waitForTimeout(800);

    // Switch to Light Mode
    const lightBtn = await page.$('button:has-text("Light")');
    if (lightBtn) {
      await glideAndClick(page, lightBtn, { steps: 12 });
      await page.waitForTimeout(1500);
    }

    // Close Settings Modal
    const doneBtn = await page.$('button:has-text("Done")');
    if (doneBtn) {
      await glideAndClick(page, doneBtn, { steps: 12 });
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(1500);

    // Showcase Light Mode UI
    await page.mouse.move(960, 500, { steps: 20 });
    await page.waitForTimeout(1000);

    // Switch back to Dark Mode
    if (settingsBtn) {
      await glideAndClick(page, settingsBtn, { steps: 15 });
      await page.waitForTimeout(600);
      const darkBtn = await page.$('button:has-text("Dark")');
      if (darkBtn) {
        await glideAndClick(page, darkBtn, { steps: 12 });
        await page.waitForTimeout(1000);
      }
      const doneBtn2 = await page.$('button:has-text("Done")');
      if (doneBtn2) await glideAndClick(page, doneBtn2, { steps: 10 });
      await page.waitForTimeout(800);
    }
  }

  // --- OUTRO OVERLAY ---
  await showTitleOverlay(
    page,
    'Progressive Web App (PWA)',
    'Full Offline Capability Across Desktop & Mobile',
    'Installable directly from your browser with instant launch and local persistence',
    3800
  );

  await page.waitForTimeout(1500);

  // Close context to finish video
  await page.close();
  await context.close();
  const rawVideoPath = await page.video().path();
  const finalDesktopPath = path.join(RECORDINGS_DIR, 'showcase-desktop.webm');
  if (fs.existsSync(finalDesktopPath)) fs.unlinkSync(finalDesktopPath);
  fs.renameSync(rawVideoPath, finalDesktopPath);

  console.log(`✅ Desktop Showcase recorded successfully: ${finalDesktopPath}`);
  await browser.close();
}

// =========================================================================
// 2. MOBILE SHOWCASE (390x844 - iPhone Viewport)
// =========================================================================
async function recordMobileShowcase() {
  console.log('\n📱 Starting Mobile Showcase Recording (390x844)...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 390, height: 844 },
    },
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  // Navigate to local app
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await setupShowcaseHelpers(page);
  await page.waitForTimeout(1000);

  // Close Onboarding modal if visible
  const onboardingCloseBtn = await page.$('button:has-text("Start Forging")');
  if (onboardingCloseBtn) {
    await onboardingCloseBtn.click();
    await page.waitForTimeout(500);
  }

  // --- MOBILE INTRO OVERLAY ---
  await showTitleOverlay(
    page,
    'Mobile Responsive Experience',
    'Dauntless Gear Builder on Mobile',
    'Touch-friendly bottom sheets, drawer navigation & compact summary',
    3500
  );

  await page.waitForTimeout(800);

  // --- MOBILE BOTTOM SHEET PICKER ---
  await showTitleOverlay(
    page,
    'Touch-Friendly Equipment Picker',
    'Bottom Sheet Slots & Fast Element Filters',
    'Tap any gear slot to slide up element filters and equipped perks',
    3200
  );

  // Tap first equipment slot (Weapon)
  const mobileWeaponSlot = await page.$('button.gear-main');
  if (mobileWeaponSlot) {
    await glideAndClick(page, mobileWeaponSlot, { steps: 12 });
    await page.waitForTimeout(1000);

    // Tap Shock element tab
    const shockTab = await page.$('button:has-text("Shock"), [title="Shock"]');
    if (shockTab) {
      await glideAndClick(page, shockTab, { steps: 10 });
      await page.waitForTimeout(600);
    }

    // Select Malkarion weapon
    const malkWeapon = await page.$('button:has-text("Malkarion"), button:has-text("Storm")');
    if (malkWeapon) {
      await glideAndClick(page, malkWeapon, { steps: 10 });
    } else {
      const firstItem = await page.$('.modal-layer button:has(img)');
      if (firstItem) await glideAndClick(page, firstItem, { steps: 10 });
    }
    await page.waitForTimeout(1000);
  }

  // --- STICKY BOTTOM SUMMARY DRAWER ---
  await showTitleOverlay(
    page,
    'Live Loadout Summary Drawer',
    'Sticky Real-Time Stats & Tap-to-Expand Perks',
    'Check active perk totals (+6), weapon power, and resistances on the go',
    3200
  );

  // Tap sticky summary bar at bottom
  const stickyBar = await page.$('.bottom-summary, button:has-text("Power"), .fixed.bottom-0');
  if (stickyBar) {
    await glideAndClick(page, stickyBar, { steps: 12 });
    await page.waitForTimeout(1500);

    // Scroll drawer slightly
    await page.mouse.wheel(0, 150);
    await page.waitForTimeout(1000);

    // Close summary drawer (tap close or backdrop)
    const closeDrawerBtn = await page.$('button[aria-label="Close summary"], button:has-text("Close")');
    if (closeDrawerBtn) {
      await glideAndClick(page, closeDrawerBtn, { steps: 10 });
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(800);
  }

  // --- MOBILE HAMBURGER MENU & PATCH SWITCHER ---
  await showTitleOverlay(
    page,
    'Mobile Navigation & Patch Controls',
    'Slide-Out Drawer with Era Switcher & Settings',
    'Easily switch between 1.4.4, 1.6.2, 1.14.7, and 2.1.1 Awakening',
    3200
  );

  const menuBtn = await page.$('button[aria-label="Open builder menu"], button[title="Open Menu"]');
  if (menuBtn) {
    await glideAndClick(page, menuBtn, { steps: 12 });
    await page.waitForTimeout(1000);

    // Switch patch inside mobile menu
    const mobilePatchSelect = await page.$('.menu-patch select, aside select');
    if (mobilePatchSelect) {
      console.log('Mobile menu: switching patch to 1.4.4...');
      await mobilePatchSelect.selectOption('1.4.4');
      await page.waitForTimeout(1500);
    }
  }

  // --- OUTRO OVERLAY ---
  await showTitleOverlay(
    page,
    'Install as a Phone App (PWA)',
    'Add to Home Screen for Full Offline Use',
    'Runs full-screen with native app performance and no browser toolbars',
    3500
  );

  await page.waitForTimeout(1200);

  // Finish mobile recording
  await page.close();
  await context.close();
  const rawMobileVideoPath = await page.video().path();
  const finalMobilePath = path.join(RECORDINGS_DIR, 'showcase-mobile.webm');
  if (fs.existsSync(finalMobilePath)) fs.unlinkSync(finalMobilePath);
  fs.renameSync(rawMobileVideoPath, finalMobilePath);

  console.log(`✅ Mobile Showcase recorded successfully: ${finalMobilePath}`);
  await browser.close();
}

async function run() {
  try {
    await recordDesktopShowcase();
    await recordMobileShowcase();
    console.log('\n🎉 ALL SHOWCASE RECORDINGS COMPLETED SUCCESSFULLY!');
    console.log(`📁 Files located in: ${RECORDINGS_DIR}`);
  } catch (err) {
    console.error('Recording error:', err);
    process.exit(1);
  }
}

run();
