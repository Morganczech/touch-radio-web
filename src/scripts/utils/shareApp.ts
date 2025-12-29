/**
 * Utility functions for sharing the Touch Radio application
 */

interface ShareData {
    title: string;
    text: string;
    url: string;
}

const SHARE_DATA: ShareData = {
    title: "Touch Radio",
    text: "Discover Touch Radio - Free web radio player with 7000+ stations worldwide. No ads, no tracking!",
    url: typeof window !== 'undefined' ? window.location.origin : ''
};

/**
 * Generate share URLs for different platforms
 */
export function generateShareUrls(shareData: ShareData = SHARE_DATA) {
    const encodedUrl = encodeURIComponent(shareData.url);
    const encodedText = encodeURIComponent(shareData.text);
    const encodedTitle = encodeURIComponent(shareData.title);

    return {
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    };
}

/**
 * Share via Web Share API (mobile devices)
 * Falls back to copy link if not supported
 */
export async function shareViaWebApi(shareData: ShareData = SHARE_DATA): Promise<boolean> {
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return true;
        } catch (err) {
            // User cancelled or error occurred
            console.log('Share cancelled or failed:', err);
            return false;
        }
    }

    // Fallback to copy link
    return copyToClipboard(shareData.url);
}

/**
 * Copy URL to clipboard
 */
export async function copyToClipboard(url: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(url);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

/**
 * Open share URL in new window
 */
export function openShareWindow(url: string, platform: string) {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
        url,
        `share-${platform}`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );
}
