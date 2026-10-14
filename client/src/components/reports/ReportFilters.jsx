const presets = [
  { days: 1, label: 'Hari ini' },
  { days: 7, label: '7 hari' },
  { days: 30, label: '30 hari' },
];

function DateInput({ id, label, value, max, onChange }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="date"
        className="input"
        value={value}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby="report-period-error"
      />
    </div>
  );
}

function PresetButtons({ period }) {
  return (
    <div className="report-presets" role="group" aria-label="Periode cepat">
      {presets.map((preset) => (
        <button
          key={preset.days}
          type="button"
          className="secondary-button compact-button"
          onClick={() => period.applyPreset(preset.days)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

function DateRange({ period, today }) {
  return (
    <>
      <DateInput
        id="report-from"
        label="Dari tanggal (WIB)"
        value={period.draft.from}
        max={today}
        onChange={period.setFrom}
      />
      <DateInput
        id="report-to"
        label="Sampai tanggal (WIB)"
        value={period.draft.to}
        max={today}
        onChange={period.setTo}
      />
    </>
  );
}

// Satu baris filter di atas seluruh isi laporan; semua angka memakai periode yang sama.
export function ReportFilters({ page }) {
  return (
    <div className="report-filters">
      <DateRange period={page.period} today={page.today} />
      <PresetButtons period={page.period} />
      <p id="report-period-error" className="field-error" role="alert">
        {page.period.error}
      </p>
    </div>
  );
}
