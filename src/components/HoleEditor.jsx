import { useState } from "react";
import { Stepper, Segmented, Field, Chevron } from "./ui.jsx";
import { CLUBS } from "../lib/courseData.js";

const RESULT_TS = [
  { value: "left", label: "左" },
  { value: "fw", label: "フェアウェイ" },
  { value: "right", label: "右" },
];
const RESULT_PARON = [
  { value: "over", label: "オーバー" },
  { value: "left", label: "左" },
  { value: "onGreen", label: "オン" },
  { value: "right", label: "右" },
  { value: "short", label: "ショート" },
];
const PUTT_REMAINED = [
  { value: "pin", label: "1pin以内" },
  { value: "short", label: "5m以内" },
  { value: "middle", label: "10m以内" },
  { value: "long", label: "10m超" },
];
const PUTT_MISSED = [
  { value: "left", label: "左" },
  { value: "nomiss", label: "カップイン" },
  { value: "right", label: "右" },
];
const PUTT_DISTANCE = [
  { value: "short", label: "ショート" },
  { value: "nomiss", label: "1m以内" },
  { value: "long", label: "ロング" },
];

function ClubSelect({ value, onChange }) {
  return (
    <select className="select" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
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
  const [detail, setDetail] = useState(false);

  return (
    <div className="card">
      <div className="card-body">
        <div className="he-head">
          <div className="he-title">
            ホール {index + 1}
            <span className="he-par">PAR {par}</span>
          </div>
        </div>

        <div className="steppers">
          <Stepper label="スコア" value={hole.stroke} min={1} onChange={(v) => set({ stroke: v })} />
          <Stepper label="パット" value={hole.putt} min={0} onChange={(v) => set({ putt: v })} />
        </div>

        <button
          type="button"
          className={`detail-toggle${detail ? " open" : ""}`}
          aria-expanded={detail}
          onClick={() => setDetail((d) => !d)}
        >
          {detail ? "詳細を閉じる" : "ショット詳細を入力"}
          <Chevron />
        </button>

        {detail && (
          <div className="he-detail">
            {!isPar3 && (
              <div className="he-group">
                <div className="he-group-title">ティーショット</div>
                <Field label="クラブ">
                  <ClubSelect value={hole.teeShotClub} onChange={(v) => set({ teeShotClub: v })} />
                </Field>
                <Field label="方向">
                  <Segmented options={RESULT_TS} value={hole.teeShotResult} onChange={(v) => set({ teeShotResult: v })} />
                </Field>
              </div>
            )}

            <div className="he-group">
              <div className="he-group-title">
                {isPar3 ? "ティーショット（グリーンを狙う）" : "グリーンを狙ったショット"}
              </div>
              <Field label="残り距離 (yd)">
                <input
                  className="input"
                  type="number"
                  inputMode="numeric"
                  placeholder="例: 150"
                  value={hole.parOnShotDistance}
                  onChange={(e) => set({ parOnShotDistance: e.target.value })}
                />
              </Field>
              <Field label="クラブ">
                <ClubSelect value={hole.parOnShotClub} onChange={(v) => set({ parOnShotClub: v })} />
              </Field>
              <Field label="結果">
                <Segmented options={RESULT_PARON} value={hole.parOnShotResult} onChange={(v) => set({ parOnShotResult: v })} />
              </Field>
            </div>

            <div className="he-group">
              <div className="he-group-title">ファーストパット</div>
              <Field label="残り距離">
                <Segmented options={PUTT_REMAINED} value={hole.puttRemained} onChange={(v) => set({ puttRemained: v })} />
              </Field>
              <Field label="方向">
                <Segmented options={PUTT_MISSED} value={hole.puttMissed} onChange={(v) => set({ puttMissed: v })} />
              </Field>
              <Field label="距離感">
                <Segmented options={PUTT_DISTANCE} value={hole.puttDistance} onChange={(v) => set({ puttDistance: v })} />
              </Field>
            </div>

            <div className="he-group">
              <div className="he-group-title">トラブル</div>
              <label className="check2">
                <input
                  type="checkbox"
                  checked={hole.guardBunker}
                  onChange={(e) => set({ guardBunker: e.target.checked })}
                />
                グリーン周りバンカー
              </label>
              <div className="mini-steppers">
                <Stepper label="OB" value={hole.ob} onChange={(v) => set({ ob: v })} />
                <Stepper label="池" value={hole.hazard} onChange={(v) => set({ hazard: v })} />
                <Stepper label="罰打" value={hole.penalty} onChange={(v) => set({ penalty: v })} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
