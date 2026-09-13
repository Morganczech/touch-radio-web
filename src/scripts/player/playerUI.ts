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
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  unlockBodyScroll();
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
  const syncVolumeInputs = (value: number) => {
    audioPlayer.volume = value;
    if (volume) volume.value = String(value);
    if (drawerVolume) drawerVolume.value = String(value);
  };
  volume?.addEventListener("input", () => syncVolumeInputs(Number(volume.value)));
  drawerVolume?.addEventListener("input", () =>
    syncVolumeInputs(Number(drawerVolume.value)),
  );
  syncVolumeInputs(audioPlayer.volume || 1);

  initSleepTimer();

  (window as any).__touchRadioSyncDock = syncPlayerUI;
  (window as any).__touchRadioSyncPlayerUI = syncPlayerUI;
}
