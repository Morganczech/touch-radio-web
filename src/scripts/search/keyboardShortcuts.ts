/**
 * Initialize global keyboard shortcuts for search functionality
 */
export function initKeyboardShortcuts() {
    const searchInput = document.getElementById("search-input") as HTMLInputElement;

    if (!searchInput) return;

    document.addEventListener("keydown", (e) => {
        // Ctrl/Cmd + K -> Focus Search
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault(); // Prevent default browser behavior (e.g. browser search focus)
            searchInput.focus();
        }

        // Esc -> Blur Search / Clear if focused
        if (e.key === "Escape") {
            if (document.activeElement === searchInput) {
                if (searchInput.value !== "") {
                    // Optional: Clear on Esc if user prefers, but standard behavior is usually just blur or clear
                    // For now, let's just blur to be safe, or clear if specified
                    searchInput.value = "";
                    searchInput.blur();
                    // Trigger input event to update filters/search logic
                    searchInput.dispatchEvent(new Event("input"));
                } else {
                    searchInput.blur();
                }
            }
        }
    });
}
