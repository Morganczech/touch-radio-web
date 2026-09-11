import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Helper to get current directory in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../src/data');
const OUTPUT_FILE = path.join(DATA_DIR, 'stations.json');
const API_BASE_URLS = [
    'https://all.api.radio-browser.info',
    'https://de1.api.radio-browser.info',
];

async function fetchStationsFromEndpoint(pathname) {
    let lastError;

    for (const baseUrl of API_BASE_URLS) {
        const url = `${baseUrl}${pathname}`;
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'touch-radio-web/0.0.1'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(`Fetched data from ${baseUrl}`);
            return response.json();
        } catch (error) {
            lastError = error;
            console.warn(`Request to ${baseUrl} failed: ${error.message}`);
        }
    }

    throw lastError;
}

async function fetchStations() {
    try {
        // Fetch top voted stations
        console.log('Fetching top voted stations...');
        const votedData = await fetchStationsFromEndpoint('/json/stations/topvote/7500');
        console.log(`Fetched ${votedData.length} top voted stations.`);

        // Fetch top clicked stations
        console.log('Fetching top clicked stations...');
        const clickedData = await fetchStationsFromEndpoint('/json/stations/topclick/7500');
        console.log(`Fetched ${clickedData.length} top clicked stations.`);

        // Merge and deduplicate by stationuuid
        const stationMap = new Map();

        // Add voted stations first (they have priority)
        votedData.forEach(station => {
            stationMap.set(station.stationuuid, station);
        });

        // Add clicked stations (only if not already present)
        clickedData.forEach(station => {
            if (!stationMap.has(station.stationuuid)) {
                stationMap.set(station.stationuuid, station);
            }
        });

        const mergedData = Array.from(stationMap.values());
        console.log(`Merged to ${mergedData.length} unique stations (removed ${votedData.length + clickedData.length - mergedData.length} duplicates).`);

        // Ensure directory exists
        await fs.mkdir(DATA_DIR, { recursive: true });

        await fs.writeFile(OUTPUT_FILE, JSON.stringify(mergedData, null, 2), 'utf-8');
        console.log(`Saved to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error fetching stations:', error);
        process.exit(1);
    }
}

fetchStations();
