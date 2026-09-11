import { appState } from "../state/appState";
import { getFlag } from "../utils/flags";
import { handlePlayButtonClick, stopPlayback } from "../player/audioPlayer";

const SELECTION_STORAGE_KEY = "touch-radio-selection";

export function loadSelection() {
    try {
        const storedSelection = localStorage.getItem(SELECTION_STORAGE_KEY);
        if (!storedSelection) return;

        const selectedIds = JSON.parse(storedSelection);
        if (Array.isArray(selectedIds)) {
            selectedIds
                .filter((id): id is string => typeof id === "string")
                .forEach((id) => appState.selectedIds.add(id));
        }
    } catch (error) {
        console.warn("Could not load saved station selection:", error);
    }
}

export function persistSelection() {
    try {
        localStorage.setItem(
            SELECTION_STORAGE_KEY,
            JSON.stringify(Array.from(appState.selectedIds)),
        );
    } catch (error) {
        console.warn("Could not save station selection:", error);
    }
}

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

export function updateUI() {
    const count = appState.selectedIds.size;
    console.log("updateUI called, selectedIds count:", count, "IDs:", Array.from(appState.selectedIds));

    // Update all count displays
    const countSpans = document.querySelectorAll(".js-selection-count");
    countSpans.forEach(span => {
        span.textContent = count.toString();
    });

    // Update buttons state
    const buttonSelectors = [
        ".js-clear-all-btn",
        ".js-share-playlist-btn",
        ".js-export-btn",
        ".js-export-m3u-btn",
        ".js-export-m3u8-btn",
        ".js-export-pls-btn"
    ];

    const isDisabled = count === 0;

    buttonSelectors.forEach(selector => {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(btn => {
            if (isDisabled) {
                btn.setAttribute("disabled", "true");
            } else {
                btn.removeAttribute("disabled");
            }
        });
    });

    // Update FAB Visibility (Mobile)
    const fab = document.getElementById("selection-fab");
    if (fab) {
        if (count === 0) {
            fab.classList.add("hidden");
        } else {
            fab.classList.remove("hidden");
        }
    }

    // Update Selection Panels (Mobile & Desktop)
    const selectionLists = document.querySelectorAll(".js-selection-list");
    selectionLists.forEach(selectionList => {
        selectionList.innerHTML = "";
        if (count === 0) {
            selectionList.innerHTML = '<p class="empty-state">No stations selected</p>';
        } else {
            const selectedStations = appState.allStations.filter((s: any) =>
                appState.selectedIds.has(s.id),
            );

            selectedStations.forEach((station: any) => {
                const item = document.createElement("div");
                item.className = "selected-item";
                if (selectionList.id === "selection-list-mobile") {
                    item.classList.add("mobile-selected-item");
                    item.setAttribute("role", "button");
                    item.setAttribute("tabindex", "0");
                    item.setAttribute("aria-label", `Play ${station.name}`);
                }
                const flag = getFlag(station.country);
                const isPlaying = appState.currentPlayingId === station.id;
                if (isPlaying) {
                    item.classList.add("is-playing");
                }
                item.innerHTML = `
                <div class="selected-item-info">
                    <div class="selected-item-name">${flag} ${station.name}</div>
                    <div class="selected-item-meta">
                        ${station.codec} • ${station.bitrate}kbps
                        <button
                            class="play-btn sidebar-play-btn"
                            data-stream="${station.streamUrl}"
                            data-id="${station.id}"
                            title="Preview station"
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
                <button class="remove-btn" data-remove-id="${station.id}" title="Remove from selection">❤️</button>
            `;
                selectionList.appendChild(item);
            });

            if (selectionList.id === "selection-list-mobile") {
                selectionList.querySelectorAll(".mobile-selected-item").forEach((item) => {
                    const stationItem = item as HTMLElement;
                    const playButton = stationItem.querySelector(
                        ".sidebar-play-btn",
                    ) as HTMLElement | null;
                    if (!playButton) return;

                    const playStation = (event: Event) => {
                        handlePlayButtonClick(event, playButton);
                    };
                    stationItem.addEventListener("click", (event) => {
                        const target = event.target as HTMLElement;
                        if (target.closest("button")) return;
                        playStation(event);
                    });
                    stationItem.addEventListener("keydown", (event) => {
                        if (event instanceof KeyboardEvent && (event.key === "Enter" || event.key === " ")) {
                            event.preventDefault();
                            playStation(event);
                        }
                    });
                });
            }

            // Add event listeners for remove buttons within this specific list
            selectionList.querySelectorAll(".remove-btn").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    const target = e.currentTarget as HTMLButtonElement;
                    const idToRemove = target.dataset.removeId;
                    if (idToRemove) {
                        // If this station is currently playing, stop it
                        if (appState.currentPlayingId === idToRemove) {
                            stopPlayback();
                        }

                        // Update State
                        appState.selectedIds.delete(idToRemove);
                        persistSelection();

                        // Update UI (Recursive call effectively)
                        updateUI();

                        // Sync Checkbox if visible
                        const checkbox = document.querySelector(
                            `input[type="checkbox"][data-id="${idToRemove}"]`
                        ) as HTMLInputElement;
                        if (checkbox) {
                            checkbox.checked = false;
                        }
                    }
                });
            });

            // Add event listeners for play buttons within this specific list
            selectionList.querySelectorAll(".sidebar-play-btn").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    handlePlayButtonClick(e);
                });
            });
        }
    });
}

export function initSelection() {
    loadSelection();

    // Clear All buttons
    document.querySelectorAll(".js-clear-all-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            // Stop playback if any station is playing
            if (appState.currentPlayingId) {
                stopPlayback();
            }

            // Clear all selections
            appState.selectedIds.clear();
            persistSelection();

            // Uncheck all checkboxes
            document.querySelectorAll('.station-checkbox:checked').forEach((checkbox) => {
                (checkbox as HTMLInputElement).checked = false;
            });

            // Update UI
            updateUI();
        });
    });

    // Share Playlist buttons
    document.querySelectorAll(".js-share-playlist-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const { sharePlaylist } = await import("../utils/sharePlaylist");
            const { showToast } = await import("../utils/toast");

            try {
                const success = await sharePlaylist();
                if (success) {
                    showToast("✓ Link copied to clipboard!");
                }
            } catch (error) {
                if (error instanceof Error) {
                    showToast("⚠ " + error.message);
                } else {
                    showToast("⚠ Failed to share playlist");
                }
            }
        });
    });

    // Export JSON buttons
    document.querySelectorAll(".js-export-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (appState.selectedIds.size === 0) {
                alert("No stations selected.");
                return;
            }
            const selectedStations = appState.allStations.filter((station: any) =>
                appState.selectedIds.has(station.id),
            );
            const jsonString = JSON.stringify(selectedStations, null, 2);
            downloadFile(jsonString, "selected_stations.json", "application/json");
        });
    });

    // Export M3U buttons
    document.querySelectorAll(".js-export-m3u-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (appState.selectedIds.size === 0) {
                alert("No stations selected.");
                return;
            }
            const selectedStations = appState.allStations.filter((station: any) =>
                appState.selectedIds.has(station.id),
            );
            let m3uContent = "#EXTM3U\n";
            selectedStations.forEach((station: any) => {
                m3uContent += `#EXTINF:-1,${station.name}\n${station.streamUrl}\n`;
            });
            downloadFile(m3uContent, "selected_stations.m3u", "text/plain");
        });
    });

    // Export M3U8 buttons
    document.querySelectorAll(".js-export-m3u8-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (appState.selectedIds.size === 0) {
                alert("No stations selected.");
                return;
            }
            const selectedStations = appState.allStations.filter((station: any) =>
                appState.selectedIds.has(station.id),
            );
            let m3uContent = "#EXTM3U\n";
            selectedStations.forEach((station: any) => {
                m3uContent += `#EXTINF:-1,${station.name}\n${station.streamUrl}\n`;
            });
            downloadFile(m3uContent, "selected_stations.m3u8", "text/plain;charset=utf-8");
        });
    });

    // Export PLS buttons
    document.querySelectorAll(".js-export-pls-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (appState.selectedIds.size === 0) {
                alert("No stations selected.");
                return;
            }
            const selectedStations = appState.allStations.filter((station: any) =>
                appState.selectedIds.has(station.id),
            );
            let plsContent = "[playlist]\n";
            plsContent += `NumberOfEntries=${selectedStations.length}\n`;
            selectedStations.forEach((station: any, index: number) => {
                const i = index + 1;
                plsContent += `File${i}=${station.streamUrl}\n`;
                plsContent += `Title${i}=${station.name}\n`;
                plsContent += `Length${i}=-1\n`;
            });
            plsContent += "Version=2\n";
            downloadFile(plsContent, "selected_stations.pls", "text/plain");
        });
    });

    // Mobile Modal Controls
    const fab = document.getElementById("selection-fab");
    const modal = document.getElementById("selection-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const modalBackdrop = modal?.querySelector(".modal-backdrop");

    if (fab && modal) {
        fab.addEventListener("click", () => {
            modal.classList.add("open");
            document.body.style.overflow = "hidden"; // Prevent background scroll
        });
    }

    // Helper function for smooth modal closing
    const closeModal = () => {
        const modalContent = modal?.querySelector(".modal-content");
        if (modalContent && modal) {
            modalContent.classList.add("closing");
            setTimeout(() => {
                modal.classList.remove("open");
                modalContent.classList.remove("closing");
                document.body.style.overflow = ""; // Restore scroll
            }, 300); // Match animation duration
        }
    };

    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener("click", closeModal);
    }

    if (modalBackdrop && modal) {
        modalBackdrop.addEventListener("click", closeModal);
    }
}
