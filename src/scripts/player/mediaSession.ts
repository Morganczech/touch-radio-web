import { appState } from "../state/appState";
import {
  handlePlayButtonClick,
  pausePlayback,
  playRelativeInSelection,
} from "./audioPlayer";

function getStation() {
  const id = appState.currentPlayingId;
  if (!id) return null;
  return appState.allStations.find((s: any) => s.id === id) ?? null;
}

export function updateMediaSession() {
  if (!("mediaSession" in navigator)) return;

  const station = getStation();
  if (!station) {
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = "none";
    return;
  }

  const artwork: MediaImage[] = [];
  if (station.favicon) {
    artwork.push({
      src: station.favicon,
      sizes: "96x96",
      type: "image/png",
    });
  }
  artwork.push({
    src: "/logo.svg",
    sizes: "96x96",
    type: "image/svg+xml",
  });

  navigator.mediaSession.metadata = new MediaMetadata({
    title: station.name || "Touch Radio",
    artist: station.country
      ? `${station.country} · Live radio`
      : "Touch Radio",
    album: "Touch Radio",
    artwork,
  });
}

export function setMediaSessionPlaybackState(
  state: MediaSessionPlaybackState,
) {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.playbackState = state;
}

export function initMediaSession() {
  if (!("mediaSession" in navigator)) return;

  const playHandler = () => {
    const station = getStation();
    if (!station) return;
    const btn = document.createElement("button");
    btn.dataset.id = station.id;
    btn.dataset.stream = station.streamUrl;
    handlePlayButtonClick(new Event("click"), btn);
  };

  navigator.mediaSession.setActionHandler("play", playHandler);
  navigator.mediaSession.setActionHandler("pause", () => pausePlayback());
  navigator.mediaSession.setActionHandler("stop", () => pausePlayback());
  navigator.mediaSession.setActionHandler("previoustrack", () =>
    playRelativeInSelection(-1),
  );
  navigator.mediaSession.setActionHandler("nexttrack", () =>
    playRelativeInSelection(1),
  );

  try {
    navigator.mediaSession.setActionHandler("seekto", null);
    navigator.mediaSession.setActionHandler("seekbackward", null);
    navigator.mediaSession.setActionHandler("seekforward", null);
  } catch {
    // Unsupported action handlers on some browsers
  }
}
