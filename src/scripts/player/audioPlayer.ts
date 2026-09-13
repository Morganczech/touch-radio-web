import { appState } from "../state/appState";
import { showToast } from "../utils/toast";
import {
  setMediaSessionPlaybackState,
  updateMediaSession,
} from "./mediaSession";
import { startSpectrum, stopSpectrumVisual } from "./spectrumAnalyzer";

export const audioPlayer = new Audio();
audioPlayer.preload = "none";

function syncPlayerUI() {
  const sync =
    (window as any).__touchRadioSyncPlayerUI ||
    (window as any).__touchRadioSyncDock;
  if (typeof sync === "function") sync();
}

function updatePlaybackIcon(id: string, isPlaying: boolean) {
  const buttons = document.querySelectorAll(`.play-btn[data-id="${id}"]`);
  buttons.forEach((button) => {
    const icon = button.querySelector(".selection-control-icon");
    if (icon) {
      icon.innerHTML = isPlaying
        ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>'
        : '<path d="M8 5v14l11-7z"></path>';
    }

    const label = button.querySelector(".msi-play-label");
    if (label) {
      label.textContent = isPlaying ? "Pause" : "Play";
    }

    const name =
      button.getAttribute("aria-label")?.replace(/^(Play|Pause)\s+/, "") ?? "";
    if (name) {
      button.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} ${name}`);
    }
  });
}

function updateUIState(id: string, isPlaying: boolean, isError = false) {
  const buttons = document.querySelectorAll(`.play-btn[data-id="${id}"]`);

  buttons.forEach((btn) => {
    const stationCard = btn.closest(".station-card");
    if (stationCard) {
      if (isPlaying) {
        stationCard.classList.add("is-playing");
        stationCard.classList.remove("is-error");
      } else {
        stationCard.classList.remove("is-playing");
        if (isError) {
          stationCard.classList.add("is-error");
          setTimeout(() => {
            stationCard.classList.add("is-fading-out");
            setTimeout(() => {
              stationCard.closest("li.station-item")?.remove();
            }, 300);
          }, 2500);
        }
      }
    }

    const sidebarItem = btn.closest(".selected-item");
    if (sidebarItem) {
      if (isPlaying) {
        sidebarItem.classList.add("is-playing");
      } else {
        sidebarItem.classList.remove("is-playing");
      }
    }
  });

  updatePlaybackIcon(id, isPlaying);
}

export function stopPlayback(isError = false) {
  audioPlayer.pause();
  audioPlayer.removeAttribute("src");
  audioPlayer.load();

  if (appState.currentPlayingId) {
    updateUIState(appState.currentPlayingId, false, isError);
    appState.currentPlayingId = null;
  }
  setMediaSessionPlaybackState("none");
  updateMediaSession();
  stopSpectrumVisual();
  syncPlayerUI();
}

/** Soft pause keeps station context in the dock/drawer. */
export function pausePlayback() {
  if (!appState.currentPlayingId) return;
  audioPlayer.pause();
  updateUIState(appState.currentPlayingId, false);
  setMediaSessionPlaybackState("paused");
  stopSpectrumVisual();
  syncPlayerUI();
}

/**
 * Sleep / battery-friendly stop: drop the network stream but keep the
 * current station selected so the user can resume from the dock.
 */
export function stopStreamKeepStation() {
  if (!appState.currentPlayingId) return;
  audioPlayer.pause();
  audioPlayer.removeAttribute("src");
  audioPlayer.load();
  updateUIState(appState.currentPlayingId, false);
  setMediaSessionPlaybackState("paused");
  stopSpectrumVisual();
  syncPlayerUI();
}

audioPlayer.addEventListener("error", () => {
  stopPlayback(true);
  showToast("Station unavailable.");
});
audioPlayer.addEventListener("ended", () => {
  stopPlayback();
});
audioPlayer.addEventListener("playing", () => {
  setMediaSessionPlaybackState("playing");
  updateMediaSession();
  startSpectrum();
});
audioPlayer.addEventListener("pause", () => {
  if (appState.currentPlayingId && audioPlayer.src) {
    setMediaSessionPlaybackState("paused");
  }
});

export function handlePlayButtonClick(e: Event, explicitButton?: HTMLElement) {
  e.preventDefault();
  e.stopPropagation();

  const button = (explicitButton || e.currentTarget) as HTMLButtonElement;
  const streamUrl = button.dataset.stream;
  const id = button.dataset.id;

  if (!id || !streamUrl) return;

  if (appState.currentPlayingId === id) {
    if (audioPlayer.paused) {
      audioPlayer.src = streamUrl;
      updateUIState(id, true);
      updateMediaSession();
      syncPlayerUI();
      audioPlayer.play().catch((err) => {
        console.error("Playback failed", err);
        stopPlayback(true);
        showToast("Could not play this station.");
      });
    } else {
      pausePlayback();
    }
    return;
  }

  stopPlayback();
  appState.currentPlayingId = id;
  audioPlayer.src = streamUrl;
  updateUIState(id, true);
  updateMediaSession();
  syncPlayerUI();

  audioPlayer.play().catch((err) => {
    console.error("Playback failed", err);
    stopPlayback(true);
    showToast("Could not play this station.");
  });
}

export function playStationById(id: string) {
  const station = appState.allStations.find((s: any) => s.id === id);
  if (!station?.streamUrl) return;
  const fakeBtn = document.createElement("button");
  fakeBtn.dataset.id = station.id;
  fakeBtn.dataset.stream = station.streamUrl;
  handlePlayButtonClick(new Event("click"), fakeBtn);
}

export function playRelativeInSelection(delta: number) {
  const pool =
    appState.favoriteIds.size > 0
      ? Array.from(appState.favoriteIds)
      : appState.currentPlayingId
        ? [appState.currentPlayingId]
        : [];
  if (!pool.length) return;

  const current = appState.currentPlayingId;
  let idx = current ? pool.indexOf(current) : -1;
  if (idx < 0) idx = 0;
  else idx = (idx + delta + pool.length) % pool.length;
  playStationById(pool[idx]);
}
