# Phyto Intelligence Model Library Website

The official model discovery and download platform for Phyto Intelligence Android application.

## Directory Structure

```text
website/
├── index.html       # Clean, modern, responsive single-page web application
├── styles.css       # Phyto Intelligence botanical design system
├── models.js        # Offline-compatible model registry (window.PHYTO_MODELS)
├── models.json      # Standard JSON format model data
├── app.js           # Interactive controller: search, category filters, direct download, modal
└── README.md        # Documentation and GitHub Pages deployment instructions
```

## Features

- **10 Verified Models**:
  - **Light (5)**: SmolLM2 360M, Qwen 2.5 0.5B, Llama 3.2 1B (Baseline), SmolLM2 1.7B, Qwen 2.5 1.5B.
  - **Reasoning (5)**: DeepSeek-R1-Distill-Qwen-1.5B, Gemma 2 2B IT, Llama 3.2 3B, Qwen 2.5 3B, Phi-3.5-mini.
- **Genuine Direct Downloads**: When the user clicks **Download GGUF**, the browser immediately streams the binary file via Cloudflare CDN edge nodes. No user redirection to third-party webpages.
- **Zero-Dependency Architecture**: Pure Vanilla HTML5/CSS3/JavaScript with zero build step, zero Node.js runtime requirement, and zero npm dependencies.
- **Dual Compatibility**: Runs seamlessly both locally via `file://` and deployed on GitHub Pages.

## GitHub Pages Deployment Instructions (Once Repository URL is Provided)

When the project owner provides the target GitHub repository URL:

### Option A: Deploy via GitHub Actions (Recommended)
1. Push the repository with the `website/` folder.
2. In GitHub repository settings: **Settings** &rarr; **Pages** &rarr; **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` / `master` (Folder: `/website` or `/docs` if moved).

### Option B: Deploy to `gh-pages` Branch
```bash
git subtree push --prefix website origin gh-pages
```
Website will immediately be live at:
`https://<username>.github.io/<repo-name>/`
