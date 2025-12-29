import { filterStations } from "../stations/stationFilter";

export function initDiscoveryBadges() {
    const discoveryContainer = document.getElementById(
        "discovery-badges-container",
    );
    const btnUp = document.getElementById("discovery-up");
    const btnDown = document.getElementById("discovery-down");
    const searchInput = document.getElementById(
        "search-input",
    ) as HTMLInputElement;

    if (discoveryContainer && btnUp && btnDown) {
        const badgeRows = [
            ["Relax", "Calm", "Night", "Chill", "Ambient"],
            ["Coffee", "Work", "Focus", "Workout", "Yoga"],
            ["Jazz", "Rock", "Classical", "Electronic", "Soul"],
            ["Morning", "Evening", "Night", "Late"],
        ];

        let currentRowIndex = 0;
        let autoRotateEnabled = true;
        let autoRotateTimer: any = null;

        // Helper to swap content
        const updateRow = (newIndex: number) => {
            // 1) Fade out
            discoveryContainer.classList.add("fade-out");
            setTimeout(() => {
                // 2) Content Swap (Text Only)
                currentRowIndex = newIndex;
                const newTerms = badgeRows[currentRowIndex];
                const itemElements =
                    discoveryContainer.querySelectorAll(".discovery-item");
                itemElements.forEach((el, i) => {
                    const span = el as HTMLElement;
                    if (newTerms[i]) {
                        span.textContent = newTerms[i];
                        span.dataset.query = newTerms[i];
                        span.style.display = "inline-block";
                    } else {
                        span.style.display = "none";
                    }
                });
                // 3) Fade in after pause
                setTimeout(() => {
                    discoveryContainer.classList.remove("fade-out");
                }, 50);
            }, 650);
        };

        // 4) Auto Rotation
        const startAutoRotate = () => {
            if (autoRotateTimer) clearInterval(autoRotateTimer);
            autoRotateTimer = setInterval(() => {
                if (autoRotateEnabled) {
                    const nextIndex =
                        (currentRowIndex + 1) % badgeRows.length;
                    updateRow(nextIndex);
                }
            }, 6000);
        };

        const stopAutoRotate = () => {
            if (autoRotateEnabled) {
                autoRotateEnabled = false;
                if (autoRotateTimer) clearInterval(autoRotateTimer);
            }
        };

        // Stop on search interaction
        if (searchInput) {
            searchInput.addEventListener("focus", stopAutoRotate);
            searchInput.addEventListener("input", stopAutoRotate);
        }

        // Re-attach listeners user action helper
        const attachBadgeListeners = () => {
            // Listeners are attached once to the stable DOM elements
            const badges =
                discoveryContainer.querySelectorAll(".discovery-item");
            badges.forEach((badge) => {
                // Handle click
                badge.addEventListener("click", (e) => {
                    stopAutoRotate();
                    // Stop on badge click
                    const target = e.currentTarget as HTMLElement;
                    const query = target.dataset.query;
                    if (query && searchInput) {
                        searchInput.value = query;
                        filterStations(); // Call filterStations to update results
                    }
                });
                // Handle keyboard (Enter/Space) since we use span
                badge.addEventListener("keydown", (e: any) => {
                    if (e.key === "Enter" || e.key === " ") {
                        stopAutoRotate(); // Stop on badge key interaction
                        e.preventDefault();
                        (badge as HTMLElement).click();
                    }
                });
            });
        };

        // Initial attach
        attachBadgeListeners();
        // Start initial rotation
        startAutoRotate();

        // Arrow Listeners
        btnUp.addEventListener("click", () => {
            stopAutoRotate();
            const nextIndex =
                (currentRowIndex - 1 + badgeRows.length) % badgeRows.length;
            updateRow(nextIndex);
        });
        btnUp.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                stopAutoRotate();
                updateRow(
                    (currentRowIndex - 1 + badgeRows.length) %
                    badgeRows.length,
                );
            }
        });

        btnDown.addEventListener("click", () => {
            stopAutoRotate();
            const nextIndex = (currentRowIndex + 1) % badgeRows.length;
            updateRow(nextIndex);
        });
        btnDown.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                stopAutoRotate();
                updateRow((currentRowIndex + 1) % badgeRows.length);
            }
        });
    }
}
