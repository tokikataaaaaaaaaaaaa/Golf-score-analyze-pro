import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ReferenceLine,
} from "recharts";
import { rate } from "../lib/analyze.js";

const C = {
  birdie: "#cf3a2e",
  par: "#2c7a52",
  bogey: "#3f7fb0",
  double: "#16233a",
  coral: "#e8553d",
  gold: "#d8a93a",
  grid: "rgba(122,178,150,0.18)",
  axis: "rgba(244,238,222,0.6)",
  cream: "#f4eede",
};

const axisStyle = { fontSize: 11, fontFamily: "Spline Sans Mono, monospace", fill: C.axis };

function tip() {
  return {
    contentStyle: {
      background: "#0e2a1f",
      border: "1px solid rgba(122,178,150,0.3)",
      borderRadius: 8,
      color: C.cream,
      fontFamily: "Spline Sans Mono, monospace",
      fontSize: 12,
    },
    labelStyle: { color: C.cream },
    cursor: { fill: "rgba(122,178,150,0.08)" },
  };
}

// スコア構成 (イーグル以下 / バーディ / パー / ボギー / ダボ以上)
export function ScoreDistribution({ r }) {
  const data = [
    { name: "Eagle-", v: r.underBirdieCount, c: C.birdie },
    { name: "Birdie", v: r.birdieCount, c: C.coral },
    { name: "Par", v: r.parCount, c: C.par },
    { name: "Bogey", v: r.bogeyCount, c: C.bogey },
    { name: "Dbl+", v: r.overBogeyCount, c: C.double },
  ];
  return (
    <div className="chart-wrap">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: C.grid }} tickLine={false} />
          <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip {...tip()} formatter={(v) => [`${v} ホール`, "数"]} />
          <Bar dataKey="v" radius={[5, 5, 0, 0]} maxBarSize={56}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.c} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ホール別 To par
export function HoleByHole({ pars, holes }) {
  const data = holes.map((h, i) => {
    const d = (Number(h.stroke) || 0) - pars[i];
    return { name: i + 1, d };
  });
  const colorFor = (d) => (d < 0 ? C.birdie : d === 0 ? C.par : d === 1 ? C.bogey : C.double);
  return (
    <div className="chart-wrap">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
          <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: C.grid }} tickLine={false} interval={0} />
          <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
          <ReferenceLine y={0} stroke={C.grid} />
          <Tooltip
            {...tip()}
            formatter={(v) => [`${v > 0 ? "+" : ""}${v}`, "To par"]}
            labelFormatter={(l) => `Hole ${l}`}
          />
          <Bar dataKey="d" radius={[3, 3, 0, 0]} maxBarSize={26}>
            {data.map((d, i) => (
              <Cell key={i} fill={colorFor(d.d)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// パット数/ホール
export function PuttsPerHole({ holes }) {
  const data = holes.map((h, i) => ({ name: i + 1, putt: Number(h.putt) || 0 }));
  const colorFor = (p) => (p <= 1 ? C.birdie : p === 2 ? C.par : C.bogey);
  return (
    <div className="chart-wrap">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
          <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: C.grid }} tickLine={false} interval={0} />
          <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip {...tip()} formatter={(v) => [`${v} putt`, ""]} labelFormatter={(l) => `Hole ${l}`} />
          <Bar dataKey="putt" radius={[3, 3, 0, 0]} maxBarSize={26}>
            {data.map((d, i) => (
              <Cell key={i} fill={colorFor(d.putt)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 総合レーダー: 主要な率を 0-100 で
export function SummaryRadar({ r }) {
  const data = [
    { k: "FWキープ", v: rate(r.teeShotFairwayCount, r.teeShotResultCount) },
    { k: "パーオン", v: rate(r.parOnCount, 18) },
    { k: "1パット", v: rate(r.puttNoMissCount, r.puttTryCount) },
    { k: "バンカー\nセーブ", v: rate(r.bunkerParSaveCount, r.bunkerCount) },
    { k: "バーディ\n成功", v: rate(r.birdieChanceHoleInCount, r.birdieChanceCount) },
    { k: "2パット率", v: rate(r.puttInMiddleTwoPuttCount + r.puttInLongTwoPuttCount, r.puttInMiddleCount + r.puttInLongCount) },
  ];
  return (
    <div className="chart-wrap">
      <ResponsiveContainer>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke={C.grid} />
          <PolarAngleAxis dataKey="k" tick={{ ...axisStyle, fontFamily: "Zen Kaku Gothic New, sans-serif" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="v" stroke={C.coral} fill={C.coral} fillOpacity={0.35} />
          <Tooltip {...tip()} formatter={(v) => [`${v.toFixed(1)}%`, ""]} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// パーオン距離別の達成率
export function ParOnByDistance({ r }) {
  const data = [
    { name: "〜50y", on: r.parOnUnder50OnGreenCount, t: r.parOnUnder50Count },
    { name: "〜100y", on: r.parOnUnder100OnGreenCount, t: r.parOnUnder100Count },
    { name: "〜150y", on: r.parOnUnder150OnGreenCount, t: r.parOnUnder150Count },
    { name: "〜200y", on: r.parOnUnder200OnGreenCount, t: r.parOnUnder200Count },
    { name: "200y〜", on: r.parOnOver200OnGreenCount, t: r.parOnOver200Count },
  ].map((d) => ({ ...d, pct: rate(d.on, d.t) }));
  return (
    <div className="chart-wrap">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: C.grid }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={axisStyle} axisLine={false} tickLine={false} unit="%" />
          <Tooltip
            {...tip()}
            formatter={(v, _n, p) => [`${v.toFixed(1)}%  (${p.payload.on}/${p.payload.t})`, "パーオン率"]}
          />
          <Bar dataKey="pct" radius={[5, 5, 0, 0]} maxBarSize={48} fill={C.gold}>
            {data.map((_, i) => (
              <Cell key={i} fill={C.gold} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
