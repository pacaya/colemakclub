/**
 * Legacy entry point (pre-refactor).
 *
 * The app has been split into multiple feature files under `logic/app/`.
 * `index.html` now loads those files directly and calls `CC.bootstrap.start()`.
 *
 * Keeping this file as a small shim reduces confusion for existing links/bookmarks
 * or forks that still reference `logic/app.js`.
 */
(function () {
  if (window.CC && window.CC.bootstrap && typeof window.CC.bootstrap.start === "function") {
    window.CC.bootstrap.start();
  } else {
    // If someone loads only `logic/app.js` without the split files, do nothing.
    // (The split build is meant to be loaded via index.html script tags.)
    console.warn("ColemakClub: split scripts not loaded; `CC.bootstrap.start()` unavailable.");
  }
})();
