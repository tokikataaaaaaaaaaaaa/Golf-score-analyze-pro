// スコア分析エンジン
// golfbu_kun の lib/features/score_card/widgets/score_card_preview.dart
// (245-755行 / 1815-1938行) の集計ロジックを忠実に移植したもの。
//
// 入力: course = { courseName, parValues:[18] }, holes = [18 x HoleData]
// 出力: 全集計カウント + 派生指標(率)。UI はこの値をそのまま表示する。
//
// HoleData の形:
// {
//   stroke: number,            打数
//   putt: number,              パット数
//   teeShotClub: string|null,  driver/wood/ut/longiron/middleiron/shortiron/wedge/putter
//   teeShotResult: string|null,left | fw | right        (par4/5 のみ)
//   parOnShotDistance: string, パーオンを狙ったショットの残距離(ヤード, 数字文字列)
//   parOnShotClub: string|null,
//   parOnShotResult: string|null, over | left | onGreen | right | short
//   puttRemained: string|null, pin(2.5m/1pin以内) | short(5m以内) | middle(10m以内) | long(10m以上)
//   puttMissed: string|null,   left | nomiss(ワンパット=カップイン) | right
//   puttDistance: string|null, short | nomiss(半径1m以内) | long
//   guardBunker: boolean,      グリーンサイドバンカーに入れたか
//   ob: number, hazard: number, penalty: number,
// }

const num = (v) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? 0 : n;
};

export function analyze(course, holes) {
  const parValues = course.parValues;

  // --- スコアカード集計 (OUT / IN) ---
  let outTotalScore = 0;
  let outTotalPutt = 0;
  let inTotalScore = 0;
  let inTotalPutt = 0;
  for (let i = 0; i < 9; i++) {
    outTotalScore += num(holes[i].stroke);
    outTotalPutt += num(holes[i].putt);
  }
  for (let i = 9; i < 18; i++) {
    inTotalScore += num(holes[i].stroke);
    inTotalPutt += num(holes[i].putt);
  }
  const totalScore = outTotalScore + inTotalScore;
  const totalPutt = outTotalPutt + inTotalPutt;

  // --- スコア区分 ---
  let overBogeyCount = 0;
  let bogeyCount = 0;
  let parCount = 0;
  let birdieCount = 0;
  let underBirdieCount = 0;

  let par3Count = 0,
    par3TotalScore = 0;
  let par4Count = 0,
    par4TotalScore = 0;
  let par5Count = 0,
    par5TotalScore = 0;

  // --- ティーショット(クラブ別) ---
  let teeShotDriverCount = 0,
    teeShotDriverFwCount = 0;
  let teeShotWoodCount = 0,
    teeShotWoodFwCount = 0;
  let teeShotUtCount = 0,
    teeShotUtFwCount = 0;
  let teeShotIronCount = 0,
    teeShotIronFwCount = 0;

  // --- パット ---
  let puttOverThreePutt = 0;

  let puttInAPinCount = 0,
    puttInAPinCupInCount = 0,
    puttInAPinLeftMissCount = 0,
    puttInAPinRightMissCount = 0;

  let puttInShortCount = 0,
    puttInShortCupInCount = 0,
    puttInShortLeftMissCount = 0,
    puttInShortRightMissCount = 0;

  let puttInMiddleCount = 0,
    puttInMiddleCupInCount = 0,
    puttInMiddleLeftMissCount = 0,
    puttInMiddleRightMissCount = 0,
    puttInMiddleJustTouchCount = 0,
    puttInMiddleShortCount = 0,
    puttInMiddleLongCount = 0,
    puttInMiddleTwoPuttCount = 0;

  let puttInLongCount = 0,
    puttInLongCupInCount = 0,
    puttInLongLeftMissCount = 0,
    puttInLongRightMissCount = 0,
    puttInLongJustTouchCount = 0,
    puttInLongShortCount = 0,
    puttInLongLongCount = 0,
    puttInLongTwoPuttCount = 0;

  // --- パーオン ---
  let parOnCount = 0;
  let parOnUnder50Count = 0,
    parOnUnder50OnGreenCount = 0;
  let parOnUnder100Count = 0,
    parOnUnder100OnGreenCount = 0;
  let parOnUnder150Count = 0,
    parOnUnder150OnGreenCount = 0;
  let parOnUnder200Count = 0,
    parOnUnder200OnGreenCount = 0;
  let parOnOver200Count = 0,
    parOnOver200OnGreenCount = 0;

  // --- パーオン(クラブ別) ---
  let parOnWoodCount = 0,
    parOnUtCount = 0,
    parOnLongIronCount = 0,
    parOnMiddleIronCount = 0,
    parOnShortIronCount = 0,
    parOnWedgeCount = 0;

  // --- アプローチ / バンカー / バーディチャンス ---
  let approachParSaveCount = 0;
  let approachChipInCount = 0;
  let bunkerCount = 0;
  let bunkerParSaveCount = 0;
  let birdieChanceCount = 0;
  let birdieChanceHoleInCount = 0;

  // --- ミス系 ---
  let obCount = 0;
  let hazardCount = 0; // 原コードはバグで常に0。データがあるので正しく集計する。
  let penaltyCount = 0; // 同上。

  // 文字列収集用 (派生カウントで使用)
  const teeShotResult = [];
  const puttMissed = [];
  const puttDistance = [];
  const parOnShotResult = [];
  const parOnShotClub = [];
  const teeShotClub = [];

  for (let i = 0; i < 18; i++) {
    const h = holes[i];
    const par = parValues[i];
    const stroke = num(h.stroke);
    const putt = num(h.putt);
    const parThree = par === 3;
    const parOn = stroke - putt <= par - 2;

    teeShotResult.push(h.teeShotResult || "");
    puttMissed.push(h.puttMissed || "");
    puttDistance.push(h.puttDistance || "");
    parOnShotResult.push(h.parOnShotResult || "");
    parOnShotClub.push(h.parOnShotClub || "");
    teeShotClub.push(h.teeShotClub || "");

    obCount += num(h.ob);
    hazardCount += num(h.hazard);
    penaltyCount += num(h.penalty);

    // スコア区分
    if (stroke - par >= 2) overBogeyCount += 1;
    if (stroke - par === 1) bogeyCount += 1;
    if (stroke - par === 0) parCount += 1;
    if (stroke - par === -1) birdieCount += 1;
    if (stroke - par <= -2) underBirdieCount += 1;

    if (par === 3) {
      par3Count += 1;
      par3TotalScore += stroke;
    }
    if (par === 4) {
      par4Count += 1;
      par4TotalScore += stroke;
    }
    if (par === 5) {
      par5Count += 1;
      par5TotalScore += stroke;
    }

    // ティーショット(par3以外)
    if (par !== 3) {
      if (h.teeShotClub === "driver") {
        teeShotDriverCount += 1;
        if (h.teeShotResult === "fw") teeShotDriverFwCount += 1;
      }
      if (h.teeShotClub === "wood") {
        teeShotWoodCount += 1;
        if (h.teeShotResult === "fw") teeShotWoodFwCount += 1;
      }
      if (h.teeShotClub === "ut") {
        teeShotUtCount += 1;
        if (h.teeShotResult === "fw") teeShotUtFwCount += 1;
      }
      if (
        h.teeShotClub === "longiron" ||
        h.teeShotClub === "middleiron" ||
        h.teeShotClub === "shortiron"
      ) {
        teeShotIronCount += 1;
        if (h.teeShotResult === "fw") teeShotIronFwCount += 1;
      }
    }

    // パット
    if (putt >= 3) puttOverThreePutt += 1;

    if (h.puttRemained === "pin") {
      puttInAPinCount += 1;
      if (h.puttMissed === "nomiss") puttInAPinCupInCount += 1;
      if (h.puttMissed === "left") puttInAPinLeftMissCount += 1;
      if (h.puttMissed === "right") puttInAPinRightMissCount += 1;
    }
    if (h.puttRemained === "short") {
      puttInShortCount += 1;
      if (h.puttMissed === "nomiss") puttInShortCupInCount += 1;
      if (h.puttMissed === "left") puttInShortLeftMissCount += 1;
      if (h.puttMissed === "right") puttInShortRightMissCount += 1;
    }
    if (h.puttRemained === "middle") {
      puttInMiddleCount += 1;
      if (h.puttMissed === "nomiss") puttInMiddleCupInCount += 1;
      if (h.puttMissed === "left") puttInMiddleLeftMissCount += 1;
      if (h.puttMissed === "right") puttInMiddleRightMissCount += 1;
      if (h.puttDistance === "nomiss") puttInMiddleJustTouchCount += 1;
      if (h.puttDistance === "short") puttInMiddleShortCount += 1;
      if (h.puttDistance === "long") puttInMiddleLongCount += 1;
      if (putt <= 2) puttInMiddleTwoPuttCount += 1;
    }
    if (h.puttRemained === "long") {
      puttInLongCount += 1;
      if (h.puttMissed === "nomiss") puttInLongCupInCount += 1;
      if (h.puttMissed === "left") puttInLongLeftMissCount += 1;
      if (h.puttMissed === "right") puttInLongRightMissCount += 1;
      if (h.puttDistance === "nomiss") puttInLongJustTouchCount += 1;
      if (h.puttDistance === "short") puttInLongShortCount += 1;
      if (h.puttDistance === "long") puttInLongLongCount += 1;
      if (putt <= 2) puttInLongTwoPuttCount += 1;
    }

    if (parOn) parOnCount += 1;

    // パーオン距離別
    if (h.parOnShotDistance != null && String(h.parOnShotDistance).length > 0) {
      const d = num(h.parOnShotDistance);
      if (d < 50) {
        parOnUnder50Count += 1;
        if (parOn) parOnUnder50OnGreenCount += 1;
      }
      if (d >= 50 && d < 100) {
        parOnUnder100Count += 1;
        if (parOn) parOnUnder100OnGreenCount += 1;
      }
      if (d >= 100 && d < 150) {
        parOnUnder150Count += 1;
        if (parOn) parOnUnder150OnGreenCount += 1;
      }
      if (d >= 150 && d < 200) {
        parOnUnder200Count += 1;
        if (parOn) parOnUnder200OnGreenCount += 1;
      }
      if (d >= 200) {
        parOnOver200Count += 1;
        if (parOn) parOnOver200OnGreenCount += 1;
      }
    }

    // パーオン(クラブ別): パーオン成功時のみカウント。par3はティーショットのクラブで数える。
    if (parOn) {
      if (h.parOnShotClub === "wood") parOnWoodCount += 1;
      if (h.parOnShotClub === "ut") parOnUtCount += 1;
      if (h.parOnShotClub === "longiron") parOnLongIronCount += 1;
      if (h.parOnShotClub === "middleiron") parOnMiddleIronCount += 1;
      if (h.parOnShotClub === "shortiron") parOnShortIronCount += 1;
      if (h.parOnShotClub === "wedge") parOnWedgeCount += 1;
      if (parThree) {
        if (h.teeShotClub === "wood") parOnWoodCount += 1;
        if (h.teeShotClub === "ut") parOnUtCount += 1;
        if (h.teeShotClub === "longiron") parOnLongIronCount += 1;
        if (h.teeShotClub === "middleiron") parOnMiddleIronCount += 1;
        if (h.teeShotClub === "shortiron") parOnShortIronCount += 1;
        if (h.teeShotClub === "wedge") parOnWedgeCount += 1;
      }
    }

    // アプローチ
    if (putt === 1 && stroke === par) approachParSaveCount += 1;
    if (putt === 0) approachChipInCount += 1;

    // バンカー
    if (h.guardBunker) {
      bunkerCount += 1;
      if (stroke <= par) bunkerParSaveCount += 1;
    }

    // バーディチャンス: パーオン かつ 初打残5m以内(pin/short)
    if (stroke - putt <= par - 2) {
      if (h.puttRemained === "pin" || h.puttRemained === "short") {
        birdieChanceCount += 1;
        if (stroke < par) birdieChanceHoleInCount += 1;
      }
    }
  }

  // --- 派生カウント (リスト集計) ---
  const teeShotResultCount = teeShotResult.filter(
    (s) =>
      s.length > 0 &&
      s !== "greenOn" &&
      s !== "greenOver" &&
      s !== "greenShort" &&
      s !== "greenLeft" &&
      s !== "greenRight"
  ).length;
  const teeShotFairwayCount = teeShotResult.filter((s) => s === "fw").length;
  const teeShotLeftCount = teeShotResult.filter((s) => s === "left").length;
  const teeShotRightCount = teeShotResult.filter((s) => s === "right").length;
  const teeShotCriticalMissCount = teeShotResult.filter(
    (s) => s === "chipping" || s === "top" || s === "tenpura" || s === "duff"
  ).length;

  const puttTryCount = puttMissed.filter((p) => p.length > 0).length;
  const puttLeftCount = puttMissed.filter((p) => p === "left").length;
  const puttRightCount = puttMissed.filter((p) => p === "right").length;
  const puttNoMissCount = puttMissed.filter((p) => p === "nomiss").length;

  const puttDistanceCount = puttDistance.filter((p) => p.length > 0).length;
  const puttDistanceNoMissCount = puttDistance.filter((p) => p === "nomiss").length;
  const puttDistanceShortCount = puttDistance.filter((p) => p === "short").length;
  const puttDistanceLongCount = puttDistance.filter((p) => p === "long").length;

  const parOnShotResultCount = parOnShotResult.filter(
    (s) => s.length > 0 && s !== "onGreen"
  ).length;
  const parOnShotResultGreenOnCount = parOnShotResult.filter((s) => s === "onGreen").length;
  const parOnShotResultGreenOverCount = parOnShotResult.filter((s) => s === "over").length;
  const parOnShotResultGreenShortCount = parOnShotResult.filter((s) => s === "short").length;
  const parOnShotResultGreenLeftCount = parOnShotResult.filter((s) => s === "left").length;
  const parOnShotResultGreenRightCount = parOnShotResult.filter((s) => s === "right").length;

  // 各クラブの「パーオンを狙った試行数」= パーオンショットのクラブ + ティーショットのクラブ
  const tryByClub = (club) =>
    parOnShotClub.filter((s) => s === club).length +
    teeShotClub.filter((s) => s === club).length;
  const parOnWoodTryCount = tryByClub("wood");
  const parOnUtTryCount = tryByClub("ut");
  const parOnLongIronTryCount = tryByClub("longiron");
  const parOnMiddleIronTryCount = tryByClub("middleiron");
  const parOnShortIronTryCount = tryByClub("shortiron");
  const parOnWedgeTryCount = tryByClub("wedge");

  const par3AverageScore = par3Count ? par3TotalScore / par3Count : null;
  const par4AverageScore = par4Count ? par4TotalScore / par4Count : null;
  const par5AverageScore = par5Count ? par5TotalScore / par5Count : null;

  return {
    // スコアカード
    outTotalScore,
    inTotalScore,
    outTotalPutt,
    inTotalPutt,
    totalScore,
    totalPutt,
    // スコア区分
    overBogeyCount,
    bogeyCount,
    parCount,
    birdieCount,
    underBirdieCount,
    par3Count,
    par4Count,
    par5Count,
    par3AverageScore,
    par4AverageScore,
    par5AverageScore,
    // ティーショット
    teeShotResultCount,
    teeShotFairwayCount,
    teeShotLeftCount,
    teeShotRightCount,
    teeShotCriticalMissCount,
    teeShotDriverCount,
    teeShotDriverFwCount,
    teeShotWoodCount,
    teeShotWoodFwCount,
    teeShotUtCount,
    teeShotUtFwCount,
    teeShotIronCount,
    teeShotIronFwCount,
    // パーオン
    parOnCount,
    parOnUnder50Count,
    parOnUnder50OnGreenCount,
    parOnUnder100Count,
    parOnUnder100OnGreenCount,
    parOnUnder150Count,
    parOnUnder150OnGreenCount,
    parOnUnder200Count,
    parOnUnder200OnGreenCount,
    parOnOver200Count,
    parOnOver200OnGreenCount,
    parOnShotResultCount,
    parOnShotResultGreenOnCount,
    parOnShotResultGreenOverCount,
    parOnShotResultGreenShortCount,
    parOnShotResultGreenLeftCount,
    parOnShotResultGreenRightCount,
    // パーオン(クラブ別)
    parOnWoodCount,
    parOnWoodTryCount,
    parOnUtCount,
    parOnUtTryCount,
    parOnLongIronCount,
    parOnLongIronTryCount,
    parOnMiddleIronCount,
    parOnMiddleIronTryCount,
    parOnShortIronCount,
    parOnShortIronTryCount,
    parOnWedgeCount,
    parOnWedgeTryCount,
    // パット
    puttOverThreePutt,
    puttTryCount,
    puttNoMissCount,
    puttLeftCount,
    puttRightCount,
    puttDistanceCount,
    puttDistanceNoMissCount,
    puttDistanceShortCount,
    puttDistanceLongCount,
    puttInAPinCount,
    puttInAPinCupInCount,
    puttInAPinLeftMissCount,
    puttInAPinRightMissCount,
    puttInShortCount,
    puttInShortCupInCount,
    puttInShortLeftMissCount,
    puttInShortRightMissCount,
    puttInMiddleCount,
    puttInMiddleCupInCount,
    puttInMiddleLeftMissCount,
    puttInMiddleRightMissCount,
    puttInMiddleJustTouchCount,
    puttInMiddleShortCount,
    puttInMiddleLongCount,
    puttInMiddleTwoPuttCount,
    puttInLongCount,
    puttInLongCupInCount,
    puttInLongLeftMissCount,
    puttInLongRightMissCount,
    puttInLongJustTouchCount,
    puttInLongShortCount,
    puttInLongLongCount,
    puttInLongTwoPuttCount,
    // アプローチ / バンカー / バーディチャンス
    approachParSaveCount,
    approachChipInCount,
    bunkerCount,
    bunkerParSaveCount,
    birdieChanceCount,
    birdieChanceHoleInCount,
    // ミス
    obCount,
    hazardCount,
    penaltyCount,
    missedGreenInRegulationUnder100:
      parOnUnder50Count +
      parOnUnder100Count -
      parOnUnder50OnGreenCount -
      parOnUnder100OnGreenCount,
  };
}

// 率の表示ヘルパ: 分母0なら "—"、それ以外は find/try*100 を小数1桁。
export function pct(find, attempt) {
  if (!attempt) return "—";
  return ((find / attempt) * 100).toFixed(1) + "%";
}

// 比率の数値(0-100)。チャート用。分母0なら0。
export function rate(find, attempt) {
  if (!attempt) return 0;
  return (find / attempt) * 100;
}

// 平均スコアの表示。null(該当ホール無し)なら "—"。
export function avg(v) {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toFixed(2);
}
