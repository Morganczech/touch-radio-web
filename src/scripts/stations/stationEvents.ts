import { appState } from "../state/appState";
import { updateUI } from "../selection/selectionManager";
import { handlePlayButtonClick } from "../player/audioPlayer";

// Track if listeners are attached to avoid duplicates
let listenersAttached = false;

export function attachDynamicListeners() {
    // Set up event delegation only once
    if (!listenersAttached) {
        const stationGrid = document.getElementById("station-grid");

        if (!stationGrid) {
            console.warn("station-grid not found, cannot attach listeners");
            return;
        }

        console.log("Attaching event delegation listeners to station-grid");

        // Event delegation for checkboxes
        stationGrid.addEventListener("change", (event) => {
            const target = event.target as HTMLElement;
            console.log("Change event detected:", target);

            if (target instanceof HTMLInputElement &&
                target.type === "checkbox" &&
                target.dataset.id) {
                const id = target.dataset.id;
                console.log(`Checkbox ${id} changed to:`, target.checked);

                if (target.checked) {
                    appState.selectedIds.add(id);
                } else {
                    appState.selectedIds.delete(id);
                }
                updateUI();
            }
        });

        // Event delegation for play buttons
        stationGrid.addEventListener("click", (event) => {
            const target = event.target as HTMLElement;
            const playBtn = target.closest(".play-btn") as HTMLElement;
            if (playBtn) {
                handlePlayButtonClick(event, playBtn);
            }
        });

        listenersAttached = true;
        console.log("Event delegation listeners attached successfully");
    }

    // Favicons - these still need to be processed for each render
    const newImages = document.querySelectorAll(
        "img[data-favicon]",
    ) as NodeListOf<HTMLImageElement>;
    newImages.forEach((img) => {
        const faviconUrl = img.dataset.favicon;
        if (faviconUrl && img.src.includes("placeholder")) {
            const tempImg = new Image();
            tempImg.onload = () => {
                img.src = faviconUrl;
            };
            // Handle error silently
            tempImg.src = faviconUrl;
        }
    });
}
