import { appState, PAGE_SIZE } from "../state/appState";
import { renderStationHTML } from "./stationRender";
import { attachDynamicListeners } from "./stationEvents";
import { parseSearchQuery } from "../search/smartSearch";
import { updateSmartHint } from "../search/searchHint";

export function filterStations() {
    const searchInput = document.getElementById("search-input") as HTMLInputElement;
    const countryFilter = document.getElementById("country-filter") as HTMLSelectElement;
    const genreFilter = document.getElementById("genre-filter") as HTMLSelectElement;
    const codecFilter = document.getElementById("codec-filter") as HTMLSelectElement;
    const bitrateFilter = document.getElementById("bitrate-filter") as HTMLInputElement;

    let query = searchInput ? searchInput.value.trim() : "";

    const parsedQuery = parseSearchQuery({
        query,
        countryFilter,
        codecFilter,
        bitrateFilter
    });

    updateSmartHint(parsedQuery, query);

    const selectedCountry = parsedQuery.country;
    const selectedGenre = genreFilter ? genreFilter.value : "";
    const selectedCodec = parsedQuery.codec;
    const minBitrate = parsedQuery.bitrate;
    const searchTerms = parsedQuery.text
        ? parsedQuery.text.split(/\s+/).filter(Boolean)
        : [];

    const isSearchMode = query !== "";

    const filteredStations = appState.allStations.filter((station: any) => {
        if (station.broken) return false;

        const name = station.name ? station.name.toLowerCase() : "";
        const country = station.country || "";
        const tags = station.tags || [];
        const codec = station.codec || "";
        const bitrate = station.bitrate || 0;

        const matchesText =
            searchTerms.length === 0 ||
            searchTerms.every(
                (term: string) =>
                    name.includes(term) ||
                    tags.some((tag: string) =>
                        tag.toLowerCase().includes(term),
                    ),
            );

        const matchesCountry =
            selectedCountry === "" || country === selectedCountry;
        const matchesGenre =
            selectedGenre === "" || tags.includes(selectedGenre);
        const matchesCodec =
            selectedCodec === "" || codec === selectedCodec;
        const matchesBitrate = bitrate >= minBitrate;

        return (
            matchesText &&
            matchesCountry &&
            matchesGenre &&
            matchesCodec &&
            matchesBitrate
        );
    });

    const totalMatches = filteredStations.length;
    let stationsToRender = [];
    const searchStatus = document.getElementById("search-status");

    // Always apply backend-like pagination to prevent rendering massive lists
    stationsToRender = filteredStations.slice(0, appState.browseOffset);

    // Update Search Status
    if (searchStatus) {
        if (isSearchMode) {
            searchStatus.style.display = "block";
            // Show "Showing X of Y results" if paginated, or just "Found Y results"
            const showingCount = stationsToRender.length;
            if (totalMatches > showingCount) {
                searchStatus.textContent = `Found ${totalMatches} matches — showing top ${showingCount}`;
            } else {
                searchStatus.textContent = `Found ${totalMatches} matches`;
            }
        } else {
            searchStatus.style.display = "none";
        }
    }

    const stationGrid = document.getElementById("station-grid");
    if (stationGrid) {
        stationGrid.innerHTML = stationsToRender
            .map(renderStationHTML)
            .join("");
        attachDynamicListeners();
    }

    const loadMoreBtn = document.getElementById("load-more-btn");
    if (loadMoreBtn) {
        // Show button if there are more items than currently rendered
        if (totalMatches > stationsToRender.length) {
            loadMoreBtn.style.display = "block";
            // Optional: Update button text to indicate context? "Show more results" vs "Show more stations"
            // For now, keep it simple.
        } else {
            loadMoreBtn.style.display = "none";
        }
    }
}

export function initStations() {
    // Helper to reset pagination
    const resetPagination = () => {
        appState.browseOffset = PAGE_SIZE;
        filterStations();
    };

    // Initial Render
    filterStations();

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", resetPagination); // Reset on search
    }
    const countryFilter = document.getElementById("country-filter");
    if (countryFilter) {
        countryFilter.addEventListener("change", resetPagination);
    }
    const genreFilter = document.getElementById("genre-filter");
    if (genreFilter) {
        genreFilter.addEventListener("change", resetPagination);
    }
    const codecFilter = document.getElementById("codec-filter");
    if (codecFilter) {
        codecFilter.addEventListener("change", resetPagination);
    }
    const bitrateFilter = document.getElementById("bitrate-filter");
    if (bitrateFilter) {
        bitrateFilter.addEventListener("input", resetPagination);
    }

    // Load More (DO NOT RESET HERE)
    const loadMoreBtn = document.getElementById("load-more-btn");
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", () => {
            appState.browseOffset += PAGE_SIZE;
            filterStations();
        });
    }

    // Clear Filters
    const clearFiltersBtn = document.getElementById("clear-filters-btn");
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", () => {
            if (searchInput) (searchInput as HTMLInputElement).value = "";
            if (countryFilter) (countryFilter as HTMLSelectElement).value = "";
            if (genreFilter) (genreFilter as HTMLSelectElement).value = "";
            if (codecFilter) (codecFilter as HTMLSelectElement).value = "";
            if (bitrateFilter) (bitrateFilter as HTMLInputElement).value = "";
            resetPagination(); // Reset here too
        });
    }

    // Filter Toggle Logic
    const toggleFiltersBtn = document.getElementById("toggle-filters-btn");
    const filtersPanel = document.getElementById("filters-panel");

    if (toggleFiltersBtn && filtersPanel) {
        toggleFiltersBtn.addEventListener("click", () => {
            const isExpanded = filtersPanel.classList.contains("expanded");
            if (isExpanded) {
                filtersPanel.classList.remove("expanded");
                toggleFiltersBtn.textContent = "Show filters";
                toggleFiltersBtn.setAttribute("aria-expanded", "false");
                filtersPanel.setAttribute("aria-hidden", "true");
            } else {
                filtersPanel.classList.add("expanded");
                toggleFiltersBtn.textContent = "Hide filters";
                toggleFiltersBtn.setAttribute("aria-expanded", "true");
                filtersPanel.setAttribute("aria-hidden", "false");
            }
        });
    }
}
