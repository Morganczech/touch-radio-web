import { appState } from "../state/appState";

const MAX_STATIONS_IN_URL = 100;

/**
 * Generate a shareable URL with encoded station IDs
 */
export function generateShareUrl(): string {
    const ids = Array.from(appState.favoriteIds);

    // Limit to prevent too long URLs
    if (ids.length > MAX_STATIONS_IN_URL) {
        throw new Error(`Too many favorites. Maximum is ${MAX_STATIONS_IN_URL}.`);
    }

    // Encode IDs to base64
    const encoded = btoa(JSON.stringify(ids));

    // Create URL with playlist parameter
    const url = new URL(window.location.href);
    url.searchParams.set('playlist', encoded);

    return url.toString();
}

/**
 * Parse playlist from URL and return station IDs
 */
export function parseShareUrl(): string[] | null {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('playlist');

    if (!encoded) {
        return null;
    }

    try {
        const ids = JSON.parse(atob(encoded));

        // Validate that it's an array of strings
        if (!Array.isArray(ids) || !ids.every(id => typeof id === 'string')) {
            console.error('Invalid playlist data in URL');
            return null;
        }

        return ids;
    } catch (error) {
        console.error('Failed to parse playlist from URL:', error);
        return null;
    }
}

/**
 * Copy share link to clipboard
 */
export async function copyShareLink(): Promise<boolean> {
    const shareUrl = generateShareUrl();

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(shareUrl);
            return true;
        }
    } catch (error) {
        console.warn("clipboard.writeText failed, trying fallback:", error);
    }

    // Fallback for older browsers / insecure contexts
    try {
        const input = document.createElement("textarea");
        input.value = shareUrl;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(input);
        return ok;
    } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        return false;
    }
}

/**
 * Share playlist using Web Share API or fallback to clipboard
 */
export async function sharePlaylist(): Promise<boolean> {
    const count = appState.favoriteIds.size;
    const shareUrl = generateShareUrl();

    // Try Web Share API first (mobile)
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Touch Radio Favorites',
                text: `Check out my ${count} favorite radio station${count !== 1 ? 's' : ''}`,
                url: shareUrl
            });
            return true;
        } catch (error) {
            // User cancelled or error - fallback to clipboard
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Web Share API failed:', error);
            }
        }
    }

    // Fallback to clipboard
    return await copyShareLink();
}
