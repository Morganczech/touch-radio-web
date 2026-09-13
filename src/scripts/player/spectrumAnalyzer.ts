/**
 * Visual spectrum for the player dock / drawer.
 *
 * Live radio streams are almost always cross-origin without CORS, so a real
 * AnalyserNode via createMediaElementSource() either shows silence in the
 * analyser OR (worse) routes element audio through a suspended AudioContext
 * and mutes playback entirely.
 *
 * We therefore keep element audio on the native output path and drive the
 * bars with CSS when playing.
 */

function setFallback(active: boolean) {
  for (const id of ["dock-viz", "drawer-viz"]) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.classList.toggle("is-css-fallback", active);
    el.classList.remove("is-live-spectrum");
    el.querySelectorAll<HTMLElement>(":scope > span").forEach((bar) => {
      bar.style.height = "";
    });
  }
}

/** Call when playback is audible. */
export async function startSpectrum() {
  setFallback(true);
}

/** Call when paused / stopped — bars stay idle via CSS data-active. */
export function stopSpectrumVisual() {
  setFallback(false);
}

/** No-op: we no longer own an AudioContext. */
export function suspendSpectrum() {
  // intentionally empty
}
