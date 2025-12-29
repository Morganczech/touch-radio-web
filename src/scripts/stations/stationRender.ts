import { appState } from "../state/appState";
import { getFlag } from "../utils/flags";

export function renderStationHTML(station: any): string {
    const flag = getFlag(station.country);
    const isSelected = appState.selectedIds.has(station.id) ? "checked" : "";

    const isPlaying = appState.currentPlayingId === station.id;
    const playingClass = isPlaying ? "is-playing" : "";

    return `
    <li
        data-name="${station.name.toLowerCase()}"
        class="station-item"
    >
        <label class="station-card ${playingClass}">
            <input type="checkbox" data-id="${station.id}" class="station-checkbox" ${isSelected} />
            <div class="card-content">
                <div class="card-header">
                    <img
                        src="/station-placeholder.svg"
                        data-favicon="${station.favicon}"
                        alt="${station.name}"
                        class="station-icon"
                    />
                    <div class="equalizer">
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                    </div>
                    <span class="heart-icon" aria-hidden="true"></span>
                </div>

                <div class="card-body">
                    <strong class="station-name">${station.name}</strong>
                    <div class="station-info">
                        <span class="flag-placeholder">${flag}</span>
                        <span class="country-name">${station.country}</span>
                    </div>

                    <div class="station-tech">
                        <span class="badge">${station.codec}</span>
                        <button
                            class="play-btn"
                            data-stream="${station.streamUrl}"
                            data-id="${station.id}"
                            title="Preview station"
                        >
                            <span class="play-icon-container">
                                <svg class="svg-icon icon-play" viewBox="0 0 24 24" width="24" height="24">
                                    <path d="M8 5v14l11-7z"></path>
                                </svg>
                                <svg class="svg-icon icon-pause" viewBox="0 0 24 24" width="24" height="24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                                </svg>
                            </span>
                        </button>
                        <span class="bitrate">${station.bitrate} kbps</span>
                        <span class="error-text">Stream unavailable</span>
                    </div>
                </div>
            </div>
        </label>
    </li>
    `;
}
