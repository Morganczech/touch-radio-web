import { openFavoritesSheet } from "../selection/selectionManager";

export function initMobileNav() {
  document.getElementById("mn-favorites")?.addEventListener("click", () => {
    openFavoritesSheet();
    document.querySelectorAll("[data-mn]").forEach((item) => {
      const key = (item as HTMLElement).dataset.mn;
      item.classList.toggle("is-active", key === "favorites");
    });
  });

  document.getElementById("mn-discover")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll("[data-mn]").forEach((item) => {
      const key = (item as HTMLElement).dataset.mn;
      item.classList.toggle("is-active", key === "discover");
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("mn-countries")?.addEventListener("click", () => {
    document.querySelectorAll("[data-mn]").forEach((item) => {
      const key = (item as HTMLElement).dataset.mn;
      item.classList.toggle("is-active", key === "countries");
    });
    const btn = document.getElementById("toggle-filters-btn");
    const panel = document.getElementById("filters-panel");
    if (panel && !panel.classList.contains("expanded")) btn?.click();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => document.getElementById("country-filter")?.focus(), 300);
  });
}
