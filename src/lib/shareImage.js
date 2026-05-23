import { pct } from "./analyze.js";

const C = {
  ink: "#15201a",
  muted: "#5d6b61",
  faint: "#93a098",
  green: "#1f7a4d",
  greenDeep: "#14693f",
  green600: "#186640",
  tint: "#e7f3ec",
  red: "#cf4636",
  amber: "#c9881d",
  blue: "#3a6ea5",
  border: "#e3e7e3",
  surface2: "#f6f8f6",
  white: "#ffffff",
};

const FAMILY =
  '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", -apple-system, system-ui, sans-serif';
const F = (size, weight = 400) => `${weight} ${size}px ${FAMILY}`;

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function truncate(ctx, str, maxW) {
  if (ctx.measureText(str).width <= maxW) return str;
  let s = str;
  while (s.length > 1 && ctx.measureText(s + "…").width > maxW) s = s.slice(0, -1);
  return s + "…";
}

function cellStyle(d, isTotal, hasScore) {
  if (isTotal) return { bg: C.green, fg: C.white };
  if (!hasScore) return { bg: C.surface2, fg: C.faint };
  if (d < 0) return { bg: "#fbe9e6", fg: C.red };
  if (d === 0) return { bg: C.white, fg: C.ink };
  if (d === 1) return { bg: "#fbf1df", fg: "#b9791a" };
  return { bg: "#e9f0f7", fg: "#2f5d8c" };
}

export function buildShareCanvas({ courseName, player, date, pars, holes, result }) {
  const W = 1080;
  const scale = 2;
  const pad = 40;
  const M = 64;
  const CW = W - M * 2;
  const cx = W / 2;

  const coursePar = pars.reduce((a, b) => a + b, 0);
  const toPar = result.totalScore - coursePar;
  const toParText = toPar === 0 ? "E" : toPar > 0 ? `+${toPar}` : String(toPar);

  const big = document.createElement("canvas");
  big.width = W * scale;
  big.height = 1700 * scale;
  const ctx = big.getContext("2d");
  ctx.scale(scale, scale);
  ctx.textBaseline = "alphabetic";

  // background
  ctx.fillStyle = C.white;
  ctx.fillRect(0, 0, W, 1700);

  let y = 0;

  // ---- header band ----
  const headH = 168;
  ctx.fillStyle = C.green;
  ctx.fillRect(0, 0, W, headH);
  ctx.fillStyle = C.white;
  ctx.textAlign = "left";
  ctx.font = F(40, 800);
  ctx.fillText("⛳ スコア分析", M, 72);
  ctx.font = F(27, 600);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText(truncate(ctx, courseName || "マイラウンド", CW * 0.6), M, 120);
  ctx.textAlign = "right";
  ctx.font = F(27, 700);
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fillText(date || "", W - M, 72);
  if (player) {
    ctx.font = F(24, 500);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(truncate(ctx, player, CW * 0.35), W - M, 116);
  }
  y = headH;

  // ---- hero ----
  ctx.textAlign = "center";
  ctx.font = F(23, 700);
  ctx.fillStyle = C.muted;
  ctx.fillText("TOTAL SCORE", cx, y + 56);
  ctx.font = F(150, 800);
  ctx.fillStyle = C.ink;
  ctx.fillText(String(result.totalScore), cx, y + 56 + 142);

  const pillText = `${toParText} ／ PAR ${coursePar}`;
  ctx.font = F(30, 700);
  const pw = ctx.measureText(pillText).width + 52;
  const ph = 54;
  const px = cx - pw / 2;
  const py = y + 56 + 142 + 30;
  rr(ctx, px, py, pw, ph, 27);
  ctx.fillStyle = toPar < 0 ? C.tint : toPar > 0 ? "#fbe9e6" : "#eef1ee";
  ctx.fill();
  ctx.fillStyle = toPar < 0 ? C.greenDeep : toPar > 0 ? C.red : C.muted;
  ctx.textBaseline = "middle";
  ctx.fillText(pillText, cx, py + ph / 2 + 1);
  ctx.textBaseline = "alphabetic";
  y = py + ph + 26;

  ctx.font = F(26, 600);
  ctx.fillStyle = C.muted;
  ctx.fillText(`OUT ${result.outTotalScore}　·　IN ${result.inTotalScore}`, cx, y + 26);
  y += 26 + 30;

  // ---- metric tiles ----
  const tiles = [
    { label: "FWキープ", value: pct(result.teeShotFairwayCount, result.teeShotResultCount), sub: `${result.teeShotFairwayCount} / ${result.teeShotResultCount}` },
    { label: "パーオン", value: pct(result.parOnCount, 18), sub: `${result.parOnCount} / 18` },
    { label: "パット", value: String(result.totalPutt), sub: `${(result.totalPutt / 18).toFixed(1)} / H` },
    { label: "3パット", value: String(result.puttOverThreePutt), sub: "回" },
  ];
  const tgap = 16;
  const tw = (CW - tgap * 3) / 4;
  const th = 132;
  tiles.forEach((t, i) => {
    const tx = M + i * (tw + tgap);
    rr(ctx, tx, y, tw, th, 18);
    ctx.fillStyle = C.surface2;
    ctx.fill();
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.font = F(21, 700);
    ctx.fillStyle = C.muted;
    ctx.fillText(t.label, tx + 16, y + 36);
    ctx.font = F(46, 800);
    ctx.fillStyle = C.ink;
    ctx.fillText(t.value, tx + 16, y + 92);
    ctx.font = F(20, 600);
    ctx.fillStyle = C.green600;
    ctx.fillText(t.sub, tx + 16, y + 120);
  });
  y += th + 38;

  // ---- score breakdown ----
  ctx.textAlign = "left";
  ctx.font = F(26, 800);
  ctx.fillStyle = C.ink;
  ctx.fillText("スコア内訳", M, y + 26);
  y += 26 + 20;
  const cats = [
    { n: "Eagle-", v: result.underBirdieCount, c: C.greenDeep },
    { n: "Birdie", v: result.birdieCount, c: C.green },
    { n: "Par", v: result.parCount, c: C.faint },
    { n: "Bogey", v: result.bogeyCount, c: C.amber },
    { n: "Dbl+", v: result.overBogeyCount, c: C.red },
  ];
  const maxV = Math.max(1, ...cats.map((c) => c.v));
  const rowH = 46;
  const barX = M + 130;
  const barMaxW = CW - 130 - 60;
  ctx.textBaseline = "middle";
  cats.forEach((c) => {
    ctx.font = F(22, 700);
    ctx.fillStyle = C.muted;
    ctx.textAlign = "left";
    ctx.fillText(c.n, M, y + rowH / 2);
    const bw = Math.max(8, barMaxW * (c.v / maxV));
    rr(ctx, barX, y + 9, bw, rowH - 18, 7);
    ctx.fillStyle = c.c;
    ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.font = F(22, 800);
    ctx.fillText(String(c.v), barX + bw + 14, y + rowH / 2 + 1);
    y += rowH;
  });
  ctx.textBaseline = "alphabetic";
  y += 26;

  // ---- scorecard ----
  ctx.textAlign = "left";
  ctx.font = F(26, 800);
  ctx.fillStyle = C.ink;
  ctx.fillText("スコアカード", M, y + 26);
  // legend (right aligned)
  const legend = [
    { c: C.red, t: "アンダー" },
    { c: C.amber, t: "ボギー" },
    { c: C.blue, t: "ダボ+" },
  ];
  ctx.textAlign = "left";
  ctx.font = F(19, 600);
  let lx = W - M;
  for (let i = legend.length - 1; i >= 0; i--) {
    const it = legend[i];
    const labelW = ctx.measureText(it.t).width;
    lx -= labelW;
    ctx.fillStyle = C.muted;
    ctx.fillText(it.t, lx, y + 24);
    lx -= 10 + 16;
    ctx.fillStyle = it.c;
    rr(ctx, lx, y + 8, 16, 16, 4);
    ctx.fill();
    lx -= 18;
  }
  y += 26 + 18;

  const cols = 10;
  const cw = CW / cols;
  const cgap = 6;
  const innerW = cw - cgap;
  const ch = 104;

  const drawCell = (x, topLabel, parLabel, scoreVal, d, isTotal) => {
    const hasScore = isTotal || scoreVal > 0;
    const st = cellStyle(d, isTotal, hasScore);
    rr(ctx, x, y, innerW, ch, 12);
    ctx.fillStyle = st.bg;
    ctx.fill();
    if (!isTotal) {
      ctx.strokeStyle = C.border;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.textAlign = "center";
    ctx.font = F(18, 700);
    ctx.fillStyle = isTotal ? "rgba(255,255,255,0.85)" : C.faint;
    ctx.fillText(topLabel, x + innerW / 2, y + 26);
    ctx.font = F(40, 800);
    ctx.fillStyle = st.fg;
    ctx.textBaseline = "middle";
    ctx.fillText(hasScore ? String(scoreVal) : "–", x + innerW / 2, y + ch / 2 + 8);
    ctx.textBaseline = "alphabetic";
    ctx.font = F(17, 600);
    ctx.fillStyle = isTotal ? "rgba(255,255,255,0.8)" : C.faint;
    ctx.fillText(parLabel, x + innerW / 2, y + ch - 14);
  };

  const drawNine = (start, label) => {
    ctx.textAlign = "left";
    ctx.font = F(22, 800);
    ctx.fillStyle = C.green600;
    ctx.fillText(label, M, y + 6);
    y += 22;
    let sScore = 0;
    let sPar = 0;
    for (let k = 0; k < 9; k++) {
      const i = start + k;
      const sc = Number(holes[i].stroke) || 0;
      sScore += sc;
      sPar += pars[i];
      drawCell(M + k * cw, String(i + 1), `P${pars[i]}`, sc, sc - pars[i], false);
    }
    drawCell(M + 9 * cw, "計", `P${sPar}`, sScore, sScore - sPar, true);
    y += ch + 20;
  };

  drawNine(0, "OUT");
  drawNine(9, "IN");

  // ---- footer ----
  y += 2;
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(M, y);
  ctx.lineTo(W - M, y);
  ctx.stroke();
  y += 32;
  ctx.textAlign = "center";
  ctx.font = F(20, 600);
  ctx.fillStyle = C.faint;
  ctx.fillText("スコア分析  ·  データは端末内のみで処理 / サーバー送信なし", cx, y + 6);
  y += 30;

  const H = Math.ceil(y + pad);
  const out = document.createElement("canvas");
  out.width = W * scale;
  out.height = H * scale;
  const octx = out.getContext("2d");
  octx.drawImage(big, 0, 0, W * scale, H * scale, 0, 0, W * scale, H * scale);
  return out;
}

export function downloadShareImage(data) {
  const canvas = buildShareCanvas(data);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("canvas toBlob returned null"));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `golf-score_${data.date || "round"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve();
    }, "image/png");
  });
}
