import { appState } from "../state/appState";
import { getFlag } from "../utils/flags";

export function renderStationHTML(station: any): string {
    const flag = getFlag(station.country);
    const isFavorite = appState.favoriteIds.has(station.id);
    const isPlaying = appState.currentPlayingId === station.id;
    const playingClass = isPlaying ? "is-playing" : "";
    const favoriteClass = isFavorite ? "is-favorite" : "";
    const codec = (station.codec || "—").toString().toUpperCase();
    const bitrate = station.bitrate ? `${station.bitrate} kbps` : "";

    return `
    <li data-name="${station.name.toLowerCase()}" class="station-item">
        <div class="station-card ${playingClass} ${favoriteClass}">
            <div class="card-content">
                <div class="card-top">
                    <div class="card-identity">
                        <div class="icon-wrap">
                            <img
                                src="/station-placeholder.svg"
                                data-favicon="${station.favicon || ""}"
                                alt=""
                                class="station-icon"
                            />
                            <span class="stream-dot pulse-live" aria-hidden="true"></span>
                        </div>
                        <div class="card-copy">
                            <strong class="station-name">${station.name}</strong>
                            <div class="station-info">
                                <span class="flag-placeholder">${flag}</span>
                                <span class="country-name">${station.country || "Unknown"}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button
                            type="button"
                            class="favorite-btn ${isFavorite ? "is-favorite" : ""}"
                            data-favorite-id="${station.id}"
                            data-active="${isFavorite ? "true" : "false"}"
                            aria-label="Toggle favorite"
                            aria-pressed="${isFavorite ? "true" : "false"}"
                            title="Add to favorites"
                        >
                            <span class="heart-icon" aria-hidden="true"></span>
                        </button>
                    </div>
                </div>

                <div class="station-tech">
                    <div class="tech-left">
                        <span class="badge">${codec}</span>
                        <span class="bitrate">${bitrate}</span>
                    </div>
                    <button
                        class="play-btn"
                        data-stream="${station.streamUrl}"
                        data-id="${station.id}"
                        title="Play station"
                        type="button"
                    >
                        <span class="play-icon-container">
                            <svg class="svg-icon icon-play" viewBox="0 0 24 24" width="20" height="20">
                                <path d="M8 5v14l11-7z"></path>
                            </svg>
                            <svg class="svg-icon icon-pause" viewBox="0 0 24 24" width="20" height="20">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                            </svg>
                        </span>
                        <span class="equalizer" aria-hidden="true">
                            <span class="bar"></span>
                            <span class="bar"></span>
                            <span class="bar"></span>
                        </span>
                    </button>
                    <span class="streaming-label">STREAMING</span>
                    <span class="error-text">Stream unavailable</span>
                </div>
            </div>
        </div>
    </li>
    `;
}
