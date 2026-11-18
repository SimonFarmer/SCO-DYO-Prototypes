/**
 * Ring preview renders for the Timeless Solitaire (14k yellow gold), as shaneco.com builds them for
 * "Preview with Shape / Gemstone / Size" on p/41004888:
 *   images.shaneco.com/is/image/ShaneCo/designer-ring/570/{stone}-{shape}_{x}_{y}/built-item_41004888_P.jpg
 * x/y size the stone in the render (fancy shapes have different width and height).
 *
 * The codes below are copied from shaneco.com's own size table (`/gemstone-sizes`, Nov 2026):
 * diamonds by carat (0.25–5.00 ct in 0.25 steps), gemstones by millimetres (4.0–10.0 mm in 0.5 steps).
 * Gemstone codes depend only on shape and size, so one table serves all 20 gemstones.
 * Renders are served from Shane Co.'s image server, not stored in the repo.
 */

/** "WxH" per diamond shape, one per 0.25 ct from 0.25 to 5.00 ct. */
const DIAMOND_CODES: Record<string, string[]> = {
  round: ["199x199", "252x252", "286x286", "315x315", "339x339", "359x359", "378x378", "397x397", "412x412", "426x426", "441x441", "456x456", "470x470", "485x485", "494x494", "504x504", "514x514", "523x523", "533x533", "543x543"],
  oval: ["186x242", "224x291", "261x339", "280x363", "291x378", "298x388", "308x400", "317x412", "326x424", "336x436", "354x460", "373x485", "382x497", "391x509", "401x521", "410x533", "419x545", "429x557", "438x569", "447x582"],
  pear: ["145x218", "194x291", "226x339", "258x388", "275x412", "291x436", "307x460", "323x485", "339x509", "355x533", "372x557", "388x582", "404x606", "420x630", "436x654", "452x678", "493x739", "501x751", "509x763", "485x727"],
  emerald: ["173x242", "208x291", "225x315", "242x339", "260x363", "277x388", "286x400", "294x412", "303x424", "312x436", "329x460", "346x485", "355x497", "363x509", "372x521", "381x533", "389x545", "398x557", "407x569", "415x582"],
  princess: ["165x165", "211x211", "240x240", "267x267", "291x291", "315x315", "339x339", "351x351", "356x356", "363x363", "376x376", "388x388", "400x400", "407x407", "417x417", "424x424", "431x431", "441x441", "451x451", "460x460"],
  cushion: ["165x165", "211x211", "240x240", "267x267", "291x291", "315x315", "339x339", "363x363", "376x376", "388x388", "395x395", "402x402", "410x410", "419x419", "426x426", "436x436", "442x442", "448x448", "454x454", "460x460"],
  heart: ["213x194", "267x242", "309x281", "347x315", "360x327", "373x339", "400x363", "426x388", "440x400", "453x412", "466x424", "480x436", "493x448", "506x460", "520x473", "533x485", "546x497", "560x509", "573x521", "586x533"],
  asscher: ["165x165", "211x211", "240x240", "267x267", "291x291", "315x315", "339x339", "363x363", "376x376", "388x388", "395x395", "402x402", "411x411", "419x419", "428x428", "436x436", "442x442", "448x448", "454x454", "460x460"],
  marquise: ["162x291", "215x388", "242x436", "269x485", "283x509", "296x533", "310x557", "323x582", "337x606", "350x630", "363x654", "377x678", "390x703", "404x727", "417x751", "431x775", "438x788", "444x800", "451x812", "458x824"],
  radiant: ["158x189", "198x237", "226x271", "250x300", "269x322", "283x339", "299x359", "315x378", "327x393", "337x405", "349x419", "359x431", "370x443", "380x456", "390x468", "400x480", "414x497", "424x509", "434x521", "444x533"],
}

/** "WxH" per gemstone shape, one per 0.5 mm from 4.0 to 10.0 mm. */
const GEM_CODES: Record<string, string[]> = {
  round: ["194x194", "218x218", "242x242", "267x267", "291x291", "315x315", "339x339", "363x363", "388x388", "412x412", "436x436", "460x460", "485x485"],
  oval: ["149x194", "168x218", "186x242", "205x267", "224x291", "242x315", "261x339", "280x363", "298x388", "317x412", "336x436", "354x460", "373x485"],
  pear: ["138x194", "156x218", "173x242", "190x267", "208x291", "225x315", "242x339", "260x363", "277x388", "294x412", "312x436", "329x460", "346x485"],
  emerald: ["149x194", "168x218", "186x242", "205x267", "224x291", "242x315", "261x339", "280x363", "298x388", "317x412", "336x436", "354x460", "373x485"],
  princess: ["194x194", "218x218", "242x242", "267x267", "291x291", "315x315", "339x339", "363x363", "388x388", "412x412", "436x436", "460x460", "485x485"],
  cushion: ["194x194", "218x218", "242x242", "267x267", "291x291", "315x315", "339x339", "363x363", "388x388", "412x412", "436x436", "460x460", "485x485"],
  heart: ["176x194", "198x218", "220x242", "242x267", "264x291", "286x315", "308x339", "330x363", "352x388", "374x412", "397x436", "419x460", "441x485"],
  asscher: ["194x194", "218x218", "242x242", "267x267", "291x291", "315x315", "339x339", "363x363", "388x388", "412x412", "436x436", "460x460", "485x485"],
  marquise: ["108x194", "121x218", "135x242", "148x267", "162x291", "175x315", "188x339", "202x363", "215x388", "229x412", "242x436", "256x460", "269x485"],
  radiant: ["162x194", "182x218", "202x242", "222x267", "242x291", "263x315", "283x339", "303x363", "323x388", "343x412", "363x436", "384x460", "404x485"],
}

const BASE = "https://images.shaneco.com/is/image/ShaneCo/designer-ring/570"

const pick = (list: string[], index: number) => list[Math.max(0, Math.min(list.length - 1, index))]

/**
 * Ring render URL. `stone` is Shane Co.'s render name ("diamond", "ruby", "traditional-blue"…);
 * `size` is carats for diamonds and millimetres for gemstones.
 */
export function ringRender(stone: string, shape: string, size: number, unit: "ct" | "mm", width = 1000) {
  const codes = unit === "ct" ? DIAMOND_CODES[shape] ?? DIAMOND_CODES.round : GEM_CODES[shape] ?? GEM_CODES.round
  const index = unit === "ct" ? Math.round((size - 0.25) / 0.25) : Math.round((size - 4) / 0.5)
  const [x, y] = pick(codes, index).split("x")
  return `${BASE}/${stone}-${shape}_${x}_${y}/built-item_41004888_P.jpg&wid=${width}&hei=${width}&posN=0,0.05&fmt=png-alpha`
}
