import { useMemo, useState, useEffect } from "react";
import { analyze } from "./lib/analyze.js";
import {
  DEFAULT_PARS,
  emptyRound,
  SAMPLE_ROUND,
  SAMPLE_PARS,
} from "./lib/courseData.js";
import HoleEditor from "./components/HoleEditor.jsx";
import Scorecard from "./components/Scorecard.jsx";
import AnalysisReport from "./components/AnalysisReport.jsx";

const STORE_KEY = "fairway_round_v1";
const today = () => new Date().toISOString().slice(0, 10);

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.holes?.length === 18 && s.pars?.length === 18) return s;
    }
  } catch {
    /* ignore */
  }
  return {
    courseName: "サンプルカントリークラブ",
    player: "ゲスト",
    date: today(),
    pars: SAMPLE_PARS,
    holes: SAMPLE_ROUND,
  };
}

const Flag = () => (
  <svg className="flag" viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 4v36" stroke="#f4eede" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M9 5l22 5.5L9 16V5z" fill="#e8553d" />
    <ellipse cx="9" cy="41" rx="7" ry="2.4" fill="rgba(122,178,150,0.5)" />
  </svg>
);

export default function App() {
  const init = loadInitial();
  const [courseName, setCourseName] = useState(init.courseName);
  const [player, setPlayer] = useState(init.player);
  const [date, setDate] = useState(init.date);
  const [pars, setPars] = useState(init.pars);
  const [holes, setHoles] = useState(init.holes);
  const [sel, setSel] = useState(0);
  const [editPars, setEditPars] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ courseName, player, date, pars, holes })
      );
    } catch {
      /* storage may be unavailable; ignore */
    }
  }, [courseName, player, date, pars, holes]);

  const result = useMemo(() => analyze({ courseName, parValues: pars }, holes), [
    courseName,
    pars,
    holes,
  ]);

  const updateHole = (i, next) =>
    setHoles((hs) => hs.map((h, idx) => (idx === i ? next : h)));

  const setPar = (i, v) => {
    const p = Math.max(3, Math.min(6, Number(v) || 3));
    setPars((ps) => ps.map((x, idx) => (idx === i ? p : x)));
  };

  const loadSample = () => {
    setCourseName("サンプルカントリークラブ");
    setPlayer("ゲスト");
    setDate(today());
    setPars(SAMPLE_PARS);
    setHoles(SAMPLE_ROUND);
    setSel(0);
  };

  const resetRound = () => {
    if (!confirm("入力をすべてクリアして新しいラウンドを開始しますか？")) return;
    setCourseName("");
    setPlayer("");
    setDate(today());
    setPars(DEFAULT_PARS);
    setHoles(emptyRound(DEFAULT_PARS));
    setSel(0);
  };

  const toParColor = (i) => {
    const d = (Number(holes[i].stroke) || 0) - pars[i];
    if (d < 0) return "#cf3a2e";
    if (d === 0) return "#2c7a52";
    if (d === 1) return "#3f7fb0";
    return "#16233a";
  };

  return (
    <div className="app">
      <header className="masthead">
        <div className="brand">
          <Flag />
          <div>
            <h1 className="wordmark">
              FAIR<em>WAY</em>
            </h1>
            <p className="tagline">Golf Score Analyzer</p>
          </div>
        </div>
        <div className="meta">
          スコア入力 → 自動分析・可視化
          <br />
          データは端末内のみで処理 / サーバー送信なし
        </div>
      </header>

      {/* セットアップ */}
      <section className="section">
        <div className="section-head">
          <span className="section-num">01</span>
          <h2 className="section-title">ラウンド設定</h2>
        </div>
        <div className="paper">
          <div className="setup">
            <div className="field">
              <label>コース名</label>
              <input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="コース名" />
            </div>
            <div className="field">
              <label>プレーヤー</label>
              <input value={player} onChange={(e) => setPlayer(e.target.value)} placeholder="名前" />
            </div>
            <div className="field">
              <label>プレー日</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="setup-actions">
              <button className="btn btn-ghost" onClick={() => setEditPars((v) => !v)}>
                {editPars ? "パー設定を閉じる" : "パー設定"}
              </button>
              <button className="btn btn-ghost" onClick={loadSample}>
                サンプル読込
              </button>
              <button className="btn btn-dark" onClick={resetRound}>
                リセット
              </button>
            </div>
          </div>

          {editPars && (
            <div style={{ marginTop: 16 }}>
              <p className="muted-note" style={{ marginBottom: 10 }}>
                各ホールのパーを設定 (3〜6)。合計パー: {pars.reduce((a, b) => a + b, 0)}
              </p>
              <div className="hole-strip">
                {pars.map((p, i) => (
                  <div className="hole-chip" key={i} style={{ cursor: "default" }}>
                    <div className="h-no">H{i + 1}</div>
                    <input
                      className="mini-input"
                      style={{ width: "100%", textAlign: "center", padding: "4px" }}
                      type="number"
                      min={3}
                      max={6}
                      value={p}
                      onChange={(e) => setPar(i, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ホール入力 */}
      <section className="section">
        <div className="section-head">
          <span className="section-num">02</span>
          <h2 className="section-title">ホール入力</h2>
          <p className="section-sub">ホールを選んで詳細を入力</p>
        </div>
        <div className="paper">
          <div className="hole-strip">
            {holes.map((h, i) => (
              <div
                key={i}
                className={`hole-chip${i === sel ? " active" : ""}`}
                onClick={() => setSel(i)}
              >
                <span className="h-dot" style={{ background: toParColor(i) }} />
                <div className="h-no">H{i + 1}</div>
                <div className="h-score">{h.stroke}</div>
                <div className="h-par">par {pars[i]}</div>
              </div>
            ))}
          </div>
          <HoleEditor
            index={sel}
            par={pars[sel]}
            hole={holes[sel]}
            onChange={(next) => updateHole(sel, next)}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <button className="btn btn-ghost" disabled={sel === 0} onClick={() => setSel((s) => Math.max(0, s - 1))}>
              ← 前のホール
            </button>
            <button className="btn btn-primary" disabled={sel === 17} onClick={() => setSel((s) => Math.min(17, s + 1))}>
              次のホール →
            </button>
          </div>
        </div>
      </section>

      {/* スコアカード */}
      <section className="section">
        <div className="section-head">
          <span className="section-num">03</span>
          <h2 className="section-title">スコアカード</h2>
        </div>
        <Scorecard pars={pars} holes={holes} result={result} />
      </section>

      {/* 分析 */}
      <section className="section">
        <div className="section-head">
          <span className="section-num">04</span>
          <h2 className="section-title">スコア分析</h2>
          <p className="section-sub">入力に応じてリアルタイム計算</p>
        </div>
        <AnalysisReport pars={pars} holes={holes} r={result} />
      </section>

      <p className="privacy">
        本ツールは入力データを端末内 (localStorage) のみで処理し、外部サーバーには一切送信しません。
        <br />
        golfbu_kun のスコア分析機能を静的Webアプリとして再構築したものです。
      </p>
    </div>
  );
}
