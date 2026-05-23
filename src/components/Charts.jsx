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
  green: "#1f7a4d",
  greenDeep: "#14693f",
  neutral: "#93a098",
  amber: "#c9881d",
  red: "#cf4636",
  blue: "#3a6ea5",
  grid: "rgba(21,32,26,0.08)",
  axis: "#5d6b61",
};

const axisStyle = { fontSize: 11, fontFamily: "inherit", fill: C.axis };

function tip() {
  return {
    contentStyle: {
      background: "#ffffff",
      border: "1px solid #e3e7e3",
      borderRadius: 10,
      color: "#15201a",
      fontSize: 12,
      boxShadow: "0 8px 24px -16px rgba(20,40,28,0.5)",
    },
    labelStyle: { color: "#5d6b61" },
    cursor: { fill: "rgba(31,122,77,0.06)" },
  };
}

// スコア構成 (green=good ... red=bad の直感的な配色)
export function ScoreDistribution({ r }) {
  const data = [
    { name: "Eagle-", v: r.underBirdieCount, c: C.greenDeep },
    { name: "Birdie", v: r.birdieCount, c: C.green },
    { name: "Par", v: r.parCount, c: C.neutral },
    { name: "Bogey", v: r.bogeyCount, c: C.amber },
    { name: "Dbl+", v: r.overBogeyCount, c: C.red },
  ];
  return (
    <div className="chart-wrap">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
          <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: C.grid }} tickLine={false} />
          <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip {...tip()} formatter={(v) => [`${v} ホール`, "数"]} />
          <Bar dataKey="v" radius={[6, 6, 0, 0]} maxBarSize={48}>
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
  const data = holes.map((h, i) => ({ name: i + 1, d: (Number(h.stroke) || 0) - pars[i] }));
  const colorFor = (d) => (d < 0 ? C.green : d === 0 ? C.neutral : d === 1 ? C.amber : C.red);
  return (
    <div className="chart-wrap">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
          <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: C.grid }} tickLine={false} interval={0} />
          <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
          <ReferenceLine y={0} stroke={C.grid} />
          <Tooltip {...tip()} formatter={(v) => [`${v > 0 ? "+" : ""}${v}`, "To par"]} labelFormatter={(l) => `Hole ${l}`} />
          <Bar dataKey="d" radius={[3, 3, 0, 0]} maxBarSize={22}>
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
  const colorFor = (p) => (p <= 1 ? C.green : p === 2 ? C.neutral : C.red);
  return (
    <div className="chart-wrap">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
          <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: C.grid }} tickLine={false} interval={0} />
          <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip {...tip()} formatter={(v) => [`${v} putt`, ""]} labelFormatter={(l) => `Hole ${l}`} />
          <Bar dataKey="putt" radius={[3, 3, 0, 0]} maxBarSize={22}>
            {data.map((d, i) => (
              <Cell key={i} fill={colorFor(d.putt)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 総合レーダー
export function SummaryRadar({ r }) {
  const data = [
    { k: "FWキープ", v: rate(r.teeShotFairwayCount, r.teeShotResultCount) },
    { k: "パーオン", v: rate(r.parOnCount, 18) },
    { k: "1パット", v: rate(r.puttNoMissCount, r.puttTryCount) },
    { k: "バンカー", v: rate(r.bunkerParSaveCount, r.bunkerCount) },
    { k: "バーディ", v: rate(r.birdieChanceHoleInCount, r.birdieChanceCount) },
    { k: "2パット", v: rate(r.puttInMiddleTwoPuttCount + r.puttInLongTwoPuttCount, r.puttInMiddleCount + r.puttInLongCount) },
  ];
  return (
    <div className="chart-wrap">
      <ResponsiveContainer>
        <RadarChart data={data} margin={{ top: 12, right: 24, bottom: 12, left: 24 }}>
          <PolarGrid stroke={C.grid} />
          <PolarAngleAxis dataKey="k" tick={{ ...axisStyle }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="v" stroke={C.green} fill={C.green} fillOpacity={0.28} />
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
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
          <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: C.grid }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={axisStyle} axisLine={false} tickLine={false} unit="%" />
          <Tooltip {...tip()} formatter={(v, _n, p) => [`${v.toFixed(1)}%  (${p.payload.on}/${p.payload.t})`, "パーオン率"]} />
          <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={44} fill={C.green} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
