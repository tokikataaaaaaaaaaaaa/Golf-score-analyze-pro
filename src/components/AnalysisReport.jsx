import { pct, avg } from "../lib/analyze.js";
import { Metric, Stat, Card, Collapsible } from "./ui.jsx";
import {
  ScoreDistribution,
  HoleByHole,
  PuttsPerHole,
  SummaryRadar,
  ParOnByDistance,
  GreenDispersion,
  PuttMissMap,
} from "./Charts.jsx";

// 「数」と「率」を持つ行
const NR = (name, find, attempt, sub) => (
  <Stat key={name} label={name} sub={sub} hint={`${find} / ${attempt}`} value={pct(find, attempt)} />
);
// 「数」だけの行
const N = (name, value, sub) => <Stat key={name + value} label={name} sub={sub} value={String(value)} />;

const SubHead = ({ children }) => <div className="stat-subhead">{children}</div>;

export default function AnalysisReport({ pars, holes, r }) {
  const coursePar = pars.reduce((a, b) => a + b, 0);
  const toPar = r.totalScore - coursePar;

  return (
    <div className="stack">
      {/* 要点メトリクス */}
      <div className="metric-grid">
        <Metric
          big
          label="トータルスコア"
          value={`${r.totalScore}`}
          sub={`${toPar === 0 ? "E" : toPar > 0 ? `+${toPar}` : toPar} ／ PAR ${coursePar}`}
        />
        <Metric label="フェアウェイキープ" value={pct(r.teeShotFairwayCount, r.teeShotResultCount)} sub={`${r.teeShotFairwayCount} / ${r.teeShotResultCount}`} />
        <Metric label="パーオン" value={pct(r.parOnCount, 18)} sub={`${r.parOnCount} / 18`} />
        <Metric label="トータルパット" value={`${r.totalPutt}`} sub={`${(r.totalPutt / 18).toFixed(1)} / ホール`} />
        <Metric label="3パット" value={`${r.puttOverThreePutt}`} sub="回" />
      </div>

      {/* グラフ */}
      <Card title="スコア構成" sub="ホールごとの対パー内訳">
        <ScoreDistribution r={r} />
      </Card>
      <Card title="総合スタッツ" sub="主要指標を 0–100%">
        <SummaryRadar r={r} />
      </Card>
      <Card title="ホール別 To par" sub="緑=アンダー/パー · 橙=ボギー · 青=ダボ以上">
        <HoleByHole pars={pars} holes={holes} />
      </Card>
      <Card title="パット数の推移" sub="ホールごとのパット数">
        <PuttsPerHole holes={holes} />
      </Card>
      <Card title="パット ミスの傾向" sub="カップを中心に外した方向　横=方向 / 縦=距離感">
        <PuttMissMap r={r} />
      </Card>
      <Card title="パーオン距離別" sub="残距離レンジごとの達成率">
        <ParOnByDistance r={r} />
      </Card>
      <Card title="パーオンショットの方向" sub="グリーンを中心に外した方向の割合">
        <GreenDispersion r={r} />
      </Card>

      {/* 詳細（既定で折りたたみ） */}
      <Collapsible title="スコア構成・Par別平均" defaultOpen>
        {N("イーグル以下", r.underBirdieCount)}
        {N("バーディ", r.birdieCount)}
        {N("パー", r.parCount)}
        {N("ボギー", r.bogeyCount)}
        {N("ダブルボギー以上", r.overBogeyCount)}
        <SubHead>Par 別 平均スコア</SubHead>
        {N("Par3", avg(r.par3AverageScore), `${r.par3Count} ホール`)}
        {N("Par4", avg(r.par4AverageScore), `${r.par4Count} ホール`)}
        {N("Par5", avg(r.par5AverageScore), `${r.par5Count} ホール`)}
      </Collapsible>

      <Collapsible title="ティーショット">
        {NR("フェアウェイキープ", r.teeShotFairwayCount, r.teeShotResultCount)}
        {NR("左に外した", r.teeShotLeftCount, r.teeShotResultCount)}
        {NR("右に外した", r.teeShotRightCount, r.teeShotResultCount)}
        <SubHead>クラブ別 FWキープ率</SubHead>
        {NR("Driver", r.teeShotDriverFwCount, r.teeShotDriverCount)}
        {NR("Wood", r.teeShotWoodFwCount, r.teeShotWoodCount)}
        {NR("UT", r.teeShotUtFwCount, r.teeShotUtCount)}
        {NR("Iron", r.teeShotIronFwCount, r.teeShotIronCount)}
      </Collapsible>

      <Collapsible title="パーオン">
        {NR("パーオン", r.parOnCount, 18)}
        <SubHead>パーオンショットの結果</SubHead>
        {NR("グリーンオン", r.parOnShotResultGreenOnCount, r.parOnShotResultCount + r.parOnShotResultGreenOnCount)}
        {N("オーバー", `${r.parOnShotResultGreenOverCount} / ${r.parOnShotResultCount}`)}
        {N("ショート", `${r.parOnShotResultGreenShortCount} / ${r.parOnShotResultCount}`)}
        {N("左外し", `${r.parOnShotResultGreenLeftCount} / ${r.parOnShotResultCount}`)}
        {N("右外し", `${r.parOnShotResultGreenRightCount} / ${r.parOnShotResultCount}`)}
        <SubHead>距離別 パーオン率</SubHead>
        {NR("50yd以内", r.parOnUnder50OnGreenCount, r.parOnUnder50Count)}
        {NR("100yd以内", r.parOnUnder100OnGreenCount, r.parOnUnder100Count)}
        {NR("150yd以内", r.parOnUnder150OnGreenCount, r.parOnUnder150Count)}
        {NR("200yd以内", r.parOnUnder200OnGreenCount, r.parOnUnder200Count)}
        {NR("200yd以上", r.parOnOver200OnGreenCount, r.parOnOver200Count)}
        <SubHead>クラブ別 パーオン率</SubHead>
        {NR("Wood", r.parOnWoodCount, r.parOnWoodTryCount)}
        {NR("UT", r.parOnUtCount, r.parOnUtTryCount)}
        {NR("Long Iron", r.parOnLongIronCount, r.parOnLongIronTryCount)}
        {NR("Middle Iron", r.parOnMiddleIronCount, r.parOnMiddleIronTryCount)}
        {NR("Short Iron", r.parOnShortIronCount, r.parOnShortIronTryCount)}
        {NR("Wedge", r.parOnWedgeCount, r.parOnWedgeTryCount)}
      </Collapsible>

      <Collapsible title="パット">
        {NR("カップイン（方向）", r.puttNoMissCount, r.puttTryCount)}
        {NR("左外し", r.puttLeftCount, r.puttTryCount)}
        {NR("右外し", r.puttRightCount, r.puttTryCount)}
        <SubHead>距離感</SubHead>
        {NR("1m以内に寄せ", r.puttDistanceNoMissCount, r.puttDistanceCount)}
        {NR("ショート", r.puttDistanceShortCount, r.puttDistanceCount)}
        {NR("ロング", r.puttDistanceLongCount, r.puttDistanceCount)}
        <SubHead>2.5m以内（1pin）</SubHead>
        {NR("カップイン", r.puttInAPinCupInCount, r.puttInAPinCount)}
        {NR("左外し", r.puttInAPinLeftMissCount, r.puttInAPinCount)}
        {NR("右外し", r.puttInAPinRightMissCount, r.puttInAPinCount)}
        <SubHead>5m以内</SubHead>
        {NR("カップイン", r.puttInShortCupInCount, r.puttInShortCount)}
        {NR("左外し", r.puttInShortLeftMissCount, r.puttInShortCount)}
        {NR("右外し", r.puttInShortRightMissCount, r.puttInShortCount)}
        <SubHead>10m以内</SubHead>
        {NR("2パット以下", r.puttInMiddleTwoPuttCount, r.puttInMiddleCount)}
        {NR("カップイン", r.puttInMiddleCupInCount, r.puttInMiddleCount)}
        {NR("1m以内に寄せ", r.puttInMiddleJustTouchCount, r.puttInMiddleCount)}
        <SubHead>10m超</SubHead>
        {NR("2パット以下", r.puttInLongTwoPuttCount, r.puttInLongCount)}
        {NR("カップイン", r.puttInLongCupInCount, r.puttInLongCount)}
        {NR("1m以内に寄せ", r.puttInLongJustTouchCount, r.puttInLongCount)}
      </Collapsible>

      <Collapsible title="アプローチ・バンカー・バーディチャンス">
        {N("アプローチ パーセーブ", r.approachParSaveCount)}
        {N("チップイン", r.approachChipInCount)}
        {NR("バンカーセーブ", r.bunkerParSaveCount, r.bunkerCount)}
        <SubHead>バーディチャンス（5m以内）</SubHead>
        {N("チャンス数", r.birdieChanceCount)}
        {NR("チャンス時ホールイン", r.birdieChanceHoleInCount, r.birdieChanceCount)}
      </Collapsible>

      <Collapsible title="ミス分析">
        {N("100yd以内でグリーンを外した", r.missedGreenInRegulationUnder100)}
        {N("3パット以上", r.puttOverThreePutt)}
        {N("1m以内のパットを外した", r.puttInM1MissCount, `${r.puttInM1Count}回中`)}
        {N("グリーン周りバンカー", r.bunkerCount)}
        {N("OB", r.obCount)}
        {N("池", r.hazardCount)}
        {N("ペナルティ", r.penaltyCount)}
      </Collapsible>
    </div>
  );
}
