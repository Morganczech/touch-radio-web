/**
 * RadioBrowser API Client
 * Fetches additional stations from RadioBrowser API at runtime
 */

// Use all.api which has CORS enabled
const API_BASE_URL = 'https://all.api.radio-browser.info';

export interface RadioBrowserStation {
    stationuuid: string;
    name: string;
    url_resolved: string;
    country: string;
    codec: string;
    bitrate: number;
    homepage: string;
    favicon: string;
    tags: string;
}

export interface NormalizedStation {
    id: string;
    name: string;
    streamUrl: string;
    country: string;
    codec: string;
    bitrate: number;
    homepage: string;
    favicon: string;
    tags: string[];
    broken?: boolean;
}

/**
 * Normalize RadioBrowser API response to our format
 */
function normalizeStation(station: RadioBrowserStation): NormalizedStation {
    return {
        id: station.stationuuid,
        name: station.name || 'Unknown Station',
        streamUrl: station.url_resolved || '',
        country: station.country || '',
        codec: station.codec || '',
        bitrate: station.bitrate || 0,
        homepage: station.homepage || '',
        favicon: station.favicon || '',
        tags: station.tags ? station.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        broken: !station.url_resolved // Mark as broken if no stream URL
    };
}

/**
 * Fetch stations from RadioBrowser API
 * @param offset - Starting position
 * @param limit - Number of stations to fetch
 */
export async function fetchStationsFromAPI(
    offset: number = 500,
    limit: number = 1000
): Promise<NormalizedStation[]> {
    try {
        const url = `${API_BASE_URL}/json/stations/topvote/${limit}?offset=${offset}`;

        console.log(`[API] Fetching ${limit} stations from offset ${offset}...`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'touch-radio-web/0.0.1'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: RadioBrowserStation[] = await response.json();
        const normalized = data.map(normalizeStation);

        console.log(`[API] Fetched ${normalized.length} stations`);

        return normalized;
    } catch (error) {
        console.error('[API] Failed to fetch stations:', error);
        return []; // Return empty array on error (graceful degradation)
    }
}
