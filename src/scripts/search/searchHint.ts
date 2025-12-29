import type { ParsedQuery } from "./smartSearch";
import { COUNTRY_CODES } from "../utils/flags";

export function updateSmartHint(parsedQuery: ParsedQuery, rawQuery: string) {
    const smartHint = document.getElementById("smart-hint");
    if (!smartHint) return;

    const hints: string[] = [];
    if (parsedQuery.text) hints.push(parsedQuery.text);
    if (parsedQuery.bitrate > 0)
        hints.push(`${parsedQuery.bitrate} kbps`);
    if (parsedQuery.country) {
        if (COUNTRY_CODES[parsedQuery.country]) {
            hints.push(COUNTRY_CODES[parsedQuery.country]);
        } else {
            hints.push(parsedQuery.country);
        }
    }
    if (parsedQuery.codec)
        hints.push(parsedQuery.codec.toUpperCase());

    if (hints.length > 0 && rawQuery.trim() !== "") {
        smartHint.textContent = `Recognized: ${hints.join(" · ")}`;
        smartHint.classList.add("active");
    } else {
        smartHint.textContent = "";
        smartHint.classList.remove("active");
    }
}
