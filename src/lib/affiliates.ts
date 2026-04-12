export const AFFILIATE_CODES: Record<string, (url: string) => string> = {
  "argos.co.uk": (url) => url + (url.includes("?") ? "&" : "?") + "awc=ARGOS_AWIN_ID",
  "amazon.co.uk": (url) => url + (url.includes("?") ? "&" : "?") + "tag=AMAZON_ASSOCIATES_TAG",
  "johnlewis.com": (url) => url + (url.includes("?") ? "&" : "?") + "awc=JOHNLEWIS_AWIN_ID",
  "boots.com": (url) => url + (url.includes("?") ? "&" : "?") + "awc=BOOTS_AWIN_ID",
  "mamas-papas.com": (url) => url + (url.includes("?") ? "&" : "?") + "awc=MAMASPAPS_AWIN_ID",
  "smyths.com": (url) => url + (url.includes("?") ? "&" : "?") + "awc=SMYTHS_AWIN_ID",
  "next.co.uk": (url) => url + (url.includes("?") ? "&" : "?") + "awc=NEXT_AWIN_ID",
  "very.co.uk": (url) => url + (url.includes("?") ? "&" : "?") + "awc=VERY_AWIN_ID",
  "asda.com": (url) => url + (url.includes("?") ? "&" : "?") + "awc=ASDA_AWIN_ID",
  "tesco.com": (url) => url + (url.includes("?") ? "&" : "?") + "awc=TESCO_AWIN_ID",
  "dunelm.com": (url) => url + (url.includes("?") ? "&" : "?") + "awc=DUNELM_AWIN_ID",
};

/** Given a URL and retailer domain, return the affiliate-tracked URL */
export function applyAffiliateCode(url: string, retailer: string): string {
  // Match the retailer key — the retailer field might be a full domain or just the name part
  const matchedKey = Object.keys(AFFILIATE_CODES).find((key) =>
    retailer.toLowerCase().includes(key) || key.includes(retailer.toLowerCase())
  );
  if (matchedKey) {
    return AFFILIATE_CODES[matchedKey](url);
  }
  return url;
}
