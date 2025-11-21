
// @ts-nocheck
import { I18N } from "../i18n/locales";
import { applyDrinkEmojis, emojiForFlag, emojiForOpt } from "./emojis";

export { applyDrinkEmojis } from "./emojis";

type Condition =
  | {
      key: keyof DrinkState;
      equals?: string;
      notEquals?: string;
      in?: string[];
    }
  | null;

type DrinkOption = {
  value: string;
  labelKey: string;
  fallback: string;
  emojiKey: string;
  breakBefore?: boolean;
};

type DrinkToggle = {
  flag: keyof DrinkState;
  labelKey: string;
  fallback: string;
  emojiKey: string;
  linkedFlags?: Array<keyof DrinkState>;
  showWhen?: Condition;
};

type InfoSection = {
  id: string;
  kind: "info";
  titleKey: string;
  fallback: string;
  bodyKey?: string;
  bodyFallback?: string;
  showWhen?: Condition;
};

type ExclusiveSection = {
  id: string;
  kind: "exclusive";
  key: keyof DrinkState;
  titleKey: string;
  fallback: string;
  options: DrinkOption[];
  showWhen?: Condition;
};

type ToggleSection = {
  id: string;
  kind: "toggles";
  titleKey: string;
  fallback: string;
  toggles: DrinkToggle[];
  showWhen?: Condition;
};

type DrinkSection = ExclusiveSection | ToggleSection | InfoSection;

type DrinkSubsection = {
  id: string;
  labelKey: string;
  fallback: string;
  defaultOpen?: number;
  resetKeys: Array<keyof DrinkState>;
  sections: DrinkSection[];
};

type DrinkCategory = {
  id: string;
  cardId: string;
  headerId: string;
  containerId: string;
  subsections: Record<string, DrinkSubsection>;
};
const MILK_OPTIONS: DrinkOption[] = [
  { value: "creme", labelKey: "tcMilkCreme", fallback: "Cream", emojiKey: "milk:creme" },
  { value: "avoine", labelKey: "tcMilkAvoine", fallback: "Oat milk", emojiKey: "milk:avoine" },
  { value: "lait", labelKey: "tcMilkLait", fallback: "Milk", emojiKey: "milk:lait" },
  { value: "none", labelKey: "tcMilkNone", fallback: "None", emojiKey: "milk:none" },
];

const SWEET_OPTIONS: DrinkOption[] = [
  { value: "sucre", labelKey: "tcSweetSugar", fallback: "Sugar", emojiKey: "sweet:sucre" },
  { value: "succedane", labelKey: "tcSweetSub", fallback: "Substitute", emojiKey: "sweet:succedane" },
  { value: "none", labelKey: "tcSweetNone", fallback: "None", emojiKey: "sweet:none" },
];

const TEA_OPTIONS: DrinkOption[] = [
  { value: "english", labelKey: "tcTeaEnglish", fallback: "English Breakfast", emojiKey: "theType:english" },
  { value: "vert", labelKey: "tcTeaVert", fallback: "Green tea", emojiKey: "theType:vert" },
  { value: "menthe", labelKey: "tcTeaMenthe", fallback: "Mint tea", emojiKey: "theType:menthe" },
  { value: "hotwater", labelKey: "tcHotWater", fallback: "Hot water", emojiKey: "theType:hotwater", breakBefore: true },
  { value: "camomille", labelKey: "tcTeaCamomille", fallback: "Chamomile", emojiKey: "theType:camomille" },
];

const WATER_OPTIONS: DrinkOption[] = [
  { value: "plate", labelKey: "tcWaterStill", fallback: "Still", emojiKey: "waterType:plate" },
  { value: "gazeuse", labelKey: "tcWaterSpark", fallback: "Sparkling", emojiKey: "waterType:gazeuse" },
];

const COCA_OPTIONS: DrinkOption[] = [
  { value: "normal", labelKey: "tcCocaClassic", fallback: "Classic", emojiKey: "cocaType:normal" },
  { value: "zero", labelKey: "tcCocaZero", fallback: "Zero", emojiKey: "cocaType:zero" },
];

const JUICE_OPTIONS: DrinkOption[] = [
  { value: "orange", labelKey: "tcJuiceOrange", fallback: "Orange", emojiKey: "juiceType:orange" },
  { value: "pomme", labelKey: "tcJuiceApple", fallback: "Apple", emojiKey: "juiceType:pomme" },
  { value: "tomate", labelKey: "tcJuiceTomato", fallback: "Tomato", emojiKey: "juiceType:tomate" },
];

const BEER_OPTIONS: DrinkOption[] = [
  { value: "quoellfrisch", labelKey: "tcBeerQ", fallback: "Quöllfrisch Lager", emojiKey: "beer:quoellfrisch" },
  { value: "calvinus", labelKey: "tcBeerC", fallback: "Calvinus Blanche", emojiKey: "beer:calvinus" },
  { value: "leermond", labelKey: "tcBeerL", fallback: "Leermond (0%)", emojiKey: "beer:leermond" },
];

const VIN_ROUGE_OPTIONS: DrinkOption[] = [
  { value: "suisse", labelKey: "tcCH", fallback: "Swiss", emojiKey: "vinRouge:suisse" },
  { value: "etranger", labelKey: "tcForeign", fallback: "Foreign", emojiKey: "vinRouge:etranger" },
];

const VIN_BLANC_OPTIONS: DrinkOption[] = [
  { value: "suisse", labelKey: "tcCH", fallback: "Swiss", emojiKey: "vinBlanc:suisse" },
  { value: "etranger", labelKey: "tcForeign", fallback: "Foreign", emojiKey: "vinBlanc:etranger" },
];

const DIGESTIF_OPTIONS: DrinkOption[] = [
  { value: "whisky_jw", labelKey: "tcDigJW", fallback: "Johnnie Walker", emojiKey: "digestif:whisky_jw" },
  { value: "whisky_jb", labelKey: "tcDigJB", fallback: "Jim Beam", emojiKey: "digestif:whisky_jb" },
  { value: "cognac", labelKey: "tcDigCognac", fallback: "Cognac", emojiKey: "digestif:cognac" },
  { value: "baileys", labelKey: "tcDigBaileys", fallback: "Baileys", emojiKey: "digestif:baileys" },
];

const COCKTAIL_OPTIONS: DrinkOption[] = [
  { value: "campari", labelKey: "tcCampari", fallback: "Campari", emojiKey: "cocktail:campari" },
  { value: "bloody_mary", labelKey: "tcBloody", fallback: "Bloody Mary", emojiKey: "cocktail:bloody_mary" },
  { value: "screwdriver", labelKey: "tcScrew", fallback: "Screw Driver", emojiKey: "cocktail:screwdriver" },
  { value: "gin_tonic", labelKey: "tcGinTonic", fallback: "Gin Tonic", emojiKey: "cocktail:gin_tonic" },
  { value: "cuba_libre", labelKey: "tcCuba", fallback: "Cuba Libre", emojiKey: "cocktail:cuba_libre" },
];

const CAMPARI_MIX_OPTIONS: DrinkOption[] = [
  { value: "orange", labelKey: "tcJuiceOrange", fallback: "Orange", emojiKey: "campariMix:orange" },
  { value: "soda", labelKey: "tcSoda", fallback: "Soda", emojiKey: "campariMix:soda" },
];
const DRINK_TREE: DrinkCategory[] = [
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
        sections: [],
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
const CATEGORY_MAP = new Map<string, DrinkCategory>();
const SUBSECTION_MAP = new Map<string, DrinkSubsection>();

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

type DrinkState = typeof DRINK_STATE_TEMPLATE;

function cloneState(): DrinkState {
  return JSON.parse(JSON.stringify(DRINK_STATE_TEMPLATE));
}

export const drinkSel: DrinkState = cloneState();

let resolveStore: () => any = () => ({ phase: "fiche", config: { lang: "EN" } });

export function configureDrinkMenu(opts: { getStore: () => any }) {
  if (opts && typeof opts.getStore === "function") {
    resolveStore = opts.getStore;
  }
}

function translate(key: string, fallback: string) {
  const store = resolveStore?.();
  const lang = store?.config?.lang || "EN";
  const bundle = I18N[lang] || I18N.EN;
  return bundle?.[key] || fallback;
}

function evaluateCondition(condition: Condition): boolean {
  if (!condition) return true;
  const value = String(drinkSel[condition.key] ?? "");
  if (condition.equals !== undefined && value !== condition.equals) return false;
  if (condition.notEquals !== undefined && value === condition.notEquals) return false;
  if (condition.in && !condition.in.includes(value)) return false;
  return true;
}

const REQUIRED_BY_SUB = new Map<string, keyof DrinkState>([
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
type AccordionApi = {
  open: (id: string | number) => void;
  close: (id: string | number) => void;
  closeAll: () => void;
};

function createAccordion(
  root: HTMLElement,
  options: {
    sectionSelector?: string;
    headerSelector?: string;
    singleOpen?: boolean;
    defaultOpen?: number | string | null;
  } = {}
): AccordionApi | null {
  if (!root) return null;
  const sectionSelector = options.sectionSelector || ".accordion__section";
  const headerSelector = options.headerSelector || ".accordion__header";
  const singleOpen = options.singleOpen !== false;
  const sections = Array.from(root.querySelectorAll(sectionSelector)) as HTMLElement[];
  if (!sections.length) return null;

  const sectionData = sections.map((section, index) => {
    const header = section.querySelector(headerSelector) as HTMLElement | null;
    let body = section.querySelector(".accordion__body") as HTMLElement | null;
    if (!body) {
      const parts = Array.from(section.children).filter((child) => child !== header) as HTMLElement[];
      if (parts.length) {
        body = document.createElement("div");
        body.className = "accordion__body";
        parts.forEach((node) => body!.appendChild(node));
        if (header) header.after(body);
        else section.appendChild(body);
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
    if (body) body.hidden = true;
    return { id, section, header, body };
  });

  function setOpen(targetId: string | number, open: boolean) {
    const entry = sectionData.find((item) => item.id === String(targetId));
    if (!entry) return;
    const { section, header, body } = entry;
    section.dataset.open = open ? "true" : "false";
    if (header) header.setAttribute("aria-expanded", open ? "true" : "false");
    if (body) body.hidden = !open;
  }

  function toggle(targetId: string | number) {
    const entry = sectionData.find((item) => item.id === String(targetId));
    if (!entry) return;
    const isOpen = entry.section.dataset.open === "true";
    if (singleOpen && !isOpen) closeAll();
    setOpen(targetId, !isOpen);
  }

  function close(targetId: string | number) {
    setOpen(targetId, false);
  }

  function open(targetId: string | number) {
    if (singleOpen) closeAll();
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
let categoryAccordion: AccordionApi | null = null;
let currentSubKey: string | null = null;

function ensureCategoryAccordion() {
  if (categoryAccordion) return;
  const grid = document.getElementById("drinkGrid");
  if (!grid) return;
  DRINK_TREE.forEach((category) => {
    const card = document.getElementById(category.cardId);
    if (card) card.dataset.accordionId = category.id;
  });
  categoryAccordion = createAccordion(grid, {
    sectionSelector: ".group-card",
    headerSelector: ".group-title",
    singleOpen: true,
    defaultOpen: null,
  });
  if (categoryAccordion) categoryAccordion.closeAll();
}
function renderSubOptions(cat: string, sub: string) {
  const category = CATEGORY_MAP.get(cat);
  if (!category) return;
  const container = document.getElementById(category.containerId);
  if (!container) return;
  const subKey = `${cat}::${sub}`;
  const previouslyOpen =
    currentSubKey === subKey
      ? Array.from(container.querySelectorAll<HTMLElement>(".accordion__section"))
          .filter((section) => section.dataset.open === "true")
          .map((section) => section.dataset.accordionId || "")
          .filter(Boolean)
      : [];
  const subsection = SUBSECTION_MAP.get(subKey);
  if (!subsection) {
    container.innerHTML = "";
    return;
  }
  if (!subsection.sections.length) {
    container.innerHTML = "";
    currentSubKey = subKey;
    return;
  }

  container.innerHTML = "";
  const accordion = document.createElement("div");
  accordion.className = "accordion";

  subsection.sections.forEach((section, index) => {
    if (!evaluateCondition(section.showWhen || null)) return;
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
        if (option.breakBefore) {
          const breaker = document.createElement("span");
          breaker.className = "pill-break";
          row.appendChild(breaker);
        }
        const wrap = document.createElement("div");
        wrap.className = "pill-wrap";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pill";
        btn.dataset.action = "exclusive";
        btn.dataset.key = section.key as string;
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
    } else if (section.kind === "toggles") {
      section.toggles.forEach((toggle) => {
        if (!evaluateCondition(toggle.showWhen || null)) return;
        const wrap = document.createElement("div");
        wrap.className = "pill-wrap";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pill toggle";
        btn.dataset.action = "toggle";
        btn.dataset.flag = toggle.flag as string;
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
        const active =
          toggle.linkedFlags && toggle.linkedFlags.length
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
  const accordionCtrl = createAccordion(accordion, { singleOpen: true, defaultOpen: null });
  let defaultOpenId: string | null = null;
  if (subsection.defaultOpen !== undefined && subsection.defaultOpen !== null) {
    if (typeof subsection.defaultOpen === "number") {
      const defaultSection = subsection.sections?.[subsection.defaultOpen];
      defaultOpenId = defaultSection?.id || String(subsection.defaultOpen);
    } else {
      defaultOpenId = String(subsection.defaultOpen);
    }
  }
  const targetsToOpen =
    previouslyOpen.length > 0
      ? previouslyOpen
      : defaultOpenId !== null
      ? [defaultOpenId]
      : [];
  if (accordionCtrl) {
    targetsToOpen.forEach((target) => accordionCtrl.open(target));
  }
  applyDrinkEmojis(container);
  currentSubKey = subKey;
}
function resetState(keys?: Array<keyof DrinkState>) {
  // If a specific list is provided, reset only those keys; an empty list means reset nothing.
  if (Array.isArray(keys)) {
    if (!keys.length) return;
    keys.forEach((key) => {
      drinkSel[key] = cloneState()[key];
    });
    return;
  }
  (Object.keys(DRINK_STATE_TEMPLATE) as Array<keyof DrinkState>).forEach((key) => {
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
    if (container) container.innerHTML = "";
  });
}

function updateCategoryButtons(cat: string, sub: string) {
  const grid = document.getElementById("drinkGrid");
  if (!grid) return;
  grid.querySelectorAll<HTMLButtonElement>(".pill.big").forEach((btn) => {
    const isActive = btn.dataset.cat === cat && btn.dataset.sub === sub;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}
function handleCategoryClick(btn: HTMLButtonElement) {
  const cat = btn.dataset.cat || "";
  const sub = btn.dataset.sub || "";
  if (!cat || !sub) return;
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

function handleExclusive(btn: HTMLElement) {
  const key = btn.dataset.key as keyof DrinkState;
  const value = btn.dataset.value || "";
  if (!key) return;
  const current = (drinkSel[key] as string) || "";
  drinkSel[key] = current === value ? "" : value;
  const cat = drinkSel.cat;
  const sub = drinkSel.sub;
  if (cat && sub) {
    renderSubOptions(cat, sub);
  }
  updateServeDrinkButtons();
}

function handleToggle(btn: HTMLElement) {
  const flag = btn.dataset.flag as keyof DrinkState;
  if (!flag) return;
  const next = !drinkSel[flag];
  drinkSel[flag] = next;
  const linked = (btn.dataset.linkedFlags || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean) as Array<keyof DrinkState>;
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
  if (menuBound) return;
  menuBound = true;
  ensureCategoryAccordion();

  const grid = document.getElementById("drinkGrid");
  if (!grid) return;

  grid.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const actionEl = target.closest<HTMLElement>("[data-action]");
    if (actionEl && grid.contains(actionEl)) {
      const action = actionEl.dataset.action;
      if (action === "exclusive") handleExclusive(actionEl);
      else if (action === "toggle") handleToggle(actionEl);
      return;
    }
    const bigBtn = target.closest<HTMLButtonElement>(".pill.big");
    if (bigBtn && grid.contains(bigBtn)) {
      handleCategoryClick(bigBtn);
    }
  });
}

export function focusDrinkGroup(byCat: string) {
  ensureCategoryAccordion();
  if (!categoryAccordion) return;
  categoryAccordion.open(byCat);
}

export function showAllDrinkGroups() {
  ensureCategoryAccordion();
  if (!categoryAccordion) return;
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
  if (grid) applyDrinkEmojis(grid);
}

export function initDrinkGrid() {
  initializeDrinkMenu();
  resetDrinkUI(true);
}

export function reactivateDrinkGrid() {
  const grid = document.getElementById("drinkGrid");
  if (!grid) return;
  grid.querySelectorAll<HTMLButtonElement>(".pill").forEach((btn) => {
    btn.disabled = false;
    (btn as HTMLElement).style.pointerEvents = "";
    btn.classList.remove("disabled");
  });
}

export function updateServeDrinkButtons() {
  const btnAp = document.getElementById("serveAperitif") as HTMLButtonElement | null;
  const btnTC = document.getElementById("serveTC") as HTMLButtonElement | null;
  const btnMeal = document.getElementById("serveMealDrink") as HTMLButtonElement | null;
  const store = resolveStore?.();
  const phase = store?.phase;

  // Fallback: si drinkSel est vide (ex: Caotina rouverte sans sous-options), relire le select chaud
  let cat = drinkSel.cat;
  let sub = drinkSel.sub;
  const chaudSelect = document.getElementById("tc_chaud_type") as HTMLSelectElement | null;
  if ((!cat || !sub) && chaudSelect?.value) {
    cat = "chaud";
    sub = chaudSelect.value;
  }
  const catSelect = document.getElementById("tc_cat") as HTMLSelectElement | null;
  if (catSelect?.value) {
    if (!cat) cat = catSelect.value;
    if (!sub) sub = catSelect.value; // ex: chocolat (sans sous-options)
  }

  let ok = false;
  if (cat && sub) {
    if (FIRST_LEVEL_OK.has(sub) || sub === "chocolat" || cat === "chocolat") {
      ok = true;
    } else {
      const required = REQUIRED_BY_SUB.get(sub);
      if (required) {
        ok = Boolean(drinkSel[required]);
      }
    }
  }

  [btnAp, btnTC, btnMeal].forEach((btn) => {
    if (btn) btn.disabled = true;
  });

  if (phase === "aperitif" && btnAp) btnAp.disabled = !ok;
  if (phase === "tc" && btnTC) btnTC.disabled = !ok;
  if (phase === "repas" && btnMeal) btnMeal.disabled = !ok;
}
