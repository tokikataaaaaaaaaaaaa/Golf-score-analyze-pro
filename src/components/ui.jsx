// 小さな共有UI部品

export function Counter({ label, value, onChange, min = 0 }) {
  const set = (v) => onChange(Math.max(min, v));
  return (
    <div className="counter">
      <button type="button" onClick={() => set(value - 1)} aria-label={`${label} を減らす`}>
        −
      </button>
      <div>
        <div className="val">{value}</div>
        <div className="cap">{label}</div>
      </div>
      <button type="button" onClick={() => set(value + 1)} aria-label={`${label} を増やす`}>
        +
      </button>
    </div>
  );
}

// トグル可能なセグメント選択。同じ値を再タップで解除(null)。
export function Seg({ options, value, onChange, coral = false }) {
  return (
    <div className={`seg${coral ? " coral" : ""}`}>
      {options.map((o) => (
        <button
          type="button"
          key={String(o.value)}
          className={value === o.value ? "on" : ""}
          onClick={() => onChange(value === o.value ? null : o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function StatRow({ name, sub, ratio, raw }) {
  return (
    <div className="statrow">
      <div className="name">
        {name}
        {sub ? <small>{sub}</small> : null}
      </div>
      <div className="vals">
        {raw != null && <span className="raw">{raw}</span>}
        {ratio != null && <span className="ratio">{ratio}</span>}
      </div>
    </div>
  );
}
