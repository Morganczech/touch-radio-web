import { COUNTRY_CODES } from "../utils/flags";

export interface FilterState {
    query: string; // raw query
    countryFilter?: HTMLSelectElement;
    codecFilter?: HTMLSelectElement;
    bitrateFilter?: HTMLInputElement;
}

export interface ParsedQuery {
    text: string;
    country: string;
    codec: string;
    bitrate: number;
}

export function parseSearchQuery(filters: FilterState): ParsedQuery {
    const query = filters.query;

    // Default values from UI
    const parsedQuery: ParsedQuery = {
        text: query,
        country: filters.countryFilter ? filters.countryFilter.value : "",
        codec: filters.codecFilter ? filters.codecFilter.value : "",
        bitrate: filters.bitrateFilter ? parseInt(filters.bitrateFilter.value) || 0 : 0,
    };

    // 1. Smart Search Parsing (Simple heuristic)
    const textParts: string[] = [];
    let consumed = false;

    // Use lower case tokens for matching
    const lowerQuery = query.toLowerCase();

    if (query.trim() !== "") {
        const tokens = lowerQuery.split(/\s+/).filter(Boolean);
        tokens.forEach((token) => {
            consumed = false;

            // 1. Bitrate
            if (!consumed && /^\d+$/.test(token)) {
                const num = parseInt(token);
                if (!isNaN(num)) {
                    const uiBitrateActive =
                        filters.bitrateFilter &&
                        filters.bitrateFilter.value &&
                        parseInt(filters.bitrateFilter.value) > 0;
                    if (!uiBitrateActive) {
                        parsedQuery.bitrate = num;
                        consumed = true;
                    }
                }
            }

            // 2. Known Codecs
            if (!consumed && filters.codecFilter) {
                const knownCodecs = ["mp3", "aac", "ogg", "flac"];
                if (knownCodecs.includes(token)) {
                    const uiCodecActive = filters.codecFilter.value !== "";
                    if (!uiCodecActive) {
                        for (const opt of Array.from(filters.codecFilter.options)) {
                            if (opt.value.toLowerCase() === token) {
                                parsedQuery.codec = opt.value;
                                consumed = true;
                                break;
                            }
                        }
                    } else {
                        consumed = true;
                    }
                }
            }

            // 3. Country Codes
            if (!consumed && filters.countryFilter) {
                for (const [name, code] of Object.entries(COUNTRY_CODES)) {
                    if (code.toLowerCase() === token) {
                        const uiCountryActive = filters.countryFilter.value !== "";
                        if (!uiCountryActive) {
                            for (const opt of Array.from(filters.countryFilter.options)) {
                                if (opt.value === name) {
                                    parsedQuery.country = opt.value;
                                    consumed = true;
                                    break;
                                }
                            }
                        } else {
                            consumed = true;
                        }
                        if (consumed) break;
                    }
                }
            }

            // 4. Text Search
            if (!consumed) {
                // Push the token (which is already lowercase)?
                // Text search expects matching against lowercased fields anyway.
                textParts.push(token);
            }
        });
        parsedQuery.text = textParts.join(" ");
    }

    return parsedQuery;
}
