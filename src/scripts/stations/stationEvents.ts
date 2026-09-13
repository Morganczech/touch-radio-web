import { handlePlayButtonClick } from "../player/audioPlayer";
import { toggleFavorite } from "../favorites/favoritesManager";

let listenersAttached = false;

export function attachDynamicListeners() {
  if (!listenersAttached) {
    const stationGrid = document.getElementById("station-grid");

    if (!stationGrid) {
      console.warn("station-grid not found, cannot attach listeners");
      return;
    }

    stationGrid.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;

      const favoriteBtn = target.closest(".favorite-btn") as HTMLElement | null;
      if (favoriteBtn?.dataset.favoriteId) {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(favoriteBtn.dataset.favoriteId);
        (window as any).__touchRadioSyncPlayerUI?.();
        return;
      }

      const playBtn = target.closest(".play-btn") as HTMLElement | null;
      if (playBtn) {
        handlePlayButtonClick(event, playBtn);
      }
    });

    listenersAttached = true;
  }

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
      tempImg.src = faviconUrl;
    }
  });
}
