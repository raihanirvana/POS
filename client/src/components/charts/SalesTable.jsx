import { formatDayLabel, formatRupiah } from '../../lib/format.js';

function SalesRow({ day }) {
  const label = formatDayLabel(day.date);
  return (
    <tr>
      <td>
        {label.weekday}, {label.date}
      </td>
      <td className="numeric">{day.transactionCount}</td>
      <td className="numeric">{formatRupiah(day.revenue)}</td>
    </tr>
  );
}

function SalesHead() {
  return (
    <thead>
      <tr>
        <th scope="col">Tanggal</th>
        <th scope="col" className="numeric">
          Transaksi
        </th>
        <th scope="col" className="numeric">
          Pendapatan
        </th>
      </tr>
    </thead>
  );
}

// Tampilan tabel dari data grafik yang sama, agar nilai tidak hanya terbaca lewat hover.
export function SalesTable({ days, open = false }) {
  return (
    <details className="chart-table" open={open}>
      <summary>Lihat data sebagai tabel</summary>
      <div className="table-wrap">
        <table>
          <SalesHead />
          <tbody>
            {days.map((day) => (
              <SalesRow key={day.date} day={day} />
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
