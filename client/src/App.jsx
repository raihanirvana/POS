import { Brand } from './components/Brand.jsx';
import { HealthStatus } from './components/HealthStatus.jsx';
import { ProjectIntro } from './components/ProjectIntro.jsx';
import { StackOverview } from './components/StackOverview.jsx';

export function App() {
  return (
    <div className="foundation-page">
      <header className="site-header">
        <Brand />
        <span className="demo-badge">Pengembangan demo</span>
      </header>
      <main>
        <ProjectIntro />
        <HealthStatus />
        <StackOverview />
      </main>
      <footer>Fitur kasir fullstack akan dihubungkan pada tiket berikutnya.</footer>
    </div>
  );
}
