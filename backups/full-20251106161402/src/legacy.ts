// @ts-nocheck
import {
  applyDrinkEmojis,
  configureDrinkMenu,
  drinkSel,
  focusDrinkGroup,
  initDrinkGrid,
  initializeDrinkMenu,
  reactivateDrinkGrid,
  resetDrinkUI,
  showAllDrinkGroups,
  updateServeDrinkButtons,
} from "./features/drinks/menu";
import { I18N } from "./features/i18n/locales";

// Fonction pour rendre un lment cliquable sur PC et tactile
function addClickAndTouchListener(element, handler) {
  element.addEventListener("click", handler);
  element.addEventListener(
    "touchstart",
    function (e) {
      e.preventDefault(); // vite le double-clic fantme
      handler(e);
    },
    { passive: false }
  );
}

const SPML_CODES = [
  "AVML",
  "BBML",
  "CHML",
  "GFML",
  "HNML",
  "KSML",
  "LFML",
  "LSML",
  "MOML",
  "NLML",
  "VGML",
  "VJML",
  "VLML",
];
const $ = (sel) => document.querySelector(sel);
const store = {
  title: { flightNo: "", date: "" },
  config: {
    rowsBiz: 4,
    layout: "A220",
    lang: "EN",
    theme: "dark",
    histAsc: false,
  },
  inventory: {
    plateaux: 0,
    hot_viande: 0,
    hot_vege: 0,
    hot_special: 0,
    spml: {},
    pre: {},
  },
  menu: { viandeLabel: "", vegeLabel: "" },
  seats: {},
  phase: "fiche",
  reminders: [],
  history: [],
  clientView: false,
};
configureDrinkMenu({ getStore: () => store });

// === Demande de stockage persistant (si support) ===
(async () => {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const already = await navigator.storage.persisted();
      if (!already) {
        await navigator.storage.persist();
      }
    }
  } catch (e) {
    console.warn("Persistent storage request failed:", e);
  }
})();

for (const code of SPML_CODES) {
  store.inventory.spml[code] = store.inventory.spml[code] || 0;
}

// ===== Mini Datepicker (lang EN/FR/DE, valeur ISO yyyy-mm-dd) =====
(function () {
  const el = document.getElementById("flightDate");
  if (!el) return;

  // Lang  libells + 1er jour de semaine (EN: dimanche / FR-DE: lundi)
  function dpLocale() {
    const lang = (store?.config?.lang || "EN").toUpperCase();
    if (lang === "FR")
      return {
        months: [
          "janv.",
          "fvr.",
          "mars",
          "avr.",
          "mai",
          "juin",
          "juil.",
          "aot",
          "sept.",
          "oct.",
          "nov.",
          "dc.",
        ],
        wk: ["L", "M", "M", "J", "V", "S", "D"],
        weekStart: 1,
      };
    if (lang === "DE")
      return {
        months: [
          "Jan",
          "Feb",
          "Mr",
          "Apr",
          "Mai",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Okt",
          "Nov",
          "Dez",
        ],
        wk: ["M", "D", "M", "D", "F", "S", "S"],
        weekStart: 1,
      };
    return {
      // EN
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      wk: ["S", "M", "T", "W", "T", "F", "S"],
      weekStart: 0,
    };
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }
  function toISO(y, m, d) {
    return `${y}-${pad(m + 1)}-${pad(d)}`;
  } // m=0..11
  function today() {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
  }
  function parseISO(str) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str || "");
    if (!m) return null;
    return { y: +m[1], m: +m[2] - 1, d: +m[3] };
  }

  const isoInit = document.getElementById("flightDateISO")?.value || el.value;
  let state = parseISO(isoInit) || today();

  // Cre/positionne le popup
  let popup;
  function openDP() {
    closeDP();
    popup = document.createElement("div");
    popup.className = "dp";
    document.body.appendChild(popup);
    renderDP();
    // position : sous l'input
    const r = el.getBoundingClientRect();
    popup.style.left = window.scrollX + r.left + "px";
    popup.style.top = window.scrollY + r.bottom + 6 + "px";

    // fermer si clic  l'extrieur / ESC
    setTimeout(() => {
      document.addEventListener("mousedown", onDocDown);
      document.addEventListener("keydown", onKey);
    }, 0);
  }
  function closeDP() {
    document.removeEventListener("mousedown", onDocDown);
    document.removeEventListener("keydown", onKey);
    if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    popup = null;
  }
  function onDocDown(e) {
    if (!popup) return;
    if (e.target === popup || popup.contains(e.target) || e.target === el)
      return;
    closeDP();
  }
  function onKey(e) {
    if (e.key === "Escape") closeDP();
  }

  function renderDP() {
    if (!popup) return;
    const L = dpLocale();
    popup.innerHTML = "";

    // header (mois)
    const h = document.createElement("header");
    const prev = document.createElement("button");
    prev.textContent = "";
    const next = document.createElement("button");
    next.textContent = "";
    const mtxt = document.createElement("div");
    mtxt.className = "m";
    mtxt.textContent = `${L.months[state.m]} ${state.y}`;
    prev.addEventListener("click", () => {
      state.m--;
      if (state.m < 0) {
        state.m = 11;
        state.y--;
      }
      renderDP();
    });
    next.addEventListener("click", () => {
      state.m++;
      if (state.m > 11) {
        state.m = 0;
        state.y++;
      }
      renderDP();
    });
    h.appendChild(prev);
    h.appendChild(mtxt);
    h.appendChild(next);
    popup.appendChild(h);

    // grille jours
    const g = document.createElement("div");
    g.className = "grid";
    // enttes jours
    const wk = L.wk.slice();
    if (L.weekStart === 1) {
      const s = wk.shift();
      wk.push(s);
    } // dcaler pour Lundi
    wk.forEach((w) => {
      const c = document.createElement("div");
      c.className = "w";
      c.textContent = w;
      g.appendChild(c);
    });

    // premiers jours
    const first = new Date(state.y, state.m, 1);
    const startDay = (first.getDay() - (L.weekStart || 0) + 7) % 7; // 0..6
    const daysInMonth = new Date(state.y, state.m + 1, 0).getDate();
    const daysPrev = new Date(state.y, state.m, 0).getDate();

    // jours du mois prcdent (gris)
    for (let i = 0; i < startDay; i++) {
      const d = document.createElement("div");
      d.className = "d out";
      d.textContent = String(daysPrev - startDay + 1 + i);
      g.appendChild(d);
    }
    // jours du mois courant
    const t = today();
    const isoSel = document.getElementById("flightDateISO")?.value || el.value;
    const sel = parseISO(isoSel);
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("div");
      cell.className = "d";
      cell.textContent = String(d);
      if (t.y === state.y && t.m === state.m && t.d === d)
        cell.classList.add("today");
      if (sel && sel.y === state.y && sel.m === state.m && sel.d === d)
        cell.classList.add("sel");
      cell.addEventListener("click", () => {
        const iso = toISO(state.y, state.m, d);
        document.getElementById("flightDateISO").value = iso; // stocke l'ISO
        el.value = fmtDateLocalized(iso); // affiche localis dans l'input
        updateFlightDatePretty();
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        closeDP();
      });
      g.appendChild(cell);
    }
    // complter la fin de ligne avec le mois suivant
    const filled = startDay + daysInMonth;
    const trailing = (7 - (filled % 7)) % 7;
    for (let d = 1; d <= trailing; d++) {
      const c = document.createElement("div");
      c.className = "d out";
      c.textContent = String(d);
      g.appendChild(c);
    }

    popup.appendChild(g);
  }

  // ouverture
  el.addEventListener("focus", openDP);
  el.addEventListener("click", openDP);

  // re-render si la langue change
  window._rerenderDatepickerLang = function () {
    // garde la date actuelle, re-render si le popup est ouvert
    if (popup) renderDP();
    // placeholder selon langue
    const lang = (store?.config?.lang || "EN").toUpperCase();
    el.placeholder =
      lang === "FR"
        ? "AAAA-MM-JJ"
        : lang === "DE"
        ? "JJJJ-MM-TT"
        : "YYYY-MM-DD";
    const iso = document.getElementById("flightDateISO")?.value;
    if (iso) {
      document.getElementById("flightDate").value = fmtDateLocalized(iso);
      updateFlightDatePretty();
    }
  };
})();

function enforceWineExclusivity(fromInit = false) {
  const vr = document.getElementById("tc_vin_rouge");
  const vb = document.getElementById("tc_vin_blanc");
  if (!vr || !vb) return;

  const r = vr.value;
  const b = vb.value;

  // Si les deux ont t sauvs par le pass, on garde Rouge par dfaut
  if (fromInit && r && b) {
    vb.value = "";
  }

  // Rgle dexclusivit
  vb.disabled = !!vr.value;
  vr.disabled = !!vb.value;
}

function clearTcUI() {
  // vider selects principaux (on ajoute les 3 sous-selects SOFT)
  [
    "tc_cat",
    "tc_milk",
    "tc_sweet",
    "tc_the_type",
    "tc_digestif_type",
    "tc_beer",
    "tc_vin_rouge",
    "tc_vin_blanc",
    "tc_cocktail_type",
    "tc_soft_eau",
    "tc_soft_jus",
    "tc_soft_coca", //  ajout
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  // dcocher glaces / citron / sel / poivre
  [
    "tc_digestif_ice",
    "tc_champ_ice",
    "tc_vin_ice",
    "tc_cocktail_ice",
    "tc_cocktail_lemon",
    "tc_cocktail_salt",
    "tc_cocktail_pepper",
    //  tous les checkboxes SOFT ajouts
    "tc_soft_ice",
    "tc_soft_lemon",
    "tc_soft_ice2",
    "tc_soft_lemon2",
    "tc_soft_salt",
    "tc_soft_pepper",
    "tc_soft_ice3",
    "tc_soft_lemon3",
    "tc_soft_ice4",
    "tc_soft_lemon4",
    "tc_soft_ice5",
    "tc_soft_lemon5",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });

  // nouveau flux 2 tages : remettre  blanc les slecteurs de niveau 1
  ["tc_group", "tc_alcool_type", "tc_chaud_type", "tc_soft_type"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    }
  );

  // masquer les blocs de niveau 1
  document.getElementById("tc_alcool") &&
    (document.getElementById("tc_alcool").style.display = "none");
  document.getElementById("tc_chaud") &&
    (document.getElementById("tc_chaud").style.display = "none");

  // cacher tous les sous-blocs
  tc_showSub("");

  // exclusivit vin rouge/blanc propre
  enforceWineExclusivity(true);

  // Cacher linfo-bulle cocktail et son bouton
  const _tipBtn = document.getElementById("tc_tipBtn");
  const _tipDiv = document.getElementById("tc_tip");
  if (_tipBtn) _tipBtn.style.display = "none";
  if (_tipDiv) _tipDiv.style.display = "none";
}
function ensureDrinkGridActive() {
  const mb = document.getElementById("modalBack");
  const modalOpen =
    !!mb && (mb.style.display === "flex" || mb.style.display === "");
  if (!modalOpen) return;
  const grid = document.getElementById("drinkGrid");
  if (!grid) return;
  try {
    initializeDrinkMenu();
    initDrinkGrid();
    reactivateDrinkGrid();
    showAllDrinkGroups();
    updateServeDrinkButtons();
  } catch (e) {
    console.warn("ensureDrinkGridActive:", e);
  }
}

function updateServeDrinkLabel() {
  const btn = document.getElementById("serveTC");
  if (!btn) return;
  const L = I18N[store.config.lang || "EN"];
  btn.textContent =
    store.phase === "repas"
      ? L.serveMealDrink || "Serve drink"
      : L.serveTC || "Serve tea & coffee";
}

function getCocktailTip(code) {
  const tips = (window.COCKTAIL_TIPS || {})[store.config.lang || "EN"] || {};
  const arr = tips[code] || [];
  return `<div class="tip-list">${arr
    .map((l) => `<div>${l}</div>`)
    .join("")}</div>`;
}

function nowStr() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function keyFor(row, col) {
  return row + col;
}
function ensureSeatShape(s) {
  if (!s || typeof s !== "object") s = {};
  if (typeof s.occupied !== "boolean") s.occupied = false;
  if (!s.type) s.type = "normal";
  if (!s.status) s.status = "none";
  if (s.lang === undefined) s.lang = "";
  if (s.notes === undefined) s.notes = "";
  if (s.sleep === undefined) s.sleep = false;
  if (s.spml === undefined) s.spml = "";
  if (s.preLabel === undefined) s.preLabel = "";
  if (s.normalMeal === undefined) s.normalMeal = "";
  if (s.aperoNotes === undefined) s.aperoNotes = "";
  if (s.tcNotes === undefined) s.tcNotes = "";
  if (!s.alloc || typeof s.alloc !== "object")
    s.alloc = { normalKey: null, spmlCode: null, preLabel: null };
  if (!s.served) s.served = { aperitif: null, meal: null };
  if (typeof s.served.trayUsed !== "boolean") s.served.trayUsed = false;
  if (s.serveLaterAt === undefined) s.serveLaterAt = null;
  if (typeof s.served.tc === "undefined") s.served.tc = null; // horodatage th/caf
  if (typeof s.served.trayCleared === "undefined") s.served.trayCleared = false; // plateau dbarrass
  if (!s.apDrink)
    s.apDrink = {
      cat: "", // cafe|deca|the|infusion|digestif|biere|champagne|vin
      milk: "", // creme|avoine|lait|none|""
      sweet: "", // sucre|succedane|none|""
      theType: "", // english|vert|menthe
      digestif: "", // whisky_jw|whisky_jb|cognac|baileys
      whiskyStyle: "", // pur|rocks|""
      baileysIce: false,
      beer: "", // quoellfrisch|calvinus_blanche|leermond_0
      vinRouge: "", // ""|suisse|etranger
      vinBlanc: "", // ""|suisse
      vinNotes: "",
      cognacIce: false,
      champIce: false,
      vinIce: false,
      // Soft
      softType: "", // eau|jus|coca|sprite|tonic
      waterType: "", // plate|gazeuse
      juiceType: "", // pomme|orange|tomate
      cocaType: "", // normal|zero
      softIce: false,
      softLemon: false,
      juiceIce: false,
      juiceLemon: false,
      juiceSalt: false,
      juicePepper: false,
      spriteIce: false,
      spriteLemon: false,
      // Cocktails
      cocktail: "", // campari|bloody_mary|gin_tonic|cuba_libre
      cocktailIce: false,
      cocktailLemon: false,
      cocktailSalt: false,
      cocktailPepper: false,
      campariMix: "", // "orange" | "soda"
      virginMary: false, //  AJOUT
      // Chocolat chaud
      choco: false,
    };
  if (s.eatWith === undefined) s.eatWith = ""; // cl sige partenaire (ex: "4C") ou ""
  return s;
}
function seatObj(row, col) {
  const k = keyFor(row, col);
  const shaped = ensureSeatShape(store.seats[k]);
  store.seats[k] = shaped;
  return shaped;
}
function save() {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(store));
    localStorage.setItem("serviceflow::lastKey", storageKey());
  } catch (e) {
    // Certains viewers iOS brident localStorage (quota / file://)
    // On ne fait pas planter l'app ; on continue en mmoire.
    console.warn("localStorage indisponible:", e);
  }
  refreshBadges();
}

// === Autosave  la vole (quand longlet se masque/quitte) ===
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    try {
      save();
    } catch (e) {}
  }
});

// iOS/Edge dclenchent 'pagehide' lors de mises en veille / back-forward cache
window.addEventListener(
  "pagehide",
  () => {
    try {
      save();
    } catch (e) {}
  },
  { capture: true }
);

// Optionnel : prvenir lutilisateur sil quitte avec des donnes non exportes
window.addEventListener("beforeunload", (e) => {
  // tu peux commenter cette section si tu ne veux pas dalerte
  if ((store.history || []).length > 0) {
    e.preventDefault();
    e.returnValue = "";
  }
});

function loadKeyData(k) {
  const d = localStorage.getItem(k);
  return d ? JSON.parse(d) : null;
}
function storageKey() {
  const t = store.title || { flightNo: "", date: "" };
  return `serviceflow::${t.flightNo || "no-flight"}::${t.date || "no-date"}`;
}
function switchStorageIfTitleChanged(oldKey) {
  if (oldKey && oldKey !== storageKey()) {
    localStorage.setItem(storageKey(), JSON.stringify(store));
  }
}

function onSaveTitleSnapshot() {
  const oldKey = storageKey();

  // 1) lire les champs
  store.title.flightNo = $("#flightNo").value.trim();
  const iso =
    document.getElementById("flightDateISO")?.value || $("#flightDate").value;
  store.title.date = iso;

  // 2) basculer de cl si vol/date changent, puis sauvegarder
  switchStorageIfTitleChanged(oldKey);
  save();

  // 3) historiser en vnement  libell traduit  laffichage
  addHistoryEvt({
    type: "titleSet",
    flightNo: store.title.flightNo || "",
    dateISO: store.title.date || "",
  });
}

// === Boutons header : attache sre (vite null.addEventListener) ===
(function attachHeaderButtons() {
  // Sauvegarde interne ()
  document
    .getElementById("saveSnapshot")
    ?.addEventListener("click", onSaveTitleSnapshot);

  // Import JSON ()
  document.getElementById("importJSON")?.addEventListener("click", () => {
    const f = document.getElementById("importFile");
    if (!f) return;
    f.value = ""; // important sur iOS si on rimporte le mme fichier
    f.click();
  });

  document.getElementById("importFile")?.addEventListener("change", (e) => {
    //  AJOUTER CES 4 LIGNES TOUT DE SUITE APRS LOUVERTURE DU HANDLER
    if (window.__importingJSON) return;
    window.__importingJSON = true;
    const releaseImportLock = () =>
      setTimeout(() => {
        window.__importingJSON = false;
      }, 0);

    const file = e.target.files?.[0];
    if (!file) {
      releaseImportLock();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || "{}"));
        const oldKey = storageKey();

        // remplace l'tat courant
        for (const k of Object.keys(store)) delete store[k];
        Object.assign(store, data);

        //  AJOUT : normaliser lobjet import (valeurs par dfaut)
        if (typeof normalizeImportedStore === "function")
          normalizeImportedStore(store);

        // MAJ UI vol/date (dj prsent)
        document.getElementById("flightNo").value =
          store?.title?.flightNo || "";
        const iso = store?.title?.date || "";
        document.getElementById("flightDateISO").value = iso;
        document.getElementById("flightDate").value = iso;

        //  AJOUT : remettre  jour les libells viande/vg visibles
        const lv = document.getElementById("labelViande");
        const lg = document.getElementById("labelVege");
        if (lv) lv.value = store?.menu?.viandeLabel || "";
        if (lg) lg.value = store?.menu?.vegeLabel || "";

        // persistance + re-render
        switchStorageIfTitleChanged(oldKey);
        save();
        applyI18n?.();
        renderSeatmap?.();
        renderServiceFlow?.();
        renderHistory?.();

        //  AJOUT : alerte traduisible
        const langKey = (store?.config?.lang || "EN").toUpperCase();
        const L = I18N[store.config.lang || "EN"] || I18N.EN;
        alert(L.jsonRestored || "Session restaure depuis le JSON.");
      } catch (err) {
        console.error(err);
        const langKey = (store?.config?.lang || "EN").toUpperCase();
        const L = I18N[langKey] || I18N.EN;
        alert(L.invalidFile || "Invalid file.");
      } finally {
        // (dj prsent) permet de rimporter le mme fichier
        e.target.value = "";
        releaseImportLock(); //  LIBRE LE VERROU ICI
      }
    };
    reader.readAsText(file);
  });

  // Seatmap PNG ()  on garde ton handler existant si tu en as un
  document.getElementById("exportPNG")?.addEventListener("click", () => {
    try {
      if (typeof exportSeatmapPNG === "function") exportSeatmapPNG();
      else console.warn("exportSeatmapPNG() non dfinie");
    } catch (e) {}
  });
})();

function addHistory(text) {
  // compatibilit avec l'ancien format string
  store.history.unshift({ ts: Date.now(), type: "text", text });
  renderHistory();
}

function addHistoryEvt(evt) {
  // evt = { ts?:number, type:string, seat?:string, label?:string, notes?:string }
  const e = Object.assign({ ts: Date.now() }, evt);
  store.history.unshift(e);
  renderHistory();
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
    o.stop(ctx.currentTime + 0.16);
  } catch (e) {}
}

function sumSPML() {
  return Object.values(store.inventory.spml || {}).reduce(
    (a, b) => a + (b || 0),
    0
  );
}
function sumPRE() {
  return Object.values(store.inventory.pre || {}).reduce(
    (a, b) => a + (b || 0),
    0
  );
}

function rightCols() {
  // A220 : 2 siges ct droit ; A320 : 3 siges ct droit (C B A)
  return store.config.layout === "A320" ? ["C", "B", "A"] : ["C", "A"];
}
function updateSeatmapTitle() {
  const el = document.getElementById("seatmapTitle");
  if (!el) return;
  const L = I18N[store.config.lang || "EN"] || I18N.EN;

  const left = "F E D";
  const right = store.config.layout === "A320" ? "C B A" : "C A";

  // gabarit localis, ex: "Plan cabine ({L} | {R})"
  const tpl = L.seatmapTitle || "Seatmap ({L} | {R})";
  el.textContent = tpl.replace("{L}", left).replace("{R}", right);
}

function currentSeatFilter() {
  const active = document.querySelector<HTMLButtonElement>(
    "#filterTabs .subtab.active"
  );
  return active?.dataset.filter || "all";
}

function setActiveFilterTab(filter: string) {
  document
    .querySelectorAll<HTMLButtonElement>("#filterTabs .subtab")
    .forEach((btn) => {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
}

function setActivePhaseTab(phase: string) {
  document
    .querySelectorAll<HTMLButtonElement>("#phaseChips .tab")
    .forEach((btn) => {
      const isActive = btn.dataset.phase === phase;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
}

const STATUS_PILL_CLASS: Record<string, string> = {
  FTL: "status-pill status-pill--ftl",
  SEN: "status-pill status-pill--sen",
  HON: "status-pill status-pill--hon",
  FCL: "status-pill status-pill--fcl",
  VIP: "status-pill status-pill--vip",
  PAD: "status-pill status-pill--pad",
  OTHER: "status-pill status-pill--other",
};

function updateModalStatusBadge(): void {
  const meta = document.getElementById("modalSeatMeta");
  if (!meta) return;
  meta.innerHTML = "";
  const select = document.getElementById(
    "m_status"
  ) as HTMLSelectElement | null;
  const status = select?.value;
  if (!status || status === "none") return;
  const key = status.toUpperCase();
  const pill = document.createElement("span");
  pill.className =
    STATUS_PILL_CLASS[key as keyof typeof STATUS_PILL_CLASS] ||
    STATUS_PILL_CLASS.OTHER;
  pill.textContent = status;
  meta.appendChild(pill);
}

function syncLanguageButtons(): void {
  const select = document.getElementById("m_lang") as HTMLSelectElement | null;
  const current = select?.value || "";
  document
    .querySelectorAll<HTMLButtonElement>(".language-btn")
    .forEach((btn) => {
      const lang = btn.dataset.lang || "";
      const isActive = lang === current && current !== "";
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
}

function syncLayoutButtons(): void {
  const hidden = document.getElementById(
    "layoutSelect"
  ) as HTMLInputElement | null;
  const current = hidden?.value || store.config.layout || "A220";
  document.querySelectorAll<HTMLButtonElement>(".layout-btn").forEach((btn) => {
    const layout = btn.dataset.layout || "";
    const isActive = layout === current;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function syncLaterButtons(): void {
  const select = document.getElementById("m_later") as HTMLSelectElement | null;
  const value = select?.value || "";
  const occupied = isModalSeatOccupied();
  document.querySelectorAll<HTMLButtonElement>(".later-btn").forEach((btn) => {
    const btnValue = btn.dataset.value || "";
    const isActive = btnValue === value && value !== "";
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    btn.disabled = !occupied;
  });
  if (select) select.disabled = !occupied;
  const container = document.getElementById("laterCustomContainer");
  const timeInput = document.getElementById(
    "m_later_time"
  ) as HTMLInputElement | null;
  const shouldShowCustom = value === "custom" && occupied;
  if (container) container.classList.toggle("active", shouldShowCustom);
  if (timeInput) {
    timeInput.disabled = !shouldShowCustom;
    if (!shouldShowCustom && document.activeElement === timeInput) {
      timeInput.blur();
    }
  }
}

function isModalSeatOccupied(): boolean {
  const checkbox = document.getElementById(
    "m_occ_chk"
  ) as HTMLInputElement | null;
  return !!checkbox?.checked;
}

function updateModalOccupancyControls(): void {
  const occupied = isModalSeatOccupied();

  document
    .querySelectorAll<HTMLButtonElement>(".language-btn")
    .forEach((btn) => {
      btn.disabled = !occupied;
    });

  const langSelect = document.getElementById(
    "m_lang"
  ) as HTMLSelectElement | null;
  if (langSelect) langSelect.disabled = !occupied;

  document
    .querySelectorAll<HTMLInputElement>('input[name="m_type"]')
    .forEach((input) => {
      input.disabled = !occupied;
    });

  const statusSelect = document.getElementById(
    "m_status"
  ) as HTMLSelectElement | null;
  if (statusSelect) statusSelect.disabled = !occupied;

  const eatWithSelect = document.getElementById(
    "m_eatWith"
  ) as HTMLSelectElement | null;
  if (eatWithSelect) eatWithSelect.disabled = !occupied;

  const moveBtn = document.getElementById(
    "movePaxBtn"
  ) as HTMLButtonElement | null;
  if (moveBtn) {
    moveBtn.disabled = !occupied;
    moveBtn.setAttribute("aria-disabled", (!occupied).toString());
  }

  if (!occupied) {
    const select = document.getElementById(
      "m_later"
    ) as HTMLSelectElement | null;
    if (select && select.value) {
      select.value = "";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      if (modalSeat) {
        modalSeat.data.serveLaterAt = null;
      }
      const view = document.getElementById("m_later_view");
      if (view) {
        view.textContent = "";
        view.style.display = "none";
      }
    }
  }

  setLaterButtonState();
  syncLaterButtons();
}

const legendButton = document.getElementById(
  "legendToggle"
) as HTMLButtonElement | null;
const legendPopover = document.getElementById("legendPopover");
const legendSeatmapContainer = document.querySelector(
  ".seatmap"
) as HTMLElement | null;

function positionLegendPopover(): void {
  if (!legendButton || !legendPopover || !legendSeatmapContainer) return;
  const btnRect = legendButton.getBoundingClientRect();
  const containerRect = legendSeatmapContainer.getBoundingClientRect();
  const width = legendPopover.offsetWidth || 0;
  const gap = 12;
  const top = Math.max(gap, btnRect.bottom - containerRect.top + gap);
  let left = btnRect.right - containerRect.left - width;
  const maxLeft = containerRect.width - width - gap;
  if (!Number.isFinite(left)) left = gap;
  left = Math.max(gap, Math.min(left, maxLeft));
  legendPopover.style.top = `${top}px`;
  legendPopover.style.left = `${left}px`;
}

function setLegendPopoverState(open: boolean): void {
  if (!legendButton || !legendPopover) return;
  legendPopover.dataset.open = open ? "true" : "false";
  legendPopover.setAttribute("aria-hidden", open ? "false" : "true");
  legendButton.setAttribute("aria-expanded", open ? "true" : "false");
  legendButton.classList.toggle("active", open);
  const showLabel = legendButton.dataset.labelShow || "Show legend";
  const hideLabel = legendButton.dataset.labelHide || "Hide legend";
  const label = open ? hideLabel : showLabel;
  legendButton.textContent = label;
  legendButton.title = label;
  legendButton.setAttribute("aria-label", label);
  if (open) {
    requestAnimationFrame(positionLegendPopover);
  } else {
    legendPopover.style.top = "";
    legendPopover.style.left = "";
  }
}

function isLegendPopoverOpen(): boolean {
  return legendPopover?.dataset.open === "true";
}

function fmtDateLocalized(iso) {
  const lang = (store?.config?.lang || "EN").toUpperCase();
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const y = m[1],
    mo = m[2],
    d = m[3];

  if (lang === "FR") return `${d}/${mo}/${y}`; // 21/08/2025
  if (lang === "DE") return `${d}.${mo}.${y}`; // 21.08.2025

  // EN (lisible)
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[parseInt(mo, 10) - 1]} ${parseInt(d, 10)}, ${y}`; // Aug 21, 2025
}

function updateFlightDatePretty() {
  const span = document.getElementById("flightDatePretty");
  const input = document.getElementById("flightDate");
  if (span && input) span.textContent = fmtDateLocalized(input.value);
}

// --- I18N ---

// I18N  DOM bindings (slecteur  cl)
const I18N_BINDINGS = [
  // =========================
  // HEADER (barre du haut)
  // =========================
  ["lblFlight", "flight"],
  ["lblDate", "date"],
  ["saveTitle", "saveTitle"],
  ["resetFlight", "reset"],
  ["lblLang", "lblLang"],

  // =========================
  // CHIPS & FILTRES (range actions)
  // =========================
  ['#phaseChips .tab[data-phase="fiche"]', "chips_fiche"],
  ['#phaseChips .tab[data-phase="aperitif"]', "chips_apero"],
  ['#phaseChips .tab[data-phase="repas"]', "chips_meal"],
  ['#phaseChips .tab[data-phase="tc"]', "chips_tc"],

  // =========================
  // FILTRES (options du select)
  // =========================
  ["#filterTabs .subtab[data-filter='all']", "filter_all"],
  ["#filterTabs .subtab[data-filter='toServe']", "filter_toserve"],
  ["#filterTabs .subtab[data-filter='later']", "filter_later"],
  ["#filterTabs .subtab[data-filter='clear']", "filter_clear"],

  // =========================
  // FLOW / SEATMAP / LABELS
  // =========================
  ["flowTitle", "flowTitle"],
  ["flowNowTitle", "flowNowTitle"],
  ["flowLaterTitle", "flowLaterTitle"],
  ["flowClearTitle", "flowClearTitle"],

  // =========================
  // ASIDE (config & inventaire)
  // =========================
  ["hdrConfig", "hdrConfig"],
  ["lblLayout", "lblLayout"],
  ["lblRows", "lblRows"],
  ["secMenuTitle", "secMenuTitle"],
  ["lblViande", "lblViande"],
  ["lblVege", "lblVege"],
  ["hdrInventaire", "hdrInventaire"],
  ["lblInvPlateaux", "invPlateaux"],
  ["lblInvViande", "invViande"],
  ["lblInvVege", "invVege"],
  ["lblInvSpecial", "invSpecial"],
  ["lblSpml", "spml"],
  ["spmlAddBtn", "add"],
  ["lblPreAdd", "preAdd"],
  ["preAddBtn", "add"],
  ["preHeader", "preHeader"],

  // =========================
  // TC PANEL  Catgorie & en-ttes
  // =========================
  ["tcTitle", "tcTitle"],
  ["tcLblCat", "tcDrink"],
  ["tcCatCafe", "tcCatCafe"],
  ["tcCatDeca", "tcCatDeca"],
  ["tcCatThe", "tcCatThe"],
  ["tcCatInf", "tcCatInf"],
  ["tcCatDig", "tcCatDig"],
  ["tcCatBeer", "tcCatBeer"],
  ["tcCatChamp", "tcCatChamp"],
  ["tcCatVin", "tcCatVin"],
  ["tcCatSoft", "tcCatSoft"],
  ["tcCatChoco", "tcCatChoco"],
  ["tcGroupSoft", "tcGroupSoft"],
  ["tcGroupAlcohol", "tcGroupAlcohol"],
  ["tcGroupHot", "tcGroupHot"],
  ["tcLblAlcohol", "tcLblAlcohol"],
  ["tcLblHot", "tcLblHot"],

  // =========================
  // TC PANEL  Sous-libells / lignes
  // =========================
  ["tcLblSoft", "tcLblSoft"],
  ["tcLblWater", "tcLblWater"],
  ["tcLblJuice", "tcLblJuice"],
  ["tcLblCoca", "tcLblCoca"],
  ["tcLblMilk", "tcMilk"],
  ["tcLblSweet", "tcSweet"],
  ["tcLblTeaType", "tcTeaType"],
  ["tcLblInfusion", "tcInfusion"],
  ["tcLblDigestif", "tcDigestif"],
  ["tcLblService", "tcService"],
  ["tcLblBaileys", "tcBaileys"],
  ["tcLblBeer", "tcBeer"],
  ["tcLblChamp", "tcChampagne"],
  ["tcLblVin", "tcWines"],
  ["tcLblRed", "tcRed"],
  ["tcLblWhite", "tcWhite"],
  ["tcLblChoco", "tcLblChoco"],

  // =========================
  // TC PANEL  Drapeaux / provenance vins
  // =========================
  ["tcRedCH", "tcCH"],
  ["tcRedForeign", "tcForeign"],
  ["tcWhiteCH", "tcCH"],

  // =========================
  // TC PANEL  Dtails softs / eaux / jus / coca
  // =========================
  ["tcSoftWater", "tcSoftWater"],
  ["tcSoftJuice", "tcSoftJuice"],
  ["tcSoftCoca", "tcSoftCoca"],
  ["tcSoftSprite", "tcSoftSprite"],
  ["tcSoftTonic", "tcSoftTonic"],
  ["tcWaterStill", "tcWaterStill"],
  ["tcWaterSpark", "tcWaterSpark"],
  ["tcJuiceApple", "tcJuiceApple"],
  ["tcJuiceOrange", "tcJuiceOrange"],
  ["tcJuiceTomato", "tcJuiceTomato"],
  ["tcCocaClassic", "tcCocaClassic"],
  ["tcCocaZero", "tcCocaZero"],
  ["hdrHot", "tcGroupHot"],
  ["hdrSoft", "tcGroupSoft"],
  ["hdrAlco", "tcGroupAlcohol"],

  // =========================
  // TC PANEL  Chocolat chaud & marque
  // =========================
  ["tcChocoBrand", "tcChocoBrand"],

  // =========================
  // TC PANEL  Glace / citron / sel / poivre (tous emplacements)
  // =========================
  ["tcIceSoft", "tcIce"],
  ["tcIceSoft2", "tcIce"],
  ["tcIceSoft3", "tcIce"],
  ["tcIceSoft4", "tcIce"],
  ["tcLemonSoft", "tcLemon"],
  ["tcLemonSoft2", "tcLemon"],
  ["tcLemonSoft3", "tcLemon"],
  ["tcLemonSoft4", "tcLemon"],
  ["tcSalt", "tcSalt"],
  ["tcPepper", "tcPepper"],

  // =========================
  // TC PANEL  Lait / sucre
  // =========================
  ["tcMilkCreme", "tcMilkCreme"],
  ["tcMilkAvoine", "tcMilkAvoine"],
  ["tcMilkLait", "tcMilkLait"],
  ["tcMilkNone", "tcMilkNone"],
  ["tcSweetSugar", "tcSweetSugar"],
  ["tcSweetSub", "tcSweetSub"],
  ["tcSweetNone", "tcSweetNone"],

  // =========================
  // TC PANEL  Ths & infusions
  // =========================
  ["tcTeaEnglish", "tcTeaEnglish"],
  ["tcTeaVert", "tcTeaVert"],
  ["tcTeaMenthe", "tcTeaMenthe"],
  ["tcInfCam", "tcInfCam"],

  // =========================
  // TC PANEL  Digestifs / service / glaons gnriques
  // =========================
  ["tcDigJW", "tcDigJW"],
  ["tcDigJB", "tcDigJB"],
  ["tcDigCognac", "tcDigCognac"],
  ["tcDigBaileys", "tcDigBaileys"],
  ["tcPur", "tcPur"],
  ["tcRocks", "tcRocks"],
  ["tcIce", "tcIce"],

  // =========================
  // TC PANEL  Bires / Champagne / Vins
  // =========================
  ["tcBeerQ", "tcBeerQ"],
  ["tcBeerC", "tcBeerC"],
  ["tcBeerL", "tcBeerL"],
  ["tcChampagne", "tcChampagne"],
  ["tcWines", "tcWines"],
  ["tcRed", "tcRed"],
  ["tcWhite", "tcWhite"],

  // =========================
  // TC PANEL  Notes & icnes glaons par rubrique
  // =========================
  ["tcNotes", "tcNotes"],
  ["tcLblIceGen", "tcIce"],
  ["tcIceGen", "tcIce"],
  ["tcIceChamp", "tcIce"],
  ["tcIceVin", "tcIce"],

  // =========================
  // TC PANEL  Notes TC et bouton service
  // =========================
  ["mdTCNotes", "mdTCNotes"],
  ["mdMealDrinkNotes", "mealDrinkNotes"],
  ["serveTC", "serveTC"],
  ["serveMealDrink", "serveMealDrink"],

  // =========================
  // LGENDE
  // =========================
  ["lgSleep", "lgSleep"],
  ["lgLater", "lgLater"],
  ["lgServed", "lgServed"],
  ["lgInfant", "lgInfant"],
  ["lgChild", "lgChild"],
  ["lgTogether", "lgTogether"],
  ["lgclear", "lgclear"],

  // =========================
  // HISTORIQUE / RAPPELS
  // =========================
  ["secHistoryTitle", "secHistoryTitle"],
  ["remindersTitle", "remindersTitle"],
  ["histLbl", "histViewLabel"],
  ["histLblSeat", "histLblSeat"],
  ["histLblType", "histLblType"],
  ["histAscLbl", "histAscLbl"],
  ["#histType option[value='mealDrinkServed']", "histType_mealDrinkServed"],
  ["#histMode option[value='all']", "histScope_all"],
  ["#histMode option[value='seat']", "histScope_seat"],
  ["#histMode option[value='type']", "histScope_type"],

  ["#histType option[value='apServed']", "histType_apServed"],
  ["#histType option[value='tcServed']", "histType_tcServed"],
  ["#histType option[value='mealServed']", "histType_mealServed"],
  ["#histType option[value='apCanceled']", "histType_apCanceled"],
  ["#histType option[value='serviceCanceled']", "histType_serviceCanceled"],
  ["#histType option[value='trayCleared']", "histType_trayCleared"],
  ["#histType option[value='trayUncleared']", "histType_trayUncleared"],
  ["#histType option[value='reset']", "histType_reset"],
  ["#histType option[value='text']", "histType_text"],
  ["#histType option[value='seatMoveStart']", "histType_seatMoveStart"],
  ["#histType option[value='seatMoved']", "histType_seatMoved"],
  ["#histType option[value='seatSwapped']", "histType_seatSwapped"],

  // =========================
  // MODALE (fiche sige)
  // =========================
  ["closeModal", "close"],
  ["mdPass", "mdPass"],
  ["mdOcc", "mdOcc"],
  ["mdSleepTxt", "mdSleepTxt"],
  ["mdType", "mdType"],
  ["mdAdult", "mdAdult"],
  ["mdChild", "mdChild"],
  ["mdInfant", "mdInfant"],
  ["mdStatus", "mdStatus"],
  ["mdLang", "mdLang"],
  ["mdLater", "mdLater"],
  ["mdLaterSet", "mdLaterSet"],
  ["mdLaterCancel", "mdLaterCancel"],
  ["mdLaterCustom", "mdLaterCustom"],
  ["mdNotes", "mdNotes"],
  ["mdAperoNotes", "mdAperoNotes"],
  ["serveAperitif", "serveAperitif"],
  ["mdMeal", "mdMeal"],
  ["mdNormal", "mdNormal"],
  ["optNormalMeat", "optNormalMeat"],
  ["optNormalVeg", "optNormalVeg"],
  ["optNormalTray", "optNormalTray"],
  ["mdSpml", "mdSpml"],
  ["mdPre", "mdPre"],
  ["serveMeal", "serveMeal"],
  ["optStatusOther", "optStatusOther"],
  ["movePaxBtn", "moveSeat"],
  ["mdEatTogether", "eatTogether"],
  ["mdEatWith", "mdEatWith"],
  ["btnClearEat", "clear"],
];

//  Bandeau lgal (cration si absent)
function ensureLegalBanner() {
  if (!document.getElementById("appLegal")) {
    const div = document.createElement("div");
    div.id = "appLegal";
    div.style.position = "fixed";
    div.style.bottom = "6px";
    div.style.right = "10px";
    div.style.fontSize = "12px";
    div.style.color = "var(--muted)";
    div.style.background = "var(--panel)";
    div.style.padding = "4px 8px";
    div.style.border = "1px solid var(--grid)";
    div.style.borderRadius = "8px";
    div.style.zIndex = "9999";
    div.style.pointerEvents = "none";

    // Texte statique + span traduisible
    div.innerHTML =
      ' 2025 � Nicolas Debesse | DEBN | 47762  <span id="legalRights"></span>';

    document.body.appendChild(div);
  }
}

function applyI18n() {
  const lang = store.config.lang || "EN";
  ensureLegalBanner(); // cre le bandeau si besoin
  const legal = document.getElementById("legalRights");
  if (legal)
    legal.textContent = (I18N[lang] || I18N.EN).rights || "All rights reserved";

  const L = I18N[lang] || I18N.EN;

  // Bouton client/crew
  const cv = document.getElementById("clientView");
  if (cv) {
    cv.textContent = store.clientView ? " " + L.crew : " " + L.client;
  }

  // Bindings srs (vite undefined is not iterable)
  if (
    Array.isArray(typeof I18N_BINDINGS !== "undefined" ? I18N_BINDINGS : [])
  ) {
    for (let i = 0; i < I18N_BINDINGS.length; i++) {
      const pair = I18N_BINDINGS[i];
      if (!pair || pair.length < 2) continue;
      const sel = pair[0],
        key = pair[1];
      const _ew = document.getElementById("m_eatWith");
      if (_ew && !_ew.title) _ew.title = L.mdEatWithPh || "e.g. 12B";
      const el =
        sel && (sel.startsWith("#") || sel.startsWith("."))
          ? document.querySelector(sel)
          : document.getElementById(sel);
      if (el && L[key] !== undefined) el.textContent = L[key];
    }
    updateModalPhaseNav?.(); // met  jour titres/visibilit des 4 emojis
  }

  // --- Titles traduits pour les boutons du header ---
  (function setTooltips() {
    const L = I18N[store.config.lang || "EN"] || I18N.EN;
    ["sleepMealBtn", "sleepAperoBtn", "sleepTCBtn", "sleepModalBtn"].forEach(
      (id) => {
        const b = document.getElementById(id);
        if (b) b.title = L.mdSleepTxt || "Sleep";
      }
    );
    const map = [
      ["saveSnapshot", "saveTitle"],
      ["exportJSON", "exportJSON"],
      ["importJSON", "importJSON"],
      ["exportPNG", "exportPNG"],
      ["resetFlight", "reset"],
    ];
    const iconMap: Record<string, string> = {
      saveSnapshot: String.fromCodePoint(0x1f4be),
      importJSON: String.fromCodePoint(0x1f4c1),
    };
    for (const [id, key] of map) {
      const el = document.getElementById(id);
      if (el && L[key]) {
        const icon = iconMap[id] || "";
        const label = L[key];
        el.textContent = icon ? `${icon} ${label}` : label;
        el.setAttribute("aria-label", label);
        el.title = label;
      }
    }
  })();

  // +++ Traduction gnrique des lments [data-i18n] +++
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (k && L[k] !== undefined) el.textContent = L[k];
  });

  // --- Lgendes des GROS boutons (grille boissons) ---
  (function setBigDrinkCaps() {
    const L = I18N[store.config.lang || "EN"] || I18N.EN;

    const capMap = {
      drink_coffee: () => L.tcCatCafe || "Coffee",
      drink_decaf: () => L.tcCatDeca || "Decaf",
      drink_tea: () => L.tcCatThe || "Tea",
      drink_caotina: () => L.tcChocoBrand || L.tcCatChoco || "Caotina",

      drink_water: () => L.tcSoftWater || L.tcWater || "Water",
      drink_cola: () => L.tcSoftCoca || L.tcCola || "Cola",
      drink_juice: () => L.tcSoftJuice || L.tcJuice || "Juice",
      drink_sprite: () => L.tcSoftSprite || "Sprite",
      drink_tonic: () => L.tcSoftTonic || "Tonic",

      drink_champagne: () => L.tcChampagne || "Champagne",
      drink_red: () =>
        L.tcWines && L.tcRed ? `${L.tcWines}  ${L.tcRed}` : "Red wine",
      drink_white: () =>
        L.tcWines && L.tcWhite ? `${L.tcWines}  ${L.tcWhite}` : "White wine",
      drink_beer: () => L.tcBeer || "Beer",
      drink_cocktail: () => L.tcCocktail || "Cocktail",
      drink_digestif: () => L.tcDigestif || "Digestif",
    };

    document
      .querySelectorAll("#drinkGrid .pill-cap[data-i18n-cap]")
      .forEach((cap) => {
        const key = cap.getAttribute("data-i18n-cap");
        const txt = (
          capMap[key] ? capMap[key]() : cap.textContent || ""
        ).trim();
        if (txt) cap.textContent = txt;
      });
  })();

  // -- Localise les tooltips des grosses catgories (grille boissons)
  {
    const L = I18N[store.config.lang || "EN"] || I18N.EN;
    const setT = (sel, txt) => {
      const b = document.querySelector(sel);
      if (b) {
        b.title = txt;
        b.setAttribute("aria-label", txt);
      }
    };

    // Chaud
    setT('#hotRow .pill.big[data-sub="cafe"]', L.tcCatCafe || "Coffee");
    setT('#hotRow .pill.big[data-sub="deca"]', L.tcCatDeca || "Decaf");
    setT('#hotRow .pill.big[data-sub="the"]', L.tcCatThe || "Tea");
    setT('#hotRow .pill.big[data-sub="chocolat"]', L.tcCatChoco || "Caotina");

    // Soft
    setT(
      '#softRow .pill.big[data-sub="eau"]',
      L.tcSoftWater || L.tcWater || "Water"
    );
    setT('#softRow .pill.big[data-sub="coca"]', L.tcCola || "Cola");
    setT(
      '#softRow .pill.big[data-sub="jus"]',
      L.tcSoftJuice || L.tcJuice || "Juice"
    );
    setT('#softRow .pill.big[data-sub="sprite"]', L.tcSoftSprite || "Sprite");
    setT('#softRow .pill.big[data-sub="tonic"]', L.tcSoftTonic || "Tonic");

    // Alcool
    setT(
      '#alcoRow .pill.big[data-sub="champagne"]',
      L.tcChampagne || "Champagne"
    );
    setT('#alcoRow .pill.big[data-sub="biere"]', L.tcBeer || "Beer");
    setT(
      '#alcoRow .pill.big[data-sub="vin_rouge"]',
      L.tcWines && L.tcRed ? `${L.tcWines}  ${L.tcRed}` : "Red wine"
    );
    setT(
      '#alcoRow .pill.big[data-sub="vin_blanc"]',
      L.tcWines && L.tcWhite ? `${L.tcWines}  ${L.tcWhite}` : "White wine"
    );
    setT('#alcoRow .pill.big[data-sub="digestif"]', L.tcDigestif || "Digestif");
  }

  const tnotes = document.getElementById("m_tcNotes");
  if (tnotes)
    tnotes.placeholder = L.tcNotesPlaceholder || "e.g. Long coffee, sugar";

  // Placeholder "Notes" (colonne gauche gnrique)
  const mnotes = document.getElementById("m_notes");
  if (mnotes)
    mnotes.placeholder =
      L.passengerNotesPlaceholder || "e.g., DE only, no nuts";

  // Placeholder "Meal drink notes" (repas)
  const mdn = document.getElementById("m_mealDrinkNotes");
  if (mdn)
    mdn.placeholder =
      L.mealDrinkNotesPlaceholder ||
      "e.g. sparkling water, white wine, peanuts";

  // Placeholder "Eat together with"
  const eatw = document.getElementById("m_eatWith");
  if (eatw) eatw.placeholder = L.mdEatWithPh || "e.g. 12B";

  // Placeholders dynamiques
  const lv = document.getElementById("labelViande");
  const lg = document.getElementById("labelVege");
  if (lv) lv.placeholder = L.meatPlaceholder || "e.g., Beef in red-wine sauce";
  if (lg) lg.placeholder = L.vegPlaceholder || "e.g., Vegetarian lasagna";

  const f = document.getElementById("filterTabs");
  if (f) {
    const label =
      lang === "FR" ? "Filtrer" : lang === "DE" ? "Filtern" : "Filter";
    f.setAttribute("aria-label", label);
    f.setAttribute("title", label);
  }

  const layoutGroup = document.getElementById("layoutButtons");
  if (layoutGroup) {
    const title =
      lang === "FR"
        ? "Type d'appareil"
        : lang === "DE"
        ? "Flugzeugtyp"
        : "Aircraft type";
    layoutGroup.setAttribute("title", title);
    layoutGroup.setAttribute("aria-label", title);
  }
  syncLayoutButtons();

  const legendBtn = document.getElementById(
    "legendToggle"
  ) as HTMLButtonElement | null;
  if (legendBtn) {
    const showLabel = L.legendShow || "Show legend";
    const hideLabel = L.legendHide || "Hide legend";
    legendBtn.dataset.labelShow = showLabel;
    legendBtn.dataset.labelHide = hideLabel;
    const label = isLegendPopoverOpen() ? hideLabel : showLabel;
    legendBtn.textContent = label;
    legendBtn.title = label;
    legendBtn.setAttribute("aria-label", label);
  }

  const sp = document.getElementById("spmlAddCode");
  if (sp)
    sp.title =
      lang === "FR"
        ? "Ajouter code SPML"
        : lang === "DE"
        ? "SPML-Code hinzuf�gen"
        : "Add SPML code";

  const pre = document.getElementById("preAddLabel");
  if (pre) pre.placeholder = L.preAddPlaceholder || "e.g., Gluten-free pasta";

  const laterCustomButton = document.querySelector<HTMLButtonElement>(
    ".later-btn[data-value='custom']"
  );
  if (laterCustomButton) {
    const label = (L.mdLaterCustomBtn || "Custom").trim() || "Custom";
    laterCustomButton.textContent = label;
  }

  const resetButton = document.getElementById(
    "resetFlight"
  ) as HTMLButtonElement | null;
  if (resetButton) {
    const defaultLabel = (L.reset ?? resetButton.textContent ?? "").trim();
    resetButton.dataset.defaultLabel = defaultLabel;
    if (resetButton.dataset.resetArmed !== "true") {
      resetButton.textContent = defaultLabel;
    }
  }

  document.documentElement.lang = lang.toLowerCase();
  const legalEl = document.getElementById("legalRights");
  if (legalEl) legalEl.textContent = L.rights || "All rights reserved";

  const notes = document.getElementById("m_notes");
  if (notes)
    notes.placeholder = L.passengerNotesPlaceholder || "e.g., DE only, no nuts";

  const anotes = document.getElementById("m_aperoNotes");
  if (anotes)
    anotes.placeholder =
      L.aperoNotesPlaceholder || "e.g. Sparkling water, white wine, peanuts";

  const hSeat = document.getElementById("histSeat");
  if (hSeat) {
    hSeat.placeholder = L.histSeatPlaceholder || "e.g., 3A";
  }

  // Met  jour le titre du plan
  if (typeof updateSeatmapTitle === "function") updateSeatmapTitle();
  if (typeof window._rerenderDatepickerLang === "function")
    window._rerenderDatepickerLang();

  const fd = document.getElementById("flightDate");
  if (fd) {
    if (store.config.lang === "FR") fd.placeholder = "JJ/MM/AAAA";
    else if (store.config.lang === "DE") fd.placeholder = "TT.MM.JJJJ";
    else fd.placeholder = "MM, DD, YYYY";
  }
  updateFlightDatePretty();
  updateHistoryTitle();
  // ... aprs lapplication standard des traductions
  updateServeDrinkLabel(); //  force le bon libell si on est en mode repas

  // --- Refresh drinks UI after language switch ---
  try {
    document.getElementById("tc_soft_type")?.dispatchEvent(new Event("change"));
    document
      .getElementById("tc_cocktail_type")
      ?.dispatchEvent(new Event("change"));
    document.getElementById("tc_beer")?.dispatchEvent(new Event("change"));
    document.getElementById("tc_vin_rouge")?.dispatchEvent(new Event("change"));
    document.getElementById("tc_vin_blanc")?.dispatchEvent(new Event("change"));

    // Rapplique les tats dpendants
    tc_updateSoftUI?.();
    updateServeDrinkButtons();
    // Si une modale sige est ouverte au moment du changement de langue,
    // on la rouvre proprement pour rinitialiser entirement la grille boissons.
    try {
      const modalOpen =
        document.getElementById("modalBack")?.style.display === "flex";
      if (modalOpen && typeof reopenSameSeat === "function") {
        reopenSameSeat();
      }
    } catch (_) {
      /* no-op */
    }
  } catch (e) {
    console.warn("Post-i18n drinks refresh:", e);
  }
  // --- (NOUVEAU) Ractiver la DRINK GRID si la modale est ouverte aprs changement de langue ---
  try {
    const mb = document.getElementById("modalBack");
    const modalOpen =
      !!mb && (mb.style.display === "flex" || mb.style.display === "");
    if (modalOpen && document.getElementById("drinkGrid")) {
      // Remet daplomb la grille et ses listeners (nouvelle UI unifie)
      initializeDrinkMenu();
      initDrinkGrid();
      reactivateDrinkGrid();
      showAllDrinkGroups();
      updateServeDrinkButtons();

      // Rafrachit lhorodateur inline si on a une seat courante
      if (typeof modalSeat !== "undefined" && modalSeat) {
        if (store.phase === "tc") updateTCInline?.(modalSeat.key);
        else if (store.phase === "repas")
          updateMealDrinkInline?.(modalSeat.key);
      }
    }
  } catch (e) {
    console.warn("Drink grid rebind after i18n failed:", e);
  }
  // -- aprs toutes les mises  jour de textes dans applyI18n(), ajoute :
  (() => {
    const btn = document.getElementById("langActive");
    if (btn) {
      const flags = {
        EN: String.fromCodePoint(0x1f1ec, 0x1f1e7),
        DE: String.fromCodePoint(0x1f1e9, 0x1f1ea),
        FR: String.fromCodePoint(0x1f1eb, 0x1f1f7),
      };
      const code = (store.config.lang || "EN").toUpperCase();
      const flag = flags[code] || String.fromCodePoint(0x1f3f3);
      btn.textContent = flag;
      btn.setAttribute("aria-label", code);
      btn.title = code;
    }
  })();
}

function renderSeatmap() {
  const g = $("#seatgrid");
  g.innerHTML = "";
  const total = store.config.rowsBiz || 0; // **Seulement CCL**
  const rCols = rightCols(); // ["C","A"] ou ["C","B","A"]
  // 40px pour labels, 3 colonnes gauche, 28px pour couloir, puis 2 ou 3 colonnes droite
  g.style.gridTemplateColumns =
    "40px " +
    "minmax(60px,1fr) minmax(60px,1fr) minmax(60px,1fr) " +
    "28px " +
    rCols.map(() => "minmax(60px,1fr)").join(" ");

  // En-tte
  const headers = ["", "F", "E", "D", ""].concat(rCols);
  headers.forEach((c) => {
    const el = document.createElement("div");
    el.style.textAlign = "center";
    el.style.color = "var(--muted)";
    el.style.fontSize = "12px";
    el.textContent = c;
    g.appendChild(el);
  });

  for (let r = total; r >= 1; r--) {
    // range 1 en bas visuellement
    const lab = document.createElement("div");
    lab.className = "row-label";
    lab.textContent = r;
    g.appendChild(lab);
    ["F", "E", "D"].forEach((col) => g.appendChild(renderSeatCell(r, col)));
    const aisle = document.createElement("div");
    aisle.className = "aisle";
    g.appendChild(aisle);
    rCols.forEach((col) => g.appendChild(renderSeatCell(r, col)));
  }

  updateSeatmapTitle();
}
function renderSeatCell(r, col) {
  const seat = seatObj(r, col);
  const d = document.createElement("div");
  d.className = "seat bus";
  if (seat.occupied) d.classList.add("occupied");
  if (seat.sleep) d.classList.add("sleeping");
  const mini = document.createElement("div");
  mini.className = "mini";
  const dot = document.createElement("div");
  dot.className = "dot";
  if (seat.status === "FTL") dot.classList.add("ftl");
  else if (seat.status === "SEN") dot.classList.add("sen");
  else if (seat.status === "HON") dot.classList.add("hon");
  else if (seat.status === "VIP") dot.classList.add("vip");
  else if (seat.status === "FCL") dot.classList.add("fcl");
  else if (seat.status === "PAD") dot.classList.add("pad");
  mini.appendChild(dot);
  d.appendChild(mini);
  const label = document.createElement("div");
  label.className = "seat-label";
  label.textContent = r + col;
  d.appendChild(label);

  // Tag du choix (emoji ou texte)
  // Ne pas afficher le tag si le plateau est dj dbarrass
  if (!seat?.served?.trayCleared) {
    const tag = document.createElement("div");
    tag.className = "meal-tag";

    const mealEmoji = seat.spml
      ? null
      : seat.preLabel
      ? null
      : seat.normalMeal === "viande"
      ? "1"
      : seat.normalMeal === "vege"
      ? "2"
      : seat.normalMeal === "plateau"
      ? ""
      : null;

    if (seat.spml) {
      tag.textContent = seat.spml;
      d.appendChild(tag);
    } else if (seat.preLabel) {
      tag.textContent = seat.preLabel;
      d.appendChild(tag);
    } else if (mealEmoji) {
      tag.textContent = mealEmoji;
      d.appendChild(tag);
    }
  }

  const ib = document.createElement("div");
  ib.className = "iconbar";
  if (seat.type === "infant") {
    const e = document.createElement("div");
    e.className = "icon";
    e.textContent = "";
    ib.appendChild(e);
  }
  if (seat.type === "child") {
    const e = document.createElement("div");
    e.className = "icon";
    e.textContent = "";
    ib.appendChild(e);
  }
  if (
    seat?.served &&
    seat.served.meal &&
    seat.served.trayUsed &&
    !seat.served.trayCleared
  ) {
    const e = document.createElement("div");
    e.className = "icon";
    e.textContent = "";
    ib.appendChild(e);
  }

  if (seat?.served && seat.served.trayCleared) {
    const e = document.createElement("div");
    e.className = "icon";
    e.textContent = "";
    ib.appendChild(e);
  }

  if (seat.sleep) {
    const e = document.createElement("div");
    e.className = "icon";
    e.textContent = "";
    ib.appendChild(e);
  }
  if (seat.serveLaterAt) {
    const e = document.createElement("div");
    e.className = "icon";
    e.textContent = "";
    ib.appendChild(e);
  }
  d.appendChild(ib);

  addClickAndTouchListener(d, (e) => {
    if (store.clientView) return;
    e.preventDefault(); // vite ghost click iOS
    e.stopPropagation();
    // >>> AJOUT iPad : si un input de prcommande a le focus, on le blur
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    onSeatClick(keyFor(r, col));
  });

  d.addEventListener(
    "pointerup",
    (e) => {
      if (store.clientView) return;
      // vite double-excution si dj pass par touchstart
      if (e.pointerType === "mouse") return;
      onSeatClick(keyFor(r, col));
    },
    { passive: true }
  );

  const flt = currentSeatFilter();
  if (flt === "toServe") {
    // bonne phase : aperitif | repasmeal | tc
    const phaseKey =
      store.phase === "aperitif"
        ? "aperitif"
        : store.phase === "tc"
        ? "tc"
        : "meal"; // "repas"  "meal"
    const served = !!seat?.served?.[phaseKey];
    d.style.opacity = !seat.occupied || served ? 0.25 : 1;
  } else if (flt === "sleeping") {
    d.style.opacity = seat.sleep ? 1 : 0.2;
  } else if (flt === "later") {
    d.style.opacity = seat.serveLaterAt ? 1 : 0.2;
  } else if (flt === "clear") {
    const needsClear = !!seat?.served?.meal && !seat?.served?.trayCleared;
    d.style.opacity = needsClear ? 1 : 0.2;
  } else d.style.opacity = 1;
  return d;
}

function renderHistory() {
  const h = $("#history");
  if (!h) return;
  h.innerHTML = "";
  const L = I18N[store.config.lang || "EN"];

  // === lecture des contrles ===
  const mode = document.getElementById("histMode")?.value || "all";
  const seatQ = (document.getElementById("histSeat")?.value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  const typeQ = document.getElementById("histType")?.value || "";
  const asc = !!store.config.histAsc;

  // store.history est newest first (unshift). On copie puis filtre.
  let list = Array.isArray(store.history) ? store.history.slice() : [];

  if (mode === "seat" && seatQ) {
    list = list.filter(
      (it) =>
        it && typeof it === "object" && (it.seat || "").toUpperCase() === seatQ
    );
  } else if (mode === "type" && typeQ) {
    list = list.filter(
      (it) =>
        it &&
        typeof it === "object" &&
        // filtre normal
        (it.type === typeQ ||
          // cas spcial : mealDrinkServed  en fait tcServed + ctx === "repas"
          (typeQ === "mealDrinkServed" &&
            it.type === "tcServed" &&
            it.ctx === "repas")) &&
        // cas spcial : tcServed ne doit PAS inclure les repas
        !(typeQ === "tcServed" && it.ctx === "repas")
    );
  }

  // tri ascendant si demand (oldest first)
  if (asc) list = list.slice().reverse();

  for (const it of list) {
    const div = document.createElement("div");

    // compat anciens logs (strings)
    if (typeof it === "string") {
      div.textContent = it;
      h.appendChild(div);
      continue;
    }

    const time = new Date(it.ts || Date.now()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    let msg = "";

    switch (it.type) {
      case "trayCleared":
        msg = I18N[store.config.lang || "EN"].clearTray + " " + it.seat;
        break;

      case "trayUncleared":
        msg = I18N[store.config.lang || "EN"].undoClearTray + " " + it.seat;
        break;

      case "apServed": {
        const seat = it.seat;
        const label = summarizeApDrink(it.ap, L, store.config.lang) || "";
        const notes = it.notes ? `  ${it.notes}` : "";
        msg = `${L.histApServed} ${seat}${label ? "  " + label : ""}${notes}`;
        break;
      }

      case "tcServed": {
        const seat = it.seat;
        const label = summarizeApDrink(it.ap, L, store.config.lang) || "";
        const notes = it.notes ? `  ${it.notes}` : "";
        const head =
          it.ctx === "repas"
            ? L.histMealDrinkServed || "Meal drinks served at"
            : L.histTcServed || "Tea & coffee served at";
        msg = `${head} ${seat}${label ? "  " + label : ""}${notes}`;
        break;
      }

      case "apCanceled":
        msg = `${L.histApCanceled} ${it.seat}`;
        break;

      case "mealServed": {
        const labelTxt =
          it.label === "__TRAY__" ? L.trayShort || "Tray" : it.label || "";
        msg = `${L.histMealServed} ${it.seat}${
          labelTxt ? "  " + labelTxt : ""
        }`;
        break;
      }

      case "serviceCanceled":
        msg = `${L.histCanceled} ${it.seat}`;
        break;

      case "reset":
        msg = L.resetDone;
        break;

      case "titleSet": {
        // libell localis + date formate selon la langue courante
        const flight = it.flightNo || "";
        const dateTxt = fmtDateLocalized(it.dateISO || "") || it.dateISO || "";
        msg = `${L.histTitleSet} ${flight}${dateTxt ? "  " + dateTxt : ""}`;
        break;
      }
      case "seatMoveStart":
        // Ex: "[12:03]  Move pax 3C"
        msg = `${L.moveSeat} ${it.from}`;
        break;

      case "seatMoved":
        // Ex: "[12:04] 3C  4E : Dplac"
        msg = `${it.from}  ${it.to} : ${L.moved}`;
        break;

      case "seatSwapped":
        // Ex: "[12:05] 3C  4E : chang"
        msg = `${it.a}  ${it.b} : ${L.swapped}`;
        break;

      case "text":
      default:
        msg = it.text || "";
    }

    div.textContent = `[${time}] ${msg}`;
    h.appendChild(div);
  }
}

function updateHistoryTitle() {
  const L = I18N[store.config.lang || "EN"] || I18N.EN;

  // 1) Titre "History ..." avec suffixe dynamique
  const titleEl = document.getElementById("secHistoryTitle");
  if (titleEl) {
    // On nettoie un ventuel "(...)" dans le texte dj inject
    const base = (L.secHistoryTitle || "History")
      .replace(/\s*\(.*\)\s*$/, "")
      .trim();
    const suffix = store.config.histAsc
      ? L.histOldest || " (oldest on top)"
      : L.histNewest || " (newest on top)";
    titleEl.textContent = base + " " + suffix;
  }

  // 2) Libell du bouton (dans la langue)
  const btn = document.getElementById("histOrderBtn");
  if (btn) {
    btn.textContent = store.config.histAsc ? L.histOldestBtn : L.histNewestBtn;
  }
}

function rebuildHistSeatSelect() {
  const sel = document.getElementById("histSeat");
  if (!sel) return;
  const prev = (sel.value || "").trim().toUpperCase();

  // options :  + siges occups (tris)
  sel.innerHTML = '<option value=""></option>';
  const keys = Object.keys(store.seats || {}).sort();
  for (const k of keys) {
    const s = store.seats[k];
    if (s && s.occupied) {
      const o = document.createElement("option");
      o.value = k;
      o.textContent = k;
      sel.appendChild(o);
    }
  }

  // si lancienne slection existe encore, on la restaure
  if ([...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

function updateHistoryControls() {
  const mode = document.getElementById("histMode")?.value || "all";
  const seatWrap = document.getElementById("histSeatWrap");
  const typeWrap = document.getElementById("histTypeWrap");
  if (seatWrap)
    seatWrap.style.display = mode === "seat" ? "inline-flex" : "none";
  if (typeWrap)
    typeWrap.style.display = mode === "type" ? "inline-flex" : "none";
  if (mode === "seat") rebuildHistSeatSelect();
  renderHistory();
}

// couteurs
document
  .getElementById("histMode")
  ?.addEventListener("change", updateHistoryControls);
document.getElementById("histSeat")?.addEventListener("change", renderHistory);
document.getElementById("histType")?.addEventListener("change", renderHistory);
document.getElementById("histOrderBtn")?.addEventListener("click", () => {
  store.config.histAsc = !store.config.histAsc; // inverse lordre
  save();
  renderHistory();
  updateHistoryTitle();
});

// init affichage au chargement
updateHistoryControls();

function refreshBadges() {
  const lang = store.config.lang || "EN";
  store.inventory.hot_special = sumSPML();
  const minusLabel =
    lang === "FR" ? "Diminuer" : lang === "DE" ? "Reduzieren" : "Decrease";
  const plusLabel =
    lang === "FR" ? "Augmenter" : lang === "DE" ? "Erh�hen" : "Increase";

  const setBadge = (key, val) => {
    const el = document.querySelector(`[data-badge="${key}"]`);
    if (el) {
      el.textContent = val;
      el.className = "badge";
      el.classList.add(val <= 0 ? "zero" : val <= 2 ? "low" : "ok");
    }
  };
  setBadge("plateaux", store.inventory.plateaux);
  setBadge("hot_viande", store.inventory.hot_viande);
  setBadge("hot_vege", store.inventory.hot_vege);
  setBadge("hot_special", store.inventory.hot_special);
  setBadge("hot_pre", sumPRE());
  const bPre = document.querySelector('[data-badge="hot_pre"]');
  if (bPre) {
    bPre.title =
      lang === "FR"
        ? "Total prcommandes"
        : lang === "DE"
        ? "Summe Vorbestellungen"
        : "Pre-order sum";
  }

  // SPML add select
  const addSel = $("#spmlAddCode");
  if (!addSel) return;
  const prevVal = addSel?.value || "";
  const addTxt =
    lang === "FR" ? "Choisir" : lang === "DE" ? "W�hlen" : "Choose";
  addSel.innerHTML = `<option value="">${addTxt}</option>`;
  // (pas de refocus ici)

  for (const c of SPML_CODES) {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    addSel.appendChild(o);
  }
  // restaure la slection si encore prsente
  if ([...addSel.options].some((o) => o.value === prevVal)) {
    addSel.value = prevVal;
  }

  renderSpmlInventory(minusLabel, plusLabel);
  renderPreInventory(minusLabel, plusLabel);
}
function renderSpmlInventory(minusLabel, plusLabel) {
  const container = $("#spmlInv");
  if (!container) return;
  container.innerHTML = "";
  const entries = Object.entries(store.inventory.spml || {})
    .filter(([, qty]) => (qty || 0) > 0)
    .sort((a, b) => a[0].localeCompare(b[0]));
  for (const [code, qtyRaw] of entries) {
    const qty = qtyRaw || 0;
    const name = document.createElement("div");
    name.textContent = code;
    container.appendChild(name);

    const ctrls = document.createElement("div");
    ctrls.className = "row";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "btn inv-minus";
    minus.setAttribute("aria-label", minusLabel);
    minus.addEventListener("click", () => adjInv("spml", code, -1));

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.dataset.badge = "spml_" + code;
    badge.textContent = qty;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "btn inv-plus";
    plus.setAttribute("aria-label", plusLabel);
    plus.addEventListener("click", () => adjInv("spml", code, +1));

    ctrls.append(minus, badge, plus);
    container.appendChild(ctrls);
  }
}
function renderPreInventory(minusLabel, plusLabel) {
  const container = $("#preInv");
  if (!container) return;
  container.innerHTML = "";
  const entries = Object.entries(store.inventory.pre || {})
    .filter(([label]) => label && label.trim().length > 0)
    .sort((a, b) => a[0].localeCompare(b[0]));
  for (const [label, qtyRaw] of entries) {
    const qty = qtyRaw || 0;
    const name = document.createElement("div");
    name.textContent = label;
    container.appendChild(name);

    const ctrls = document.createElement("div");
    ctrls.className = "row";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "btn inv-minus";
    minus.setAttribute("aria-label", minusLabel);
    minus.disabled = qty <= 0;
    minus.addEventListener("click", () => adjInv("pre", label, -1));

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.dataset.badge = "pre_" + label;
    badge.textContent = qty;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "btn inv-plus";
    plus.setAttribute("aria-label", plusLabel);
    plus.addEventListener("click", () => adjInv("pre", label, +1));

    ctrls.append(minus, badge, plus);
    container.appendChild(ctrls);
  }
}

function adjInv(group, key, delta) {
  if (group === "spml") {
    store.inventory.spml[key] = Math.max(
      0,
      (store.inventory.spml[key] || 0) + delta
    );
  } else if (group === "pre") {
    store.inventory.pre[key] = Math.max(
      0,
      (store.inventory.pre[key] || 0) + delta
    );
  } else {
    store.inventory[key] = Math.max(0, (store.inventory[key] || 0) + delta);
  }
  save();
}

// Dcrmentation sur CHOIX (commande)
const NORMAL_MAP = { viande: "hot_viande", vege: "hot_vege" }; // 'plateau' ne rserve rien au choix

function setNormalChoice(seat, uiVal) {
  const L = I18N[store.config.lang || "EN"];

  // Sret
  if (!seat.alloc || typeof seat.alloc !== "object") {
    seat.alloc = {
      normalKey: null,
      spmlCode: null,
      preLabel: null,
      trayReserved: false,
    };
  }

  const prev = seat.normalMeal || ""; // <-- on capture l'ancien choix
  const newKey = uiVal && uiVal !== "plateau" ? NORMAL_MAP[uiVal] : null;

  // 0) TOGGLE : si on reclique EXACTEMENT le mme choix -> on annule
  if (uiVal === prev) {
    // si c'tait viande/vg, on rembourse l'inventaire
    if (prev !== "plateau" && seat.alloc.normalKey) {
      refundNormal(seat, seat.alloc.normalKey);
      seat.alloc.normalKey = null;
    }

    // si c'tait un plateau et qu'on avait rserv un tray, on le rend
    if (prev === "plateau" && seat.alloc.trayReserved) {
      store.inventory.plateaux = (store.inventory.plateaux || 0) + 1;
      seat.alloc.trayReserved = false;
    }

    seat.normalMeal = "";
    save();
    refreshBadges();
    return true;
  }

  // 1) On change de choix -> on rembourse ce qui tait allou (dans n'importe quel groupe)
  if (seat.alloc.spmlCode) {
    refundSpml(seat, seat.alloc.spmlCode);
    seat.spml = "";
    seat.alloc.spmlCode = null;
  }
  if (seat.alloc.preLabel) {
    refundPre(seat, seat.alloc.preLabel);
    seat.preLabel = "";
    seat.alloc.preLabel = null;
  }
  if (seat.alloc.normalKey) {
    refundNormal(seat, seat.alloc.normalKey);
    seat.alloc.normalKey = null;
  }

  // si on quittait un plateau rserv, on rend le tray
  if (prev === "plateau" && seat.alloc.trayReserved) {
    store.inventory.plateaux = (store.inventory.plateaux || 0) + 1;
    seat.alloc.trayReserved = false;
  }

  // 2) Plateau : on rserve 1 tray  la commande
  if (uiVal === "plateau") {
    if ((store.inventory.plateaux || 0) <= 0) {
      alert(L.alertNoTrays || "No more trays.");
      return false;
    }
    store.inventory.plateaux--; // rserve ds le choix
    seat.alloc.trayReserved = true; // marquer la rservation
    seat.normalMeal = "plateau";
    save();
    refreshBadges();
    return true;
  }

  // 3) Viande / Vg : on dcrmente le stock correspondant
  if (newKey) {
    if ((store.inventory[newKey] || 0) <= 0) {
      const human =
        uiVal === "viande"
          ? L.lblViande
          : uiVal === "vege"
          ? L.lblVege
          : uiVal === "plateau"
          ? L.trayShort || "Tray"
          : uiVal;
      alert(L.alertStock + " " + human + ".");
      return false;
    }

    store.inventory[newKey]--;
    seat.alloc.normalKey = newKey;
    seat.normalMeal = uiVal;
    save();
    refreshBadges();
    return true;
  }

  // 4) Aucun choix
  seat.normalMeal = "";
  save();
  refreshBadges();
  return true;
}

function setSpmlChoice(seat, code) {
  const L = I18N[store.config.lang || "EN"];
  if (!seat.alloc || typeof seat.alloc !== "object")
    seat.alloc = { normalKey: null, spmlCode: null, preLabel: null };
  if (code) {
    code = code.trim();
  }
  if (seat.alloc.normalKey) {
    refundNormal(seat, seat.alloc.normalKey);
    seat.normalMeal = "";
    seat.alloc.normalKey = null;
  }
  if (seat.alloc.preLabel) {
    refundPre(seat, seat.alloc.preLabel);
    seat.preLabel = "";
    seat.alloc.preLabel = null;
  }
  if (seat.alloc.spmlCode) {
    refundSpml(seat, seat.alloc.spmlCode);
    seat.spml = "";
    seat.alloc.spmlCode = null;
  }
  if (code) {
    if ((store.inventory.spml[code] || 0) <= 0) {
      alert(code + " " + L.alertDepleted);
      return false;
    }
    store.inventory.spml[code]--;
    seat.alloc.spmlCode = code;
    seat.spml = code;
    save();
    refreshBadges();
  }
  return true;
}
function setPreChoice(seat, label) {
  const L = I18N[store.config.lang || "EN"];
  if (!seat.alloc || typeof seat.alloc !== "object")
    seat.alloc = { normalKey: null, spmlCode: null, preLabel: null };
  if (label) {
    label = label.trim();
  }
  if (seat.alloc.normalKey) {
    refundNormal(seat, seat.alloc.normalKey);
    seat.normalMeal = "";
    seat.alloc.normalKey = null;
  }
  if (seat.alloc.spmlCode) {
    refundSpml(seat, seat.alloc.spmlCode);
    seat.spml = "";
    seat.alloc.spmlCode = null;
  }
  if (seat.alloc.preLabel) {
    refundPre(seat, seat.alloc.preLabel);
    seat.preLabel = "";
    seat.alloc.preLabel = null;
  }
  if (label) {
    if ((store.inventory.pre[label] || 0) <= 0) {
      alert(label + " " + L.alertDepleted);
      return false;
    }
    store.inventory.pre[label]--;
    seat.alloc.preLabel = label;
    seat.preLabel = label;
    save();
    refreshBadges();
  }
  return true;
}
function refundNormal(seat, key) {
  store.inventory[key] = (store.inventory[key] || 0) + 1;
  save();
}
function refundSpml(seat, code) {
  store.inventory.spml[code] = (store.inventory.spml[code] || 0) + 1;
  save();
}
function refundPre(seat, label) {
  store.inventory.pre[label] = (store.inventory.pre[label] || 0) + 1;
  save();
}
function updateServeMealButtonState() {
  if (!modalSeat) return;
  const d = modalSeat.data;
  const isNone = !!(d.served && d.served.mealNone);
  const wasServed = !!(d.served && d.served.meal);

  const hiddenNormal = document.getElementById(
    "m_normalMealValue"
  ) as HTMLInputElement | null;
  const chosen = (hiddenNormal?.value || d.normalMeal || "").trim();
  if (hiddenNormal) hiddenNormal.value = chosen;

  const hiddenSpml = document.getElementById(
    "m_spmlValue"
  ) as HTMLInputElement | null;
  if (hiddenSpml) hiddenSpml.value = d.spml || "";

  const preSel = $("#m_pre") as HTMLSelectElement | null;
  if (preSel) preSel.value = d.preLabel || "";

  const hasChoice =
    !!d.spml || !!d.preLabel || ["viande", "vege", "plateau"].includes(chosen);

  const btn = $("#serveMeal");
  if (btn) {
    // actif si dj servi (pour pouvoir annuler) OU sil y a un choix
    btn.disabled = !(wasServed || hasChoice);
    btn.title = btn.disabled
      ? "Choisissez un plat (normal, SPML ou prcommande) pour servir"
      : "";
  }
  const L = I18N[store.config.lang || "EN"];
  if (btn) {
    // actif si dj servi (pour pouvoir annuler) OU sil y a un choix
    btn.disabled = !(wasServed || hasChoice);
    btn.title = btn.disabled
      ? "Choisissez un plat (normal, SPML ou prcommande) pour servir"
      : "";
    //  libell dynamique
    btn.textContent =
      wasServed && !isNone
        ? L.cancelService || "Cancel service"
        : L.serveMeal || "Serve main";
    btn.classList.toggle("is-hot", wasServed || hasChoice);
    btn.setAttribute("aria-pressed", wasServed && !isNone ? "true" : "false");
  }

  const btnNone = $("#serveMealNone");
  if (btnNone) {
    btnNone.classList.toggle("is-hot", isNone);
    btnNone.setAttribute("aria-pressed", isNone ? "true" : "false");
    btnNone.setAttribute("data-variant", "ghost");
  }

  const trayBtn = $("#clearTrayBtn");
  if (trayBtn) {
    const trayActive = !!(d.served && d.served.trayCleared);
    trayBtn.classList.toggle("is-hot", trayActive);
    trayBtn.setAttribute("aria-pressed", trayActive ? "true" : "false");
    trayBtn.setAttribute("data-variant", "ghost");
  }
  applyDrinkEmojis(document.getElementById("drinkGrid"));
}

// Modal
let modalSeat = null;
let passengerCarouselOrder = [];
let mealGestureCtx = null;
const MEAL_SWIPE_THRESHOLD = 48;

function parseSeatKeyParts(key) {
  const m = /^(\d+)([A-Z]+)$/i.exec(key || "");
  if (!m) return null;
  return { row: parseInt(m[1], 10), col: m[2].toUpperCase() };
}

function focusSeatByKey(key) {
  const parts = parseSeatKeyParts(key);
  if (!parts) return;
  openSeatModal(parts.row, parts.col);
}

function focusAdjacentSeat(step) {
  if (!modalSeat) return;
  const idx = passengerCarouselOrder.indexOf(modalSeat.key);
  if (idx === -1) return;
  const targetKey = passengerCarouselOrder[idx + step];
  if (!targetKey) return;
  focusSeatByKey(targetKey);
}

function buildPassengerCarousel() {
  const carousel = document.getElementById("passengerCarousel");
  if (!carousel || !modalSeat) return;

  const current = parseSeatKeyParts(modalSeat.key);
  const seats = store.seats || {};
  const items = [];

  if (current) {
    for (const key of Object.keys(seats)) {
      const parts = parseSeatKeyParts(key);
      if (!parts) continue;
      if (Math.abs(parts.row - current.row) > 1) continue;
      const seatData = seats[key];
      if (!seatData && key !== modalSeat.key) continue;
      if (!seatData?.occupied && key !== modalSeat.key) continue;
      items.push({ key, parts, data: seatData || {} });
    }
    if (!items.some((item) => item.key === modalSeat.key)) {
      items.push({ key: modalSeat.key, parts: current, data: modalSeat.data });
    }
  }

  items.sort((a, b) => {
    if (a.parts.row === b.parts.row) {
      return a.parts.col.localeCompare(b.parts.col);
    }
    return b.parts.row - a.parts.row;
  });

  passengerCarouselOrder = items.map((item) => item.key);
  carousel.innerHTML = "";

  if (!items.length) {
    carousel.setAttribute("data-empty", "true");
    return;
  }

  carousel.removeAttribute("data-empty");

  for (const item of items) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "passenger-pill";
    btn.tabIndex = 0;
    btn.setAttribute("role", "option");
    btn.setAttribute("data-seat", item.key);
    btn.setAttribute(
      "aria-selected",
      item.key === modalSeat.key ? "true" : "false"
    );
    if (!item.data?.occupied) btn.classList.add("is-empty");
    if (item.data?.served?.meal) btn.classList.add("is-served");

    const dot = document.createElement("span");
    dot.className = "status-dot";
    const status = (item.data?.status || "").toUpperCase();
    if (status === "FTL") dot.classList.add("ftl");
    else if (status === "SEN") dot.classList.add("sen");
    else if (status === "HON") dot.classList.add("hon");
    else if (status === "VIP") dot.classList.add("vip");
    else if (status === "FCL") dot.classList.add("fcl");
    else if (status === "PAD") dot.classList.add("pad");
    btn.appendChild(dot);

    const label = document.createElement("span");
    label.className = "passenger-label";
    label.textContent = item.key;
    btn.appendChild(label);

    addClickAndTouchListener(btn, () => {
      if (item.key === modalSeat.key) return;
      focusSeatByKey(item.key);
    });

    btn.addEventListener("keydown", (evt) => {
      const key = evt.key;
      if (key === "Enter" || key === " ") {
        evt.preventDefault();
        if (item.key !== modalSeat.key) focusSeatByKey(item.key);
        return;
      }
      if (key === "ArrowLeft" || key === "ArrowRight") {
        evt.preventDefault();
        const idx = passengerCarouselOrder.indexOf(item.key);
        const targetIdx = idx + (key === "ArrowLeft" ? -1 : 1);
        const targetKey = passengerCarouselOrder[targetIdx];
        if (!targetKey) return;
        const targetBtn = carousel.querySelector(
          `[data-seat='${targetKey}']`
        ) as HTMLElement | null;
        targetBtn?.focus();
      }
    });

    carousel.appendChild(btn);
  }

  const active = carousel.querySelector(
    '[aria-selected="true"]'
  ) as HTMLElement | null;
  if (active && typeof active.scrollIntoView === "function") {
    try {
      active.scrollIntoView({ inline: "center", block: "nearest" });
    } catch (_) {
      // ignore scroll issues on legacy browsers
    }
  }
}

function mealOptionLabel(type, L) {
  if (type === "viande")
    return store.menu?.viandeLabel || L.optNormalMeat || "Option 1";
  if (type === "vege")
    return store.menu?.vegeLabel || L.optNormalVeg || "Option 2";
  if (type === "plateau") return L.optNormalTray || "Tray (no casserole)";
  return type || "";
}

function renderNormalMealCards(seatData) {
  const container = document.getElementById("m_normalMeal");
  const hidden = document.getElementById(
    "m_normalMealValue"
  ) as HTMLInputElement | null;
  if (!container) return;
  const L = I18N[store.config.lang || "EN"];
  const current = (seatData?.normalMeal || "").trim();
  if (hidden) hidden.value = current;
  container.innerHTML = "";

  const options = [
    { value: "viande", inventoryKey: "hot_viande" },
    { value: "vege", inventoryKey: "hot_vege" },
    { value: "plateau", inventoryKey: "plateaux" },
  ];

  for (const opt of options) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "meal-card";
    btn.setAttribute("role", "radio");
    btn.dataset.value = opt.value;

    const rowEl = document.createElement("div");
    rowEl.className = "meal-card__row";

    const label = document.createElement("div");
    label.className = "meal-card__name";
    label.textContent = mealOptionLabel(opt.value, L);

    const showInventory = opt.value !== "plateau";
    let qty = 0;
    if (opt.inventoryKey) {
      qty = Math.max(0, store.inventory[opt.inventoryKey] || 0);
    }

    rowEl.appendChild(label);

    if (showInventory) {
      const meta = document.createElement("div");
      meta.className = "meal-card__meta";
      const count = document.createElement("span");
      count.className = "badge";
      count.textContent = String(qty);
      meta.appendChild(count);
      rowEl.appendChild(meta);
    }
    btn.appendChild(rowEl);

    const isSelected = current === opt.value;
    if (isSelected) {
      btn.classList.add("is-selected");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.setAttribute("aria-pressed", "false");
    }

    const inStock = qty > 0;
    if (!inStock && !isSelected) {
      btn.setAttribute("aria-disabled", "true");
    }

    addClickAndTouchListener(btn, () => {
      if (!modalSeat) return;
      const seat = modalSeat.data;
      const nextValue = seat.normalMeal === opt.value ? "" : opt.value;
      const ok = setNormalChoice(seat, nextValue);
      if (!ok) return;
      save();
      renderSeatmap();
      renderServiceFlow();
      renderNormalMealCards(seat);
      renderSpmlCards(seat);
      updateServeMealButtonState();
      buildPassengerCarousel();
    });

    container.appendChild(btn);
  }
}

function renderSpmlCards(seatData) {
  const row = document.getElementById("spmlRow");
  const container = document.getElementById("m_spml");
  const hidden = document.getElementById(
    "m_spmlValue"
  ) as HTMLInputElement | null;
  if (!row || !container) return;

  const selected = seatData?.spml || "";
  if (hidden) hidden.value = selected;

  container.innerHTML = "";
  let hasAny = false;

  for (const code of SPML_CODES) {
    const qty = store.inventory.spml[code] || 0;
    const isChosen = selected === code;
    if (!qty && !isChosen) continue;
    hasAny = true;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "meal-card";
    btn.dataset.value = code;
    btn.setAttribute("role", "radio");

    const rowEl = document.createElement("div");
    rowEl.className = "meal-card__row";

    const label = document.createElement("div");
    label.className = "meal-card__name";
    label.textContent = code;

    const meta = document.createElement("div");
    meta.className = "meal-card__meta";
    const count = document.createElement("span");
    count.className = "badge";
    count.textContent = String(Math.max(0, qty));
    meta.appendChild(count);

    rowEl.appendChild(label);
    rowEl.appendChild(meta);
    btn.appendChild(rowEl);

    if (isChosen) {
      btn.classList.add("is-selected");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.setAttribute("aria-pressed", "false");
    }
    if (qty <= 0 && !isChosen) {
      btn.setAttribute("aria-disabled", "true");
    }

    addClickAndTouchListener(btn, () => {
      if (!modalSeat) return;
      const seat = modalSeat.data;
      const next = seat.spml === code ? "" : code;
      const ok = setSpmlChoice(seat, next);
      if (!ok) return;
      save();
      renderSeatmap();
      renderServiceFlow();
      renderNormalMealCards(seat);
      renderSpmlCards(seat);
      updateServeMealButtonState();
      buildPassengerCarousel();
    });

    container.appendChild(btn);
  }

  row.style.display = hasAny ? "" : "none";
}

function handleMealTouchStart(ev) {
  if (!modalSeat) return;
  if (!ev.touches || ev.touches.length !== 1) return;
  const touch = ev.touches[0];
  const target = ev.target as HTMLElement | null;
  const isNavArea = !!target?.closest(".meal-header");
  mealGestureCtx = {
    startX: touch.clientX,
    startY: touch.clientY,
    time: Date.now(),
    mode: isNavArea ? "nav" : "actions",
  };
}

function handleMealTouchEnd(ev) {
  if (!mealGestureCtx || !modalSeat) return;
  if (!ev.changedTouches || ev.changedTouches.length !== 1) {
    mealGestureCtx = null;
    return;
  }
  const touch = ev.changedTouches[0];
  const dx = touch.clientX - mealGestureCtx.startX;
  const dy = touch.clientY - mealGestureCtx.startY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (
    mealGestureCtx.mode === "nav" &&
    absDx > absDy &&
    absDx > MEAL_SWIPE_THRESHOLD
  ) {
    focusAdjacentSeat(dx > 0 ? -1 : 1);
    mealGestureCtx = null;
    return;
  }

  if (mealGestureCtx.mode === "actions") {
    if (absDx > absDy && absDx > MEAL_SWIPE_THRESHOLD) {
      const btn =
        dx > 0
          ? (document.getElementById("serveMeal") as HTMLButtonElement | null)
          : (document.getElementById(
              "serveMealNone"
            ) as HTMLButtonElement | null);
      if (btn && !btn.disabled) btn.click();
    } else if (dy > MEAL_SWIPE_THRESHOLD) {
      const clearBtn = document.getElementById(
        "clearTrayBtn"
      ) as HTMLButtonElement | null;
      if (clearBtn && !clearBtn.disabled) clearBtn.click();
    }
  }

  mealGestureCtx = null;
}

function populateModalOptions() {
  const d = modalSeat && modalSeat.data ? modalSeat.data : {};

  renderNormalMealCards(d);
  renderSpmlCards(d);

  const preSel = $("#m_pre");
  preSel.innerHTML = '<option value=""></option>';
  for (const [label, qty] of Object.entries(store.inventory.pre)) {
    const inStock = (qty || 0) > 0;
    const isChosen = d.preLabel === label;
    if (inStock || isChosen) {
      const o = document.createElement("option");
      o.value = label;
      o.textContent = label;
      preSel.appendChild(o);
    }
  }
  preSel.value = d.preLabel || "";
}

function openSeatModal(row, col) {
  const k = keyFor(row, col);
  modalSeat = { row, col, key: k, data: seatObj(row, col) };
  // === MOVE BUTTON HANDLER ===
  const moveBtn = document.getElementById("movePaxBtn");
  if (moveBtn) {
    moveBtn.onclick = () => {
      startSeatMove(modalSeat.key); // active mode move  partir de ce sige
      closeSeatModal?.(); // ferme la fentre pour choisir la destination
    };
  }

  // dsactive le bouton Move si le sige est vide
  if (moveBtn) {
    moveBtn.disabled = !modalSeat.data.occupied;
    moveBtn.setAttribute(
      "aria-disabled",
      (!modalSeat.data.occupied).toString()
    );
  }
  updateSleepButtons();

  $("#modalTitle").textContent = I18N[store.config.lang || "EN"].seat + " " + k;
  populateModalOptions();
  buildPassengerCarousel();
  $("#m_status").value = modalSeat.data.status;
  updateModalStatusBadge();
  $("#m_lang").value = modalSeat.data.lang || "";
  syncLanguageButtons();
  $("#m_notes").value = modalSeat.data.notes || "";

  //  Eat together with (select des siges occups)
  const _eatWith = document.getElementById("m_eatWith");
  if (_eatWith) {
    // (1) reconstruire les options : vide + siges occups  soi
    _eatWith.innerHTML = '<option value=""></option>';
    const cur = (modalSeat && modalSeat.key) || "";
    const keys = Object.keys(store.seats || {}).sort();
    for (const k2 of keys) {
      if (k2 === cur) continue;
      const s2 = store.seats[k2];
      if (s2 && s2.occupied) {
        const opt = document.createElement("option");
        opt.value = k2;
        opt.textContent = k2;
        _eatWith.appendChild(opt);
      }
    }
    // (2) valeur actuelle si existante
    _eatWith.value = modalSeat.data.eatWith || "";
    // (3) accessibilit/astuce i18n en title (le placeholder nexiste pas sur select)
    const L = I18N[store.config.lang || "EN"] || I18N.EN;
    _eatWith.title = L.mdEatWithPh || "e.g. 12B";
  }

  const L = I18N[store.config.lang || "EN"];
  const _lblNotes = document.getElementById("mdNotes");
  if (_lblNotes) _lblNotes.textContent = L.mdNotes || "Notes";
  const _inNotes = document.getElementById("m_notes");
  if (_inNotes && !_inNotes.placeholder)
    _inNotes.placeholder = "ex: DE only, no nuts";

  $("#m_aperoNotes").value = modalSeat.data.aperoNotes || "";
  $("#m_later").value = "";
  const laterCustom = document.getElementById("laterCustomContainer");
  if (laterCustom) laterCustom.classList.remove("active");
  const laterTimeInput = document.getElementById(
    "m_later_time"
  ) as HTMLInputElement | null;
  if (laterTimeInput) {
    laterTimeInput.value = "";
    laterTimeInput.disabled = true;
  }
  const btnClear = document.getElementById("clearTrayBtn");
  if (btnClear) {
    btnClear.disabled = !modalSeat.data?.served?.meal;

    const L = I18N[store.config.lang || "EN"];
    btnClear.textContent = modalSeat.data?.served?.trayCleared
      ? L.undoClearTray
      : L.clearTray;
  }

  const occ = $("#m_occ_chk");
  if (occ) occ.checked = !!modalSeat.data.occupied;
  updateModalOccupancyControls();

  updateServeMealButtonState();

  const t = modalSeat.data.type || "normal";
  const rAdult = document.getElementById("m_type_adult");
  const rChild = document.getElementById("m_type_child");
  const rInfant = document.getElementById("m_type_infant");
  if (rAdult && rChild && rInfant) {
    rAdult.checked = t === "normal";
    rChild.checked = t === "child";
    rInfant.checked = t === "infant";
  }

  const sl = $("#m_sleep_chk");
  if (sl) sl.checked = !!modalSeat.data.sleep;
  updateSleepButtons();

  let ap = modalSeat.data.served.aperitif
    ? L.apLabel +
      ": " +
      new Date(modalSeat.data.served.aperitif).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : L.apLabel + ": ";

  let ml = modalSeat.data.served.meal
    ? L.mealLabel +
      ": " +
      new Date(modalSeat.data.served.meal).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : L.mealLabel + ": ";

  let tcServ = modalSeat.data.served.tc
    ? (L.chips_tc || "Tea & Coffee") +
      ": " +
      new Date(modalSeat.data.served.tc).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : (L.chips_tc || "Tea & Coffee") + ": ";

  //  Ajout du libell boisson  droite de lheure (si disponible)
  if (modalSeat.data.served.aperitif) {
    const labAp = summarizeApDrink(
      modalSeat.data.apDrink,
      L,
      store.config.lang || "EN"
    );
    if (labAp) ap += "  " + labAp + (L.ordered ? " " + L.ordered : "");
  }
  if (modalSeat.data.served.tc) {
    const labTc = summarizeApDrink(
      modalSeat.data.apDrink,
      L,
      store.config.lang || "EN"
    );
    if (labTc) tcServ += "  " + labTc + (L.ordered ? " " + L.ordered : "");
  }

  // crit dans la zone visible selon la phase
  const mhMeal = $("#m_history"); // #mealBlock
  const mhApero = $("#m_history_apero"); // #aperoBlock
  const mhTC = $("#m_history_tc"); // #tcServeBlock

  if (store.phase === "aperitif") {
    if (mhMeal) mhMeal.textContent = "";
    if (mhTC) mhTC.textContent = "";
    if (mhApero) mhApero.textContent = ap;
  } else if (store.phase === "tc") {
    if (mhMeal) mhMeal.textContent = "";
    if (mhApero) mhApero.textContent = "";
    updateTCInline(modalSeat.key); //  NOUVEAU
  } else {
    // phase "repas"
    if (mhApero) mhApero.textContent = "";
    if (mhTC) mhTC.textContent = "";
    if (mhMeal) mhMeal.textContent = ml; // on garde lheure du plat servi
    updateMealDrinkInline(modalSeat.key); //  NOUVEAU : libell + heure via historique
  }

  const phase = store.phase;

  // Panneaux principaux
  document.getElementById("mealBlock")?.style &&
    (document.getElementById("mealBlock").style.display =
      phase === "repas" ? "block" : "none");
  document.getElementById("aperoBlock")?.style &&
    (document.getElementById("aperoBlock").style.display =
      phase === "aperitif" ? "block" : "none");
  document.getElementById("tcServeBlock")?.style &&
    (document.getElementById("tcServeBlock").style.display =
      phase === "tc" ? "block" : "none");

  // Ligne boisson de repas
  document.getElementById("mealDrinkServeRow")?.style &&
    (document.getElementById("mealDrinkServeRow").style.display =
      phase === "repas" ? "flex" : "none");

  // Blocs de notes dynamiques
  document.getElementById("aperoNotesBlock")?.style &&
    (document.getElementById("aperoNotesBlock").style.display =
      phase === "aperitif" ? "block" : "none");
  document.getElementById("tcNotesBlock")?.style &&
    (document.getElementById("tcNotesBlock").style.display =
      phase === "tc" ? "block" : "none");

  // Panneau boissons (listes) visible en apritif ET en th-caf
  document.getElementById("tcBlock")?.style &&
    (document.getElementById("tcBlock").style.display =
      phase === "aperitif" || phase === "tc" ? "block" : "none");

  // Horodateurs inline (bass sur l'historique)
  if (store.phase === "tc" && modalSeat) updateTCInline(modalSeat.key);
  else {
    const s = document.getElementById("mhTCInline");
    if (s) s.textContent = "";
  }

  if (store.phase === "repas" && modalSeat)
    updateMealDrinkInline(modalSeat.key);
  else {
    const s = document.getElementById("mhMealDrinkInline");
    if (s) {
      const L = I18N[store.config.lang || "EN"] || I18N.EN;
      s.textContent = (L.mealDrinkTitle || "Meal drinks") + ": ";
    }
  }

  function arrangeModalByPhase(phase, L) {
    updateModalPhaseNav(); //  met  jour les 4 emojis selon le mode actif
    const modal = document.querySelector(".modal");
    const leftCol = document.querySelector(".two > div:first-child");
    const rightCol = document.getElementById("rightCol");
    const meal = document.getElementById("mealBlock");
    const tc = document.getElementById("tcBlock");
    let rightNotes = document.getElementById("rightNotes");
    if (!rightNotes) {
      rightNotes = document.createElement("div");
      rightNotes.id = "rightNotes";
      rightCol?.insertAdjacentElement("afterbegin", rightNotes);
    }

    // Remet tout  l'tat "par dfaut"
    // (tout revient dans rightCol, notes reviennent dans tcBlock)
    if (tc) {
      // Rapatrier les blocs de notes dans tcBlock (si on les avait sortis)
      const apNotes = document.getElementById("aperoNotesBlock");
      const tcNotes = document.getElementById("tcNotesBlock");
      if (apNotes && apNotes.parentElement !== tc) tc.appendChild(apNotes);
      if (tcNotes && tcNotes.parentElement !== tc) tc.appendChild(tcNotes);
    }
    if (meal && meal.parentElement !== rightCol) rightCol?.appendChild(meal);
    if (tc && tc.parentElement !== rightCol) rightCol?.appendChild(tc);
    if (rightNotes) {
      rightNotes.innerHTML = "";
      rightNotes.style.display = "none";
    }

    // Helper :  gauche, ne garder visible quun bloc prcis (par id)
    const showOnlyLeft = (keepId) => {
      const leftCol = document.querySelector(".two > div:first-child");
      if (!leftCol) return;
      Array.from(leftCol.children).forEach((ch) => {
        ch.style.display =
          ch.id === keepId || keepId === "__ALL__" ? "" : "none";
      });
    };

    // Montrer/cacher colonnes selon phase
    const laterRow = document.getElementById("m_later")?.closest(".row");
    // Par dfaut : tout visible
    if (rightCol) rightCol.style.display = "";
    if (laterRow) laterRow.style.display = "";

    if (phase === "fiche") {
      // FICHE CLIENT : uniquement la colonne gauche (passager)
      if (modal) modal.classList.add("mono");
      if (rightCol) rightCol.style.display = "none";
      if (laterRow) laterRow.style.display = "none"; // on cache "Serve later"
      showOnlyLeft("__ALL__"); // on montre tout (la fiche passager)
      ensureDrinkGridActive();
      return;
    }

    if (phase === "aperitif") {
      // APERITIF :
      // -  gauche : listes de boissons (tcBlock)
      // -  droite : uniquement les notes apritif
      if (modal) modal.classList.remove("mono");
      if (tc && leftCol) leftCol.appendChild(tc);
      if (meal) meal.style.display = "none"; // pas de meal ici
      if (tc) {
        const apNotes = document.getElementById("aperoNotesBlock");
        const tcNotes = document.getElementById("tcNotesBlock");
        if (tcNotes) tcNotes.style.display = "none";
        if (apNotes) {
          apNotes.style.display = "block";
          rightNotes?.appendChild(apNotes); // notes  droite
          if (rightNotes) rightNotes.style.display = "block";
          const lblAp = document.getElementById("mdAperoNotes");
          if (lblAp)
            lblAp.textContent = L.mdAperoNotes || "Drink / aperitif notes";
        }
        // titre = Apritif
        const title = document.getElementById("tcTitle");
        if (title) title.textContent = L.tcTitle || "Aperitif";
      }
      showOnlyLeft("tcBlock"); // ne garder que le panneau boissons  gauche
      ensureDrinkGridActive();
      reactivateDrinkGrid();
      updateServeDrinkButtons();

      return;
    }

    if (phase === "tc") {
      // THE & CAFE :
      // -  gauche : listes de boissons (tcBlock)
      // -  droite : uniquement les notes TC
      if (modal) modal.classList.remove("mono");
      if (tc && leftCol) leftCol.appendChild(tc);
      if (meal) meal.style.display = "none";
      if (tc) {
        const apNotes = document.getElementById("aperoNotesBlock");
        const tcNotes = document.getElementById("tcNotesBlock");
        if (apNotes) apNotes.style.display = "none";
        if (tcNotes) {
          tcNotes.style.display = "block";
          rightNotes?.appendChild(tcNotes); // notes  droite
          if (rightNotes) rightNotes.style.display = "block";
        }
        // titre = Th & Caf
        const title = document.getElementById("tcTitle");
        if (title) title.textContent = L.chips_tc || "Tea & Coffee";
      }
      showOnlyLeft("tcBlock");
      ensureDrinkGridActive();
      reactivateDrinkGrid();
      updateServeDrinkButtons();
      return;
    }

    if (phase === "repas") {
      // REPAS :
      // - gauche : MEAL uniquement
      // - droite : tcBlock + boutons "Serve drink"
      if (modal) modal.classList.remove("mono");

      // Gauche = MEAL uniquement
      if (meal && leftCol) {
        meal.style.display = "block";
        leftCol.appendChild(meal);
      }

      // Droite = Liste boissons + boutons de service
      if (tc && rightCol) {
        rightCol.appendChild(tc);
        tc.style.display = "block";

        // Masquer notes apro/TC, mais AFFICHER les notes "meal drink"
        const apNotes = document.getElementById("aperoNotesBlock");
        const tcNotes = document.getElementById("tcNotesBlock");
        if (apNotes) apNotes.style.display = "none";
        if (tcNotes) tcNotes.style.display = "none";

        // >>> AFFICHER + DPLACER le bloc notes Meal Drink sous la liste boisson
        const mdn = document.getElementById("mealDrinkNotesBlock");
        if (mdn && rightCol) {
          mdn.style.display = "block";
          rightCol.appendChild(mdn); // le place juste sous tcBlock
          const lbl = document.getElementById("mdMealDrinkNotes");
          if (lbl) lbl.textContent = L.mealDrinkNotes || "Meal drink notes";
        }

        // Boutons Serve drink / Rien / horodateur (aprs les notes)
        const serveRow = document.getElementById("mealDrinkServeRow");
        if (serveRow && rightCol) {
          serveRow.style.display = "flex";
          rightCol.appendChild(serveRow);
        }

        // Titre ct droit
        const title = document.getElementById("tcTitle");
        if (title) title.textContent = L.mealDrinkTitle || "Meal drinks";
      }
      // (NOUVEAU) En mode repas, on ractive aussi la grille boissons
      if (document.getElementById("drinkGrid")) {
        resetDrinkUI(); // vide l'tat de slection + re-affiche Hot/Soft/Alcohol
        initDrinkGrid(); // rattache les listeners sur les grosses pills
        document.querySelectorAll("#drinkGrid .pill").forEach((b) => {
          b.disabled = false;
          b.style.pointerEvents = "auto";
        });
      }

      //  gauche on ne montre QUE le bloc Meal (pas Passenger)
      reactivateDrinkGrid();
      updateServeDrinkButtons();
      initDrinkGrid(); //  AJOUT
      ensureDrinkGridActive();
      showOnlyLeft("mealBlock");
      return;
    }

    // (re)initialise la grille demojis pour Apritif / Th & Caf
    if (tc) tc.style.display = "block";
    resetDrinkUI(); // (ajout  ltape 2 ci-dessous)
    initDrinkGrid(); // (existe dj, on sassure quil est bien rappel)
    document.querySelectorAll("#drinkGrid .pill").forEach((b) => {
      b.disabled = false;
      b.style.pointerEvents = "auto";
    });

    // Par dfaut (autre phase)
    if (meal) meal.style.display = "block";
  }

  // Titre du panneau : Apritif ou Th & Caf
  const tcTitle = document.getElementById("tcTitle");
  if (tcTitle)
    tcTitle.textContent =
      phase === "tc" ? L.chips_tc || "Tea & Coffee" : L.tcTitle || "Aperitif";
  const mdn = document.getElementById("mealDrinkNotesBlock");
  if (mdn) mdn.style.display = "none";
  // --- NOUVEAU : rorganiser les colonnes selon le mode ---
  arrangeModalByPhase(phase, L);
  // (nouveau) MAJ horodateur inline selon la phase courante
  if (store.phase === "tc" && modalSeat) {
    updateTCInline(modalSeat.key);
  } else if (store.phase === "repas" && modalSeat) {
    updateMealDrinkInline(modalSeat.key);
  }

  // Rinitialiser tous les menus boisson  vide  chaque ouverture
  clearTcUI();

  // Notes toujours vides  l'ouverture
  $("#m_aperoNotes").value = "";
  $("#m_tcNotes").value = "";

  // Horodateurs inline (bass sur l'historique)
  if (store.phase === "tc" && modalSeat) updateTCInline(modalSeat.key);
  else {
    const s = document.getElementById("mhTCInline");
    if (s) s.textContent = "";
  }

  if (store.phase === "repas" && modalSeat)
    updateMealDrinkInline(modalSeat.key);
  else {
    const s = document.getElementById("mhMealDrinkInline");
    if (s) {
      const L = I18N[store.config.lang || "EN"] || I18N.EN;
      s.textContent = (L.mealDrinkTitle || "Meal drinks") + ": ";
    }
  }

  updateServeMealButtonState();
  updateServeDrinkButtons(); //  AJOUT
  $("#modalBack").style.display = "flex";
}

function tc_showSub(cat) {
  const ids = [
    "tc_cafe",
    "tc_deca",
    "tc_the",
    "tc_digestif",
    "tc_cocktail",
    "tc_biere",
    "tc_champagne",
    "tc_vin",
    "tc_soft",
    "tc_chocolat",
  ];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  const milkSweet = document.getElementById("tc_milk_sweet");
  if (milkSweet)
    milkSweet.style.display = ["cafe", "deca", "the"].includes(cat)
      ? "block"
      : "none";

  const map = {
    cafe: "tc_cafe",
    deca: "tc_deca",
    the: "tc_the",
    digestif: "tc_digestif",
    cocktail: "tc_cocktail",
    biere: "tc_biere",
    champagne: "tc_champagne",
    vin: "tc_vin",
    soft: "tc_soft",
    chocolat: "tc_chocolat",
  };
  const id = map[cat];
  if (id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "block";
  }
}

function tc_updateSoftUI() {
  const t = document.getElementById("tc_soft_type")?.value || "";
  const rows = {
    eau: "tc_soft_eau_row",
    jus: "tc_soft_jus_row",
    coca: "tc_soft_coca_row",
    sprite: "tc_soft_sprite_row",
    tonic: "tc_soft_tonic_row",
  };
  // masque tout
  [
    "tc_soft_eau_row",
    "tc_soft_jus_row",
    "tc_soft_coca_row",
    "tc_soft_sprite_row",
    "tc_soft_tonic_row",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  // montre le bon
  const id = rows[t];
  if (id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "flex";
  }

  // jus tomate : montrer sel/poivre
  const jt = document.getElementById("tc_soft_jus")?.value || "";
  const saltRow = document.getElementById("tc_soft_salt_row");
  const pepRow = document.getElementById("tc_soft_pepper_row");
  if (saltRow)
    saltRow.style.display =
      t === "jus" && jt === "tomate" ? "inline-flex" : "none";
  if (pepRow)
    pepRow.style.display =
      t === "jus" && jt === "tomate" ? "inline-flex" : "none";
}

function tc_updateGroupUI() {
  const g = document.getElementById("tc_group")?.value || "";
  // cache tout le monde
  document.getElementById("tc_alcool")?.style &&
    (document.getElementById("tc_alcool").style.display = "none");
  document.getElementById("tc_chaud")?.style &&
    (document.getElementById("tc_chaud").style.display = "none");
  // cache tous les sous-blocs existants
  tc_showSub(""); // cache #tc_soft/#tc_biere/#tc_vin/... via ta fonction existante
  // reset le slecteur cach
  const catSel = document.getElementById("tc_cat");
  if (catSel) catSel.value = "";

  if (g === "soft") {
    // montre directement le bloc Soft existant + slectionne la "catgorie" = soft
    tc_showSub("soft");
    document.getElementById("tc_soft_type") &&
      (document.getElementById("tc_soft_type").value = "");
    if (catSel) catSel.value = "soft";
    tc_updateSoftUI();
  } else if (g === "alcool") {
    document.getElementById("tc_alcool")?.style &&
      (document.getElementById("tc_alcool").style.display = "block");
  } else if (g === "chaud") {
    document.getElementById("tc_chaud")?.style &&
      (document.getElementById("tc_chaud").style.display = "block");
  }

  updateServeDrinkButtons();
}

function tc_updateAlcoolUI() {
  const v = document.getElementById("tc_alcool_type")?.value || "";
  const catSel = document.getElementById("tc_cat");
  // cache tout
  tc_showSub("");
  // montre le bon sous-bloc (#tc_biere/#tc_vin/#tc_champagne/#tc_digestif)
  if (v) {
    if (catSel) catSel.value = v; // biere | vin | champagne | digestif
    tc_showSub(v);
  } else {
    if (catSel) catSel.value = "";
  }
  updateServeDrinkButtons();
}

function tc_updateChaudUI() {
  const v = document.getElementById("tc_chaud_type")?.value || "";
  const catSel = document.getElementById("tc_cat");
  // cache tout
  tc_showSub("");
  // rgles : caf/dca/th => lait/sucre ; th => affiche #tc_the ; chocolat => #tc_chocolat
  if (v) {
    if (catSel) catSel.value = v; // cafe | deca | the | chocolat
    tc_showSub(v); // gre #tc_the / #tc_chocolat / etc.
    // lait/sucre seulement pour caf/dca/th (ta fonction tc_showSub() le fait dj pour "the")
    const milkSweet = document.getElementById("tc_milk_sweet");
    if (milkSweet) {
      milkSweet.style.display =
        v === "cafe" || v === "deca" || v === "the" ? "block" : "none";
    }
  } else {
    if (catSel) catSel.value = "";
  }
  updateServeDrinkButtons();
}

function writeTcToUI(d) {
  const ap = d.apDrink || {};
  const catSel = document.getElementById("tc_cat");
  if (catSel) catSel.value = ap.cat || "";

  tc_showSub(ap.cat || "");

  // gnriques
  const milk = document.getElementById("tc_milk");
  if (milk) milk.value = ap.milk || "";
  const sw = document.getElementById("tc_sweet");
  if (sw) sw.value = ap.sweet || "";

  // th
  const theT = document.getElementById("tc_the_type");
  if (theT) theT.value = ap.theType || "";

  // digestif
  const dsel = document.getElementById("tc_digestif_type");
  if (dsel) dsel.value = ap.digestif || "";
  const wOpt = document.getElementById("tc_whisky_opts");
  const bOpt = document.getElementById("tc_baileys_opts");
  if (wOpt)
    wOpt.style.display =
      ap.digestif && ap.digestif.startsWith("whisky") ? "flex" : "none";
  if (bOpt) bOpt.style.display = ap.digestif === "baileys" ? "flex" : "none";
  const wPur = document.querySelector(
    'input[name="tc_whisky_style"][value="pur"]'
  );
  const wRck = document.querySelector(
    'input[name="tc_whisky_style"][value="rocks"]'
  );
  if (wPur && wRck) {
    wPur.checked = ap.whiskyStyle === "pur";
    wRck.checked = ap.whiskyStyle === "rocks";
  }
  const digIce = document.getElementById("tc_digestif_ice");
  if (digIce) digIce.checked = !!ap.digIce;

  const chIce = document.getElementById("tc_champ_ice");
  if (chIce) chIce.checked = !!ap.champIce;
  const vIce = document.getElementById("tc_vin_ice");
  if (vIce) vIce.checked = !!ap.vinIce;

  // Affiche/masque les options cognac selon le choix
  const cOpt = document.getElementById("tc_cognac_opts");
  if (cOpt) cOpt.style.display = ap.digestif === "cognac" ? "flex" : "none";

  // bire
  const beer = document.getElementById("tc_beer");
  if (beer) beer.value = ap.beer || "";

  // vins
  const vr = document.getElementById("tc_vin_rouge");
  if (vr) vr.value = ap.vinRouge || "";
  const vb = document.getElementById("tc_vin_blanc");
  if (vb) vb.value = ap.vinBlanc || "";
  const vn = document.getElementById("tc_vin_notes");
  if (vn) vn.value = ap.vinNotes || "";
  enforceWineExclusivity(true); // active la rgle  louverture de la modale

  // cocktails
  const csel = document.getElementById("tc_cocktail_type");
  if (csel) csel.value = ap.cocktail || "";
  const cIce = document.getElementById("tc_cocktail_ice");
  if (cIce) cIce.checked = !!ap.cocktailIce;
  const cLem = document.getElementById("tc_cocktail_lemon");
  if (cLem) cLem.checked = !!ap.cocktailLemon;
  const cSalt = document.getElementById("tc_cocktail_salt");
  if (cSalt) cSalt.checked = !!ap.cocktailSalt;
  const cPep = document.getElementById("tc_cocktail_pepper");
  if (cPep) cPep.checked = !!ap.cocktailPepper;

  // ==== SOFT ====
  if (ap.cat === "soft") {
    const t = document.getElementById("tc_soft_type");
    if (t) t.value = ap.softType || "";
    // Affiche le bon sous-row
    tc_updateSoftUI();
    const eau = document.getElementById("tc_soft_eau");
    if (eau) eau.value = ap.waterType || "";
    const jus = document.getElementById("tc_soft_jus");
    if (jus) jus.value = ap.juiceType || "";
    const coca = document.getElementById("tc_soft_coca");
    if (coca) coca.value = ap.cocaType || "";

    [
      "tc_soft_ice",
      "tc_soft_lemon",
      "tc_soft_ice2",
      "tc_soft_lemon2",
      "tc_soft_salt",
      "tc_soft_pepper",
      "tc_soft_ice4",
      "tc_soft_lemon4",
      "tc_soft_ice5",
      "tc_soft_lemon5",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const map = {
          tc_soft_ice: ap.softIce,
          tc_soft_lemon: ap.softLemon,
          tc_soft_ice2: ap.juiceIce,
          tc_soft_lemon2: ap.juiceLemon,
          tc_soft_salt: ap.juiceSalt,
          tc_soft_pepper: ap.juicePepper,
          tc_soft_ice4: ap.spriteIce,
          tc_soft_lemon4: ap.spriteLemon,
          tc_soft_ice5: ap.tonicIce,
          tc_soft_lemon5: ap.tonicLemon,
        };
        el.checked = !!map[id];
      }
    });
  }

  // ==== CHOCOLAT ====
  // rien  remplir (juste l'affichage)
}

function readTcFromUI(d) {
  if (!d.apDrink) d.apDrink = {};
  const ap = d.apDrink;

  // Cat
  if (drinkSel.cat === "soft") ap.cat = "soft";
  else if (drinkSel.cat === "chaud")
    ap.cat = drinkSel.sub; // cafe|deca|the|chocolat
  else if (drinkSel.cat === "alcool") ap.cat = drinkSel.sub;
  // champagne|vin_rouge|vin_blanc|biere|cocktail|digestif
  else ap.cat = "";

  // SOFT
  ap.softType = drinkSel.cat === "soft" ? drinkSel.sub || "" : "";
  ap.waterType = drinkSel.waterType || "";
  ap.cocaType = drinkSel.cocaType || "";
  ap.juiceType = drinkSel.juiceType || "";
  ap.softIce = !!drinkSel.softIce;
  ap.softLemon = !!drinkSel.softLemon;
  ap.spriteIce = !!drinkSel.spriteIce;
  ap.spriteLemon = !!drinkSel.spriteLemon;
  ap.tonicIce = !!drinkSel.tonicIce;
  ap.tonicLemon = !!drinkSel.tonicLemon;
  ap.juiceIce = !!drinkSel.juiceIce;
  ap.juiceLemon = !!drinkSel.juiceLemon;
  ap.juiceSalt = !!drinkSel.juiceSalt;
  ap.juicePepper = !!drinkSel.juicePepper;
  ap.juiceApfelschorle = !!drinkSel.juiceApfelschorle;

  // CHAUD
  if (
    ap.cat === "cafe" ||
    ap.cat === "deca" ||
    ap.cat === "the" ||
    ap.cat === "chocolat"
  ) {
    ap.milk = drinkSel.milk || "";
    ap.sweet = drinkSel.sweet || "";
    ap.theType = ap.cat === "the" ? drinkSel.theType || "" : "";
    ap.theLemon = !!drinkSel.theLemon;
    ap.choco = ap.cat === "chocolat";
  } else {
    ap.milk = "";
    ap.sweet = "";
    ap.theType = "";
    ap.theLemon = false;
    ap.choco = false;
  }

  // ALCOOL
  ap.champIce = ap.cat === "champagne" ? !!drinkSel.champIce : false;
  ap.champMimosa = ap.cat === "champagne" ? !!drinkSel.champMimosa : false;
  ap.beer = ap.cat === "biere" ? drinkSel.beer || "" : "";
  ap.vinRouge = ap.cat === "vin_rouge" ? drinkSel.vinRouge || "" : "";
  ap.vinBlanc = ap.cat === "vin_blanc" ? drinkSel.vinBlanc || "" : "";
  ap.vinIce =
    ap.cat === "vin_rouge" || ap.cat === "vin_blanc"
      ? !!drinkSel.vinIce
      : false;
  ap.digestif = ap.cat === "digestif" ? drinkSel.digestif || "" : "";
  ap.digIce = ap.cat === "digestif" ? !!drinkSel.digIce : false;
  ap.cocktail = ap.cat === "cocktail" ? drinkSel.cocktail || "" : "";
  ap.campariMix =
    ap.cat === "cocktail" && drinkSel.cocktail === "campari"
      ? drinkSel.campariMix || ""
      : "";
  ap.cocktailSP =
    ap.cat === "cocktail" && drinkSel.cocktail === "bloody_mary"
      ? !!drinkSel.cocktailSP
      : false;
  ap.virginMary =
    ap.cat === "cocktail" && drinkSel.cocktail === "bloody_mary"
      ? !!drinkSel.virginMary
      : false;
  ap.cocktailIce = ap.cat === "cocktail" ? !!drinkSel.cocktailIce : false;
  ap.cocktailLemon = ap.cat === "cocktail" ? !!drinkSel.cocktailLemon : false;
  ap.cocktailSalt = ap.cat === "cocktail" ? !!drinkSel.cocktailSalt : false;
  ap.cocktailPepper = ap.cat === "cocktail" ? !!drinkSel.cocktailPepper : false;
}

function closeSeatModal() {
  clearTcUI();
  const _an = document.getElementById("m_aperoNotes");
  if (_an) _an.value = "";
  const _tn = document.getElementById("m_tcNotes");
  if (_tn) _tn.value = "";
  const _md = document.getElementById("m_mealDrinkNotes");
  if (_md) _md.value = "";
  $("#modalBack").style.display = "none";
  modalSeat = null;
}

function persistModal() {
  if (!modalSeat) return;
  const d = modalSeat.data;

  // nouveaux contrles
  d.occupied = !!document.getElementById("m_occ_chk")?.checked;
  const typeRadio = document.querySelector('input[name="m_type"]:checked');
  if (typeRadio) d.type = typeRadio.value; // "normal" | "child" | "infant"
  const sl = document.getElementById("m_sleep_chk");
  if (sl) d.sleep = !!sl.checked; // sinon: on ne touche pas d.sleep

  // les autres restent identiques
  d.status = $("#m_status").value;
  d.lang = $("#m_lang").value;
  d.notes = $("#m_notes").value.trim();
  // Notes boissons = usage unique  ne pas persister sur le sige
  d.aperoNotes = "";
  d.tcNotes = "";
  d;

  const ew = document.getElementById("m_eatWith");
  if (ew) {
    const previousPartner = (d.eatWith || "").trim().toUpperCase();
    const partnerKey = (ew.value || "").trim().toUpperCase();
    modalSeat.data.eatWith = partnerKey;

    const detachPartner = (
      key: string | null | undefined,
      expected: string
    ) => {
      if (!key) return;
      const target = store.seats[key];
      if (!target) return;
      ensureSeatShape(target);
      const expectedKey = (expected || "").toUpperCase();
      if (!expectedKey) return;
      if ((target.eatWith || "").toUpperCase() === expectedKey) {
        target.eatWith = "";
      }
    };

    if (previousPartner && previousPartner !== partnerKey) {
      detachPartner(previousPartner, modalSeat.key);
    }

    if (partnerKey && store.seats[partnerKey]) {
      const partnerSeat = store.seats[partnerKey];
      ensureSeatShape(partnerSeat);
      if (partnerSeat.eatWith && partnerSeat.eatWith !== modalSeat.key) {
        detachPartner(partnerSeat.eatWith, partnerKey);
      }
      partnerSeat.eatWith = modalSeat.key;
    } else if (!partnerKey && previousPartner) {
      detachPartner(previousPartner, modalSeat.key);
    }
  }

  save();
  renderSeatmap();

  // Si l'historique est en mode Par sige, on met  jour la liste
  try {
    const mode = document.getElementById("histMode")?.value;
    if (mode === "seat" && typeof rebuildHistSeatSelect === "function")
      rebuildHistSeatSelect();
  } catch (_) {}

  renderServiceFlow();
  // Aprs avoir sauvegard / rerendu, s'assurer que la grille est bien active si on est dans la modale
  ensureDrinkGridActive();
  renderNormalMealCards(modalSeat.data);
  renderSpmlCards(modalSeat.data);
  updateServeMealButtonState();
  buildPassengerCarousel();
}

$("#m_pre").addEventListener("change", () => {
  if (!modalSeat) return;
  const val = $("#m_pre").value;
  setPreChoice(modalSeat.data, val);
  save();
  renderSeatmap();
  renderServiceFlow();
  updateServeMealButtonState();
  renderNormalMealCards(modalSeat.data);
  renderSpmlCards(modalSeat.data);
  buildPassengerCarousel();
});

// === Seat MOVE logic ===
let movingFrom = null;

function parseSeatKey(key) {
  const m = /^(\d+)([A-Z])$/i.exec((key || "").trim());
  if (!m) return [null, null];
  return [parseInt(m[1], 10), m[2].toUpperCase()];
}

function quickToggleSleep() {
  if (!modalSeat) return;
  // 1) on toggle directement la donne
  modalSeat.data.sleep = !modalSeat.data.sleep;

  // 2) si une checkbox existe encore un jour, on la garde en sync, sinon tant pis
  const chk = document.getElementById("m_sleep_chk");
  if (chk) chk.checked = modalSeat.data.sleep;

  // 3) on persiste + rafrachit lUI
  save();
  renderSeatmap();
  renderServiceFlow();
  updateSleepButtons();
}

function updateSleepButtons() {
  const chk = document.getElementById("m_sleep_chk");
  const active = chk
    ? chk.checked
    : !!(modalSeat && modalSeat.data && modalSeat.data.sleep);
  ["sleepModalBtn"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      if (active) btn.classList.add("active");
      else btn.classList.remove("active");
    }
    // Maintient le tooltip dans la bonne langue
    {
      const L = I18N[store.config.lang || "EN"] || I18N.EN;
      ["sleepMealBtn", "sleepAperoBtn", "sleepTCBtn", "sleepModalBtn"].forEach(
        (id) => {
          const btn = document.getElementById(id);
          if (btn) btn.title = L.mdSleepTxt || "Sleep";
        }
      );
    }
  });
}

function setMoveUI(on) {
  const grid = document.getElementById("seatgrid");
  if (grid) grid.classList.toggle("moving", !!on);
  const L = I18N[store.config.lang || "EN"];
  const title = document.getElementById("seatmapTitle");
  if (title) {
    if (on) {
      title.textContent =
        (L.pickDestSeat || "Select destination seat") +
        (movingFrom ? "  " + movingFrom : "");
    } else {
      // remet le titre normal de la seatmap
      if (typeof updateSeatmapTitle === "function") updateSeatmapTitle();
    }
  }
}

// appel par le bouton "Move" dans la modale sige
function startSeatMove(fromKey) {
  movingFrom = fromKey;
  setMoveUI(true);
  const L = I18N[store.config.lang || "EN"];
  if (typeof addHistoryEvt === "function") {
    addHistoryEvt({ type: "seatMoveStart", from: fromKey });
  }
}

// ESC pour annuler le mode dplacement
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && movingFrom) {
    movingFrom = null;
    setMoveUI(false);
    if (typeof updateSeatmapTitle === "function") updateSeatmapTitle();
  }
});

function isSeatEmpty(seat) {
  return !seat || !seat.occupied;
}

function performMoveOrSwap(fromKey, toKey) {
  if (!fromKey || !toKey || fromKey === toKey) return;
  const from = ensureSeatShape(store.seats[fromKey] || {});
  const to = ensureSeatShape(store.seats[toKey] || {});
  const L = I18N[store.config.lang || "EN"];

  const retargetEatWith = (oldKey, newKey) => {
    Object.keys(store.seats || {}).forEach((k) => {
      const s = store.seats[k];
      if (!s) return;
      ensureSeatShape(s);
      if (s.eatWith === oldKey) s.eatWith = newKey;
    });
  };

  if (isSeatEmpty(to)) {
    // MOVE
    store.seats[toKey] = JSON.parse(JSON.stringify(from));
    store.seats[fromKey] = ensureSeatShape({});
    if (typeof addHistoryEvt === "function") {
      addHistoryEvt({ type: "seatMoved", from: fromKey, to: toKey });
    }
  } else {
    // SWAP
    const tmp = JSON.parse(JSON.stringify(to));
    store.seats[toKey] = JSON.parse(JSON.stringify(from));
    store.seats[fromKey] = tmp;
    if (typeof addHistoryEvt === "function") {
      addHistoryEvt({ type: "seatSwapped", a: fromKey, b: toKey });
    }
  }

  //  recble les couples "eat together"
  if (isSeatEmpty(to)) {
    retargetEatWith(fromKey, toKey);
  } else {
    const TMP = "__SWAP_TMP__";
    retargetEatWith(fromKey, TMP);
    retargetEatWith(toKey, fromKey);
    retargetEatWith(TMP, toKey);
  }

  if (typeof save === "function") save();
  if (typeof renderSeatmap === "function") renderSeatmap();
  if (typeof renderServiceFlow === "function") renderServiceFlow();
}

function onSeatClick(key) {
  // cl normalise (ex: "12A")
  key = (key || "").toUpperCase();

  //  Mode dplacement actif ?
  if (movingFrom) {
    const from = movingFrom;
    movingFrom = null;
    setMoveUI(false);

    if (key && key !== from) {
      // MOVE ou SWAP
      performMoveOrSwap(from, key);
      return;
    }

    // Mme sige re-cliqu  rouvrir la modale d'origine
    const [r0, c0] = parseSeatKey(from);
    if (r0 && c0) {
      openSeatModal(r0, c0);
      document.getElementById("modalBack").style.display = "flex";
    }
    return;
  }

  //  Sinon : simple ouverture de modale
  const [r, c] = parseSeatKey(key);
  if (r && c) {
    openSeatModal(r, c);
    document.getElementById("modalBack").style.display = "flex";
  }
}

function summarizeApDrink(ap, L, lang) {
  // --- Normalisation des cls boissons ---
  if (ap) {
    // Bire
    if (ap.beer === "calvinus_blanche") ap.beer = "calvinus";
    if (ap.beer && ap.beer.startsWith("leermond")) ap.beer = "leermond";

    // Vin
    if (ap.vin === "rouge" && !ap.vinRouge) {
      ap.vinRouge = ap.vinOrigine || "suisse";
    }
    if (ap.vin === "blanc" && !ap.vinBlanc) {
      ap.vinBlanc = ap.vinOrigine || "suisse";
    }
  }
  const push = (txt) => {
    if (typeof P !== "undefined") P.push(txt);
    else if (typeof out !== "undefined") out.push(txt);
  };
  if (!ap || !ap.cat) return "";
  const P = [];
  const addIce = (f) => {
    if (f) P.push(L.tcIce || "Ice");
  };
  const addLemon = (f) => {
    if (f) P.push(L.tcLemon || "Lemon");
  };

  // Helpers lait/sucre (pour chaud)
  const milkLabel = (v) => {
    if (v === "creme") return L.tcMilkCreme;
    if (v === "avoine") return L.tcMilkAvoine;
    if (v === "lait") return L.tcMilkLait;
    if (v === "none") return L.tcMilkNone;
    return "";
  };
  const sweetLabel = (v) => {
    if (v === "sucre") return L.tcSweetSugar;
    if (v === "succedane") return L.tcSweetSub;
    if (v === "none") return L.tcSweetNone;
    return "";
  };

  switch (ap.cat) {
    // ===== CHAUD =====
    case "cafe":
      P.push(L.tcCatCafe);
      if (ap.milk) {
        const m = milkLabel(ap.milk);
        if (m) P.push(m);
      }
      if (ap.sweet) {
        const s = sweetLabel(ap.sweet);
        if (s) P.push(s);
      }
      break;

    case "deca":
      P.push(L.tcCatDeca);
      if (ap.milk) {
        const m = milkLabel(ap.milk);
        if (m) P.push(m);
      }
      if (ap.sweet) {
        const s = sweetLabel(ap.sweet);
        if (s) P.push(s);
      }
      break;

    case "the":
      // --- Eau chaude ---
      if (ap.theType === "hotwater") {
        P.push(L.tcHotWater || "Eau chaude");
        if (ap.theLemon) P.push(L.tcLemon || "Citron");
        break; // on sort ici pour ne pas afficher "th"
      }
      P.push(L.tcCatThe);
      if (ap.theType === "english") P.push(L.tcTeaEnglish);
      else if (ap.theType === "vert") P.push(L.tcTeaVert);
      else if (ap.theType === "menthe") P.push(L.tcTeaMenthe);
      else if (ap.theType === "camomille")
        P.push(L.tcTeaCamomille || L.tcInfCam);
      if (ap.milk) {
        const m = milkLabel(ap.milk);
        if (m) P.push(m);
      }
      if (ap.sweet) {
        const s = sweetLabel(ap.sweet);
        if (s) P.push(s);
      }
      if (ap.theLemon) P.push(L.tcLemon || "Lemon");
      break;

    case "infusion":
      P.push(L.tcCatInf);
      // fixe (camomille)
      P.push(L.tcInfCam);
      if (ap.milk) {
        const m = milkLabel(ap.milk);
        if (m) P.push(m);
      }
      if (ap.sweet) {
        const s = sweetLabel(ap.sweet);
        if (s) P.push(s);
      }
      break;

    case "chocolat":
      // Demande: afficher "Caotina" directement
      P.push(L.tcChocoBrand || "Caotina");
      break;

    // ===== ALCOOL =====
    case "digestif":
      P.push(L.tcCatDig);

      if (ap.digestif === "whisky_jw") P.push(L.tcDigJW);
      else if (ap.digestif === "whisky_jb") P.push(L.tcDigJB);
      else if (ap.digestif === "cognac") P.push(L.tcDigCognac);
      else if (ap.digestif === "baileys") P.push(L.tcDigBaileys);

      // Compat historique si jamais whiskyStyle existe encore,
      // sinon on utilise la case  cocher gnrique "Ice"
      if (ap.whiskyStyle === "pur") P.push(L.tcPur);
      else if (ap.whiskyStyle === "rocks") P.push(L.tcRocks);
      else addIce(!!ap.digIce);

      break;

    case "biere": {
      P.push(L.tcCatBeer || "Beer");
      const mapBeer = {
        quoellfrisch: L.tcBeerQ || "Qullfrisch Lager",
        calvinus: L.tcBeerC || "Calvinus Blanche",
        leermond: L.tcBeerL || "Leermond (alcohol-free)",
      };
      if (ap.beer && mapBeer[ap.beer]) P.push(mapBeer[ap.beer]);
      else if (ap.beer) P.push(ap.beer);
      break;
    }

    case "champagne":
      P.push(L.tcCatChamp);
      addIce(!!ap.champIce);
      if (ap.champMimosa) P.push(" Mimosa");
      break;

    case "vin_rouge": {
      // Catgorie + couleur
      P.push(L.tcCatVin || "Wines");
      let label = L.tcRed || "Red";

      // Origine (/)
      const origin =
        ap.vinRouge === "suisse"
          ? L.tcCH || "Swiss"
          : ap.vinRouge === "etranger"
          ? L.tcForeign || "Foreign"
          : "";
      if (origin) label += "  " + origin;

      // Notes facultatives
      if (ap.vinNotes) label += ` (${ap.vinNotes})`;

      P.push(label);
      // Optionnel: glaons si tu l'as prvu
      if (ap.vinIce) P.push(L.tcIce || "Ice");
      break;
    }

    case "vin_blanc": {
      P.push(L.tcCatVin || "Wines");
      let label = L.tcWhite || "White";

      const origin =
        ap.vinBlanc === "suisse"
          ? L.tcCH || "Swiss"
          : ap.vinBlanc === "etranger"
          ? L.tcForeign || "Foreign"
          : "";
      if (origin) label += "  " + origin;

      if (ap.vinNotes) label += ` (${ap.vinNotes})`;

      if (ap.vinIce) P.push(L.tcIce || "Ice");
      P.push(label);
      break;
    }

    case "cocktail": {
      P.push(L.tcCocktail || "Cocktail");
      const c = ap.cocktail || "";

      if (c === "gin_tonic") P.push(L.tcGinTonic || "Gin Tonic");
      else if (c === "cuba_libre") P.push(L.tcCubaLibre || "Cuba Libre");
      else if (c === "screwdriver") P.push(L.tcScrewDriver || "Screw Driver");
      else if (c === "bloody_mary") {
        P.push(L.tcBloodyMary || "Bloody Mary");
        if (ap.virginMary) P.push(L.tcVirginMary || "Virgin Mary");
        if (ap.cocktailSP)
          P.push([L.tcSalt || "Salt", L.tcPepper || "Pepper"].join(" + "));
      } else if (c === "campari") {
        P.push("Campari");
        if (ap.campariMix === "orange") P.push(L.tcJuiceOrange || "Orange");
        else if (ap.campariMix === "soda") P.push(L.tcSoda || "Soda");
      }

      if (ap.cocktailIce) P.push(L.tcIce || "Ice");
      if (ap.cocktailLemon) P.push(L.tcLemon || "Lemon");
      break;
    }

    // ===== SOFT =====
    case "soft":
      if (ap.softType === "eau") {
        P.push(L.tcLblWater);
        if (ap.waterType === "plate") P.push(L.tcWaterStill);
        else if (ap.waterType === "gazeuse") P.push(L.tcWaterSpark);
        addIce(!!ap.softIce);
        addLemon(!!ap.softLemon);
      } else if (ap.softType === "jus") {
        P.push(L.tcLblJuice);
        if (ap.juiceType === "pomme") {
          if (ap.juiceApfelschorle) P.push("Apfelschorle");
          else P.push(L.tcJuiceApple || "Apple");
        } else if (ap.juiceType === "orange") P.push(L.tcJuiceOrange);
        else if (ap.juiceType === "tomate") P.push(L.tcJuiceTomato);
        addIce(!!ap.juiceIce);
        addLemon(!!ap.juiceLemon);
        if (ap.juiceType === "tomate") {
          if (ap.juiceSalt || ap.juicePepper) {
            P.push([L.tcSalt || "Salt", L.tcPepper || "Pepper"].join(" + "));
          }
        }
      } else if (ap.softType === "coca") {
        P.push(
          "Coca-Cola",
          ap.cocaType === "zero"
            ? "Zero"
            : ap.cocaType === "normal"
            ? "Classic"
            : ""
        );
        addIce(!!ap.softIce);
        addLemon(!!ap.softLemon);
      } else if (ap.softType === "sprite") {
        P.push("Sprite");
        addIce(!!ap.spriteIce);
        addLemon(!!ap.spriteLemon);
      } else if (ap.softType === "tonic") {
        if (ap.tonicIce) P.push(L.tcIce);
        if (ap.tonicLemon) P.push(L.tcLemon || "Citron");
        P.unshift("Tonic");
      }
      break;
  }

  return P.join(", ");
}

document.getElementById("serveAperitif")?.addEventListener("click", () => {
  if (!modalSeat) return;
  const L = I18N[store.config.lang || "EN"];
  const d = modalSeat.data;
  if (!d.occupied) {
    alert(L.alertSeatEmpty);
    return;
  }

  // 1) Relire lUI pour tre sr davoir la dernire slection
  readTcFromUI(d);

  // 2) Horodatage fig au premier service seulement
  if (!d.served.aperitif) d.served.aperitif = Date.now();

  // 3) Garder lOBJET complet dans lhistorique pour (re)traduire plus tard
  const apCopy = JSON.parse(JSON.stringify(d.apDrink || {}));

  // 4) Pousser un event  CHAQUE clic (pas dannulation)
  console.log(
    "DEBUG SERVE AP:",
    d.apDrink,
    summarizeApDrink(
      d.apDrink,
      I18N[store.config.lang || "EN"],
      store.config.lang
    )
  );

  addHistoryEvt({
    type: "apServed",
    seat: modalSeat.key,
    ap: apCopy, // <- lobjet boisson complet
    notes: $("#m_aperoNotes").value || d.aperoNotes || "",
  });

  //  vider tout de suite les champs de notes (UI + data)
  const _an1 = document.getElementById("m_aperoNotes");
  if (_an1) _an1.value = "";
  const _tn1 = document.getElementById("m_tcNotes");
  if (_tn1) _tn1.value = "";
  d.aperoNotes = "";
  d.tcNotes = "";

  playBeep();
  save();
  resetDrinkUI(true);
  reactivateDrinkGrid();
  initDrinkGrid();
  updateServeDrinkButtons();
  openSeatModal(modalSeat.row, modalSeat.col);
  renderSeatmap();
  renderServiceFlow();
});

document.getElementById("serveTC")?.addEventListener("click", () => {
  if (!modalSeat) return;
  const L = I18N[store.config.lang || "EN"];
  const d = modalSeat.data;
  if (!d.occupied) {
    alert(L.alertSeatEmpty);
    return;
  }

  // 1) Relire lUI (mmes contrles)
  readTcFromUI(d);

  // 2) Horodatage fig au premier service TC
  if (store.phase === "tc" && !d.served.tc) d.served.tc = Date.now();

  // 3) Stocker l'objet apDrink pour traduction dynamique
  const apCopy = JSON.parse(JSON.stringify(d.apDrink || {}));

  // 4) Pousser un event  CHAQUE clic (pas dannulation)
  console.log(
    "DEBUG SERVE AP:",
    d.apDrink,
    summarizeApDrink(
      d.apDrink,
      I18N[store.config.lang || "EN"],
      store.config.lang
    )
  );

  const notesVal =
    store.phase === "repas"
      ? document.getElementById("m_mealDrinkNotes")?.value || ""
      : document.getElementById("m_tcNotes")?.value || d.tcNotes || "";

  addHistoryEvt({
    type: "tcServed",
    seat: modalSeat.key,
    ts: Date.now(),
    ap: apCopy,
    notes: notesVal,
    ctx: store.phase, //  AJOUT : pour diffrencier repas
  });

  //  vider tout de suite les champs de notes (UI + data)
  const _an2 = document.getElementById("m_aperoNotes");
  if (_an2) _an2.value = "";
  const _tn2 = document.getElementById("m_tcNotes");
  if (_tn2) _tn2.value = "";
  const _mdn2 = document.getElementById("m_mealDrinkNotes");
  if (_mdn2) _mdn2.value = "";
  d.aperoNotes = "";
  d.tcNotes = "";

  playBeep();
  save();
  // -- MAJ horodateur inline selon phase
  if (store.phase === "tc") {
    updateTCInline(modalSeat.key);
  } else if (store.phase === "repas") {
    updateMealDrinkInline(modalSeat.key);
  }
  resetDrinkUI(true);
  reactivateDrinkGrid();
  initDrinkGrid();
  updateServeDrinkButtons();
  openSeatModal(modalSeat.row, modalSeat.col);
  renderSeatmap();
  renderServiceFlow();
});

// --- RIEN en APERITIF (ne pousse rien dans l'historique) ---
document.getElementById("serveAperitifNone")?.addEventListener("click", () => {
  if (!modalSeat) return;
  const L = I18N[store.config.lang || "EN"];
  const d = modalSeat.data;
  if (!d.occupied) {
    alert(L.alertSeatEmpty);
    return;
  }

  // Marquer le sige "servi" pour l'apritif, sans ajouter d'vnement d'historique
  if (!d.served.aperitif) d.served.aperitif = Date.now();

  playBeep();
  save();
  resetDrinkUI(true);
  reactivateDrinkGrid();
  initDrinkGrid();
  openSeatModal(modalSeat.row, modalSeat.col);
  renderSeatmap();
  renderServiceFlow();
});

// --- RIEN en TH & CAF (ne pousse rien dans l'historique) ---
document.getElementById("serveTCNone")?.addEventListener("click", () => {
  if (!modalSeat) return;
  const L = I18N[store.config.lang || "EN"];
  const d = modalSeat.data;
  if (!d.occupied) {
    alert(L.alertSeatEmpty);
    return;
  }

  // Marquer le sige "servi" pour TC, sans ajouter d'vnement d'historique
  if (!d.served.tc) d.served.tc = Date.now();

  playBeep();
  save();
  resetDrinkUI(true);
  reactivateDrinkGrid();
  initDrinkGrid();
  updateServeDrinkButtons();
  openSeatModal(modalSeat.row, modalSeat.col);
  renderSeatmap();
  renderServiceFlow();
});

// --- REPAS : boutons "boisson de repas" rutilisent la logique TC ---
document.getElementById("serveMealDrink")?.addEventListener("click", () => {
  if (!modalSeat) return;
  const seatKey = modalSeat.key;
  const d = modalSeat.data;
  const L = I18N[store.config.lang || "EN"];
  if (!d.occupied) {
    alert(L.alertSeatEmpty);
    return;
  }

  // 1) Lire l'UI boisson (remplit d.apDrink depuis l'tat courant)
  if (typeof readTcFromUI === "function") readTcFromUI(d);

  // 2) Ajouter l'event d'historique (contexte "repas")
  const notes = (
    document.getElementById("m_mealDrinkNotes")?.value || ""
  ).trim();
  addHistoryEvt?.({
    type: "tcServed",
    seat: seatKey,
    ts: Date.now(),
    ctx: "repas",
    ap: d.apDrink ? JSON.parse(JSON.stringify(d.apDrink)) : null,
    notes,
  });
  playBeep();
  save?.();

  // 3) Rafrachir l'affichage inline & reset UI pour enchaner
  // -- MAJ horodateur inline selon phase
  if (store.phase === "tc") {
    updateTCInline(seatKey);
  } else if (store.phase === "repas") {
    updateMealDrinkInline(seatKey);
  }
  if (typeof resetDrinkUI === "function") resetDrinkUI(true);
  if (typeof updateServeDrinkButtons === "function") updateServeDrinkButtons(); //  AJOUT
  if (typeof reopenSameSeat === "function") reopenSameSeat();
});

document.getElementById("serveMealDrinkNone")?.addEventListener("click", () => {
  document.getElementById("serveTCNone")?.click();
});

document
  .getElementById("sleepModalBtn")
  ?.addEventListener("click", quickToggleSleep);
// === Liaison UI "Th & Caf" ===
function tc_save() {
  /* on ne persiste plus rien tant que pas Servi */
}

// === NAVIGATION ENTRE MODES DANS LA MODALE ===
function reopenSameSeat() {
  if (!modalSeat) return;
  // Raligne les chips du header avec la phase choisie
  setActivePhaseTab(store.phase);
  // Rouvre la mme modale dans le nouveau mode
  resetDrinkUI(true);
  updateServeDrinkButtons();
  reactivateDrinkGrid();
  initDrinkGrid();
  openSeatModal(modalSeat.row, modalSeat.col);
  renderSeatmap();
  renderServiceFlow();
}

// [AJOUT] Clic sur les 4 emojis = changer de mode puis rouvrir la mme modale
[
  ["navFicheBtn", "fiche"],
  ["navAperoBtn", "aperitif"],
  ["navMealBtn", "repas"],
  ["navTCBtn", "tc"],
].forEach(([id, phase]) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("click", (e) => {
    e.preventDefault();
    if (store.phase === phase) return; // dj sur ce mode
    store.phase = phase;
    save();
    updateModalPhaseNav(); // met  jour le surlignage des emojis
    updateServeDrinkLabel?.(); // garde les libells  jour si besoin (repas/boisson)
    resetDrinkUI(true);
    reopenSameSeat(); // rouvre la mme fiche dans le nouveau mode
    ensureDrinkGridActive();
    reactivateDrinkGrid(); //  AJOUT aprs
    initDrinkGrid(); //  AJOUT aprs
    // (nouveau) MAJ horodateur inline aprs changement de phase
    if (modalSeat) {
      if (store.phase === "tc") updateTCInline(modalSeat.key);
      else if (store.phase === "repas") updateMealDrinkInline(modalSeat.key);
    }
  });
  reactivateDrinkGrid();
  initDrinkGrid();
  document.querySelectorAll("#drinkGrid .pill").forEach((b) => {
    b.disabled = false;
    b.style.pointerEvents = "auto";
  });
});

function updateModalPhaseNav() {
  const L = I18N[store.config.lang || "EN"] || I18N.EN;
  const bF = document.getElementById("navFicheBtn");
  const bA = document.getElementById("navAperoBtn");
  const bM = document.getElementById("navMealBtn");
  const bT = document.getElementById("navTCBtn");

  const setTabLabel = (btn: HTMLElement | null, key: string) => {
    if (!btn) return;
    const span = btn.querySelector("span");
    if (!span) return;
    const txt = (L as Record<string, string>)[key] || "";
    if (txt.trim()) span.textContent = txt.trim();
  };
  setTabLabel(bF, "modalTabFiche");
  setTabLabel(bA, "modalTabApero");
  setTabLabel(bM, "modalTabMeal");
  setTabLabel(bT, "modalTabTC");

  // Tooltips localiss (on rutilise les cls des chips)
  if (bF) {
    bF.title = L.chips_fiche || "Pax record";
  }
  if (bA) {
    bA.title = L.chips_apero || "Aperitif";
  }
  if (bM) {
    bM.title = L.chips_meal || "Main";
  } //
  if (bT) {
    bT.title = L.chips_tc || "Tea & Coffee";
  }

  // 1) on montre TOUS les boutons (plus de display:none)
  [bF, bA, bM, bT].forEach((btn) => {
    if (!btn) return;
    btn.style.display = ""; // <- enlve tout masquage ventuel
    btn.classList.remove("active"); // <- reset du surlignage
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-selected", "false");
  });

  // 2) on surligne le mode actif (mme logique que le bouton  -> classe .active)
  const ph = store.phase;
  if (ph === "fiche" && bF) {
    bF.classList.add("active");
    bF.setAttribute("aria-pressed", "true");
    bF.setAttribute("aria-selected", "true");
  }
  if (ph === "aperitif" && bA) {
    bA.classList.add("active");
    bA.setAttribute("aria-pressed", "true");
    bA.setAttribute("aria-selected", "true");
  }
  if (ph === "repas" && bM) {
    bM.classList.add("active");
    bM.setAttribute("aria-pressed", "true");
    bM.setAttribute("aria-selected", "true");
  }
  if (ph === "tc" && bT) {
    bT.classList.add("active");
    bT.setAttribute("aria-pressed", "true");
    bT.setAttribute("aria-selected", "true");
  }
}

document.getElementById("tc_milk")?.addEventListener("change", tc_save);
document.getElementById("tc_sweet")?.addEventListener("change", tc_save);
document.getElementById("tc_the_type")?.addEventListener("change", tc_save);
document.getElementById("tc_beer")?.addEventListener("change", tc_save);
document.getElementById("tc_soft_type")?.addEventListener("change", () => {
  tc_updateSoftUI();
  tc_save();
  updateServeDrinkButtons();
});
document.getElementById("tc_soft_jus")?.addEventListener("change", () => {
  tc_updateSoftUI();
  tc_save();
  updateServeDrinkButtons(); //  important : rvalue l'tat du bouton "Servir"
});

[
  "tc_soft_eau",
  "tc_soft_coca",
  "tc_soft_ice",
  "tc_soft_lemon",
  "tc_soft_ice2",
  "tc_soft_lemon2",
  "tc_soft_salt",
  "tc_soft_pepper",
  "tc_soft_ice4",
  "tc_soft_lemon4",
  "tc_cocktail_type",
  "tc_cocktail_ice",
  "tc_cocktail_lemon",
].forEach((id) =>
  document.getElementById(id)?.addEventListener("change", tc_save)
);

const _vr = document.getElementById("tc_vin_rouge");
const _vb = document.getElementById("tc_vin_blanc");

_vr?.addEventListener("change", () => {
  if (_vr.value) {
    // On vide et on dsactive Blanc
    if (_vb) {
      _vb.value = "";
      _vb.disabled = true;
    }
  } else {
    if (_vb) _vb.disabled = false;
  }
  tc_save();
  enforceWineExclusivity();
});

_vb?.addEventListener("change", () => {
  if (_vb.value) {
    // On vide et on dsactive Rouge
    if (_vr) {
      _vr.value = "";
      _vr.disabled = true;
    }
  } else {
    if (_vr) _vr.disabled = false;
  }
  tc_save();
  enforceWineExclusivity();
});

document.getElementById("tc_vin_notes")?.addEventListener("input", tc_save);
document.getElementById("tc_champ_ice")?.addEventListener("change", tc_save);
document.getElementById("tc_vin_ice")?.addEventListener("change", tc_save);
document
  .getElementById("tc_digestif_type")
  ?.addEventListener("change", tc_save);
document.getElementById("tc_digestif_ice")?.addEventListener("change", tc_save);

// === Plateau dbarrass / Annuler dbarrassage ===
document.getElementById("clearTrayBtn")?.addEventListener("click", () => {
  if (!modalSeat) return;
  const d = modalSeat.data;
  const L = I18N[store.config.lang || "EN"];

  if (!d.occupied || !d.served?.meal) {
    alert(L.alertSeatEmpty);
    return;
  }

  //  On ne touche NI  linventaire NI  trayUsed
  if (!d.served.trayCleared) {
    d.served.trayCleared = true;
    addHistoryEvt({ type: "trayCleared", seat: modalSeat.key });
  } else {
    d.served.trayCleared = false;
    addHistoryEvt({ type: "trayUncleared", seat: modalSeat.key });
  }

  playBeep();
  save();
  refreshBadges();
  resetDrinkUI(true);
  reactivateDrinkGrid();
  initDrinkGrid();
  openSeatModal(modalSeat.row, modalSeat.col);
  renderSeatmap();
  renderServiceFlow();
});

// --- RIEN en PLAT PRINCIPAL (ne pousse rien dans l'historique) ---
document.getElementById("serveMealNone")?.addEventListener("click", () => {
  if (!modalSeat) return;
  const L = I18N[store.config.lang || "EN"];
  const d = modalSeat.data;
  if (!d.occupied) {
    alert(L.alertSeatEmpty);
    return;
  }

  // Marquer "plat servi" sans plateau ni historique
  if (!d.served) d.served = {};
  d.served.meal = Date.now();
  d.served.mealNone = true; // <- flag Rien
  d.served.trayUsed = false; // <- aucun plateau consomm
  d.served.trayFromReservation = false;

  playBeep();
  save();
  resetDrinkUI(true);
  reactivateDrinkGrid();
  initDrinkGrid();
  openSeatModal(modalSeat.row, modalSeat.col);
  renderSeatmap();
  renderServiceFlow();
  updateServeMealButtonState();
});

$("#serveMeal").addEventListener("click", () => {
  if (!modalSeat) return;
  const L = I18N[store.config.lang || "EN"];
  const d = modalSeat.data;
  if (!d.occupied) {
    alert(L.alertSeatEmpty);
    return;
  }

  let wasServed = !!d.served.meal;
  const wasNone = !!(d.served && d.served.mealNone);
  if (wasNone) wasServed = false; // <- si c'tait Rien, on traite comme pas encore servi

  // On regarde le choix actuel, mais on utilisera surtout le flag trayUsed
  const hiddenNormal = document.getElementById(
    "m_normalMealValue"
  ) as HTMLInputElement | null;
  const chosenMeal = (hiddenNormal?.value || d.normalMeal || "").trim();
  const hasChoice =
    !!d.spml ||
    !!d.preLabel ||
    ["viande", "vege", "plateau"].includes(chosenMeal);

  if (!hasChoice && !wasServed) {
    alert(L.alertChoose);
    return;
  }

  const needsTray = (m, seat) =>
    m === "plateau" ||
    m === "viande" ||
    m === "vege" ||
    !!seat.spml ||
    !!seat.preLabel;

  if (!wasServed) {
    // PREMIER CLIC = servir
    const consumeTray = needsTray(chosenMeal, d);
    if (consumeTray) {
      const hadReservedTray =
        chosenMeal === "plateau" && !!(d.alloc && d.alloc.trayReserved);

      if (hadReservedTray) {
        // on utilise la rservation, donc on NE re-dcrmente PAS
        d.served.trayUsed = true;
        d.served.trayFromReservation = true; // nouveau flag pour l'annulation
        // la rservation reste consomme : plus de seat.alloc.trayReserved
        d.alloc.trayReserved = false;
      } else {
        // cas normal (viande/vg/SPML/Pre, ou plateau sans rservation)
        if ((store.inventory.plateaux || 0) <= 0) {
          alert(L.alertNoTrays);
          return;
        }
        store.inventory.plateaux--;
        d.served.trayUsed = true;
        d.served.trayFromReservation = false;
        refreshBadges();
      }
    } else {
      d.served.trayUsed = false;
      d.served.trayFromReservation = false;
    }

    d.served.meal = Date.now();
    d.served.mealNone = false; // <- on sort de ltat Rien

    const label = d.spml
      ? d.spml
      : d.preLabel
      ? d.preLabel
      : chosenMeal === "viande"
      ? store.menu.viandeLabel || I18N[store.config.lang || "EN"].optNormalMeat
      : chosenMeal === "vege"
      ? store.menu.vegeLabel || I18N[store.config.lang || "EN"].optNormalVeg
      : chosenMeal === "plateau"
      ? "__TRAY__"
      : "";
    addHistoryEvt({ type: "mealServed", seat: modalSeat.key, label });

    // (Historique dj gr ailleurs si besoin)
  } else {
    // DEUXIME CLIC = annuler le service (dcliquer)
    if (d.served.trayUsed) {
      // si le tray venait d'une rservation, on NE rajoute PAS 1 au stock
      if (!d.served.trayFromReservation) {
        store.inventory.plateaux = (store.inventory.plateaux || 0) + 1;
        refreshBadges();
      }
      d.served.trayUsed = false;
      d.served.trayFromReservation = false;
    }
    d.served.meal = null;

    addHistoryEvt({ type: "serviceCanceled", seat: modalSeat.key });
  }

  playBeep();
  save();
  resetDrinkUI(true);
  reactivateDrinkGrid();
  initDrinkGrid();
  openSeatModal(modalSeat.row, modalSeat.col);
  renderSeatmap();
  renderServiceFlow();
  updateServeMealButtonState();
});

$("#m_later").addEventListener("change", () => {
  if (typeof syncLaterButtons === "function") syncLaterButtons();
});

function scheduleReminderFor(seat, minutes, atTimeStr = null) {
  if (!modalSeat) return;
  const now = new Date();
  let target = null;
  if (atTimeStr) {
    const [hh, mm] = atTimeStr.split(":").map((x) => parseInt(x, 10));
    target = new Date();
    target.setHours(hh, mm, 0, 0);
    if (target.getTime() < now.getTime())
      target = new Date(target.getTime() + 24 * 3600 * 1000);
  } else {
    target = new Date(now.getTime() + minutes * 60 * 1000);
  }
  const timestamp = target.getTime();
  seat.serveLaterAt = timestamp;
  store.reminders = (store.reminders || []).filter(
    (r) => r.key !== modalSeat.key
  );
  store.reminders.push({ key: modalSeat.key, at: seat.serveLaterAt });
  save();
  renderReminders();
  renderServiceFlow();
}

function setLaterButtonState() {
  const btn = document.getElementById(
    "m_later_apply"
  ) as HTMLButtonElement | null;
  const cancel = document.getElementById(
    "m_later_cancel"
  ) as HTMLButtonElement | null;
  const view = document.getElementById("m_later_view");
  const select = document.getElementById("m_later") as HTMLSelectElement | null;
  const timeInput = document.getElementById(
    "m_later_time"
  ) as HTMLInputElement | null;
  const sel = select?.value;
  const tVal = timeInput?.value;

  if (!btn || !modalSeat) return;
  const seat = modalSeat.data || {};
  const now = Date.now();
  const hasActive = !!(seat.serveLaterAt && seat.serveLaterAt > now);
  const occupied = isModalSeatOccupied();

  // Bouton SET actif seulement si sige occup, option "Time" et heure saisie
  btn.disabled = !occupied || sel !== "custom" || !tVal;

  // Bouton CANCEL visible uniquement si un timer est actif
  if (cancel) {
    cancel.style.display = hasActive ? "" : "none";
    cancel.disabled = !occupied || !hasActive;
  }

  if (timeInput) {
    const shouldEnable = occupied && sel === "custom";
    timeInput.disabled = !shouldEnable;
  }

  // Affichage de lheure programme
  if (view) {
    if (hasActive) {
      const hhmm = new Date(seat.serveLaterAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      view.textContent = " " + hhmm;
      view.style.display = "";
    } else {
      view.textContent = "";
      view.style.display = "none";
    }
  }
  syncLaterButtons();
}

$("#m_later_time").addEventListener("change", () => {
  if (typeof setLaterButtonState === "function") setLaterButtonState();
});

$("#m_later_apply").addEventListener("click", () => {
  if (!modalSeat) return;
  if (!isModalSeatOccupied()) return;
  const L = I18N[store.config.lang || "EN"];
  const t = $("#m_later_time").value;
  if (!t) {
    alert(L.alertPickTime);
    return;
  }
  scheduleReminderFor(modalSeat.data, 0, t);
  if (typeof setLaterButtonState === "function") setLaterButtonState();
});

document.getElementById("m_later_cancel")?.addEventListener("click", () => {
  if (!modalSeat) return;
  const key = modalSeat.key;
  // supprimer tous les rappels pour ce sige
  store.reminders = (store.reminders || []).filter((r) => r.key !== key);
  // vider le timer du sige
  modalSeat.data.serveLaterAt = null;
  const select = document.getElementById("m_later") as HTMLSelectElement | null;
  if (select) select.value = "";
  const container = document.getElementById("laterCustomContainer");
  if (container) container.classList.remove("active");
  const timeInput = document.getElementById(
    "m_later_time"
  ) as HTMLInputElement | null;
  if (timeInput) timeInput.value = "";
  save();
  renderReminders();
  renderSeatmap();
  renderServiceFlow();
  setLaterButtonState();
  syncLaterButtons();
});

document.getElementById("m_status")?.addEventListener("change", () => {
  updateModalStatusBadge();
});

document.getElementById("m_lang")?.addEventListener("change", () => {
  syncLanguageButtons();
});

document.querySelectorAll<HTMLButtonElement>(".language-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const select = document.getElementById(
      "m_lang"
    ) as HTMLSelectElement | null;
    if (!select || btn.disabled) return;
    const lang = btn.dataset.lang || "";
    select.value = select.value === lang ? "" : lang;
    const evt = new Event("change", { bubbles: true });
    select.dispatchEvent(evt);
  });
});

syncLanguageButtons();
updateModalStatusBadge();

syncLaterButtons();

document.querySelectorAll<HTMLButtonElement>(".later-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const select = document.getElementById(
      "m_later"
    ) as HTMLSelectElement | null;
    if (!select || btn.disabled) return;
    const value = btn.dataset.value || "";
    const nextValue = select.value === value ? "" : value;
    select.value = nextValue;
    const evt = new Event("change", { bubbles: true });
    select.dispatchEvent(evt);
  });
});

document.addEventListener("click", (event) => {
  const container = document.getElementById("laterCustomContainer");
  if (!container?.classList.contains("active")) return;
  const target = event.target as HTMLElement | null;
  if (!target) return;
  if (container.contains(target)) return;
  if (
    target.classList?.contains("later-btn") &&
    target.dataset.value === "custom"
  )
    return;
  if (target.closest(".form-field--actions")) return;
  if (target.id === "m_later_apply" || target.id === "m_later_cancel") return;
  const select = document.getElementById("m_later") as HTMLSelectElement | null;
  if (!select || select.value !== "custom") return;
  const timeInput = document.getElementById(
    "m_later_time"
  ) as HTMLInputElement | null;
  if (timeInput?.value) return;
  const seat = modalSeat?.data;
  if (seat?.serveLaterAt && seat.serveLaterAt > Date.now()) return;
  select.value = "";
  select.dispatchEvent(new Event("change", { bubbles: true }));
});

$("#closeModal").addEventListener("click", () => {
  persistModal();
  closeSeatModal();
});
// champs encore prsents
["m_status", "m_lang", "m_notes", "m_aperoNotes", "m_eatWith"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("change", persistModal);
  const elTcNotes = document.getElementById("m_tcNotes");
  if (elTcNotes) elTcNotes.addEventListener("change", persistModal);
});

// nouveaux contrles
document.getElementById("m_occ_chk")?.addEventListener("change", () => {
  persistModal();
  updateModalOccupancyControls();
});
document
  .getElementById("m_sleep_chk")
  ?.addEventListener("change", persistModal);
document.querySelectorAll('input[name="m_type"]').forEach((r) => {
  r.addEventListener("change", persistModal);
});

$("#m_later").addEventListener("change", () => {
  if (!modalSeat) return;
  syncLaterButtons();
  const val = $("#m_later").value;

  if (val === "") {
    // annule tout rappel existant
    modalSeat.data.serveLaterAt = null;
    store.reminders = (store.reminders || []).filter(
      (r) => r.key !== modalSeat.key
    );
    save();
    renderReminders();
    renderSeatmap();
    renderServiceFlow();
    if (typeof setLaterButtonState === "function") setLaterButtonState();
    return;
  }

  if (val === "custom") {
    // on attend le clic sur le bouton "Set time"
    if (typeof setLaterButtonState === "function") setLaterButtonState();
    return;
  }

  // +5 / +10 / +20  planifie directement
  scheduleReminderFor(modalSeat.data, parseInt(val, 10));
  if (typeof setLaterButtonState === "function") setLaterButtonState();
});

function renderReminders() {
  const lang = store.config.lang || "EN";
  const cancelTxt =
    lang === "FR" ? "Annuler" : lang === "DE" ? "Lschen" : "Cancel";
  const box = $("#remindersList");
  box.innerHTML = "";
  const now = Date.now();
  store.reminders = store.reminders.filter((r) => r.at && r.at > now);
  const arr = [...store.reminders].sort((a, b) => a.at - b.at);
  for (const r of arr) {
    const div = document.createElement("div");
    div.className = "row";
    const seat = store.seats[r.key];
    const at = new Date(r.at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const txt = document.createElement("div");
    txt.textContent = r.key + "  " + at + (seat?.sleep ? " ()" : "");
    const del = document.createElement("button");
    del.className = "btn";
    del.textContent = cancelTxt;
    del.addEventListener("click", () => {
      const idx = store.reminders.findIndex(
        (x) => x.key === r.key && x.at === r.at
      );
      if (idx >= 0) store.reminders.splice(idx, 1);
      if (store.seats[r.key]) store.seats[r.key].serveLaterAt = null;
      save();
      renderReminders();
      renderSeatmap();
      renderServiceFlow();
    });
    div.appendChild(txt);
    div.appendChild(del);
    box.appendChild(div);
  }
  save();
}
setInterval(() => {
  const now = Date.now();
  for (const r of store.reminders) {
    if (r.at && now >= r.at) {
      const L = I18N[store.config.lang || "EN"];
      addHistory(L.remindServe + " " + r.key);
      playBeep();
      r.at = null;
      if (store.seats[r.key]) store.seats[r.key].serveLaterAt = null;
      renderSeatmap();
      renderServiceFlow();
    }
  }
  store.reminders = store.reminders.filter((r) => r.at);
  renderReminders();
  renderServiceFlow();
}, 1000);

// === Service Flow ===
const COL_ORDER = ["A", "B", "C", "D", "E", "F"];
function colExists(c) {
  if (c === "B") return store.config.layout === "A320"; // B absent sur A220
  return true; // A,C,D,E,F existent
}
// Priorit pour la PRISE DE COMMANDE uniquement :
// CHML (0)  HON (1)  SEN (2)  autres (3)  PAD (4 = tout  la fin)
function seatCategoryRank(seat) {
  if (seat.spml === "CHML") return 0;
  if (seat.status === "HON") return 1;
  if (seat.status === "SEN") return 2;
  if (seat.status === "PAD") return 4; // PAD en dernier pour la prise de commande
  return 3;
}

function currentPhaseKey() {
  if (store.phase === "aperitif") return "aperitif";
  if (store.phase === "tc") return "tc"; //  AJOUT cl TC
  return "meal"; // "repas"
}

// --- Service Flow (UNIQUE, propre) ---

function computeServiceFlow() {
  const now = Date.now();
  const rows = store.config.rowsBiz || 0;
  const phaseKey = currentPhaseKey(); // "aperitif" | "meal"
  const isMealPhase = store.phase === "repas"; // true = Plat, false = Apritif/TC

  // Candidats = occups, non servis sur la phase, pas "plus tard"
  const candidates = [];
  for (let r = 1; r <= rows; r++) {
    for (const c of COL_ORDER) {
      if (!colExists(c)) continue;
      const seat = seatObj(r, c);
      if (!seat.occupied) continue;
      if (seat.served[phaseKey]) continue;
      if (seat.serveLaterAt && seat.serveLaterAt > now) continue;
      candidates.push({ key: r + c, r, c, seat });
    }
  }

  // Chemin de service : veills d'abord, puis CHML, puis 1X, AF
  let serveList = [...candidates].sort((a, b) => {
    // 0) veills d'abord, dormeurs  la fin (inchang)
    const sa = a.seat.sleep ? 1 : 0;
    const sb = b.seat.sleep ? 1 : 0;
    if (sa !== sb) return sa - sb;

    // 1) Priorit CHML UNIQUEMENT pendant le PLAT
    if (isMealPhase) {
      const pa = a.seat.spml === "CHML" ? 0 : 1;
      const pb = b.seat.spml === "CHML" ? 0 : 1;
      if (pa !== pb) return pa - pb;
    }

    // 2) Ordre cabine normal (rang 1X, puis AF)
    if (a.r !== b.r) return a.r - b.r;
    return COL_ORDER.indexOf(a.c) - COL_ORDER.indexOf(b.c);
  });

  serveList = groupEatWith(serveList);

  //  commander = aucun choix (ni SPML, ni prco, ni normal)
  const needsOrder = candidates.filter((x) => {
    const s = x.seat;
    return !(s.spml || s.preLabel || s.normalMeal);
  });

  // Prise de commande : veills  dormeurs, puis CHMLHONSENautresPAD, puis 1X, AF
  let orderList = needsOrder.sort((a, b) => {
    // 0) veills d'abord
    const sa = a.seat.sleep ? 1 : 0;
    const sb = b.seat.sleep ? 1 : 0;
    if (sa !== sb) return sa - sb;

    // 1) Rang VIP/HON/SEN/PAD UNIQUEMENT pendant le PLAT
    if (isMealPhase) {
      const ra = seatCategoryRank(a.seat); // CHML=0, HON=1, SEN=2, autres=3, PAD=4
      const rb = seatCategoryRank(b.seat);
      if (ra !== rb) return ra - rb;
    }

    // 2) Ordre cabine normal (rang 1X, puis AF)
    if (a.r !== b.r) return a.r - b.r;
    return COL_ORDER.indexOf(a.c) - COL_ORDER.indexOf(b.c);
  });

  orderList = groupEatWith(orderList);

  //  dbarrasser = repas servi mais plateau NON dbarrass
  const clearList = [];
  for (let r = 1; r <= rows; r++) {
    for (const c of COL_ORDER) {
      if (!colExists(c)) continue;
      const seat = seatObj(r, c);
      if (!seat.occupied) continue;
      //  dbarrasser seulement si un plateau a t utilis ET pas encore dbarrass
      if (
        seat.served?.meal &&
        seat.served?.trayUsed &&
        !seat.served?.trayCleared
      ) {
        clearList.push({ key: r + c, r, c, seat });
      }
    }
  }
  clearList.sort((a, b) => {
    if (a.r !== b.r) return a.r - b.r;
    return COL_ORDER.indexOf(a.c) - COL_ORDER.indexOf(b.c);
  });
  // Regroupe les pax "eat together" en les mettant cte  cte dans la liste
  function groupEatWith(list) {
    const idx = new Map(list.map((x, i) => [x.key, i]));
    const seen = new Set();
    const out = [];
    for (const x of list) {
      if (seen.has(x.key)) continue;
      out.push(x);
      seen.add(x.key);
      const partnerKey = x.seat?.eatWith;
      if (partnerKey && idx.has(partnerKey) && !seen.has(partnerKey)) {
        out.push(list[idx.get(partnerKey)]);
        seen.add(partnerKey);
      }
    }
    return out;
  }

  return { serveList, orderList, clearList };
}

function escapeHTML(s) {
  return String(s || "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}

// Construit le tag de CHOIX REPAS pour le service path
function mealChoiceTagHTML(d) {
  // d = seat.data
  // Priorit : SPML > Pre-order > Normal
  if (d.spml) {
    const cls = d.spml === "CHML" ? "tag chml" : "tag";
    return `<span class="${cls}">${escapeHTML(d.spml)}</span>`;
  }
  if (d.preLabel) {
    return `<span class="tag">${escapeHTML(d.preLabel)}</span>`;
  }
  const nm = (d.normalMeal || "").trim(); // "viande" | "vege" | "plateau" | ""
  if (!nm) return "";
  const emoji = nm === "viande" ? "1" : nm === "vege" ? "2" : ""; // plateau =
  return `<span class="tag">${emoji}</span>`;
}

function renderServiceFlow() {
  const L = I18N[store.config.lang || "EN"];
  const boxNow = document.getElementById("flowNow"); // chemin de service
  const boxLater = document.getElementById("flowLater"); // commandes  prendre
  const boxClear = document.getElementById("flowClear"); //  dbarrasser
  if (!boxNow || !boxLater) return;

  // Masquer / afficher sections selon la phase
  const laterSection = document.getElementById("flowLaterTitle")?.parentElement; // "Orders to take"
  const nowSection = document.getElementById("flowNowTitle")?.parentElement; // "Service path"
  const clearSection = document.getElementById("flowClearTitle")?.parentElement; // " dbarrasser"

  const isApero = store.phase === "aperitif";
  const isTC = store.phase === "tc";
  const isFiche = store.phase === "fiche";

  // Apritif & T&C : cacher Service path +  dbarrasser
  if (nowSection)
    nowSection.style.display = isApero || isTC || isFiche ? "none" : "";
  if (clearSection)
    clearSection.style.display = isApero || isTC || isFiche ? "none" : "";

  // Fiche pax : cacher aussi Orders to take
  if (laterSection) laterSection.style.display = isFiche ? "none" : "";

  // nettoie les 3 colonnes
  boxNow.innerHTML = "";
  boxLater.innerHTML = "";
  if (boxClear) boxClear.innerHTML = "";

  const { serveList, orderList, clearList } = computeServiceFlow();

  // --- Colonne du haut (TOP) ---
  {
    const t = document.getElementById("flowLaterTitle");
    if (t) {
      t.textContent =
        store.phase === "aperitif"
          ? L.flowAperoTakenTitle || "Orders taken "
          : store.phase === "tc"
          ? L.flowTCTakenTitle || "Tea & coffee taken "
          : L.flowLaterTitle || "Orders to take ";
    }

    if (store.phase === "aperitif" || store.phase === "tc") {
      // En apritif : apServed ; en T&C : tcServed
      const evtType = store.phase === "aperitif" ? "apServed" : "tcServed"; //  cl historique existante
      const list = (Array.isArray(store.history) ? store.history : []).filter(
        (ev) =>
          ev &&
          ev.type === evtType &&
          (evtType !== "tcServed" || ev.ctx !== "repas")
      );

      if (list.length === 0) {
        const p = document.createElement("div");
        p.style.color = "var(--muted)";
        p.textContent = L.flowEmptyTaken || "No orders taken yet";
        boxLater.appendChild(p);
      } else {
        for (const ev of list) {
          // Rcup tags statut/drapeaux/sleep depuis le sige courant (si encore prsent)
          let d = null;
          if (typeof parseSeatKey === "function") {
            const [r, c] = parseSeatKey(ev.seat || "");
            if (r && c && typeof seatObj === "function") d = seatObj(r, c);
          }
          const tags = [];
          if (d) {
            if (d.status === "HON")
              tags.push('<span class="tag hon">HON</span>');
            else if (d.status === "SEN")
              tags.push('<span class="tag sen">SEN</span>');
            else if (d.status === "VIP")
              tags.push('<span class="tag vip">VIP</span>');
            else if (d.status === "FCL")
              tags.push('<span class="tag fcl">FCL</span>');
            else if (d.status === "PAD")
              tags.push('<span class="tag pad">PAD</span>');
            else if (d.status === "FTL")
              tags.push('<span class="tag ftl">FTL</span>');
            if (d.eatWith)
              tags.push('<span class="tag"> ' + d.eatWith + "</span>");
            if (d.sleep) tags.push('<span class="tag sleep"></span>');
          }

          // Libell boisson + notes  on rutilise ton rsumeur + emoji
          const em =
            typeof drinkEmoji === "function" ? drinkEmoji(ev.ap) || "" : "";
          const label =
            typeof summarizeApDrink === "function"
              ? summarizeApDrink(ev.ap, L, store.config.lang) || ""
              : "";
          const notes = (ev.notes || "").trim();
          const sub = [label, notes].filter(Boolean).join("  ");
          const subHtml = sub
            ? `<div class="flow-sub">${em ? em + " " : ""}${escapeHTML(
                sub
              )}</div>`
            : "";

          const row = document.createElement("div");
          row.className = "flow-item";
          row.dataset.key = ev.seat || "";
          row.innerHTML = `
          <div class="flow-seat">${ev.seat || ""}</div>
          <div class="flow-desc">${tags.join(" ")}${subHtml}</div>
          <div class="tag">${L.flowTaken || "Taken"}</div>
        `;
          row.addEventListener("click", () => onSeatClick?.(ev.seat || ""));
          boxLater.appendChild(row);
        }
      }
    } else {
      // COMPORTEMENT NORMAL (non-apritif) = commandes  prendre
      if (orderList.length === 0) {
        const p = document.createElement("div");
        p.style.color = "var(--muted)";
        p.textContent = L.flowEmptyLater || "Aucune commande  prendre";
        boxLater.appendChild(p);
      } else {
        for (const item of orderList) {
          const d = item.seat;
          const tags = [];
          if (d.status === "HON") tags.push('<span class="tag hon">HON</span>');
          else if (d.status === "SEN")
            tags.push('<span class="tag sen">SEN</span>');
          else if (d.status === "VIP")
            tags.push('<span class="tag vip">VIP</span>');
          else if (d.status === "FCL")
            tags.push('<span class="tag fcl">FCL</span>');
          else if (d.status === "PAD")
            tags.push('<span class="tag pad">PAD</span>');
          else if (d.status === "FTL")
            tags.push('<span class="tag ftl">FTL</span>');
          if (d.eatWith)
            tags.push('<span class="tag"> ' + d.eatWith + "</span>");
          if (d.sleep) tags.push('<span class="tag sleep"></span>');

          const row = document.createElement("div");
          row.className = "flow-item";
          row.dataset.key = item.key;

          const mealTag = mealChoiceTagHTML?.(d);
          if (mealTag) tags.unshift(mealTag);

          row.innerHTML = `
          <div class="flow-seat">${item.key}</div>
          <div class="flow-desc">${tags.join(" ")}</div>
          <div class="tag">${L.flowTakeOrder || "Order"}</div>
        `;
          row.addEventListener("click", () => onSeatClick(item.key));
          boxLater.appendChild(row);
        }
      }
    }
  }

  // --- Chemin de service (BOTTOM)
  if (serveList.length === 0) {
    const p = document.createElement("div");
    p.style.color = "var(--muted)";
    p.textContent = L.flowEmptyLater || "No passenger to serve";
    boxNow.appendChild(p);
  } else {
    for (const item of serveList) {
      const d = item.seat;
      const tags = [];
      if (d.status === "HON") tags.push('<span class="tag hon">HON</span>');
      else if (d.status === "SEN")
        tags.push('<span class="tag sen">SEN</span>');
      else if (d.status === "VIP")
        tags.push('<span class="tag vip">VIP</span>');
      else if (d.status === "FCL")
        tags.push('<span class="tag fcl">FCL</span>');
      else if (d.status === "PAD")
        tags.push('<span class="tag pad">PAD</span>');
      else if (d.status === "FTL")
        tags.push('<span class="tag ftl">FTL</span>');
      if (d.eatWith) tags.push('<span class="tag"> ' + d.eatWith + "</span>");
      if (d.sleep) tags.push('<span class="tag sleep"></span>');

      const row = document.createElement("div");
      row.className = "flow-item";
      row.dataset.key = item.key;

      //  AJOUT : mettre le choix de repas en premier
      const mealTag = mealChoiceTagHTML(d);
      if (mealTag) tags.unshift(mealTag);

      const drinkLineNow = mealDrinkLineHTML(item.key);
      row.innerHTML = `
  <div class="flow-seat">${item.key}</div>
  <div class="flow-desc">${tags.join(" ")}</div>
  <div class="tag">${L.flowServeTag || "Serve"}</div>
  ${drinkLineNow}
`;

      row.addEventListener("click", () => onSeatClick(item.key));
      boxNow.appendChild(row);
    }
  }

  // ---  dbarrasser (MIDDLE)
  if (boxClear) {
    if (!clearList || clearList.length === 0) {
      const p = document.createElement("div");
      p.style.color = "var(--muted)";
      p.textContent = L.flowEmptyClear || "Rien  dbarrasser";
      boxClear.appendChild(p);
    } else {
      for (const item of clearList) {
        const d = item.seat;
        const tags = [];
        if (d.status === "HON") tags.push('<span class="tag hon">HON</span>');
        else if (d.status === "SEN")
          tags.push('<span class="tag sen">SEN</span>');
        else if (d.status === "VIP")
          tags.push('<span class="tag vip">VIP</span>');
        else if (d.status === "FCL")
          tags.push('<span class="tag fcl">FCL</span>');
        else if (d.status === "PAD")
          tags.push('<span class="tag pad">PAD</span>');
        else if (d.status === "FTL")
          tags.push('<span class="tag ftl">FTL</span>');
        if (d.sleep) tags.push('<span class="tag sleep"></span>');

        const row = document.createElement("div");
        row.className = "flow-item";
        row.dataset.key = item.key;
        row.innerHTML = `
          <div class="flow-seat">${item.key}</div>
          <div class="flow-desc">${tags.join(" ")}</div>
          <div class="tag"> ${L.flowClearTag || " dbarrasser"}</div>
        `;
        row.addEventListener("click", () => onSeatClick(item.key));
        boxClear.appendChild(row);
      }
    }
  }
}

// Header & exports

function initLangButtons() {
  const wrap = document.getElementById("langDropdown");
  const active = document.getElementById("langActive");
  const menu = document.getElementById("langMenu");

  if (!wrap || !active || !menu) return;

  const flagMap: Record<string, string> = {
    EN: String.fromCodePoint(0x1f1ec, 0x1f1e7),
    DE: String.fromCodePoint(0x1f1e9, 0x1f1ea),
    FR: String.fromCodePoint(0x1f1eb, 0x1f1f7),
  };
  const fallbackFlag = String.fromCodePoint(0x1f3f3);

  const setActiveLabel = () => {
    const code = (store.config.lang || "EN").toUpperCase();
    const flag = flagMap[code] || fallbackFlag;
    active.textContent = flag;
    active.setAttribute("aria-label", code);
    active.title = code;
  };

  const decorateMenuButtons = () => {
    menu.querySelectorAll<HTMLButtonElement>("[data-lang]").forEach((btn) => {
      const code = (btn.dataset.lang || "").toUpperCase();
      const flag = flagMap[code] || fallbackFlag;
      btn.textContent = flag;
      btn.setAttribute("aria-label", code);
      btn.title = code;
    });
  };

  decorateMenuButtons();
  setActiveLabel();

  // Ouvre/ferme le menu
  active.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = wrap.classList.toggle("open");
    active.setAttribute("aria-expanded", String(open));
    // highlight loption courante
    menu.querySelectorAll("[data-lang]").forEach((b) => {
      b.classList.toggle(
        "primary",
        b.dataset.lang === (store.config.lang || "EN")
      );
    });
  });

  // Choix dune langue
  menu.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.dataset.lang;
      if (!code) return;

      store.config.lang = code;
      save();
      applyI18n();
      renderHistory();
      renderSeatmap();
      renderServiceFlow();

      // Si la modale sige est ouverte, re-ouvre proprement (comme tu le fais dj)
      if (document.getElementById("modalBack")?.style.display === "flex") {
        if (typeof reopenSameSeat === "function") reopenSameSeat();
      }

      setActiveLabel();
      decorateMenuButtons();
      wrap.classList.remove("open");
      active.setAttribute("aria-expanded", "false");
    });
  });

  // Fermer en cliquant ailleurs
  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove("open");
      active.setAttribute("aria-expanded", "false");
    }
  });
}

// ----- Thme jour/nuit -----
function applyTheme() {
  const dark = store.config.theme === "dark";
  document.body.classList.toggle("theme-dark", dark);
  document.body.classList.toggle("theme-light", !dark);
  const tBtn = document.getElementById("themeToggle");
  if (tBtn) {
    const label = dark ? "Light mode" : "Dark mode";
    tBtn.textContent = dark ? "☀️" : "🌙";
    tBtn.setAttribute("aria-label", label);
    tBtn.title = label;
  }
}
const themeBtn = document.getElementById("themeToggle");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    store.config.theme = store.config.theme === "dark" ? "light" : "dark";
    save();
    applyTheme();
  });
}

// Slecteur de layout cabine
const layoutSel = document.getElementById(
  "layoutSelect"
) as HTMLInputElement | null;
if (layoutSel) {
  layoutSel.addEventListener("change", () => {
    const nextLayout = layoutSel.value || "A220";
    store.config.layout = nextLayout;
    save();
    syncLayoutButtons();
    renderSeatmap();
    renderServiceFlow(); //  AJOUT
  });
}

document.querySelectorAll<HTMLButtonElement>(".layout-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const layout = btn.dataset.layout || "";
    if (!layout) return;
    const hidden = document.getElementById(
      "layoutSelect"
    ) as HTMLInputElement | null;
    if (!hidden) return;
    if (hidden.value === layout) {
      syncLayoutButtons();
      return;
    }
    hidden.value = layout;
    hidden.dispatchEvent(new Event("change", { bubbles: true }));
  });
});

// boutons inventaire (plateaux/viande/vg)
document.querySelectorAll("[data-inv]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const key = btn.dataset.key;
    const delta = btn.dataset.inv === "+1" ? 1 : -1;
    if (key && (key.startsWith("hot_") || key === "plateaux")) {
      store.inventory[key] = Math.max(0, (store.inventory[key] || 0) + delta);
    }
    save();
    refreshBadges();
  })
);
// --- Contrles + / - pour "Ranges CCL" ---
const rowsBizDisplay = document.getElementById("rowsBizDisplay");

document.getElementById("rowsBizMinus").addEventListener("click", () => {
  store.config.rowsBiz = Math.max(0, (store.config.rowsBiz || 0) - 1);
  rowsBizDisplay.textContent = store.config.rowsBiz;
  save();
  renderSeatmap();
  renderServiceFlow();
});

document.getElementById("rowsBizPlus").addEventListener("click", () => {
  store.config.rowsBiz = Math.min(15, (store.config.rowsBiz || 0) + 1);
  rowsBizDisplay.textContent = store.config.rowsBiz;
  save();
  renderSeatmap();
});

$("#spmlAddBtn").addEventListener("click", () => {
  const L = I18N[store.config.lang || "EN"] || I18N.EN;
  const code = ($("#spmlAddCode").value || "").trim().toUpperCase();
  const qty = Math.max(1, parseInt($("#spmlAddQty").value || "1", 10));

  if (!code) {
    alert(L.spmlCodeRequired);
    return;
  }

  store.inventory.spml[code] = (store.inventory.spml[code] || 0) + qty;
  $("#spmlAddCode").value = "";
  save();
});

document
  .getElementById("spmlAddCode")
  ?.addEventListener("change", (e) => e.target.blur());

$("#preAddBtn").addEventListener("click", () => {
  const L = I18N[store.config.lang || "EN"] || I18N.EN;
  const label = ($("#preAddLabel").value || "").trim();
  const qty = Math.max(1, parseInt($("#preAddQty").value || "1", 10));

  if (!label) {
    alert(L.preAddLabelRequired);
    return;
  }

  store.inventory.pre[label] = (store.inventory.pre[label] || 0) + qty;
  $("#preAddLabel").value = "";
  save();
});

document.querySelectorAll("#filterTabs .subtab[data-filter]").forEach((btn) =>
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) return;
    const filter = btn.dataset.filter || "all";
    setActiveFilterTab(filter);
    if (isLegendPopoverOpen()) setLegendPopoverState(false);
    renderSeatmap();
    renderServiceFlow(); //  AJOUT
  })
);
setActiveFilterTab(currentSeatFilter());
if (legendPopover && legendButton && legendSeatmapContainer) {
  setLegendPopoverState(false);
  legendPopover.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  legendButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const shouldOpen = !isLegendPopoverOpen();
    setLegendPopoverState(shouldOpen);
  });
  document.addEventListener("click", (event) => {
    if (!isLegendPopoverOpen()) return;
    const target = event.target as Node | null;
    if (!target) return;
    if (legendPopover.contains(target) || legendButton.contains(target)) return;
    setLegendPopoverState(false);
  });
  window.addEventListener("resize", () => {
    if (isLegendPopoverOpen()) positionLegendPopover();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isLegendPopoverOpen()) return;
    setLegendPopoverState(false);
    legendButton.focus({ preventScroll: true });
  });
}
document.querySelectorAll("#phaseChips .tab").forEach((btn) =>
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) return;
    const phase = btn.dataset.phase || "fiche";
    store.phase = phase;
    setActivePhaseTab(phase);
    renderSeatmap();
    renderServiceFlow();
    updateServeDrinkLabel(); //  AJOUT
  })
);

$("#exportPNG").addEventListener("click", () => {
  const rows = store.config.rowsBiz || 0;
  const cellW = 72,
    cellH = 48,
    pad = 40;
  const leftCols = ["F", "E", "D"];
  const rCols = rightCols(); // ["C","A"] ou ["C","B","A"]
  const totalCols = leftCols.length + rCols.length;
  const width = pad + totalCols * cellW + 28 + 20; // 28 = couloir, 20 = marge sup.
  const height = pad + rows * cellH + 20;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#000000";
  ctx.font = "12px system-ui";

  // En-ttes
  let x = pad;
  const headers = leftCols.concat([""]).concat(rCols);
  for (const h of headers) {
    if (h === "") {
      x += 28;
      continue;
    }
    ctx.fillText(h, x + cellW / 2 - 4, pad - 12);
    x += cellW;
  }

  // Lignes
  for (let r = rows; r >= 1; r--) {
    const y = pad + (rows - r) * cellH;
    ctx.fillText(String(r), 10, y + 28);

    // Groupe gauche : F, E, D
    for (let i = 0; i < leftCols.length; i++) {
      const x = pad + i * cellW;
      drawSeatPNG(ctx, r, leftCols[i], x, y, cellW, cellH);
    }

    // Groupe droit : rCols (2 ou 3 cols)
    const rightBase = pad + leftCols.length * cellW + 28;
    for (let i = 0; i < rCols.length; i++) {
      const x = rightBase + i * cellW;
      drawSeatPNG(ctx, r, rCols[i], x, y, cellW, cellH);
    }
  }

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  const name =
    (store.title.flightNo || "vol") +
    "_" +
    (store.title.date || "date") +
    "_seatmap.png";
  a.download = name;
  a.click();
});

function drawSeatPNG(ctx, r, col, x, y, w, h) {
  // Cadre + fond si occup
  ctx.strokeStyle = "#888";
  ctx.strokeRect(x, y, w - 6, h - 6);

  const seat = seatObj(r, col);

  if (seat.occupied) {
    ctx.fillStyle = "#dce6ff";
    ctx.fillRect(x + 1, y + 1, w - 8, h - 8);
  }

  // Libell sige (en haut-gauche)
  ctx.fillStyle = "#000";
  ctx.font = "12px system-ui";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(r + col, x + 8, y + 18);

  // === TAG REPAS (en bas-droite) ===
  // (On n'affiche rien si le plateau est dj dbarrass)
  let tag = "";
  if (!seat?.served?.trayCleared) {
    const mealEmoji = seat.spml
      ? null
      : seat.preLabel
      ? null
      : seat.normalMeal === "viande"
      ? "1"
      : seat.normalMeal === "vege"
      ? "2"
      : seat.normalMeal === "plateau"
      ? ""
      : null;
    tag = seat.spml
      ? seat.spml
      : seat.preLabel
      ? seat.preLabel
      : mealEmoji || "";
  }

  if (tag) {
    ctx.font = "12px system-ui";
    ctx.fillStyle = "#000";
    ctx.textBaseline = "bottom";
    // lger recul du bord droit / bas
    ctx.fillText(tag, x + w - 32, y + h - 6);
    ctx.textBaseline = "alphabetic";
  }

  // === PASTILLE STATUT (en haut-droite) ===
  if (seat.status !== "none") {
    if (seat.status === "FTL") ctx.fillStyle = "#9aa4b2";
    else if (seat.status === "SEN") ctx.fillStyle = "#ffd24d";
    else if (seat.status === "HON") ctx.fillStyle = "#000000";
    else if (seat.status === "VIP") ctx.fillStyle = "#9b5cff"; // violet
    else if (seat.status === "FCL") ctx.fillStyle = "#ff5757"; // rouge
    else if (seat.status === "PAD") ctx.fillStyle = "#39d98a"; // vert
    else ctx.fillStyle = "#666";

    ctx.beginPath();
    ctx.arc(x + w - 20, y + 16, 6, 0, 2 * Math.PI);
    ctx.fill();

    // remettre par dfaut
    ctx.fillStyle = "#000";
  }
}

$("#clientView").addEventListener("click", () => {
  // bascule le flag
  store.clientView = !store.clientView;
  save();

  // applique la classe .client (cache seatmap via CSS)
  document.body.classList.toggle("client", store.clientView);

  // NE TOUCHE PLUS AU THEME ICI : on laisse l'utilisateur choisir /
  // donc pas de store.config.theme = "light", pas de _themeBeforeClient, etc.
  // et on ne dsactive PAS le bouton de thme

  applyTheme(); // applique le thme courant (light/dark) sur toute la page
  applyI18n();
  renderSeatmap();
  renderServiceFlow();
});

// --- R�initialisation sans confirm() (double-clic pour confirmer) ---
let resetArmed = false;
let resetTimer: ReturnType<typeof setTimeout> | null = null;
const RESET_CONFIRM_TIMEOUT = 4000;

function performFullReset() {
  // 1) Rinitialise les donnes
  store.inventory.plateaux = 0;
  store.inventory.hot_viande = 0;
  store.inventory.hot_vege = 0;
  for (const c of SPML_CODES) {
    store.inventory.spml[c] = 0;
  }
  store.inventory.hot_special = 0;
  store.inventory.pre = {};

  store.menu.viandeLabel = "";
  store.menu.vegeLabel = "";
  store.reminders = [];
  store.history = [];

  for (const k of Object.keys(store.seats)) {
    store.seats[k] = ensureSeatShape({});
  }

  // 2) Force "apro" pour cohrence UI
  store.phase = "fiche";

  // 3) Vide les champs texte visibles
  document
    .querySelectorAll("input[type='text'], textarea")
    .forEach((el) => (el.value = ""));

  // 4) Raligne les libells visibles avec store.menu
  const lv = document.getElementById("labelViande");
  const lg = document.getElementById("labelVege");
  if (lv) lv.value = "";
  if (lg) lg.value = "";

  // 5) Remet le chip de phase
  setActivePhaseTab("fiche");

  // 6) Re-render
  save();
  renderSeatmap();
  refreshBadges();
  renderHistory();
  renderReminders();

  // Remplace l'alert() finale par un petit log (vite blocage WebView)
  addHistoryEvt({ type: "reset" });
}

const resetBtn = document.getElementById(
  "resetFlight"
) as HTMLButtonElement | null;
if (resetBtn) {
  const getDefaultResetLabel = (): string => {
    const stored = (resetBtn.dataset.defaultLabel ?? "").trim();
    if (stored) return stored;
    const lang = store.config.lang || "EN";
    const current = I18N[lang] || I18N.EN;
    const fallback = (current.reset ?? "").trim();
    if (fallback) return fallback;
    const textContent = (resetBtn.textContent ?? "").trim();
    if (textContent) return textContent;
    return (I18N.EN?.reset ?? "Reset").trim();
  };

  const disarmResetButton = (label?: string) => {
    if (resetTimer !== null) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
    resetArmed = false;
    resetBtn.dataset.resetArmed = "false";
    const computed = (label ?? getDefaultResetLabel()).trim();
    const finalLabel = computed || (I18N.EN?.reset ?? "Reset");
    resetBtn.dataset.defaultLabel = finalLabel;
    resetBtn.textContent = finalLabel;
  };

  resetBtn.dataset.resetArmed = resetBtn.dataset.resetArmed ?? "false";
  resetBtn.addEventListener("click", () => {
    const lang = store.config.lang || "EN";
    const L = I18N[lang] || I18N.EN;
    const confirmLabel =
      (L.resetConfirm ?? L.reset ?? "Confirm").trim() || "Confirm";
    const defaultLabel = getDefaultResetLabel();

    if (!resetArmed) {
      resetArmed = true;
      resetBtn.dataset.resetArmed = "true";
      resetBtn.dataset.defaultLabel = defaultLabel;
      resetBtn.textContent = confirmLabel;

      if (resetTimer !== null) clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        disarmResetButton();
      }, RESET_CONFIRM_TIMEOUT);
    } else {
      disarmResetButton(defaultLabel);
      performFullReset();
    }
  });
}

function migrateHistoryToEvents() {
  if (!Array.isArray(store.history)) return;
  const out = [];
  for (const raw of store.history) {
    // dj en format objet  on garde
    if (raw && typeof raw === "object" && raw.type) {
      out.push(raw);
      continue;
    }
    // ancien format string
    if (typeof raw !== "string") {
      out.push(raw);
      continue;
    }

    // on enlve un ventuel prfixe [HH:MM]
    const s = raw.replace(/^\s*\[\d{2}:\d{2}\]\s*/, "");

    // essais de mapping FR/EN/DE
    let m;
    if (
      (m = s.match(
        /^(Apritif servi |Aperitif served at|Aperitif serviert bei)\s+([0-9]+[A-F])/
      ))
    ) {
      out.push({ ts: Date.now(), type: "apServed", seat: m[2] });
      continue;
    }
    if (
      (m = s.match(
        /^(Apritif annul pour|Aperitif canceled for|Aperitif storniert fr)\s+([0-9]+[A-F])/
      ))
    ) {
      out.push({ ts: Date.now(), type: "apCanceled", seat: m[2] });
      continue;
    }
    if (
      (m = s.match(
        /^(Plat servi |Main served at|Hauptgang serviert bei)\s+([0-9]+[A-F])(?:\s+\s+(.+))?/
      ))
    ) {
      out.push({
        ts: Date.now(),
        type: "mealServed",
        seat: m[2],
        label: m[3] || "",
      });
      continue;
    }
    if (
      (m = s.match(
        /^(Service annul pour|Service canceled for|Service storniert fr)\s+([0-9]+[A-F])/
      ))
    ) {
      out.push({ ts: Date.now(), type: "serviceCanceled", seat: m[2] });
      continue;
    }
    if (/(Vol rinitialis\.|Flight reset\.|Flug zurckgesetzt\.)/.test(s)) {
      out.push({ ts: Date.now(), type: "reset" });
      continue;
    }

    // dfaut : on garde en texte brut
    out.push({ ts: Date.now(), type: "text", text: s });
  }
  store.history = out;
}

(function init() {
  const ALWAYS_FRESH_START = true; //  dmarrage vierge systmatique

  if (!ALWAYS_FRESH_START) {
    try {
      const last = localStorage.getItem("serviceflow::lastKey");
      if (last) {
        const data = loadKeyData(last);
        if (data) Object.assign(store, data);
      }
    } catch (e) {}
  }

  if (!ALWAYS_FRESH_START) {
    const keys = Object.keys(localStorage)
      .filter((k) => k.startsWith("cabinboard::"))
      .sort();
    if (keys.length) {
      const latest = loadKeyData(keys[keys.length - 1]);
      if (latest) {
        Object.assign(store, latest);
      }
    }
  }
  if (store.seats && typeof store.seats === "object") {
    for (const k of Object.keys(store.seats)) {
      store.seats[k] = ensureSeatShape(store.seats[k]);
    }
  }
  for (const code of SPML_CODES) {
    if (typeof store.inventory.spml[code] !== "number")
      store.inventory.spml[code] = 0;
  }
  $("#flightNo").value = store.title.flightNo || "";
  document.getElementById("flightDateISO").value = store.title.date || ""; // ISO cach
  $("#flightDate").value = fmtDateLocalized(store.title.date || ""); // visible localis
  document
    .getElementById("flightDate")
    ?.addEventListener("input", updateFlightDatePretty);
  updateFlightDatePretty();
  const disp = document.getElementById("rowsBizDisplay");
  const layoutSel2 = document.getElementById(
    "layoutSelect"
  ) as HTMLInputElement | null;
  if (layoutSel2) layoutSel2.value = store.config.layout || "A220";
  syncLayoutButtons();
  const langSel2 = document.getElementById("langSelect");
  if (langSel2) langSel2.value = store.config.lang || "EN";
  applyI18n();
  renderHistory();
  migrateHistoryToEvents(); //  AJOUT
  renderHistory(); //  AJOUT (raffiche tout de suite avec la langue courante)
  initLangButtons();
  // Dfaut : dark si rien n'est encore dfini
  store.config.theme = "dark";
  applyTheme();
  updateSeatmapTitle();
  renderSeatmap();
  if (disp) disp.textContent = store.config.rowsBiz || 0;
  $("#labelViande").value = store.menu.viandeLabel || "";
  $("#labelVege").value = store.menu.vegeLabel || "";
  $("#labelViande").addEventListener("change", () => {
    store.menu.viandeLabel = $("#labelViande").value;
    save();
  });
  $("#labelVege").addEventListener("change", () => {
    store.menu.vegeLabel = $("#labelVege").value;
    save();
  });
  document.body.classList.toggle("client", store.clientView);

  // Aligne le chip actif sur la phase rellement stocke
  setActivePhaseTab(store.phase);
  renderSeatmap();
  refreshBadges();
  renderHistory();
  renderReminders();
})();

// === Nouveaux couteurs pour la navigation en 2 tages ===
document
  .getElementById("tc_group")
  ?.addEventListener("change", tc_updateGroupUI);
document
  .getElementById("tc_alcool_type")
  ?.addEventListener("change", tc_updateAlcoolUI);
document
  .getElementById("tc_chaud_type")
  ?.addEventListener("change", tc_updateChaudUI);
//  Forcer la rval du bouton "Servir" sur tous les sous-choix visibles
[
  "tc_soft_type",
  "tc_soft_eau",
  "tc_soft_jus",
  "tc_soft_coca",
  "tc_soft_sprite",
  "tc_beer",
  "tc_vin_rouge",
  "tc_vin_blanc",
  "tc_digestif_type",
  "tc_the_type",
  "tc_group",
  "tc_alcool_type",
  "tc_chaud_type",
].forEach((id) =>
  document
    .getElementById(id)
    ?.addEventListener("change", updateServeDrinkButtons)
);

// Sync #tc_cat avec le flux 2 tages
document.getElementById("tc_group")?.addEventListener("change", function () {
  const cat = document.getElementById("tc_cat");
  if (cat) cat.value = "";
  updateServeDrinkButtons();
});
document
  .getElementById("tc_alcool_type")
  ?.addEventListener("change", function () {
    const cat = document.getElementById("tc_cat");
    if (cat) cat.value = this.value || "";
    updateServeDrinkButtons();
  });
document
  .getElementById("tc_chaud_type")
  ?.addEventListener("change", function () {
    const cat = document.getElementById("tc_cat");
    if (cat) cat.value = this.value || "";
    updateServeDrinkButtons();
  });
document
  .getElementById("tc_soft_type")
  ?.addEventListener("change", function () {
    const cat = document.getElementById("tc_cat");
    if (cat) cat.value = "soft";
    updateServeDrinkButtons();
  });

// === Forcer la mise  jour du bouton "Servir" sur tous les sous-choix ===
document
  .getElementById("tc_soft_eau")
  ?.addEventListener("change", updateServeDrinkButtons);
document
  .getElementById("tc_soft_coca")
  ?.addEventListener("change", updateServeDrinkButtons);
document
  .getElementById("tc_soft_sprite")
  ?.addEventListener("change", updateServeDrinkButtons);

document
  .getElementById("tc_beer")
  ?.addEventListener("change", updateServeDrinkButtons);
document
  .getElementById("tc_vin_rouge")
  ?.addEventListener("change", updateServeDrinkButtons);
document
  .getElementById("tc_vin_blanc")
  ?.addEventListener("change", updateServeDrinkButtons);
document
  .getElementById("tc_cocktail_type")
  ?.addEventListener("change", updateServeDrinkButtons);
// === Dictionnaire de recettes par cocktail et par langue ===
const COCKTAIL_TIPS = {
  FR: {
    campari: [
      "<b>Campari Orange</b> : Glaons, Campari, Jus d'orange",
      "<b>Campari Soda</b> : Glaons, Campari, Eau gazeuse",
    ],
    bloody_mary: ["Glaons, Vodka, Jus de tomate, sel, poivre, citron"],
    screwdriver: ["Glaons, Vodka, Jus d'orange"],
    gin_tonic: ["Glaons, Gin, Citron, Tonic"],
    cuba_libre: ["Glaons, Rhum, Citron, Coca-Cola"],
  },
  EN: {
    campari: [
      "<b>Campari Orange</b>: Ice, Campari, Orange juice",
      "<b>Campari Soda</b>: Ice, Campari, Sparkling water",
    ],
    bloody_mary: ["Ice, Vodka, Tomato juice, salt, pepper, lemon"],
    screwdriver: ["Ice, Vodka, Orange juice"],
    gin_tonic: ["Ice, Gin, Lemon, Tonic"],
    cuba_libre: ["Ice, Rum, Lemon, Coca-Cola"],
  },
  DE: {
    campari: [
      "<b>Campari Orange</b>: Eis, Campari, Orangensaft",
      "<b>Campari Soda</b>: Eis, Campari, Sodawasser",
    ],
    bloody_mary: ["Eis, Wodka, Tomatensaft, Salz, Pfeffer, Zitrone"],
    screwdriver: ["Eis, Wodka, Orangensaft"],
    gin_tonic: ["Eis, Gin, Zitrone, Tonic"],
    cuba_libre: ["Eis, Rum, Zitrone, Coca-Cola"],
  },
};

function _tipLang() {
  return (store?.config?.lang || "EN").toUpperCase();
}

function _fillTip(val) {
  const tip = document.getElementById("tc_tip");
  const L = _tipLang();
  const lines = COCKTAIL_TIPS[L]?.[val] || null;
  const bullets = Array.isArray(lines) && lines.length > 1; // puces seulement si >1 ligne (Campari)
  tip.innerHTML = lines
    ? lines.map((l) => `<div>${bullets ? " " : ""}${l}</div>`).join("")
    : "";
}

function _showTipButton(val) {
  const btn = document.getElementById("tc_tipBtn");
  const tip = document.getElementById("tc_tip");
  if (!btn || !tip) return;
  if (val) {
    btn.style.display = "inline-flex";
    tip.style.display = "none"; // on ferme si on change
  } else {
    btn.style.display = "none";
    tip.style.display = "none";
  }
}

// Remplace l'couteur existant :
(function replaceCocktailChangeHandler() {
  const sel = document.getElementById("tc_cocktail_type");
  if (!sel) return;

  // On enlve les anciens listeners potentiels en clonant
  const clone = sel.cloneNode(true);
  sel.parentNode.replaceChild(clone, sel);
  const s = document.getElementById("tc_cocktail_type");

  s.addEventListener("change", (e) => {
    const val = e.target.value;

    // (1) Sel/poivre uniquement pour Bloody Mary (comme avant)
    const showBM = val === "bloody_mary";
    document.querySelectorAll("#tc_cocktail .bm-only").forEach((el) => {
      el.style.display = showBM ? "inline-flex" : "none";
      if (!showBM) el.querySelector("input").checked = false;
    });

    // (2) Bulle recettes
    _showTipButton(val);
    _fillTip(val);

    // (3) Conduite existante : re-calcul du bouton "Servir"
    updateServeDrinkButtons();
    tc_save?.();
  });

  // Bouton (i) : toggle bulle
  document.getElementById("tc_tipBtn")?.addEventListener("click", () => {
    const tip = document.getElementById("tc_tip");
    if (!tip) return;
    tip.style.display =
      tip.style.display === "none" || !tip.style.display ? "block" : "none";
  });

  // Clique hors bulle => fermer
  document.addEventListener("click", (ev) => {
    const wrap = document.getElementById("tc_cocktail_tipwrap");
    const tip = document.getElementById("tc_tip");
    if (wrap && tip && !wrap.contains(ev.target)) tip.style.display = "none";
  });

  // Init au chargement (au cas o un cocktail est dj pr-slectionn quand on rouvre une fentre sige)
  s.dispatchEvent(new Event("change"));
})();

// On garde ceux qui existent dj :
document
  .getElementById("tc_soft_type")
  ?.addEventListener("change", function () {
    tc_updateSoftUI();
    updateServeDrinkButtons();
  });
document.addEventListener("DOMContentLoaded", () => {
  ensureLegalBanner(); // le cre ds le dpart
  // si applyI18n() est appele plus tard par ton code, la phrase se traduira automatiquement
});

// === Sauvegarde disquette  export JSON instantan ===
document.getElementById("saveSnapshot")?.addEventListener("click", () => {
  // construit un nom de fichier lisible
  const fn = (store?.title?.flightNo || "no-flight").replace(/\W+/g, "_");
  const d = (store?.title?.date || "no-date").replace(/\W+/g, "_");
  const name = `SWISS_ServiceFlow-${fn}-${d}.json`;

  // contenu : l'tat complet (store)
  const blob = new Blob([JSON.stringify(store, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 500);
});

function lastMealDrinkEventForSeat(seatKey) {
  // Historique newest-first  le 1er match est le bon
  for (let i = 0; i < store.history.length; i++) {
    const ev = store.history[i];
    if (!ev) continue;
    if (ev.type === "tcServed" && ev.seat === seatKey && ev.ctx === "repas") {
      return ev;
    }
  }
  return null;
}
function drinkEmoji(ap) {
  if (!ap) return "";
  // Hot
  if (ap.cat === "cafe") return "";
  if (ap.cat === "deca") return "";
  if (ap.cat === "the") return "";
  if (ap.cat === "chocolat") return "";
  // Soft (dpend du sous-type)
  if (ap.cat === "soft") {
    if (ap.softType === "eau") return "";
    if (ap.softType === "coca") return "";
    if (ap.softType === "jus") return "";
    if (ap.softType === "sprite") return "";
    if (ap.softType === "tonic") return "";
  }
  // Alcool
  if (ap.cat === "champagne") return "";
  if (ap.cat === "vin_rouge") return "";
  if (ap.cat === "vin_blanc") return "";
  if (ap.cat === "biere") return "";
  if (ap.cat === "cocktail") return "";
  if (ap.cat === "digestif") return "";
  return "";
}

function mealDrinkLineHTML(seatKey) {
  // Dernire boisson servie en contexte "repas"
  const ev = lastMealDrinkEventForSeat(seatKey);
  if (!ev) return ""; // rien  afficher si pas encore servie

  const L = I18N[store.config.lang || "EN"];
  let label = "";
  if (ev.ap) {
    // Rutilise ton rsum boisson existant
    label = summarizeApDrink(ev.ap, L, store.config.lang || "EN") || "";
  }
  const notes = (ev.notes || "").trim();
  const txt = [label, notes].filter(Boolean).join("  ");
  const em = drinkEmoji(ev.ap);
  const withEmoji = (em ? em + " " : "") + txt;
  return txt ? `<div class="flow-sub">${withEmoji}</div>` : "";
}

function updateMealDrinkInline(seatKey) {
  const span = document.getElementById("mhMealDrinkInline");
  if (!span) return;

  const L = I18N[store.config.lang || "EN"];
  const ev = lastMealDrinkEventForSeat(seatKey);
  const prefix = (L.mealDrinkTitle || "Meal drinks") + ": ";

  if (!ev) {
    // Affiche le libell + tiret long quand pas d'event
    span.textContent = prefix + "";
    return;
  }

  const ts = ev.ts || ev.t || null;
  const timeTxt = ts
    ? new Date(ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  let label = "";
  if (ev.ap) {
    label = summarizeApDrink(ev.ap, L, store.config.lang || "EN") || "";
  }

  // Affiche "Meal drinks: HH:MM  libell" si dispo, sinon juste "HH:MM"
  span.textContent = prefix + (label ? `${timeTxt}  ${label}` : `${timeTxt}`);
}

// Dernier vnement TC (hors contexte "repas")
function lastTcEventForSeat(seatKey) {
  for (let i = 0; i < store.history.length; i++) {
    const ev = store.history[i];
    if (!ev) continue;
    if (ev.type === "tcServed" && ev.seat === seatKey && ev.ctx !== "repas") {
      return ev; // premier match = le plus rcent (newest-first)
    }
  }
  return null;
}

// Met  jour le petit horodateur en phase TC (span #mhTCInline)
function updateTCInline(seatKey) {
  const span = document.getElementById("mhTCInline");
  if (!span) return;

  const L = I18N[store.config.lang || "EN"];
  const ev = lastTcEventForSeat(seatKey);
  const prefix = (L.chips_tc || "Tea & Coffee") + ": ";

  if (!ev) {
    // Affiche le libell + tiret long quand pas d'event
    span.textContent = prefix + "";
    return;
  }

  const ts = ev.ts || ev.t || null; // addHistoryEvt met ts
  const timeTxt = ts
    ? new Date(ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  let label = "";
  if (ev.ap) {
    label = summarizeApDrink(ev.ap, L, store.config.lang || "EN") || "";
  }

  // Affiche "Tea & Coffee: HH:MM  libell" si dispo, sinon juste "HH:MM"
  span.textContent = prefix + (label ? `${timeTxt}  ${label}` : `${timeTxt}`);
}

// --- UI  store : synchronise les champs libres avant export ---
export function syncUIToStoreForExport() {
  // Vol / date (si lutilisateur na pas cliqu sur )
  const fn = document.getElementById("flightNo");
  const fdISO = document.getElementById("flightDateISO");
  const fd = document.getElementById("flightDate");
  if (!store.title) store.title = { flightNo: "", date: "" };
  if (fn) store.title.flightNo = (fn.value || "").trim();
  if (fdISO && fdISO.value) store.title.date = fdISO.value;
  else if (fd) store.title.date = fd.value;

  // Libells Option 1 / Option 2 (les intituls dont tu parles)
  const lv = document.getElementById("labelViande");
  const lg = document.getElementById("labelVege");
  if (!store.menu) store.menu = {};
  if (lv) store.menu.viandeLabel = (lv.value || "").trim();
  if (lg) store.menu.vegeLabel = (lg.value || "").trim();
}

export function initFlightFormsLegacy(): void {
  if (typeof initFlightDatePicker === "function") initFlightDatePicker();
  attachHeaderButtons?.();
  initLangButtons?.();
  applyTheme?.();
}

export function initMealSectionLegacy(): void {
  initializeDrinkMenu();
  initDrinkGrid();
  reactivateDrinkGrid();
  updateServeDrinkButtons();

  const mealBlock = document.getElementById("mealBlock");
  if (mealBlock && !mealBlock.dataset.touchReady) {
    mealBlock.addEventListener("touchstart", handleMealTouchStart, {
      passive: true,
    });
    mealBlock.addEventListener("touchend", handleMealTouchEnd, {
      passive: true,
    });
    mealBlock.addEventListener(
      "touchcancel",
      () => {
        mealGestureCtx = null;
      },
      { passive: true }
    );
    mealBlock.dataset.touchReady = "1";
  }
}

export function initPassengersSectionLegacy(): void {
  setTooltips?.();
}

export function initAirportSectionLegacy(): void {
  // Seat map logic is initialised during bootLegacyApp().
}

export function bootLegacyApp(): void {
  init?.();
}

export function persistCurrentState(): void {
  syncUIToStoreForExport();
  save();
}

export {
  store,
  SPML_CODES,
  ensureSeatShape,
  seatObj,
  storageKey,
  sumSPML,
  sumPRE,
  rightCols,
};
