import { appState } from "../state/appState";

export const audioPlayer = new Audio();

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
            audioPlayer.play().catch((err) => {
                console.error("Playback failed", err);
                stopPlayback(true);
            });
            updateUIState(id, true);
        } else {
            stopPlayback();
        }
    } else {
        // Stop previous
        stopPlayback();

        // Play new
        appState.currentPlayingId = id;
        audioPlayer.src = streamUrl;

        audioPlayer.play().catch((err) => {
            console.error("Playback failed", err);
            stopPlayback(true);
        });

        updateUIState(id, true);
    }
}
