// クラシックなスコアカード表 (1-9 / OUT / 10-18 / IN / TOTAL)。
// To par はゴルフ慣習どおり、アンダーは赤丸・オーバーは四角で表示。

function ToPar({ score, par }) {
  if (!score) return <span>-</span>;
  const d = score - par;
  const txt = d > 0 ? `+${d}` : `${d}`;
  if (d < 0) return <span className="topar-circle">{txt}</span>;
  if (d >= 2) return <span className="topar-square dbl">{txt}</span>;
  if (d === 1) return <span className="topar-square">{txt}</span>;
  return <span>0</span>;
}

function Nine({ pars, holes, start }) {
  const idx = [...Array(9)].map((_, i) => start + i);
  const sum = (key) => idx.reduce((a, i) => a + (Number(holes[i][key]) || 0), 0);
  const label = start === 0 ? "OUT" : "IN";
  return (
    <table className="sc">
      <tbody>
        <tr>
          <th className="row-h">Hole</th>
          {idx.map((i) => (
            <th key={i}>{i + 1}</th>
          ))}
          <td className="tot">{label}</td>
        </tr>
        <tr className="par-row">
          <th className="row-h">Par</th>
          {idx.map((i) => (
            <td key={i}>{pars[i]}</td>
          ))}
          <td className="tot">{idx.reduce((a, i) => a + pars[i], 0)}</td>
        </tr>
        <tr>
          <th className="row-h">Score</th>
          {idx.map((i) => (
            <td key={i}>{holes[i].stroke}</td>
          ))}
          <td className="tot">{sum("stroke")}</td>
        </tr>
        <tr>
          <th className="row-h">Putt</th>
          {idx.map((i) => (
            <td key={i}>{holes[i].putt}</td>
          ))}
          <td className="tot">{sum("putt")}</td>
        </tr>
        <tr>
          <th className="row-h">To par</th>
          {idx.map((i) => (
            <td key={i}>
              <ToPar score={Number(holes[i].stroke)} par={pars[i]} />
            </td>
          ))}
          <td className="tot">—</td>
        </tr>
      </tbody>
    </table>
  );
}

export default function Scorecard({ pars, holes, result }) {
  return (
    <div className="paper">
      <div className="scorecard" style={{ display: "grid", gap: 18 }}>
        <Nine pars={pars} holes={holes} start={0} />
        <Nine pars={pars} holes={holes} start={9} />
      </div>
      <div className="tiles" style={{ marginTop: 18 }}>
        <Totals k="OUT" score={result.outTotalScore} putt={result.outTotalPutt} />
        <Totals k="IN" score={result.inTotalScore} putt={result.inTotalPutt} />
        <Totals
          k="TOTAL SCORE"
          big={result.totalScore}
          sub={`${result.totalScore - pars.reduce((a, b) => a + b, 0) >= 0 ? "+" : ""}${
            result.totalScore - pars.reduce((a, b) => a + b, 0)
          } to par`}
        />
        <Totals k="TOTAL PUTT" big={result.totalPutt} sub="putts" />
      </div>
    </div>
  );
}

function Totals({ k, score, putt, big, sub }) {
  return (
    <div className="tile" style={{ color: "var(--ink)", background: "#fffdf6", border: "1px solid var(--paper-line)" }}>
      <div className="k" style={{ color: "var(--ink-soft)" }}>
        {k}
      </div>
      {big != null ? (
        <div className="v" style={{ color: "var(--ink)" }}>
          {big}
        </div>
      ) : (
        <div className="v" style={{ color: "var(--ink)" }}>
          {score}
          <small style={{ color: "var(--ink-soft)" }}> / {putt}putt</small>
        </div>
      )}
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}
