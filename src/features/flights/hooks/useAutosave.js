import { persistCurrentState } from "../../../legacy";
const AUTOSAVE_DELAY_MS = 1200;
let autosaveTimer;
function scheduleAutosave() {
    if (autosaveTimer !== undefined) {
        window.clearTimeout(autosaveTimer);
    }
    autosaveTimer = window.setTimeout(() => {
        try {
            persistCurrentState();
        }
        catch (error) {
            console.warn("[autosave] persist failed:", error);
        }
    }, AUTOSAVE_DELAY_MS);
}
export function setupAutosaveListeners(root) {
    const handler = () => scheduleAutosave();
    root.addEventListener("input", handler, { capture: true });
    root.addEventListener("change", handler, { capture: true });
}
