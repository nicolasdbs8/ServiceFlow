import { I18N } from "../i18n/locales";
const DEFAULT_LANG = "EN";
function getBundle(lang) {
    const key = (lang || DEFAULT_LANG);
    return I18N[key] || I18N[DEFAULT_LANG] || {};
}
function translateField(bundle, key, fallback = "") {
    if (key && bundle && typeof bundle[key] === "string") {
        return bundle[key];
    }
    return fallback || "";
}
const PLACEHOLDER_MENU = [
    {
        rotation: 1,
        direction: "both",
        serviceType: "breakfast",
        breakfastType: "nightstop",
        label1: "SWISS Saveurs Cold Cuts Platter",
        label1Key: "autoMenu_coldCutsPlatter",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        dataStatus: "ok",
    },
    // Nightstop menus (same for all rotations, inbound)
    {
        rotation: 2,
        direction: "inbound",
        serviceType: "breakfast",
        breakfastType: "nightstop",
        label1: "SWISS Saveurs Cold Cuts Platter",
        label1Key: "autoMenu_coldCutsPlatter",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        note: "Out of nightstop menu",
        noteKey: "autoMenu_nightstopNote",
        dataStatus: "ok",
    },
    {
        rotation: 3,
        direction: "inbound",
        serviceType: "breakfast",
        breakfastType: "nightstop",
        label1: "SWISS Saveurs Cold Cuts Platter",
        label1Key: "autoMenu_coldCutsPlatter",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        note: "Out of nightstop menu",
        noteKey: "autoMenu_nightstopNote",
        dataStatus: "ok",
    },
    {
        rotation: 4,
        direction: "inbound",
        serviceType: "breakfast",
        breakfastType: "nightstop",
        label1: "SWISS Saveurs Cold Cuts Platter",
        label1Key: "autoMenu_coldCutsPlatter",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        note: "Out of nightstop menu",
        noteKey: "autoMenu_nightstopNote",
        dataStatus: "ok",
    },
    {
        rotation: 5,
        direction: "inbound",
        serviceType: "breakfast",
        breakfastType: "nightstop",
        label1: "SWISS Saveurs Cold Cuts Platter",
        label1Key: "autoMenu_coldCutsPlatter",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        note: "Out of nightstop menu",
        noteKey: "autoMenu_nightstopNote",
        dataStatus: "ok",
    },
    {
        rotation: 6,
        direction: "inbound",
        serviceType: "breakfast",
        breakfastType: "nightstop",
        label1: "SWISS Saveurs Cold Cuts Platter",
        label1Key: "autoMenu_coldCutsPlatter",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        note: "Out of nightstop menu",
        noteKey: "autoMenu_nightstopNote",
        dataStatus: "ok",
    },
    // === Real menus for rotation 1 ===
    {
        rotation: 1,
        direction: "outbound",
        serviceType: "breakfast",
        breakfastType: "standard",
        label1: "Gruyère egg roll with mountain herbs, sautéed shiitake mushrooms and tomatoes",
        label1Key: "autoMenu_gruyereEggRoll",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        dataStatus: "ok",
    },
    {
        rotation: 1,
        direction: "inbound",
        serviceType: "breakfast",
        breakfastType: "standard",
        label1: "Omelette with Appenzeller cheese, rösti, spinach and cherry tomatoes",
        label1Key: "autoMenu_appenzellerOmelette",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        dataStatus: "ok",
    },
    {
        rotation: 1,
        direction: "outbound",
        serviceType: "day",
        label1: "Grilled beef tenderloin with porcini mushroom sauce, potato gratin and broccoli",
        label1Key: "autoMenu_beefTenderloinPorcini",
        label2: "Truffle triangoli with white wine truffle sauce, spinach and Sbrinz cheese",
        label2Key: "autoMenu_truffleTriangoli",
        dataStatus: "ok",
    },
    {
        rotation: 1,
        direction: "inbound",
        serviceType: "day",
        label1: "Chicken breast with jus de volaille, mascarpone polenta, red cabbage and brussels sprouts",
        label1Key: "autoMenu_chickenMascarponePolenta",
        label2: "Trofie pasta with mushroom cream sauce, glazed salsify, roasted leek, pumpkin and pumpkin seeds",
        label2Key: "autoMenu_trofieMushroom",
        dataStatus: "ok",
    },
    // === Real menus for rotation 2 ===
    {
        rotation: 2,
        direction: "outbound",
        serviceType: "breakfast",
        breakfastType: "standard",
        label1: "Savoury crêpe with ricotta and spinach, grilled vegetables, pan-fried potatoes",
        label1Key: "autoMenu_crepeRicottaSpinach",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        dataStatus: "ok",
    },
    {
        rotation: 2,
        direction: "inbound",
        serviceType: "breakfast",
        breakfastType: "standard",
        label1: "Scrambled eggs with Engelberg Abbey mountain cheese and spinach, potato rösti",
        label1Key: "autoMenu_scrambledEngelberg",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        dataStatus: "ok",
    },
    {
        rotation: 2,
        direction: "outbound",
        serviceType: "day",
        label1: "Chicken breast with jus de volaille, mascarpone polenta, red cabbage and brussels sprouts",
        label1Key: "autoMenu_chickenMascarponePolenta",
        label2: "Trofie pasta with mushroom cream sauce, glazed salsify, roasted leek, pumpkin and pumpkin seeds",
        label2Key: "autoMenu_trofieMushroom",
        dataStatus: "ok",
    },
    {
        rotation: 2,
        direction: "inbound",
        serviceType: "day",
        label1: "Beef bourguignon, potato purée and glazed root vegetables",
        label1Key: "autoMenu_beefBourguignonPuree",
        label2: "Cheese spaetzle with fried onions and apple slices",
        label2Key: "autoMenu_cheeseSpaetzleOnionApple",
        dataStatus: "ok",
    },
    // === Real menus for rotation 3 ===
    {
        rotation: 3,
        direction: "outbound",
        serviceType: "breakfast",
        breakfastType: "standard",
        label1: "Egg soufflé with tomatoes and cheese, mushroom sauce and broccoli",
        label1Key: "autoMenu_eggSouffleMushroom",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        dataStatus: "ok",
    },
    {
        rotation: 3,
        direction: "inbound",
        serviceType: "breakfast",
        breakfastType: "standard",
        label1: "Omelette with asparagus and sauce hollandaise, parsley potatoes",
        label1Key: "autoMenu_asparagusOmelette",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        dataStatus: "ok",
    },
    {
        rotation: 3,
        direction: "outbound",
        serviceType: "day",
        label1: "Beef bourguignon, potato purée and glazed root vegetables",
        label1Key: "autoMenu_beefBourguignonPuree",
        label2: "Cheese spaetzle with fried onions and apple slices",
        label2Key: "autoMenu_cheeseSpaetzleOnionApple",
        dataStatus: "ok",
    },
    {
        rotation: 3,
        direction: "inbound",
        serviceType: "day",
        label1: "Grilled beef tenderloin with porcini mushroom sauce, potato gratin and broccoli",
        label1Key: "autoMenu_beefTenderloinPorcini",
        label2: "Truffle triangoli with white wine truffle sauce, spinach and Sbrinz cheese",
        label2Key: "autoMenu_truffleTriangoli",
        dataStatus: "ok",
    },
    // === Real menus for rotation 4 ===
    {
        rotation: 4,
        direction: "outbound",
        serviceType: "breakfast",
        breakfastType: "standard",
        label1: "Gruyère egg roll with mountain herbs, sautéed shiitake mushrooms and tomatoes",
        label1Key: "autoMenu_gruyereEggRoll",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        dataStatus: "ok",
    },
    {
        rotation: 4,
        direction: "inbound",
        serviceType: "breakfast",
        breakfastType: "standard",
        label1: "Omelette with Appenzeller cheese, rösti, spinach and cherry tomatoes",
        label1Key: "autoMenu_appenzellerOmelette",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        dataStatus: "ok",
    },
    {
        rotation: 4,
        direction: "outbound",
        serviceType: "day",
        label1: "Grilled beef tenderloin with porcini mushroom sauce, potato gratin and broccoli",
        label1Key: "autoMenu_beefTenderloinPorcini",
        label2: "Truffle triangoli with white wine truffle sauce, spinach and Sbrinz cheese",
        label2Key: "autoMenu_truffleTriangoli",
        dataStatus: "ok",
    },
    {
        rotation: 4,
        direction: "inbound",
        serviceType: "day",
        label1: "Sauteed chicken breast with jus, mascarpone polenta, brussels sprouts, braised red cabbage",
        label1Key: "autoMenu_sauteedChickenPolenta",
        label2: "Trofie pasta with mushroom cream sauce, glazed salsify, roasted leek, pumpkin and pumpkin seeds",
        label2Key: "autoMenu_trofieMushroom",
        dataStatus: "ok",
    },
    // === Real menus for rotation 5 ===
    {
        rotation: 5,
        direction: "outbound",
        serviceType: "breakfast",
        breakfastType: "standard",
        label1: "Savoury crêpe with ricotta and spinach, grilled vegetables, pan-fried potatoes",
        label1Key: "autoMenu_crepeRicottaSpinach",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        dataStatus: "ok",
    },
    {
        rotation: 5,
        direction: "inbound",
        serviceType: "breakfast",
        breakfastType: "standard",
        label1: "Scrambled eggs with Engelberg Abbey mountain cheese and spinach, potato rösti",
        label1Key: "autoMenu_scrambledEngelberg",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        dataStatus: "ok",
    },
    {
        rotation: 5,
        direction: "outbound",
        serviceType: "day",
        label1: "Sauteed chicken breast with jus, mascarpone polenta, brussels sprouts, braised red cabbage",
        label1Key: "autoMenu_sauteedChickenPolenta",
        label2: "Trofie pasta with mushroom cream sauce, glazed salsify, roasted leek, pumpkin and pumpkin seeds",
        label2Key: "autoMenu_trofieMushroom",
        dataStatus: "ok",
    },
    {
        rotation: 5,
        direction: "inbound",
        serviceType: "day",
        label1: "Beef bourguignon, potato purée and glazed root vegetables",
        label1Key: "autoMenu_beefBourguignonPuree",
        label2: "Cheese spaetzle with fried onions and apple slices",
        label2Key: "autoMenu_cheeseSpaetzleOnionApple",
        dataStatus: "ok",
    },
    // === Real menus for rotation 6 ===
    {
        rotation: 6,
        direction: "outbound",
        serviceType: "breakfast",
        breakfastType: "standard",
        label1: "Egg soufflé with tomatoes and cheese, mushroom sauce and broccoli",
        label1Key: "autoMenu_eggSouffleMushroom",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        dataStatus: "ok",
    },
    {
        rotation: 6,
        direction: "inbound",
        serviceType: "breakfast",
        breakfastType: "standard",
        label1: "Omelette with asparagus and sauce hollandaise, parsley potatoes",
        label1Key: "autoMenu_asparagusOmelette",
        label2: "Granola with milk",
        label2Key: "autoMenu_granolaMilk",
        dataStatus: "ok",
    },
    {
        rotation: 6,
        direction: "outbound",
        serviceType: "day",
        label1: "Beef bourguignon, potato purée and glazed root vegetables",
        label1Key: "autoMenu_beefBourguignonPuree",
        label2: "Gratinated cheese spaetzle with apple and fried onions",
        label2Key: "autoMenu_gratinatedCheeseSpaetzle",
        dataStatus: "ok",
    },
    {
        rotation: 6,
        direction: "inbound",
        serviceType: "day",
        label1: "Grilled beef tenderloin with porcini mushroom sauce, potato gratin and broccoli",
        label1Key: "autoMenu_beefTenderloinPorcini",
        label2: "Truffle triangoli with white wine truffle sauce, spinach and Sbrinz cheese",
        label2Key: "autoMenu_truffleTriangoli",
        dataStatus: "ok",
    },
];
const ROTATION_DATES = [
    {
        rotation: 1,
        dates: new Set([
            "2025-06-04", "2025-06-05", "2025-06-06", "2025-06-07", "2025-06-08", "2025-06-09", "2025-06-10",
            "2025-07-16", "2025-07-17", "2025-07-18", "2025-07-19", "2025-07-20", "2025-07-21", "2025-07-22",
            "2025-08-27", "2025-08-28", "2025-08-29", "2025-08-30", "2025-08-31", "2025-09-01", "2025-09-02",
            "2025-10-08", "2025-10-09", "2025-10-10", "2025-10-11", "2025-10-12", "2025-10-13", "2025-10-14",
            "2025-11-19", "2025-11-20", "2025-11-21", "2025-11-22", "2025-11-23", "2025-11-24", "2025-11-25",
            "2025-12-31", "2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05", "2026-01-06",
            "2026-02-11", "2026-02-12", "2026-02-13", "2026-02-14", "2026-02-15", "2026-02-16", "2026-02-17",
        ]),
    },
    {
        rotation: 2,
        dates: new Set([
            "2025-06-11", "2025-06-12", "2025-06-13", "2025-06-14", "2025-06-15", "2025-06-16", "2025-06-17",
            "2025-07-23", "2025-07-24", "2025-07-25", "2025-07-26", "2025-07-27", "2025-07-28", "2025-07-29",
            "2025-09-03", "2025-09-04", "2025-09-05", "2025-09-06", "2025-09-07", "2025-09-08", "2025-09-09",
            "2025-09-15", "2025-09-16", "2025-09-17", "2025-09-18", "2025-09-19", "2025-09-20", "2025-09-21",
            "2025-11-26", "2025-11-27", "2025-11-28", "2025-11-29", "2025-11-30", "2025-12-01", "2025-12-02",
            "2026-01-07", "2026-01-08", "2026-01-09", "2026-01-10", "2026-01-11", "2026-01-12", "2026-01-13",
            "2026-02-18", "2026-02-19", "2026-02-20", "2026-02-21", "2026-02-22", "2026-02-23", "2026-02-24",
        ]),
    },
    {
        rotation: 3,
        dates: new Set([
            "2025-06-18", "2025-06-19", "2025-06-20", "2025-06-21", "2025-06-22", "2025-06-23", "2025-06-24",
            "2025-07-30", "2025-07-31", "2025-08-01", "2025-08-02", "2025-08-03", "2025-08-04", "2025-08-05",
            "2025-09-10", "2025-09-11", "2025-09-12", "2025-09-13", "2025-09-14", "2025-09-15", "2025-09-16",
            "2025-10-22", "2025-10-23", "2025-10-24", "2025-10-25", "2025-10-26", "2025-10-27", "2025-10-28",
            "2025-12-03", "2025-12-04", "2025-12-05", "2025-12-06", "2025-12-07", "2025-12-08", "2025-12-09",
            "2026-01-14", "2026-01-15", "2026-01-16", "2026-01-17", "2026-01-18", "2026-01-19", "2026-01-20",
            "2026-02-25", "2026-02-26", "2026-02-27", "2026-02-28",
        ]),
    },
    {
        rotation: 4,
        dates: new Set([
            "2025-06-25", "2025-06-26", "2025-06-27", "2025-06-28", "2025-06-29", "2025-06-30", "2025-07-01",
            "2025-08-06", "2025-08-07", "2025-08-08", "2025-08-09", "2025-08-10", "2025-08-11", "2025-08-12",
            "2025-09-17", "2025-09-18", "2025-09-19", "2025-09-20", "2025-09-21", "2025-09-22", "2025-09-23",
            "2025-10-29", "2025-10-30", "2025-10-31", "2025-11-01", "2025-11-02", "2025-11-03", "2025-11-04",
            "2025-12-10", "2025-12-11", "2025-12-12", "2025-12-13", "2025-12-14", "2025-12-15", "2025-12-16",
            "2026-01-21", "2026-01-22", "2026-01-23", "2026-01-24", "2026-01-25", "2026-01-26", "2026-01-27",
        ]),
    },
    {
        rotation: 5,
        dates: new Set([
            "2025-07-02", "2025-07-03", "2025-07-04", "2025-07-05", "2025-07-06", "2025-07-07", "2025-07-08",
            "2025-08-13", "2025-08-14", "2025-08-15", "2025-08-16", "2025-08-17", "2025-08-18", "2025-08-19",
            "2025-09-24", "2025-09-25", "2025-09-26", "2025-09-27", "2025-09-28", "2025-09-29", "2025-09-30",
            "2025-11-05", "2025-11-06", "2025-11-07", "2025-11-08", "2025-11-09", "2025-11-10", "2025-11-11",
            "2025-12-17", "2025-12-18", "2025-12-19", "2025-12-20", "2025-12-21", "2025-12-22", "2025-12-23",
            "2026-01-28", "2026-01-29", "2026-01-30", "2026-01-31", "2026-02-01", "2026-02-02", "2026-02-03",
        ]),
    },
    {
        rotation: 6,
        dates: new Set([
            "2025-06-01", "2025-06-02", "2025-06-03",
            "2025-07-09", "2025-07-10", "2025-07-11", "2025-07-12", "2025-07-13", "2025-07-14", "2025-07-15",
            "2025-08-20", "2025-08-21", "2025-08-22", "2025-08-23", "2025-08-24", "2025-08-25", "2025-08-26",
            "2025-10-01", "2025-10-02", "2025-10-03", "2025-10-04", "2025-10-05", "2025-10-06", "2025-10-07",
            "2025-11-12", "2025-11-13", "2025-11-14", "2025-11-15", "2025-11-16", "2025-11-17", "2025-11-18",
            "2025-12-24", "2025-12-25", "2025-12-26", "2025-12-27", "2025-12-28", "2025-12-29", "2025-12-30",
            "2026-02-04", "2026-02-05", "2026-02-06", "2026-02-07", "2026-02-08", "2026-02-09", "2026-02-10",
        ]),
    },
];
export function computeMenuRotationFromDate(dateISO) {
    if (!dateISO)
        return null;
    const iso = normalizeDateString(dateISO);
    if (!iso)
        return null;
    for (const entry of ROTATION_DATES) {
        if (entry.dates.has(iso))
            return entry.rotation;
    }
    return null;
}
function fallbackLabel(option, rotation, direction, serviceType, breakfastType, bundle) {
    const rotText = rotation ? `R${rotation}` : "R?";
    const srv = serviceType === "breakfast"
        ? breakfastType === "nightstop"
            ? translateField(bundle, "menuBreakfastNight", "Breakfast - out of night stop")
            : translateField(bundle, "menuBreakfast", "Breakfast")
        : translateField(bundle, "menuDayService", "Day service");
    const dir = direction === "outbound"
        ? translateField(bundle, "menuOutbound", "Outbound")
        : translateField(bundle, "menuInbound", "Inbound");
    return `${srv} - ${dir} (${rotText})`;
}
export function lookupAutoMenuLabels(input) {
    const bundle = getBundle(input.lang);
    const direction = input.direction || "outbound";
    const serviceType = input.serviceType || "day";
    const breakfastType = input.breakfastType || "standard";
    const rotation = input.rotation ?? computeMenuRotationFromDate(input.dateISO);
    const matches = PLACEHOLDER_MENU.filter((entry) => {
        if (rotation && entry.rotation !== rotation)
            return false;
        if (entry.serviceType !== serviceType)
            return false;
        if (entry.direction !== "both" && entry.direction !== direction)
            return false;
        if (entry.serviceType === "breakfast") {
            const type = entry.breakfastType || "standard";
            if (type !== breakfastType)
                return false;
        }
        return true;
    });
    const picked = matches.find((m) => m.dataStatus === "ok") ||
        matches.find((m) => m.dataStatus === "placeholder") ||
        matches[0];
    if (picked) {
        return {
            rotation: rotation ?? picked.rotation ?? null,
            option1: translateField(bundle, picked.label1Key, picked.label1),
            option2: translateField(bundle, picked.label2Key, picked.label2),
            status: picked.dataStatus || "placeholder",
            note: translateField(bundle, picked.noteKey, picked.note),
        };
    }
    return {
        rotation: rotation ?? null,
        option1: fallbackLabel("option1", rotation ?? null, direction, serviceType, breakfastType, bundle),
        option2: fallbackLabel("option2", rotation ?? null, direction, serviceType, breakfastType, bundle),
        status: "missing",
        note: rotation
            ? translateField(bundle, "autoMenu_pendingNote", "Menu data will be loaded automatically when provided.")
            : translateField(bundle, "autoMenu_outOfRotation", "Selected date is outside defined rotations."),
    };
}
function normalizeDateString(raw) {
    if (!raw)
        return null;
    const s = String(raw).trim();
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (isoMatch)
        return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    const slashMatch = /^(\d{2})[\/\.](\d{2})[\/\.](\d{4})$/.exec(s);
    if (slashMatch) {
        const [_, dd, mm, yyyy] = slashMatch;
        return `${yyyy}-${mm}-${dd}`;
    }
    const parsed = new Date(s);
    if (Number.isNaN(parsed.getTime()))
        return null;
    return parsed.toISOString().slice(0, 10);
}
