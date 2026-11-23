/**
 * Phyto Intelligence — Official Website Application Controller
 * Handles dynamic GitHub release fetching, direct APK download triggers,
 * FAQ accordion, and navigation drawers.
 */

(function () {
  'use strict';

  // Configuration
  const GITHUB_OWNER = 'Ganesh7t755';
  const GITHUB_REPO = 'Phyto-Update-Server';
  const RELEASES_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
  const FALLBACK_RELEASE_PAGE = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;
  const FALLBACK_APK_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest/download/app-release.apk`;

  // State
  let cachedReleaseData = null;
  let cachedApkAsset = null;
  let isFetchingRelease = false;

  // DOM Elements
  const elReleaseVersion = document.getElementById('releaseVersion');
  const elReleaseFileName = document.getElementById('releaseFileName');
  const elReleaseFileSize = document.getElementById('releaseFileSize');
  const elReleaseDate = document.getElementById('releaseDate');
  const btnDownloadApk = document.getElementById('btnDownloadApk');
  const btnDownloadText = document.getElementById('btnDownloadText');
  const btnRetryRelease = document.getElementById('btnRetryRelease');
  const releaseErrorBanner = document.getElementById('releaseErrorBanner');
  const releaseErrorMessage = document.getElementById('releaseErrorMessage');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  /**
   * Format byte size into human-readable string (MB)
   */
  function formatBytes(bytes) {
    if (!bytes || isNaN(bytes)) return '42.2 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }

  /**
   * Format ISO date string into readable botanical date
   */
  function formatDate(isoStr) {
    if (!isoStr) return 'Recent Release';
    try {
      const d = new Date(isoStr);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(d);
    } catch (e) {
      return isoStr.substring(0, 10);
    }
  }

  /**
   * Display accessible toast message
   */
  let toastTimer = null;
  function showToast(message) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = message;
    toastNotification.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 4000);
  }

  /**
   * Fetch the latest release info from GitHub API
   */
  async function fetchLatestRelease() {
    if (isFetchingRelease) return;
    isFetchingRelease = true;

    // Reset UI state
    if (releaseErrorBanner) releaseErrorBanner.style.display = 'none';
    if (btnRetryRelease) btnRetryRelease.style.display = 'none';
    if (elReleaseVersion) elReleaseVersion.textContent = 'Fetching latest version...';
    if (elReleaseFileSize) elReleaseFileSize.textContent = 'Calculating...';

    try {
      const response = await fetch(RELEASES_API, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API returned status ${response.status}`);
      }

      const data = await response.json();
      cachedReleaseData = data;

      // Locate primary APK asset
      const assets = data.assets || [];
      // Prioritize versioned Phyto-Intelligence APK, then legacy app-release.apk, then any .apk
      let targetAsset = assets.find(a => a.name && /^Phyto-Intelligence-v.*\.apk$/i.test(a.name));
      if (!targetAsset) {
        targetAsset = assets.find(a => a.name && a.name.toLowerCase() === 'app-release.apk');
      }
      if (!targetAsset) {
        targetAsset = assets.find(a => a.name && a.name.toLowerCase().endsWith('.apk'));
      }
      if (!targetAsset) {
        targetAsset = assets.find(a => a.content_type === 'application/vnd.android.package-archive');
      }

      if (targetAsset) {
        cachedApkAsset = targetAsset;
        if (elReleaseVersion) {
          const tag = data.tag_name || 'Latest';
          const name = data.name && data.name !== tag ? ` (${data.name})` : '';
          elReleaseVersion.textContent = `${tag}${name}`;
        }
        if (elReleaseFileName) elReleaseFileName.textContent = targetAsset.name;
        if (elReleaseFileSize) elReleaseFileSize.textContent = formatBytes(targetAsset.size);
        if (elReleaseDate) elReleaseDate.textContent = formatDate(targetAsset.updated_at || data.published_at);

        if (btnDownloadText) btnDownloadText.textContent = `Download ${targetAsset.name}`;
      } else {
        // Release exists, but no direct APK asset found in release assets
        if (elReleaseVersion) elReleaseVersion.textContent = data.tag_name || 'Latest';
        if (elReleaseFileName) elReleaseFileName.textContent = 'app-release.apk';
        if (elReleaseFileSize) elReleaseFileSize.textContent = '~42.2 MB';
        if (elReleaseDate) elReleaseDate.textContent = formatDate(data.published_at);
        cachedApkAsset = {
          name: 'app-release.apk',
          browser_download_url: FALLBACK_APK_URL
        };
      }
    } catch (err) {
      console.warn('Failed to fetch release metadata dynamically:', err);

      // Graceful fallback to static verified release details
      if (elReleaseVersion) elReleaseVersion.textContent = 'v5.0.3 (Latest Production)';
      if (elReleaseFileName) elReleaseFileName.textContent = 'app-release.apk';
      if (elReleaseFileSize) elReleaseFileSize.textContent = '42.2 MB';
      if (elReleaseDate) elReleaseDate.textContent = 'Verified Release';

      if (releaseErrorBanner) {
        releaseErrorBanner.style.display = 'block';
        if (releaseErrorMessage) {
          releaseErrorMessage.textContent = 'Live GitHub API rate limited or unreachable. Direct APK download is still active.';
        }
      }
      if (btnRetryRelease) btnRetryRelease.style.display = 'inline-flex';

      cachedApkAsset = {
        name: 'app-release.apk',
        browser_download_url: FALLBACK_APK_URL
      };
    } finally {
      isFetchingRelease = false;
    }
  }

  /**
   * Trigger direct binary download stream without navigating away
   */
  function triggerDirectDownload(url, filename) {
    if (!url) {
      window.location.href = FALLBACK_RELEASE_PAGE;
      return;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.setAttribute('download', filename || 'app-release.apk');
    downloadLink.setAttribute('rel', 'noopener noreferrer');
    downloadLink.style.display = 'none';

    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      document.body.removeChild(downloadLink);
    }, 1000);

    showToast(`Downloading ${filename || 'app-release.apk'}... Check your notifications.`);
  }

  /**
   * Set up Download CTA event listeners
   */
  function setupDownloadActions() {
    if (btnDownloadApk) {
      btnDownloadApk.addEventListener('click', function (e) {
        e.preventDefault();
        const url = (cachedApkAsset && cachedApkAsset.browser_download_url)
          ? cachedApkAsset.browser_download_url
          : FALLBACK_APK_URL;
        const name = (cachedApkAsset && cachedApkAsset.name) ? cachedApkAsset.name : 'app-release.apk';

        btnDownloadApk.classList.add('loading');
        if (btnDownloadText) btnDownloadText.textContent = 'Initiating download...';

        triggerDirectDownload(url, name);

        setTimeout(() => {
          btnDownloadApk.classList.remove('loading');
          if (btnDownloadText) {
            btnDownloadText.textContent = cachedApkAsset ? `Download ${cachedApkAsset.name}` : 'Download APK';
          }
        }, 1800);
      });
    }

    if (btnRetryRelease) {
      btnRetryRelease.addEventListener('click', function () {
        fetchLatestRelease();
      });
    }
  }

  /**
   * Set up FAQ Accordion
   */
  function setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const questionBtn = item.querySelector('.faq-question');
      if (!questionBtn) return;

      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other FAQ items
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          const otherBtn = otherItem.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        if (!isActive) {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /**
   * Set up Mobile Drawer & Navigation
   */
  function setupMobileNavigation() {
    if (!mobileMenuBtn || !mobileDrawer) return;

    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
      } else {
        mobileDrawer.classList.add('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        mobileDrawer.setAttribute('aria-hidden', 'false');
      }
    });

    // Close drawer when any mobile link is clicked
    const drawerLinks = mobileDrawer.querySelectorAll('a');
    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /**
   * Initialize all components on DOM ready
   */
  function init() {
    setupDownloadActions();
    setupFaqAccordion();
    setupMobileNavigation();
    fetchLatestRelease();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
