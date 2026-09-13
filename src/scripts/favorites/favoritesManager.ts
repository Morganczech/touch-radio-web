import { appState } from "../state/appState";

const FAVORITES_STORAGE_KEY = "touch-radio-favorites";
const SELECTION_STORAGE_KEY = "touch-radio-selection";
const MERGED_KEY = "touch-radio-favorites-merged-v2";

function readIdArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function loadFavorites() {
  try {
    const favIds = readIdArray(localStorage.getItem(FAVORITES_STORAGE_KEY));
    const selectionIds = readIdArray(localStorage.getItem(SELECTION_STORAGE_KEY));

    // One-time merge: old playlist selection → favorites
    if (localStorage.getItem(MERGED_KEY) !== "1") {
      const merged = new Set([...favIds, ...selectionIds]);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(merged)));
      localStorage.removeItem(SELECTION_STORAGE_KEY);
      localStorage.setItem(MERGED_KEY, "1");
      merged.forEach((id) => appState.favoriteIds.add(id));
      return;
    }

    favIds.forEach((id) => appState.favoriteIds.add(id));
  } catch (error) {
    console.warn("Could not load favorites:", error);
  }
}

export function persistFavorites() {
  try {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(Array.from(appState.favoriteIds)),
    );
  } catch (error) {
    console.warn("Could not save favorites:", error);
  }
}

export function isFavorite(id: string) {
  return appState.favoriteIds.has(id);
}

export function toggleFavorite(id: string): boolean {
  if (appState.favoriteIds.has(id)) {
    appState.favoriteIds.delete(id);
  } else {
    appState.favoriteIds.add(id);
  }
  persistFavorites();
  syncFavoriteUI(id);
  // Keep Favorites sheet in sync
  import("../selection/selectionManager")
    .then((m) => m.updateUI())
    .catch(() => {});
  return appState.favoriteIds.has(id);
}

export function syncFavoriteUI(id?: string) {
  const nodes = id
    ? document.querySelectorAll(`[data-favorite-id="${id}"]`)
    : document.querySelectorAll("[data-favorite-id]");

  nodes.forEach((node) => {
    const favId = (node as HTMLElement).dataset.favoriteId;
    if (!favId) return;
    const active = appState.favoriteIds.has(favId);
    node.classList.toggle("is-favorite", active);
    if (node instanceof HTMLElement) {
      node.dataset.active = active ? "true" : "false";
      node.setAttribute("aria-pressed", active ? "true" : "false");
    }
    const card = node.closest(".station-card");
    card?.classList.toggle("is-favorite", active);
  });

  document.querySelectorAll("[data-player-favorite]").forEach((btn) => {
    const stationId =
      (btn as HTMLElement).dataset.id || appState.currentPlayingId || "";
    const active = stationId ? appState.favoriteIds.has(stationId) : false;
    (btn as HTMLElement).dataset.active = active ? "true" : "false";
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    btn.classList.toggle("is-favorite", active);
  });

  const count = appState.favoriteIds.size;
  document.querySelectorAll("[data-favorites-count]").forEach((el) => {
    el.textContent = String(count);
    if (el instanceof HTMLElement && el.hasAttribute("data-hide-when-empty")) {
      el.hidden = count === 0;
    }
  });
}
