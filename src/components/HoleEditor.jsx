import { Counter, Seg } from "./ui.jsx";
import { CLUBS } from "../lib/courseData.js";

// 元アプリ new_scorecard.dart のホール入力を忠実に再現したエディタ。
// par3 では「ティーショット結果」欄が無く、ティーショットがそのまま
// パーオンショット扱いになる(原仕様)。

const RESULT_TS = [
  { value: "left", label: "左" },
  { value: "fw", label: "フェアウェイ" },
  { value: "right", label: "右" },
];
const RESULT_PARON = [
  { value: "over", label: "オーバー" },
  { value: "left", label: "左" },
  { value: "onGreen", label: "グリーン" },
  { value: "right", label: "右" },
  { value: "short", label: "ショート" },
];
const PUTT_REMAINED = [
  { value: "pin", label: "1pin以内" },
  { value: "short", label: "5m以内" },
  { value: "middle", label: "10m以内" },
  { value: "long", label: "10m以上" },
];
const PUTT_MISSED = [
  { value: "left", label: "左" },
  { value: "nomiss", label: "ワンパット" },
  { value: "right", label: "右" },
];
const PUTT_DISTANCE = [
  { value: "short", label: "ショート" },
  { value: "nomiss", label: "半径1m以内" },
  { value: "long", label: "ロング" },
];

function ClubSelect({ value, onChange }) {
  return (
    <select
      className="mini-select"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">選択なし</option>
      {CLUBS.map((c) => (
        <option key={c.value} value={c.value}>
          {c.label}
        </option>
      ))}
    </select>
  );
}

export default function HoleEditor({ index, par, hole, onChange }) {
  const set = (patch) => onChange({ ...hole, ...patch });
  const isPar3 = par === 3;

  return (
    <div className="editor">
      <div className="edit-block full">
        <h4>
          Hole {index + 1} · Par {par}
        </h4>
        <div className="counter-row">
          <Counter
            label="Score"
            value={hole.stroke}
            min={1}
            onChange={(v) => set({ stroke: v })}
          />
          <Counter
            label="Putt"
            value={hole.putt}
            min={0}
            onChange={(v) => set({ putt: v })}
          />
        </div>
      </div>

      {/* ティーショット / パーオン */}
      <div className="edit-block">
        <h4>ショット詳細</h4>
        {!isPar3 && (
          <>
            <div className="field-row">
              <span className="lbl">T.Shotクラブ</span>
              <ClubSelect
                value={hole.teeShotClub}
                onChange={(v) => set({ teeShotClub: v })}
              />
            </div>
            <div className="field-row">
              <span className="lbl">T.Shot結果</span>
              <Seg
                options={RESULT_TS}
                value={hole.teeShotResult}
                onChange={(v) => set({ teeShotResult: v })}
              />
            </div>
          </>
        )}
        <div className="field-row">
          <span className="lbl">ParOn残距離</span>
          <input
            className="mini-input"
            type="number"
            inputMode="numeric"
            placeholder="ヤード"
            value={hole.parOnShotDistance}
            onChange={(e) => set({ parOnShotDistance: e.target.value })}
          />
          <span className="lbl">ヤード</span>
        </div>
        <div className="field-row">
          <span className="lbl">ParOnクラブ</span>
          <ClubSelect
            value={hole.parOnShotClub}
            onChange={(v) => set({ parOnShotClub: v })}
          />
        </div>
        <div className="field-row" style={{ alignItems: "flex-start" }}>
          <span className="lbl">ParOn結果</span>
          <Seg
            options={RESULT_PARON}
            value={hole.parOnShotResult}
            onChange={(v) => set({ parOnShotResult: v })}
          />
        </div>
      </div>

      {/* パット詳細 */}
      <div className="edit-block">
        <h4>初打パット詳細</h4>
        <div className="field-row" style={{ alignItems: "flex-start" }}>
          <span className="lbl">Putt残距離</span>
          <Seg
            options={PUTT_REMAINED}
            value={hole.puttRemained}
            onChange={(v) => set({ puttRemained: v })}
          />
        </div>
        <div className="field-row" style={{ alignItems: "flex-start" }}>
          <span className="lbl">Putt結果</span>
          <Seg
            options={PUTT_MISSED}
            value={hole.puttMissed}
            onChange={(v) => set({ puttMissed: v })}
            coral
          />
        </div>
        <div className="field-row" style={{ alignItems: "flex-start" }}>
          <span className="lbl">Putt距離感</span>
          <Seg
            options={PUTT_DISTANCE}
            value={hole.puttDistance}
            onChange={(v) => set({ puttDistance: v })}
          />
        </div>
      </div>

      {/* トラブル */}
      <div className="edit-block full">
        <h4>トラブル・その他</h4>
        <div className="counter-row" style={{ alignItems: "center" }}>
          <label className="check">
            <input
              type="checkbox"
              checked={hole.guardBunker}
              onChange={(e) => set({ guardBunker: e.target.checked })}
            />
            グリーンサイドバンカー
          </label>
          <Counter label="OB" value={hole.ob} onChange={(v) => set({ ob: v })} />
          <Counter label="池" value={hole.hazard} onChange={(v) => set({ hazard: v })} />
          <Counter label="罰打" value={hole.penalty} onChange={(v) => set({ penalty: v })} />
        </div>
      </div>
    </div>
  );
}
