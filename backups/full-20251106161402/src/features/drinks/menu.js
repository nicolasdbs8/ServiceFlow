// @ts-nocheck
import { I18N } from "../i18n/locales";
import { applyDrinkEmojis, emojiForFlag, emojiForOpt } from "./emojis";
export { applyDrinkEmojis } from "./emojis";
const MILK_OPTIONS = [
    { value: "creme", labelKey: "tcMilkCreme", fallback: "Cream", emojiKey: "milk:creme" },
    { value: "avoine", labelKey: "tcMilkAvoine", fallback: "Oat milk", emojiKey: "milk:avoine" },
    { value: "lait", labelKey: "tcMilkLait", fallback: "Milk", emojiKey: "milk:lait" },
    { value: "none", labelKey: "tcMilkNone", fallback: "None", emojiKey: "milk:none" },
];
const SWEET_OPTIONS = [
    { value: "sucre", labelKey: "tcSweetSugar", fallback: "Sugar", emojiKey: "sweet:sucre" },
    { value: "succedane", labelKey: "tcSweetSub", fallback: "Substitute", emojiKey: "sweet:succedane" },
    { value: "none", labelKey: "tcSweetNone", fallback: "None", emojiKey: "sweet:none" },
];
const TEA_OPTIONS = [
    { value: "english", labelKey: "tcTeaEnglish", fallback: "English Breakfast", emojiKey: "theType:english" },
    { value: "vert", labelKey: "tcTeaVert", fallback: "Green tea", emojiKey: "theType:vert" },
    { value: "menthe", labelKey: "tcTeaMenthe", fallback: "Mint tea", emojiKey: "theType:menthe" },
    { value: "camomille", labelKey: "tcTeaCamomille", fallback: "Chamomile", emojiKey: "theType:camomille" },
    { value: "hotwater", labelKey: "tcHotWater", fallback: "Hot water", emojiKey: "theType:hotwater" },
];
const WATER_OPTIONS = [
    { value: "plate", labelKey: "tcWaterStill", fallback: "Still", emojiKey: "waterType:plate" },
    { value: "gazeuse", labelKey: "tcWaterSpark", fallback: "Sparkling", emojiKey: "waterType:gazeuse" },
];
const COCA_OPTIONS = [
    { value: "normal", labelKey: "tcCocaClassic", fallback: "Classic", emojiKey: "cocaType:normal" },
    { value: "zero", labelKey: "tcCocaZero", fallback: "Zero", emojiKey: "cocaType:zero" },
];
const JUICE_OPTIONS = [
    { value: "orange", labelKey: "tcJuiceOrange", fallback: "Orange", emojiKey: "juiceType:orange" },
    { value: "pomme", labelKey: "tcJuiceApple", fallback: "Apple", emojiKey: "juiceType:pomme" },
    { value: "tomate", labelKey: "tcJuiceTomato", fallback: "Tomato", emojiKey: "juiceType:tomate" },
];
const BEER_OPTIONS = [
    { value: "quoellfrisch", labelKey: "tcBeerQ", fallback: "Quöllfrisch Lager", emojiKey: "beer:quoellfrisch" },
    { value: "calvinus", labelKey: "tcBeerC", fallback: "Calvinus Blanche", emojiKey: "beer:calvinus" },
    { value: "leermond", labelKey: "tcBeerL", fallback: "Leermond (0%)", emojiKey: "beer:leermond" },
];
const VIN_ROUGE_OPTIONS = [
    { value: "suisse", labelKey: "tcCH", fallback: "Swiss", emojiKey: "vinRouge:suisse" },
    { value: "etranger", labelKey: "tcForeign", fallback: "Foreign", emojiKey: "vinRouge:etranger" },
];
const VIN_BLANC_OPTIONS = [
    { value: "suisse", labelKey: "tcCH", fallback: "Swiss", emojiKey: "vinBlanc:suisse" },
    { value: "etranger", labelKey: "tcForeign", fallback: "Foreign", emojiKey: "vinBlanc:etranger" },
];
const DIGESTIF_OPTIONS = [
    { value: "whisky_jw", labelKey: "tcDigJW", fallback: "Johnnie Walker", emojiKey: "digestif:whisky_jw" },
    { value: "whisky_jb", labelKey: "tcDigJB", fallback: "Jim Beam", emojiKey: "digestif:whisky_jb" },
    { value: "cognac", labelKey: "tcDigCognac", fallback: "Cognac", emojiKey: "digestif:cognac" },
    { value: "baileys", labelKey: "tcDigBaileys", fallback: "Baileys", emojiKey: "digestif:baileys" },
];
const COCKTAIL_OPTIONS = [
    { value: "campari", labelKey: "tcCampari", fallback: "Campari", emojiKey: "cocktail:campari" },
    { value: "bloody_mary", labelKey: "tcBloody", fallback: "Bloody Mary", emojiKey: "cocktail:bloody_mary" },
    { value: "screwdriver", labelKey: "tcScrew", fallback: "Screw Driver", emojiKey: "cocktail:screwdriver" },
    { value: "gin_tonic", labelKey: "tcGinTonic", fallback: "Gin Tonic", emojiKey: "cocktail:gin_tonic" },
    { value: "cuba_libre", labelKey: "tcCuba", fallback: "Cuba Libre", emojiKey: "cocktail:cuba_libre" },
];
const CAMPARI_MIX_OPTIONS = [
    { value: "orange", labelKey: "tcJuiceOrange", fallback: "Orange", emojiKey: "campariMix:orange" },
    { value: "soda", labelKey: "tcSoda", fallback: "Soda", emojiKey: "campariMix:soda" },
];
const DRINK_TREE = [
    {
        id: "chaud",
        cardId: "grpHot",
        headerId: "hdrHot",
        containerId: "hotOpts",
        subsections: {
            cafe: {
                id: "cafe",
                labelKey: "drink_coffee",
                fallback: "Coffee",
                defaultOpen: 0,
                resetKeys: ["milk", "sweet", "theType", "theLemon"],
                sections: [
                    { id: "milk", kind: "exclusive", key: "milk", titleKey: "tcMilk", fallback: "Milk/Cream", options: MILK_OPTIONS },
                    { id: "sweet", kind: "exclusive", key: "sweet", titleKey: "tcSweet", fallback: "Sweetener", options: SWEET_OPTIONS },
                ],
            },
            deca: {
                id: "deca",
                labelKey: "drink_decaf",
                fallback: "Decaf",
                defaultOpen: 0,
                resetKeys: ["milk", "sweet", "theType", "theLemon"],
                sections: [
                    { id: "milk", kind: "exclusive", key: "milk", titleKey: "tcMilk", fallback: "Milk/Cream", options: MILK_OPTIONS },
                    { id: "sweet", kind: "exclusive", key: "sweet", titleKey: "tcSweet", fallback: "Sweetener", options: SWEET_OPTIONS },
                ],
            },
            the: {
                id: "the",
                labelKey: "drink_tea",
                fallback: "Tea",
                defaultOpen: 0,
                resetKeys: ["milk", "sweet", "theType", "theLemon"],
                sections: [
                    { id: "teaType", kind: "exclusive", key: "theType", titleKey: "tcTeaTitle", fallback: "Tea", options: TEA_OPTIONS },
                    { id: "milk", kind: "exclusive", key: "milk", titleKey: "tcMilk", fallback: "Milk/Cream", options: MILK_OPTIONS },
                    { id: "sweet", kind: "exclusive", key: "sweet", titleKey: "tcSweet", fallback: "Sugar", options: SWEET_OPTIONS },
                    {
                        id: "teaExtras",
                        kind: "toggles",
                        titleKey: "tcLemon",
                        fallback: "Lemon",
                        toggles: [
                            { flag: "theLemon", labelKey: "tcLemon", fallback: "Lemon", emojiKey: "theLemon" },
                        ],
                    },
                ],
            },
            chocolat: {
                id: "chocolat",
                labelKey: "drink_caotina",
                fallback: "Caotina",
                resetKeys: [],
                sections: [
                    {
                        id: "chocoInfo",
                        kind: "info",
                        titleKey: "tcCatChoco",
                        fallback: "Caotina",
                    },
                ],
            },
        },
    },
    {
        id: "soft",
        cardId: "grpSoft",
        headerId: "hdrSoft",
        containerId: "softOpts",
        subsections: {
            eau: {
                id: "eau",
                labelKey: "drink_water",
                fallback: "Water",
                defaultOpen: 0,
                resetKeys: ["waterType", "softIce", "softLemon"],
                sections: [
                    { id: "waterType", kind: "exclusive", key: "waterType", titleKey: "tcWater", fallback: "Water", options: WATER_OPTIONS },
                    {
                        id: "waterExtras",
                        kind: "toggles",
                        titleKey: "tcExtras",
                        fallback: "Options",
                        toggles: [
                            { flag: "softIce", labelKey: "tcIce", fallback: "Ice", emojiKey: "softIce" },
                            { flag: "softLemon", labelKey: "tcLemon", fallback: "Lemon", emojiKey: "softLemon" },
                        ],
                    },
                ],
            },
            coca: {
                id: "coca",
                labelKey: "drink_cola",
                fallback: "Cola",
                defaultOpen: 0,
                resetKeys: ["cocaType", "softIce", "softLemon"],
                sections: [
                    { id: "cocaType", kind: "exclusive", key: "cocaType", titleKey: "tcCola", fallback: "Cola", options: COCA_OPTIONS },
                    {
                        id: "cocaExtras",
                        kind: "toggles",
                        titleKey: "tcExtras",
                        fallback: "Options",
                        toggles: [
                            { flag: "softIce", labelKey: "tcIce", fallback: "Ice", emojiKey: "softIce" },
                            { flag: "softLemon", labelKey: "tcLemon", fallback: "Lemon", emojiKey: "softLemon" },
                        ],
                    },
                ],
            },
            jus: {
                id: "jus",
                labelKey: "drink_juice",
                fallback: "Juice",
                defaultOpen: 0,
                resetKeys: ["juiceType", "juiceIce", "juiceLemon", "juiceSalt", "juicePepper", "juiceSP", "juiceApfelschorle"],
                sections: [
                    { id: "juiceType", kind: "exclusive", key: "juiceType", titleKey: "tcJuice", fallback: "Juice", options: JUICE_OPTIONS },
                    {
                        id: "juiceExtras",
                        kind: "toggles",
                        titleKey: "tcExtras",
                        fallback: "Options",
                        toggles: [
                            { flag: "juiceIce", labelKey: "tcIce", fallback: "Ice", emojiKey: "juiceIce" },
                            { flag: "juiceLemon", labelKey: "tcLemon", fallback: "Lemon", emojiKey: "juiceLemon" },
                            {
                                flag: "juiceSP",
                                labelKey: "tcSaltPepper",
                                fallback: "Salt + Pepper",
                                emojiKey: "juiceSP",
                                linkedFlags: ["juiceSalt", "juicePepper"],
                                showWhen: { key: "juiceType", equals: "tomate" },
                            },
                            {
                                flag: "juiceApfelschorle",
                                labelKey: "tcApfelschorle",
                                fallback: "Apfelschorle",
                                emojiKey: "juiceApfelschorle",
                                showWhen: { key: "juiceType", equals: "pomme" },
                            },
                        ],
                    },
                ],
            },
            sprite: {
                id: "sprite",
                labelKey: "drink_sprite",
                fallback: "Sprite",
                defaultOpen: 0,
                resetKeys: ["spriteIce", "spriteLemon"],
                sections: [
                    {
                        id: "spriteExtras",
                        kind: "toggles",
                        titleKey: "tcSprite",
                        fallback: "Sprite",
                        toggles: [
                            { flag: "spriteIce", labelKey: "tcIce", fallback: "Ice", emojiKey: "spriteIce" },
                            { flag: "spriteLemon", labelKey: "tcLemon", fallback: "Lemon", emojiKey: "spriteLemon" },
                        ],
                    },
                ],
            },
            tonic: {
                id: "tonic",
                labelKey: "drink_tonic",
                fallback: "Tonic",
                defaultOpen: 0,
                resetKeys: ["tonicIce", "tonicLemon"],
                sections: [
                    {
                        id: "tonicExtras",
                        kind: "toggles",
                        titleKey: "tcTonic",
                        fallback: "Tonic",
                        toggles: [
                            { flag: "tonicIce", labelKey: "tcIce", fallback: "Ice", emojiKey: "tonicIce" },
                            { flag: "tonicLemon", labelKey: "tcLemon", fallback: "Lemon", emojiKey: "tonicLemon" },
                        ],
                    },
                ],
            },
        },
    },
    {
        id: "alcool",
        cardId: "grpAlco",
        headerId: "hdrAlco",
        containerId: "alcoOpts",
        subsections: {
            biere: {
                id: "biere",
                labelKey: "drink_beer",
                fallback: "Beer",
                defaultOpen: 0,
                resetKeys: ["beer"],
                sections: [
                    { id: "beer", kind: "exclusive", key: "beer", titleKey: "tcBeer", fallback: "Beer", options: BEER_OPTIONS },
                ],
            },
            vin_rouge: {
                id: "vin_rouge",
                labelKey: "drink_red",
                fallback: "Red wine",
                defaultOpen: 0,
                resetKeys: ["vinRouge", "vinIce"],
                sections: [
                    { id: "vinRouge", kind: "exclusive", key: "vinRouge", titleKey: "tcRed", fallback: "Red", options: VIN_ROUGE_OPTIONS },
                    {
                        id: "vinRougeExtras",
                        kind: "toggles",
                        titleKey: "tcExtras",
                        fallback: "Options",
                        toggles: [
                            { flag: "vinIce", labelKey: "tcIce", fallback: "Ice", emojiKey: "champIce" },
                        ],
                    },
                ],
            },
            vin_blanc: {
                id: "vin_blanc",
                labelKey: "drink_white",
                fallback: "White wine",
                defaultOpen: 0,
                resetKeys: ["vinBlanc", "vinIce"],
                sections: [
                    { id: "vinBlanc", kind: "exclusive", key: "vinBlanc", titleKey: "tcWhite", fallback: "White", options: VIN_BLANC_OPTIONS },
                    {
                        id: "vinBlancExtras",
                        kind: "toggles",
                        titleKey: "tcExtras",
                        fallback: "Options",
                        toggles: [
                            { flag: "vinIce", labelKey: "tcIce", fallback: "Ice", emojiKey: "champIce" },
                        ],
                    },
                ],
            },
            champagne: {
                id: "champagne",
                labelKey: "drink_champagne",
                fallback: "Champagne",
                defaultOpen: 0,
                resetKeys: ["champIce", "champMimosa"],
                sections: [
                    {
                        id: "champagneExtras",
                        kind: "toggles",
                        titleKey: "tcChampagne",
                        fallback: "Champagne",
                        toggles: [
                            { flag: "champIce", labelKey: "tcIce", fallback: "Ice", emojiKey: "champIce" },
                            { flag: "champMimosa", labelKey: "tcMimosa", fallback: "Mimosa", emojiKey: "champMimosa" },
                        ],
                    },
                ],
            },
            digestif: {
                id: "digestif",
                labelKey: "drink_digestif",
                fallback: "Digestif",
                defaultOpen: 0,
                resetKeys: ["digestif", "digIce"],
                sections: [
                    {
                        id: "digestifChoice",
                        kind: "exclusive",
                        key: "digestif",
                        titleKey: "tcDigestif",
                        fallback: "Digestif",
                        options: DIGESTIF_OPTIONS,
                    },
                    {
                        id: "digestifExtras",
                        kind: "toggles",
                        titleKey: "tcExtras",
                        fallback: "Options",
                        toggles: [
                            { flag: "digIce", labelKey: "tcIce", fallback: "Ice", emojiKey: "digIce" },
                        ],
                    },
                ],
            },
            cocktail: {
                id: "cocktail",
                labelKey: "drink_cocktail",
                fallback: "Cocktail",
                defaultOpen: 0,
                resetKeys: [
                    "cocktail",
                    "campariMix",
                    "virginMary",
                    "cocktailIce",
                    "cocktailLemon",
                    "cocktailSalt",
                    "cocktailPepper",
                    "cocktailSP",
                ],
                sections: [
                    {
                        id: "cocktailChoice",
                        kind: "exclusive",
                        key: "cocktail",
                        titleKey: "tcCocktail",
                        fallback: "Cocktail",
                        options: COCKTAIL_OPTIONS,
                    },
                    {
                        id: "campariMix",
                        kind: "exclusive",
                        key: "campariMix",
                        titleKey: "tcCampari",
                        fallback: "Campari",
                        options: CAMPARI_MIX_OPTIONS,
                        showWhen: { key: "cocktail", equals: "campari" },
                    },
                    {
                        id: "bloodyMary",
                        kind: "toggles",
                        titleKey: "tcBloody",
                        fallback: "Bloody Mary",
                        showWhen: { key: "cocktail", equals: "bloody_mary" },
                        toggles: [
                            { flag: "virginMary", labelKey: "tcVirgin", fallback: "Virgin Mary", emojiKey: "virginMary" },
                        ],
                    },
                    {
                        id: "cocktailExtras",
                        kind: "toggles",
                        titleKey: "tcExtras",
                        fallback: "Options",
                        toggles: [
                            { flag: "cocktailIce", labelKey: "tcIce", fallback: "Ice", emojiKey: "cocktailIce" },
                            { flag: "cocktailLemon", labelKey: "tcLemon", fallback: "Lemon", emojiKey: "cocktailLemon" },
                            {
                                flag: "cocktailSP",
                                labelKey: "tcSaltPepper",
                                fallback: "Salt + Pepper",
                                emojiKey: "cocktailSP",
                                linkedFlags: ["cocktailSalt", "cocktailPepper"],
                                showWhen: { key: "cocktail", equals: "bloody_mary" },
                            },
                        ],
                    },
                ],
            },
        },
    },
];
const CATEGORY_MAP = new Map();
const SUBSECTION_MAP = new Map();
DRINK_TREE.forEach((category) => {
    CATEGORY_MAP.set(category.id, category);
    Object.values(category.subsections).forEach((sub) => {
        SUBSECTION_MAP.set(`${category.id}::${sub.id}`, sub);
    });
});
const DRINK_STATE_TEMPLATE = {
    cat: "",
    sub: "",
    waterType: "",
    juiceType: "",
    cocaType: "",
    milk: "",
    sweet: "",
    theType: "",
    campariMix: "",
    beer: "",
    vinRouge: "",
    vinBlanc: "",
    digestif: "",
    cocktail: "",
    softIce: false,
    softLemon: false,
    spriteIce: false,
    spriteLemon: false,
    tonicIce: false,
    tonicLemon: false,
    juiceIce: false,
    juiceLemon: false,
    juiceSalt: false,
    juicePepper: false,
    juiceSP: false,
    juiceApfelschorle: false,
    champIce: false,
    champMimosa: false,
    vinIce: false,
    digIce: false,
    cocktailIce: false,
    cocktailLemon: false,
    cocktailSalt: false,
    cocktailPepper: false,
    cocktailSP: false,
    theLemon: false,
    virginMary: false,
};
function cloneState() {
    return JSON.parse(JSON.stringify(DRINK_STATE_TEMPLATE));
}
export const drinkSel = cloneState();
let resolveStore = () => ({ phase: "fiche", config: { lang: "EN" } });
export function configureDrinkMenu(opts) {
    if (opts && typeof opts.getStore === "function") {
        resolveStore = opts.getStore;
    }
}
function translate(key, fallback) {
    const store = resolveStore?.();
    const lang = store?.config?.lang || "EN";
    const bundle = I18N[lang] || I18N.EN;
    return bundle?.[key] || fallback;
}
function evaluateCondition(condition) {
    if (!condition)
        return true;
    const value = String(drinkSel[condition.key] ?? "");
    if (condition.equals !== undefined && value !== condition.equals)
        return false;
    if (condition.notEquals !== undefined && value === condition.notEquals)
        return false;
    if (condition.in && !condition.in.includes(value))
        return false;
    return true;
}
const REQUIRED_BY_SUB = new Map([
    ["the", "theType"],
    ["eau", "waterType"],
    ["coca", "cocaType"],
    ["jus", "juiceType"],
    ["biere", "beer"],
    ["vin_rouge", "vinRouge"],
    ["vin_blanc", "vinBlanc"],
    ["digestif", "digestif"],
    ["cocktail", "cocktail"],
]);
const FIRST_LEVEL_OK = new Set(["cafe", "deca", "chocolat", "sprite", "tonic", "champagne"]);
function createAccordion(root, options = {}) {
    if (!root)
        return null;
    const sectionSelector = options.sectionSelector || ".accordion__section";
    const headerSelector = options.headerSelector || ".accordion__header";
    const singleOpen = options.singleOpen !== false;
    const sections = Array.from(root.querySelectorAll(sectionSelector));
    if (!sections.length)
        return null;
    const sectionData = sections.map((section, index) => {
        const header = section.querySelector(headerSelector);
        let body = section.querySelector(".accordion__body");
        if (!body) {
            const parts = Array.from(section.children).filter((child) => child !== header);
            if (parts.length) {
                body = document.createElement("div");
                body.className = "accordion__body";
                parts.forEach((node) => body.appendChild(node));
                if (header)
                    header.after(body);
                else
                    section.appendChild(body);
            }
        }
        const id = section.dataset.accordionId || section.dataset.id || String(index);
        section.dataset.accordionId = id;
        section.dataset.open = "false";
        if (header) {
            header.setAttribute("role", "button");
            header.setAttribute("tabindex", "0");
            header.setAttribute("aria-expanded", "false");
            header.addEventListener("click", () => toggle(id));
            header.addEventListener("keydown", (ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    toggle(id);
                }
            });
        }
        if (body)
            body.hidden = true;
        return { id, section, header, body };
    });
    function setOpen(targetId, open) {
        const entry = sectionData.find((item) => item.id === String(targetId));
        if (!entry)
            return;
        const { section, header, body } = entry;
        section.dataset.open = open ? "true" : "false";
        if (header)
            header.setAttribute("aria-expanded", open ? "true" : "false");
        if (body)
            body.hidden = !open;
    }
    function toggle(targetId) {
        const entry = sectionData.find((item) => item.id === String(targetId));
        if (!entry)
            return;
        const isOpen = entry.section.dataset.open === "true";
        if (singleOpen && !isOpen)
            closeAll();
        setOpen(targetId, !isOpen);
    }
    function close(targetId) {
        setOpen(targetId, false);
    }
    function open(targetId) {
        if (singleOpen)
            closeAll();
        setOpen(targetId, true);
    }
    function closeAll() {
        sectionData.forEach((entry) => {
            setOpen(entry.id, false);
        });
    }
    const defaultOpen = options.defaultOpen;
    if (defaultOpen !== undefined && defaultOpen !== null) {
        open(defaultOpen);
    }
    return { open, close, closeAll };
}
let categoryAccordion = null;
let currentSubKey = null;
function ensureCategoryAccordion() {
    if (categoryAccordion)
        return;
    const grid = document.getElementById("drinkGrid");
    if (!grid)
        return;
    DRINK_TREE.forEach((category) => {
        const card = document.getElementById(category.cardId);
        if (card)
            card.dataset.accordionId = category.id;
    });
    categoryAccordion = createAccordion(grid, {
        sectionSelector: ".group-card",
        headerSelector: ".group-title",
        singleOpen: true,
        defaultOpen: null,
    });
    if (categoryAccordion)
        categoryAccordion.closeAll();
}
function renderSubOptions(cat, sub) {
    const category = CATEGORY_MAP.get(cat);
    if (!category)
        return;
    const container = document.getElementById(category.containerId);
    if (!container)
        return;
    const subsection = SUBSECTION_MAP.get(`${cat}::${sub}`);
    if (!subsection) {
        container.innerHTML = "";
        return;
    }
    container.innerHTML = "";
    const accordion = document.createElement("div");
    accordion.className = "accordion";
    subsection.sections.forEach((section, index) => {
        if (!evaluateCondition(section.showWhen || null))
            return;
        const sectionEl = document.createElement("div");
        sectionEl.className = "accordion__section";
        sectionEl.dataset.accordionId = section.id || String(index);
        const header = document.createElement("div");
        header.className = "accordion__header";
        header.textContent = translate(section.titleKey, section.fallback);
        sectionEl.appendChild(header);
        if (section.kind === "info") {
            const body = document.createElement("div");
            body.className = "accordion__body";
            if (section.bodyKey) {
                body.textContent = translate(section.bodyKey, section.bodyFallback || "");
            }
            sectionEl.appendChild(body);
            accordion.appendChild(sectionEl);
            return;
        }
        const body = document.createElement("div");
        body.className = "accordion__body";
        const row = document.createElement("div");
        row.className = "pill-row";
        if (section.kind === "exclusive") {
            section.options.forEach((option) => {
                const wrap = document.createElement("div");
                wrap.className = "pill-wrap";
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "pill";
                btn.dataset.action = "exclusive";
                btn.dataset.key = section.key;
                btn.dataset.value = option.value;
                btn.dataset.cat = cat;
                btn.dataset.sub = sub;
                const label = translate(option.labelKey, option.fallback);
                btn.title = label;
                btn.setAttribute("aria-label", label);
                const emoji = emojiForOpt(option.emojiKey);
                btn.textContent = emoji || label;
                const isActive = (drinkSel[section.key] || "") === option.value;
                btn.classList.toggle("active", isActive);
                btn.setAttribute("aria-pressed", String(isActive));
                const cap = document.createElement("div");
                cap.className = "pill-cap";
                cap.textContent = label;
                wrap.appendChild(btn);
                wrap.appendChild(cap);
                row.appendChild(wrap);
            });
        }
        else if (section.kind === "toggles") {
            section.toggles.forEach((toggle) => {
                if (!evaluateCondition(toggle.showWhen || null))
                    return;
                const wrap = document.createElement("div");
                wrap.className = "pill-wrap";
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "pill toggle";
                btn.dataset.action = "toggle";
                btn.dataset.flag = toggle.flag;
                btn.dataset.cat = cat;
                btn.dataset.sub = sub;
                if (toggle.linkedFlags && toggle.linkedFlags.length) {
                    btn.dataset.linkedFlags = toggle.linkedFlags.join(",");
                }
                const label = translate(toggle.labelKey, toggle.fallback);
                btn.title = label;
                btn.setAttribute("aria-label", label);
                const emoji = emojiForFlag(toggle.emojiKey);
                btn.textContent = emoji || label;
                const active = toggle.linkedFlags && toggle.linkedFlags.length
                    ? toggle.linkedFlags.every((flag) => !!drinkSel[flag])
                    : !!drinkSel[toggle.flag];
                btn.classList.toggle("active", active);
                btn.setAttribute("aria-pressed", String(active));
                const cap = document.createElement("div");
                cap.className = "pill-cap";
                cap.textContent = label;
                wrap.appendChild(btn);
                wrap.appendChild(cap);
                row.appendChild(wrap);
            });
        }
        body.appendChild(row);
        sectionEl.appendChild(body);
        accordion.appendChild(sectionEl);
    });
    container.appendChild(accordion);
    createAccordion(accordion, { singleOpen: true, defaultOpen: subsection.defaultOpen ?? 0 });
    applyDrinkEmojis(container);
    currentSubKey = `${cat}::${sub}`;
}
function resetState(keys) {
    const targetKeys = keys && keys.length ? keys : Object.keys(DRINK_STATE_TEMPLATE);
    targetKeys.forEach((key) => {
        drinkSel[key] = cloneState()[key];
    });
}
function resetSelectionOnly() {
    drinkSel.cat = "";
    drinkSel.sub = "";
    currentSubKey = null;
}
function clearOptionContainers() {
    DRINK_TREE.forEach((category) => {
        const container = document.getElementById(category.containerId);
        if (container)
            container.innerHTML = "";
    });
}
function updateCategoryButtons(cat, sub) {
    const grid = document.getElementById("drinkGrid");
    if (!grid)
        return;
    grid.querySelectorAll(".pill.big").forEach((btn) => {
        const isActive = btn.dataset.cat === cat && btn.dataset.sub === sub;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
    });
}
function handleCategoryClick(btn) {
    const cat = btn.dataset.cat || "";
    const sub = btn.dataset.sub || "";
    if (!cat || !sub)
        return;
    const alreadyActive = btn.classList.contains("active");
    resetState();
    if (alreadyActive) {
        resetSelectionOnly();
        updateCategoryButtons("", "");
        clearOptionContainers();
        showAllDrinkGroups();
        updateServeDrinkButtons();
        return;
    }
    drinkSel.cat = cat;
    drinkSel.sub = sub;
    updateCategoryButtons(cat, sub);
    ensureCategoryAccordion();
    focusDrinkGroup(cat);
    const subsection = SUBSECTION_MAP.get(`${cat}::${sub}`);
    if (subsection) {
        resetState(subsection.resetKeys);
    }
    renderSubOptions(cat, sub);
    updateServeDrinkButtons();
}
function handleExclusive(btn) {
    const key = btn.dataset.key;
    const value = btn.dataset.value || "";
    if (!key)
        return;
    const current = drinkSel[key] || "";
    drinkSel[key] = current === value ? "" : value;
    const cat = drinkSel.cat;
    const sub = drinkSel.sub;
    if (cat && sub) {
        renderSubOptions(cat, sub);
    }
    updateServeDrinkButtons();
}
function handleToggle(btn) {
    const flag = btn.dataset.flag;
    if (!flag)
        return;
    const next = !drinkSel[flag];
    drinkSel[flag] = next;
    const linked = (btn.dataset.linkedFlags || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    if (linked.length) {
        linked.forEach((lk) => {
            drinkSel[lk] = next;
        });
    }
    const cat = drinkSel.cat;
    const sub = drinkSel.sub;
    if (cat && sub) {
        renderSubOptions(cat, sub);
    }
    updateServeDrinkButtons();
}
let menuBound = false;
export function initializeDrinkMenu() {
    if (menuBound)
        return;
    menuBound = true;
    ensureCategoryAccordion();
    const grid = document.getElementById("drinkGrid");
    if (!grid)
        return;
    grid.addEventListener("click", (event) => {
        const target = event.target;
        if (!target)
            return;
        const actionEl = target.closest("[data-action]");
        if (actionEl && grid.contains(actionEl)) {
            const action = actionEl.dataset.action;
            if (action === "exclusive")
                handleExclusive(actionEl);
            else if (action === "toggle")
                handleToggle(actionEl);
            return;
        }
        const bigBtn = target.closest(".pill.big");
        if (bigBtn && grid.contains(bigBtn)) {
            handleCategoryClick(bigBtn);
        }
    });
}
export function focusDrinkGroup(byCat) {
    ensureCategoryAccordion();
    if (!categoryAccordion)
        return;
    categoryAccordion.open(byCat);
}
export function showAllDrinkGroups() {
    ensureCategoryAccordion();
    if (!categoryAccordion)
        return;
    categoryAccordion.closeAll();
}
export function resetDrinkUI(hard = false) {
    initializeDrinkMenu();
    resetState();
    resetSelectionOnly();
    updateCategoryButtons("", "");
    clearOptionContainers();
    showAllDrinkGroups();
    updateServeDrinkButtons();
    const grid = document.getElementById("drinkGrid");
    if (grid)
        applyDrinkEmojis(grid);
}
export function initDrinkGrid() {
    initializeDrinkMenu();
    resetDrinkUI(true);
}
export function reactivateDrinkGrid() {
    const grid = document.getElementById("drinkGrid");
    if (!grid)
        return;
    grid.querySelectorAll(".pill").forEach((btn) => {
        btn.disabled = false;
        btn.style.pointerEvents = "";
        btn.classList.remove("disabled");
    });
}
export function updateServeDrinkButtons() {
    const btnAp = document.getElementById("serveAperitif");
    const btnTC = document.getElementById("serveTC");
    const btnMeal = document.getElementById("serveMealDrink");
    const store = resolveStore?.();
    const phase = store?.phase;
    let ok = false;
    if (drinkSel.cat && drinkSel.sub) {
        if (FIRST_LEVEL_OK.has(drinkSel.sub)) {
            ok = true;
        }
        else {
            const required = REQUIRED_BY_SUB.get(drinkSel.sub);
            if (required) {
                ok = Boolean(drinkSel[required]);
            }
        }
    }
    [btnAp, btnTC, btnMeal].forEach((btn) => {
        if (btn)
            btn.disabled = true;
    });
    if (phase === "aperitif" && btnAp)
        btnAp.disabled = !ok;
    if (phase === "tc" && btnTC)
        btnTC.disabled = !ok;
    if (phase === "repas" && btnMeal)
        btnMeal.disabled = !ok;
}
