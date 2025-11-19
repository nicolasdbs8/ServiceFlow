// @ts-nocheck
export const DRINK_EMOJI_BIG = {
  chaud: {
    cafe: "\u2615",
    deca: "\uD83D\uDEAB\u2615",
    the: "\uD83E\uDED6",
    chocolat: "\uD83C\uDF6B",
  },
  soft: {
    eau: "\uD83D\uDCA7",
    coca: "\uD83E\uDD64",
    jus: "\uD83E\uDDC3",
    sprite: "\uD83D\uDFE2",
    tonic: "\uD83E\uDEE7",
  },
  alcool: {
    champagne: "\uD83C\uDF7E",
    vin_rouge: "\uD83C\uDF77",
    vin_blanc: "\uD83E\uDD42",
    biere: "\uD83C\uDF7A",
    cocktail: "\uD83C\uDF79",
    digestif: "\uD83E\uDD43",
  },
};

export const DRINK_EMOJI_OPT = {
  "milk:creme": "\uD83C\uDF76",
  "milk:avoine": "\uD83C\uDF3E",
  "milk:lait": "\uD83E\uDD5B",
  "milk:none": "\uD83D\uDEAB",
  "sweet:sucre": "\uD83C\uDF6C",
  "sweet:succedane": "\uD83D\uDC8A",
  "sweet:none": "\uD83D\uDEAB",
  "theType:english": "\uD83C\uDDEC\uD83C\uDDE7",
  "theType:vert": "\uD83C\uDF43",
  "theType:menthe": "\uD83C\uDF3F",
  "theType:camomille": "\uD83C\uDF3C",
  "theType:hotwater": "\u2668\uFE0F",
  "waterType:plate": "\uD83D\uDCA7",
  "waterType:gazeuse": "\uD83D\uDCA6",
  "cocaType:normal": "\uD83D\uDFE5",
  "cocaType:zero": "\u2B1B",
  "juiceType:orange": "\uD83C\uDF4A",
  "juiceType:pomme": "\uD83C\uDF4F",
  "juiceType:tomate": "\uD83C\uDF45",
  "beer:quoellfrisch": "\uD83C\uDF7A",
  "beer:calvinus": "\u26AA",
  "beer:leermond": "\uD83C\uDF1A",
  "vinRouge:suisse": "\uD83C\uDDE8\uD83C\uDDED",
  "vinRouge:etranger": "\uD83C\uDF0D",
  "vinBlanc:suisse": "\uD83C\uDDE8\uD83C\uDDED",
  "vinBlanc:etranger": "\uD83C\uDF0D",
  "digestif:whisky_jw": "\uD83E\uDD43",
  "digestif:whisky_jb": "\uD83E\uDD20",
  "digestif:cognac": "\uD83C\uDF47",
  "digestif:baileys": "\uD83C\uDF6E",
  "cocktail:campari": "\uD83D\uDFE5",
  "cocktail:bloody_mary": "\uD83E\uDE78",
  "cocktail:screwdriver": "\uD83E\uDE9B",
  "cocktail:gin_tonic": "\uD83C\uDF78",
  "cocktail:cuba_libre": "\uD83C\uDDE8\uD83C\uDDFA",
  "campariMix:orange": "\uD83C\uDF4A",
  "campariMix:soda": "\uD83D\uDCA6",
};

export const DRINK_EMOJI_FLAG = {
  theLemon: "\uD83C\uDF4B",
  softIce: "\uD83E\uDDCA",
  softLemon: "\uD83C\uDF4B",
  spriteIce: "\uD83E\uDDCA",
  spriteLemon: "\uD83C\uDF4B",
  tonicIce: "\uD83E\uDDCA",
  tonicLemon: "\uD83C\uDF4B",
  juiceIce: "\uD83E\uDDCA",
  juiceLemon: "\uD83C\uDF4B",
  juiceSP: "\uD83E\uDDC2",
  juiceApfelschorle: "\uD83D\uDCA6",
  champIce: "\uD83E\uDDCA",
  champMimosa: "\uD83C\uDF4A",
  digIce: "\uD83E\uDDCA",
  virginMary: "\uD83D\uDE07",
  cocktailIce: "\uD83E\uDDCA",
  cocktailLemon: "\uD83C\uDF4B",
  cocktailSP: "\uD83E\uDDC2",
};

export function emojiForBig(cat: string, sub: string) {
  return (DRINK_EMOJI_BIG[cat] && DRINK_EMOJI_BIG[cat][sub]) || "";
}

export function emojiForOpt(key: string) {
  return DRINK_EMOJI_OPT[key] || "";
}

export function emojiForFlag(flag: string) {
  return DRINK_EMOJI_FLAG[flag] || "";
}

export function applyDrinkEmojis(scope?: Document | HTMLElement | null) {
  const root = scope || document;
  if (!root || typeof root.querySelectorAll !== "function") return;

  root.querySelectorAll(".pill.big").forEach((btn) => {
    const cat = btn.dataset.cat;
    const sub = btn.dataset.sub;
    const emoji = DRINK_EMOJI_BIG[cat]?.[sub];
    if (emoji) btn.textContent = emoji;
  });

  root.querySelectorAll(".pill[data-opt]").forEach((btn) => {
    const emoji = DRINK_EMOJI_OPT[btn.dataset.opt];
    if (emoji) btn.textContent = emoji;
  });

  root.querySelectorAll(".pill.toggle[data-flag]").forEach((btn) => {
    const emoji = DRINK_EMOJI_FLAG[btn.dataset.flag];
    if (emoji) btn.textContent = emoji;
  });
}


