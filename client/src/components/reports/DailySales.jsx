import { SalesColumnChart } from '../charts/SalesColumnChart.jsx';
import { SalesTable } from '../charts/SalesTable.jsx';

const maxChartDays = 31;

// Hari dengan pendapatan tertinggi disorot dan diberi label (nilai lain lewat tooltip/tabel).
function peakDate(days) {
  const peak = days.reduce(
    (best, day) => (day.revenue > (best?.revenue ?? 0) ? day : best),
    null,
  );
  return peak?.date ?? null;
}

export function DailySales({ days }) {
  return (
    <section className="panel" aria-labelledby="daily-title">
      <h2 id="daily-title">Penjualan per hari</h2>
      <p className="panel-subtitle">
        {days.length <= maxChartDays
          ? 'Pendapatan setelah diskon (WIB); hari tertinggi disorot.'
          : `Periode lebih dari ${maxChartDays} hari ditampilkan sebagai tabel.`}
      </p>
      {days.length <= maxChartDays ? (
        <SalesColumnChart
          days={days}
          highlightDate={peakDate(days)}
          label="Pendapatan per hari"
        />
      ) : (
        <SalesTable days={days} open />
      )}
    </section>
  );
}
