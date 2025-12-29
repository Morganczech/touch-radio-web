import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT_FILE = path.resolve(__dirname, '../src/data/stations.json');
const OUTPUT_FILE = path.resolve(__dirname, '../src/data/stations.normalized.json');

async function normalizeStations() {
    console.log('Normalizing stations...');

    try {
        const rawData = await fs.readFile(INPUT_FILE, 'utf-8');
        const stations = JSON.parse(rawData);

        const normalizedStations = stations.map(station => ({
            id: station.stationuuid,
            name: station.name,
            streamUrl: station.url,
            country: station.country,
            codec: station.codec,
            bitrate: station.bitrate,
            homepage: station.homepage,
            favicon: station.favicon ? station.favicon.replace('http:', 'https:') : '',
            tags: station.tags ? station.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean) : []
        }));

        await fs.writeFile(OUTPUT_FILE, JSON.stringify(normalizedStations, null, 2), 'utf-8');

        console.log(`Normalized ${normalizedStations.length} stations.`);
        console.log(`Saved to ${OUTPUT_FILE}`);

        // Show sample for the user
        console.log('\nSample item:');
        console.log(JSON.stringify(normalizedStations[0], null, 2));

    } catch (error) {
        console.error('Error normalizing stations:', error);
        process.exit(1);
    }
}

normalizeStations();
