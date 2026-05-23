// 既定コース(パー72) と、すぐ分析を体験できるサンプルラウンド。

export const DEFAULT_PARS = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 5, 3, 4, 4, 3, 4, 5, 4];

export const CLUBS = [
  { value: "driver", label: "Driver" },
  { value: "wood", label: "Wood" },
  { value: "ut", label: "UT" },
  { value: "longiron", label: "Long Iron" },
  { value: "middleiron", label: "Middle Iron" },
  { value: "shortiron", label: "Short Iron" },
  { value: "wedge", label: "Wedge" },
  { value: "putter", label: "Putter" },
];

export function emptyHole(par) {
  return {
    stroke: par,
    putt: 2,
    teeShotClub: null,
    teeShotResult: null,
    parOnShotDistance: "",
    parOnShotClub: null,
    parOnShotResult: null,
    puttRemained: null,
    puttMissed: null,
    puttDistance: null,
    guardBunker: false,
    ob: 0,
    hazard: 0,
    penalty: 0,
  };
}

export function emptyRound(pars = DEFAULT_PARS) {
  return pars.map((p) => emptyHole(p));
}

// 約83ストロークの現実的なサンプル。全項目を埋めて分析を一通り表示できるようにしてある。
// h(stroke, putt, {teeShotClub, teeShotResult, parOnShotDistance, parOnShotClub,
//                  parOnShotResult, puttRemained, puttMissed, puttDistance,
//                  guardBunker, ob, hazard, penalty})
const h = (stroke, putt, o = {}) => ({
  stroke,
  putt,
  teeShotClub: o.tc ?? null,
  teeShotResult: o.tr ?? null,
  parOnShotDistance: o.pd ?? "",
  parOnShotClub: o.pc ?? null,
  parOnShotResult: o.pr ?? null,
  puttRemained: o.pm ?? null,
  puttMissed: o.pms ?? null,
  puttDistance: o.pdist ?? null,
  guardBunker: o.gb ?? false,
  ob: o.ob ?? 0,
  hazard: o.hz ?? 0,
  penalty: o.pen ?? 0,
});

export const SAMPLE_PARS = DEFAULT_PARS;

export const SAMPLE_ROUND = [
  // OUT
  h(4, 2, { tc: "driver", tr: "fw", pd: "150", pc: "middleiron", pr: "onGreen", pm: "middle", pms: "nomiss", pdist: "nomiss" }),
  h(5, 2, { tc: "driver", tr: "right", pd: "95", pc: "wedge", pr: "right", pm: "middle", pms: "right", pdist: "long", gb: true }),
  h(3, 2, { pd: "160", pc: "middleiron", pr: "short", pm: "middle", pms: "left", pdist: "short" }),
  h(6, 2, { tc: "driver", tr: "left", pd: "210", pc: "wood", pr: "over", pm: "long", pms: "right", pdist: "long", ob: 1 }),
  h(4, 1, { tc: "driver", tr: "fw", pd: "120", pc: "shortiron", pr: "onGreen", pm: "short", pms: "nomiss", pdist: "nomiss" }),
  h(4, 2, { tc: "wood", tr: "fw", pd: "140", pc: "middleiron", pr: "onGreen", pm: "short", pms: "left", pdist: "short" }),
  h(4, 2, { pd: "175", pc: "longiron", pr: "left", pm: "long", pms: "right", pdist: "short", gb: true }),
  h(4, 2, { tc: "driver", tr: "fw", pd: "130", pc: "shortiron", pr: "onGreen", pm: "short", pms: "nomiss", pdist: "nomiss" }),
  h(5, 2, { tc: "driver", tr: "fw", pd: "90", pc: "wedge", pr: "onGreen", pm: "short", pms: "right", pdist: "short" }),
  // IN
  h(4, 2, { tc: "driver", tr: "fw", pd: "145", pc: "middleiron", pr: "onGreen", pm: "middle", pms: "left", pdist: "nomiss" }),
  h(6, 3, { tc: "driver", tr: "right", pd: "230", pc: "wood", pr: "over", pm: "long", pms: "left", pdist: "long", hz: 1 }),
  h(3, 2, { pd: "155", pc: "middleiron", pr: "onGreen", pm: "middle", pms: "nomiss", pdist: "nomiss" }),
  h(5, 2, { tc: "driver", tr: "left", pd: "100", pc: "wedge", pr: "short", pm: "short", pms: "right", pdist: "short", gb: true }),
  h(4, 1, { tc: "driver", tr: "fw", pd: "110", pc: "shortiron", pr: "onGreen", pm: "pin", pms: "nomiss", pdist: "nomiss" }),
  h(4, 2, { pd: "185", pc: "longiron", pr: "right", pm: "long", pms: "right", pdist: "long", pen: 1 }),
  h(4, 2, { tc: "driver", tr: "fw", pd: "135", pc: "shortiron", pr: "onGreen", pm: "short", pms: "nomiss", pdist: "nomiss" }),
  h(5, 2, { tc: "driver", tr: "fw", pd: "60", pc: "wedge", pr: "onGreen", pm: "pin", pms: "nomiss", pdist: "nomiss" }),
  h(4, 2, { tc: "driver", tr: "right", pd: "165", pc: "middleiron", pr: "left", pm: "middle", pms: "right", pdist: "short", gb: true }),
];
