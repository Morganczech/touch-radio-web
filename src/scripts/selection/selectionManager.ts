import { appState } from "../state/appState";
import { getFlag } from "../utils/flags";

export function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function updateUI() {
    const count = appState.selectedIds.size;
    const countSpan = document.getElementById("selection-count");
    if (countSpan) {
        countSpan.textContent = count.toString();
    }

    const buttons = [
        document.getElementById("export-btn"),
        document.getElementById("export-m3u-btn"),
        document.getElementById("export-m3u8-btn"),
        document.getElementById("export-pls-btn"),
    ];

    const isDisabled = count === 0;
    buttons.forEach((btn) => {
        if (btn) {
            if (isDisabled) {
                btn.setAttribute("disabled", "true");
            } else {
                btn.removeAttribute("disabled");
            }
        }
    });

    // Update Selection Panel
    const selectionList = document.getElementById("selection-list");
    if (selectionList) {
        selectionList.innerHTML = "";
        if (count === 0) {
            selectionList.innerHTML = '<p class="empty-state">No stations selected</p>';
        } else {
            const selectedStations = appState.allStations.filter((s: any) =>
                appState.selectedIds.has(s.id),
            );

            selectedStations.forEach((station: any) => {
                const item = document.createElement("div");
                item.className = "selected-item";
                const flag = getFlag(station.country);
                item.innerHTML = `
                <div class="selected-item-info">
                    <div class="selected-item-name">${flag} ${station.name}</div>
                    <div class="selected-item-meta">${station.codec} • ${station.bitrate}kbps</div>
                </div>
                <button class="remove-btn" data-remove-id="${station.id}" title="Remove from selection">❤️</button>
            `;
                selectionList.appendChild(item);
            });

            // Add event listeners for remove buttons
            selectionList.querySelectorAll(".remove-btn").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    const target = e.currentTarget as HTMLButtonElement;
                    const idToRemove = target.dataset.removeId;
                    if (idToRemove) {
                        // Update State
                        appState.selectedIds.delete(idToRemove);

                        // Update UI (Recursive call effectively)
                        updateUI();

                        // Sync Checkbox if visible
                        const checkbox = document.querySelector(
                            `input[type="checkbox"][data-id="${idToRemove}"]`
                        ) as HTMLInputElement;
                        if (checkbox) {
                            checkbox.checked = false;
                        }
                    }
                });
            });
        }
    }
}

export function initSelection() {
    const exportBtn = document.getElementById("export-btn");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            if (appState.selectedIds.size === 0) {
                alert("No stations selected.");
                return;
            }
            const selectedStations = appState.allStations.filter((station: any) =>
                appState.selectedIds.has(station.id),
            );
            const jsonString = JSON.stringify(selectedStations, null, 2);
            downloadFile(jsonString, "selected_stations.json", "application/json");
        });
    }

    const exportM3uBtn = document.getElementById("export-m3u-btn");
    if (exportM3uBtn) {
        exportM3uBtn.addEventListener("click", () => {
            if (appState.selectedIds.size === 0) {
                alert("No stations selected.");
                return;
            }
            const selectedStations = appState.allStations.filter((station: any) =>
                appState.selectedIds.has(station.id),
            );
            let m3uContent = "#EXTM3U\n";
            selectedStations.forEach((station: any) => {
                m3uContent += `#EXTINF:-1,${station.name}\n${station.streamUrl}\n`;
            });
            downloadFile(m3uContent, "selected_stations.m3u", "text/plain");
        });
    }

    const exportM3u8Btn = document.getElementById("export-m3u8-btn");
    if (exportM3u8Btn) {
        exportM3u8Btn.addEventListener("click", () => {
            if (appState.selectedIds.size === 0) {
                alert("No stations selected.");
                return;
            }
            const selectedStations = appState.allStations.filter((station: any) =>
                appState.selectedIds.has(station.id),
            );
            let m3uContent = "#EXTM3U\n";
            selectedStations.forEach((station: any) => {
                m3uContent += `#EXTINF:-1,${station.name}\n${station.streamUrl}\n`;
            });
            downloadFile(m3uContent, "selected_stations.m3u8", "text/plain;charset=utf-8");
        });
    }

    const exportPlsBtn = document.getElementById("export-pls-btn");
    if (exportPlsBtn) {
        exportPlsBtn.addEventListener("click", () => {
            if (appState.selectedIds.size === 0) {
                alert("No stations selected.");
                return;
            }
            const selectedStations = appState.allStations.filter((station: any) =>
                appState.selectedIds.has(station.id),
            );
            let plsContent = "[playlist]\n";
            plsContent += `NumberOfEntries=${selectedStations.length}\n`;
            selectedStations.forEach((station: any, index: number) => {
                const i = index + 1;
                plsContent += `File${i}=${station.streamUrl}\n`;
                plsContent += `Title${i}=${station.name}\n`;
                plsContent += `Length${i}=-1\n`;
            });
            plsContent += "Version=2\n";
            downloadFile(plsContent, "selected_stations.pls", "text/plain");
        });
    }
}
