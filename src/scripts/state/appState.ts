export interface AppState {
    allStations: any[];
    favoriteIds: Set<string>;
    browseOffset: number;
    currentPlayingStreamUrl: string | null;
    currentPlayingId: string | null;
}

export const PAGE_SIZE = 50;

export const appState: AppState = {
    allStations: [],
    favoriteIds: new Set(),
    browseOffset: PAGE_SIZE,
    currentPlayingStreamUrl: null,
    currentPlayingId: null,
};
