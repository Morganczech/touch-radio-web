import { appState } from "../state/appState";
import { audioPlayer } from "./audioPlayer";
import { lockBodyScroll, unlockBodyScroll } from "../utils/scrollLock";
import { initSleepTimer } from "./sleepTimer";

export type PlayerUIState = {
  active: boolean;
  paused: boolean;
  station: any | null;
};

export function getPlayerUIState(): PlayerUIState {
  const id = appState.currentPlayingId;
  const station = id
    ? appState.allStations.find((s: any) => s.id === id) ?? null
    : null;
  const active = Boolean(station && !audioPlayer.paused && audioPlayer.src);
  const paused = Boolean(station && audioPlayer.paused && audioPlayer.src);
  return { active, paused, station };
}

function setImg(el: HTMLImageElement | null, src: string) {
  if (!el) return;
  el.src = src;
  el.onerror = () => {
    el.src = "/logo.svg";
  };
}

export function syncPlayerUI() {
  const { active, paused, station } = getPlayerUIState();
  const hasStation = Boolean(station);

  const dock = document.getElementById("player-dock");
  const drawer = document.getElementById("now-playing-drawer");
  const nameEls = document.querySelectorAll("[data-player-name]");
  const metaEls = document.querySelectorAll("[data-player-meta]");
  const qualityEls = document.querySelectorAll("[data-player-quality]");
  const liveEls = document.querySelectorAll("[data-player-live]");
  const artEls = document.querySelectorAll<HTMLImageElement>("[data-player-art]");
  const genreEls = document.querySelectorAll("[data-player-genre]");
  const playBtns = document.querySelectorAll<HTMLButtonElement>("[data-player-play]");
  const favBtns = document.querySelectorAll<HTMLButtonElement>("[data-player-favorite]");

  if (dock) {
    dock.dataset.active = active ? "true" : "false";
    dock.dataset.paused = paused ? "true" : "false";
    dock.dataset.hasStation = hasStation ? "true" : "false";
  }
  if (drawer) {
    drawer.dataset.active = active ? "true" : "false";
    drawer.dataset.paused = paused ? "true" : "false";
    drawer.dataset.hasStation = hasStation ? "true" : "false";
  }

  const name = station?.name ?? "Select a station";
  const country = station?.country || "Unknown";
  const codec = (station?.codec || "—").toString().toUpperCase();
  const bitrate = station?.bitrate ? `${station.bitrate} kbps` : "";
  const meta = station
    ? `${country} · ${codec}${bitrate ? " " + bitrate : ""}`
    : "Browse and press play to start streaming";
  const quality = station?.bitrate
    ? `HQ ${station.bitrate}k`
    : station
      ? codec
      : "—";
  const genre =
    Array.isArray(station?.tags) && station.tags.length
      ? String(station.tags[0]).toUpperCase()
      : "LIVE RADIO";
  const art = station?.favicon || "/logo.svg";
  const isFavorite = station ? appState.favoriteIds.has(station.id) : false;

  nameEls.forEach((el) => {
    el.textContent = name;
  });
  metaEls.forEach((el) => {
    el.textContent = meta;
  });
  qualityEls.forEach((el) => {
    el.textContent = quality;
  });
  genreEls.forEach((el) => {
    el.textContent = genre;
  });
  liveEls.forEach((el) => {
    if (el instanceof HTMLElement) el.hidden = !hasStation;
  });
  artEls.forEach((el) => setImg(el, art));

  playBtns.forEach((btn) => {
    btn.disabled = !hasStation;
    if (station) {
      btn.dataset.id = station.id;
      btn.dataset.stream = station.streamUrl;
    } else {
      delete btn.dataset.id;
      delete btn.dataset.stream;
    }
  });

  favBtns.forEach((btn) => {
    btn.disabled = !hasStation;
    btn.dataset.active = isFavorite ? "true" : "false";
    btn.setAttribute("aria-pressed", isFavorite ? "true" : "false");
    if (station) btn.dataset.id = station.id;
    else delete btn.dataset.id;
  });
}

export function openNowPlayingDrawer() {
  const drawer = document.getElementById("now-playing-drawer");
  if (!drawer) return;
  // Compensate scrollbar BEFORE overflow:hidden (drawer-open)
  lockBodyScroll();
  document.body.classList.add("drawer-open");
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  syncPlayerUI();
}

export function closeNowPlayingDrawer() {
  const drawer = document.getElementById("now-playing-drawer");
  if (!drawer) return;
  const sheet = drawer.querySelector(".npd-sheet") as HTMLElement | null;
  const backdrop = drawer.querySelector(".npd-backdrop") as HTMLElement | null;
  if (sheet) {
    sheet.style.transform = "";
    sheet.style.transition = "";
  }
  if (backdrop) {
    backdrop.style.opacity = "";
    backdrop.style.transition = "";
  }
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  unlockBodyScroll();
}

/** Mobile bottom-sheet: swipe down to dismiss (handle always; body only at scroll top). */
function initDrawerSwipeDismiss() {
  const drawer = document.getElementById("now-playing-drawer");
  const sheet = drawer?.querySelector(".npd-sheet") as HTMLElement | null;
  const backdrop = drawer?.querySelector(".npd-backdrop") as HTMLElement | null;
  if (!drawer || !sheet) return;

  const DISMISS_PX = 96;
  const DISMISS_VELOCITY = 0.55;

  let tracking = false;
  let dragging = false;
  let fromHandle = false;
  let startY = 0;
  let startX = 0;
  let offsetY = 0;
  let lastY = 0;
  let lastT = 0;
  let velocity = 0;
  let pointerId: number | null = null;

  const clearInlineMotion = () => {
    sheet.style.transform = "";
    sheet.style.transition = "";
    if (backdrop) {
      backdrop.style.opacity = "";
      backdrop.style.transition = "";
    }
  };

  const snapClosed = () => {
    sheet.style.transition = "transform 0.22s ease-in";
    sheet.style.transform = "translateY(105%)";
    if (backdrop) {
      backdrop.style.transition = "opacity 0.22s ease-in";
      backdrop.style.opacity = "0";
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      sheet.removeEventListener("transitionend", finish);
      clearInlineMotion();
      closeNowPlayingDrawer();
    };
    sheet.addEventListener("transitionend", finish);
    window.setTimeout(finish, 280);
  };

  const snapOpen = () => {
    sheet.style.transition = "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)";
    sheet.style.transform = "translateY(0)";
    if (backdrop) {
      backdrop.style.transition = "opacity 0.28s ease";
      backdrop.style.opacity = "1";
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      sheet.removeEventListener("transitionend", finish);
      clearInlineMotion();
    };
    sheet.addEventListener("transitionend", finish);
    window.setTimeout(finish, 320);
  };

  const endGesture = () => {
    if (!tracking && !dragging) return;
    const shouldClose =
      dragging && (offsetY >= DISMISS_PX || (offsetY > 40 && velocity >= DISMISS_VELOCITY));

    tracking = false;
    dragging = false;
    fromHandle = false;
    pointerId = null;

    if (shouldClose) snapClosed();
    else if (offsetY > 0) snapOpen();
    else clearInlineMotion();

    offsetY = 0;
    velocity = 0;
  };

  sheet.addEventListener("pointerdown", (e) => {
    if (!drawer.classList.contains("is-open")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const target = e.target as Element | null;
    if (target?.closest("input, select, textarea, button, a, label")) return;

    fromHandle = Boolean(target?.closest("[data-drawer-drag]"));
    if (!fromHandle && sheet.scrollTop > 0) return;

    tracking = true;
    dragging = false;
    startY = e.clientY;
    startX = e.clientX;
    offsetY = 0;
    lastY = e.clientY;
    lastT = e.timeStamp;
    velocity = 0;
    pointerId = e.pointerId;
  });

  sheet.addEventListener("pointermove", (e) => {
    if (!tracking || (pointerId !== null && e.pointerId !== pointerId)) return;

    const dy = e.clientY - startY;
    const dx = e.clientX - startX;

    if (!dragging) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        tracking = false;
        return;
      }
      if (dy < 10) return;
      if (!fromHandle && sheet.scrollTop > 0) {
        tracking = false;
        return;
      }
      dragging = true;
      sheet.setPointerCapture(e.pointerId);
      sheet.style.transition = "none";
      if (backdrop) backdrop.style.transition = "none";
    }

    offsetY = Math.max(0, dy);
    const dt = Math.max(1, e.timeStamp - lastT);
    velocity = (e.clientY - lastY) / dt;
    lastY = e.clientY;
    lastT = e.timeStamp;

    sheet.style.transform = `translateY(${offsetY}px)`;
    if (backdrop) {
      backdrop.style.opacity = String(Math.max(0, 1 - offsetY / 340));
    }
  });

  sheet.addEventListener("pointerup", endGesture);
  sheet.addEventListener("pointercancel", endGesture);
  sheet.addEventListener("lostpointercapture", () => {
    if (tracking || dragging) endGesture();
  });
}

export function toggleNowPlayingDrawer() {
  const drawer = document.getElementById("now-playing-drawer");
  if (!drawer) return;
  if (drawer.classList.contains("is-open")) closeNowPlayingDrawer();
  else openNowPlayingDrawer();
}

export function initPlayerUI() {
  syncPlayerUI();

  audioPlayer.addEventListener("play", syncPlayerUI);
  audioPlayer.addEventListener("pause", syncPlayerUI);
  audioPlayer.addEventListener("ended", syncPlayerUI);
  audioPlayer.addEventListener("error", syncPlayerUI);

  document.getElementById("dock-expand")?.addEventListener("click", () => {
    if (appState.currentPlayingId) openNowPlayingDrawer();
  });

  document.querySelectorAll("[data-close-now-playing]").forEach((el) => {
    el.addEventListener("click", () => closeNowPlayingDrawer());
  });

  // Tap now-playing area on dock → expand drawer
  document.getElementById("dock-now-playing")?.addEventListener("click", () => {
    if (appState.currentPlayingId) openNowPlayingDrawer();
  });

  const volume = document.getElementById("dock-volume") as HTMLInputElement | null;
  const drawerVolume = document.getElementById("drawer-volume") as HTMLInputElement | null;
  const muteBtns = document.querySelectorAll<HTMLButtonElement>("[data-volume-mute]");
  let lastVolume = audioPlayer.volume > 0 ? audioPlayer.volume : 1;

  const syncMuteButtons = (value: number) => {
    const muted = value <= 0.001;
    muteBtns.forEach((btn) => {
      btn.setAttribute("aria-pressed", muted ? "true" : "false");
      btn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    });
  };

  const syncVolumeInputs = (value: number) => {
    const v = Math.max(0, Math.min(1, value));
    audioPlayer.volume = v;
    if (v > 0.001) lastVolume = v;
    if (volume) volume.value = String(v);
    if (drawerVolume) drawerVolume.value = String(v);
    syncMuteButtons(v);
  };

  volume?.addEventListener("input", () => syncVolumeInputs(Number(volume.value)));
  drawerVolume?.addEventListener("input", () =>
    syncVolumeInputs(Number(drawerVolume.value)),
  );

  muteBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (audioPlayer.volume > 0.001) {
        lastVolume = audioPlayer.volume;
        syncVolumeInputs(0);
      } else {
        syncVolumeInputs(lastVolume > 0.001 ? lastVolume : 1);
      }
    });
  });

  syncVolumeInputs(audioPlayer.volume || 1);

  initSleepTimer();
  initDrawerSwipeDismiss();

  (window as any).__touchRadioSyncDock = syncPlayerUI;
  (window as any).__touchRadioSyncPlayerUI = syncPlayerUI;
}
