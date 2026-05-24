import { useMemo, useState, useEffect, useRef } from "react";
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
import { Collapsible, Field, Card } from "./components/ui.jsx";
import { downloadShareImage } from "./lib/shareImage.js";
import { buildShareUrl, readSharedState } from "./lib/shareLink.js";
import { requestAdvice } from "./lib/aiAdvice.js";

const STORE_KEY = "fairway_round_v1";
const KEY_STORE = "fairway_anthropic_key";
const today = () => new Date().toISOString().slice(0, 10);

function loadStored() {
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

function boot() {
  const shared = readSharedState();
  if (shared) return { state: shared, shared: true };
  return { state: loadStored(), shared: false };
}

const TABS = [
  { id: "input", label: "入力" },
  { id: "card", label: "スコアカード" },
  { id: "analysis", label: "分析" },
];

const dotColor = (d) =>
  d < 0 ? "var(--red)" : d === 0 ? "var(--green)" : d === 1 ? "var(--amber)" : "var(--blue)";

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LinkIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1 1M14 11a5 5 0 0 0-7.07 0l-2 2a5 5 0 0 0 7.07 7.07l1-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function AdviceBody({ text }) {
  return (
    <div className="advice-body">
      {text.split(/\n/).map((line, i) => {
        const t = line.trim();
        if (!t) return null;
        const head = t.match(/^【([^】]+)】\s*(.*)$/);
        if (head) {
          return (
            <div key={i}>
              <h4 className="advice-h">{head[1]}</h4>
              {head[2] && <p className="advice-p">{head[2]}</p>}
            </div>
          );
        }
        if (/^[・･\-*]/.test(t)) return <p key={i} className="advice-li">{t.replace(/^[\-*]\s*/, "・")}</p>;
        return <p key={i} className="advice-p">{t}</p>;
      })}
    </div>
  );
}

export default function App() {
  const [{ state: initState, shared: initShared }] = useState(boot);

  const [courseName, setCourseName] = useState(initState.courseName);
  const [player, setPlayer] = useState(initState.player);
  const [date, setDate] = useState(initState.date);
  const [pars, setPars] = useState(initState.pars);
  const [holes, setHoles] = useState(initState.holes);
  const [sel, setSel] = useState(0);
  const [tab, setTab] = useState(initShared ? "analysis" : "input");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(initShared);

  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem(KEY_STORE) || "";
    } catch {
      return "";
    }
  });
  const [keyDraft, setKeyDraft] = useState("");
  const [showKeyEdit, setShowKeyEdit] = useState(false);
  const [advice, setAdvice] = useState(initState.advice || null);
  const [adviceShared, setAdviceShared] = useState(initShared && !!initState.advice);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState("");

  const firstRun = useRef(true);
  const sharedRef = useRef(initShared);

  // ラウンドのスコアを編集したら、古いAIアドバイスは破棄する。
  const adviceFirstRun = useRef(true);
  useEffect(() => {
    if (adviceFirstRun.current) {
      adviceFirstRun.current = false;
      return;
    }
    setAdvice(null);
    setAdviceShared(false);
    setAdviceError("");
  }, [pars, holes]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      // 共有リンクで開いた場合、最初の描画では訪問者のローカル保存を上書きしない。
      if (sharedRef.current) return;
    }
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ courseName, player, date, pars, holes })
      );
    } catch {
      /* storage may be unavailable; ignore */
    }
    // 編集が入った時点で「共有表示中」を解除し、URLのハッシュを外す。
    if (sharedRef.current) {
      sharedRef.current = false;
      setShared(false);
      try {
        history.replaceState(null, "", location.origin + location.pathname + location.search);
      } catch {
        /* ignore */
      }
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

  const setPar = (i, v) =>
    setPars((ps) => ps.map((x, idx) => (idx === i ? v : x)));

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

  const copyShareLink = async () => {
    const url = buildShareUrl({ courseName, player, date, pars, holes, advice });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("以下のURLをコピーして共有してください", url);
    }
  };

  const saveKey = () => {
    const k = keyDraft.trim();
    if (!k) return;
    try {
      localStorage.setItem(KEY_STORE, k);
    } catch {
      /* ignore */
    }
    setApiKey(k);
    setKeyDraft("");
    setShowKeyEdit(false);
  };

  const clearKey = () => {
    try {
      localStorage.removeItem(KEY_STORE);
    } catch {
      /* ignore */
    }
    setApiKey("");
    setShowKeyEdit(false);
  };

  const generateAdvice = async () => {
    if (!apiKey || adviceLoading) return;
    setAdviceLoading(true);
    setAdviceError("");
    try {
      const text = await requestAdvice({
        apiKey,
        result,
        pars,
        holes,
        meta: { courseName, player, date, coursePar },
      });
      setAdvice(text);
      setAdviceShared(false);
    } catch (e) {
      setAdviceError(e?.message || String(e));
    } finally {
      setAdviceLoading(false);
    }
  };

  const aiCard = (
    <div className="ai-card">
      <Card title="AIコーチのアドバイス" sub="この分析データをもとにAIが助言します">
        {advice ? (
          <>
            {adviceShared && <div className="advice-note">共有者が生成したアドバイス</div>}
            <AdviceBody text={advice} />
            {adviceError && <div className="advice-error">{adviceError}</div>}
            {apiKey && (
              <button className="btn ghost advice-regen" onClick={generateAdvice} disabled={adviceLoading}>
                {adviceLoading ? "生成中…" : "もう一度生成する"}
              </button>
            )}
          </>
        ) : adviceLoading ? (
          <div className="advice-loading">AIが分析中です…（10〜20秒ほどかかります）</div>
        ) : !apiKey || showKeyEdit ? (
          <div className="advice-keysetup">
            <p className="advice-desc">
              Anthropic の API キーを入力すると、上の分析をもとにアドバイスを生成します。
            </p>
            <input
              className="input"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="sk-ant-..."
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
            />
            <div className="advice-actions">
              <button className="btn primary" onClick={saveKey} disabled={!keyDraft.trim()}>
                キーを保存
              </button>
              {apiKey && (
                <button className="btn ghost" onClick={() => setShowKeyEdit(false)}>
                  キャンセル
                </button>
              )}
              {apiKey && (
                <button className="btn ghost danger" onClick={clearKey}>
                  削除
                </button>
              )}
            </div>
            <p className="advice-privacy">
              キーはこの端末（localStorage）にのみ保存され、Anthropic 以外には送信されません。共有リンクにも含まれません。
            </p>
            {adviceError && <div className="advice-error">{adviceError}</div>}
          </div>
        ) : (
          <div className="advice-cta">
            <button className="btn primary" onClick={generateAdvice}>
              この分析でアドバイスをもらう
            </button>
            <button className="btn ghost" onClick={() => setShowKeyEdit(true)}>
              APIキーを変更
            </button>
            {adviceError && <div className="advice-error">{adviceError}</div>}
          </div>
        )}
      </Card>
    </div>
  );

  const actions = (
    <div className="share-actions">
      <button className="btn ghost" onClick={copyShareLink}>
        {copied ? (
          "コピーしました ✓"
        ) : (
          <>
            <LinkIcon />
            リンクをコピー
          </>
        )}
      </button>
      <button className="btn primary" onClick={handleDownload} disabled={saving}>
        {saving ? (
          "生成中…"
        ) : (
          <>
            <DownloadIcon />
            画像で保存
          </>
        )}
      </button>
    </div>
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
        {shared && (
          <div className="share-banner">
            <span className="sb-icon" aria-hidden="true">🔗</span>
            <span>
              共有されたラウンドを表示しています。編集を始めると、あなたの端末のデータとして保存されます。
            </span>
          </div>
        )}

        {tab === "input" && (
          <>
            <Collapsible title="ラウンド設定" defaultOpen={shared}>
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
                <div className="par-editor">
                  {pars.map((p, i) => (
                    <div className="par-row" key={i}>
                      <span className="par-row-label">H{i + 1}</span>
                      <div className="par-seg">
                        {[3, 4, 5].map((v) => (
                          <button
                            type="button"
                            key={v}
                            className={`par-opt${p === v ? " on" : ""}`}
                            aria-pressed={p === v}
                            onClick={() => setPar(i, v)}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Collapsible>

            <div className="quickbar">
              <button className="btn ghost danger" onClick={resetRound}>
                すべてリセット
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
            {actions}
            <Scorecard pars={pars} holes={holes} result={result} />
          </>
        )}

        {tab === "analysis" && (
          <>
            {actions}
            {aiCard}
            <AnalysisReport pars={pars} holes={holes} r={result} />
          </>
        )}

        <p className="privacy2">
          データは端末内（localStorage）のみで処理され、サーバーには送信されません。共有リンクはラウンドのデータをURL自体に埋め込みます。
        </p>
      </main>
    </div>
  );
}
