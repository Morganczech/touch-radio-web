import { appState } from "../state/appState";
import { getFlag } from "../utils/flags";
import { handlePlayButtonClick, stopPlayback } from "../player/audioPlayer";
import { persistFavorites, syncFavoriteUI } from "../favorites/favoritesManager";
import { lockBodyScroll, unlockBodyScroll } from "../utils/scrollLock";

export function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function favoriteStations() {
    return appState.allStations.filter((s: any) =>
        appState.favoriteIds.has(s.id),
    );
}

export function updateUI() {
    const count = appState.favoriteIds.size;
    const stations = favoriteStations();

    document.querySelectorAll("[data-favorites-count]").forEach((el) => {
        el.textContent = count.toString();
        if (el instanceof HTMLElement && el.hasAttribute("data-hide-when-empty")) {
            el.hidden = count === 0;
        }
    });

    const totalBitrate = stations.reduce(
        (sum: number, s: any) => sum + (Number(s.bitrate) || 0),
        0,
    );
    document.querySelectorAll("[data-selection-bandwidth]").forEach((el) => {
        el.textContent =
            count === 0
                ? "0 kbps combined"
                : `${totalBitrate.toLocaleString("en-US")} kbps combined`;
    });

    const buttonSelectors = [
        ".js-clear-all-btn",
        ".js-share-playlist-btn",
        ".js-export-btn",
        ".js-export-m3u-btn",
        ".js-export-m3u8-btn",
        ".js-export-pls-btn",
    ];
    const isDisabled = count === 0;
    buttonSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((btn) => {
            if (isDisabled) btn.setAttribute("disabled", "true");
            else btn.removeAttribute("disabled");
        });
    });

    const selectionLists = document.querySelectorAll(".js-selection-list");
    selectionLists.forEach((selectionList) => {
        selectionList.innerHTML = "";
        if (count === 0) {
            selectionList.innerHTML =
                '<p class="empty-state">No favorites yet — tap ♥ on a station</p>';
            return;
        }

        stations.forEach((station: any) => {
            const item = document.createElement("div");
            item.className = "selected-item";
            const flag = getFlag(station.country);
            const isPlaying = appState.currentPlayingId === station.id;
            if (isPlaying) item.classList.add("is-playing");

            const isMobileList = selectionList.id === "selection-list-mobile";
            if (isMobileList) {
                item.classList.add("mobile-selected-item");
                const codec = (station.codec || "—").toString().toUpperCase();
                const bitrate = station.bitrate ? `${station.bitrate} kbps` : "—";
                item.innerHTML = `
                    <div class="msi-main">
                        <div class="msi-identity">
                            <span class="msi-flag" aria-hidden="true">${flag}</span>
                            <div class="msi-copy">
                                <div class="selected-item-name">${station.name}</div>
                                <div class="selected-item-meta">${codec} · ${bitrate}</div>
                            </div>
                        </div>
                        <div class="msi-actions">
                            <button
                                class="play-btn sidebar-play-btn msi-play"
                                data-stream="${station.streamUrl}"
                                data-id="${station.id}"
                                title="Play station"
                                type="button"
                                aria-label="${isPlaying ? "Pause" : "Play"} ${station.name}"
                            >
                                <span class="play-icon-container">
                                    <svg class="svg-icon selection-control-icon" viewBox="0 0 24 24" width="28" height="28">
                                        ${isPlaying
                                            ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>'
                                            : '<path d="M8 5v14l11-7z"></path>'}
                                    </svg>
                                </span>
                                <span class="msi-play-label">${isPlaying ? "Pause" : "Play"}</span>
                            </button>
                            <button
                                class="remove-btn msi-remove"
                                data-remove-id="${station.id}"
                                title="Remove from favorites"
                                type="button"
                                aria-label="Remove ${station.name}"
                            >Remove</button>
                        </div>
                    </div>
                    `;
            } else {
                item.innerHTML = `
                    <div class="selected-item-info">
                        <div class="selected-item-name">${flag} ${station.name}</div>
                        <div class="selected-item-meta">
                            ${(station.codec || "—").toString().toUpperCase()} · ${station.bitrate || "—"} kbps
                            <button
                                class="play-btn sidebar-play-btn"
                                data-stream="${station.streamUrl}"
                                data-id="${station.id}"
                                title="Play station"
                                type="button"
                            >
                                <span class="play-icon-container">
                                    <svg class="svg-icon selection-control-icon" viewBox="0 0 24 24" width="20" height="20">
                                        ${isPlaying
                                            ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>'
                                            : '<path d="M8 5v14l11-7z"></path>'}
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                    <button class="remove-btn" data-remove-id="${station.id}" title="Remove from favorites" type="button" aria-label="Remove">✕</button>
                    `;
            }
            selectionList.appendChild(item);
        });

        selectionList.querySelectorAll(".remove-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const target = e.currentTarget as HTMLButtonElement;
                const idToRemove = target.dataset.removeId;
                if (!idToRemove) return;

                if (appState.currentPlayingId === idToRemove) {
                    stopPlayback();
                }

                appState.favoriteIds.delete(idToRemove);
                persistFavorites();
                syncFavoriteUI(idToRemove);
                updateUI();
            });
        });

        selectionList.querySelectorAll(".sidebar-play-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                handlePlayButtonClick(e);
            });
        });
    });

    (window as any).__touchRadioSyncPlayerUI?.();
}

export function initSelection() {
    document.querySelectorAll(".js-clear-all-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (appState.currentPlayingId) {
                stopPlayback();
            }
            appState.favoriteIds.clear();
            persistFavorites();
            syncFavoriteUI();
            updateUI();
        });
    });

    document.querySelectorAll(".js-share-playlist-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const { copyShareLink } = await import("../utils/sharePlaylist");
            const { showToast } = await import("../utils/toast");

            try {
                if (appState.favoriteIds.size === 0) {
                    showToast("⚠ Favorite at least one station first");
                    return;
                }
                const success = await copyShareLink();
                if (success) {
                    showToast("✓ Favorites link copied to clipboard");
                } else {
                    showToast("⚠ Could not copy link — try again");
                }
            } catch (error) {
                if (error instanceof Error) {
                    showToast("⚠ " + error.message);
                } else {
                    showToast("⚠ Failed to share favorites");
                }
            }
        });
    });

    document.querySelectorAll(".js-export-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (appState.favoriteIds.size === 0) {
                alert("No favorites yet.");
                return;
            }
            const stations = favoriteStations();
            downloadFile(
                JSON.stringify(stations, null, 2),
                "favorites.json",
                "application/json",
            );
        });
    });

    document.querySelectorAll(".js-export-m3u-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (appState.favoriteIds.size === 0) {
                alert("No favorites yet.");
                return;
            }
            let m3uContent = "#EXTM3U\n";
            favoriteStations().forEach((station: any) => {
                m3uContent += `#EXTINF:-1,${station.name}\n${station.streamUrl}\n`;
            });
            downloadFile(m3uContent, "favorites.m3u", "text/plain");
        });
    });

    document.querySelectorAll(".js-export-m3u8-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (appState.favoriteIds.size === 0) {
                alert("No favorites yet.");
                return;
            }
            let m3uContent = "#EXTM3U\n";
            favoriteStations().forEach((station: any) => {
                m3uContent += `#EXTINF:-1,${station.name}\n${station.streamUrl}\n`;
            });
            downloadFile(m3uContent, "favorites.m3u8", "text/plain;charset=utf-8");
        });
    });

    document.querySelectorAll(".js-export-pls-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (appState.favoriteIds.size === 0) {
                alert("No favorites yet.");
                return;
            }
            const stations = favoriteStations();
            let plsContent = "[playlist]\n";
            plsContent += `NumberOfEntries=${stations.length}\n`;
            stations.forEach((station: any, index: number) => {
                const i = index + 1;
                plsContent += `File${i}=${station.streamUrl}\n`;
                plsContent += `Title${i}=${station.name}\n`;
                plsContent += `Length${i}=-1\n`;
            });
            plsContent += "Version=2\n";
            downloadFile(plsContent, "favorites.pls", "text/plain");
        });
    });

    const modal = document.getElementById("selection-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const modalBackdrop = modal?.querySelector(".modal-backdrop");

    const closeModal = () => {
        const modalContent = modal?.querySelector(".modal-content");
        if (modalContent && modal) {
            modalContent.classList.add("closing");
            setTimeout(() => {
                modal.classList.remove("open");
                modalContent.classList.remove("closing");
                unlockBodyScroll();
            }, 300);
        }
    };

    closeModalBtn?.addEventListener("click", closeModal);
    modalBackdrop?.addEventListener("click", closeModal);

    updateUI();
}

/** Open Favorites sheet (mobile) or scroll to sidebar (desktop) */
export function openSelectionModal() {
    const modal = document.getElementById("selection-modal");
    if (!modal) return;

    const isMobile = window.matchMedia("(max-width: 1024px)").matches;
    if (!isMobile) {
        document.getElementById("selection")?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
        });
        return;
    }

    updateUI();
    modal.classList.add("open");
    lockBodyScroll();
    const list = document.getElementById("selection-list-mobile");
    if (list) list.scrollTop = 0;
}

export const openFavoritesSheet = openSelectionModal;
