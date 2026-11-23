# Phyto Intelligence — Official Website (`app-details-web`)

Official showcase and distribution website for **Phyto Intelligence**, an on-device botanical intelligence Android application.

---

## 🌿 Overview

This website serves as the primary public portal for Phyto Intelligence. It introduces the application's unique features, showcases the native mobile user experience, links to the verified on-device Model Library, and provides a direct, dynamic APK download stream powered by GitHub Releases.

Built with pure HTML5, CSS3, and modern ES6 JavaScript — zero framework overhead, zero build dependencies, and zero tracking scripts.

---

## 🎨 Visual System: Deep Canopy

- **Atmosphere:** Deep botanical immersion with high-resolution photographic background.
- **Acrylic Surface:** Smoked Emerald frosted glass canvas (`rgba(9, 24, 17, 0.64)`) with backdrop blur (`blur(28px) saturate(160%)`).
- **Color Hierarchy (60:30:10):**
  - **Dominant (60%):** Deep Forest Obsidian & Smoked Glass (`#05120B`, `#091811`).
  - **Secondary (30%):** Natural Chlorophyll Tint (`#0D281A`, `#133824`).
  - **Accent (10%):** Living Emerald (`#10B981`, hover `#059669`).
- **Typography:** Inter & Plus Jakarta Sans with monospace metrics for technical specifications.

---

## 📁 Project Structure

```text
app-details-web/
├── index.html              # Semantic HTML5 document (Sections A through L)
├── styles.css              # Deep Canopy design system & responsive layout
├── app.js                  # Client controller & GitHub release integration
├── README.md               # Project documentation
└── assets/
    └── botanical-canopy.jpg # Photographic background asset (16:9 high-res)
```

---

## ⚡ Key Features

1. **Dynamic APK Download Integration:**
   - Automatically queries `https://api.github.com/repos/Ganesh7t755/Phyto-Update-Server/releases/latest`.
   - Discovers `app-release.apk`, extracts exact file size in MB, release tag, and publication date.
   - Primary **Download APK** button initiates direct binary download without navigating to external GitHub pages.
   - Graceful fallback with manual retry button if API rate limits are encountered.

2. **Model Ecosystem Gateway:**
   - Direct link to the official on-device GGUF catalog at [Phyto Model Library](https://ganesh7t755.github.io/phyto-model-library/).

3. **Installation & Security Guide:**
   - Step-by-step instructions for installing `.apk` files on Android 8.0+.
   - Explains SHA-256 verification and Android's "Install Unknown Apps" permission.

4. **Accessibility & Performance:**
   - ARIA labels on all interactive controls (`aria-expanded`, `aria-selected`, `aria-live`).
   - Reduced-motion media query support (`prefers-reduced-motion: reduce`).
   - Pure static asset serving with zero external build tools required.

---

## 🚀 Local Preview

Open `index.html` directly in any modern web browser or serve via Python's built-in HTTP server:

```powershell
cd "d:\phyto--intelligence (3)\app-details-web"
python -m http.server 8080
```

Then visit `http://localhost:8080` in your browser.
