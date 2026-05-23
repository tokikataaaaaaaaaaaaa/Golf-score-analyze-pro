import { pct, avg } from "../lib/analyze.js";
import { StatRow } from "./ui.jsx";
import {
  ScoreDistribution,
  HoleByHole,
  PuttsPerHole,
  SummaryRadar,
  ParOnByDistance,
} from "./Charts.jsx";

function Panel({ title, sub, children }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      {sub && <p className="ph-sub">{sub}</p>}
      {children}
    </div>
  );
}

// 「数」と「率」を持つ行
const NR = (name, find, attempt, sub) => (
  <StatRow name={name} sub={sub} raw={`${find} / ${attempt}`} ratio={pct(find, attempt)} />
);
// 「数」だけの行
const N = (name, value, sub) => <StatRow name={name} sub={sub} ratio={String(value)} />;

export default function AnalysisReport({ pars, holes, r }) {
  const coursePar = pars.reduce((a, b) => a + b, 0);
  const toPar = r.totalScore - coursePar;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* ヒーロー指標 */}
      <div className="tiles">
        <div className="tile">
          <div className="k">Total Score</div>
          <div className="v">
            {r.totalScore}
            <small> ({toPar >= 0 ? "+" : ""}{toPar})</small>
          </div>
          <div className="sub">vs par {coursePar}</div>
        </div>
        <div className="tile">
          <div className="k">Total Putt</div>
          <div className="v">{r.totalPutt}</div>
          <div className="sub">{(r.totalPutt / 18).toFixed(2)} / hole</div>
        </div>
        <div className="tile">
          <div className="k">フェアウェイキープ率</div>
          <div className="v">{pct(r.teeShotFairwayCount, r.teeShotResultCount)}</div>
          <div className="sub">{r.teeShotFairwayCount} / {r.teeShotResultCount}</div>
        </div>
        <div className="tile">
          <div className="k">パーオン率</div>
          <div className="v">{pct(r.parOnCount, 18)}</div>
          <div className="sub">{r.parOnCount} / 18</div>
        </div>
      </div>

      {/* スコア構成 + 総合レーダー */}
      <div className="grid-2">
        <Panel title="スコア構成" sub="ホールごとの対パー内訳">
          <ScoreDistribution r={r} />
          <div style={{ marginTop: 8 }}>
            {N("イーグル以下の数", r.underBirdieCount)}
            {N("バーディの数", r.birdieCount)}
            {N("パーの数", r.parCount)}
            {N("ボギーの数", r.bogeyCount)}
            {N("ダブルボギー以上の数", r.overBogeyCount)}
            <div className="subhead">PAR 別平均スコア</div>
            {N(`Par3 平均スコア`, avg(r.par3AverageScore), `${r.par3Count} ホール`)}
            {N(`Par4 平均スコア`, avg(r.par4AverageScore), `${r.par4Count} ホール`)}
            {N(`Par5 平均スコア`, avg(r.par5AverageScore), `${r.par5Count} ホール`)}
          </div>
        </Panel>
        <Panel title="総合スタッツ" sub="主要指標を0–100%で">
          <SummaryRadar r={r} />
        </Panel>
      </div>

      {/* ホール別 To par (全幅) */}
      <Panel title="ホール別 To par" sub="赤=アンダー / 緑=パー / 青=ボギー / 紺=ダボ以上">
        <HoleByHole pars={pars} holes={holes} />
      </Panel>

      <div className="grid-2">
        <Panel title="パット数推移" sub="ホールごとのパット数">
          <PuttsPerHole holes={holes} />
        </Panel>
        <Panel title="パーオン距離別" sub="残距離レンジごとのパーオン率">
          <ParOnByDistance r={r} />
          <div style={{ marginTop: 8 }}>
            {NR("50ヤード以内", r.parOnUnder50OnGreenCount, r.parOnUnder50Count)}
            {NR("100ヤード以内", r.parOnUnder100OnGreenCount, r.parOnUnder100Count)}
            {NR("150ヤード以内", r.parOnUnder150OnGreenCount, r.parOnUnder150Count)}
            {NR("200ヤード以内", r.parOnUnder200OnGreenCount, r.parOnUnder200Count)}
            {NR("200ヤード以上", r.parOnOver200OnGreenCount, r.parOnOver200Count)}
          </div>
        </Panel>
      </div>

      {/* ティーショット / クラブ別FW */}
      <div className="grid-2">
        <Panel title="ティーショット分析" sub="Par4・Par5 のティーショット">
          {NR("フェアウェイキープ", r.teeShotFairwayCount, r.teeShotResultCount)}
          {NR("フェアウェイより左に外した", r.teeShotLeftCount, r.teeShotResultCount)}
          {NR("フェアウェイより右に外した", r.teeShotRightCount, r.teeShotResultCount)}
        </Panel>
        <Panel title="クラブ別 FWキープ率">
          {NR("Driver", r.teeShotDriverFwCount, r.teeShotDriverCount)}
          {NR("Wood", r.teeShotWoodFwCount, r.teeShotWoodCount)}
          {NR("UT", r.teeShotUtFwCount, r.teeShotUtCount)}
          {NR("Iron", r.teeShotIronFwCount, r.teeShotIronCount)}
        </Panel>
      </div>

      {/* パーオン / パーオンクラブ別 */}
      <div className="grid-2">
        <Panel title="パーオン分析">
          {NR("パーオン", r.parOnCount, 18)}
          <div className="subhead">パーオンショットの結果</div>
          {NR("グリーンオン", r.parOnShotResultGreenOnCount, r.parOnShotResultCount + r.parOnShotResultGreenOnCount)}
          {N("オーバー", `${r.parOnShotResultGreenOverCount} / ${r.parOnShotResultCount}`)}
          {N("ショート", `${r.parOnShotResultGreenShortCount} / ${r.parOnShotResultCount}`)}
          {N("左外し", `${r.parOnShotResultGreenLeftCount} / ${r.parOnShotResultCount}`)}
          {N("右外し", `${r.parOnShotResultGreenRightCount} / ${r.parOnShotResultCount}`)}
        </Panel>
        <Panel title="パーオンクラブ別分析" sub="クラブ別のパーオン成功率">
          {NR("Wood", r.parOnWoodCount, r.parOnWoodTryCount)}
          {NR("UT", r.parOnUtCount, r.parOnUtTryCount)}
          {NR("Long Iron", r.parOnLongIronCount, r.parOnLongIronTryCount)}
          {NR("Middle Iron", r.parOnMiddleIronCount, r.parOnMiddleIronTryCount)}
          {NR("Short Iron", r.parOnShortIronCount, r.parOnShortIronTryCount)}
          {NR("Wedge", r.parOnWedgeCount, r.parOnWedgeTryCount)}
        </Panel>
      </div>

      {/* パットミス傾向 / パット距離 */}
      <div className="grid-2">
        <Panel title="パットミス傾向分析" sub="初打パットの方向ミス">
          {NR("カップイン", r.puttNoMissCount, r.puttTryCount)}
          {NR("左外し", r.puttLeftCount, r.puttTryCount)}
          {NR("右外し", r.puttRightCount, r.puttTryCount)}
        </Panel>
        <Panel title="パット距離分析" sub="距離感(ショート/寄せ/ロング)">
          {NR("1m以内に寄せ", r.puttDistanceNoMissCount, r.puttDistanceCount)}
          {NR("ショート", r.puttDistanceShortCount, r.puttDistanceCount)}
          {NR("ロング", r.puttDistanceLongCount, r.puttDistanceCount)}
        </Panel>
      </div>

      {/* 距離帯別パット */}
      <div className="grid-2">
        <Panel title="2.5m以内パット分析" sub="残り 1pin 以内">
          {NR("カップイン", r.puttInAPinCupInCount, r.puttInAPinCount)}
          {NR("左外し", r.puttInAPinLeftMissCount, r.puttInAPinCount)}
          {NR("右外し", r.puttInAPinRightMissCount, r.puttInAPinCount)}
        </Panel>
        <Panel title="5m以内パット分析">
          {NR("カップイン", r.puttInShortCupInCount, r.puttInShortCount)}
          {NR("左外し", r.puttInShortLeftMissCount, r.puttInShortCount)}
          {NR("右外し", r.puttInShortRightMissCount, r.puttInShortCount)}
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="10m以内パット分析">
          {NR("カップイン", r.puttInMiddleCupInCount, r.puttInMiddleCount)}
          {NR("左外し", r.puttInMiddleLeftMissCount, r.puttInMiddleCount)}
          {NR("右外し", r.puttInMiddleRightMissCount, r.puttInMiddleCount)}
          {NR("1m以内に寄せ", r.puttInMiddleJustTouchCount, r.puttInMiddleCount)}
          {NR("ショート", r.puttInMiddleShortCount, r.puttInMiddleCount)}
          {NR("ロング", r.puttInMiddleLongCount, r.puttInMiddleCount)}
          {NR("2パット以下", r.puttInMiddleTwoPuttCount, r.puttInMiddleCount)}
        </Panel>
        <Panel title="10m以上パット分析">
          {NR("カップイン", r.puttInLongCupInCount, r.puttInLongCount)}
          {NR("左外し", r.puttInLongLeftMissCount, r.puttInLongCount)}
          {NR("右外し", r.puttInLongRightMissCount, r.puttInLongCount)}
          {NR("1m以内に寄せ", r.puttInLongJustTouchCount, r.puttInLongCount)}
          {NR("ショート", r.puttInLongShortCount, r.puttInLongCount)}
          {NR("ロング", r.puttInLongLongCount, r.puttInLongCount)}
          {NR("2パット以下", r.puttInLongTwoPuttCount, r.puttInLongCount)}
        </Panel>
      </div>

      {/* アプローチ・バンカー / バーディチャンス */}
      <div className="grid-2">
        <Panel title="アプローチ & バンカー">
          {N("アプローチ パーセーブ数", r.approachParSaveCount)}
          {N("チップイン数", r.approachChipInCount)}
          <div className="subhead">バンカー</div>
          {NR("バンカーセーブ", r.bunkerParSaveCount, r.bunkerCount)}
        </Panel>
        <Panel title="バーディーチャンス分析" sub="パーオン かつ 5m以内バーディパット (Par5の2onは除外)">
          {N("バーディチャンス", r.birdieChanceCount, "5m以内バーディパット")}
          {NR("チャンス時ホールイン", r.birdieChanceHoleInCount, r.birdieChanceCount)}
        </Panel>
      </div>

      {/* ミス分析 */}
      <Panel title="ミス分析" sub="ラウンドを崩した要因">
        <div className="grid-2" style={{ gap: 0, columnGap: 18 }}>
          <div>
            {N("100ヤード以内でグリーンを外した数", r.missedGreenInRegulationUnder100)}
            {N("3パット以上した数", r.puttOverThreePutt)}
            {N("グリーンサイドバンカーに入れた数", r.bunkerCount)}
          </div>
          <div>
            {N("OBした数", r.obCount)}
            {N("池に入れた数", r.hazardCount)}
            {N("ペナルティ数", r.penaltyCount)}
          </div>
        </div>
      </Panel>
    </div>
  );
}
