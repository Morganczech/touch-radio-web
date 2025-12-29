export const COUNTRY_CODES: Record<string, string> = {
    Germany: "DE",
    Hungary: "HU",
    "The United States Of America": "US",
    USA: "US",
    "The United Kingdom Of Great Britain And Northern Ireland": "GB",
    UK: "GB",
    "Great Britain": "GB",
    "Islamic Republic Of Iran": "IR",
    Iran: "IR",
    Czechia: "CZ",
    "Czech Republic": "CZ",
    France: "FR",
    Poland: "PL",
    "The Russian Federation": "RU",
    Russia: "RU",
    Ukraine: "UA",
    Tunisia: "TN",
    "The Netherlands": "NL",
    Netherlands: "NL",
    Spain: "ES",
    Italy: "IT",
    Greece: "GR",
    Switzerland: "CH",
    Austria: "AT",
    Belgium: "BE",
};

export function getFlag(countryName: string) {
    const code = COUNTRY_CODES[countryName];
    if (!code || code.length !== 2) return "🌍";
    const offset = 127397;
    const chars = [...code.toUpperCase()].map(
        (c) => c.charCodeAt(0) + offset,
    );
    return String.fromCodePoint(...chars);
}
