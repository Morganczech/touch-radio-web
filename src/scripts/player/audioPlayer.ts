import { appState } from "../state/appState";

export const audioPlayer = new Audio();

export function stopPlayback(isError = false) {
    audioPlayer.pause();
    audioPlayer.src = "";

    if (appState.currentPlayingId) {
        // Find the button by ID since references might be stale if re-rendered
        const btn = document.querySelector(`.play-btn[data-id="${appState.currentPlayingId}"]`);
        if (btn) {
            const stationCard = btn.closest(".station-card");
            if (stationCard) {
                stationCard.classList.remove("is-playing");
                if (isError) {
                    stationCard.classList.add("is-error");
                    // Wait 2.5s showing the error state
                    setTimeout(() => {
                        // Start fade out
                        stationCard.classList.add("is-fading-out");
                        // After animation (300ms), remove from flow
                        setTimeout(() => {
                            const stationItem = stationCard.closest("li.station-item");
                            if (stationItem) {
                                // Remove from selection if present
                                const checkbox = stationCard.querySelector(".station-checkbox") as HTMLInputElement;
                                if (checkbox && checkbox.checked) {
                                    checkbox.checked = false;
                                    // Dispatch event so selection manager updates UI
                                    checkbox.dispatchEvent(new Event("change"));
                                }
                                // Permanently remove from DOM
                                stationItem.remove();
                            }
                        }, 300);
                    }, 2500);
                }
            }
        }

        // Also update sidebar items
        const sidebarItem = document.querySelector(`.selected-item.is-playing`);
        if (sidebarItem) {
            sidebarItem.classList.remove("is-playing");
        }

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

    if (appState.currentPlayingId === id) {
        // Toggle Pause
        if (audioPlayer.paused) {
            // Clear any previous error state
            const stationCard = button.closest(".station-card");
            if (stationCard) stationCard.classList.remove("is-error");

            audioPlayer.play().catch((err) => {
                console.error("Playback failed", err);
                stopPlayback(true);
            });
            if (stationCard) stationCard.classList.add("is-playing");
        } else {
            stopPlayback();
        }
    } else {
        // Stop previous
        stopPlayback();

        // Play new
        if (streamUrl && id) {
            appState.currentPlayingId = id;
            audioPlayer.src = streamUrl;

            // Clear any previous error state on new item
            const stationCard = button.closest(".station-card");
            if (stationCard) stationCard.classList.remove("is-error");

            audioPlayer.play().catch((err) => {
                console.error("Playback failed", err);
                stopPlayback(true);
            });

            if (stationCard) stationCard.classList.add("is-playing");
        }
    }
}
