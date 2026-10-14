const technologies = [
  { name: 'React + Vite', purpose: 'Antarmuka kasir dan pemilik kedai' },
  { name: 'Express', purpose: 'API, validasi, dan aturan transaksi' },
  { name: 'SQLite', purpose: 'Penyimpanan data pada server' },
];

export function StackOverview() {
  return (
    <section className="stack-overview" aria-label="Fondasi aplikasi">
      {technologies.map((technology) => (
        <div className="stack-item" key={technology.name}>
          <h2>{technology.name}</h2>
          <p>{technology.purpose}</p>
        </div>
      ))}
    </section>
  );
}
