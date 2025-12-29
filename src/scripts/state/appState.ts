export interface AppState {
    allStations: any[];
    selectedIds: Set<string>;
    browseOffset: number;
    currentPlayingStreamUrl: string | null; // Use URL as ID for playback since multiple stations might share streams? No, ID is safer.
    // Normalized data has 'id' (UUID).
    currentPlayingId: string | null;
}

export const PAGE_SIZE = 50;

export const appState: AppState = {
    allStations: [],
    selectedIds: new Set(),
    browseOffset: PAGE_SIZE,
    currentPlayingStreamUrl: null,
    currentPlayingId: null
};
