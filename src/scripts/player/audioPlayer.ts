import { appState } from "../state/appState";
import { showToast } from "../utils/toast";

export const audioPlayer = new Audio();
audioPlayer.preload = "none";

function updatePlaybackIcon(id: string, isPlaying: boolean) {
    const buttons = document.querySelectorAll(`.play-btn[data-id="${id}"]`);
    buttons.forEach((button) => {
        const icon = button.querySelector(".selection-control-icon");
        if (!icon) return;

        icon.innerHTML = isPlaying
            ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>'
            : '<path d="M8 5v14l11-7z"></path>';
    });
}

// Helper to update UI state for a specific station ID
function updateUIState(id: string, isPlaying: boolean, isError = false) {
    // Find all play buttons for this ID (in grid AND sidebar(s))
    const buttons = document.querySelectorAll(
        `.play-btn[data-id="${id}"]`
    );

    buttons.forEach((btn) => {
        // Handle Station Cards (Grid)
        const stationCard = btn.closest(".station-card");
        if (stationCard) {
            if (isPlaying) {
                stationCard.classList.add("is-playing");
                stationCard.classList.remove("is-error");
            } else {
                stationCard.classList.remove("is-playing");
                if (isError) {
                    stationCard.classList.add("is-error");
                    // Error animation sequence
                    setTimeout(() => {
                        stationCard.classList.add("is-fading-out");
                        setTimeout(() => {
                            const stationItem = stationCard.closest("li.station-item");
                            if (stationItem) {
                                const checkbox = stationCard.querySelector(".station-checkbox") as HTMLInputElement;
                                if (checkbox && checkbox.checked) {
                                    checkbox.checked = false;
                                    checkbox.dispatchEvent(new Event("change"));
                                }
                                stationItem.remove();
                            }
                        }, 300);
                    }, 2500);
                }
            }
        }

        // Handle Sidebar Items (Selection)
        // Note: Sidebar buttons have class .sidebar-play-btn and are inside .selected-item
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
    audioPlayer.src = "";

    if (appState.currentPlayingId) {
        updateUIState(appState.currentPlayingId, false, isError);
        appState.currentPlayingId = null;
    }
}

// Handle audio errors/end
audioPlayer.addEventListener("error", () => {
    stopPlayback(true);
    showToast("Stanice není dostupná.");
});
audioPlayer.addEventListener("ended", () => {
    stopPlayback();
});

export function handlePlayButtonClick(e: Event, explicitButton?: HTMLElement) {
    e.preventDefault();
    e.stopPropagation(); // Prevent card click (selection)

    const button = (explicitButton || e.currentTarget) as HTMLButtonElement;
    const streamUrl = button.dataset.stream;
    const id = button.dataset.id;

    if (!id || !streamUrl) return;

    if (appState.currentPlayingId === id) {
        // Toggle Pause
        if (audioPlayer.paused) {
            updateUIState(id, true);
            audioPlayer.play().catch((err) => {
                console.error("Playback failed", err);
                stopPlayback(true);
                showToast("Stanici se nepodařilo přehrát.");
            });
        } else {
            stopPlayback();
        }
    } else {
        // Stop previous
        stopPlayback();

        // Play new
        appState.currentPlayingId = id;
        audioPlayer.src = streamUrl;
        updateUIState(id, true);

        audioPlayer.play().catch((err) => {
            console.error("Playback failed", err);
            stopPlayback(true);
            showToast("Stanici se nepodařilo přehrát.");
        });
    }
}
