import { useState } from "react";

const Chevron = () => (
  <svg className="chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Card({ title, sub, right, children }) {
  return (
    <section className="card">
      {(title || right) && (
        <header className="card-head">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {sub && <p className="card-sub">{sub}</p>}
          </div>
          {right}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
}

export function Stepper({ label, value, onChange, min = 0, max = 99 }) {
  const set = (v) => onChange(Math.max(min, Math.min(max, v)));
  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-ctrl">
        <button type="button" onClick={() => set(value - 1)} aria-label={`${label}を1減らす`}>
          −
        </button>
        <span className="stepper-val">{value}</span>
        <button type="button" onClick={() => set(value + 1)} aria-label={`${label}を1増やす`}>
          +
        </button>
      </div>
    </div>
  );
}

// 同じ値を再タップで解除 (null)。
export function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented" role="group">
      {options.map((o) => (
        <button
          type="button"
          key={String(o.value)}
          className={`seg-btn${value === o.value ? " on" : ""}`}
          aria-pressed={value === o.value}
          onClick={() => onChange(value === o.value ? null : o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field2">
      <span className="field2-label">{label}</span>
      {children}
    </label>
  );
}

export function Metric({ label, value, sub, big = false }) {
  return (
    <div className={`metric${big ? " metric-big" : ""}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

export function Stat({ label, sub, value, hint }) {
  return (
    <div className="stat">
      <div className="stat-name">
        {label}
        {sub ? <small>{sub}</small> : null}
      </div>
      <div className="stat-vals">
        {hint != null && <span className="stat-hint">{hint}</span>}
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
}

export function Collapsible({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`collapsible${open ? " open" : ""}`}>
      <button type="button" className="collapsible-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span>{title}</span>
        <Chevron />
      </button>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  );
}

export { Chevron };
