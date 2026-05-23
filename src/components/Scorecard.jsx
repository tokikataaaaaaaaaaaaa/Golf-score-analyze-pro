import { Metric } from "./ui.jsx";

function ToPar({ score, par }) {
  if (!score) return <span className="tp tp-none">–</span>;
  const d = score - par;
  if (d < 0) return <span className="tp tp-under">{d}</span>;
  if (d === 0) return <span className="tp tp-even">E</span>;
  if (d === 1) return <span className="tp tp-bogey">+1</span>;
  return <span className="tp tp-double">{`+${d}`}</span>;
}

function Nine({ pars, holes, start, label }) {
  const idx = [...Array(9)].map((_, i) => start + i);
  const sum = (key) => idx.reduce((a, i) => a + (Number(holes[i][key]) || 0), 0);
  const parSum = idx.reduce((a, i) => a + pars[i], 0);
  return (
    <div>
      <div className="sc-label">{label}</div>
      <div className="sc-scroll">
        <table className="sc">
          <tbody>
            <tr>
              <th className="rh">Hole</th>
              {idx.map((i) => (
                <th key={i}>{i + 1}</th>
              ))}
              <td className="tot">{label}</td>
            </tr>
            <tr>
              <td className="rh">Par</td>
              {idx.map((i) => (
                <td key={i}>{pars[i]}</td>
              ))}
              <td className="tot">{parSum}</td>
            </tr>
            <tr>
              <td className="rh">Score</td>
              {idx.map((i) => (
                <td key={i} className="scval">
                  {holes[i].stroke}
                </td>
              ))}
              <td className="tot">{sum("stroke")}</td>
            </tr>
            <tr>
              <td className="rh">Putt</td>
              {idx.map((i) => (
                <td key={i}>{holes[i].putt}</td>
              ))}
              <td className="tot">{sum("putt")}</td>
            </tr>
            <tr>
              <td className="rh">±</td>
              {idx.map((i) => (
                <td key={i}>
                  <ToPar score={Number(holes[i].stroke)} par={pars[i]} />
                </td>
              ))}
              <td className="tot">{sum("stroke") - parSum >= 0 ? `+${sum("stroke") - parSum}` : sum("stroke") - parSum}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Scorecard({ pars, holes, result }) {
  const coursePar = pars.reduce((a, b) => a + b, 0);
  const toPar = result.totalScore - coursePar;
  return (
    <div className="stack">
      <div className="metric-grid">
        <Metric
          big
          label="トータルスコア"
          value={result.totalScore}
          sub={`${toPar === 0 ? "E" : toPar > 0 ? `+${toPar}` : toPar} ／ PAR ${coursePar}`}
        />
        <Metric label="トータルパット" value={result.totalPutt} sub={`${(result.totalPutt / 18).toFixed(1)} / ホール`} />
        <Metric label="OUT / IN" value={`${result.outTotalScore}・${result.inTotalScore}`} sub={`putt ${result.outTotalPutt} / ${result.inTotalPutt}`} />
      </div>

      <div className="card">
        <div className="card-body">
          <div className="sc-wrap">
            <Nine pars={pars} holes={holes} start={0} label="OUT" />
            <Nine pars={pars} holes={holes} start={9} label="IN" />
          </div>
        </div>
      </div>
    </div>
  );
}
