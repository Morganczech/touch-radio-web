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
    const url = `${baseUrl}/json/stations/topvote/50`;

    console.log(`Fetching stations from ${url}...`);
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'touch-radio-web/0.0.1'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Fetched ${data.length} stations.`);

        // Ensure directory exists
        await fs.mkdir(DATA_DIR, { recursive: true });

        await fs.writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`Saved to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error fetching stations:', error);
        process.exit(1);
    }
}

fetchStations();
