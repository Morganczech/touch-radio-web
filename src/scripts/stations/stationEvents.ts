import { appState } from "../state/appState";
import { updateUI } from "../selection/selectionManager";
import { handlePlayButtonClick } from "../player/audioPlayer";

export function attachDynamicListeners() {
    // Checkboxes
    const newCheckboxes = document.querySelectorAll(
        'input[type="checkbox"][data-id]',
    );
    newCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", (event) => {
            const target = event.target as HTMLInputElement;
            const id = target.dataset.id;
            if (id) {
                if (target.checked) {
                    appState.selectedIds.add(id);
                } else {
                    appState.selectedIds.delete(id);
                }
                updateUI();
            }
        });
    });

    // Play Buttons
    const newPlayButtons = document.querySelectorAll(".play-btn");
    newPlayButtons.forEach((btn) => {
        btn.addEventListener("click", handlePlayButtonClick);
    });

    // Favicons
    const newImages = document.querySelectorAll(
        "img[data-favicon]",
    ) as NodeListOf<HTMLImageElement>;
    newImages.forEach((img) => {
        const faviconUrl = img.dataset.favicon;
        if (faviconUrl) {
            const tempImg = new Image();
            tempImg.onload = () => {
                img.src = faviconUrl;
            };
            // Handle error silently
            tempImg.src = faviconUrl;
        }
    });
}
