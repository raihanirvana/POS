import { axisTicks, niceMax } from '../../lib/chart-scale.js';
import { formatCompactRupiah, formatDayLabel, formatRupiah } from '../../lib/format.js';
import { SalesTable } from './SalesTable.jsx';

function describe(day) {
  const label = formatDayLabel(day.date);
  const value = formatRupiah(day.revenue);
  return `${label.weekday}, ${label.date}: ${value}, ${day.transactionCount} transaksi`;
}

function ChartTip({ day, label }) {
  return (
    <span className="chart-tip" aria-hidden="true">
      <strong>{formatRupiah(day.revenue)}</strong>
      {label.date} · {day.transactionCount} transaksi
    </span>
  );
}

// Satu kolom = satu hari. Seluruh slot adalah area hover/fokus; tooltip murni CSS.
function Column({ day, max, highlight, compact }) {
  const label = formatDayLabel(day.date);
  const height = `${(day.revenue / max) * 100}%`;
  return (
    <li
      className={highlight ? 'chart-slot chart-slot--current' : 'chart-slot'}
      tabIndex={0}
      aria-label={describe(day)}
    >
      <span className="chart-track">
        <span className="chart-bar" style={{ height }}>
          {highlight && day.revenue > 0 ? (
            <span className="chart-value">{formatCompactRupiah(day.revenue)}</span>
          ) : null}
        </span>
      </span>
      <span className="chart-day" aria-hidden="true">
        {compact ? label.date.split(' ')[0] : label.weekday}
      </span>
      <ChartTip day={day} label={label} />
    </li>
  );
}

function Gridlines({ max }) {
  return (
    <div className="chart-grid" aria-hidden="true">
      {axisTicks(max).map((tick) => (
        <span key={tick} className="chart-gridline">
          <span>{formatCompactRupiah(tick)}</span>
        </span>
      ))}
    </div>
  );
}

export function SalesColumnChart({ days, highlightDate, label, tableOpen = false }) {
  const max = niceMax(Math.max(...days.map((day) => day.revenue)));
  const compact = days.length > 7;
  return (
    <figure className="column-chart">
      <div className="chart-plot">
        <Gridlines max={max} />
        <ol className="chart-columns" aria-label={label}>
          {days.map((day) => (
            <Column
              key={day.date}
              day={day}
              max={max}
              highlight={day.date === highlightDate}
              compact={compact}
            />
          ))}
        </ol>
      </div>
      <SalesTable days={days} open={tableOpen} />
    </figure>
  );
}
