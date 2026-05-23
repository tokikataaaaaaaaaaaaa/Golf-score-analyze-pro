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
import { Collapsible, Field } from "./components/ui.jsx";
import { downloadShareImage } from "./lib/shareImage.js";

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

const TABS = [
  { id: "input", label: "入力" },
  { id: "card", label: "スコアカード" },
  { id: "analysis", label: "分析" },
];

const dotColor = (d) =>
  d < 0 ? "var(--red)" : d === 0 ? "var(--green)" : d === 1 ? "var(--amber)" : "var(--blue)";

export default function App() {
  const init = loadInitial();
  const [courseName, setCourseName] = useState(init.courseName);
  const [player, setPlayer] = useState(init.player);
  const [date, setDate] = useState(init.date);
  const [pars, setPars] = useState(init.pars);
  const [holes, setHoles] = useState(init.holes);
  const [sel, setSel] = useState(0);
  const [tab, setTab] = useState("input");
  const [saving, setSaving] = useState(false);

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

  const result = useMemo(
    () => analyze({ courseName, parValues: pars }, holes),
    [courseName, pars, holes]
  );

  const coursePar = pars.reduce((a, b) => a + b, 0);
  const toPar = result.totalScore - coursePar;

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

  const handleDownload = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await downloadShareImage({ courseName, player, date, pars, holes, result });
    } catch (e) {
      alert("画像の生成に失敗しました: " + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const saveButton = (
    <button className="btn primary save-btn" onClick={handleDownload} disabled={saving}>
      {saving ? (
        "画像を生成中…"
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          結果を画像で保存
        </>
      )}
    </button>
  );

  return (
    <div className="app">
      <header className="appbar">
        <div className="appbar-top">
          <div className="brand2">
            <span className="brand-mark">⛳</span>
            <span className="brand-name">スコア分析</span>
          </div>
          <div className="appbar-score">
            <b>{result.totalScore}</b>
            <span className={`topar ${toPar < 0 ? "under" : toPar > 0 ? "over" : "even"}`}>
              {toPar === 0 ? "E" : toPar > 0 ? `+${toPar}` : toPar}
            </span>
          </div>
        </div>
        <nav className="tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`tab${tab === t.id ? " on" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="view">
        {tab === "input" && (
          <>
            <Collapsible title="ラウンド設定">
              <Field label="コース名">
                <input
                  className="input"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="コース名"
                />
              </Field>
              <Field label="プレーヤー">
                <input
                  className="input"
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                  placeholder="名前"
                />
              </Field>
              <Field label="プレー日">
                <input
                  className="input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
              <div className="field2">
                <span className="field2-label">
                  各ホールのパー（合計 {coursePar}）
                </span>
                <div className="par-grid">
                  {pars.map((p, i) => (
                    <div className="par-cell" key={i}>
                      <span>H{i + 1}</span>
                      <input
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
            </Collapsible>

            <div className="quickbar">
              <button className="btn ghost" onClick={loadSample}>
                サンプル読込
              </button>
              <button className="btn ghost danger" onClick={resetRound}>
                リセット
              </button>
            </div>

            <div className="hole-strip2">
              {holes.map((h, i) => (
                <button
                  key={i}
                  className={`hpill${i === sel ? " on" : ""}`}
                  onClick={() => setSel(i)}
                >
                  <span
                    className="hp-dot"
                    style={{ background: dotColor((Number(h.stroke) || 0) - pars[i]) }}
                  />
                  <span className="hp-no">H{i + 1}</span>
                  <span className="hp-score">{h.stroke}</span>
                  <span className="hp-par">par {pars[i]}</span>
                </button>
              ))}
            </div>

            <HoleEditor
              index={sel}
              par={pars[sel]}
              hole={holes[sel]}
              onChange={(next) => updateHole(sel, next)}
            />

            <div className="navrow">
              <button
                className="btn ghost"
                disabled={sel === 0}
                onClick={() => setSel((s) => Math.max(0, s - 1))}
              >
                ← 前
              </button>
              <span className="navrow-mid">{sel + 1} / 18</span>
              <button
                className="btn primary"
                disabled={sel === 17}
                onClick={() => setSel((s) => Math.min(17, s + 1))}
              >
                次 →
              </button>
            </div>
          </>
        )}

        {tab === "card" && (
          <>
            {saveButton}
            <Scorecard pars={pars} holes={holes} result={result} />
          </>
        )}

        {tab === "analysis" && (
          <>
            {saveButton}
            <AnalysisReport pars={pars} holes={holes} r={result} />
          </>
        )}

        <p className="privacy2">
          データは端末内（localStorage）のみで処理され、サーバーには送信されません。
        </p>
      </main>
    </div>
  );
}
