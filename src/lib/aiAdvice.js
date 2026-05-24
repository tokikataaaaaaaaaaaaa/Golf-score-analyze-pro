import { pct, avg } from "./analyze.js";

export const DEFAULT_MODEL = "claude-sonnet-4-6";
const ENDPOINT = "https://api.anthropic.com/v1/messages";

const SYSTEM =
  "あなたはゴルフのスコアデータを分析する専門アナリストです。読み手は経験豊富なゴルファーで、スイングやショットの技術指導は求めていません。提供された数値データから読み取れる事実と、その事実から直接導ける優先順位・目標数値のみを、敬語（です・ます調）で簡潔に伝えます。";

function holesLine(pars, holes) {
  return holes
    .map((h, i) => `H${i + 1}(par${pars[i]}) ${h.stroke}打/${h.putt}パット`)
    .join("、");
}

export function buildDataBlock({ result: r, pars, holes, meta }) {
  const toPar = r.totalScore - meta.coursePar;
  const L = [];
  L.push(`コース: ${meta.courseName || "不明"} / 日付: ${meta.date || "不明"} / プレーヤー: ${meta.player || "不明"}`);
  L.push(`合計パー: ${meta.coursePar} / トータルスコア: ${r.totalScore}（${toPar >= 0 ? "+" : ""}${toPar}） / OUT ${r.outTotalScore}・IN ${r.inTotalScore}`);
  L.push(`スコア構成: イーグル以下 ${r.underBirdieCount}, バーディ ${r.birdieCount}, パー ${r.parCount}, ボギー ${r.bogeyCount}, ダブルボギー以上 ${r.overBogeyCount}`);
  L.push(`Par別平均スコア: Par3 ${avg(r.par3AverageScore)}（${r.par3Count}H）, Par4 ${avg(r.par4AverageScore)}（${r.par4Count}H）, Par5 ${avg(r.par5AverageScore)}（${r.par5Count}H）`);
  L.push(`ティーショット: FWキープ率 ${pct(r.teeShotFairwayCount, r.teeShotResultCount)}（${r.teeShotFairwayCount}/${r.teeShotResultCount}）, 左ミス ${r.teeShotLeftCount}, 右ミス ${r.teeShotRightCount}`);
  L.push(`パーオン率: ${pct(r.parOnCount, 18)}（${r.parOnCount}/18）`);
  L.push(`距離別パーオン率: 〜50y ${pct(r.parOnUnder50OnGreenCount, r.parOnUnder50Count)}, 〜100y ${pct(r.parOnUnder100OnGreenCount, r.parOnUnder100Count)}, 〜150y ${pct(r.parOnUnder150OnGreenCount, r.parOnUnder150Count)}, 〜200y ${pct(r.parOnUnder200OnGreenCount, r.parOnUnder200Count)}, 200y〜 ${pct(r.parOnOver200OnGreenCount, r.parOnOver200Count)}`);
  L.push(`グリーンを外した方向: オーバー ${r.parOnShotResultGreenOverCount}, ショート ${r.parOnShotResultGreenShortCount}, 左 ${r.parOnShotResultGreenLeftCount}, 右 ${r.parOnShotResultGreenRightCount}`);
  L.push(`パット: 合計 ${r.totalPutt}（${(r.totalPutt / 18).toFixed(1)}/H）, 3パット ${r.puttOverThreePutt}回, 方向ノーミス率 ${pct(r.puttNoMissCount, r.puttTryCount)}, ショート傾向 ${pct(r.puttDistanceShortCount, r.puttDistanceCount)}, オーバー傾向 ${pct(r.puttDistanceLongCount, r.puttDistanceCount)}, 左外し ${r.puttLeftCount}, 右外し ${r.puttRightCount}`);
  L.push(`アプローチ/バンカー: アプローチパーセーブ ${r.approachParSaveCount}回, チップイン ${r.approachChipInCount}, バンカーセーブ率 ${pct(r.bunkerParSaveCount, r.bunkerCount)}（${r.bunkerParSaveCount}/${r.bunkerCount}）`);
  L.push(`バーディチャンス(5m以内): ${r.birdieChanceCount}回中 ${r.birdieChanceHoleInCount}回成功`);
  L.push(`ミス: OB ${r.obCount}, 池 ${r.hazardCount}, ペナルティ ${r.penaltyCount}, 100yd以内でグリーンを外し ${r.missedGreenInRegulationUnder100}`);
  L.push(`ホール別: ${holesLine(pars, holes)}`);
  return L.join("\n");
}

function buildUserMessage(dataBlock) {
  return `次は、あるゴルファーの1ラウンド分の分析データです。

${dataBlock}

このデータをもとに、次の構成で日本語のアドバイスを書いてください。全体で約600字（最大800字）。各見出しは【】で囲んでください。

【総評】数値から読み取れる今ラウンドの特徴を2〜3文で。
【数値が示す強み】1〜2点。必ず具体的な数値を挙げてください。
【スコアの伸びしろ】2〜3点を、打数ロスの大きい順に。各項目は「どの数値か（具体値）→ それがスコアに与えている影響 → 数値としてどこを目標にすべきか」だけを述べてください。
【次回の数値目標】測定可能な目標を2点。

厳守ルール:
- 文末まで含め、すべて敬語（です・ます調）で統一してください。
- 読み手は経験者です。基礎説明や初心者向けの一般論は書かないでください。
- スイングやショットの技術的なアドバイス（フェースの向き、入射角、ボール位置、グリップ、振り方、構え方、特定の練習ドリルなど）は一切書かないでください。
- ミスの原因を推測しないでください（「おそらく〜が原因」などの記述は禁止です）。提供データにない事実・数値を作らないでください。
- 改善は「どの数値に注力すべきか」と「目標数値」に限定し、技術的なやり方には触れないでください。打数への影響は記録された回数・本数など実測値に基づいて述べ、過度に精密な推定打数は避けてください。
- 箇条書きには「・」を使ってください。出力は本文のみで、前置きや締めの挨拶は不要です。`;
}

export async function requestAdvice({ apiKey, model = DEFAULT_MODEL, result, pars, holes, meta }) {
  const dataBlock = buildDataBlock({ result, pars, holes, meta });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1500,
        system: SYSTEM,
        messages: [{ role: "user", content: buildUserMessage(dataBlock) }],
      }),
    });
  } catch (e) {
    clearTimeout(timer);
    if (e.name === "AbortError") throw new Error("タイムアウトしました。通信環境を確認して再試行してください。");
    throw new Error("通信に失敗しました。ネットワークまたはAPIキーを確認してください。");
  }
  clearTimeout(timer);

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error?.message || "";
    } catch {
      /* ignore */
    }
    if (res.status === 401) throw new Error("APIキーが無効です（401）。キーを確認してください。");
    if (res.status === 429) throw new Error("レート上限に達しました（429）。少し待って再試行してください。");
    throw new Error(`APIエラー（${res.status}）${detail ? ": " + detail : ""}`);
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  if (!text) throw new Error("空の応答が返りました。");
  return text;
}
