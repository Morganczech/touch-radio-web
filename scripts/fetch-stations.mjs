import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dns from 'node:dns/promises';

// Helper to get current directory in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../src/data');
const OUTPUT_FILE = path.join(DATA_DIR, 'stations.json');

async function getBaseUrl() {
    try {
        // Resolve the list of available servers
        const addresses = await dns.resolve4('all.api.radio-browser.info');
        if (!addresses || addresses.length === 0) {
            throw new Error('No servers found');
        }
        // Pick a random server
        const ip = addresses[Math.floor(Math.random() * addresses.length)];
        console.log(`Resolved API server IP: ${ip}`);
        // Use HTTP with IP as fallback if hostnames fail
        return `http://${ip}`;
    } catch (error) {
        console.warn('DNS resolution failed, falling back to de1 mirror:', error.message);
        return 'https://de1.api.radio-browser.info';
    }
}

async function fetchStations() {
    const baseUrl = await getBaseUrl();

    try {
        // Fetch top voted stations
        const votedUrl = `${baseUrl}/json/stations/topvote/7500`;
        console.log(`Fetching top voted stations from ${votedUrl}...`);
        const votedResponse = await fetch(votedUrl, {
            headers: {
                'User-Agent': 'touch-radio-web/0.0.1'
            }
        });

        if (!votedResponse.ok) {
            throw new Error(`HTTP error! status: ${votedResponse.status}`);
        }

        const votedData = await votedResponse.json();
        console.log(`Fetched ${votedData.length} top voted stations.`);

        // Fetch top clicked stations
        const clickedUrl = `${baseUrl}/json/stations/topclick/7500`;
        console.log(`Fetching top clicked stations from ${clickedUrl}...`);
        const clickedResponse = await fetch(clickedUrl, {
            headers: {
                'User-Agent': 'touch-radio-web/0.0.1'
            }
        });

        if (!clickedResponse.ok) {
            throw new Error(`HTTP error! status: ${clickedResponse.status}`);
        }

        const clickedData = await clickedResponse.json();
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
