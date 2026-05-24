import { emptyHole } from "./courseData.js";

const VERSION = 1;

// 短いキーに圧縮 (URLを短く保つ)。
const KEYMAP = {
  stroke: "s",
  putt: "u",
  teeShotClub: "a",
  teeShotResult: "b",
  parOnShotDistance: "e",
  parOnShotClub: "f",
  parOnShotResult: "g",
  puttRemained: "i",
  puttMissed: "j",
  puttDistance: "k",
  guardBunker: "m",
  ob: "o",
  hazard: "z",
  penalty: "n",
};
const FIELDS = Object.keys(KEYMAP);
const NUM_FIELDS = new Set(["stroke", "putt", "ob", "hazard", "penalty"]);

function b64urlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s) {
  let t = s.replace(/-/g, "+").replace(/_/g, "/");
  while (t.length % 4) t += "=";
  const bin = atob(t);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeState({ courseName, player, date, pars, holes, advice }) {
  const h = holes.map((hole, idx) => {
    const def = emptyHole(pars[idx]);
    const diff = {};
    for (const f of FIELDS) {
      if (hole[f] !== def[f]) diff[KEYMAP[f]] = hole[f];
    }
    return diff;
  });
  const payload = {
    v: VERSION,
    c: courseName || "",
    p: player || "",
    d: date || "",
    r: pars,
    h,
  };
  if (advice && typeof advice === "string") payload.g = advice;
  return b64urlEncode(JSON.stringify(payload));
}

export function decodeState(code) {
  try {
    const payload = JSON.parse(b64urlDecode(code));
    if (!payload || payload.v !== VERSION) return null;
    if (!Array.isArray(payload.r) || payload.r.length !== 18) return null;
    if (!Array.isArray(payload.h) || payload.h.length !== 18) return null;

    const pars = payload.r.map((p) => {
      const n = Math.round(Number(p));
      return n >= 3 && n <= 6 ? n : 4;
    });

    const holes = payload.h.map((diff, idx) => {
      const hole = emptyHole(pars[idx]);
      if (diff && typeof diff === "object") {
        for (const f of FIELDS) {
          const sk = KEYMAP[f];
          if (Object.prototype.hasOwnProperty.call(diff, sk)) hole[f] = diff[sk];
        }
      }
      // 防御的に型を整える (改竄・破損対策)
      for (const f of NUM_FIELDS) {
        const n = Math.round(Number(hole[f]));
        hole[f] = Number.isFinite(n) ? n : emptyHole(pars[idx])[f];
      }
      hole.stroke = Math.max(1, hole.stroke);
      hole.putt = Math.max(0, hole.putt);
      hole.ob = Math.max(0, hole.ob);
      hole.hazard = Math.max(0, hole.hazard);
      hole.penalty = Math.max(0, hole.penalty);
      hole.guardBunker = !!hole.guardBunker;
      hole.parOnShotDistance =
        hole.parOnShotDistance == null ? "" : String(hole.parOnShotDistance);
      return hole;
    });

    return {
      courseName: typeof payload.c === "string" ? payload.c : "",
      player: typeof payload.p === "string" ? payload.p : "",
      date: typeof payload.d === "string" ? payload.d : "",
      pars,
      holes,
      advice: typeof payload.g === "string" ? payload.g : null,
    };
  } catch {
    return null;
  }
}

export function buildShareUrl(state) {
  const code = encodeState(state);
  const base = location.origin + location.pathname;
  return `${base}#r=${code}`;
}

export function readSharedState() {
  const hash = typeof location !== "undefined" ? location.hash : "";
  const m = hash.match(/[#&]r=([^&]+)/);
  if (!m) return null;
  return decodeState(m[1]);
}
