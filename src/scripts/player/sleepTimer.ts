import { audioPlayer, stopStreamKeepStation } from "./audioPlayer";
import { showToast } from "../utils/toast";

/** Last minute: linear fade to silence, then stop the stream. */
const FADE_MS = 60_000;
const TICK_MS = 250;

let endsAt: number | null = null;
let tickId: number | null = null;
let fadeBaselineVolume = 1;
let fading = false;

function formatRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function syncSelectValue(minutes: number) {
  const select = document.getElementById(
    "sleep-timer-select",
  ) as HTMLSelectElement | null;
  if (!select) return;
  const value = String(minutes);
  if ([...select.options].some((o) => o.value === value)) {
    select.value = value;
  } else {
    select.value = "0";
  }
}

function updateCountdownUI(msLeft: number | null, isFading: boolean) {
  document.querySelectorAll("[data-sleep-countdown]").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (msLeft == null || msLeft <= 0) {
      node.hidden = true;
      node.textContent = "";
      node.dataset.fading = "false";
      return;
    }
    node.hidden = false;
    node.dataset.fading = isFading ? "true" : "false";
    const time = formatRemaining(msLeft);
    node.textContent = isFading ? `Fading ${time}` : `Sleep ${time}`;
  });
}

function clearTick() {
  if (tickId != null) {
    window.clearInterval(tickId);
    tickId = null;
  }
}

function restoreVolume() {
  if (!fading) return;
  audioPlayer.volume = fadeBaselineVolume;
  const dock = document.getElementById("dock-volume") as HTMLInputElement | null;
  const drawer = document.getElementById(
    "drawer-volume",
  ) as HTMLInputElement | null;
  if (dock) dock.value = String(fadeBaselineVolume);
  if (drawer) drawer.value = String(fadeBaselineVolume);
  fading = false;
}

function finishSleep() {
  clearTick();
  endsAt = null;
  restoreVolume();
  stopStreamKeepStation();
  syncSelectValue(0);
  updateCountdownUI(null, false);
  showToast("Sleep timer ended — stream stopped");
}

function tick() {
  if (endsAt == null) return;
  const msLeft = endsAt - Date.now();

  if (msLeft <= 0) {
    finishSleep();
    return;
  }

  const shouldFade = msLeft <= FADE_MS;
  if (shouldFade) {
    if (!fading) {
      fadeBaselineVolume = Math.max(0.01, audioPlayer.volume || 1);
      fading = true;
    }
    audioPlayer.volume = fadeBaselineVolume * Math.max(0, msLeft / FADE_MS);
  }

  updateCountdownUI(msLeft, shouldFade);
}

/** Cancel timer and restore volume if mid-fade. */
export function clearSleepTimer() {
  clearTick();
  endsAt = null;
  restoreVolume();
  syncSelectValue(0);
  updateCountdownUI(null, false);
}

/** Start / replace sleep timer. `minutes <= 0` clears. */
export function setSleepTimer(minutes: number) {
  clearTick();
  restoreVolume();

  if (!minutes || minutes <= 0) {
    endsAt = null;
    syncSelectValue(0);
    updateCountdownUI(null, false);
    return;
  }

  endsAt = Date.now() + minutes * 60 * 1000;
  syncSelectValue(minutes);
  tick();
  tickId = window.setInterval(tick, TICK_MS);
}

export function initSleepTimer() {
  const select = document.getElementById(
    "sleep-timer-select",
  ) as HTMLSelectElement | null;
  select?.addEventListener("change", () => {
    setSleepTimer(Number(select.value) || 0);
  });
  updateCountdownUI(null, false);
}
