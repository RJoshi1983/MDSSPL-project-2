import Link from 'next/link';
import { SERVICES } from '@/modules/registry';
import { svcStyle } from '@/lib/ui';
import { DemoBanner } from '@/components/AppShell';

// The public front page: choose a sign-in portal.
export default function Home() {
  return (
    <>
      <DemoBanner />
      <section className="hero">
        <div className="hero-inner">
          <div className="logo" style={{ marginBottom: 24 }}>MDSSPL</div>
          <h1>MDSSPL Service Hub</h1>
          <p>One hub for every sustainability service, from data entry to verified report.</p>
          <div className="portal-cards">
            <Link className="portal" href="/sign-in/client">
              <h3>Client sign-in</h3>
              <p className="muted">Enter your organisation&apos;s data and download your reports. New clients can register here.</p>
            </Link>
            <Link className="portal" href="/sign-in/staff">
              <h3>Staff &amp; verifier sign-in</h3>
              <p className="muted">MDSSPL consultants and third-party verifiers review and verify projects.</p>
            </Link>
            <Link className="portal" href="/sign-in/admin">
              <h3>Admin sign-in</h3>
              <p className="muted">Manage users, roles and every project.</p>
            </Link>
          </div>
        </div>
      </section>
      <main className="page">
        <h2>Our services</h2>
        <div className="grid">
          {SERVICES.map((s) => (
            <div key={s.id} className="tile" style={svcStyle(s)}>
              <span className="short">{s.short}</span>
              <h3>{s.name}</h3>
              <p>{s.summary}</p>
              <span className="caption">{s.standards.join(' · ')}</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
